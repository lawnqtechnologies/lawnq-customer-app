import {useTheme} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {
  View,
  TextInput,
  KeyboardTypeOptions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {Controller, FieldError} from 'react-hook-form';

/**
 * ? Local imports
 */
import createStyles from './style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {v2Colors} from '@theme/themes';

interface IInputText {
  control: any;
  name: string;
  label: string;
  maxLength?: number | undefined;
  autoCorrect?: boolean;
  keyboardType?: KeyboardTypeOptions;
  rightIcon?: JSX.Element;
  onFocus?: any;
  onChangeText?: any;
  prefix?: string;
  isPassword?: boolean;
  isError?: FieldError | undefined;
  style?: ViewStyle | undefined;
  textStyle?: TextStyle | undefined;
  multiline?: boolean;
  placeholderTextColor?: string | undefined;
}

const InputText: React.FC<IInputText> = ({
  control,
  name,
  label = 'Label',
  maxLength = 50,
  autoCorrect = false,
  keyboardType = 'default',
  rightIcon,
  onFocus,
  prefix,
  isPassword = false,
  isError,
  style,
  textStyle,
  multiline = false,
  placeholderTextColor = '#3A3A3A',
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(), [theme]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isError ? v2Colors.red : v2Colors.border,
          borderWidth: isError ? 1 : 2,
        },
        style,
      ]}>
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
          return (
            <>
              {prefix && (
                <>
                  <Text h4 color={v2Colors.green} style={{paddingRight: 10}}>
                    {prefix}
                  </Text>
                  <View style={styles.separator} />
                </>
              )}
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                defaultValue={value ?? ''}
                style={[styles.textInput, textStyle]}
                placeholder={label}
                maxLength={maxLength}
                autoCorrect={autoCorrect}
                keyboardType={keyboardType}
                onFocus={onFocus}
                secureTextEntry={isPassword}
                placeholderTextColor={placeholderTextColor ?? '#3A3A3A'}
                multiline={multiline}
              />
            </>
          );
        }}
      />
      <View style={styles.icon}>{rightIcon}</View>
    </View>
  );
};

export default InputText;
