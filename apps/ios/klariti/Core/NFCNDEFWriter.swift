//
//  NFCNDEFWriter.swift
//  klariti
//

import CoreNFC
import Foundation

final class NFCNDEFWriter: NSObject, NFCTagReaderSessionDelegate {

    var onWriteSucceeded: ((String) -> Void)?
    var onError: ((String) -> Void)?
    var onCancelled: (() -> Void)?

    private var session: NFCTagReaderSession?
    private var sessionActive = false
    private var pendingErrorMessage: String?
    private var shouldIgnoreInvalidation = false
    private var payloadToWrite: String?

    func beginWrite(urlPayload: String, alert: String) {
        guard !sessionActive else { return }
        guard NFCTagReaderSession.readingAvailable else {
            DispatchQueue.main.async {
                self.onError?("NFC is not available on this device.")
            }
            return
        }

        let trimmedPayload = urlPayload.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedPayload.isEmpty else {
            DispatchQueue.main.async {
                self.onError?("There is no payload to write.")
            }
            return
        }

        sessionActive = true
        pendingErrorMessage = nil
        shouldIgnoreInvalidation = false
        payloadToWrite = trimmedPayload

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

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {}

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        sessionActive = false
        self.session = nil
        payloadToWrite = nil

        if shouldIgnoreInvalidation {
            shouldIgnoreInvalidation = false
            pendingErrorMessage = nil
            return
        }

        if let pendingErrorMessage {
            self.pendingErrorMessage = nil
            DispatchQueue.main.async {
                self.onError?(pendingErrorMessage)
            }
            return
        }

        let nsError = error as NSError
        if nsError.code == 200 || nsError.code == 201 {
            DispatchQueue.main.async {
                self.onCancelled?()
            }
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

            self.write(to: tag, session: session)
        }
    }

    private func write(to tag: NFCTag, session: NFCTagReaderSession) {
        guard let payloadToWrite else {
            fail(message: "There is no payload to write.", session: session)
            return
        }

        guard let ndefTag = ndefTag(for: tag) else {
            fail(message: "This tag type is not supported for NDEF writing on iPhone.", session: session)
            return
        }

        ndefTag.queryNDEFStatus { [weak self] status, capacity, error in
            guard let self else { return }

            if let error {
                self.fail(message: error.localizedDescription, session: session)
                return
            }

            switch status {
            case .readWrite:
                break
            case .readOnly:
                self.fail(message: "This tag is read-only and cannot be written.", session: session)
                return
            case .notSupported:
                self.fail(message: "This tag does not support NDEF writing.", session: session)
                return
            @unknown default:
                self.fail(message: "This tag cannot be written on iPhone.", session: session)
                return
            }

            guard let payloadRecord = NFCNDEFPayload.wellKnownTypeURIPayload(string: payloadToWrite) else {
                self.fail(message: "The URL payload is invalid.", session: session)
                return
            }

            let message = NFCNDEFMessage(records: [payloadRecord])
            guard Int(message.length) <= capacity else {
                self.fail(
                    message: "This tag does not have enough NDEF capacity for the Klariti payload.",
                    session: session
                )
                return
            }

            ndefTag.writeNDEF(message) { [weak self] error in
                guard let self else { return }

                if let error {
                    self.fail(message: error.localizedDescription, session: session)
                    return
                }

                self.shouldIgnoreInvalidation = true
                session.alertMessage = "Klariti payload written to tag."
                session.invalidate()

                DispatchQueue.main.async {
                    self.onWriteSucceeded?(payloadToWrite)
                }
            }
        }
    }

    private func ndefTag(for tag: NFCTag) -> NFCNDEFTag? {
        switch tag {
        case .miFare(let miFare):
            return miFare
        case .iso15693(let iso15693):
            return iso15693
        case .iso7816(let iso7816):
            return iso7816
        case .feliCa(let feliCa):
            return feliCa
        @unknown default:
            return nil
        }
    }

    private func fail(message: String, session: NFCTagReaderSession) {
        pendingErrorMessage = message
        session.invalidate(errorMessage: message)
    }
}
