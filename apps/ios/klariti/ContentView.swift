//
//  ContentView.swift
//  klariti
//

import SwiftUI
import FamilyControls
import ManagedSettings
import CoreNFC

// MARK: - NFC Scanner

private class NFCScanner: NSObject, NFCNDEFReaderSessionDelegate {
    var onTextPayload: ((String) -> Void)?
    var onError: ((String) -> Void)?
    var onCancelled: (() -> Void)?
    private var session: NFCNDEFReaderSession?
    private var writeToken: String?

    func beginWrite(token: String, alert: String) {
        writeToken = token
        start(alert: alert)
    }

    func beginScan(alert: String) {
        writeToken = nil
        start(alert: alert)
    }

    private func start(alert: String) {
        guard NFCNDEFReaderSession.readingAvailable else {
            onError?("NFC is not available on this device.")
            return
        }
        session = NFCNDEFReaderSession(delegate: self, queue: nil, invalidateAfterFirstRead: true)
        session?.alertMessage = alert
        session?.begin()
    }

    func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        let nsError = error as NSError
        if nsError.code == 200 {
            DispatchQueue.main.async { self.onCancelled?() }
        } else {
            DispatchQueue.main.async { self.onError?(error.localizedDescription) }
        }
    }

    func readerSession(_ session: NFCNDEFReaderSession, didDetect tags: [NFCNDEFTag]) {
        guard let tag = tags.first else { return }
        session.connect(to: tag) { [weak self] error in
            guard let self else { return }
            if let error {
                session.invalidate(errorMessage: error.localizedDescription)
                DispatchQueue.main.async { self.onError?(error.localizedDescription) }
                return
            }
            tag.queryNDEFStatus { _, _, error in
                if let error {
                    session.invalidate(errorMessage: error.localizedDescription)
                    DispatchQueue.main.async { self.onError?(error.localizedDescription) }
                    return
                }
                if let token = self.writeToken {
                    self.write(token: token, to: tag, session: session)
                } else {
                    self.read(from: tag, session: session)
                }
            }
        }
    }

    private func write(token: String, to tag: NFCNDEFTag, session: NFCNDEFReaderSession) {
        let langBytes = [UInt8]("en".utf8)
        let textBytes = [UInt8](token.utf8)
        var payload = Data()
        payload.append(UInt8(langBytes.count))
        payload.append(contentsOf: langBytes)
        payload.append(contentsOf: textBytes)
        let record = NFCNDEFPayload(
            format: .nfcWellKnown,
            type: "T".data(using: .utf8)!,
            identifier: Data(),
            payload: payload
        )
        tag.writeNDEF(NFCNDEFMessage(records: [record])) { [weak self] error in
            if let error {
                session.invalidate(errorMessage: error.localizedDescription)
                DispatchQueue.main.async { self?.onError?(error.localizedDescription) }
                return
            }
            session.alertMessage = "Focus key registered!"
            session.invalidate()
            DispatchQueue.main.async { self?.onTextPayload?(token) }
        }
    }

    private func read(from tag: NFCNDEFTag, session: NFCNDEFReaderSession) {
        tag.readNDEF { [weak self] message, error in
            guard let self else { return }
            if let error {
                session.invalidate(errorMessage: error.localizedDescription)
                DispatchQueue.main.async { self.onError?(error.localizedDescription) }
                return
            }
            guard let record = message?.records.first else {
                session.invalidate(errorMessage: "No data found on tag.")
                return
            }
            session.invalidate()
            let text = self.decodeText(record)
            DispatchQueue.main.async {
                if let text { self.onTextPayload?(text) }
                else { self.onError?("Could not read tag data.") }
            }
        }
    }

    private func decodeText(_ record: NFCNDEFPayload) -> String? {
        if record.typeNameFormat == .nfcWellKnown,
           let type = String(data: record.type, encoding: .utf8), type == "T" {
            let p = record.payload
            if let status = p.first {
                let langLen = Int(status & 0x3F)
                if p.count > 1 + langLen {
                    return String(data: p[p.index(p.startIndex, offsetBy: 1 + langLen)...], encoding: .utf8)
                }
            }
        }
        return String(data: record.payload, encoding: .utf8)
    }

    func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {}
    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {}
}

