import {ExtendedTheme} from '@react-navigation/native';
import {ViewStyle, StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
}

export default (_theme: ExtendedTheme) => {
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
  });
};
