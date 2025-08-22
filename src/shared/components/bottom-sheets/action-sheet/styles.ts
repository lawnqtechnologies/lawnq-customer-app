import {StyleSheet, ViewStyle} from 'react-native';

interface Style {
  content: ViewStyle;
  headerIndicator: ViewStyle;
  header: ViewStyle;
  body: ViewStyle;
  bodyText: ViewStyle;
}

const styles = StyleSheet.create<Style>({
  content: {
    backgroundColor: '#fff',
    minHeight: 300,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerIndicator: {
    height: 5,
    width: 100,
    backgroundColor: 'black',
    marginTop: 5,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 5,
  },
  header: {
    margin: 10,
  },
  body: {
    flex: 2,
    marginLeft: 30,
    marginBottom: 50,
  },
  bodyText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
