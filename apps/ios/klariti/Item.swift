//
//  Item.swift
//  klariti
//
//  Created by ignas Kamugisha on 3/4/26.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
