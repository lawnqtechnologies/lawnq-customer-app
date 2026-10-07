import {StyleSheet, ViewStyle, TextStyle} from 'react-native';
import {v2Colors} from '@theme/themes';

interface Style {
  modal: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  scroll: ViewStyle;
  addServiceCard: ViewStyle;
  sectionLabel: TextStyle;
  searchRow: ViewStyle;
  searchInput: TextStyle;
  helperText: TextStyle;
  resultsCard: ViewStyle;
  matchRow: ViewStyle;
  matchTextContainer: ViewStyle;
  emptyState: ViewStyle;
  emptyIconCircle: ViewStyle;
  divider: ViewStyle;
  addCustomRow: ViewStyle;
  editPanel: ViewStyle;
  editInput: TextStyle;
  editButtonsRow: ViewStyle;
  editButton: ViewStyle;
  infoBanner: ViewStyle;
  infoTextContainer: ViewStyle;
  footer: ViewStyle;
  doneButton: ViewStyle;
  cancelButton: ViewStyle;
}

export default StyleSheet.create<Style>({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '92%',
    paddingTop: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  backButton: {
    paddingRight: 10,
    paddingTop: 2,
  },
  title: {
    fontSize: 20,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
  },
  scroll: {
    paddingHorizontal: 18,
  },
  addServiceCard: {
    backgroundColor: v2Colors.lightGreen,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: v2Colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 15,
    color: 'black',
    padding: 0,
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: v2Colors.border,
    marginTop: 12,
    overflow: 'hidden',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  matchTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F2F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: v2Colors.border,
  },
  addCustomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: v2Colors.lightGreen,
  },
  editPanel: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: v2Colors.highlight,
    padding: 12,
    marginTop: 12,
  },
  editInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: v2Colors.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    color: 'black',
    marginBottom: 10,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E9F1FB',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: v2Colors.border,
  },
  doneButton: {
    backgroundColor: v2Colors.green,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: v2Colors.border,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
