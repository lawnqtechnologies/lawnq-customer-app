import React from 'react';
import {View, Pressable} from 'react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

import Text from '@shared-components/text-wrapper/TextWrapper';
import fonts from '@fonts';
import {v2Colors} from '@theme/themes';
import type {ExtraService} from '../../data';
import styles from './styles';

interface Props {
  item: ExtraService;
  // Read-only rows (e.g. on the home screen) hide the edit / remove controls.
  readOnly?: boolean;
  onEdit?: (item: ExtraService) => void;
  onRemove?: (id: string) => void;
}

const ExtraServiceItem: React.FC<Props> = ({
  item,
  readOnly = false,
  onEdit,
  onRemove,
}) => {
  return (
    <View style={styles.itemRow}>
      {/* Top row: title + description get the full card width */}
      <View style={styles.itemTopRow}>
        {!readOnly && (
          <View style={styles.dragHandle}>
            <Icon
              name="drag-indicator"
              type={IconType.MaterialIcons}
              size={20}
              color={v2Colors.greenShade2}
            />
          </View>
        )}

        <View style={styles.itemTextContainer}>
          <Text
            fontFamily={fonts.lexend.extraBold}
            color={v2Colors.green}
            style={styles.itemName}>
            {item.name}
          </Text>
          {!!item.description && (
            <Text color={v2Colors.greenShade2} style={styles.itemDescription}>
              {item.description}
            </Text>
          )}
        </View>
      </View>

      {/* Bottom row: status pill + actions */}
      <View style={styles.itemBottomRow}>
        <View style={styles.quotedPill}>
          <Text color={v2Colors.greenShade2} style={styles.quotedPillText}>
            To be quoted
          </Text>
        </View>

        {!readOnly && (
          <View style={styles.actionsGroup}>
            <Pressable
              style={styles.itemAction}
              hitSlop={8}
              onPress={() => onEdit?.(item)}>
              <Icon
                name="edit"
                type={IconType.MaterialIcons}
                size={20}
                color={v2Colors.greenShade2}
              />
            </Pressable>
            <Pressable
              style={styles.itemAction}
              hitSlop={8}
              onPress={() => onRemove?.(item.id)}>
              <Icon
                name="close"
                type={IconType.MaterialIcons}
                size={20}
                color={v2Colors.greenShade2}
              />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

export default ExtraServiceItem;
