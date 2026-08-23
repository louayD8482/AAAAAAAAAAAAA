import Foundation
import UIKit
import AudioToolbox
import Capacitor

/**
 * NoorHapticsPlugin - Native Swift Core Haptics (UIFeedbackGenerator)
 * Enhances Islamic app interactions (Tasbih, Bookmark, Ayah tap) with native Apple Taptic Engine feedback.
 */
@objc(NoorHapticsPlugin)
public class NoorHapticsPlugin: CAPPlugin {
    
    @objc func triggerHaptic(_ call: CAPPluginCall) {
        let style = call.getString("style") ?? "medium"
        
        DispatchQueue.main.async {
            switch style {
            case "light":
                let generator = UIImpactFeedbackGenerator(style: .light)
                generator.prepare()
                generator.impactOccurred()
            case "medium":
                let generator = UIImpactFeedbackGenerator(style: .medium)
                generator.prepare()
                generator.impactOccurred()
            case "heavy":
                let generator = UIImpactFeedbackGenerator(style: .heavy)
                generator.prepare()
                generator.impactOccurred()
            case "success":
                let generator = UINotificationFeedbackGenerator()
                generator.prepare()
                generator.notificationOccurred(.success)
            case "warning":
                let generator = UINotificationFeedbackGenerator()
                generator.prepare()
                generator.notificationOccurred(.warning)
            case "error":
                let generator = UINotificationFeedbackGenerator()
                generator.prepare()
                generator.notificationOccurred(.error)
            case "selection":
                let generator = UISelectionFeedbackGenerator()
                generator.prepare()
                generator.selectionChanged()
            default:
                let generator = UIImpactFeedbackGenerator(style: .medium)
                generator.prepare()
                generator.impactOccurred()
            }
            call.resolve(["success": true, "style": style])
        }
    }
}
