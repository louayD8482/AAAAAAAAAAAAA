import Foundation
import CoreLocation
import Capacitor

/**
 * NoorQiblaCompassPlugin - Native Swift CoreLocation Heading Provider
 * Delivers hardware-accelerated magnetic compass orientation for the Qibla feature.
 */
@objc(NoorQiblaCompassPlugin)
public class NoorQiblaCompassPlugin: CAPPlugin, CLLocationManagerDelegate {
    
    private var locationManager: CLLocationManager?
    
    override public func load() {
        super.load()
        DispatchQueue.main.async {
            self.locationManager = CLLocationManager()
            self.locationManager?.delegate = self
            self.locationManager?.headingFilter = 1.0 // Update every 1 degree
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
                call.reject("Heading/Compass sensor not available on this device")
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
    
    public func locationManagerShouldDisplayHeadingCalibration(_ manager: CLLocationManager) -> Bool {
        return true
    }
}
