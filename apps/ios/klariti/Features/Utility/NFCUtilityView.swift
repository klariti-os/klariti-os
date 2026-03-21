//
//  NFCUtilityView.swift
//  klariti
//

import SwiftUI
import CoreNFC
import UIKit

struct NFCUtilityView: View {
    @Environment(AppStore.self) private var store

    private enum UtilityTab: String, CaseIterable, Identifiable {
        case register = "Provision"
        case patch = "Patch"
        case inspect = "Inspect"

        var id: Self { self }
    }

    private enum UtilityScanMode {
        case inspect
        case register
        case patch
    }

    private enum RegistrationFeedbackTone {
        case success
        case warning
        case error

        var color: Color {
            switch self {
            case .success:
                return .klSuccess
            case .warning:
                return .orange
            case .error:
                return .red
            }
        }
    }

    private struct RegistrationFeedback {
        let title: String
        let message: String
        let tone: RegistrationFeedbackTone
    }

    @State private var selectedTab: UtilityTab = .register
    @State private var scanner = NFCScanner()
    @State private var writer = NFCNDEFWriter()
    @State private var lastInspection: NFCTagScanResult?
    @State private var lastRegistrationScan: NFCTagScanResult?
    @State private var lastPatchScan: NFCTagScanResult?
    @State private var latestProvisioning: KlaritiKtagProvisionResult?
    @State private var patchingTag: KlaritiKtag?
    @State private var selectedTagType: KlaritiKtagType = .wall
    @State private var patchStatus: KlaritiKtagStatus = .active
    @State private var patchLabel = ""
    @State private var patchTagType: KlaritiKtagType = .wall
    @State private var inspectorErrorMessage: String?
    @State private var copiedPayloadNote: String?
    @State private var registrationFeedback: RegistrationFeedback?
    @State private var patchFeedback: RegistrationFeedback?
    @State private var isProvisioning = false
    @State private var isLoadingPatchTag = false
    @State private var isSavingPatch = false
    @State private var isWritingPayload = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header

                if store.isAdmin {
                    Picker("NFC Utility View", selection: $selectedTab) {
                        ForEach(UtilityTab.allCases) { tab in
                            Text(tab.rawValue).tag(tab)
                        }
                    }
                    .pickerStyle(.segmented)

                    switch selectedTab {
                    case .register:
                        registerTab
                    case .patch:
                        patchTab
                    case .inspect:
                        inspectTab
                    }
                } else {
                    detailCard(title: "Admin Access Required") {
                        Text("Only admin accounts can use the NFC utility.")
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
        .navigationTitle("NFC Utility")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.klBackground, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .onAppear(perform: wireSessions)
        .alert("NFC Error", isPresented: inspectorErrorBinding) {
            Button("OK", role: .cancel) {
                inspectorErrorMessage = nil
            }
        } message: {
            Text(inspectorErrorMessage ?? "")
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("NFC Utility")
                .font(KlFont.title)
                .foregroundStyle(Color.klForeground)

            Text("Provision Klariti tags, patch registered tag details, or inspect the real iPhone-visible NFC data.")
                .font(KlFont.subhead)
                .foregroundStyle(Color.klSubtle)

            if !NFCTagReaderSession.readingAvailable {
                Text("NFC is not available on this device.")
                    .font(KlFont.footnote)
                    .foregroundStyle(Color.red)
            }
        }
    }

    @ViewBuilder
    private var inspectTab: some View {
        Button("Scan NFC Tag", action: beginInspectScan)
            .buttonStyle(KlButtonStyle(enabled: NFCTagReaderSession.readingAvailable))
            .disabled(!NFCTagReaderSession.readingAvailable)

        if let lastInspection {
            scanSummary(lastInspection, title: "Latest Inspection")

            if !lastInspection.metadata.isEmpty {
                detailCard(title: "Tag Details") {
                    fieldRows(lastInspection.metadata)
                }
            }

            if !lastInspection.records.isEmpty {
                detailCard(title: "NDEF Records") {
                    VStack(alignment: .leading, spacing: 16) {
                        ForEach(lastInspection.records) { record in
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
                            .padding(.bottom, record.id == lastInspection.records.count - 1 ? 0 : 16)

                            if record.id != lastInspection.records.count - 1 {
                                Divider()
                            }
                        }
                    }
                }
            }
        } else {
            detailCard(title: "No Inspection Yet") {
                Text("Scan a tag to inspect its UID, exposed identifier source, NDEF status, and any records iOS can read.")
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)
            }
        }
    }

