//
//  ContentView.swift
//  klariti
//
//  Root router — switches between Locked, Setup, and Home.
//

import SwiftUI

struct ContentView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        @Bindable var store = store
        Group {
            if store.isLocked {
                LockedView()
            } else if !store.setupComplete {
                AppSelectionView()
            } else {
                HomeView()
            }
        }
        .animation(.klDefault, value: store.isLocked)
        .animation(.klDefault, value: store.setupComplete)
        .onAppear { store.onLaunch() }
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
            store.refreshAuthStatus()
        }
    }
}

#Preview {
    ContentView()
        .environment(AppStore())
}
