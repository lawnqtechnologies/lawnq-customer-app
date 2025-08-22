import React, { useMemo } from "react";
import {
  View,
  StyleProp,
  ViewStyle,
  TextInput,
  KeyboardType,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Controller } from "react-hook-form";

/**
 * ? Local Imports
 */
import createStyles from "./UnderlinedInputText.style";
import Text from "@shared-components/text-wrapper/TextWrapper";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IInputTextProps {
  name?: string;
  control: any;
  placeholder?: string;
  disabled?: boolean | undefined;
  placeholderTextColor?: string;
  isPassword?: boolean;
  keyboardType?: KeyboardType | undefined;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  style?: any;
  onFocus?: any;
}

const InputText: React.FC<IInputTextProps> = ({
  name = "",
  control,
  placeholder,
  disabled,
  placeholderTextColor,
  isPassword,
  keyboardType = "default",
  leftIcon,
  rightIcon,
  style,
  onFocus,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const LeftIcon = () => <View style={styles.leftIcon}>{leftIcon}</View>;

  const RightIcon = () => <View style={styles.rightIcon}>{rightIcon}</View>;

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <View style={styles.inputView}>
              <LeftIcon />
              <TextInput
                style={[styles.input, style]}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                editable={disabled}
                allowFontScaling={false}
                autoCapitalize={"none"}
                secureTextEntry={isPassword}
                keyboardType={keyboardType}
                autoCorrect={false}
                blurOnSubmit={false}
                onFocus={onFocus}
                multiline={false}
              />
              <RightIcon />
            </View>
            <View style={styles.errorView}>
              <Text h5 color={"red"}>
                {error?.message}
              </Text>
            </View>
          </>
        )}
      />
    </View>
  );
};

export default InputText;
