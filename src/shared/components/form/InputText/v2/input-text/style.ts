import {v2Colors} from '@theme/themes';
import {ViewStyle, StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
  textInput: ViewStyle;
  separator: ViewStyle;
  icon: ViewStyle;
}

export default () => {
  return StyleSheet.create<Style>({
    container: {
      height: 60,
      // justifyContent: "center",
      paddingHorizontal: 20,
      borderWidth: 1.5,
      borderColor: v2Colors.border,
      borderRadius: 10,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    },
    textInput: {
      color: v2Colors.green,
      fontSize: 16,
      paddingRight: 20,
      width: '90%',
    },
    separator: {
      height: '100%',
      width: 2,
      backgroundColor: v2Colors.backgroundGray,
      marginRight: 10,
    },
    icon: {
      position: 'absolute',
      justifyContent: 'center',
      right: 14,
    },
  });
};
