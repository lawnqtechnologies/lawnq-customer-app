import React, { useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Controller } from "react-hook-form";

/* Library */
import { TextField } from "@freakycoder/react-native-material-textfield";

import createStyles from "./TextInput.style";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ITextInputProps {
  name: string;
  label: string;
  placeholder?: string;
  maxInputLength?: number | undefined;
  autoCorrect?: boolean;
  control: any;
  ref?: any;
  style?: CustomStyleProp;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  prefix?: string | undefined;
  onFocus?: (a: string) => void;
  value?: string;
  isPassword?: boolean;
  disabled?: boolean;
  keyboardType?: string;
}

const TextInput: React.FC<ITextInputProps> = ({
  name = "",
  label = "",
  placeholder = "",
  maxInputLength = 500,
  autoCorrect = false,
  control,
  ref,
  style,
  leftIcon,
  rightIcon,
  prefix,
  onFocus,
  isPassword,
  disabled,
  keyboardType = "default",
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <TextField
              ref={ref}
              containerStyle={[styles.bottomSpacer, style]}
              label={label}
              placeholder={placeholder}
              placeholderTextColor={"black"}
              prefix={prefix}
              onChangeText={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              value={value}
              secureTextEntry={isPassword}
              renderLeftAccessory={() => {
                return leftIcon;
              }}
              renderRightAccessory={() => {
                return rightIcon;
              }}
              labelOffset={{ x: 0 }}
              tintColor={"black"}
              activeLineWidth={1}
              autoCorrect={autoCorrect}
              keyboardType={keyboardType}
              autoCapitalize="none"
              maxLength={maxInputLength}
              error={error?.message}
              errorColor={colors.textError}
              allowFontScaling={false}
              disabled={disabled}
              multiline={false}
              numberOfLines={1}
            />
          </>
        )}
      />
    </>
  );
};

export default TextInput;
