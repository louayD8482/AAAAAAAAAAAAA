#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

/**
 * NoorQiblaCompassPlugin Objective-C Bridge Macro for Capacitor & Apple Runtime
 */
CAP_PLUGIN(NoorQiblaCompassPlugin, "NoorQiblaCompassPlugin",
    CAP_PLUGIN_METHOD(startHeadingUpdates, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopHeadingUpdates, CAPPluginReturnPromise);
)
