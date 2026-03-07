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

    // MARK: - Persisted state

    var setupComplete: Bool    { didSet { UserDefaults.standard.set(setupComplete,    forKey: "setupComplete") } }
    var nfcRegistered: Bool    { didSet { UserDefaults.standard.set(nfcRegistered,    forKey: "nfcRegistered") } }
    var nfcTagPayload: String  { didSet { UserDefaults.standard.set(nfcTagPayload,    forKey: "nfcTagPayload") } }
    var isLocked: Bool         { didSet { UserDefaults.standard.set(isLocked,         forKey: "isLocked") } }
    var selectedAppsCount: Int { didSet { UserDefaults.standard.set(selectedAppsCount, forKey: "selectedAppsCount") } }
    var setupStep: Int         { didSet { UserDefaults.standard.set(setupStep,         forKey: "setupStep") } }

    // MARK: - Transient state

    var activitySelection   = FamilyActivitySelection()
    var authorizationGranted = false
    var showingAppPicker     = false
    var nfcErrorMessage: String?
    var showNFCErrorAlert    = false

    // MARK: - Services

    let nfcScanner  = NFCScanner()
    let screenTime  = ScreenTimeManager()

    // MARK: - Init

    init() {
        let ud = UserDefaults.standard
        setupComplete     = ud.bool(forKey: "setupComplete")
        nfcRegistered     = ud.bool(forKey: "nfcRegistered")
        nfcTagPayload     = ud.string(forKey: "nfcTagPayload") ?? ""
        isLocked          = ud.bool(forKey: "isLocked")
        selectedAppsCount = ud.integer(forKey: "selectedAppsCount")
        setupStep         = ud.integer(forKey: "setupStep")
    }

    // MARK: - Lifecycle

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
    }

    func refreshAuthStatus() {
        authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
    }

    // MARK: - NFC actions

    /// Starts an NFC write session to register a Klariti focus key.
    /// Generates a token URL, writes it to the tag as a text (well-known) payload,
    /// and updates persisted state on success.
    func registerNFC() {
        // Generate a stable token if we already have one, otherwise create a new one.
        // Use a klariti.so URL so verifyTag() accepts it later during scans.
        let token = nfcTagPayload.isEmpty ? "https://klariti.so/tag/\(UUID().uuidString)" : nfcTagPayload

        nfcScanner.onTextPayload = { [weak self] payload in
            guard let self else { return }
            // Persist what we wrote so later scans can be verified and matched.
            self.nfcTagPayload = payload
            self.nfcRegistered = true
        }
        nfcScanner.onError = { [weak self] error in
            self?.nfcErrorMessage = error
            self?.showNFCErrorAlert = true
        }
        nfcScanner.onCancelled = { /* no-op */ }

        nfcScanner.beginWrite(token: token, alert: "Hold iPhone near the tag to register your focus key.")
    }

    func scanToUnlock() {
        nfcScanner.onVerifyPayload = { [weak self] payload in
            guard let self else { return false }
            guard verifyTag(payload) else { return false }
            return payload == nfcTagPayload
        }
        nfcScanner.onTextPayload = { [weak self] payload in
            guard let self else { return }
            isLocked = false
            screenTime.clearShields()
        }
        nfcScanner.onError = { [weak self] error in
            self?.nfcErrorMessage = error
            self?.showNFCErrorAlert = true
        }
        nfcScanner.beginScan(alert: "Hold iPhone near your Klariti tag to unlock.")
    }

    // MARK: - Focus actions

    func startFocus() {
        nfcScanner.onVerifyPayload = { [weak self] payload in self?.verifyTag(payload) ?? false }
        nfcScanner.onTextPayload = { [weak self] payload in
            guard let self else { return }
            nfcTagPayload = payload  // store the exact tag used to lock
            isLocked = true
            screenTime.applyShields(from: activitySelection)
        }
        nfcScanner.onError = { [weak self] error in
            self?.nfcErrorMessage = error
            self?.showNFCErrorAlert = true
        }
        nfcScanner.beginScan(alert: "Hold iPhone near your Klariti tag to start a focus session.")
    }

    // Checks that payload matches the klariti.so/tag/<id> URL format.
    func verifyTag(_ payload: String) -> Bool {
        let pattern = "^(https?://)?klariti\\.so/tag/[a-zA-Z0-9]+$"
        return payload.range(of: pattern, options: .regularExpression) != nil
    }

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

    func confirmAppSelection() {
        selectedAppsCount = activitySelection.applicationTokens.count
            + activitySelection.categoryTokens.count
        screenTime.saveActivitySelection(activitySelection)
        showingAppPicker = false
        if isLocked { screenTime.applyShields(from: activitySelection) }
    }

    func resetSetup() {
        setupComplete = false
        nfcRegistered = false
        nfcTagPayload = ""
        isLocked = false
        selectedAppsCount = 0
        setupStep = 0
        activitySelection = FamilyActivitySelection()
        UserDefaults.standard.removeObject(forKey: "activitySelection")
        screenTime.clearShields()
    }
}
