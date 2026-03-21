//
//  NFCScanner.swift
//  klariti
//
//  Handles NFC read sessions and exposes the real tag identifier (UID/IDm)
//  alongside any NDEF records Core NFC can read.
//

import CoreNFC
import Foundation

struct NFCTagMetadataField: Identifiable, Equatable {
    let id: String
    let label: String
    let value: String

    init(label: String, value: String) {
        self.id = label
        self.label = label
        self.value = value
    }
}

struct NFCTagRecordDetails: Identifiable, Equatable {
    let id: Int
    let typeNameFormat: String
    let type: String
    let identifier: String
    let payloadHex: String
    let payloadSizeBytes: Int
    let decodedValue: String?
}

struct NFCTagScanResult: Equatable {
    let scannedAt: Date
    let tagType: String
    let uid: String?
    let uidSource: String?
    let ndefStatus: String
    let capacityBytes: Int?
    let messageLengthBytes: Int?
    let primaryPayload: String?
    let readError: String?
    let metadata: [NFCTagMetadataField]
    let records: [NFCTagRecordDetails]
}

private struct NFCTagContext {
    let tagType: String
    let uid: String?
    let uidSource: String?
    let metadata: [NFCTagMetadataField]
    let ndefTag: NFCNDEFTag
}

final class NFCScanner: NSObject, NFCTagReaderSessionDelegate {

    var onTagScanned: ((NFCTagScanResult) -> Void)?
    var onError: ((String) -> Void)?
    var onCancelled: (() -> Void)?
    /// Called inside the session before invalidation.
    /// Return nil to accept the scan, or a non-nil string to reject it with that message shown in the NFC sheet.
    var onVerifyScan: ((NFCTagScanResult) -> String?)?

    private var session: NFCTagReaderSession?
    private var sessionActive = false
    private var pendingErrorMessage: String?
    private var shouldIgnoreInvalidation = false
    private var pendingSuccessfulScan: NFCTagScanResult?

    // MARK: - Public API

    func beginScan(alert: String) {
        start(alert: alert)
    }

    // MARK: - Private

    private func start(alert: String) {
        guard !sessionActive else { return }
        guard NFCTagReaderSession.readingAvailable else {
            DispatchQueue.main.async { self.onError?("NFC is not available on this device.") }
            return
        }

        sessionActive = true
        pendingErrorMessage = nil
        shouldIgnoreInvalidation = false
        pendingSuccessfulScan = nil
        DispatchQueue.main.async {
            self.session = NFCTagReaderSession(
                pollingOption: [.iso14443, .iso15693, .iso18092],
                delegate: self,
                queue: nil
            )
            self.session?.alertMessage = alert
            self.session?.begin()
        }
    }

    private func read(from tag: NFCTag, session: NFCTagReaderSession) {
        guard let context = context(for: tag) else {
            fail(message: "This tag type is not supported on iPhone.", session: session)
            return
        }

        context.ndefTag.queryNDEFStatus { [weak self] status, capacity, error in
            guard let self else { return }

            if let error {
                let result = self.makeScanResult(
                    from: context,
                    ndefStatus: "Unknown",
                    capacityBytes: nil,
                    messageLengthBytes: nil,
                    primaryPayload: nil,
                    readError: error.localizedDescription,
                    records: []
                )
                self.complete(with: result, session: session)
                return
            }

            guard status != .notSupported else {
                let result = self.makeScanResult(
                    from: context,
                    ndefStatus: self.ndefStatusLabel(for: status),
                    capacityBytes: capacity,
                    messageLengthBytes: nil,
                    primaryPayload: nil,
                    readError: nil,
                    records: []
                )
                self.complete(with: result, session: session)
                return
            }

            context.ndefTag.readNDEF { [weak self] message, error in
                guard let self else { return }

                let records = message?.records.enumerated().map { index, record in
                    self.makeRecordDetails(record, index: index)
                } ?? []
                let primaryPayload = records.compactMap(\.decodedValue).first
                let result = self.makeScanResult(
                    from: context,
                    ndefStatus: self.ndefStatusLabel(for: status),
                    capacityBytes: capacity,
                    messageLengthBytes: message.map { Int($0.length) },
                    primaryPayload: primaryPayload,
                    readError: error?.localizedDescription,
                    records: records
                )
                self.complete(with: result, session: session)
            }
        }
    }

