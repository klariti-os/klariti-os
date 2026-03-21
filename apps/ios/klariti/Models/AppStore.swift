//
//  AppStore.swift
//  klariti
//
//  Single source of truth for all app state and actions.
//  Injected via .environment(store) at the root.
//

import Foundation
import Observation
import FamilyControls

@Observable final class AppStore {
    private let ktagVerifier = KtagVerifier()
    @ObservationIgnored private let apiClient = KlaritiAPIClient()
    @ObservationIgnored private let keychainStore = KeychainStore()
    @ObservationIgnored private let authTokenKey = "klariti.authToken"

    // MARK: - Persisted state

    var setupComplete: Bool    { didSet { UserDefaults.standard.set(setupComplete,    forKey: "setupComplete") } }
    var nfcTagPayload: String  { didSet { UserDefaults.standard.set(nfcTagPayload,    forKey: "nfcTagPayload") } }
    var nfcTagUID: String      { didSet { UserDefaults.standard.set(nfcTagUID,        forKey: "nfcTagUID") } }
    var isLocked: Bool         { didSet { UserDefaults.standard.set(isLocked,         forKey: "isLocked") } }
    var selectedAppsCount: Int { didSet { UserDefaults.standard.set(selectedAppsCount, forKey: "selectedAppsCount") } }

    // MARK: - Transient state

    var activitySelection   = FamilyActivitySelection()
    var authorizationGranted = false
    var showingAppPicker     = false
    var currentUser: KlaritiUser?
    var authErrorMessage: String?
    var isAuthenticating = false
    var isRefreshingSession = false

    // MARK: - Services

    let nfcScanner  = NFCScanner()
    let screenTime  = ScreenTimeManager()
    private(set) var authToken: String?

    var isSignedIn: Bool {
        authToken != nil && currentUser != nil
    }

    var isAdmin: Bool {
        currentUser?.isAdmin == true
    }

    // MARK: - Init

    init() {
        let ud = UserDefaults.standard
        setupComplete     = ud.bool(forKey: "setupComplete")
        nfcTagPayload     = ud.string(forKey: "nfcTagPayload") ?? ""
        nfcTagUID         = ud.string(forKey: "nfcTagUID") ?? ""
        isLocked          = ud.bool(forKey: "isLocked")
        selectedAppsCount = ud.integer(forKey: "selectedAppsCount")
        authToken = keychainStore.string(for: authTokenKey)
    }

    // MARK: - Lifecycle

    @MainActor
    func onLaunch() {
        if let saved = screenTime.loadActivitySelection() {
            activitySelection = saved
        }
        authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
        Task { @MainActor [weak self] in
            guard let self else { return }
            guard AuthorizationCenter.shared.authorizationStatus != .approved else { return }
            try? await AuthorizationCenter.shared.requestAuthorization(for: .individual)
            authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
        }
        if isLocked { screenTime.applyShields(from: activitySelection) }

        if authToken != nil {
            Task { [weak self] in
                await self?.refreshCurrentUser()
            }
        }
    }

    @MainActor
    func refreshAuthStatus() {
        authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
        if authToken != nil {
            Task { [weak self] in
                await self?.refreshCurrentUser()
            }
        }
    }

    // MARK: - NFC actions

    func scanToUnlock() {
        nfcScanner.onVerifyScan = { [weak self] scan in
            guard let self else { return nil }
            do {
                let verifiedTag = try verifyTag(scan)
                guard verifiedTag.payload == nfcTagPayload else {
                    return "Use the same tag you used to start this session."
                }
                if !nfcTagUID.isEmpty, verifiedTag.normalizedUID != nfcTagUID {
                    return "Use the same physical tag you used to start this session."
                }
            } catch {
                return verificationErrorMessage(from: error)
            }
            return nil
        }
        nfcScanner.onTagScanned = { [weak self] _ in
            guard let self else { return }
            isLocked = false
            screenTime.clearShields()
        }
        nfcScanner.beginScan(alert: "Hold iPhone near your Klariti tag to unlock.")
    }

