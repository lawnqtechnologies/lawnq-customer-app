import React, { useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Controller } from "react-hook-form";
import { size } from "lodash"; 
/* Library */
import { OutlinedTextField } from "@freakycoder/react-native-material-textfield";

import createStyles from "./InputText.style";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IInputTextProps {
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
  keyboardType?: string;
  placeholderTextColor?: string;
}

const InputText: React.FC<IInputTextProps> = ({
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
  keyboardType = "default",
  placeholderTextColor = "black",
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
        }) => {
          return (
            <>
              <OutlinedTextField
                ref={ref}
                containerStyle={[style, styles.bottomSpacer]}
                inputContainerStyle={styles.inputContainerStyle}
                labelTextStyle={styles.labelTextStyle}
                affixTextStyle={styles.affixTextStyle}
                titleTextStyle={styles.titleTextStyle}
                style={styles.style}
                label={label}
                placeholder={placeholder}
                prefix={prefix}
                onChangeText={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                value={value}
                secureTextEntry={isPassword}
                renderLeftAccessory={() => leftIcon}
                renderRightAccessory={() => rightIcon}
                labelOffset={{ x1: -38, y1: -2 }}
                tintColor={"black"}
                activeLineWidth={1}
                autoCorrect={autoCorrect}
                keyboardType={keyboardType}
                autoCapitalize="none"
                maxLength={maxInputLength}
                // error={error?.message}
                // errorColor={colors.textError}
                allowFontScaling={false}
                blurOnSubmit={false}
                placeholderTextColor={placeholderTextColor}
                baseColor={size(error) === 0 ? colors.darkGray : "red"}
              />
            </>
          );
        }}
      />
    </>
  );
};

export default InputText;
