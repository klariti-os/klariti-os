//
//  NFCScanner.swift
//  klariti
//
//  Handles NFC read sessions.
//  Callbacks always fire on the main thread.
//

import CoreNFC

final class NFCScanner: NSObject, NFCNDEFReaderSessionDelegate {

    var onTextPayload: ((String) -> Void)?
    var onError: ((String) -> Void)?
    var onCancelled: (() -> Void)?
    /// Called inside the session before invalidation.
    /// Return nil to accept the tag, or a non-nil string to reject it with that message shown in the NFC sheet.
    var onVerifyPayload: ((String) -> String?)?

    private var session: NFCNDEFReaderSession?
    private var sessionActive = false

    // MARK: - Public API

    func beginScan(alert: String) {
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
                self.read(from: tag, session: session)
            }
        }
    }

    func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {}
    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {}

    // MARK: - Read

    private func read(from tag: NFCNDEFTag, session: NFCNDEFReaderSession) {
        tag.readNDEF { [weak self] message, error in
            guard let self else { return }
            if let error {
                session.invalidate(errorMessage: "Couldn't read tag. Hold it still and try again.")
                return
            }
            guard let record = message?.records.first else {
                session.invalidate(errorMessage: "This doesn't look like a valid Klariti tag.")
                return
            }
            let text = decodeText(record)
            if let text, let verify = self.onVerifyPayload, let errorMessage = verify(text) {
                session.invalidate(errorMessage: errorMessage)
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
