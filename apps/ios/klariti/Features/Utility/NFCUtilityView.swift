//
//  NFCUtilityView.swift
//  klariti
//

import SwiftUI
import CoreNFC
import UIKit

struct NFCUtilityView: View {
    @Environment(AppStore.self) private var store

    private enum UtilityScanMode {
        case inspect
        case register
    }

    @State private var scanner = NFCScanner()
    @State private var lastScan: NFCTagScanResult?
    @State private var latestRegistration: KlaritiKtag?
    @State private var tagType = ""
    @State private var errorMessage: String?
    @State private var copiedPayloadNote: String?
    @State private var isRegistering = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header

                if store.isAdmin {
                    Button("Inspect NFC Tag", action: beginInspectScan)
                        .buttonStyle(KlButtonStyle(enabled: NFCTagReaderSession.readingAvailable))
                        .disabled(!NFCTagReaderSession.readingAvailable)

                    registrationCard
                } else {
                    detailCard(title: "Admin Access Required") {
                        Text("Only admin accounts can use the NFC registration utility.")
                            .font(KlFont.subhead)
                            .foregroundStyle(Color.klSubtle)
                    }
                }

                if let lastScan {
                    scanSummary(lastScan)

                    if !lastScan.metadata.isEmpty {
                        detailCard(title: "Tag Details") {
                            fieldRows(lastScan.metadata)
                        }
                    }

                    if !lastScan.records.isEmpty {
                        detailCard(title: "NDEF Records") {
                            VStack(alignment: .leading, spacing: 16) {
                                ForEach(lastScan.records) { record in
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Record \(record.id + 1)")
                                            .font(KlFont.headline)
                                            .foregroundStyle(Color.klForeground)

                                        fieldRows([
                                            NFCTagMetadataField(label: "Type Name Format", value: record.typeNameFormat),
                                            NFCTagMetadataField(label: "Type", value: record.type),
                                            NFCTagMetadataField(label: "Identifier", value: record.identifier),
                                            NFCTagMetadataField(label: "Payload Size", value: "\(record.payloadSizeBytes) bytes"),
                                            NFCTagMetadataField(label: "Payload Hex", value: record.payloadHex)
                                        ] + (record.decodedValue.map {
                                            [NFCTagMetadataField(label: "Decoded Value", value: $0)]
                                        } ?? []))
                                    }
                                    .padding(.bottom, record.id == lastScan.records.count - 1 ? 0 : 16)

                                    if record.id != lastScan.records.count - 1 {
                                        Divider()
                                    }
                                }
                            }
                        }
                    }
                } else {
                    detailCard(title: "No Scan Yet") {
                        Text("Scan a tag to inspect its UID, exposed identifier source, NDEF status, and any records iOS can read.")
                            .font(KlFont.subhead)
                            .foregroundStyle(Color.klSubtle)
                    }
                }

                if let latestRegistration, store.isAdmin {
                    detailCard(title: "Latest Registration") {
                        VStack(alignment: .leading, spacing: 16) {
                            fieldRows(registrationFields(for: latestRegistration))

                            Button("Copy Payload") {
                                UIPasteboard.general.string = latestRegistration.payload
                                copiedPayloadNote = "Payload copied to clipboard."
                            }
                            .buttonStyle(KlButtonStyle(secondary: true))

                            if let copiedPayloadNote {
                                Text(copiedPayloadNote)
                                    .font(KlFont.footnote)
                                    .foregroundStyle(Color.klSuccess)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 24)
        }
        .textSelection(.enabled)
        .background(Color.klBackground.ignoresSafeArea())
        .navigationTitle("Utilities")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.klBackground, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .onAppear {
            configureScanner(for: .inspect)
        }
        .alert("NFC Error", isPresented: errorBinding) {
            Button("OK", role: .cancel) {
                errorMessage = nil
            }
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("NFC Utility")
                .font(KlFont.title)
                .foregroundStyle(Color.klForeground)

            Text("Inspect the actual identifier iOS exposes for a tag, then register it against Klariti to receive the payload you should write onto the tag.")
                .font(KlFont.subhead)
                .foregroundStyle(Color.klSubtle)

            if !NFCTagReaderSession.readingAvailable {
                Text("NFC is not available on this device.")
                    .font(KlFont.footnote)
                    .foregroundStyle(Color.red)
            }
        }
    }

    private var errorBinding: Binding<Bool> {
        Binding(
            get: { errorMessage != nil },
            set: { newValue in
                if !newValue {
                    errorMessage = nil
                }
            }
        )
    }

    @ViewBuilder
    private var registrationCard: some View {
        detailCard(title: "Register Tag") {
            VStack(alignment: .leading, spacing: 14) {
                Text("Scan a blank or unregistered tag to send its real UID to the server. Klariti will return the signed payload URL you should write back onto the tag.")
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Tag Type")
                        .font(KlFont.caption)
                        .foregroundStyle(Color.klSubtle)
                        .textCase(.uppercase)

                    TextField("Optional, e.g. MIFARE", text: $tagType)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .font(KlFont.body)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Color.klBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Button(isRegistering ? "Registering..." : "Scan & Register Tag", action: beginRegistrationScan)
                    .buttonStyle(KlButtonStyle(enabled: NFCTagReaderSession.readingAvailable && !isRegistering))
                    .disabled(!NFCTagReaderSession.readingAvailable || isRegistering)

                if isRegistering {
                    ProgressView("Registering tag…")
                        .font(KlFont.footnote)
                        .tint(Color.klForeground)
                }
            }
        }
    }

    private func configureScanner(for mode: UtilityScanMode) {
        scanner.onError = { message in
            isRegistering = false
            errorMessage = message
        }

        scanner.onTagScanned = { result in
            lastScan = result
            if mode == .register {
                Task {
                    await register(scan: result)
                }
            }
        }
    }

    private func beginInspectScan() {
        latestRegistration = nil
        copiedPayloadNote = nil
        configureScanner(for: .inspect)
        scanner.beginScan(alert: "Hold iPhone near an NFC tag to inspect its details.")
    }

    private func beginRegistrationScan() {
        copiedPayloadNote = nil
        latestRegistration = nil
        configureScanner(for: .register)
        scanner.beginScan(alert: "Hold iPhone near the NFC tag you want to register.")
    }

    @MainActor
    private func register(scan: NFCTagScanResult) async {
        isRegistering = true
        defer { isRegistering = false }

        do {
            latestRegistration = try await store.registerScannedTag(scan: scan, tagType: tagType)
        } catch {
            if let localizedError = error as? LocalizedError, let message = localizedError.errorDescription {
                errorMessage = message
            } else {
                errorMessage = error.localizedDescription
            }
        }
    }

    @ViewBuilder
    private func scanSummary(_ result: NFCTagScanResult) -> some View {
        detailCard(title: "Latest Scan") {
            fieldRows(summaryFields(for: result))
        }
    }

    private func summaryFields(for result: NFCTagScanResult) -> [NFCTagMetadataField] {
        var fields = [
            NFCTagMetadataField(label: "Tag Type", value: result.tagType),
            NFCTagMetadataField(label: "UID / Identifier", value: result.uid ?? "Unavailable"),
            NFCTagMetadataField(label: "UID Source", value: result.uidSource ?? "Unavailable"),
            NFCTagMetadataField(label: "NDEF Status", value: result.ndefStatus),
            NFCTagMetadataField(label: "Scanned", value: result.scannedAt.formatted(date: .abbreviated, time: .standard))
        ]

        if let capacityBytes = result.capacityBytes {
            fields.append(NFCTagMetadataField(label: "NDEF Capacity", value: "\(capacityBytes) bytes"))
        }
        if let messageLengthBytes = result.messageLengthBytes {
            fields.append(NFCTagMetadataField(label: "Message Length", value: "\(messageLengthBytes) bytes"))
        }
        if let primaryPayload = result.primaryPayload {
            fields.append(NFCTagMetadataField(label: "Primary Payload", value: primaryPayload))
        }
        if let readError = result.readError {
            fields.append(NFCTagMetadataField(label: "Read Note", value: readError))
        }

        return fields
    }

    private func registrationFields(for tag: KlaritiKtag) -> [NFCTagMetadataField] {
        var fields = [
            NFCTagMetadataField(label: "Tag ID", value: tag.tagId),
            NFCTagMetadataField(label: "Status", value: tag.status.capitalized),
            NFCTagMetadataField(label: "Payload", value: tag.payload)
        ]

        if let label = tag.label {
            fields.append(NFCTagMetadataField(label: "Label", value: label))
        }
        if let tagType = tag.tagType {
            fields.append(NFCTagMetadataField(label: "Tag Type", value: tagType))
        }
        if let uidHash = tag.uidHash {
            fields.append(NFCTagMetadataField(label: "UID Hash", value: uidHash))
        }
        if let signature = tag.signature {
            fields.append(NFCTagMetadataField(label: "Signature", value: signature))
        }

        return fields
    }

    @ViewBuilder
    private func fieldRows(_ fields: [NFCTagMetadataField]) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            ForEach(fields) { field in
                VStack(alignment: .leading, spacing: 4) {
                    Text(field.label)
                        .font(KlFont.caption)
                        .foregroundStyle(Color.klSubtle)
                        .textCase(.uppercase)

                    Text(field.value)
                        .font(.system(size: 14, weight: .regular, design: .monospaced))
                        .foregroundStyle(Color.klForeground)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    @ViewBuilder
    private func detailCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(title)
                .font(KlFont.headline)
                .foregroundStyle(Color.klForeground)

            content()
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.klMuted)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    NavigationStack {
        NFCUtilityView()
            .environment(AppStore())
    }
}
