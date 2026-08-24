import {useTheme,useIsFocused,useRoute} from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
  Pressable,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  PlatformPay,
  initPaymentSheet,
  initStripe,
  presentPaymentSheet,
  useStripe,
} from '@stripe/stripe-react-native';
import {usePayment} from '@services/hooks/usePayment';
import * as NavigationService from 'react-navigation-helpers';
import _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

import createStyles from './PaymentScreen.style';
import {onSetPreferredPaymentMethod} from '@services/states/booking/booking.slice';
import {v2Colors} from '@theme/themes';
import Text from '@shared-components/text-wrapper/TextWrapper';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import {SCREENS} from '@shared-constants';
import CommonButton from '@shared-components/buttons/CommonButton';
import WholeScreenLoader from '@shared-components/loaders/WholeScreenLoader';
import CenterModalW2Buttons from '@shared-components/modals/center-modal/with-2-buttons';
import {useSafeBottomPadding} from 'shared/functions/useSafeBottomInset';
import {
  assertStripePublishableKeySafeForCurrentBuild,
  getStripeClientSecret,
  getStripeCardSetupErrorMessage,
  isSetupIntentSucceeded,
  isStripeUserCancellation,
  STRIPE_CURRENCY_CODE,
  STRIPE_MERCHANT_IDENTIFIER,
  STRIPE_MERCHANT_NAME,
  STRIPE_MERCHANT_COUNTRY_CODE,
  STRIPE_PLATFORM_PAY_TEST_ENV,
  STRIPE_URL_SCHEME,
} from '@services/stripe/stripe.helpers';

/**
 * ? SVGs
 */
import MASTERCARD from '@assets/v2/payment/images/mastercard.svg';
import VISA from '@assets/v2/payment/images/visa.svg';
import AMEX from '@assets/v2/payment/images/amex.svg';
import GREEN_CHECK_CIRCLE from '@assets/v2/common/icons/green-check-circle.svg';
import {RootState} from 'store';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;
const CARD_SETUP_ERROR_TITLE = 'Card Setup Issue';
const CARD_SETUP_ERROR_MESSAGE =
  "We couldn't save this card. Please try again or use another card.";
