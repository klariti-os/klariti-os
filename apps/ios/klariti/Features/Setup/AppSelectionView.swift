//
//  AppSelectionView.swift
//  klariti
//
//  Setup: choose apps to block.
//

import SwiftUI

struct AppSelectionView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        @Bindable var store = store
        VStack(spacing: 0) {
            Spacer()
            VStack(spacing: 28) {
                Image(systemName: "apps.iphone")
                    .font(.system(size: 56, weight: .light))
                    .foregroundStyle(Color.klForeground)

                VStack(spacing: 8) {
                    Text("Choose apps\nto block")
                        .font(KlFont.largeTitle)
                        .foregroundStyle(Color.klForeground)
                        .multilineTextAlignment(.center)
                    Text("These apps will be unavailable\nduring every focus session.")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                        .multilineTextAlignment(.center)
                }

                if store.selectedAppsCount > 0 {
                    Label("\(store.selectedAppsCount) app\(store.selectedAppsCount == 1 ? "" : "s") selected",
                          systemImage: "checkmark.circle.fill")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSuccess)
                }

                if !store.authorizationGranted {
                    Text("Screen Time access will be requested when you tap below.")
                        .font(KlFont.footnote)
                        .foregroundStyle(Color.klSubtle)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal, 36)
            Spacer()
            VStack(spacing: 10) {
                Button(store.selectedAppsCount > 0 ? "Edit selection" : "Choose Apps",
                       action: store.requestAuthAndShowPicker)
                    .buttonStyle(store.selectedAppsCount > 0 ? KlButtonStyle(secondary: true) : KlButtonStyle())

                if store.selectedAppsCount > 0 {
                    Button("Done — Start using Klariti") { store.setupComplete = true }
                        .buttonStyle(KlButtonStyle())
                }
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 52)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.klBackground.ignoresSafeArea())
        .sheet(isPresented: $store.showingAppPicker) {
            AppPickerSheet()
        }
    }
}
