import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

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
        <TouchableOpacity>
          <SEND />
        </TouchableOpacity>

        <TouchableOpacity>
          <X />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInput;
