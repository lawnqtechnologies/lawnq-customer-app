import {ExtendedTheme} from '@react-navigation/native';
import {v2Colors} from '@theme/themes';
import {ViewStyle, StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
  modal: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  modalArrow: ViewStyle;
  closeButton: ViewStyle;
  body: ViewStyle;
  buttonContainer: ViewStyle;
  button1: ViewStyle;
  button2: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    content: {
      backgroundColor: '#fff',
      minHeight: 250,
      borderRadius: 30,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 10,
      alignSelf: 'center',
    },
    modalArrow: {
      position: 'absolute',
      alignSelf: 'center',
      top: -30,
    },
    closeButton: {
      position: 'absolute',
      top: 15,
      right: 20,
    },
    body: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    buttonContainer: {
      flex: 1,
      paddingBottom: 20,
      justifyContent: 'center',
      marginTop: -20,
    },
    button1: {
      width: '70%',
      height: 70,
      alignItems: 'center',
      alignSelf: 'center',
      paddingVertical: 8,
      paddingHorizontal: 30,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: v2Colors.border,
      flexDirection: 'row',
    },
    button2: {
      width: '70%',
      height: 70,
      borderWidth: 1,
      borderColor: v2Colors.highlight,
      alignSelf: 'center',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 30,
      borderRadius: 5,
      flexDirection: 'row',
    },
  });
};
