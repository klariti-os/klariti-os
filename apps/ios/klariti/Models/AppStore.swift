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

    // MARK: - Services

    let nfcScanner  = NFCScanner()
    let screenTime  = ScreenTimeManager()

    // MARK: - Init

    init() {
        let ud = UserDefaults.standard
        setupComplete     = ud.bool(forKey: "setupComplete")
        nfcTagPayload     = ud.string(forKey: "nfcTagPayload") ?? ""
        nfcTagUID         = ud.string(forKey: "nfcTagUID") ?? ""
        isLocked          = ud.bool(forKey: "isLocked")
        selectedAppsCount = ud.integer(forKey: "selectedAppsCount")
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
}
