import React, { useMemo } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import Modal from "react-native-modal";
import GestureRecognizer from "react-native-swipe-gestures";

/**
 * ? Local imports
 */
import createStyles from "./ErrorModal.style";
import Text from "@shared-components/text-wrapper/TextWrapper";
import CommonButton from "@shared-components/buttons/CommonButton";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  title?: string;
  data?: Array<any>;
}

const BottomModal: React.FC<IBottomModalScreenProps> = ({
  isVisible,
  setIsVisible,
  title,
  data,
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
        {data?.map((d: string) => {
          return (
            <View style={styles.bodyText}>
              <Text>{`* `}</Text>
              <Text>{d}</Text>
            </View>
          );
        })}
      </View>
      <Confirm />
    </View>
  );

  const Header = () => (
    <View style={styles.header}>
      <Text h4 bold color="black">
        {title}
      </Text>
      <Text h4 bold color="black"></Text>
    </View>
  );

  const Confirm = () => (
    <View>
      <CommonButton
        text={"Confirm"}
        onPress={() => {
          setIsVisible(false);
        }}
        style={{ borderRadius: 5 }}
      />
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

export default BottomModal;
