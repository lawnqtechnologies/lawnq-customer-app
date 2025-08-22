import React, {useMemo} from 'react';
import {View, Pressable, ViewStyle} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Text from '@shared-components/text-wrapper/TextWrapper';
import * as _ from 'lodash';

/**
 * ? Local Imports
 */
import createStyles from './CommonButton.style';
import Loader from '@shared-components/loaders/ActivityLoader';
import {v2Colors} from '@theme/themes';

interface ICommonButtonProps {
  onPress: () => void;
  backgroundColor?: string;
  color?: string;
  text: string;
  style?: ViewStyle;
  isFetching?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  disabled?: boolean;
}

const CommonButton: React.FC<ICommonButtonProps> = ({
  onPress,
  text,
  backgroundColor,
  color,
  style,
  isFetching,
  leftIcon,
  rightIcon,
  disabled,
}) => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.container,
        {
          opacity: pressed ? 0.5 : 1,
          backgroundColor: v2Colors.green,
          borderColor: v2Colors.highlight,
          borderWidth: disabled ? 0.5 : 0,
        },
        style,
      ]}
      disabled={disabled}>
      {!isFetching ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          {!!leftIcon ? leftIcon : <View style={{width: '7.5%'}} />}
          <Text
            bold
            color={color ?? colors.white}
            style={{width: '85%', textAlign: 'center', fontSize: 18}}>
            {text}
          </Text>
          {!!rightIcon ? rightIcon : <View style={{width: '7.5%'}} />}
        </View>
      ) : (
        <Loader />
      )}
    </Pressable>
  );
};

export default CommonButton;