// MARK: - Main View

struct ContentView: View {
    @AppStorage("setupComplete") private var setupComplete = false
    @AppStorage("nfcRegistered") private var nfcRegistered = false
    @AppStorage("nfcTagPayload") private var nfcTagPayload = ""
    @AppStorage("isLocked") private var isLocked = false
    @AppStorage("selectedAppsCount") private var selectedAppsCount = 0
    @AppStorage("setupStep") private var setupStep = 0

    @State private var activitySelection = FamilyActivitySelection()
    @State private var authorizationGranted = false
    @State private var showingAppPicker = false
    @State private var nfcErrorMessage: String?
    @State private var showNFCErrorAlert = false

    private let settingsStore = ManagedSettingsStore()
    private let nfcScanner = NFCScanner()

    private var nfcAvailable: Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        return NFCNDEFReaderSession.readingAvailable
        #endif
    }

    var body: some View {
        Group {
            if isLocked {
                lockedScreen
            } else if !setupComplete {
                setupScreen
            } else {
                homeScreen
            }
        }
        .animation(.klDefault, value: isLocked)
        .animation(.klDefault, value: setupComplete)
        .onAppear {
            loadSavedSelection()
            requestAuthorization()
            if isLocked { applyShields() }
        }
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
            authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
        }
        .alert("Something went wrong", isPresented: $showNFCErrorAlert, presenting: nfcErrorMessage) { _ in
            Button("OK", role: .cancel) {}
        } message: {
            Text($0)
                .font(KlFont.body)
        }
        .sheet(isPresented: $showingAppPicker) {
            appPickerSheet
        }
    }

    // MARK: - Locked Screen

    private var lockedScreen: some View {
        VStack(spacing: 0) {
            Spacer()
            VStack(spacing: 16) {
                Image(systemName: "lock.fill")
                    .font(.system(size: 52, weight: .regular))
                    .foregroundStyle(Color.klForeground)

                VStack(spacing: 6) {
                    Text("Focus Mode")
                        .font(KlFont.largeTitle)
                        .foregroundStyle(Color.klForeground)
                    Text("Tap your NFC tag to unlock")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                }

                if selectedAppsCount > 0 {
                    Text("\(selectedAppsCount) app\(selectedAppsCount == 1 ? "" : "s") blocked")
                        .font(KlFont.footnote)
                        .foregroundStyle(Color.klSubtle.opacity(0.7))
                        .padding(.top, 2)
                }
            }
            Spacer()
            Button(action: scanToUnlock) {
                Label("Tap to Unlock", systemImage: "wave.3.right")
            }
            .buttonStyle(KlButtonStyle())
            .padding(.horizontal, 32)
            .padding(.bottom, 52)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.klBackground.ignoresSafeArea())
    }

    // MARK: - Home Screen

    private var homeScreen: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "lock.open")
                        .font(.system(size: 48, weight: .light))
                        .foregroundStyle(Color.klSubtle)

                    Text("Ready to focus")
                        .font(KlFont.largeTitle)
                        .foregroundStyle(Color.klForeground)

                    Text(selectedAppsCount > 0
                         ? "\(selectedAppsCount) app\(selectedAppsCount == 1 ? "" : "s") will be blocked"
                         : "No apps selected yet")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                }
                Spacer()
                VStack(spacing: 12) {
                    Button("Start Focus") {
                        isLocked = true
                        applyShields()
                    }
                    .buttonStyle(KlButtonStyle(enabled: selectedAppsCount > 0))
                    .disabled(selectedAppsCount == 0)

                    Button(selectedAppsCount > 0 ? "Edit blocked apps" : "Choose apps to block") {
                        Task { @MainActor in
                            if !authorizationGranted {
                                try? await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                                authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
                            }
                            if authorizationGranted { showingAppPicker = true }
                        }
                    }
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 52)
            }
            .background(Color.klBackground)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("Klariti")
                        .font(KlFont.headline)
                        .foregroundStyle(Color.klForeground)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Re-register NFC Tag", action: reRegisterNFC)
                        Divider()
                        Button("Reset Setup", role: .destructive, action: resetSetup)
                    } label: {
                        Image(systemName: "ellipsis")
                            .font(.system(size: 15, weight: .regular))
                            .foregroundStyle(Color.klSubtle)
                    }
                }
            }
            .toolbarBackground(Color.klBackground, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
        }
    }

    // MARK: - Setup Screen

    @ViewBuilder
    private var setupScreen: some View {
        if setupStep == 0 {
            nfcSetupStep
        } else {
            appSetupStep
        }
    }

    private var nfcSetupStep: some View {
        VStack(spacing: 0) {
            Spacer()
            VStack(spacing: 28) {
                Image(systemName: "tag")
                    .font(.system(size: 56, weight: .light))
                    .foregroundStyle(Color.klForeground)

                VStack(spacing: 8) {
                    Text("Register your\nfocus key")
                        .font(KlFont.largeTitle)
                        .foregroundStyle(Color.klForeground)
                        .multilineTextAlignment(.center)
                    Text("Scan an NFC tag. You'll need it\nevery time you want to end a session.")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                        .multilineTextAlignment(.center)
                }

                if nfcRegistered {
                    Label("Tag registered", systemImage: "checkmark.circle.fill")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSuccess)
                }

                if !nfcAvailable {
                    Label("NFC not available on this device", systemImage: "exclamationmark.triangle")
                        .font(KlFont.footnote)
                        .foregroundStyle(Color.klSubtle)
                }
            }
            .padding(.horizontal, 36)
            Spacer()
            VStack(spacing: 10) {
                Button(action: registerNFC) {
                    Label(nfcRegistered ? "Re-scan Tag" : "Scan NFC Tag",
                          systemImage: nfcRegistered ? "arrow.clockwise" : "wave.3.right")
                }
                .buttonStyle(nfcRegistered ? KlButtonStyle(secondary: true) : KlButtonStyle())
                .disabled(!nfcAvailable)

                if nfcRegistered {
                    Button("Continue") { setupStep = 1 }
                        .buttonStyle(KlButtonStyle())
                }
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 52)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.klBackground.ignoresSafeArea())
    }

    private var appSetupStep: some View {
        VStack(spacing: 0) {
            Spacer()
            VStack(spacing: 28) {
                Image(systemName: "apps.iphone")
                    .font(.system(size: 56, weight: .light))
                    .foregroundStyle(Color.klForeground)

                VStack(spacing: 8) {
                    Text("Choose apps\nto block")
                        .font(KlFont.largeTitle)
                        .foregroundStyle(Color.klForeground)
                        .multilineTextAlignment(.center)
                    Text("These apps will be unavailable\nduring every focus session.")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                        .multilineTextAlignment(.center)
                }

                if selectedAppsCount > 0 {
                    Label("\(selectedAppsCount) app\(selectedAppsCount == 1 ? "" : "s") selected",
                          systemImage: "checkmark.circle.fill")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSuccess)
                }

                if !authorizationGranted {
                    Text("Screen Time access will be requested when you tap below.")
                        .font(KlFont.footnote)
                        .foregroundStyle(Color.klSubtle)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal, 36)
            Spacer()
            VStack(spacing: 10) {
                Button {
                    Task { @MainActor in
                        if !authorizationGranted {
                            try? await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                            authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
                        }
                        if authorizationGranted { showingAppPicker = true }
                    }
                } label: {
                    Text(selectedAppsCount > 0 ? "Edit selection" : "Choose Apps")
                }
                .buttonStyle(selectedAppsCount > 0 ? KlButtonStyle(secondary: true) : KlButtonStyle())

                if selectedAppsCount > 0 {
                    Button("Done — Start using Klariti") { setupComplete = true }
                        .buttonStyle(KlButtonStyle())
                }

                Button("Back") { setupStep = 0 }
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)
                    .padding(.top, 4)
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 52)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.klBackground.ignoresSafeArea())
    }

    // MARK: - App Picker Sheet

    private var appPickerSheet: some View {
        NavigationStack {
            FamilyActivityPicker(selection: $activitySelection)
                .navigationTitle("Choose Apps")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Done") {
                            selectedAppsCount = activitySelection.applicationTokens.count
                                + activitySelection.categoryTokens.count
                            saveActivitySelection()
                            showingAppPicker = false
                            if isLocked { applyShields() }
                        }
                        .font(KlFont.headline)
                        .foregroundStyle(Color.klForeground)
                    }
                }
        }
    }

    // MARK: - Actions

    private func registerNFC() {
        let token = UUID().uuidString
        nfcScanner.onTextPayload = { payload in
            nfcTagPayload = payload
            nfcRegistered = true
        }
        nfcScanner.onError = { error in
            nfcErrorMessage = error
            showNFCErrorAlert = true
        }
        nfcScanner.beginWrite(token: token, alert: "Hold iPhone near the NFC tag to register it as your focus key.")
    }

    private func reRegisterNFC() {
        let token = UUID().uuidString
        nfcScanner.onTextPayload = { payload in
            nfcTagPayload = payload
            nfcRegistered = true
        }
        nfcScanner.onError = { error in
            nfcErrorMessage = error
            showNFCErrorAlert = true
        }
        nfcScanner.beginWrite(token: token, alert: "Hold iPhone near the NFC tag to re-register.")
    }

    private func scanToUnlock() {
        nfcScanner.onTextPayload = { payload in
            if !nfcTagPayload.isEmpty && payload == nfcTagPayload {
                isLocked = false
                clearShields()
            } else {
                nfcErrorMessage = "Wrong NFC tag. Use your registered focus key."
                showNFCErrorAlert = true
            }
        }
        nfcScanner.onError = { error in
            nfcErrorMessage = error
            showNFCErrorAlert = true
        }
        nfcScanner.beginScan(alert: "Hold iPhone near your focus key to unlock.")
    }

    private func applyShields() {
        settingsStore.shield.applications = activitySelection.applicationTokens
        settingsStore.shield.applicationCategories = .specific(activitySelection.categoryTokens)
    }

    private func clearShields() {
        settingsStore.shield.applications = nil
        settingsStore.shield.applicationCategories = nil
    }

    private func resetSetup() {
        setupComplete = false
        nfcRegistered = false
        nfcTagPayload = ""
        isLocked = false
        selectedAppsCount = 0
        setupStep = 0
        activitySelection = FamilyActivitySelection()
        UserDefaults.standard.removeObject(forKey: "activitySelection")
        clearShields()
    }

    private func requestAuthorization() {
        authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
        Task { @MainActor in
            guard AuthorizationCenter.shared.authorizationStatus != .approved else { return }
            try? await AuthorizationCenter.shared.requestAuthorization(for: .individual)
            authorizationGranted = (AuthorizationCenter.shared.authorizationStatus == .approved)
        }
    }

    private func saveActivitySelection() {
        if let data = try? JSONEncoder().encode(activitySelection) {
            UserDefaults.standard.set(data, forKey: "activitySelection")
        }
    }

    private func loadSavedSelection() {
        guard let data = UserDefaults.standard.data(forKey: "activitySelection"),
              let saved = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) else { return }
        activitySelection = saved
    }
}

#Preview {
    ContentView()
}
