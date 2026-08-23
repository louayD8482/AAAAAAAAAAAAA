import UIKit
import Capacitor
import AVFoundation
import UserNotifications
import CoreLocation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure AVAudioSession for background Quran and Adhan playback
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .default, options: [.duckOthers, .defaultToSpeaker])
            try audioSession.setActive(true)
        } catch {
            print("AVAudioSession configuration error: \(error.localizedDescription)")
        }
        
        // Request Notification Permissions
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    application.registerForRemoteNotifications()
                }
            }
        }
        
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

/**
 * NoorAudioPlugin - Native Swift Plugin for iOS Audio & Background Adhan Playback
 */
@objc(NoorAudioPlugin)
public class NoorAudioPlugin: CAPPlugin, CAPBridgedPlugin, AVAudioPlayerDelegate {
    public let identifier = "NoorAudioPlugin"
    public let jsName = "NoorAudioPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "playAdhan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopAdhan", returnType: CAPPluginReturnPromise)
    ]
    
    private var audioPlayer: AVAudioPlayer?
    
    override public func load() {
        configureAudioSession()
    }
    
    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .default, options: [.duckOthers, .defaultToSpeaker])
            try audioSession.setActive(true)
        } catch {
            print("Failed to configure AVAudioSession: \(error.localizedDescription)")
        }
    }
    
    @objc func playAdhan(_ call: CAPPluginCall) {
        guard let soundName = call.getString("soundName") else {
            call.reject("Sound name is required")
            return
        }
        
        let fileExtension = call.getString("extension") ?? "mp3"
        guard let soundURL = Bundle.main.url(forResource: soundName, withExtension: fileExtension, subdirectory: "public/audio") ??
                             Bundle.main.url(forResource: soundName, withExtension: fileExtension) else {
            call.reject("Audio file '\(soundName).\(fileExtension)' not found")
            return
        }
        
        do {
            configureAudioSession()
            audioPlayer = try AVAudioPlayer(contentsOf: soundURL)
            audioPlayer?.delegate = self
            audioPlayer?.prepareToPlay()
            audioPlayer?.play()
            call.resolve(["status": "playing", "sound": soundName])
        } catch {
            call.reject("Failed to play audio: \(error.localizedDescription)")
        }
    }
    
    @objc func stopAdhan(_ call: CAPPluginCall) {
        if let player = audioPlayer, player.isPlaying {
            player.stop()
            audioPlayer = nil
            call.resolve(["status": "stopped"])
        } else {
            call.resolve(["status": "already_stopped"])
        }
    }
    
    public func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        notifyListeners("adhanFinished", data: ["success": flag])
    }
}

/**
 * NoorQiblaCompassPlugin - Native Swift CoreLocation Heading Provider
 */
@objc(NoorQiblaCompassPlugin)
public class NoorQiblaCompassPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "NoorQiblaCompassPlugin"
    public let jsName = "NoorQiblaCompassPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startHeadingUpdates", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopHeadingUpdates", returnType: CAPPluginReturnPromise)
    ]
    
    private var locationManager: CLLocationManager?
    
    override public func load() {
        super.load()
        DispatchQueue.main.async {
            self.locationManager = CLLocationManager()
            self.locationManager?.delegate = self
            self.locationManager?.headingFilter = 1.0
        }
    }
    
    @objc func startHeadingUpdates(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let manager = self.locationManager else {
                call.reject("Location manager not initialized")
                return
            }
            
            if CLLocationManager.headingAvailable() {
                manager.startUpdatingHeading()
                call.resolve(["status": "started"])
            } else {
                call.reject("Heading sensor not available")
            }
        }
    }
    
    @objc func stopHeadingUpdates(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.locationManager?.stopUpdatingHeading()
            call.resolve(["status": "stopped"])
        }
    }
    
    public func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        let headingData: [String: Any] = [
            "magneticHeading": newHeading.magneticHeading,
            "trueHeading": newHeading.trueHeading,
            "headingAccuracy": newHeading.headingAccuracy,
            "timestamp": newHeading.timestamp.timeIntervalSince1970
        ]
        notifyListeners("headingUpdate", data: headingData)
    }
}

/**
 * NoorHapticsPlugin - Native Swift Apple Taptic Engine Feedback
 */
@objc(NoorHapticsPlugin)
public class NoorHapticsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NoorHapticsPlugin"
    public let jsName = "NoorHapticsPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "triggerHaptic", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func triggerHaptic(_ call: CAPPluginCall) {
        let style = call.getString("style") ?? "medium"
        
        DispatchQueue.main.async {
            switch style {
            case "light":
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            case "medium":
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            case "heavy":
                UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
            case "success":
                UINotificationFeedbackGenerator().notificationOccurred(.success)
            case "warning":
                UINotificationFeedbackGenerator().notificationOccurred(.warning)
            case "error":
                UINotificationFeedbackGenerator().notificationOccurred(.error)
            case "selection":
                UISelectionFeedbackGenerator().selectionChanged()
            default:
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            }
            call.resolve(["success": true, "style": style])
        }
    }
}
