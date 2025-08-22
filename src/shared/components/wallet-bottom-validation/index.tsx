import React, {useMemo} from 'react';
import {View} from 'react-native';

import {useTheme} from '@react-navigation/native';
import styles from './styles';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CommonButton from '@shared-components/buttons/CommonButton';

interface IWalletBottomValidationProps {
  title?: string;
  data?: Array<any>;
  onHide?: any;
  onPressConfirm?: Function;
}

const WalletBottomValidation: React.FC<IWalletBottomValidationProps> = ({
  title,
  data,
  onHide,
  onPressConfirm,
}) => {
  /**
|--------------------------------------------------
| Styles
|--------------------------------------------------
*/
  const theme = useTheme();
  const {colors} = theme;

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
        text={'Set Up Wallet'}
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
              <Text style={{textAlign: 'justify'}}>
                To proceed with your quotation, please set up your wallet. You
                won’t be charged for instant quotation, payment details are
                securely stored, and the final quoted price depends on the card
                type.
              </Text>
            </View>
          );
        })}
      </View>
      <Confirm />
    </View>
  );
};

export default WalletBottomValidation;
