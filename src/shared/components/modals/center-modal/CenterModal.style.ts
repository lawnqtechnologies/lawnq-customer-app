import {ExtendedTheme} from '@react-navigation/native';
import {v2Colors} from '@theme/themes';
import {ViewStyle, StyleSheet, Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

interface Style {
  container: ViewStyle;
  modal: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  body: ViewStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  scrollContent: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      padding: 10,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    content: {
      backgroundColor: '#fff',
      minHeight: height * 0.3, // 30% of screen height
      width: width * 0.9, // 90% of screen width
      borderRadius: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 10,
      borderBottomWidth: 3,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    body: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    buttonContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 20,
    },
    button: {
      backgroundColor: v2Colors.green,
      alignSelf: 'center',
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 5,
    },
  });
};
