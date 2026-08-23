import Foundation
import AVFoundation
import UserNotifications
import CoreLocation
import Capacitor

/**
 * NoorAudioPlugin - Native Swift Plugin for iOS Audio & Background Adhan Playback
 * Compliant with Apple App Store Guidelines for Audio & Background Modes.
 */
@objc(NoorAudioPlugin)
public class NoorAudioPlugin: CAPPlugin, AVAudioPlayerDelegate {
    
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
            call.reject("Audio file '\(soundName).\(fileExtension)' not found in app bundle")
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
