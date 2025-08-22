import {ExtendedTheme} from '@react-navigation/native';
import {v2Colors} from '@theme/themes';
import {ViewStyle, StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
  animationContainer: ViewStyle;
  text: ViewStyle;
  btnContainer: ViewStyle;
  btn1: ViewStyle;
  btn2: ViewStyle;
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
    btnContainer: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginBottom: 40,
      flexDirection: 'row',
    },
    btn1: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 30,
      backgroundColor: v2Colors.green,
      borderRadius: 15,
      flexDirection: 'row',
    },
    btn2: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingVertical: 10,
    },
  });
};
