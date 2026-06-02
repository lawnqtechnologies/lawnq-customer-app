import {ExtendedTheme} from '@react-navigation/native';
import {ViewStyle, StyleSheet, TextStyle} from 'react-native';

interface Style {
  container: ViewStyle;
  animationContainer: ViewStyle;
  animation: ViewStyle;
  contentContainer: ViewStyle;
  text: TextStyle;
  titleText: TextStyle;
  bodyText: TextStyle;
  nextStepText: TextStyle;
  confirmBtnContainer: ViewStyle;
  confirmBtn: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: colors.lightGray,
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 24,
      overflow: 'hidden',
    },
    animationContainer: {
      width: '100%',
      height: 230,
      maxHeight: '32%',
      marginTop: 80,
      marginBottom: 28,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    animation: {
      width: '100%',
      height: '100%',
    },
    contentContainer: {
      width: '100%',
      alignItems: 'center',
    },
    text: {
      textAlign: 'center',
      width: '100%',
      flexShrink: 1,
    },
    titleText: {
      textAlign: 'center',
      width: '100%',
      flexShrink: 1,
      fontWeight: '700',
    },
    bodyText: {
      textAlign: 'center',
      width: '100%',
      flexShrink: 1,
      marginTop: 8,
      lineHeight: 24,
    },
    nextStepText: {
      textAlign: 'center',
      width: '100%',
      flexShrink: 1,
      marginTop: 18,
      lineHeight: 24,
    },
    confirmBtnContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 40,
      width: '100%',
    },
    confirmBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: 30,
      backgroundColor: 'white',
      borderRadius: 15,
      flexDirection: 'row',
      minWidth: 180,
    },
  });
};
