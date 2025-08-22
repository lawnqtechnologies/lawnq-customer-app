import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { View, TextInput, KeyboardTypeOptions } from "react-native";

/**
 * ? Local imports
 */
import createStyles from "./style";

interface IInputTextNoControl {
  value: string;
  setValue: Function;
  label: string;
  contentContainerStyle?: any;
  maxLength?: number | undefined;
  autoCorrect?: boolean;
  keyboardType?: KeyboardTypeOptions;
  rightIcon?: JSX.Element;
  onFocus?: any;
  style?: any;
}

const InputTextNoControl: React.FC<IInputTextNoControl> = ({
  value,
  setValue,
  label = "Label",
  contentContainerStyle,
  maxLength = 500,
  autoCorrect = false,
  keyboardType = "default",
  rightIcon,
  onFocus,
  style,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(), [theme]);

  return (
    <View style={[styles.container, contentContainerStyle]}>
      <TextInput
        style={[styles.textInput, style]}
        defaultValue={value.toString()}
        onChangeText={(text: string) => setValue(text)}
        placeholder={label}
        maxLength={maxLength}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        onFocus={onFocus}
      />
      <View style={styles.icon}>{rightIcon}</View>
    </View>
  );
};

export default InputTextNoControl;
