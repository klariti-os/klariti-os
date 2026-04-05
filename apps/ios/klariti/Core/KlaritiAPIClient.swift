//
//  KlaritiAPIClient.swift
//  klariti
//

import Foundation

struct KlaritiUser: Codable, Equatable {
    let id: String
    let name: String
    let email: String
    let emailVerified: Bool
    let image: String?
    let createdAt: String
    let updatedAt: String
    let role: String?

    var isAdmin: Bool {
        role == "admin"
    }
}

struct KlaritiAuthResponse: Codable, Equatable {
    let token: String
    let user: KlaritiUser
}

enum KlaritiKtagType: String, Codable, CaseIterable, Equatable, Identifiable {
    case wall = "WALL"
    case mobile = "MOBILE"
    case desk = "DESK"

    var id: String { rawValue }

    var title: String {
        rawValue.capitalized
    }
}

enum KlaritiKtagStatus: String, Codable, CaseIterable, Equatable, Identifiable {
    case active = "active"
    case revoked = "revoked"

    var id: String { rawValue }

    var title: String {
        rawValue.capitalized
    }
}

struct KlaritiKtag: Codable, Equatable {
    let tagId: String
    let uidHash: String?
    let payload: String
    let signature: String?
    let sigVersion: Int?
    let status: KlaritiKtagStatus
    let ownerId: String?
    let label: String?
    let tagType: KlaritiKtagType?
    let createdAt: String?
    let revokedAt: String?
}

enum KlaritiAPIError: LocalizedError {
    case missingAuthToken
    case missingTagUID
    case invalidResponse
    case server(String)
    case unauthorized
    case network(String)

    var errorDescription: String? {
        switch self {
        case .missingAuthToken:
            return "You need to sign in first."
        case .missingTagUID:
            return "This tag's UID could not be read on iPhone."
        case .invalidResponse:
            return "The server returned an unexpected response."
        case .server(let message):
            return message
        case .unauthorized:
            return "Your session has expired. Please sign in again."
        case .network(let message):
            return message
        }
    }
}

final class KlaritiAPIClient {
    private struct ErrorResponse: Decodable {
        let error: String
    }

    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(baseURL: URL = AppConfig.apiBaseURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        self.decoder = decoder

        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        self.encoder = encoder
    }

    func signIn(email: String, password: String) async throws -> KlaritiAuthResponse {
        struct Body: Encodable {
            let email: String
            let password: String
        }

        return try await send(
            path: "/api/sign-in",
            method: "POST",
            body: Body(email: email, password: password)
        )
    }

    func currentUser(token: String) async throws -> KlaritiUser {
        try await send(path: "/api/me", method: "GET", token: token)
    }

    func registerKtag(token: String, uid: String, tagType: KlaritiKtagType) async throws -> KlaritiKtag {
        struct Body: Encodable {
            let uid: String
            let tagType: KlaritiKtagType
        }

        return try await send(
            path: "/api/admin/ktags",
            method: "POST",
            token: token,
            body: Body(uid: uid, tagType: tagType)
        )
    }

    func ktagByUID(token: String, uid: String) async throws -> KlaritiKtag {
        let encodedUID = uid.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? uid
        return try await send(
            path: "/api/admin/ktags/uid/\(encodedUID)",
            method: "GET",
            token: token
        )
    }

    func patchKtag(
        token: String,
        tagId: String,
        status: KlaritiKtagStatus,
        label: String?,
        tagType: KlaritiKtagType
    ) async throws -> KlaritiKtag {
        struct Body: Encodable {
            let status: KlaritiKtagStatus
            let label: String?
            let tagType: KlaritiKtagType
        }

        let encodedTagId = tagId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? tagId

        return try await send(
            path: "/api/admin/ktags/\(encodedTagId)",
            method: "PATCH",
            token: token,
            body: Body(status: status, label: label, tagType: tagType)
        )
    }

    private func send<Response: Decodable, Body: Encodable>(
        path: String,
        method: String,
        token: String? = nil,
        body: Body? = nil
    ) async throws -> Response {
        let data = try await request(path: path, method: method, token: token, body: body)

        do {
            return try decoder.decode(Response.self, from: data)
        } catch {
            throw KlaritiAPIError.invalidResponse
        }
    }

    private func send<Response: Decodable>(
        path: String,
        method: String,
        token: String? = nil
    ) async throws -> Response {
        let data = try await request(path: path, method: method, token: token)

        do {
            return try decoder.decode(Response.self, from: data)
        } catch {
            throw KlaritiAPIError.invalidResponse
        }
    }

    private func request<Body: Encodable>(
        path: String,
        method: String,
        token: String? = nil,
        body: Body? = nil
    ) async throws -> Data {
        let url = baseURL.appending(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try encoder.encode(body)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        let responseData: Data
        let response: URLResponse
        do {
            (responseData, response) = try await session.data(for: request)
        } catch {
            throw KlaritiAPIError.network(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw KlaritiAPIError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            if let serverError = try? decoder.decode(ErrorResponse.self, from: responseData) {
                if httpResponse.statusCode == 401, serverError.error == "Unauthorized" {
                    throw KlaritiAPIError.unauthorized
                }
                throw KlaritiAPIError.server(serverError.error)
            }

            if httpResponse.statusCode == 401 {
                throw KlaritiAPIError.unauthorized
            }

            throw KlaritiAPIError.invalidResponse
        }

        return responseData
    }

    private func request(
        path: String,
        method: String,
        token: String? = nil
    ) async throws -> Data {
        let url = baseURL.appending(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let responseData: Data
        let response: URLResponse
        do {
            (responseData, response) = try await session.data(for: request)
        } catch {
            throw KlaritiAPIError.network(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw KlaritiAPIError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            if let serverError = try? decoder.decode(ErrorResponse.self, from: responseData) {
                if httpResponse.statusCode == 401, serverError.error == "Unauthorized" {
                    throw KlaritiAPIError.unauthorized
                }
                throw KlaritiAPIError.server(serverError.error)
            }

            if httpResponse.statusCode == 401 {
                throw KlaritiAPIError.unauthorized
            }

            throw KlaritiAPIError.invalidResponse
        }

        return responseData
    }
}