const CARD_SETUP_PREPARE_ERROR_MESSAGE =
  "We couldn't prepare card setup right now. Please try again.";

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
  const {
    confirmPlatformPaySetupIntent,
    handleURLCallback,
    isPlatformPaySupported,
  } = useStripe();
  const route = useRoute<any>();
  const returnOnSelect = Boolean(route.params?.returnOnSelect);
  const dispatch = useDispatch();

  /**
   * ? Hooks
   */
  const {
    customerPaymentMethodList,
    setIsDefaultCustomerCard,
    removeCustomerCard,
    customerPaymentKey,
    customerSetupIntent,
    completeCustomerSetupIntentV2,
  } = usePayment();

  useEffect(() => {
    const handleDeepLink = async ({url}: {url: string}) => {
      if (url) {
        await handleURLCallback(url);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) handleURLCallback(url);
    });

    return () => subscription.remove();
  }, [handleURLCallback]);

  /**
   * ? Redux States
   */
  const {token, customerId,deviceDetails,customerInfo} = useSelector(
    (state: RootState) => state.user,
  );

  /**
   * ? States
   */
  const [isFetching] = useState<boolean>(false);
  const [walletList, setWalletList] = useState<Array<ICustomerPaymentInfo>>([]);
  const [selectedCard, setSelectedCard] = useState<ICustomerPaymentInfo>();
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string>();
  const [ready, setReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlatformPayAvailable, setIsPlatformPayAvailable] =
    useState<boolean>(false);
  

  /**
   * ? Refs
   */
  const initializedRef = useRef(false);  // ✅ prevents multiple init
  const presentingRef  = useRef(false);  // ✅ prevents double present

  const getPaymentSheetWalletParams = () => {
    if (Platform.OS === 'ios') {
      return {
        applePay: {
          merchantCountryCode: STRIPE_MERCHANT_COUNTRY_CODE,
        },
      };
    }

    if (Platform.OS === 'android') {
      return {
        googlePay: {
          merchantCountryCode: STRIPE_MERCHANT_COUNTRY_CODE,
          currencyCode: STRIPE_CURRENCY_CODE,
          testEnv: STRIPE_PLATFORM_PAY_TEST_ENV,
        },
      };
    }

    return {};
  };

  const getPlatformPayName = () =>
    Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay';

  const getPlatformPaySetupParams = (): PlatformPay.ConfirmParams => {
    if (Platform.OS === 'ios') {
      return {
        applePay: {
          merchantCountryCode: STRIPE_MERCHANT_COUNTRY_CODE,
          currencyCode: STRIPE_CURRENCY_CODE,
          merchantCapabilities: [
            PlatformPay.ApplePayMerchantCapability.Supports3DS,
          ],
          cartItems: [
            {
              label: STRIPE_MERCHANT_NAME,
              amount: '0.00',
              paymentType: PlatformPay.PaymentType.Immediate,
            },
          ],
        },
      };
    }

    return {
      googlePay: {
        testEnv: STRIPE_PLATFORM_PAY_TEST_ENV,
        merchantName: STRIPE_MERCHANT_NAME,
        merchantCountryCode: STRIPE_MERCHANT_COUNTRY_CODE,
        currencyCode: STRIPE_CURRENCY_CODE,
      },
    };
  };

  const updatePlatformPayAvailability = async () => {
    try {
      const supported = await isPlatformPaySupported(
        Platform.OS === 'android'
          ? {googlePay: {testEnv: STRIPE_PLATFORM_PAY_TEST_ENV}}
          : undefined,
      );

      setIsPlatformPayAvailable(supported);
    } catch {
      setIsPlatformPayAvailable(false);
    }
  };

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
      ...getPaymentSheetWalletParams(),
    });
    console.log('initPaymentSheet error:', error);
    if (error) {
      setReady(false);
      initializedRef.current = false;
      Alert.alert(
        CARD_SETUP_ERROR_TITLE,
        getStripeCardSetupErrorMessage(error, CARD_SETUP_PREPARE_ERROR_MESSAGE),
      );
    } else {
      setReady(true);
      initializedRef.current = true;
    }
  } catch (e: any) {
    setReady(false);
    initializedRef.current = false;
    Alert.alert(
      CARD_SETUP_ERROR_TITLE,
      getStripeCardSetupErrorMessage(e, CARD_SETUP_PREPARE_ERROR_MESSAGE),
    );
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
      console.log('PaymentSheet error:', error);
      if (error.code !== 'Canceled') {
        // Delay showing an Alert a bit (see #③ below)
        setTimeout(() => {
          Alert.alert(
            CARD_SETUP_ERROR_TITLE,
            getStripeCardSetupErrorMessage(error, CARD_SETUP_ERROR_MESSAGE),
          );
        }, 250);

        NavigationService.replace(SCREENS.PAYMENT);

      }
    } else if (returnOnSelect) {
      setTimeout(() => {
        NavigationService.goBack();
      }, 250);
    } else {
      setTimeout(() => {
        Alert.alert('Success', 'Your card has been saved!');
      }, 250);
    }
  } finally {
    presentingRef.current = false;
    setReady(true);
    setLoading(false);
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
        try {
          const stipeKey = assertStripePublishableKeySafeForCurrentBuild(
            data.Data.find((x: any) => x.StripeKeyName === 'PublishableKey')
              ?.StripeKey,
          );
          await initStripe({
            publishableKey: stipeKey,
            merchantIdentifier: STRIPE_MERCHANT_IDENTIFIER,
            urlScheme: STRIPE_URL_SCHEME,
          });
          await updatePlatformPayAvailability();
          await initializePaymentSheet(); // make sure we await this
        } catch (error: any) {
          Alert.alert(
            CARD_SETUP_ERROR_TITLE,
            getStripeCardSetupErrorMessage(
              error,
              CARD_SETUP_PREPARE_ERROR_MESSAGE,
            ),
          );
        }
      } else {
        Alert.alert(
          CARD_SETUP_ERROR_TITLE,
          getStripeCardSetupErrorMessage(
            data,
            CARD_SETUP_PREPARE_ERROR_MESSAGE,
          ),
        );
      }
    },
    (error: any) => {
      Alert.alert(
        CARD_SETUP_ERROR_TITLE,
        getStripeCardSetupErrorMessage(
          error,
          CARD_SETUP_PREPARE_ERROR_MESSAGE,
        ),
      );
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
          Alert.alert(
            CARD_SETUP_ERROR_TITLE,
            getStripeCardSetupErrorMessage(data, CARD_SETUP_ERROR_MESSAGE),
          );
          reject(new Error(CARD_SETUP_ERROR_MESSAGE));
          setLoading(false)
        }
      },
      (error: any) => {
        Alert.alert(
          CARD_SETUP_ERROR_TITLE,
          getStripeCardSetupErrorMessage(error, CARD_SETUP_ERROR_MESSAGE),
        );
        reject(error);
        setLoading(false)
      },
    );
  });
};

