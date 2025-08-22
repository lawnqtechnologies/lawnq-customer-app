import {ExtendedTheme} from '@react-navigation/native';
import {ImageStyle} from 'react-native-fast-image';
import {ViewStyle, StyleSheet, TextStyle} from 'react-native';
import {v2Colors} from '@theme/themes';

interface Style {
  container: ViewStyle;
  titleTextStyle: TextStyle;
  buttonStyle: ViewStyle;
  buttonTextStyle: TextStyle;
  leftIcon: ImageStyle;
  rightIcon: ImageStyle;
  socialIcon: ImageStyle;
  OrContainer: ViewStyle;
  lineSeparator: ViewStyle;
  socialsContainer: ViewStyle;
  registerContainer: ViewStyle;
  forgotpasswordContainer:ViewStyle;

  //R.Suarez added 8/7/2022
  errorContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingTop: 80,
      paddingBottom: 20,
    },
    titleTextStyle: {
      fontSize: 32,
    },
    buttonStyle: {
      height: 45,
      width: '90%',
      marginTop: 32,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      shadowRadius: 5,
      shadowOpacity: 0.7,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },
    buttonTextStyle: {
      color: colors.text,
      fontWeight: '700',
    },
    leftIcon: {
      height: 20,
      width: 20,
      marginTop: 18,
      marginRight: 10,
    },
    rightIcon: {
      height: 30,
      width: 30,
      marginRight: 2,
    },
    socialIcon: {
      height: 50,
      width: 50,
    },
    OrContainer: {
      height: 50,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
    },
    lineSeparator: {
      height: 1,
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    socialsContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 50,
      marginBottom: 155,
      paddingHorizontal: 70,
    },
    registerContainer: {
      flex: 0.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: v2Colors.red,
      borderRadius: 7,
      height: 50,
      marginBottom: 30,
    },
    forgotpasswordContainer:{
      marginTop:20,
      alignSelf:'center'
    }
  });
};
