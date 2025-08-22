import React, {useEffect, useMemo, useState} from 'react';
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

/**
 * ? Local imports
 */
import createStyles from './AddCardScreen.style';
import CommonButton from '@shared-components/buttons/CommonButton';
import {v2Colors} from '@theme/themes';
import fonts from '@fonts';
import InputText from '@shared-components/form/InputText/v2/input-text';
import {usePayment} from '@services/hooks/usePayment';

/**
 * ? SVGs
 */
import CARDS_ILLUSTRATION from '@assets/v2/payment/images/cards-illustration.svg';
import {RootState} from 'store';

/**
 * ? Constants
 */
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
  // redux
  const {token, customerId, customerInfo, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );

  // states
  const [cardInfo, setCardInfo] = useState<CardInformations>();
  const [loading, setLoading] = useState<boolean>(false);

  const keyboard = useKeyboard();
  const {keyboardShown, keyboardHeight} = keyboard;

  // mount
  useEffect(() => {
    // initStripe({
    //   publishableKey:
    //     'pk_test_51KgHWxLJKJldySpiOQ6rXIHW4sL8yT1bMcsJYPOgkyepcm1brX23P5nEvZJTIe2NVRfZuDj2xwWCwOfSfxqWh36d0009igvRBu',
    //   merchantIdentifier: 'merchant.identifier',
    // });
    getStripeKey();
  }, []);

  const {customerSetupIntent, completeCustomerSetupIntent, customerPaymentKey} =
    usePayment();
  const {confirmSetupIntent} = useStripe();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  const _validateCardDetails = async () => {
    let isValid: boolean = true;

    // if (name === "") {
    //   Alert.alert("Card Name is Required");
    //   isValid = false;
    // }

    if (cardInfo?.validNumber === 'Invalid') {
      Alert.alert('Invalid card number');
      isValid = false;
    }

    if (cardInfo?.validExpiryDate === 'Invalid') {
      Alert.alert('Invalid expiry Date');
      isValid = false;
    }

    if (cardInfo?.validCVC === 'Invalid') {
      Alert.alert('Invalid card details');
      isValid = false;
    }

    return isValid;
  };

  const getStripeKey = async () => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
    };

    customerPaymentKey(
      payload,
      (data: any) => {
        // console.log("customerSetupIntent data:", data);
        if (data.StatusCode === '00') {
          setLoading(false);
          data.Data;
          let stipeKey = data.Data.find(
            (x: any) => x.StripeKeyName === 'PublishableKey',
          ).StripeKey;
          console.log('this is the key');
          console.log(stipeKey);
          initStripe({
            publishableKey: stipeKey,
            merchantIdentifier: 'merchant.identifier',
          });
          // _confirmStripeIntent(data.ClientSecret);
        } else {
          Alert.alert(data.StatusMessage);
        }
      },
      (error: any) => {
        Alert.alert(`Error Code: ${error.code}`, error.message);
      },
    );
  };

  const _customerSetupIntent = async () => {
    setLoading(true);
    var isValid = await _validateCardDetails();

    if (isValid === true) {
      const payload = {
        CustomerToken: token,
        CustomerId: customerId,
        deviceDetails: deviceDetails,
      };
      customerSetupIntent(
        payload,
        (data: any) => {
          // console.log("customerSetupIntent data:", data);
          if (data.StatusCode === '00') {
            setLoading(false);
            _confirmStripeIntent(data.ClientSecret);
          } else {
            Alert.alert(data.StatusMessage);
          }
        },
        (error: any) => {
          Alert.alert(`Error Code: ${error.code}`, error.message);
        },
      );
    }
    setLoading(false);
  };

  const _confirmStripeIntent = (ClientSecret: string) => {
    const values = getValues();
    setLoading(true);
    console.log(ClientSecret);
    confirmSetupIntent(ClientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails: {name: values.fullName},
      },
    }).then((res: ConfirmSetupIntentResult) => {
      console.log(res);
      if (res.error) {
        Alert.alert(`Error Code: ${res.error.code}`, res.error.message);
        setLoading(false);
      }
      if (res.setupIntent) {
        _completeCustomerSetupIntent(res.setupIntent.paymentMethodId);
        setLoading(false);
      }
    });
  };

  const _completeCustomerSetupIntent = (PaymentId: string | null) => {
    const values = getValues();

    setLoading(true);
    const payload = {
      CustomerToken: token,
      CustomerId: parseInt(customerId),
      CustomerStripePaymentId: PaymentId,
      CardEmail: customerInfo.EmailAddress,
      Mobile: customerInfo.MobileNumber,
      CardName: values.fullName,
      DeviceDetails: deviceDetails,
    };

    console.log('completeCustomerSetupIntent payload:', payload);
    completeCustomerSetupIntent(
      payload,
      (data: any) => {
        console.log('completeCustomerSetupIntent data:', data);
        setLoading(false);
        if (data.StatusCode === '00') {
          Alert.alert('Set Up Wallet', 'Success', [
            {
              onPress: () => {
                NavigationService.navigate(screen);
              },
              text: 'Confirm',
            },
          ]);
          setLoading(false);
        } else {
          Alert.alert(data.StatusMessage);
          setLoading(false);
        }
      },
      (error: any) => {
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
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        style={styles.container}
        keyboardShouldPersistTaps={'never'}
        showsVerticalScrollIndicator={false}>
        <View style={{minHeight: height * 0.67}}>
          {/* <CARDS_ILLUSTRATION
            height={height * 0.32}
            style={{alignSelf: 'center'}}
          /> */}

          <Separator />
          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: 'XXXX XXXX XXXX XXXX',
            }}
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
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.23,
              shadowRadius: 2.62,
              elevation: 4,
            }}
            onCardChange={(cardDetails: any) => {
              setCardInfo(cardDetails);
            }}
          />

          <Separator2 />
          <InputText
            control={control}
            name="fullName"
            label="Enter Full Name of Card Holder"
          />
          {keyboardShown && <View style={{height: keyboardHeight}} />}
        </View>

        <View style={styles.buttonContainer}>
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
