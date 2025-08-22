import React, {useMemo, useState} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Modal from 'react-native-modal';
import GestureRecognizer from 'react-native-swipe-gestures';
import * as NavigationService from 'react-navigation-helpers';
import {useDispatch, useSelector} from 'react-redux';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import * as Progress from 'react-native-progress';

/**
 * ? Local imports
 */
import createStyles from './SummaryModal.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CommonButton from '@shared-components/buttons/CommonButton';
import {SCREENS} from '@shared-constants';
import {v2Colors} from '@theme/themes';

import {useBooking} from '@services/hooks/useBooking';

/**
 * ? SVGs
 */
import LikeGreenCircle from '@assets/v2/homescreen/icons/like-green-circle.svg';
import Calendar from '@assets/v2/homescreen/icons/calendar.svg';
import HouseProperty from '@assets/v2/homescreen/icons/house-property.svg';
import MowerGreen from '@assets/v2/homescreen/icons/mower-green.svg';

import VISA from '@assets/v2/payment/images/cards-illustration.svg';
import CHEVRON_RIGHT from '@assets/v2/list/chevron-right.svg';
import {RootState} from 'store';
import {
  onSetBookingItem,
  onSetBookingPayment,
  onSetBookingRefNo,
  onSetFee,
} from '@services/states/booking/booking.slice';
import {usePayment} from '@services/hooks/usePayment';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  title?: string;
  data: {
    date: string;
    serviceName: number;
    name: string;
    fee: string;
    discountName: string;
    totalDiscount: string;
    customerDiscountId: number;
    collectClippings: number;
  };
  payload: any;
  queue: string;
  defaultCard: ICustomerPaymentInfo | undefined;
}

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

