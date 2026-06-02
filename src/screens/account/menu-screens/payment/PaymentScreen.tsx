import {useTheme,useIsFocused} from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState} from 'react';
import {
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import {initPaymentSheet, initStripe,presentPaymentSheet} from '@stripe/stripe-react-native';
import {usePayment} from '@services/hooks/usePayment';
import * as NavigationService from 'react-navigation-helpers';
import _ from 'lodash';
import {useSelector} from 'react-redux';
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from 'accordion-collapse-react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

import createStyles from './PaymentScreen.style';
import {v2Colors} from '@theme/themes';
import Text from '@shared-components/text-wrapper/TextWrapper';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import {SCREENS} from '@shared-constants';
import CommonButton from '@shared-components/buttons/CommonButton';
import WholeScreenLoader from '@shared-components/loaders/WholeScreenLoader';
import CenterModalW2Buttons from '@shared-components/modals/center-modal/with-2-buttons';
import {useSafeBottomPadding} from 'shared/functions/useSafeBottomInset';

/**
 * ? SVGs
 */
import MASTERCARD from '@assets/v2/payment/images/mastercard.svg';
import VISA from '@assets/v2/payment/images/visa.svg';
import AMEX from '@assets/v2/payment/images/amex.svg';
import GREEN_CHECK_CIRCLE from '@assets/v2/common/icons/green-check-circle.svg';
import {RootState} from 'store';
import { close } from 'fs';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IPaymentScreenProps {
  style?: CustomStyleProp;
}

interface ICustomerSetupIntentResponse {
  StatusCode: string,
  StatusMessage: string,
  ClientSecret: string,
  CustomerStripeId: string
}

// MODEL -- This model will be on seperate folder
interface ICustomerPaymentInfo {
  Last4: string;
  ExpMonth: number;
  ExpYear: number;
  Fingerprint: string;
  CustomerStripeId: string;
  CustomerStripePaymentId: string;
  Brand: string;
  IsDefault: number;
}
const PaymentScreen: React.FC<IPaymentScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const buttonBottomPadding = useSafeBottomPadding(30);

  /**
   * ? Hooks
   */
  const {
    customerPaymentMethodList,
    setIsDefaultCustomerCard,
    removeCustomerCard,
    customerPaymentKey,
    customerSetupIntent
  } = usePayment();

  /**
   * ? Redux States
   */
  const {token, customerId,deviceDetails,customerInfo} = useSelector(
    (state: RootState) => state.user,
  );

  /**
   * ? States
   */
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [expandedKey, setExpandedKey] = useState<string>('');
  const [walletList, setWalletList] = useState<Array<ICustomerPaymentInfo>>([]);
  const [selectedCard, setSelectedCard] = useState<ICustomerPaymentInfo>();
  const [showSetDefaultModal, setShowSetDefaultModal] =
    useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState(0);
  

  /**
   * ? Refs
   */
  const initializedRef = useRef(false);  // ✅ prevents multiple init
  const presentingRef  = useRef(false);  // ✅ prevents double present

  // this will reload the function everytime screen focused
const isFocused = useIsFocused();
useEffect(() => {
  if (isFocused) {
    getStripeKey();
    _getWalletInformations();
  }
}, [isFocused])

const initializePaymentSheet = async () => {
  if (initializedRef.current) return;
  try {
    setLoading(true);

    const { CustomerStripeId, ClientSecret } = await _customerSetupIntent();

    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Lawnq',
      customerId: CustomerStripeId,
      setupIntentClientSecret: ClientSecret,
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: { name: `${customerInfo.Firstname} ${customerInfo.Lastname}` },
      returnURL:"app.lawnq://app/payment",
    });

    if (error) {
      setReady(false);
      initializedRef.current = false;
      Alert.alert(`Init error: ${error.code}`, error.message);
    } else {
      setReady(true);
      initializedRef.current = true;
    }
  } catch (e: any) {
    setReady(false);
    initializedRef.current = false;
    Alert.alert('Initialize error', e?.message ?? 'Unknown error');
  } finally {
    setLoading(false);
  }
};

const openPaymentSheet = async () => {
  if (!ready) {
    Alert.alert('Not ready', 'Payment sheet has not been initialized yet.');
    return;
  }
  if (presentingRef.current) return;    // hard guard
  presentingRef.current = true;

  try {
    const { error } = await presentPaymentSheet();

    if (error) {
      // 'Canceled' = user closed; don't re-init, don't re-present
      if (error.code !== 'Canceled') {
        // Delay showing an Alert a bit (see #③ below)
        setTimeout(() => {
          Alert.alert(`Error code: ${error.code}`, error.message);
        }, 250);

        NavigationService.replace(SCREENS.PAYMENT);

      }
    } else {
      // Delay Alert to avoid re-present flicker (see #③)
      setTimeout(() => {
        Alert.alert('Success', 'Your card has been saved!');
         NavigationService.replace(SCREENS.PAYMENT);
      }, 250);
      // To force remount screen 
      NavigationService.replace(SCREENS.PAYMENT);

    }
  } finally {
    presentingRef.current = false;
    setReady(true);
    setLoading(false);
    presentingRef.current = false;
    _getWalletInformations();
  }
};



