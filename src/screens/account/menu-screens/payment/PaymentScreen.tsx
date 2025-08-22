import {useFocusEffect, useTheme} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {createPlatformPayPaymentMethod, initPaymentSheet, initStripe, isPlatformPaySupported, PlatformPay, PlatformPayButton, presentPaymentSheet} from '@stripe/stripe-react-native';
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
import { StripeProvider } from '@stripe/stripe-react-native';

/**
 * ? SVGs
 */
import MASTERCARD from '@assets/v2/payment/images/mastercard.svg';
import VISA from '@assets/v2/payment/images/visa.svg';
import AMEX from '@assets/v2/payment/images/amex.svg';
import GREEN_CHECK_CIRCLE from '@assets/v2/common/icons/green-check-circle.svg';
import {RootState} from 'store';

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
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [pubkey, setPubkey] = useState<string>('');

  useEffect(() => {
    (async function () {
      setIsApplePaySupported(await isPlatformPaySupported());
    })();
  }, [isPlatformPaySupported]);

  useFocusEffect(
    useCallback(() => {
      getStripeKey();
      _getWalletInformations();
    }, []),
  );

  

  const initialisePaymentSheet = async() => {
      //1) first create setup intent on api
    const {ClientSecret, CustomerStripeId,StatusCode,StatusMessage} = await _customerSetupIntent()
      //2) initialize customer intent on stripe
      console.log(StatusCode,StatusMessage,CustomerStripeId)

        if(StatusCode == "00") {
        
      console.log({customerId : CustomerStripeId,
                setupIntentClientSecret: ClientSecret,
                merchantDisplayName: "Lawnq",
                applePay: {
                  merchantCountryCode: 'AU',
                },
                allowsDelayedPaymentMethods: true,})

        const {error} = await initPaymentSheet({
          customerId : CustomerStripeId,
          setupIntentClientSecret: ClientSecret,
          merchantDisplayName: "Lawnq",
          applePay: {
            merchantCountryCode: 'AU',
          },
          allowsDelayedPaymentMethods: true,
        });

        if(error) {
          Alert.alert(`Error code:${error.code}`,error.message);
          setLoading(false);
        }else{
          setReady(true);
          setLoading(false);
          _showPaymentSheet();
        }
      }

  }

  const _showPaymentSheet =  async()  => {
    const {error} = await presentPaymentSheet();
    if(error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      setLoading(false)
      return;
    }else{
      Alert.alert('Success', 'The Subscription was successfully created')
      setLoading(false)
      setReady(false)
    }
  }

  //methods
  // this will get stripe key from the backend
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

  console.log('payload for setupintent')
  console.log(payload)

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

    console.log('----this is always calling----');

    customerPaymentMethodList(
      payload,
      (data: any) => {
        let resultData = Object.values(data.Data as Array<any>);
        console.log('resultData:', resultData);
        let postData = Array<ICustomerPaymentInfo>();

        const hasDefault = resultData.filter(item => item.IsDefault === 1);
        console.log('hasDefault:', hasDefault);
        if (!hasDefault?.length && resultData.length > 0)
          return onSetDefaultCard(resultData[0]?.CustomerStripePaymentId);

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
        setHasFinished(true);
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
        _getWalletInformations();
        setExpandedKey(() => '');
      },
      (err: any) => {
        console.log(' setIsDefaultCustomerCard err:', err);
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
        if (!!IsDefault) return <VISA />;
        return <VISA height={40} width={40} />;
      }
      case 'mastercard': {
        if (!!IsDefault) return <MASTERCARD />;
        return <MASTERCARD height={40} width={40} />;
      }
      case 'amex': {
        if (!!IsDefault) return <AMEX />;
        return <AMEX height={40} width={40} />;
      }
      default: {
        if (!!IsDefault) return <MASTERCARD />;
        return <MASTERCARD height={40} width={40} />;
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
                <GREEN_CHECK_CIRCLE
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
      <TouchableOpacity
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
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setShowRemoveModal(true)}>
        <Icon name="delete" size={20} type={IconType.Feather} color={'black'} />
        <View style={{width: 10}} />
        <Text color={'black'}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const SetDefaultModal = () => (
    <CenterModalW2Buttons
      isVisible={showSetDefaultModal}
      setIsVisible={setShowSetDefaultModal}
      onPressYes={() => {
        onSetDefaultCard;
      }}
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
        <View style={styles.buttonContainer}>
          {/* <CommonButton
            text={'Done'}
            onPress={() => NavigationService.goBack()}
            style={{borderRadius: 5, marginVertical: 5}}
          /> */}
          <StripeProvider publishableKey={pubkey}>
           <CommonButton
            text={'Add Card'}
            // onPress={() =>
            //   NavigationService.navigate(SCREENS.ADD_CARD, {
            //     screen: SCREENS.PAYMENT,
            //   })
            // }
            isFetching={loading}
            onPress={initialisePaymentSheet}
            style={{borderRadius: 5}}
          />
          </StripeProvider>

        </View>
      </View>
  {/* <View >
      {isApplePaySupported && (
        <PlatformPayButton
          onPress={createPaymentMethod}
          type={PlatformPay.ButtonType.SetUp}
          appearance={PlatformPay.ButtonStyle.WhiteOutline}
          style={{
            width: '65%',
            height: 50,
          }}
        />
      )}
    </View> */}
      <SetDefaultModal />
      <RemoveModal />
    </>
  );
};

export default PaymentScreen;
