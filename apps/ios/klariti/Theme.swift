//
//  Theme.swift
//  klariti
//
//  Klariti design language: minimal, warm, wellness-forward.
//  Warm cream / dark charcoal palette, Poppins typography, calm motion.
//
//  FONT SETUP: Download Poppins-Regular.ttf and Poppins-Bold.ttf from
//  fonts.google.com/specimen/Poppins, drag both files into the Xcode
//  target (check "Add to target: klariti"), then add the two filenames
//  to UIAppFonts in the project's Info.plist. Until then the system
//  font (SF Pro) is used as a fallback — layout is identical.
//

import SwiftUI

// MARK: - Adaptive UIColor primitives

private extension UIColor {
    convenience init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var v: UInt64 = 0
        Scanner(string: h).scanHexInt64(&v)
        self.init(
            red:   CGFloat((v >> 16) & 0xFF) / 255,
            green: CGFloat((v >> 8)  & 0xFF) / 255,
            blue:  CGFloat(v         & 0xFF) / 255,
            alpha: 1
        )
    }

    static func adaptive(light: String, dark: String) -> UIColor {
        UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) }
    }
}

// MARK: - Color tokens

extension Color {
    /// Warm off-white / very dark charcoal
    static let klBackground  = Color(uiColor: .adaptive(light: "#fafaf8", dark: "#111110"))
    /// Near-black / near-white
    static let klForeground  = Color(uiColor: .adaptive(light: "#1a1a1a", dark: "#ededec"))
    /// Slightly darker warm bg — used for secondary button fills
    static let klMuted       = Color(uiColor: .adaptive(light: "#f0efeb", dark: "#1e1e1c"))
    /// Mid-tone text — subtitles, captions, secondary labels
    static let klSubtle      = Color(uiColor: .adaptive(light: "#737066", dark: "#a1a09a"))
    /// Hairline borders
    static let klBorder      = Color(uiColor: .adaptive(light: "#e8e6e1", dark: "#2a2a28"))
    /// Primary button background  (inverts with mode)
    static let klPrimary     = Color(uiColor: .adaptive(light: "#1a1a1a", dark: "#ededec"))
    /// Text on primary buttons
    static let klPrimaryFg   = Color(uiColor: .adaptive(light: "#fafaf8", dark: "#111110"))
    /// Card / sheet background
    static let klCard        = Color(uiColor: .adaptive(light: "#ffffff", dark: "#191918"))
    /// Sage green — success states, confirmations
    static let klSuccess     = Color(uiColor: .adaptive(light: "#4a6741", dark: "#8bb07f"))
    /// Brick red — destructive actions
    static let klDestructive = Color(uiColor: .adaptive(light: "#c23b22", dark: "#e55a3f"))
}

// MARK: - Typography

struct KlFont {
    // Tries Poppins first; SF Pro fallback is automatic if font isn't registered.
    static func regular(_ size: CGFloat) -> Font { .custom("Poppins-Regular", size: size) }
    static func bold(_ size: CGFloat)    -> Font { .custom("Poppins-Bold",    size: size) }

    // Semantic scale
    static let largeTitle = bold(32)
    static let title      = bold(22)
    static let headline   = bold(17)
    static let body       = regular(17)
    static let subhead    = regular(15)
    static let footnote   = regular(13)
    static let caption    = regular(11)
}

// MARK: - Motion

extension Animation {
    /// Default transition — 0.6 s ease-out, calm and unhurried
    static let klDefault  = easeOut(duration: 0.6)
    /// Slightly snappier for quick state flips
    static let klSnappy   = easeOut(duration: 0.45)
}

// MARK: - Reusable button styles

/// Full-width pill button. `secondary: true` uses the muted fill variant.
/// `enabled: false` greys out the primary variant (pass `.disabled()` separately).
struct KlButtonStyle: ButtonStyle {
    var secondary: Bool = false
    var enabled: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        let bg: Color = secondary ? .klMuted  : (enabled ? .klPrimary : .klMuted)
        let fg: Color = secondary ? .klForeground : (enabled ? .klPrimaryFg : .klSubtle)

        configuration.label
            .font(KlFont.headline)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(bg)
            .foregroundStyle(fg)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .opacity(configuration.isPressed ? 0.8 : 1)
            .animation(.klSnappy, value: configuration.isPressed)
    }
}