const BottomModal: React.FC<IBottomModalScreenProps> = ({
  isVisible,
  setIsVisible,
  title,
  data,
  payload,
  queue,
  defaultCard,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  const ONE_SECOND_IN_MS = 1000;

  const PATTERN = [
    1 * ONE_SECOND_IN_MS,
    2 * ONE_SECOND_IN_MS,
    3 * ONE_SECOND_IN_MS,
  ];

  /**
|--------------------------------------------------
| Hooks
|--------------------------------------------------
*/
  const {saveBooking, saveScheduledBooking} = useBooking();

  /**
|--------------------------------------------------
| Redux
|--------------------------------------------------
*/
  const {token, customerId, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );

  const {lawnURIList, property, rawDate, selectedServiceTypeId} = useSelector(
    (state: RootState) => state.booking,
  );

  const {createPaymentIntent} = usePayment();
  /**
|--------------------------------------------------
| Effects
|--------------------------------------------------
*/

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isPaymentProcessing, setIsPaymentProcessing] =
    useState<boolean>(false);

  const handleSubmit = () => {
    Vibration.vibrate();
    // _validatePayment();
    setIsFetching(true);
    if (queue === 'later') {
      onSaveScheduledBooking();
    } else {
      onSaveBookingToday();
    }
  };

  /**
  |--------------------------------------------------
  | Payment Creations
  |--------------------------------------------------
  */

  const _createPaymentIntent = (BookingRefNo: string, Action: string) => {
    setIsPaymentProcessing(true);
    const request = {
      CustomerToken: token,
      CustomerId: parseInt(customerId),
      Amount: data.fee,
      PaymentCustomerId: defaultCard?.CustomerStripeId || '',
      PaymentCustomerMethodId: defaultCard?.CustomerStripePaymentId || '',
      BookingRefNo,
      DeviceDetails: deviceDetails,
    };

    createPaymentIntent(
      request,
      (data: any) => {
        if (data?.StatusCode === '00') {
          setIsFetching(false);
          setIsVisible(false);
          setIsPaymentProcessing(false);
          // if (Action === 'BookingToday') {
          //   NavigationService.push(SCREENS.SEARCH_SERVICE_PROVIDERS);
          // }

          if (Action === 'BookLater') {
            NavigationService.push(SCREENS.SEARCH_SCHEDULE_SERVICE_PROVIDERS);
          }
        }
        if (data?.StatusCode === '01') {
          Alert.alert(data?.StatusMessage);
          setIsPaymentProcessing(false);
        }
      },
      () => {
        console.log('_createPaymentIntent error false');
        setIsPaymentProcessing(false);
      },
    );
  };

  /**
  |--------------------------------------------------
  | Booking Creations
  |--------------------------------------------------
  */

  const onSaveOnDemandBooking = async () => {
    let payloadNew = payload;
    payloadNew.append(
      'CustomerStripePaymentId',
      defaultCard?.CustomerStripePaymentId,
    );
    payloadNew.append('CustomerDiscountId', data.customerDiscountId ?? 0);
    console.log('onSaveOnDemandBooking payload:', JSON.stringify(payload));

    saveBooking(
      payloadNew,
      async (saveBookingData: any) => {
        if (saveBookingData[0].StatusCode === '01') {
          if (saveBookingData[0]?.StatusMessage?.length) {
            Alert.alert(saveBookingData[0]?.StatusMessage);
          }
          setIsFetching(false);
          return;
        }
        const item = saveBookingData[0].Data[0];
        const {BookingRefNo} = item;
        dispatch(onSetBookingRefNo(BookingRefNo));

        dispatch(onSetFee(data.fee));
        dispatch(onSetBookingItem(item));

        // - dispatch payment details before navigate to search provider screen
        const request = {
          customerId: parseInt(customerId),
          amount: parseFloat(data.fee),
          paymentCustomerId: defaultCard?.CustomerStripeId,
          paymentCustomerMehodId: defaultCard?.CustomerStripePaymentId,
          bookingRefNo: BookingRefNo,
        };

        onSetBookingPayment(request);
        setIsPaymentProcessing(true);
        _createPaymentIntent(BookingRefNo, 'BookingToday');
      },
      error => {
        console.log('onSaveOnDemandBooking error:', error);
        setIsFetching(false);
      },
    );
  };

  const onSaveScheduledBooking = async () => {
    const lawnImageRequest = async () => {
      if (lawnURIList.length > 0) {
        for (let i = 0; i < lawnURIList.length; i++) {
          return request.append('LawnImages', lawnURIList[i]);
        }
      } else {
        return request.append('LawnImages', []);
      }
    };

    const payloadObject = Object.fromEntries(payload?._parts || []);
    const {
      Cost,
      TotalCost,
      GSTFee,
      StripeCommissionFee,
      GrassLengthId,
      MowLengthId,
    } = payloadObject;

    let request = new FormData();
    request.append('CustomerToken', token);
    request.append('CustomerId', customerId);
    await lawnImageRequest();
    request.append('AddressId', property.value);
    request.append('ServiceProviderId', 0);

    request.append('Cost', Cost);
    request.append('TotalCost', TotalCost);
    request.append('GSTFee', GSTFee);
    request.append('StripeCommissionFee', StripeCommissionFee);

    request.append('BookingServiceStepId', selectedServiceTypeId);
    request.append('BookingTypeId', 2);
    request.append('Remarks', 'Empty');
    request.append('GrassLengthId', GrassLengthId || '1');
    request.append('MowLengthId', MowLengthId);
    request.append('BookingServiceTypeId', selectedServiceTypeId || 0);
    request.append(
      'CustomerStripePaymentId',
      defaultCard?.CustomerStripePaymentId || '',
    );
    request.append('CustomerDiscountId', data.customerDiscountId ?? 0);
    request.append('PropertyAddId', property.value);
    request.append('Scheduledate', JSON.parse(rawDate));
    request.append('DeviceDetails.AppVersion', deviceDetails.AppVersion);
    request.append('DeviceDetails.DeviceModel', deviceDetails.DeviceModel);
    request.append('DeviceDetails.DeviceVersion', deviceDetails.DeviceVersion);
    request.append('DeviceDetails.IpAddress', deviceDetails.IpAddress);
    request.append('DeviceDetails.MacAddress', deviceDetails.MacAddress);
    request.append('DeviceDetails.Platform', deviceDetails.Platform);
    request.append('DeviceDetails.PlatformOs', deviceDetails.PlatformOs);

    saveScheduledBooking(
      request,
      (data: any) => {
        if (data.StatusCode === '01') {
          Alert.alert(data.StatusMessage);
          return;
        }
        if (data.StatusCode === '00') {
          dispatch(onSetBookingRefNo(data.BookingRefNo));
          _createPaymentIntent(data.BookingRefNo, 'BookLater');
        }
      },
      (err: any) => {
        console.log('error');
        console.log(err);
      },
    );
  };

  const getCurrentDateTime = () => {
    const now = new Date();

    // Pad with leading zeros
    const padWithZero = (num: number) => num.toString().padStart(2, '0');

    // Get individual parts
    const year = now.getFullYear();
    const month = padWithZero(now.getMonth() + 1); // Months are zero-based
    const day = padWithZero(now.getDate());
    const hours = padWithZero(now.getHours());
    const minutes = padWithZero(now.getMinutes());
    const seconds = padWithZero(now.getSeconds());
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); // Ensure 3 digits for milliseconds

    // Construct the formatted date-time string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const onSaveBookingToday = () => {
    const payloadObject = Object.fromEntries(payload?._parts || []);
    const {
      Cost,
      TotalCost,
      GSTFee,
      StripeCommissionFee,
      GrassLengthId,
      MowLengthId,
    } = payloadObject;

    let request = new FormData();
    request.append('CustomerToken', token);
    request.append('CustomerId', customerId);
    for (let i = 0; i < lawnURIList.length; i++) {
      request.append('LawnImages', lawnURIList[i]);
    }
    request.append('AddressId', property.value);
    request.append('ServiceProviderId', 0);

    request.append('Cost', Cost);
    request.append('TotalCost', TotalCost);
    request.append('GSTFee', GSTFee);
    request.append('StripeCommissionFee', StripeCommissionFee);

    request.append('BookingServiceStepId', selectedServiceTypeId);
    request.append('BookingTypeId', 1);
    request.append('Remarks', 'Empty');
    request.append('GrassLengthId', GrassLengthId || '1');
    request.append('MowLengthId', MowLengthId);
    request.append('BookingServiceTypeId', selectedServiceTypeId || 0);
    request.append(
      'CustomerStripePaymentId',
      defaultCard?.CustomerStripePaymentId || '',
    );
    request.append('CustomerDiscountId', data.customerDiscountId ?? 0);
    request.append('CollectClippings', data.collectClippings ?? 0);
    request.append('PropertyAddId', property.value);
    request.append('Scheduledate', new Date().toISOString());
    request.append('DeviceDetails.AppVersion', deviceDetails.AppVersion);
    request.append('DeviceDetails.DeviceModel', deviceDetails.DeviceModel);
    request.append('DeviceDetails.DeviceVersion', deviceDetails.DeviceVersion);
    request.append('DeviceDetails.IpAddress', deviceDetails.IpAddress);
    request.append('DeviceDetails.MacAddress', deviceDetails.MacAddress);
    request.append('DeviceDetails.Platform', deviceDetails.Platform);
    request.append('DeviceDetails.PlatformOs', deviceDetails.PlatformOs);

    saveScheduledBooking(
      request,
      (data: any) => {
        console.log('---response after saving');
        console.log(data);
        if (data.StatusCode === '01') {
          Alert.alert(data.StatusMessage);
          return;
        }
        if (data.StatusCode === '00') {
          dispatch(onSetBookingRefNo(data.BookingRefNo));
          // _createPaymentIntent(data.BookingRefNo, 'BookLater');
        }
      },
      (err: any) => {
        console.log('error');
        console.log(err);
      },
    );
  };

  const closeSummaryModal = () => {
    setIsVisible(false);
    setIsFetching(false);
    setIsPaymentProcessing(false);
  };

  const CardContent = () => {
    console.log(defaultCard?.CustomerStripePaymentId);
    if (defaultCard?.CustomerStripePaymentId !== undefined) {
      return (
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => {
            setIsVisible(() => false);
            setTimeout(() => NavigationService.navigate(SCREENS.PAYMENT), 300);
          }}>
          <View style={styles.cardLeftContent}>
            <VISA height={40} width={40} />
            <View style={styles.cardMiddleContent}>
              <Text bold color={v2Colors.green}>
                {`${defaultCard?.Brand}`}
              </Text>
              <Text
                color={
                  v2Colors.green
                }>{`XXXX XXXX XXXX ${defaultCard?.Last4}`}</Text>
            </View>
          </View>
          <CHEVRON_RIGHT />
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={{marginVertical: 20}}>
          <Text style={{fontSize: 12}} color={v2Colors.orange}>
            Note: The final price will vary slightly based on your payment
            method and will be shown after setup.
          </Text>
        </View>
      );
    }
  };

  /**
|--------------------------------------------------
| Render Components
|--------------------------------------------------
*/
  const Content = () => (
    <View style={styles.content}>
      <TouchableOpacity style={styles.closeButton} onPress={closeSummaryModal}>
        <Icon
          name="close"
          type={IconType.MaterialIcons}
          color={v2Colors.lightRed}
          size={25}
        />
      </TouchableOpacity>
      <LikeGreenCircle height={75} width={75} style={styles.icon} />
      {isFetching ? <Header2 /> : <Header />}

      <View style={styles.body}>
        <Item icon={<Calendar height={24} width={24} />} text={data?.date} />
        <Item
          icon={<HouseProperty height={24} width={24} />}
          text={data?.name}
        />
        <Item
          icon={<MowerGreen height={24} width={24} />}
          text={
            data.serviceName === 1
              ? 'Trim - Edge - Mow - Blow'
              : data.serviceName === 2
                ? 'Trim - Edge - Mulch - Blow'
                : 'Trim - Edge - Mow - Blow'
          }
        />
        {data.customerDiscountId !== 0 && (
          <>
            <View style={styles.discountTitle}>
              <Text
                style={{fontSize: 12, margin: 2, fontWeight: 'bold'}}
                color={'white'}>
                {data.discountName}
              </Text>
            </View>
            <View style={styles.discountDetail}>
              <Text h4 color={v2Colors.green}>
                You Saved
              </Text>
              <Text h4 bold color={v2Colors.green}>
                {'$' + data.totalDiscount || ''}
              </Text>
            </View>
          </>
        )}

        <View style={styles.serviceContainer}>
          <Text h4 color={v2Colors.green}>
            Total Cost
          </Text>
          <Text h4 bold color={v2Colors.green}>
            {'$' + data.fee || ''}
          </Text>
        </View>

        {/* <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => {
            setIsVisible(() => false);
            setTimeout(() => NavigationService.navigate(SCREENS.PAYMENT), 300);
          }}>
          <View style={styles.cardLeftContent}>
            <VISA height={40} width={40} />
            <View style={styles.cardMiddleContent}>
              <Text bold color={v2Colors.green}>
                {`${defaultCard?.Brand}`}
              </Text>
              <Text
                color={
                  v2Colors.green
                }>{`XXXX XXXX XXXX ${defaultCard?.Last4}`}</Text>
            </View>
          </View>
          <CHEVRON_RIGHT />
        </TouchableOpacity> */}
        <CardContent />
      </View>
      <ConditionalConfirm />
    </View>
  );

  const Item = (props: {icon: JSX.Element; text: string}) => {
    return (
      <View style={styles.item}>
        {props.icon}
        <View style={{width: 20}} />
        <Text h5 color={v2Colors.green}>
          {props.text}
        </Text>
      </View>
    );
  };

  const Header = () => (
    <View style={styles.header}>
      <Text h3 bold color={v2Colors.green}>
        {title}
      </Text>
    </View>
  );

  const Header2 = () => (
    <View style={styles.header}>
      <View style={{marginBottom: 10}}>
        <Text h3 bold color={v2Colors.green}>
          Processing Booking
        </Text>
      </View>
      <Progress.Bar
        animated={true}
        borderColor={v2Colors.green}
        color={v2Colors.orange}
        animationType="timing"
        progress={1}
        indeterminate={true}
        borderWidth={0}
        width={200}
        indeterminateAnimationDuration={1000}
      />
    </View>
  );

  const Confirm = () => (
    <View style={styles.buttonContainer}>
      <CommonButton
        text={'Secure Booking'}
        onPress={() => handleSubmit()}
        style={{borderRadius: 5}}
        isFetching={isFetching}
        disabled={isFetching}
      />
    </View>
  );

  const ConditionalConfirm = () => {
    if (defaultCard?.CustomerStripePaymentId !== undefined) {
      return (
        <View style={styles.buttonContainer}>
          <CommonButton
            text={'Secure Booking'}
            onPress={() => handleSubmit()}
            style={{borderRadius: 5}}
            isFetching={isFetching}
            disabled={isFetching}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.buttonContainer}>
          <CommonButton
            text={'Add Payment Method'}
            onPress={addWalletAndRedirect}
            style={{borderRadius: 5}}
            isFetching={isFetching}
            disabled={isFetching}
          />
        </View>
      );
    }
  };

  const addWalletAndRedirect = () => {
    setIsVisible(false);
    NavigationService.navigate(SCREENS.PAYMENT);
  };

  // NavigationService.navigate(SCREENS.PAYMENT);

  return (
    <GestureRecognizer onSwipeDown={() => setIsVisible(false)}>
      <Modal
        isVisible={isVisible}
        swipeDirection="down"
        style={styles.modal}
        animationOut="slideOutDown"
        animationInTiming={500}
        animationOutTiming={500}
        useNativeDriver
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}>
        <Content />
      </Modal>
    </GestureRecognizer>
  );
};

export default BottomModal;
