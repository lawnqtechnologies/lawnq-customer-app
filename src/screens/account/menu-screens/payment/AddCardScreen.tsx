import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Alert, View, Dimensions, ScrollView} from 'react-native';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import {SCREENS} from '@shared-constants';
import {
  CardField,
  ConfirmSetupIntentResult,
  initStripe,
  useStripe,
} from '@stripe/stripe-react-native';
import {useSelector} from 'react-redux';
import * as NavigationService from 'react-navigation-helpers';
import {useTheme} from '@react-navigation/native';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useForm} from 'react-hook-form';
import {useKeyboard} from '@react-native-community/hooks';

import createStyles from './AddCardScreen.style';
import CommonButton from '@shared-components/buttons/CommonButton';
import {v2Colors} from '@theme/themes';
import fonts from '@fonts';
import InputText from '@shared-components/form/InputText/v2/input-text';
import {usePayment} from '@services/hooks/usePayment';
import {useSafeBottomPadding} from 'shared/functions/useSafeBottomInset';
import InAppBrowser from 'react-native-inappbrowser-reborn';

import {RootState} from 'store';

const {height} = Dimensions.get('window');

interface IAddCardScreen {
  route?: any;
}

interface CardInformations {
  brand: string;
  complete: boolean;
  expiryMonth: number;
  expiryYear: number;
  last4: string;
  number: string;
  postalCode: string;
  validCVC: string;
  validExpiryDate: string;
  validNumber: string;
  cvc: string;
}

