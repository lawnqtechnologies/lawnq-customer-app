import React, { useCallback, useMemo, useRef } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { isAndroid } from "@freakycoder/react-native-helpers";

/**
 * ? Local imports
 */
import createStyles from "./BottomSheetModal.style";
// NOTE: ChatInput/PHONE were unused; keeping bottom sheet focused avoids extra rerenders.

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
  snapPoint: number;
  setSnapPoint: Function;
  body: any;
  handleClose: any;
  text: string;
  setText: Function;
}

const BottomContentModal: React.FC<IBottomModalScreenProps> = ({
  snapPoint,
  setSnapPoint,
  body,
  handleClose,
  text,
  setText,
}) => {
  const theme = useTheme();
  //   const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * ? References
   */
  const bottomSheetRef = useRef<BottomSheet>(null);

  /**
   * ? Variables
   */
  const snapPoints = useMemo(() => ["90%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      handleClose();
      setSnapPoint(0);
    } else if (index === 0) {
      setSnapPoint(0);
    }
  }, [handleClose, setSnapPoint]);

  // IMPORTANT (Android): do NOT create memoized component types inside render.
  // Doing so remounts the BottomSheet and causes visible blinking.
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={snapPoint}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={styles.contentContainer}
      android_keyboardInputMode="adjustResize"
      // sets scrolling for android
      activeOffsetY={isAndroid ? 50 : 0}
    >
      <View style={styles.content}>{body}</View>
    </BottomSheet>
  );
};

export default BottomContentModal;

