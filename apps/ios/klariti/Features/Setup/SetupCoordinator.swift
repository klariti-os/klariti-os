//
//  SetupCoordinator.swift
//  klariti
//
//  Routes between setup steps.
//

import SwiftUI

struct SetupCoordinator: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        if store.setupStep == 0 {
            NFCSetupView()
        } else {
            AppSelectionView()
        }
    }
}
