import React, { useMemo } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import Modal from "react-native-modal";
import GestureRecognizer from "react-native-swipe-gestures";

/**
 * ? Local imports
 */
import createStyles from "./BottomContentModal.style";

import Text from "@shared-components/text-wrapper/TextWrapper";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  title?: string;
  body?: JSX.Element;
}

const BottomContentModal: React.FC<IBottomModalScreenProps> = ({
  isVisible,
  setIsVisible,
  title,
  body,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Content = () => (
    <View style={styles.content}>
      <Header />
      <View style={styles.body}>
        {/* {body?.map((b: string, index: number) => {
          return <Text h4 key={index}>{`* ${b}`}</Text>;
        })} */}
         {body}
      </View>
    </View>
  );

  const Header = () => (
    <View style={styles.header}>
      <Text h2 bold>
        {title}
      </Text>
    </View>
  );

  return (
    <GestureRecognizer onSwipeDown={() => setIsVisible(false)}>
      <Modal
        isVisible={isVisible}
        swipeDirection="down"
        style={styles.modal}
        animationOut="slideOutDown"
        animationInTiming={500}
        animationOutTiming={500}
        useNativeDriver
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
        
      >
        <Content />
      </Modal>
    </GestureRecognizer>
  );
};

export default BottomContentModal;