    @ViewBuilder
    private var registerTab: some View {
        registrationCard

        if let registrationFeedback {
            feedbackCard(registrationFeedback)
        }

        if let lastRegistrationScan {
            scanSummary(lastRegistrationScan, title: "Last Registration Scan")
        }

        if let latestProvisioning {
            detailCard(title: "Provisioned Tag") {
                fieldRows(registrationFields(for: latestProvisioning))
            }

            if latestProvisioning.needsBurn || isWritingPayload {
                burnPayloadCard(for: latestProvisioning.tag)
            }
        }
    }

    @ViewBuilder
    private var patchTab: some View {
        patchLookupCard

        if let patchFeedback {
            feedbackCard(patchFeedback)
        }

        if let lastPatchScan {
            scanSummary(lastPatchScan, title: "Patch Scan")
        }

        if let patchingTag {
            detailCard(title: "Loaded Tag") {
                fieldRows(patchFields(for: patchingTag))
            }

            patchEditorCard(for: patchingTag)
        } else {
            detailCard(title: "No Tag Loaded") {
                Text("Scan a registered Klariti tag to load its record, then update the status, label, or tag type.")
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)
            }
        }
    }

    @ViewBuilder
    private var registrationCard: some View {
        detailCard(title: "Provision Tag") {
            VStack(alignment: .leading, spacing: 14) {
                Text("Use one flow to scan the tag, register it if needed, and write the Klariti payload if the tag is blank or has the wrong URL.")
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Tag Type")
                        .font(KlFont.caption)
                        .foregroundStyle(Color.klSubtle)
                        .textCase(.uppercase)

                    Picker("Tag Type", selection: $selectedTagType) {
                        ForEach(KlaritiKtagType.allCases) { type in
                            Text(type.title).tag(type)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Button(isProvisioning || isWritingPayload ? "Provisioning..." : "Provision Tag", action: beginProvisioning)
                    .buttonStyle(KlButtonStyle(enabled: NFCTagReaderSession.readingAvailable && !isProvisioning && !isWritingPayload))
                    .disabled(!NFCTagReaderSession.readingAvailable || isProvisioning || isWritingPayload)

                if isProvisioning {
                    ProgressView("Provisioning tag…")
                        .font(KlFont.footnote)
                        .tint(Color.klForeground)
                }

                if isWritingPayload {
                    ProgressView("Writing Klariti payload…")
                        .font(KlFont.footnote)
                        .tint(Color.klForeground)
                }
            }
        }
    }

    @ViewBuilder
    private var patchLookupCard: some View {
        detailCard(title: "Load Tag For Editing") {
            VStack(alignment: .leading, spacing: 14) {
                Text("Scan an already registered tag to load its current Klariti record before patching it.")
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)

                Button(isLoadingPatchTag ? "Loading..." : "Scan Tag to Edit", action: beginPatchLookup)
                    .buttonStyle(KlButtonStyle(enabled: NFCTagReaderSession.readingAvailable && !isLoadingPatchTag && !isSavingPatch))
                    .disabled(!NFCTagReaderSession.readingAvailable || isLoadingPatchTag || isSavingPatch)

                if isLoadingPatchTag {
                    ProgressView("Scanning and loading the Klariti record…")
                        .font(KlFont.footnote)
                        .tint(Color.klForeground)
                }
            }
        }
    }

    @ViewBuilder
    private func patchEditorCard(for tag: KlaritiKtag) -> some View {
        detailCard(title: "Patch Tag") {
            VStack(alignment: .leading, spacing: 14) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Label")
                        .font(KlFont.caption)
                        .foregroundStyle(Color.klSubtle)
                        .textCase(.uppercase)

                    TextField("Friendly tag name", text: $patchLabel)
                        .textInputAutocapitalization(.words)
                        .autocorrectionDisabled()
                        .font(KlFont.body)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Color.klBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Status")
                        .font(KlFont.caption)
                        .foregroundStyle(Color.klSubtle)
                        .textCase(.uppercase)

                    Picker("Status", selection: $patchStatus) {
                        ForEach(KlaritiKtagStatus.allCases) { status in
                            Text(status.title).tag(status)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Tag Type")
                        .font(KlFont.caption)
                        .foregroundStyle(Color.klSubtle)
                        .textCase(.uppercase)

                    Picker("Tag Type", selection: $patchTagType) {
                        ForEach(KlaritiKtagType.allCases) { type in
                            Text(type.title).tag(type)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Button(isSavingPatch ? "Saving..." : "Save Changes") {
                    beginPatchSave(for: tag)
                }
                .buttonStyle(KlButtonStyle(enabled: !isSavingPatch && !isLoadingPatchTag))
                .disabled(isSavingPatch || isLoadingPatchTag)

                if isSavingPatch {
                    ProgressView("Saving tag changes…")
                        .font(KlFont.footnote)
                        .tint(Color.klForeground)
                }
            }
        }
    }

    @ViewBuilder
    private func burnPayloadCard(for tag: KlaritiKtag) -> some View {
        detailCard(title: "Burn URL Payload") {
            VStack(alignment: .leading, spacing: 14) {
                Text("Write this Klariti URL payload onto the physical NFC tag to finish provisioning.")
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)

                payloadBox(tag.payload)

                Button(isWritingPayload ? "Burning..." : "Burn URL Payload") {
                    beginPayloadBurn(tag.payload)
                }
                .buttonStyle(KlButtonStyle(enabled: NFCTagReaderSession.readingAvailable && !isWritingPayload))
                .disabled(!NFCTagReaderSession.readingAvailable || isWritingPayload)

                Button("Copy Payload") {
                    UIPasteboard.general.string = tag.payload
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

    @ViewBuilder
    private func payloadBox(_ payload: String) -> some View {
        Text(payload)
            .font(.system(size: 14, weight: .regular, design: .monospaced))
            .foregroundStyle(Color.klForeground)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .background(Color.klBackground)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .fixedSize(horizontal: false, vertical: true)
    }

    private var inspectorErrorBinding: Binding<Bool> {
        Binding(
            get: { inspectorErrorMessage != nil },
            set: { newValue in
                if !newValue {
                    inspectorErrorMessage = nil
                }
            }
        )
    }

    private func wireSessions() {
        configureScanner(for: .inspect)

        writer.onWriteSucceeded = { _ in
            isWritingPayload = false
            if let latestProvisioning {
                self.latestProvisioning = latestProvisioning.markingPayloadWritten()
            }
            registrationFeedback = RegistrationFeedback(
                title: "Provisioning complete",
                message: "The Klariti URL payload was written to the tag successfully.",
                tone: .success
            )
        }
        writer.onError = { message in
            isWritingPayload = false
            registrationFeedback = RegistrationFeedback(
                title: "Couldn't finish provisioning",
                message: message,
                tone: .error
            )
        }
        writer.onCancelled = {
            isWritingPayload = false
            registrationFeedback = RegistrationFeedback(
                title: "Payload write cancelled",
                message: "The tag record is available, but the Klariti URL was not written. You can retry the write below.",
                tone: .warning
            )
        }
    }

    private func configureScanner(for mode: UtilityScanMode) {
        scanner.onCancelled = {
            switch mode {
            case .inspect:
                break
            case .register:
                isProvisioning = false
            case .patch:
                isLoadingPatchTag = false
            }
        }
        scanner.onError = { message in
            switch mode {
            case .inspect:
                inspectorErrorMessage = message
            case .register:
                isProvisioning = false
                registrationFeedback = RegistrationFeedback(
                    title: "Provisioning failed",
                    message: message,
                    tone: .error
                )
            case .patch:
                isLoadingPatchTag = false
                patchFeedback = RegistrationFeedback(
                    title: "Couldn't load tag",
                    message: message,
                    tone: .error
                )
            }
        }
        scanner.onTagScanned = { result in
            switch mode {
            case .inspect:
                lastInspection = result
            case .register:
                lastRegistrationScan = result
                Task {
                    await provision(scan: result)
                }
            case .patch:
                lastPatchScan = result
                Task {
                    await loadPatchTag(scan: result)
                }
            }
        }
    }

    private func beginInspectScan() {
        configureScanner(for: .inspect)
        scanner.beginScan(alert: "Hold iPhone near an NFC tag to inspect its details.")
    }

    private func beginProvisioning() {
        copiedPayloadNote = nil
        latestProvisioning = nil
        registrationFeedback = nil
        configureScanner(for: .register)
        scanner.beginScan(alert: "Hold iPhone near the NFC tag you want to provision.")
    }

    private func beginPatchLookup() {
        patchFeedback = nil
        patchingTag = nil
        lastPatchScan = nil
        patchStatus = .active
        patchLabel = ""
        patchTagType = .wall
        isLoadingPatchTag = true
        configureScanner(for: .patch)
        scanner.beginScan(alert: "Hold iPhone near the registered Klariti tag you want to edit.")
    }

    private func beginPatchSave(for tag: KlaritiKtag) {
        patchFeedback = nil
        Task {
            await savePatch(for: tag)
        }
    }

    private func beginPayloadBurn(_ payload: String) {
        copiedPayloadNote = nil
        isWritingPayload = true
        let writer = writer
        let payloadToWrite = payload
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
            writer.beginWrite(
                urlPayload: payloadToWrite,
                alert: "Hold iPhone near the tag to write the Klariti URL payload."
            )
        }
    }

    @MainActor
    private func provision(scan: NFCTagScanResult) async {
        isProvisioning = true
        defer { isProvisioning = false }

        do {
            let provisioning = try await store.provisionScannedTag(scan: scan, tagType: selectedTagType)
            latestProvisioning = provisioning

            if provisioning.isRevoked {
                registrationFeedback = RegistrationFeedback(
                    title: "Tag is revoked",
                    message: "This tag is already registered in Klariti but marked as revoked, so the payload will not be written.",
                    tone: .warning
                )
                return
            }

            if provisioning.needsBurn {
                registrationFeedback = RegistrationFeedback(
                    title: provisioning.source == .created ? "Tag registered" : "Payload needs to be written",
                    message: provisioningMessage(for: provisioning),
                    tone: provisioning.source == .created ? .success : .warning
                )
                beginPayloadBurn(provisioning.tag.payload)
            } else {
                registrationFeedback = RegistrationFeedback(
                    title: provisioning.source == .created ? "Tag registered" : "Tag already provisioned",
                    message: completedProvisioningMessage(for: provisioning),
                    tone: .success
                )
            }
        } catch {
            latestProvisioning = nil
            copiedPayloadNote = nil

            let message: String
            if let localizedError = error as? LocalizedError, let localizedMessage = localizedError.errorDescription {
                message = localizedMessage
            } else {
                message = error.localizedDescription
            }

            if message.localizedCaseInsensitiveContains("already exists") {
                registrationFeedback = RegistrationFeedback(
                    title: "Tag already exists",
                    message: "This NFC tag is already registered in Klariti, but the app could not recover the existing record for provisioning.",
                    tone: .warning
                )
            } else {
                registrationFeedback = RegistrationFeedback(
                    title: "Provisioning failed",
                    message: message,
                    tone: .error
                )
            }
        }
    }

    @MainActor
    private func loadPatchTag(scan: NFCTagScanResult) async {
        defer { isLoadingPatchTag = false }

        do {
            let tag = try await store.ktagForScannedTag(scan)
            patchingTag = tag
            patchStatus = tag.status
            patchLabel = tag.label ?? ""
            patchTagType = tag.tagType ?? .wall
            patchFeedback = RegistrationFeedback(
                title: "Tag loaded",
                message: "Update the status, label, or tag type below, then save the changes.",
                tone: .success
            )
        } catch {
            patchingTag = nil
            patchFeedback = RegistrationFeedback(
                title: "Couldn't load tag",
                message: localizedMessage(for: error),
                tone: .error
            )
        }
    }

    @MainActor
    private func savePatch(for tag: KlaritiKtag) async {
        isSavingPatch = true
        defer { isSavingPatch = false }

        do {
            let updatedTag = try await store.patchKtag(
                tagId: tag.tagId,
                status: patchStatus,
                label: patchLabel,
                tagType: patchTagType
            )

            patchingTag = updatedTag
            patchStatus = updatedTag.status
            patchLabel = updatedTag.label ?? ""
            patchTagType = updatedTag.tagType ?? patchTagType
            patchFeedback = RegistrationFeedback(
                title: "Tag updated",
                message: patchMessage(for: updatedTag),
                tone: .success
            )
        } catch {
            patchFeedback = RegistrationFeedback(
                title: "Couldn't update tag",
                message: localizedMessage(for: error),
                tone: .error
            )
        }
    }

    private func provisioningMessage(for result: KlaritiKtagProvisionResult) -> String {
        switch (result.source, result.payloadState) {
        case (.created, _):
            return "Klariti registered the tag. Hold iPhone near the same tag again so the Klariti URL can be written to it."
        case (.existing, .missingFromTag):
            return "This tag is already registered, but it does not currently contain the Klariti payload. Hold iPhone near the same tag again to write it."
        case (.existing, .mismatchedOnTag):
            return "This tag is already registered, but the current payload does not match Klariti's record. Hold iPhone near the same tag again to update it."
        case (.existing, .matchesExpectedPayload):
            return "This tag is already registered and already contains the expected Klariti payload."
        }
    }

    private func completedProvisioningMessage(for result: KlaritiKtagProvisionResult) -> String {
        switch result.source {
        case .created:
            return "The tag is registered and already contains the expected Klariti payload."
        case .existing:
            return "This tag is already registered and already contains the expected Klariti payload, so no write was needed."
        }
    }

    private func patchMessage(for tag: KlaritiKtag) -> String {
        let label = normalizedDisplayValue(tag.label, fallback: "No label")
        let type = tag.tagType?.title ?? "Unspecified"
        return "Saved \(tag.status.title.lowercased()) status, label \"\(label)\", and \(type.lowercased()) tag type for \(tag.tagId)."
    }

    @ViewBuilder
    private func scanSummary(_ result: NFCTagScanResult, title: String) -> some View {
        detailCard(title: title) {
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

    private func registrationFields(for result: KlaritiKtagProvisionResult) -> [NFCTagMetadataField] {
        let tag = result.tag
        var fields = [
            NFCTagMetadataField(label: "Tag ID", value: tag.tagId),
            NFCTagMetadataField(label: "Record State", value: result.source.title),
            NFCTagMetadataField(label: "Payload State", value: result.payloadState.title),
            NFCTagMetadataField(label: "Status", value: tag.status.title),
            NFCTagMetadataField(label: "Payload", value: tag.payload)
        ]

        if let label = tag.label {
            fields.append(NFCTagMetadataField(label: "Label", value: label))
        }
        if let tagType = tag.tagType {
            fields.append(NFCTagMetadataField(label: "Tag Type", value: tagType.title))
        }
        if let uidHash = tag.uidHash {
            fields.append(NFCTagMetadataField(label: "UID Hash", value: uidHash))
        }
        if let signature = tag.signature {
            fields.append(NFCTagMetadataField(label: "Signature", value: signature))
        }

        return fields
    }

    private func patchFields(for tag: KlaritiKtag) -> [NFCTagMetadataField] {
        var fields = [
            NFCTagMetadataField(label: "Tag ID", value: tag.tagId),
            NFCTagMetadataField(label: "Status", value: tag.status.title),
            NFCTagMetadataField(label: "Owner", value: tag.ownerId ?? "Unassigned"),
            NFCTagMetadataField(label: "Payload", value: tag.payload)
        ]

        if let label = tag.label {
            fields.append(NFCTagMetadataField(label: "Label", value: label))
        }
        if let tagType = tag.tagType {
            fields.append(NFCTagMetadataField(label: "Tag Type", value: tagType.title))
        }
        if let revokedAt = tag.revokedAt {
            fields.append(NFCTagMetadataField(label: "Revoked At", value: revokedAt))
        }

        return fields
    }

    private func localizedMessage(for error: Error) -> String {
        if let localizedError = error as? LocalizedError, let message = localizedError.errorDescription {
            return message
        }
        return error.localizedDescription
    }

    private func normalizedDisplayValue(_ value: String?, fallback: String) -> String {
        guard let value else { return fallback }
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? fallback : trimmed
    }

    @ViewBuilder
    private func feedbackCard(_ feedback: RegistrationFeedback) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(feedback.title)
                .font(KlFont.headline)
                .foregroundStyle(feedback.tone.color)

            Text(feedback.message)
                .font(KlFont.subhead)
                .foregroundStyle(Color.klForeground)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(feedback.tone.color.opacity(0.12))
        .clipShape(RoundedRectangle(cornerRadius: 16))
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
