import React from "react";
import { TextInput, Pressable, View } from "react-native";

/**
 * ? Local imports
 */
import styles from "./styles";

/**
 * ? SVGs
 */
import SEND from "@assets/v2/chat/icons/send.svg";
import X from "@assets/v2/chat/icons/x.svg";

interface ITextInput {
  value: string;
  setValue: Function;
  setSnapPoint?: Function | undefined;
  showSoftInputOnFocus?: boolean;
}

const ChatInput: React.FC<ITextInput> = ({
  value,
  setValue,
  setSnapPoint,
  showSoftInputOnFocus = true,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        defaultValue={value}
        onChangeText={(text) => setValue(text)}
        onFocus={() => {
          setSnapPoint && setSnapPoint(1);
        }}
        showSoftInputOnFocus={showSoftInputOnFocus}
        placeholder={"Enter Message"}
      />
      <View style={styles.rightContent}>
        <Pressable>
          <SEND pointerEvents="none" />
        </Pressable>

        <Pressable>
          <X pointerEvents="none" />
        </Pressable>
      </View>
    </View>
  );
};

export default ChatInput;
