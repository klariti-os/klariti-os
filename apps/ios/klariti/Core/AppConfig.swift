//
//  AppConfig.swift
//  klariti
//

import Foundation

enum AppConfig {
    static let apiBaseURL: URL = {
        guard let rawValue = Bundle.main.object(forInfoDictionaryKey: "KlaritiAPIBaseURL") as? String,
              let url = URL(string: rawValue),
              let scheme = url.scheme,
              !scheme.isEmpty else {
            fatalError("KlaritiAPIBaseURL must be configured in Info.plist.")
        }
        return url
    }()
}
