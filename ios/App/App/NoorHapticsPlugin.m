#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

/**
 * NoorHapticsPlugin Objective-C Bridge Macro
 */
CAP_PLUGIN(NoorHapticsPlugin, "NoorHapticsPlugin",
    CAP_PLUGIN_METHOD(triggerHaptic, CAPPluginReturnPromise);
)
