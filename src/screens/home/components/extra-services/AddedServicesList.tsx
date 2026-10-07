import React from 'react';
import {View} from 'react-native';

import Text from '@shared-components/text-wrapper/TextWrapper';
import fonts from '@fonts';
import {v2Colors} from '@theme/themes';
import type {ExtraService} from '../../data';
import ExtraServiceItem from './ExtraServiceItem';
import styles from './styles';

interface Props {
  services: ExtraService[];
  readOnly?: boolean;
  onEdit?: (item: ExtraService) => void;
  onRemove?: (id: string) => void;
  // Hide the whole block when empty (used on the home screen).
  hideWhenEmpty?: boolean;
}

const AddedServicesList: React.FC<Props> = ({
  services,
  readOnly = false,
  onEdit,
  onRemove,
  hideWhenEmpty = false,
}) => {
  if (hideWhenEmpty && services.length === 0) return null;

  return (
    <View style={styles.listContainer}>
      <Text
        fontFamily={fonts.lexend.extraBold}
        color={v2Colors.green}
        style={styles.listHeading}>
        {`Added services (${services.length})`}
      </Text>

      {services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text color={v2Colors.greenShade2}>
            No extra services added yet.
          </Text>
        </View>
      ) : (
        services.map(item => (
          <ExtraServiceItem
            key={item.id}
            item={item}
            readOnly={readOnly}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))
      )}
    </View>
  );
};

export default AddedServicesList;
