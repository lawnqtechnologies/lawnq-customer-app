import {ExtendedTheme} from '@react-navigation/native';
import {ViewStyle, StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
  animationContainer: ViewStyle;
  text: ViewStyle;
  textTimer: ViewStyle;
  btnContainer: ViewStyle;
  btn: ViewStyle;
  icon: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: colors.lightGray,
    },
    animationContainer: {
      height: '40%',
      width: '100%',
      marginTop: 100,
      marginBottom: 40,
    },
    text: {
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    textTimer: {
      textAlign: 'center',
      paddingHorizontal: 20,
      fontSize: 25,
    },
    btnContainer: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      paddingBottom: 20,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      // backgroundColor: 'red',
    },
    icon: {
      marginRight: 2,
    },
  });
};
