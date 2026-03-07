//
//  NFCScanner.swift
//  klariti
//
//  Handles NFC read and write sessions.
//  Callbacks always fire on the main thread.
//

import CoreNFC

final class NFCScanner: NSObject, NFCNDEFReaderSessionDelegate {

    var onTextPayload: ((String) -> Void)?
    var onError: ((String) -> Void)?
    var onCancelled: (() -> Void)?
    /// Called inside the session before invalidation. Return false to reject the tag
    /// with an error shown inside the NFC sheet (not as a separate alert).
    var onVerifyPayload: ((String) -> Bool)?

    private var session: NFCNDEFReaderSession?
    private var writeToken: String?
    private var sessionActive = false

    // MARK: - Public API

    func beginWrite(token: String, alert: String) {
        writeToken = token
        start(alert: alert)
    }

    func beginScan(alert: String) {
        writeToken = nil
        start(alert: alert)
    }

    // MARK: - Private

    private func start(alert: String) {
        guard !sessionActive else { return }
        guard NFCNDEFReaderSession.readingAvailable else {
            DispatchQueue.main.async { self.onError?("NFC is not available on this device.") }
            return
        }
        sessionActive = true
        DispatchQueue.main.async {
            self.session = NFCNDEFReaderSession(delegate: self, queue: nil, invalidateAfterFirstRead: true)
            self.session?.alertMessage = alert
            self.session?.begin()
        }
    }

    // MARK: - NFCNDEFReaderSessionDelegate

    func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        sessionActive = false
        let nsError = error as NSError
        // Treat both 200 and 201 as user-initiated cancellation across iOS versions
        if nsError.code == 200 || nsError.code == 201 {
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

    func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {}
    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {}

    // MARK: - Write

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

    // MARK: - Read

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
            let text = decodeText(record)
            if let text, let verify = self.onVerifyPayload, !verify(text) {
                let isKlaritiTag = text.range(of: "klariti\\.so/tag/", options: .regularExpression) != nil
                let message = isKlaritiTag
                    ? "Use the same tag you used to start this session."
                    : "This doesn't look like a valid Klariti tag."
                session.invalidate(errorMessage: message)
                return
            }
            session.invalidate()
            DispatchQueue.main.async {
                if let text { self.onTextPayload?(text) }
                else { self.onError?("Could not read tag data.") }
            }
        }
    }

    private func decodeText(_ record: NFCNDEFPayload) -> String? {
        guard record.typeNameFormat == .nfcWellKnown,
              let type = String(data: record.type, encoding: .utf8) else {
            return String(data: record.payload, encoding: .utf8)
        }
        if type == "T" {
            // Well-known Text: [status byte][lang bytes][text bytes]
            let p = record.payload
            if let status = p.first {
                let langLen = Int(status & 0x3F)
                if p.count > 1 + langLen {
                    return String(data: p[p.index(p.startIndex, offsetBy: 1 + langLen)...], encoding: .utf8)
                }
            }
        }
        if type == "U" {
            // Well-known URI: CoreNFC parses the prefix byte for us
            return record.wellKnownTypeURIPayload()?.absoluteString
        }
        return String(data: record.payload, encoding: .utf8)
    }
}
