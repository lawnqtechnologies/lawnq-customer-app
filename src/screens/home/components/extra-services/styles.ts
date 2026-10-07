import {StyleSheet, ViewStyle, TextStyle} from 'react-native';
import {v2Colors} from '@theme/themes';

interface Style {
  listContainer: ViewStyle;
  listHeading: TextStyle;
  itemRow: ViewStyle;
  itemTopRow: ViewStyle;
  itemBottomRow: ViewStyle;
  dragHandle: ViewStyle;
  itemTextContainer: ViewStyle;
  itemName: TextStyle;
  itemDescription: TextStyle;
  quotedPill: ViewStyle;
  quotedPillText: TextStyle;
  actionsGroup: ViewStyle;
  itemAction: ViewStyle;
  emptyContainer: ViewStyle;
}

export default StyleSheet.create<Style>({
  listContainer: {
    width: '100%',
    marginTop: 16,
  },
  listHeading: {
    fontSize: 16,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: v2Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dragHandle: {
    marginRight: 8,
    paddingTop: 1,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    lineHeight: 20,
  },
  itemDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
  },
  quotedPill: {
    backgroundColor: '#EEF1F4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  quotedPillText: {
    fontSize: 12,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAction: {
    padding: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    width: '100%',
    paddingVertical: 12,
  },
});