    private func complete(with result: NFCTagScanResult, session: NFCTagReaderSession) {
        if let verify = onVerifyScan, let errorMessage = verify(result) {
            pendingErrorMessage = errorMessage
            session.invalidate(errorMessage: errorMessage)
            return
        }

        pendingSuccessfulScan = result
        shouldIgnoreInvalidation = true
        session.alertMessage = result.readError == nil
            ? "NFC tag captured."
            : "Tag detected. Some NDEF data could not be read."
        session.invalidate()
    }

    private func fail(message: String, session: NFCTagReaderSession) {
        pendingSuccessfulScan = nil
        pendingErrorMessage = message
        session.invalidate(errorMessage: message)
    }

    private func context(for tag: NFCTag) -> NFCTagContext? {
        switch tag {
        case .miFare(let miFare):
            var metadata = [
                NFCTagMetadataField(label: "Technology", value: "MIFARE / ISO 14443"),
                NFCTagMetadataField(label: "Identifier Source", value: "identifier"),
                NFCTagMetadataField(label: "MiFare Family", value: mifareFamilyLabel(for: miFare.mifareFamily))
            ]
            if let historicalBytes = miFare.historicalBytes, !historicalBytes.isEmpty {
                metadata.append(NFCTagMetadataField(label: "Historical Bytes", value: historicalBytes.hexString))
            }
            return NFCTagContext(
                tagType: "MIFARE",
                uid: miFare.identifier.hexString,
                uidSource: "identifier",
                metadata: metadata,
                ndefTag: miFare
            )

        case .iso15693(let iso15693):
            return NFCTagContext(
                tagType: "ISO 15693",
                uid: iso15693.identifier.hexString,
                uidSource: "identifier",
                metadata: [
                    NFCTagMetadataField(label: "Technology", value: "ISO 15693"),
                    NFCTagMetadataField(label: "Identifier Source", value: "identifier"),
                    NFCTagMetadataField(label: "Manufacturer Code", value: "0x" + String(iso15693.icManufacturerCode, radix: 16).uppercased()),
                    NFCTagMetadataField(label: "Serial Number", value: iso15693.icSerialNumber.hexString)
                ],
                ndefTag: iso15693
            )

        case .iso7816(let iso7816):
            var metadata = [
                NFCTagMetadataField(label: "Technology", value: "ISO 7816 / ISO 14443"),
                NFCTagMetadataField(label: "Identifier Source", value: "identifier"),
                NFCTagMetadataField(label: "Selected AID", value: iso7816.initialSelectedAID)
            ]
            if let historicalBytes = iso7816.historicalBytes, !historicalBytes.isEmpty {
                metadata.append(NFCTagMetadataField(label: "Historical Bytes", value: historicalBytes.hexString))
            }
            if let applicationData = iso7816.applicationData, !applicationData.isEmpty {
                metadata.append(NFCTagMetadataField(label: "Application Data", value: applicationData.hexString))
            }
            return NFCTagContext(
                tagType: "ISO 7816",
                uid: iso7816.identifier.hexString,
                uidSource: "identifier",
                metadata: metadata,
                ndefTag: iso7816
            )

        case .feliCa(let feliCa):
            return NFCTagContext(
                tagType: "FeliCa",
                uid: feliCa.currentIDm.hexString,
                uidSource: "currentIDm",
                metadata: [
                    NFCTagMetadataField(label: "Technology", value: "FeliCa / NFC-F"),
                    NFCTagMetadataField(label: "Identifier Source", value: "currentIDm"),
                    NFCTagMetadataField(label: "System Code", value: feliCa.currentSystemCode.hexString)
                ],
                ndefTag: feliCa
            )

        @unknown default:
            return nil
        }
    }

    private func makeScanResult(
        from context: NFCTagContext,
        ndefStatus: String,
        capacityBytes: Int?,
        messageLengthBytes: Int?,
        primaryPayload: String?,
        readError: String?,
        records: [NFCTagRecordDetails]
    ) -> NFCTagScanResult {
        NFCTagScanResult(
            scannedAt: Date(),
            tagType: context.tagType,
            uid: context.uid,
            uidSource: context.uidSource,
            ndefStatus: ndefStatus,
            capacityBytes: capacityBytes,
            messageLengthBytes: messageLengthBytes,
            primaryPayload: primaryPayload,
            readError: readError,
            metadata: context.metadata,
            records: records
        )
    }

