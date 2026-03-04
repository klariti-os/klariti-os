//
//  LockedView.swift
//  klariti
//

import SwiftUI

struct LockedView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            VStack(spacing: 16) {
                Image(systemName: "lock.fill")
                    .font(.system(size: 52, weight: .regular))
                    .foregroundStyle(Color.klForeground)

                VStack(spacing: 6) {
                    Text("Focus Mode")
                        .font(KlFont.largeTitle)
                        .foregroundStyle(Color.klForeground)
                    Text("Tap your NFC tag to unlock")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                }

                if store.selectedAppsCount > 0 {
                    Text("\(store.selectedAppsCount) app\(store.selectedAppsCount == 1 ? "" : "s") blocked")
                        .font(KlFont.footnote)
                        .foregroundStyle(Color.klSubtle.opacity(0.7))
                        .padding(.top, 2)
                }
            }
            Spacer()
            Button(action: store.scanToUnlock) {
                Label("Tap to Unlock", systemImage: "wave.3.right")
            }
            .buttonStyle(KlButtonStyle())
            .padding(.horizontal, 32)
            .padding(.bottom, 52)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.klBackground.ignoresSafeArea())
    }
}
