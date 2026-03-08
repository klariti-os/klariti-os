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
    var nfcTagPayload: String  { didSet { UserDefaults.standard.set(nfcTagPayload,    forKey: "nfcTagPayload") } }
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
        nfcScanner.onVerifyPayload = { [weak self] payload in
            guard let self else { return nil }
            guard verifyTag(payload) else { return "This doesn't look like a valid Klariti tag." }
            guard payload == nfcTagPayload else { return "Use the same tag you used to start this session." }
            return nil
        }
        nfcScanner.onTextPayload = { [weak self] _ in
            guard let self else { return }
            isLocked = false
            screenTime.clearShields()
        }
        nfcScanner.beginScan(alert: "Hold iPhone near your Klariti tag to unlock.")
    }

    // MARK: - Focus actions

    func startFocus() {
        nfcScanner.onVerifyPayload = { [weak self] payload in
            guard let self else { return nil }
            return verifyTag(payload) ? nil : "This doesn't look like a valid Klariti tag."
        }
        nfcScanner.onTextPayload = { [weak self] payload in
            guard let self else { return }
            nfcTagPayload = payload
            isLocked = true
            screenTime.applyShields(from: activitySelection)
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
}