    private func makeRecordDetails(_ record: NFCNDEFPayload, index: Int) -> NFCTagRecordDetails {
        NFCTagRecordDetails(
            id: index,
            typeNameFormat: typeNameFormatLabel(for: record.typeNameFormat),
            type: displayString(for: record.type),
            identifier: record.identifier.isEmpty ? "None" : displayString(for: record.identifier),
            payloadHex: record.payload.hexString,
            payloadSizeBytes: record.payload.count,
            decodedValue: decodePayload(record)
        )
    }

    private func decodePayload(_ record: NFCNDEFPayload) -> String? {
        guard record.typeNameFormat == .nfcWellKnown,
              let type = String(data: record.type, encoding: .utf8) else {
            return String(data: record.payload, encoding: .utf8)
        }

        if type == "T" {
            let payload = record.payload
            guard let status = payload.first else { return nil }
            let languageLength = Int(status & 0x3F)
            guard payload.count > 1 + languageLength else { return nil }
            return String(data: payload[payload.index(payload.startIndex, offsetBy: 1 + languageLength)...], encoding: .utf8)
        }

        if type == "U" {
            return record.wellKnownTypeURIPayload()?.absoluteString
        }

        return String(data: record.payload, encoding: .utf8)
    }

    private func displayString(for data: Data) -> String {
        if let string = String(data: data, encoding: .utf8), string.isPrintableASCII {
            return string
        }
        return data.hexString
    }

    private func mifareFamilyLabel(for family: NFCMiFareFamily) -> String {
        switch family {
        case .ultralight:
            return "Ultralight"
        case .plus:
            return "Plus"
        case .desfire:
            return "DESFire"
        default:
            return "Unknown"
        }
    }

    private func typeNameFormatLabel(for format: NFCTypeNameFormat) -> String {
        switch format {
        case .empty:
            return "Empty"
        case .nfcWellKnown:
            return "NFC Well Known"
        case .media:
            return "Media"
        case .absoluteURI:
            return "Absolute URI"
        case .nfcExternal:
            return "NFC External"
        case .unknown:
            return "Unknown"
        case .unchanged:
            return "Unchanged"
        @unknown default:
            return "Unknown"
        }
    }

    private func ndefStatusLabel(for status: NFCNDEFStatus) -> String {
        switch status {
        case .readWrite:
            return "Read / Write"
        case .readOnly:
            return "Read Only"
        case .notSupported:
            return "Not Supported"
        @unknown default:
            return "Unknown"
        }
    }

    // MARK: - NFCTagReaderSessionDelegate

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {}

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        sessionActive = false
        self.session = nil

        if shouldIgnoreInvalidation {
            let capturedScan = pendingSuccessfulScan
            pendingSuccessfulScan = nil
            shouldIgnoreInvalidation = false
            pendingErrorMessage = nil
            if let capturedScan {
                DispatchQueue.main.async {
                    self.onTagScanned?(capturedScan)
                }
            }
            return
        }

        if let pendingErrorMessage {
            self.pendingErrorMessage = nil
            pendingSuccessfulScan = nil
            DispatchQueue.main.async {
                self.onError?(pendingErrorMessage)
            }
            return
        }

        pendingSuccessfulScan = nil
        let nsError = error as NSError
        // Treat both 200 and 201 as user-initiated cancellation across iOS versions.
        if nsError.code == 200 || nsError.code == 201 {
            DispatchQueue.main.async { self.onCancelled?() }
            return
        }

        DispatchQueue.main.async {
            self.onError?(error.localizedDescription)
        }
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        guard !tags.isEmpty else { return }

        guard tags.count == 1, let tag = tags.first else {
            session.alertMessage = "More than one tag detected. Present only one tag."
            DispatchQueue.global().asyncAfter(deadline: .now() + 0.6) {
                session.restartPolling()
            }
            return
        }

        session.connect(to: tag) { [weak self] error in
            guard let self else { return }
            if let error {
                self.fail(message: error.localizedDescription, session: session)
                return
            }
            self.read(from: tag, session: session)
        }
    }
}

private extension Data {
    var hexString: String {
        map { String(format: "%02X", $0) }.joined()
    }
}

private extension String {
    var isPrintableASCII: Bool {
        !isEmpty && unicodeScalars.allSatisfy { scalar in
            scalar.isASCII && !CharacterSet.controlCharacters.contains(scalar)
        }
    }
}
