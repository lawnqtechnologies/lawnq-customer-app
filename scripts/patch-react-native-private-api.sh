#!/bin/sh

set -eu

FILE="node_modules/react-native/React/Base/RCTKeyCommands.m"

if [ ! -f "$FILE" ]; then
  exit 0
fi

if grep -q "App Store private API scan workaround" "$FILE"; then
  exit 0
fi

perl -0pi -e 's/@interface UIEvent \(UIPhysicalKeyboardEvent\).*?\n@end/\/* App Store private API scan workaround: remove private UIEvent keyboard selectors. *\/\n/s' "$FILE"

perl -0pi -e 's/- \(void\)handleKeyUIEventSwizzle:\(UIEvent \*\)event\n\{\n  NSString \*modifiedInput = nil;\n  UIKeyModifierFlags modifierFlags = 0;\n  BOOL isKeyDown = NO;\n\n  if \(\[event respondsToSelector:\@selector\(_modifiedInput\)\]\) \{\n    modifiedInput = \[event _modifiedInput\];\n  \}\n\n  if \(\[event respondsToSelector:\@selector\(_modifierFlags\)\]\) \{\n    modifierFlags = \[event _modifierFlags\];\n  \}\n\n  if \(\[event respondsToSelector:\@selector\(_isKeyDown\)\]\) \{\n    isKeyDown = \[event _isKeyDown\];\n  \}\n\n  BOOL hasFirstResponder = NO;\n  if \(isKeyDown && modifiedInput.length > 0\) \{\n    UIResponder \*firstResponder = nil;\n    for \(UIWindow \*window in \[self allWindows\]\) \{\n      firstResponder = \[window valueForKey:@"firstResponder"\];\n      if \(firstResponder\) \{\n        hasFirstResponder = YES;\n        break;\n      \}\n    \}\n\n    \/\/ Ignore key commands \(except escape\) when there'\''s an active responder\n    if \(!firstResponder\) \{\n      \[self RCT_handleKeyCommand:modifiedInput flags:modifierFlags\];\n    \}\n  \}\n\};/- (void)handleKeyUIEventSwizzle:(__unused UIEvent *)event\n{\n  \/\/ App Store private API scan workaround: disable the private keyboard-event path.\n}\n/s' "$FILE"
