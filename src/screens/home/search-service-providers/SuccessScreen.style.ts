import {ExtendedTheme} from '@react-navigation/native';
import {ViewStyle, StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
  animationContainer: ViewStyle;
  text: ViewStyle;
  confirmBtnContainer: ViewStyle;
  confirmBtn: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: colors.lightGray,
      paddingHorizontal: '5%',
    },
    animationContainer: {
      height: '30%',
      width: '100%',
      marginTop: 100,
      marginBottom: 40,
    },
    text: {
      textAlign: 'center',
    },
    confirmBtnContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 40,
    },
    confirmBtn: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 30,
      backgroundColor: 'white',
      borderRadius: 15,
      flexDirection: 'row',
    },
  });
};