// Debounced wrapper: fires immediately once, ignores subsequent taps for 800ms
const openPaymentSheetDebounced = useMemo(
  () => _.debounce(() => openPaymentSheet(), 800, { leading: true, trailing: false }),
  [ready] // rebuild if readiness changes
);


const getStripeKey = () => {
  const payload = { CustomerToken: token, CustomerId: customerId };

  customerPaymentKey(
    payload,
    async (data: any) => {
      if (data.StatusCode === '00') {
        const stipeKey = data.Data.find((x: any) => x.StripeKeyName === 'PublishableKey')?.StripeKey;       
        await initStripe({
          publishableKey: stipeKey,
          merchantIdentifier: 'merchant.com.app.lawnq', // or your real merchant id
          urlScheme: 'app.lawnq',                      // 👈 MUST match Info.plist
        });
        await initializePaymentSheet(); // make sure we await this
      } else {
        Alert.alert(data.StatusMessage);
      }
    },
    (error: any) => {
      Alert.alert(`Error Code: ${error.code}`, error.message);
    },
  );
};

const _customerSetupIntent = async (): Promise<ICustomerSetupIntentResponse> => {

  setLoading(true);
  const payload = {
    CustomerToken: token,
    CustomerId: customerId,
    Name: customerInfo.Firstname + " " + customerInfo.Lastname,
    Email: customerInfo.EmailAddress,
    Phone: customerInfo.MobileNumber,
    deviceDetails: deviceDetails,
  };

  return new Promise<ICustomerSetupIntentResponse>((resolve, reject) => {
    customerSetupIntent(
      payload,
      (data: any) => {
        if (data.StatusCode === '00') {
          resolve(data as ICustomerSetupIntentResponse);
        } else {
          Alert.alert(data.StatusMessage);
          reject(new Error(data.StatusMessage));
          setLoading(false)
        }
      },
      (error: any) => {
        reject(error);
        setLoading(false)
      },
    );
  });
};

const _getWalletInformations = async () => {
  const payload = {
    CustomerToken: token,
    CustomerId: customerId,
    PaymentType: 'card',
    ...deviceDetails,
  };
  customerPaymentMethodList(
    payload,
    (data: any) => {
      let resultData = Object.values(data.Data as Array<any>);
      console.log('resultData:', resultData);
      let postData = Array<ICustomerPaymentInfo>();

      const hasDefault = resultData.filter(item => item.IsDefault === 1);
      console.log('hasDefault:', hasDefault);
      // if (!hasDefault?.length && resultData.length > 0)
      //   return onSetDefaultCard(resultData[0]?.CustomerStripePaymentId);

      resultData.map((card: any) => {
        const {Cards, IsDefault, CustomerStripeId, CustomerStripePaymentId} =
          card;
        const {ExpMonth, ExpYear, Fingerprint, Last4, Brand} = Cards;

        const StripeCustomerInfomation: ICustomerPaymentInfo = {
          CustomerStripeId,
          CustomerStripePaymentId,
          ExpMonth,
          ExpYear,
          Fingerprint,
          Last4,
          Brand,
          IsDefault,
        };
        postData.push(StripeCustomerInfomation);
      });
      setLoading(false)
      return setWalletList(postData);
    },
    (error: any) => {
      console.log('error:', error);
    },
  );
};

