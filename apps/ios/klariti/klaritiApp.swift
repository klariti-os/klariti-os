//
//  klaritiApp.swift
//  klariti
//

import SwiftUI

@main
struct klaritiApp: App {
    private let store = AppStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
        }
    }
}
