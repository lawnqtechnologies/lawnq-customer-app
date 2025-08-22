import React, { memo, useCallback, useMemo, useRef } from "react";
import { View, StyleProp, ViewStyle, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { isAndroid } from "@freakycoder/react-native-helpers";

/**
 * ? Local imports
 */
import createStyles from "./BottomSheetModal.style";
import ChatInput from "../text-input.tsx";

/**
 * ? SVGs
 */

import PHONE from "@assets/v2/chat/icons/phone.svg";

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

  /**
   * ? Callbacks
   */
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      handleClose();
      setSnapPoint(0);
    }
    if (index === 0) {
      setSnapPoint(0);
    }
    if (index === 1) {
      setSnapPoint(1);
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Content = () => <View style={styles.content}>{body}</View>;
  const InitialContent = () => (
    <View style={styles.intialContentContainer}>
      <ChatInput
        value={text}
        setValue={setText}
        setSnapPoint={setSnapPoint}
        showSoftInputOnFocus={false}
      />
      {/* <TouchableOpacity>
        <PHONE />
      </TouchableOpacity> */}
    </View>
  );

  const Sheet = memo(() => (
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
      {snapPoint === 0 && <Content />}
      {snapPoint === 1 && <Content />}
    </BottomSheet>
  ));

  return <Sheet />;
};

export default BottomContentModal;