    // MARK: - Focus actions

    func startFocus() {
        nfcScanner.onVerifyScan = { [weak self] scan in
            guard let self else { return nil }
            do {
                _ = try verifyTag(scan)
                return nil
            } catch {
                return verificationErrorMessage(from: error)
            }
        }
        nfcScanner.onTagScanned = { [weak self] scan in
            guard let self else { return }
            guard let verifiedTag = try? verifyTag(scan) else { return }
            nfcTagPayload = verifiedTag.payload
            nfcTagUID = verifiedTag.normalizedUID
            isLocked = true
            screenTime.applyShields(from: activitySelection)
        }
        nfcScanner.beginScan(alert: "Hold iPhone near your Klariti tag to start a focus session.")
    }

    func verifyTag(_ scan: NFCTagScanResult) throws -> VerifiedKtag {
        try ktagVerifier.verify(scan: scan)
    }

    private func verificationErrorMessage(from error: Error) -> String {
        if let localizedError = error as? LocalizedError, let message = localizedError.errorDescription {
            return message
        }
        return "This doesn't look like a valid Klariti tag."
    }

    @MainActor
    func requestAuthAndShowPicker() {
        Task { @MainActor [weak self] in
            guard let self else { return }
            if !authorizationGranted {
                try? await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
            }
            if authorizationGranted { showingAppPicker = true }
        }
    }

    @MainActor
    func confirmAppSelection() {
        selectedAppsCount = activitySelection.applicationTokens.count
            + activitySelection.categoryTokens.count
        screenTime.saveActivitySelection(activitySelection)
        showingAppPicker = false
        if isLocked { screenTime.applyShields(from: activitySelection) }
    }

    // MARK: - Account actions

    @MainActor
    func signIn(email: String, password: String) async {
        authErrorMessage = nil
        isAuthenticating = true

        defer { isAuthenticating = false }

        let trimmedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)

        do {
            let response = try await apiClient.signIn(email: trimmedEmail, password: password)
            try persistAuthToken(response.token)
            currentUser = try await apiClient.currentUser(token: response.token)
        } catch {
            authErrorMessage = localizedMessage(for: error)
        }
    }

    @MainActor
    func refreshCurrentUser() async {
        guard let authToken, !authToken.isEmpty else {
            currentUser = nil
            return
        }

        isRefreshingSession = true
        defer { isRefreshingSession = false }

        do {
            currentUser = try await apiClient.currentUser(token: authToken)
            authErrorMessage = nil
        } catch KlaritiAPIError.unauthorized {
            signOut()
        } catch {
            authErrorMessage = localizedMessage(for: error)
        }
    }

    @MainActor
    func signOut() {
        currentUser = nil
        authErrorMessage = nil
        authToken = nil
        keychainStore.delete(authTokenKey)
    }

    @MainActor
    func registerScannedTag(scan: NFCTagScanResult, tagType: String?) async throws -> KlaritiKtag {
        guard isAdmin else { throw KlaritiAPIError.unauthorized }
        guard let authToken, !authToken.isEmpty else { throw KlaritiAPIError.missingAuthToken }
        guard let uid = scan.uid?.trimmingCharacters(in: .whitespacesAndNewlines), !uid.isEmpty else {
            throw KlaritiAPIError.missingTagUID
        }

        let cleanedTagType = tagType?.trimmingCharacters(in: .whitespacesAndNewlines)
        return try await apiClient.registerKtag(
            token: authToken,
            uid: uid,
            tagType: cleanedTagType?.isEmpty == true ? nil : cleanedTagType
        )
    }

    private func persistAuthToken(_ token: String) throws {
        try keychainStore.write(token, for: authTokenKey)
        authToken = token
    }

    private func localizedMessage(for error: Error) -> String {
        if let localizedError = error as? LocalizedError, let message = localizedError.errorDescription {
            return message
        }
        return error.localizedDescription
    }
}
