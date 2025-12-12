import React, { useMemo } from "react";
import { View, Pressable } from "react-native";
import Modal from "react-native-modal";
import { useTheme } from "@react-navigation/native";

/**
 * ? Local imports
 */
import createStyles from "./style";
import Text from "@shared-components/text-wrapper/TextWrapper";

/**
 * ? SVGs
 */
import { v2Colors } from "@theme/themes";

interface ICenterModalW2Buttons {
  style?: any;
  isVisible: boolean;
  setIsVisible: Function;
  text?: string;
  onPressYes?: Function;
  onPressNo?: Function;
}

const CenterModalW2Buttons: React.FC<ICenterModalW2Buttons> = ({
  isVisible,
  setIsVisible,
  text = "This is a modal",
  onPressYes,
  onPressNo,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const Content = () => (
    <View style={styles.container}>
      <Text center style={{ fontSize: 20, marginBottom: 20 }}>
        {text}
      </Text>
      <Button />
    </View>
  );

  const Button = () => (
    <View style={styles.buttonContainer}>
      <Pressable
        style={styles.button1}
        onPress={() => {
          onPressYes && onPressYes();
          setIsVisible(false);
        }}
      >
        <Text bold color={"white"}>
          Yes
        </Text>
      </Pressable>
      <View style={{ width: "4%" }} />
      <Pressable
        style={styles.button2}
        onPress={() => {
          onPressNo && onPressNo();
          setIsVisible(false);
        }}
      >
        <Text bold color={v2Colors.green}>
          No
        </Text>
      </Pressable>
    </View>
  );

  return (
    <Modal
      testID={"modal"}
      isVisible={isVisible}
      backdropColor="rgba(0,0,0,0.5)"
      backdropOpacity={0.8}
      animationIn="zoomInDown"
      animationOut="zoomOutUp"
      animationInTiming={600}
      animationOutTiming={600}
      backdropTransitionInTiming={600}
      backdropTransitionOutTiming={600}
    >
      <Content />
    </Modal>
  );
};

export default CenterModalW2Buttons;
