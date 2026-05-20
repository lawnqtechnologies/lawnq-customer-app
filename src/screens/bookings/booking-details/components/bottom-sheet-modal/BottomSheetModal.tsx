import React, { useCallback, useMemo, useRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { isAndroid } from "@freakycoder/react-native-helpers";

/**
 * ? Local imports
 */
import createStyles from "./BottomSheetModal.style";


type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
  snapPoint: number;
  setSnapPoint: Function;
  body: any;
  handleClose: any;
}

const BottomContentModal: React.FC<IBottomModalScreenProps> = ({
  snapPoint,
  setSnapPoint,
  body,
  handleClose,
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

  /**
   * ? Callbacks
   */
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      handleClose();
      return;
    }

    setSnapPoint(index);
  }, [handleClose, setSnapPoint]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={snapPoint}
      animateOnMount={false}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableContentPanningGesture={false}
      backgroundStyle={styles.contentContainer}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      // sets scrolling for android
      activeOffsetY={isAndroid ? 50 : 0}
    >
      {body}
    </BottomSheet>
  );
};

export default BottomContentModal;
