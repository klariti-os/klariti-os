//
//  ScreenTimeManager.swift
//  klariti
//
//  Wraps ManagedSettings shield operations and FamilyActivitySelection persistence.
//

import Foundation
import FamilyControls
import ManagedSettings

final class ScreenTimeManager {

    private let settingsStore = ManagedSettingsStore()

    // MARK: - Shields

    func applyShields(from selection: FamilyActivitySelection) {
        settingsStore.shield.applications = selection.applicationTokens
        settingsStore.shield.applicationCategories = .specific(selection.categoryTokens)
    }

    func clearShields() {
        settingsStore.shield.applications = nil
        settingsStore.shield.applicationCategories = nil
    }

    // MARK: - Persistence

    func saveActivitySelection(_ selection: FamilyActivitySelection) {
        if let data = try? JSONEncoder().encode(selection) {
            UserDefaults.standard.set(data, forKey: "activitySelection")
        }
    }

    func loadActivitySelection() -> FamilyActivitySelection? {
        guard let data = UserDefaults.standard.data(forKey: "activitySelection"),
              let saved = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        else { return nil }
        return saved
    }
}
