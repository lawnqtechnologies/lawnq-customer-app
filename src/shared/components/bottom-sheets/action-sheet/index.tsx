import React from 'react';
import {View} from 'react-native';

/**
 * ? Local imports
 */
import styles from './styles';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CommonButton from '@shared-components/buttons/CommonButton';
// import { ActionSheetComponentRef } from "react-native-actions-sheet";

interface IActionSheetComponentProps {
  title?: string;
  data?: Array<any>;
  onHide?: any;
  onPressConfirm?: Function;
}

const ActionSheetComponent: React.FC<IActionSheetComponentProps> = ({
  title,
  data,
  onHide,
  onPressConfirm,
}) => {
  const Header = () => (
    <View style={styles.header}>
      <Text h3 bold color="black" style={{textAlign: 'center'}}>
        {title}
      </Text>
    </View>
  );

  const Confirm = () => (
    <View style={{marginBottom: 50}}>
      <CommonButton
        text={'Confirm'}
        onPress={() => {
          onHide.current?.hide();
          onPressConfirm && onPressConfirm();
        }}
        style={{borderRadius: 5}}
      />
    </View>
  );

  return (
    <View style={styles.content}>
      <View style={styles.headerIndicator} />
      <Header />
      <View style={styles.body}>
        {data?.map((d: string) => {
          return (
            <View style={styles.bodyText}>
              <Text>{`* `}</Text>
              <Text>{d}</Text>
            </View>
          );
        })}
      </View>
      <Confirm />
    </View>
  );
};

export default ActionSheetComponent;