const completePlatformPaySetup = (
  paymentMethodId: string | null,
  setupIntentId: string,
) =>
  new Promise<void>((resolve, reject) => {
    const payload = {
      CustomerToken: token,
      CustomerId: parseInt(customerId),
      SetupIntentId: setupIntentId,
      CustomerStripePaymentId: paymentMethodId,
      CardEmail: customerInfo.EmailAddress,
      Mobile: customerInfo.MobileNumber,
      CardName: `${customerInfo.Firstname} ${customerInfo.Lastname}`,
      DeviceDetails: deviceDetails,
    };

    completeCustomerSetupIntentV2(
      payload,
      (data: any) => {
        if (data.StatusCode === '00') {
          resolve();
          return;
        }

        reject(data);
      },
      reject,
    );
  });

const onSelectPlatformPay = () => {
  setupPlatformPay();
};

const setupPlatformPay = async () => {
  if (loading || presentingRef.current) return;

  if (!isPlatformPayAvailable) {
    Alert.alert(
      `${getPlatformPayName()} Unavailable`,
      `${getPlatformPayName()} is not available on this device.`,
    );
    return;
  }

  presentingRef.current = true;
  setLoading(true);

  try {
    const setupIntentResponse = await _customerSetupIntent();
    const clientSecret =
      getStripeClientSecret(setupIntentResponse) || setupIntentResponse.ClientSecret;

    if (!clientSecret) {
      Alert.alert(
        CARD_SETUP_ERROR_TITLE,
        "We couldn't start wallet setup. Please try again.",
      );
      return;
    }

    const result = await confirmPlatformPaySetupIntent(
      clientSecret,
      getPlatformPaySetupParams(),
    );

    if (result.error) {
      if (!isStripeUserCancellation(result.error.code)) {
        Alert.alert(
          CARD_SETUP_ERROR_TITLE,
          getStripeCardSetupErrorMessage(result.error, CARD_SETUP_ERROR_MESSAGE),
        );
      }
      return;
    }

    const setupIntent = result.setupIntent;

    if (!setupIntent || !isSetupIntentSucceeded(setupIntent.status)) {
      Alert.alert(
        CARD_SETUP_ERROR_TITLE,
        "Wallet setup was not completed. Please try again.",
      );
      return;
    }

    const paymentMethodId =
      setupIntent.paymentMethod?.id ||
      setupIntent.paymentMethodId ||
      null;

    await completePlatformPaySetup(paymentMethodId, setupIntent.id);
    _getWalletInformations();

    if (returnOnSelect) {
      dispatch(onSetPreferredPaymentMethod('platformPay'));
      NavigationService.goBack();
    } else {
      Alert.alert('Set Up Wallet', `${getPlatformPayName()} has been added.`);
    }
  } catch (error: any) {
    Alert.alert(
      CARD_SETUP_ERROR_TITLE,
      getStripeCardSetupErrorMessage(error, CARD_SETUP_ERROR_MESSAGE),
    );
  } finally {
    presentingRef.current = false;
    setLoading(false);
  }
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
      // console.log('resultData:', resultData);
      let postData = Array<ICustomerPaymentInfo>();

      const hasDefault = resultData.filter(item => item.IsDefault === 1);
      // console.log('hasDefault:', hasDefault);
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

const onSetDefaultCard = (
  CustomerStripePaymentId?: string,
  onDone?: () => void,
) => {
  const targetId = CustomerStripePaymentId || selectedCard?.CustomerStripePaymentId;
  const payload = {
    CustomerToken: token,
    CustomerId: Number(customerId),
    CustomerStripePaymentId: targetId,
    DeviceDetails: deviceDetails,
  };

  setSettingDefaultId(targetId);
  console.log('setIsDefaultCustomerCard payload:', payload);
  setIsDefaultCustomerCard(
    payload,
    (data: any) => {
      console.log('setIsDefaultCustomerCard data:', data);
      setSettingDefaultId(undefined);
      _getWalletInformations();
      onDone?.();
    },
    (err: any) => {
      console.log(' setIsDefaultCustomerCard err:', err);
      setSettingDefaultId(undefined);
      _getWalletInformations();
      onDone?.();
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
    const isSettingThisDefault =
      settingDefaultId === item.CustomerStripePaymentId;

    return (
      <Pressable
        key={index}
        disabled={!!settingDefaultId}
        style={({pressed}) => [
          !!IsDefault ? styles.activeItemContainer : styles.itemContainer,
          pressed && !IsDefault ? {opacity: 0.5} : null,
        ]}
        onPress={() => {
          if (settingDefaultId) return;

          if (!!IsDefault) {
            if (returnOnSelect) {
              NavigationService.goBack();
            }
            return;
          }

          setSelectedCard(item);
          onSetDefaultCard(item.CustomerStripePaymentId, () => {
            if (returnOnSelect) {
              NavigationService.goBack();
            }
          });
        }}>
        <View
          style={
            !!IsDefault ? styles.activeItemContent : styles.itemContent
          }>
          <View style={styles.cardDetails}>
            {CardImage(item.Brand, item.IsDefault)}
            <View style={{width: 30}} />
            {CardDetails(item)}
          </View>
          <View style={styles.rowActions}>
            {isSettingThisDefault && (
              <ActivityIndicator
                size="small"
                color={v2Colors.green}
                style={{marginRight: 6}}
              />
            )}
            {!isSettingThisDefault && !!IsDefault && (
              <GREEN_CHECK_CIRCLE pointerEvents="none" style={{marginRight: 6}} />
            )}
            <Pressable
              style={styles.removeIconButton}
              hitSlop={8}
              onPress={() => {
                setSelectedCard(item);
                setShowRemoveModal(true);
              }}>
              <Icon
                name="trash-2"
                size={18}
                type={IconType.Feather}
                color={v2Colors.gray}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  const WalletPayAvailabilityRow = () => {
    if (!isPlatformPayAvailable) return null;

    const platformPayName = getPlatformPayName();

    return (
      <Pressable
        style={styles.walletPayContainer}
        onPress={onSelectPlatformPay}
        disabled={
          returnOnSelect
            ? loading || presentingRef.current
            : !ready || loading || presentingRef.current
        }>
        <View style={styles.walletPayContent}>
          <View style={styles.walletPayIconContainer}>
            <Icon
              name={Platform.OS === 'ios' ? 'apple' : 'google'}
              size={24}
              type={IconType.FontAwesome}
              color={v2Colors.green}
            />
          </View>
          <View style={styles.walletPayTextContainer}>
            <Text color={v2Colors.green} style={styles.walletPayTitle}>
              {platformPayName}
            </Text>
            <Text color={v2Colors.gray} style={styles.walletPaySubtitle}>
              Available on this device
            </Text>
          </View>
          <Icon
            name="chevron-right"
            size={24}
            type={IconType.Feather}
            color={v2Colors.green}
          />
        </View>
      </Pressable>
    );
  };

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
            <WalletPayAvailabilityRow />
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
      <RemoveModal />
    </>
  );
};

export default PaymentScreen;
