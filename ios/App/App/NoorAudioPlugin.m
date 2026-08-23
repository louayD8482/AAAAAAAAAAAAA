#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

/**
 * NoorAudioPlugin Objective-C Bridge Macro for Capacitor & Apple Runtime
 */
CAP_PLUGIN(NoorAudioPlugin, "NoorAudioPlugin",
    CAP_PLUGIN_METHOD(playAdhan, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopAdhan, CAPPluginReturnPromise);
)
