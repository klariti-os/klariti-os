//
//  KtagVerifier.swift
//  klariti
//

import CryptoKit
import Foundation

struct VerifiedKtag: Equatable {
    let tagID: String
    let signatureVersion: Int
    let payload: String
    let normalizedUID: String
    let uidHash: String
}

enum KtagVerificationError: LocalizedError {
    case unreadablePayload
    case invalidURL
    case invalidHost
    case invalidPath
    case invalidMessage
    case missingUID
    case invalidUID
    case missingPublicKey
    case invalidPublicKey
    case invalidSignature

    var errorDescription: String? {
        switch self {
        case .unreadablePayload:
            return "This tag does not contain a readable Klariti payload."
        case .invalidURL, .invalidHost, .invalidPath, .invalidMessage:
            return "This doesn't look like a valid Klariti tag."
        case .missingUID:
            return "This tag's UID could not be read on iPhone."
        case .invalidUID:
            return "This tag's UID could not be decoded."
        case .missingPublicKey, .invalidPublicKey:
            return "Klariti tag verification is not configured in this app build."
        case .invalidSignature:
            return "This tag failed Klariti signature verification."
        }
    }
}

struct KtagVerifier {
    private static let expectedHost = "klariti.so"
    private static let ed25519SPKIPrefix = Data([
        0x30, 0x2A, 0x30, 0x05, 0x06, 0x03, 0x2B, 0x65,
        0x70, 0x03, 0x21, 0x00
    ])

    func verify(scan: NFCTagScanResult) throws -> VerifiedKtag {
        guard let payload = scan.primaryPayload?.trimmingCharacters(in: .whitespacesAndNewlines),
              !payload.isEmpty else {
            throw KtagVerificationError.unreadablePayload
        }

        guard let normalizedUID = try normalizeUID(scan.uid) else {
            throw KtagVerificationError.missingUID
        }

        let tagMessage = try parse(payload: payload)
        let uidHash = sha256Hex(of: normalizedUID)
        let signedMessage = Data("v\(tagMessage.signatureVersion)|\(tagMessage.tagID)|\(uidHash)".utf8)

        guard let publicKey = try signingPublicKey() else {
            throw KtagVerificationError.missingPublicKey
        }

        guard publicKey.isValidSignature(tagMessage.signature, for: signedMessage) else {
            throw KtagVerificationError.invalidSignature
        }

        return VerifiedKtag(
            tagID: tagMessage.tagID,
            signatureVersion: tagMessage.signatureVersion,
            payload: payload,
            normalizedUID: normalizedUID,
            uidHash: uidHash
        )
    }

    private func parse(payload: String) throws -> ParsedKtagPayload {
        guard let url = URL(string: payload) else {
            throw KtagVerificationError.invalidURL
        }

        guard url.host?.lowercased() == Self.expectedHost else {
            throw KtagVerificationError.invalidHost
        }

        let pathComponents = url.pathComponents.filter { $0 != "/" }
        guard pathComponents.count == 2, pathComponents[0] == "tag" else {
            throw KtagVerificationError.invalidPath
        }

        let components = pathComponents[1].split(separator: ".", omittingEmptySubsequences: false)
        guard components.count == 3,
              let versionComponent = components.first,
              versionComponent.first == "v",
              let signatureVersion = Int(versionComponent.dropFirst()) else {
            throw KtagVerificationError.invalidMessage
        }

        let tagID = String(components[1])
        let signatureData = Data(base64URLEncoded: String(components[2]))

        guard tagID.hasPrefix("kt_"), !tagID.isEmpty, let signature = signatureData else {
            throw KtagVerificationError.invalidMessage
        }

        return ParsedKtagPayload(
            signatureVersion: signatureVersion,
            tagID: tagID,
            signature: signature
        )
    }

    private func normalizeUID(_ uid: String?) throws -> String? {
        guard let uid else { return nil }

        let trimmed = uid.trimmingCharacters(in: .whitespacesAndNewlines)
        let withoutPrefix = trimmed.replacingOccurrences(of: "^0x", with: "", options: .regularExpression)
        let normalized = withoutPrefix.replacingOccurrences(
            of: #"[\s:-]"#,
            with: "",
            options: .regularExpression
        )

        guard !normalized.isEmpty else { return nil }
        guard normalized.range(of: #"^[0-9A-Fa-f]+$"#, options: .regularExpression) != nil else {
            throw KtagVerificationError.invalidUID
        }

        return normalized.uppercased()
    }

    private func signingPublicKey() throws -> Curve25519.Signing.PublicKey? {
        guard let encodedPEM = Bundle.main.object(forInfoDictionaryKey: "KTagSigningPublicKey") as? String,
              !encodedPEM.isEmpty else {
            return nil
        }

        guard let pemData = Data(base64Encoded: encodedPEM),
              let pemString = String(data: pemData, encoding: .utf8) else {
            throw KtagVerificationError.invalidPublicKey
        }

        let derBody = pemString
            .split(separator: "\n")
            .filter { !$0.hasPrefix("-----") }
            .joined()

        guard let derData = Data(base64Encoded: derBody),
              derData.starts(with: Self.ed25519SPKIPrefix),
              derData.count == Self.ed25519SPKIPrefix.count + 32 else {
            throw KtagVerificationError.invalidPublicKey
        }

        return try Curve25519.Signing.PublicKey(rawRepresentation: derData.suffix(32))
    }

    private func sha256Hex(of value: String) -> String {
        SHA256.hash(data: Data(value.utf8))
            .map { String(format: "%02x", $0) }
            .joined()
    }
}

private struct ParsedKtagPayload {
    let signatureVersion: Int
    let tagID: String
    let signature: Data
}

private extension Data {
    init?(base64URLEncoded value: String) {
        let remapped = value
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        let paddingCount = (4 - remapped.count % 4) % 4
        self.init(base64Encoded: remapped + String(repeating: "=", count: paddingCount))
    }
}
