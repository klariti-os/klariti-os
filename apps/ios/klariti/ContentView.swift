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
                SetupCoordinator()
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
        .alert("Something went wrong", isPresented: $store.showNFCErrorAlert, presenting: store.nfcErrorMessage) { _ in
            Button("OK", role: .cancel) {}
        } message: {
            Text($0).font(KlFont.body)
        }
    }
}

#Preview {
    ContentView()
        .environment(AppStore())
}
