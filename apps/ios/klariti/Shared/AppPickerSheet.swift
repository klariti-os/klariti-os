//
//  AppPickerSheet.swift
//  klariti
//
//  FamilyActivityPicker sheet, reused from both Home and AppSelectionView.
//

import SwiftUI
import FamilyControls

struct AppPickerSheet: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        @Bindable var store = store
        NavigationStack {
            FamilyActivityPicker(selection: $store.activitySelection)
                .navigationTitle("Choose Apps")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Done", action: store.confirmAppSelection)
                            .font(KlFont.headline)
                            .foregroundStyle(Color.klForeground)
                    }
                }
        }
    }
}
