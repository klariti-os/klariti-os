//
//  HomeView.swift
//  klariti
//

import SwiftUI

struct HomeView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        @Bindable var store = store
        NavigationStack {
            VStack(spacing: 0) {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "lock.open")
                        .font(.system(size: 48, weight: .light))
                        .foregroundStyle(Color.klSubtle)

                    Text("Ready to focus")
                        .font(KlFont.largeTitle)
                        .foregroundStyle(Color.klForeground)

                    Text(store.selectedAppsCount > 0
                         ? "\(store.selectedAppsCount) app\(store.selectedAppsCount == 1 ? "" : "s") will be blocked"
                         : "No apps selected yet")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                }
                Spacer()
                VStack(spacing: 12) {
                    Button("Start Focus", action: store.startFocus)
                        .buttonStyle(KlButtonStyle(enabled: store.selectedAppsCount > 0))
                        .disabled(store.selectedAppsCount == 0)

                    Button(store.selectedAppsCount > 0 ? "Edit blocked apps" : "Choose apps to block",
                           action: store.requestAuthAndShowPicker)
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 52)
            }
            .background(Color.klBackground)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("Klariti")
                        .font(KlFont.headline)
                        .foregroundStyle(Color.klForeground)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Re-register NFC Tag") {
                            store.registerNFC(alert: "Hold iPhone near the NFC tag to re-register.")
                        }
                        Divider()
                        Button("Reset Setup", role: .destructive, action: store.resetSetup)
                    } label: {
                        Image(systemName: "ellipsis")
                            .font(.system(size: 15, weight: .regular))
                            .foregroundStyle(Color.klSubtle)
                    }
                }
            }
            .toolbarBackground(Color.klBackground, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
        }
        .sheet(isPresented: $store.showingAppPicker) {
            AppPickerSheet()
        }
    }
}
