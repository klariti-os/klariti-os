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

    func registerNFC(alert: String = "Hold iPhone near the NFC tag to register it as your focus key.") {
        let token = UUID().uuidString
        nfcScanner.onTextPayload = { [weak self] payload in
            self?.nfcTagPayload = payload
            self?.nfcRegistered = true
        }
        nfcScanner.onError = { [weak self] error in
            self?.nfcErrorMessage = error
            self?.showNFCErrorAlert = true
        }
        nfcScanner.beginWrite(token: token, alert: alert)
    }

    func scanToUnlock() {
        nfcScanner.onTextPayload = { [weak self] payload in
            guard let self else { return }
            if !nfcTagPayload.isEmpty && payload == nfcTagPayload {
                isLocked = false
                screenTime.clearShields()
            } else {
                nfcErrorMessage = "Wrong NFC tag. Use your registered focus key."
                showNFCErrorAlert = true
            }
        }
        nfcScanner.onError = { [weak self] error in
            self?.nfcErrorMessage = error
            self?.showNFCErrorAlert = true
        }
        nfcScanner.beginScan(alert: "Hold iPhone near your focus key to unlock.")
    }

    // MARK: - Focus actions

    func startFocus() {
        isLocked = true
        screenTime.applyShields(from: activitySelection)
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