const AddCardScreen: React.FC<IAddCardScreen> = ({route}) => {
  const {token, customerId, customerInfo, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );

  const [cardInfo, setCardInfo] = useState<CardInformations>();
  const [loading, setLoading] = useState<boolean>(false);
  const pending3DSPayloadRef = useRef<any>(null);

  const keyboard = useKeyboard();
  const {keyboardShown, keyboardHeight} = keyboard;

  const {customerSetupIntent, completeCustomerSetupIntentV2, customerPaymentKey} =
    usePayment();
  const {confirmSetupIntent} = useStripe();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const buttonBottomPadding = useSafeBottomPadding(20);
  const screen = route.params?.screen;

  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
  } = useForm({
    defaultValues: {
      fullName: '',
    },
    resolver: yupResolver(
      yup
        .object({
          fullName: yup.string().required('Full Name is required'),
        })
        .required(),
    ),
  });

  useEffect(() => {
    getStripeKey();
  }, []);

  const _validateCardDetails = async () => {
    if (!cardInfo?.complete) {
      Alert.alert('Please enter your complete card details');
      return false;
    }
    if (cardInfo?.validNumber === 'Invalid') {
      Alert.alert('Invalid card number');
      return false;
    }
    if (cardInfo?.validExpiryDate === 'Invalid') {
      Alert.alert('Invalid expiry date');
      return false;
    }
    if (cardInfo?.validCVC === 'Invalid') {
      Alert.alert('Invalid card details');
      return false;
    }
    return true;
  };

  const getStripeKey = async () => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
    };

    customerPaymentKey(
      payload,
      (data: any) => {
        if (data.StatusCode === '00') {
          let stripeKey = data.Data.find(
            (x: any) => x.StripeKeyName === 'PublishableKey',
          ).StripeKey;
          initStripe({
            publishableKey: stripeKey,
            merchantIdentifier: 'merchant.com.app.lawnq',
            urlScheme: 'app.lawnq',
          });
        } else {
          Alert.alert(data.StatusMessage);
        }
      },
      (error: any) => {
        Alert.alert(`Error Code: ${error.code}`, error.message);
      },
    );
  };

  // Step 1: Create SetupIntent on backend
  const _customerSetupIntent = async () => {
    setLoading(true);
    const isValid = await _validateCardDetails();

    if (!isValid) {
      setLoading(false);
      return;
    }

    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      Name: `${customerInfo.Firstname} ${customerInfo.Lastname}`,
      Email: customerInfo.EmailAddress,
      Phone: customerInfo.MobileNumber,
      DeviceDetails: deviceDetails,
    };

    customerSetupIntent(
      payload,
      (data: any) => {
        if (data.StatusCode === '00') {
          _confirmStripeIntent(data.ClientSecret);
        } else {
          setLoading(false);
          Alert.alert(data.StatusMessage);
        }
      },
      (error: any) => {
        setLoading(false);
        Alert.alert(`Error Code: ${error.code}`, error.message);
      },
    );
  };

  // Step 2: Confirm card with Stripe SDK — SDK handles 3DS automatically
  const _confirmStripeIntent = (clientSecret: string) => {
    const values = getValues();
    confirmSetupIntent(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails: {name: values.fullName},
      },
    }).then((res: ConfirmSetupIntentResult) => {
      if (res.error) {
        if (res.error.code !== 'Canceled') {
          Alert.alert('Payment Error', res.error.message);
        }
        setLoading(false);
      } else if (res.setupIntent?.status === 'Succeeded') {
        const setupIntentId = res.setupIntent.id;
        const paymentMethodId = res.setupIntent.paymentMethod?.id ?? null;
        _completeCustomerSetupIntent(paymentMethodId, setupIntentId);
      } else {
        setLoading(false);
      }
    });
  };

  // Step 3: Complete SetupIntent on backend — backend verifies 3DS status
  const _completeCustomerSetupIntent = (
    paymentId: string | null,
    setupIntentId: string,
  ) => {
    const values = getValues();
    const payload = {
      CustomerToken: token,
      CustomerId: parseInt(customerId),
      SetupIntentId: setupIntentId,
      CustomerStripePaymentId: paymentId,
      CardEmail: customerInfo.EmailAddress,
      Mobile: customerInfo.MobileNumber,
      CardName: values.fullName,
      DeviceDetails: deviceDetails,
    };

    completeCustomerSetupIntentV2(
      payload,
      (data: any) => {
        setLoading(false);
        if (data.StatusCode === '00') {
          Alert.alert('Set Up Wallet', 'Success', [
            {
              onPress: () => NavigationService.navigate(screen),
              text: 'Confirm',
            },
          ]);
        } else if (data.Requires3DSecure === true && data.RedirectUrl) {
          pending3DSPayloadRef.current = payload;
          InAppBrowser.openAuth(data.RedirectUrl, 'app.lawnq://', {
            ephemeralWebSession: false,
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
          }).then((result: any) => {
            pending3DSPayloadRef.current = null;
            if (result.type === 'success' && result.url) {
              const params = new URLSearchParams(result.url.split('?')[1] ?? '');
              if (params.get('redirect_status') === 'succeeded') {
                completeCustomerSetupIntentV2(
                  payload,
                  (d: any) => {
                    setLoading(false);
                    if (d.StatusCode === '00') {
                      Alert.alert('Set Up Wallet', 'Success', [
                        {onPress: () => NavigationService.navigate(screen), text: 'Confirm'},
                      ]);
                    } else {
                      Alert.alert(d.StatusMessage);
                    }
                  },
                  (err: any) => {
                    setLoading(false);
                    Alert.alert(`Error Code: ${err.code}`, err.message);
                  },
                );
              } else {
                setLoading(false);
                Alert.alert('Verification Failed', 'Card setup could not be completed. Please try again.');
              }
            } else {
              setLoading(false);
            }
          }).catch(() => {
            pending3DSPayloadRef.current = null;
            setLoading(false);
            Alert.alert('3D Secure Required', 'Unable to open verification page. Please try again.');
          });
        } else {
          Alert.alert(data.StatusMessage);
        }
      },
      (error: any) => {
        setLoading(false);
        Alert.alert(`Error Code: ${error.code}`, error.message);
      },
    );
  };

  const Separator = () => <View style={{height: 30}} />;
  const Separator2 = () => <View style={{height: 20}} />;

  return (
    <>
      <HeaderContainer
        pageTitle={'Set Up Wallet'}
        navigateTo={SCREENS.PAYMENT}
        hasCancel
        onCancel={() => NavigationService.goBack()}
      />
      <ScrollView
        contentContainerStyle={{paddingHorizontal: 20}}
        style={styles.container}
        keyboardShouldPersistTaps={'never'}
        showsVerticalScrollIndicator={false}>
        <View style={{minHeight: height * 0.67}}>
          <Separator />
          <CardField
            postalCodeEnabled={false}
            placeholders={{number: 'XXXX XXXX XXXX XXXX'}}
            cardStyle={{
              textColor: v2Colors.green,
              fontSize: 16,
              fontFamily: fonts.lexend.regular,
            }}
            style={{
              height: 60,
              borderWidth: 1,
              borderColor: v2Colors.border,
              padding: 10,
              backgroundColor: 'white',
              borderRadius: 7,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.23,
              shadowRadius: 2.62,
              elevation: 4,
            }}
            onCardChange={(cardDetails: any) => setCardInfo(cardDetails)}
          />
          <Separator2 />
          <InputText
            control={control}
            name="fullName"
            label="Enter Full Name of Card Holder"
          />
          {keyboardShown && <View style={{height: keyboardHeight}} />}
        </View>

        <View style={[styles.buttonContainer, buttonBottomPadding]}>
          <CommonButton
            text={'Save'}
            isFetching={loading}
            onPress={handleSubmit(_customerSetupIntent)}
            style={{borderRadius: 5}}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default AddCardScreen;
