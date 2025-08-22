import React from 'react';
import {StyleProp, ViewStyle, ActivityIndicator} from 'react-native';
import {useTheme} from '@react-navigation/native';

/**
 * ? Local imports
 */

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
}

const LoaderComponent: React.FC<IBottomModalScreenProps> = ({}) => {
  const theme = useTheme();

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Loader = () => <ActivityIndicator size={'small'} color={'white'} />;

  return <Loader />;
};

export default LoaderComponent;
