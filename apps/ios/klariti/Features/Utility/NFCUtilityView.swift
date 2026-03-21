//
//  NFCUtilityView.swift
//  klariti
//

import SwiftUI
import CoreNFC

struct NFCUtilityView: View {
    @State private var scanner = NFCScanner()
    @State private var lastScan: NFCTagScanResult?
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header

                Button("Scan NFC Tag", action: beginScan)
                    .buttonStyle(KlButtonStyle(enabled: NFCTagReaderSession.readingAvailable))
                    .disabled(!NFCTagReaderSession.readingAvailable)

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
        .onAppear(perform: wireScanner)
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

            Text("Use this to inspect the actual identifier iOS exposes for a tag, including the UID or FeliCa IDm when Core NFC makes it available.")
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

    private func wireScanner() {
        scanner.onTagScanned = { result in
            lastScan = result
        }
        scanner.onError = { message in
            errorMessage = message
        }
    }

    private func beginScan() {
        scanner.beginScan(alert: "Hold iPhone near an NFC tag to inspect its details.")
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
    }
}
