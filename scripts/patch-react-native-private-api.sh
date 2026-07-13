#!/bin/sh

set -eu

patch_react_native_private_api() {
  FILE="node_modules/react-native/React/Base/RCTKeyCommands.m"

  if [ ! -f "$FILE" ]; then
    return 0
  fi

  if grep -q "App Store private API scan workaround" "$FILE" && ! grep -q "_modifiedInput" "$FILE"; then
    return 0
  fi

  perl -0pi -e 's/@interface UIEvent \(UIPhysicalKeyboardEvent\).*?\n@end/\/* App Store private API scan workaround: remove private UIEvent keyboard selectors. *\/\n/s' "$FILE"
  perl -0pi -e 's/@interface\/\* App Store private API scan workaround: remove private UIEvent keyboard selectors\. \*\/\n\n@property \(nonatomic\) NSString \*_modifiedInput;\n@property \(nonatomic\) NSString \*_unmodifiedInput;\n@property \(nonatomic\) UIKeyModifierFlags _modifierFlags;\n@property \(nonatomic\) BOOL _isKeyDown;\n@property \(nonatomic\) long _keyCode;\n\n@end/\/* App Store private API scan workaround: remove private UIEvent keyboard selectors. *\/\n/s' "$FILE"

  perl -0pi -e 's/- \(void\)handleKeyUIEventSwizzle:\(UIEvent \*\)event\n\{.*?\n\};/- (void)handleKeyUIEventSwizzle:(__unused UIEvent *)event\n{\n  \/\/ App Store private API scan workaround: disable the private keyboard-event path.\n}\n/s' "$FILE"
}

patch_react_native_modal_backhandler() {
  FILE="node_modules/react-native-modal/dist/modal.js"

  if [ ! -f "$FILE" ]; then
    return 0
  fi

  if grep -q "this.backHandler = BackHandler.addEventListener" "$FILE"; then
    return 0
  fi

  perl -0pi -e "s/        this\\.interactionHandle = null;\\n/        this.interactionHandle = null;\\n        this.backHandler = null;\\n/s" "$FILE"
  perl -0pi -e "s/        BackHandler\\.addEventListener\\('hardwareBackPress', this\\.onBackButtonPress\\);/        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPress);/s" "$FILE"
  perl -0pi -e "s/        BackHandler\\.removeEventListener\\('hardwareBackPress', this\\.onBackButtonPress\\);/        if (this.backHandler) {\\n            this.backHandler.remove();\\n            this.backHandler = null;\\n        }/s" "$FILE"
}

patch_react_native_private_api
patch_react_native_modal_backhandler