const onSetDefaultCard = (CustomerStripePaymentId?: string) => {
  const payload = {
    CustomerToken: token,
    CustomerId: Number(customerId),
    CustomerStripePaymentId:
    CustomerStripePaymentId || selectedCard?.CustomerStripePaymentId,
    DeviceDetails: deviceDetails,
  };

  console.log('setIsDefaultCustomerCard payload:', payload);
  setIsDefaultCustomerCard(
    payload,
    (data: any) => {
      console.log('setIsDefaultCustomerCard data:', data);
      setExpandedKey(() => '');
      _getWalletInformations();
    },
    (err: any) => {
      console.log(' setIsDefaultCustomerCard err:', err);
      _getWalletInformations();
    },
  );
};
  const onRemoveCard = () => {
    const payload = {
      CustomerToken: token,
      CustomerId: Number(customerId),
      CustomerStripePaymentId: selectedCard?.CustomerStripePaymentId,
      DeviceDetails: deviceDetails,
    };

    removeCustomerCard(
      payload,
      (data: any) => {
        console.log('removeCustomerCard data:', data);
        _getWalletInformations();
        setExpandedKey(() => '');
      },
      (err: any) => {
        console.log(' removeCustomerCard err:', err);
      },
    );
  };

  const CardImage = (brand: string, IsDefault: number) => {
    switch (brand) {
      case 'visa': {
        if (!!IsDefault) return <VISA pointerEvents="none" />;
        return <VISA pointerEvents="none" height={40} width={40} />;
      }
      case 'mastercard': {
        if (!!IsDefault) return <MASTERCARD pointerEvents="none" />;
        return <MASTERCARD pointerEvents="none" height={40} width={40} />;
      }
      case 'amex': {
        if (!!IsDefault) return <AMEX pointerEvents="none" />;
        return <AMEX pointerEvents="none" height={40} width={40} />;
      }
      default: {
        if (!!IsDefault) return <MASTERCARD pointerEvents="none" />;
        return <MASTERCARD pointerEvents="none" height={40} width={40} />;
      }
    }
  };

  const CardDetails = (item: ICustomerPaymentInfo) => {
    return (
      <View>
        <Text
          color={v2Colors.green}
          style={{fontSize: !!item.IsDefault ? 18 : 14}}>
          {'XXXX XXXX XXXX '}
          {item.Last4}
        </Text>
      </View>
    );
  };

  const Cards = (item: ICustomerPaymentInfo, index: number) => {
    const {IsDefault} = item;

    return (
      <Collapse
        key={index}
        onToggle={(isExpanded: boolean) => {
          if (isExpanded) {
            setSelectedCard(item);
            setExpandedKey(item.CustomerStripePaymentId);
          }
        }}
        isExpanded={item?.CustomerStripePaymentId === expandedKey}>
        <CollapseHeader>
          <View
            style={
              !!IsDefault ? styles.activeItemContainer : styles.itemContainer
            }>
            <View
              style={
                !!IsDefault ? styles.activeItemContent : styles.itemContent
              }>
              <View style={styles.cardDetails}>
                {CardImage(item.Brand, item.IsDefault)}
                <View style={{width: 30}} />
                {CardDetails(item)}
              </View>
              {!!IsDefault && (
                <GREEN_CHECK_CIRCLE pointerEvents="none"
                  style={{
                    marginTop: 6,
                  }}
                />
              )}
            </View>
          </View>
        </CollapseHeader>
        <CollapseBody>
          <BottomContent />
        </CollapseBody>
      </Collapse>
    );
  };

  const BottomContent = () => (
    <View style={styles.bottomContentContainer}>
      <Pressable
        style={styles.updateButton}
        onPress={() => setShowSetDefaultModal(true)}>
        <Icon
          name="edit"
          size={20}
          type={IconType.Feather}
          color={v2Colors.green}
        />
        <View style={{width: 10}} />
        <Text color={v2Colors.green}>Set as default</Text>
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        style={styles.deleteButton}
        onPress={() => setShowRemoveModal(true)}>
        <Icon name="delete" size={20} type={IconType.Feather} color={'black'} />
        <View style={{width: 10}} />
        <Text color={'black'}>Remove</Text>
      </Pressable>
    </View>
  );

  const SetDefaultModal = () => (
    <CenterModalW2Buttons
      isVisible={showSetDefaultModal}
      setIsVisible={setShowSetDefaultModal}
      onPressYes={onSetDefaultCard}
      text={'Set this card as default?'}
    />
  );

  const RemoveModal = () => (
    <CenterModalW2Buttons
      isVisible={showRemoveModal}
      setIsVisible={setShowRemoveModal}
      onPressYes={onRemoveCard}
      text={'Are you sure you want to remove this card?'}
    />
  );

  return (
    <>
      <HeaderContainer pageTitle={'Wallet'} navigateTo={SCREENS.HOME} />
      <View style={styles.container}>
        {isFetching && <WholeScreenLoader />}
        <ScrollView>
          <View style={{paddingVertical: 10}}>
            {walletList.length > 0 &&
              walletList.map((item, index) => {
                return Cards(item, index);
              })}
          </View>
        </ScrollView>
        <View style={[styles.buttonContainer, buttonBottomPadding]}>
          <CommonButton
            text={ready ? 'Add Card' : 'Loading...'}
            isFetching={loading || presentingRef.current}
            onPress={openPaymentSheetDebounced}
            disabled={!ready || loading || presentingRef.current}
            style={{ borderRadius: 5 }}
          />
        </View>
      </View>
      <SetDefaultModal />
      <RemoveModal />
    </>
  );
};

export default PaymentScreen;
