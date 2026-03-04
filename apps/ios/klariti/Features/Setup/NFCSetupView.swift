//
//  NFCSetupView.swift
//  klariti
//
//  Setup step 1: scan and register the NFC tag.
//

import SwiftUI
import CoreNFC

struct NFCSetupView: View {
    @Environment(AppStore.self) private var store

    private var nfcAvailable: Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        return NFCNDEFReaderSession.readingAvailable
        #endif
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            VStack(spacing: 28) {
                Image(systemName: "tag")
                    .font(.system(size: 56, weight: .light))
                    .foregroundStyle(Color.klForeground)

                VStack(spacing: 8) {
                    Text("Register your\nfocus key")
                        .font(KlFont.largeTitle)
                        .foregroundStyle(Color.klForeground)
                        .multilineTextAlignment(.center)
                    Text("Scan an NFC tag. You'll need it\nevery time you want to end a session.")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)
                        .multilineTextAlignment(.center)
                }

                if store.nfcRegistered {
                    Label("Tag registered", systemImage: "checkmark.circle.fill")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSuccess)
                }

                if !nfcAvailable {
                    Label("NFC not available on this device", systemImage: "exclamationmark.triangle")
                        .font(KlFont.footnote)
                        .foregroundStyle(Color.klSubtle)
                }
            }
            .padding(.horizontal, 36)
            Spacer()
            VStack(spacing: 10) {
                Button(action: { store.registerNFC() }) {
                    Label(store.nfcRegistered ? "Re-scan Tag" : "Scan NFC Tag",
                          systemImage: store.nfcRegistered ? "arrow.clockwise" : "wave.3.right")
                }
                .buttonStyle(store.nfcRegistered ? KlButtonStyle(secondary: true) : KlButtonStyle())
                .disabled(!nfcAvailable)

                if store.nfcRegistered {
                    Button("Continue") { store.setupStep = 1 }
                        .buttonStyle(KlButtonStyle())
                }
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 52)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.klBackground.ignoresSafeArea())
    }
}
