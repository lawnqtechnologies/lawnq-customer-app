import {ExtendedTheme} from '@react-navigation/native';
import {v2Colors} from '@theme/themes';
import {ViewStyle, StyleSheet} from 'react-native';
import {ImageStyle} from 'react-native-fast-image';

interface Style {
  container: ViewStyle;
  profileContainer: ViewStyle;

  subContainer: ViewStyle;

  headerContainer: ViewStyle;
  subHeaderContainer: ViewStyle;
  actionHeaderContainer: ViewStyle;
  profilePicImageStyle: ImageStyle;
  subProfilePicImageStyle: ImageStyle;
  imageHeaderContainer: ImageStyle;
  leftIcon: ImageStyle;

  formContainer: ViewStyle;
  item: ViewStyle;
  title: ViewStyle;
  button: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    profileContainer: {},
    subContainer: {
      flex: 1,
      marginTop: '5%',
      paddingHorizontal: '5%',
    },
    headerContainer: {
      height: '15%',
      width: '100%',
      backgroundColor: 'black',
      paddingTop: '5%',
    },
    subHeaderContainer: {
      paddingHorizontal: '5%',
    },
    actionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    imageHeaderContainer: {
      position: 'relative',
      width: '100%',
      alignItems: 'center',
      top: '5%',
    },
    profilePicImageStyle: {
      height: 100,
      width: 100,
      borderRadius: 60,
      backgroundColor: 'black',
    },
    subProfilePicImageStyle: {
      width: '30%',
      marginTop: 10,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: v2Colors.highlight,
      backgroundColor: v2Colors.border,
      borderRadius: 8,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.32,
      shadowRadius: 5.46,
      // elevation: 9,
    },
    leftIcon: {
      height: 18,
      width: 18,
      marginTop: 18,
      marginRight: 8,
    },

    formContainer: {
      flexGrow: 1,
      width: '100%',
      marginTop: 20,
      paddingHorizontal: 10,
      marginBottom: 30,
    },
    item: {
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: {
      // fontSize: 32,
    },
    button: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      marginHorizontal: 10,
    },
  });
};
