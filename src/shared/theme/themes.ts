import {DefaultTheme, ExtendedTheme} from '@react-navigation/native';

export const palette = {
  primary: '#333',
  secondary: '#b6b5b3',
  background: '#f3f3f3',
  white: '#fff',
  black: '#101214',
  button: '#1c1e21',
  lightGreen: '#bcd631',
  shadow: '#757575',
  text: '#30363b',
  textError: '#f44336',
  borderColor: '#d0d7de',
  borderColorDark: '#333942',
  borderColorError: '#f44336',
  placeholder: '#a1a1a1',
  danger: '#cc3333',
  title: 'rgb(102, 102, 102)',
  separator: 'rgb(194, 194, 195)',
  highlight: 'rgb(199, 198, 203)',
  blackOverlay: 'rgba(0,0,0,0.6)',
  iconWhite: '#fff',
  iconBlack: '#101214',
  dynamicWhite: '#fff',
  dynamicBlack: '#1c1e21',
  dynamicBackground: '#fff',
  transparent: 'transparent',
  calpyse: '#2b7488',
  neonGreen: '#D2F15E',
  darkGreen: '#4FAE5A',
  lightGray: '#F0F0F0',
  navBarLightGray: '#C8C8C8',
  switchGray: '#A5A5A5',
  textDarkGray: '#707070',
  darkGray: '#404040',
  darkerGray: '#1C1C1C',
  fontDarkGray: '#707070',
};

export const v2Colors = {
  border: '#E7E7E7',
  highlight: '#98C23C',
  green: '#1E4940',
  greenShade2: '#51736C',
  lightGreen: 'rgba(152, 194, 60, 0.19)',
  gray: '#A0A0A0',
  lightRed: '#E98692',
  backgroundGray: '#F6F6F6',
  orange: '#F39C12',
  blue: '#3498DB',
  red: '#E74C3C',
  blackOpacity6: 'rgba(0,0,0,0.6)',
  yellowGreen: '#98C23C',
};

export const LightTheme: ExtendedTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    ...palette,
    ...v2Colors,
  },
};

// export const DarkTheme: ExtendedTheme = {
//   dark: false,
//   colors: {
//     ...DefaultTheme.colors,
//     ...palette,
//     ...v2Colors,
//   },
// };

export const DarkTheme: ExtendedTheme = {
  ...DefaultTheme,
  colors: {
    ...LightTheme.colors,
    background: palette.white,
    // foreground: palette.white,
    text: palette.black,
    label: palette.black,
    // tabBar: palette.black,
    // iconWhite: palette.black,
    // iconBlack: palette.white,
    // dynamicBackground: palette.dynamicBlack,
    shadow: palette.transparent,
    borderColor: palette.borderColorDark,
  },
};
