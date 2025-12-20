import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Alert,
  Vibration,
  ActivityIndicator,
  Animated,
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
import createStyles from './RescheduleSummary.style';
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
import {onSetBookingRefNo} from '@services/states/booking/booking.slice';
import Loader from '@shared-components/loaders/loader';
import {usePayment} from '@services/hooks/usePayment';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  title?: string;
  payload: any;
  queue: string;
  defaultCard: ICustomerPaymentInfo | undefined;
  totalCost: number;
  scheduleDate: string;
  serviceType: number;
  propertyName: string;
  formatedRescheduleDate: string;
  oldBookingRefNo: string;
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

const RescheduleModal: React.FC<IBottomModalScreenProps> = ({
  isVisible,
  setIsVisible,
  title,
  payload,
  queue,
  defaultCard,
  totalCost,
  scheduleDate,
  serviceType,
  propertyName,
  formatedRescheduleDate,
  oldBookingRefNo,
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
  const {customerCancelBooking, rescheduleBooking} = useBooking();
  const {createPaymentIntent} = usePayment();
  /**
|--------------------------------------------------
| Redux
|--------------------------------------------------
*/
  const {token, customerId, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );

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
    setIsFetching(true);
    cancelBooking();
  };

  /**
  |--------------------------------------------------
  | Payment Creations
  |--------------------------------------------------
  */
  const onRescheduleBooking = async () => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      BookingRefNo: oldBookingRefNo,
      Scheduledate: JSON.parse(scheduleDate),
      DeviceDetails: deviceDetails,
    };

    console.log('onRescheduleBooking payload:', payload);
    setIsFetching(true);
    rescheduleBooking(
      payload,
      (data: any) => {
        console.log('response from reschdule');
        console.log(data);
        if (data?.StatusCode === '00') {
          const {BookingRefNo} = data;
          _createPaymentIntent(BookingRefNo);
          // setIsFetching(false);
        } else {
          Alert.alert(data?.StatusMessage);
          setIsPaymentProcessing(false);
          setIsFetching(false);
        }
      },
      (err: any) => {
        setIsFetching(false);
        console.log('err:', err);
      },
    );
  };

  const _createPaymentIntent = (BookingRefNo: string) => {
    setIsPaymentProcessing(true);
    setIsFetching(true);
    const request = {
      CustomerToken: token,
      CustomerId: parseInt(customerId),
      Amount: totalCost,
      PaymentCustomerId: defaultCard?.CustomerStripeId || '',
      PaymentCustomerMethodId: defaultCard?.CustomerStripePaymentId || '',
      BookingRefNo,
      DeviceDetails: deviceDetails,
    };

    createPaymentIntent(
      request,
      (data: any) => {
        console.log('data from create payment');
        console.log(data);
        if (data?.StatusCode === '00') {
          dispatch(onSetBookingRefNo(BookingRefNo));
          // closeSummaryModal();
          setIsFetching(true);
          setIsVisible(false);
          NavigationService.push(SCREENS.SEARCH_SCHEDULE_SERVICE_PROVIDERS);
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

  const closeSummaryModal = () => {
    setIsVisible(false);
    setIsFetching(false);
    setIsPaymentProcessing(false);
  };

  const cancelBooking = () => {
    setIsFetching(true);
    let BookingRefNo = oldBookingRefNo;
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      BookingRefNo,
      DeviceDetails: deviceDetails,
    };

    // setLoading(true);
    customerCancelBooking(
      payload,
      (data: any) => {
        const {StatusCode} = data;
        if (StatusCode === '00') {
          onRescheduleBooking();
        } else {
          setIsFetching(false);
          Alert.alert(
            'Something went wrong on cancelling existing booking Please try again',
          );
          setIsVisible(false);
        }
      },
      (err: any) => {
        console.log('err:', err);
        setIsFetching(false);
      },
    );
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
      {/* <LikeGreenCircle height={75} width={75} style={styles.icon} /> */}
      {isFetching ? <Header2 /> : <Header />}

      <View style={styles.body}>
        <Item
          icon={<Calendar height={24} width={24} />}
          text={formatedRescheduleDate}
        />
        <Item
          icon={<HouseProperty height={24} width={24} />}
          text={propertyName}
        />
        <Item
          icon={<MowerGreen height={24} width={24} />}
          text={
            serviceType === 1
              ? 'Trim - Edge - Mow - Blow'
              : serviceType === 2
                ? 'Trim - Edge - Mulch - Blow'
                : 'Trim - Edge - Mow - Blow'
          }
        />
        <View style={styles.serviceContainer}>
          <Text h4 color={v2Colors.green}>
            Total Cost
          </Text>
          <Text h4 bold color={v2Colors.green}>
            {totalCost + ' AUD' || ''}
          </Text>
        </View>

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
      </View>
      <Confirm />
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
          Validating payment method
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
        text={'Confirm'}
        onPress={() => handleSubmit()}
        style={{borderRadius: 5}}
        isFetching={isFetching}
        disabled={isFetching}
      />
    </View>
  );

  return (
    <GestureRecognizer onSwipeDown={() => setIsVisible(false)}>
      <Modal
        isVisible={isVisible}
        swipeDirection="down"
        style={styles.modal}
        animationOut="slideOutDown"
        animationInTiming={100}
        animationOutTiming={100}
        useNativeDriver
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}>
        <Content />
      </Modal>
    </GestureRecognizer>
  );
};

export default RescheduleModal;
