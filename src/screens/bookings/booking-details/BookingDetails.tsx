import React, {useMemo, useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import {useSelector} from 'react-redux';
import moment from 'moment';
import {toLower} from 'lodash';
import database from '@react-native-firebase/database';

/**
 * ? Local Imports
 */
import createStyles from './BookingDetails.style';
import {v2Colors} from '@theme/themes';
import Text from '@shared-components/text-wrapper/TextWrapper';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import {NOTIFICATION_SOUNDS, SCREENS} from '@shared-constants';
import CommonButton from '@shared-components/buttons/CommonButton';
import BottomSheetModal from '@screens/bookings/booking-details/components/bottom-sheet-modal/BottomSheetModal';
import CustomChatComponent from './components/custom-chat-component';
import CalendarModal from './components/calendar-modal/CalendarModal';

import {useBooking} from '@services/hooks/useBooking';

/**
 * ? SVGs
 */
import PENDING_WHITE from '@assets/v2/bookings/icons/pending-white.svg';
import CHECK_WHITE from '@assets/v2/bookings/icons/check-white.svg';
import RESCHEDULE from '@assets/v2/bookings/icons/reschedule.svg';
import CANCEL from '@assets/v2/bookings/icons/cancel.svg';
import ALERT_WHITE from '@assets/v2/bookings/icons/alert-white.svg';

import CALENDAR_GREEN from '@assets/v2/bookings/icons/calendar-green.svg';
import HOUSE_PROPERY_GREEN from '@assets/v2/bookings/icons/house-property-green.svg';
import PIN_GREEN from '@assets/v2/bookings/icons/pin-green.svg';
import MOWER from '@assets/v2/bookings/icons/mower-green.svg';
import PET_GREEN from '@assets/v2/bookings/icons/pet-green.svg';
import SP from '@assets/v2/bookings/icons/booking-type.svg';

import DISPUTE from '@assets/v2/bookings/icons/dispute.svg';
import RECEIPT from '@assets/v2/bookings/icons/receipt.svg';
import Loader from '@shared-components/loaders/loader';
import CenterModalW2Buttons from '@shared-components/modals/center-modal/with-2-buttons';
import DisputeBottomModal from './components/dispute-bottom-modal/DisputeBottomModal';
import {RootState} from 'store';
import RescheduleModal from './components/reschedule-summary/RescheduleSummary';
import {usePayment} from '@services/hooks/usePayment';
import {
  useSafeBottomPadding,
  useSafeBottomPosition,
} from 'shared/functions/useSafeBottomInset';
import {
  CustomerPaymentInfo,
  ICustomerPaymentInfo,
} from '@services/models/payment';
/**
 * ? Constants
 */

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

const CANCEL_BOOKING_TIMEOUT_MS = 17000;
const CANCEL_MODAL_CLOSE_DELAY_MS = 650;
const CANCEL_BOOKING_ERROR_MESSAGE =
  "We couldn't cancel this booking right now. Please try again or contact support.";

const isTechnicalCancelErrorMessage = (message?: string) => {
  const normalizedMessage = message?.toLowerCase() || '';

  return [
    '/v1/',
    'axioserror',
    'non-empty identifier',
    'payment_intents',
    'request failed with status code',
    'stripe.com/docs',
    'support.stripe.com',
    'unrecognized request url',
  ].some(keyword => normalizedMessage.includes(keyword));
};

const getCancelBookingErrorMessage = (error?: any) => {
  const message =
    error?.response?.data?.DisplayMessage ||
    error?.response?.data?.StatusMessage ||
    error?.response?.data?.message ||
    error?.response?.data?.Message ||
    error?.StatusMessage ||
    error?.message;

  if (typeof message !== 'string' || !message.trim()) {
    return CANCEL_BOOKING_ERROR_MESSAGE;
  }

  if (isTechnicalCancelErrorMessage(message)) {
    return CANCEL_BOOKING_ERROR_MESSAGE;
  }

  return message;
};

const stringifyCancelBookingDebug = (value: any) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

interface IBookingDetailScreenProps {
  style?: CustomStyleProp;
  route?: any;
  navigation?: any;
}

const BookingDetailScreen: React.FC<IBookingDetailScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const communicationBottomPosition = useSafeBottomPosition(20);
  const bottomActionPadding = useSafeBottomPadding(20);

  /**
  |--------------------------------------------------
  | Hooks
  |--------------------------------------------------
  */
  const {
    getBookingHistory,
    getSPDeviceInfo,
    customerCancelBooking,
    rescheduleBooking,
    disputeBooking,
    sendNotification,
    getReceipt,
  } = useBooking();

  const {customerPaymentMethodList} = usePayment();

  /**
|--------------------------------------------------
| Redux
|--------------------------------------------------
*/
  const {customerId, deviceDetails, isFromMenu, token} = useSelector(
    (state: RootState) => state.user,
  );
  const {message, bookingItem} = useSelector(
    (state: RootState) => state.booking,
  );
  /**
|--------------------------------------------------
| States
|--------------------------------------------------
*/
  const [bookingData, setBookingData] = useState<any>();

  const [initChat, setInitChat] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [SPinfo, setSPinfo] = useState<{
    DeviceId: string;
    PlatformOs: string;
  }>({DeviceId: '', PlatformOs: ''});
  const [chatCount, setChatCount] = useState<number>(0);
  const [snapPoint, setSnapPoint] = useState<number>(0);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // for cancel booking
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const cancelRequestIdRef = useRef(0);
  const cancelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // for dispute booking
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);

  // for payment method
  const [defaultCard, setDefaultCard] = useState<CustomerPaymentInfo>();
  const [isReschduleSummaryShow, setIsReschduleSummaryShow] =
    useState<boolean>(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [formatedRescheduleDate, setFormatedRescheduleDate] =
    useState<string>('');
  const [isConfirmReschedule, setIsConfirmReschedule] =
    useState<boolean>(false);

  const getMessagePayload = () => {
    if (!message) return null;

    try {
      return JSON.parse(message);
    } catch {
      return null;
    }
  };

  const clearCancelTimeout = () => {
    if (!cancelTimeoutRef.current) return;
    clearTimeout(cancelTimeoutRef.current);
    cancelTimeoutRef.current = null;
  };

  /**
  |--------------------------------------------------
  | Effects
  |--------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      // if (!message) return handleGetItem();
      onFetchBookingHistory();
      // Keeps the reschedule summary's default card fresh, e.g. right after
      // removing all cards on the Wallet screen.
      getDefaultCard();
    }, []),
  );

  useEffect(() => {
    if (!customerId || !bookingData?.ServiceProviderId) return;
    onGetDeviceInfo();
  }, [customerId, bookingData?.ServiceProviderId]);

  useEffect(() => {
    if (!bookingData?.BookingRefNo) return;
    getChatCount();
  }, [initChat, bookingData]);

  useEffect(() => {
    return () => {
      if (cancelStartTimeoutRef.current) {
        clearTimeout(cancelStartTimeoutRef.current);
        cancelStartTimeoutRef.current = null;
      }
      clearCancelTimeout();
    };
  }, []);

  /**
  |--------------------------------------------------
  | API
  |--------------------------------------------------
  */
  const onGetDeviceInfo = () => {
    let ServiceProviderId = bookingData?.ServiceProviderId;
    const payload = {
      ServiceProviderId,
      DeviceDetails: deviceDetails,
    };
    getSPDeviceInfo(
      payload,
      (data: any) => {
        const {DeviceId, PlatformOs} = data[0];
        setSPinfo({
          DeviceId,
          PlatformOs,
        });
      },
      () => {},
    );
  };

  const getDefaultCard = async () => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      PaymentType: 'card',
      ...deviceDetails,
    };
    customerPaymentMethodList(
      payload,
      (data: any) => {
        const resultData = Object.values(data.Data as Array<any>);
        const defaultCardData: any = resultData.find(
          (card: any) => card.IsDefault === 1,
        );

        if (!defaultCardData) {
          // No cards left (e.g. user removed them all from the Wallet screen) -
          // clear any stale card so checkout falls back to "Add Payment Method".
          setDefaultCard(undefined);
          return;
        }

        const {Cards, IsDefault, CustomerStripeId, CustomerStripePaymentId} =
          defaultCardData;
        const {ExpMonth, ExpYear, Fingerprint, Last4, Brand} = Cards;

        setDefaultCard({
          CustomerStripeId,
          CustomerStripePaymentId,
          ExpMonth,
          ExpYear,
          Fingerprint,
          Last4,
          Brand,
          IsDefault,
        });
      },
      () => {
        return;
      },
    );
  };

  const showCancelFailure = (message = CANCEL_BOOKING_ERROR_MESSAGE) => {
    Alert.alert('Cancel Failed', message);
  };

  const showCancelSuccessAlert = () => {
    Alert.alert('Booking Cancelled', 'Successfully Cancelled your booking.', [
      {text: 'OK', onPress: () => delayedHide(true)},
    ]);
  };

  const finishCancelRequest = (requestId: number, onFinish: () => void) => {
    if (cancelRequestIdRef.current !== requestId) return;
    cancelRequestIdRef.current = requestId + 1;
    clearCancelTimeout();
    setLoading(false);
    onFinish();
  };

  const cancelBooking = () => {
    let BookingRefNo = bookingData?.BookingRefNo;
    if (!BookingRefNo) {
      showCancelFailure('Booking details are still loading. Please try again.');
      return;
    }

    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      BookingRefNo,
      DeviceDetails: deviceDetails,
    };

    const requestId = cancelRequestIdRef.current + 1;
    cancelRequestIdRef.current = requestId;
    clearCancelTimeout();
    setLoading(true);
    cancelTimeoutRef.current = setTimeout(() => {
      finishCancelRequest(requestId, () => {
        showCancelFailure();
      });
    }, CANCEL_BOOKING_TIMEOUT_MS);

    console.log(
      `[CancelBookingDebug] request payload ${stringifyCancelBookingDebug(
        payload,
      )}`,
    );

    customerCancelBooking(
      payload,
      (data: any) => {
        console.log(
          `[CancelBookingDebug] response ${stringifyCancelBookingDebug(data)}`,
        );
        finishCancelRequest(requestId, () => {
          const {StatusCode} = data;
          if (StatusCode === '00') return showCancelSuccessAlert();
          return showCancelFailure(getCancelBookingErrorMessage(data));
        });
      },
      (err: any) => {
        console.log(
          `[CancelBookingDebug] error ${stringifyCancelBookingDebug(
            {
              status: err?.response?.status,
              data: err?.response?.data,
              message: err?.message,
            },
          )}`,
        );
        finishCancelRequest(requestId, () => {
          showCancelFailure(getCancelBookingErrorMessage(err));
        });
      },
    );
  };

  /**
  |--------------------------------------------------
  | Methods
  |--------------------------------------------------
  */
  const onFetchBookingHistory = () => {
    setLoading(true);
    const parsedMessage = getMessagePayload();
    const bookingRefNo =
      bookingItem?.BookingRefNo ?? parsedMessage?.bookingRefNo ?? '';

    if (!bookingRefNo) {
      setBookingData(bookingItem);
      setLoading(false);
      return;
    }

    const payload = {
      CustomerId: customerId,
      BookingRefNo: bookingRefNo,
      DeviceDetails: deviceDetails,
    };

    getBookingHistory(
      payload,
      (data: any) => {
        setBookingData(data?.[0] ?? bookingItem);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
  };
  const getBookingReceipt = () => {
    const parsedMessage = getMessagePayload();
    const payload = {
      BookingRefNo: bookingItem?.BookingRefNo ?? parsedMessage?.bookingRefNo,
    };

    getReceipt(
      payload,
      (data: any) => {
        if (data) {
          if (data?.CustomerReceiptLink)
            Linking.openURL(data.CustomerReceiptLink);
          else Alert.alert('no Receipts found');
        }
      },
      () => {},
    );
  };
  const handleGetItem = () => {
    if (!!bookingItem) setBookingData(bookingItem);
  };

  const getChatCount = async () => {
    database()
      .ref(`/chat_count/customer/${customerId}/${bookingData?.BookingRefNo}`)
      .once('value')
      .then(snapshot => {
        const data = snapshot.val();
        if (!data) return;
        setChatCount(data.s_count || 0);
      });
  };

  const onRate = () => {
    let _bookingRef = bookingData?.BookingRefNo;
    NavigationService.navigate(SCREENS.RATING_FEEDBACK, {
      completeBookingData: {_bookingRef},
    });
  };

  const onPressReschedule = () => {
    setInitChat(false);
    setShowChat(false);
    setShowCalendar(true);
  };

  // common delayed hide success
  const delayedHide = (isSuccess?: boolean) => {
    setTimeout(() => {
      isSuccess && NavigationService.navigate(SCREENS.HOME);
    }, 500);
  };

  const onShowCancelModal = () => {
    setInitChat(false);
    setShowCalendar(false);

    setTimeout(() => {
      setShowCancelModal(true);
    }, 200);
  };

  const onCancel = () => {
    setShowCancelModal(false);
    if (cancelStartTimeoutRef.current) {
      clearTimeout(cancelStartTimeoutRef.current);
    }
    cancelStartTimeoutRef.current = setTimeout(() => {
      cancelStartTimeoutRef.current = null;
      cancelBooking();
    }, CANCEL_MODAL_CLOSE_DELAY_MS);
  };

  const onShowDisputeModal = () => {
    setInitChat(false);
    setShowCalendar(false);
    setShowCancelModal(false);

    setTimeout(() => {
      setShowDisputeModal(true);
    }, 200);
  };

  const onSendNotification = (body: string) => {
    let BookingRefNo = bookingData?.BookingRefNo;
    const notifPayload = {
      DeviceId: SPinfo.DeviceId,
      Priority: 'high',
      IsAndroiodDevice: Platform.OS === 'android',
      Data: {
        ScreenName: 'BOOKING_DETAILS',
        Message: JSON.stringify({
          BookingRefNo,
        }),
        Remarks: '',
      },
      Notification: {
        Title: 'LawnQ',
        Body: body,
        Sound: NOTIFICATION_SOUNDS.NOTIFICATION_DEFAULT,
      },
    };
    sendNotification(
      notifPayload,
      () => {},
      () => {
        Alert.alert('Chat', 'Something went wrong, please try again.');
      },
    );
  };

  const processScheduleBooking = () => {
    getDefaultCard();
    setLoading(true);
    setTimeout(() => {
      setIsReschduleSummaryShow(true);
      setLoading(false);
    }, 2000);

    // setIsReschduleSummaryShow(true)
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  const PendingStatus = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
      }}>
      <View style={styles.statusContainer}>
        <Text h4 color={'white'}>
          {bookingData?.BookingStatus === 'IN PROGRESS'
            ? 'In Progress'
            : 'Pending'}
        </Text>
        <View style={{width: 5}} />
        <PENDING_WHITE pointerEvents="none" style={{top: 2}} />
      </View>
      <View style={styles.passCodeContainer}>
        <Text
          style={{fontSize: 15, margin: 5, fontWeight: '600'}}
          color={'#de670e'}>
          Passcode
        </Text>
        <Text
          style={{fontSize: 25, marginVertical: 3, fontWeight: 'bold'}}
          color={'#de670e'}>
          {bookingData?.BookingPasscode}
        </Text>
      </View>
    </View>
  );

  const CompletedStatus = () => (
    <View style={[styles.statusContainer, {backgroundColor: v2Colors.blue}]}>
      <Text h4 color={'white'}>
        {'Completed'}
      </Text>
      <View style={{width: 5}} />
      <CHECK_WHITE pointerEvents="none" />
    </View>
  );

  const InDisputeStatus = () => (
    <View style={[styles.statusContainer, {backgroundColor: v2Colors.red}]}>
      <Text h4 color={'white'}>
        {'In Dispute'}
      </Text>
      <View style={{width: 5}} />
      <ALERT_WHITE pointerEvents="none" />
    </View>
  );

  const PendingActions = () => (
    <View style={styles.headerBottomContent}>
      {bookingData?.BookingStatus !== 'IN PROGRESS' && (
        <Pressable
          style={styles.squareContainer}
          onPress={onPressReschedule}>
          <RESCHEDULE pointerEvents="none" />
          <View style={{width: 20}} />
          <Text color={v2Colors.green}>Reschedule</Text>
        </Pressable>
      )}
      <Pressable
        onPress={onShowCancelModal}
        style={styles.squareContainer}>
        <CANCEL pointerEvents="none" />
        <View style={{width: 20}} />
        <Text color={v2Colors.highlight}>Cancel</Text>
      </Pressable>
    </View>
  );

  const CompletedActions = () => (
    <View style={styles.headerBottomContent}>
      <Pressable
        style={styles.squareContainer}
        onPress={onShowDisputeModal}>
        <DISPUTE pointerEvents="none" />
        <View style={{width: 20}} />
        <Text color={v2Colors.green}>Dispute</Text>
      </Pressable>
      <Pressable
        style={styles.squareContainer}
        onPress={getBookingReceipt}>
        <RECEIPT pointerEvents="none" />
        <View style={{width: 20}} />
        <Text color={v2Colors.highlight}>Receipt</Text>
      </Pressable>
    </View>
  );

  const PaidStatus = () => (
    <View style={[styles.statusContainer, {backgroundColor: v2Colors.blue}]}>
      <Text h4 color={'white'}>
        {'PAID'}
      </Text>
      <View style={{width: 5}} />
      <CHECK_WHITE pointerEvents="none" />
    </View>
  );

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={{width: '100%', alignSelf: 'center', alignItems: 'center'}}>
        {(bookingData?.BookingStatus === 'ACCEPTED' ||
          bookingData?.BookingStatus === 'IN PROGRESS') && <PendingStatus />}
        {bookingData?.BookingStatus === 'COMPLETED' && <CompletedStatus />}
        {bookingData?.BookingStatus === 'DISPUTE' && <InDisputeStatus />}
        {bookingData?.BookingStatus === 'PAID OUT' && <PaidStatus />}
      </View>

      <View style={styles.headerTopLeftContent}>
        <View>
          <Text h3 bold color={v2Colors.green}>
            Reference No.
          </Text>
          <Text h3 color={v2Colors.greenShade2}>
            {bookingData?.BookingRefNo}
          </Text>
        </View>
      </View>
      <View style={styles.headerMidContent}>
        <Text h3 color={v2Colors.green}>
          {bookingData?.BookingTypeDesc}
        </Text>
        <Text h2 bold color={v2Colors.green}>
          {`$${Number(bookingData?.Cost).toFixed(2)}`}
        </Text>
      </View>

      {(bookingData?.BookingStatus === 'ACCEPTED' ||
        bookingData?.BookingStatus === 'IN PROGRESS') && <PendingActions />}
      {bookingData?.BookingStatus === 'COMPLETED' && <CompletedActions />}

      {(bookingData?.BookingStatus === 'ACCEPTED' ||
        bookingData?.BookingStatus === 'IN PROGRESS') && (
        <View
          style={{
            alignContent: 'center',
            justifyContent: 'center',
            borderColor: '#ff6800',
            borderRadius: 9,
            marginTop: 10,
            width: '100%',
          }}>
          <Text
            bold
            style={{
              fontSize: 12,
              marginTop: 10,
              alignSelf: 'center',
            }}>
            Your payment is on hold
          </Text>
          <Text
            color={v2Colors.blackOpacity6}
            style={{
              fontWeight: '300',
              fontSize: 11,
              alignSelf: 'center',
              marginBottom: 10,
            }}>
            You'll only be charged once the job has completed.
          </Text>
        </View>
      )}
    </View>
  );

  const Details = () => (
    <>
      {renderLineItem(
        'Booking Date',
        toLower(bookingData?.BookingTypeDesc) === 'queue later'
          ? moment(bookingData?.BookingDate).format('LL')
          : moment(bookingData?.BookingDate).format('LLL'),
        <CALENDAR_GREEN pointerEvents="none" height={24} width={24} />,
      )}
      {renderLineItem(
        'Service Type',
        bookingData?.ServiceTypeDesc,
        <MOWER pointerEvents="none" height={24} width={24} />,
      )}
      {renderLineItem(
        'Service Provider Name',
        bookingData?.ServiceProviderName,
        <MOWER pointerEvents="none" height={24} width={24} />,
      )}
      {renderLineItem(
        'Property Name',
        bookingData?.Alias,
        <HOUSE_PROPERY_GREEN pointerEvents="none" height={24} width={24} />,
      )}
      {renderLineItem(
        'Address',
        bookingData?.Address1,
        <PIN_GREEN pointerEvents="none" height={24} width={24} />,
      )}
      {!!bookingData?.DateCompleted &&
        renderLineItem(
          'Date Completed',
          bookingData?.DateCompleted,
          <CALENDAR_GREEN pointerEvents="none" height={24} width={24} />,
        )}
      {/* {renderLineItem(
        'Outdoor Pets',
        !!Number(bookingData?.HasOutdoorPets) ? 'Yes' : 'No',
        <PET_GREEN pointerEvents="none" height={30} width={30} />,
      )} */}
      <View style={{alignContent: 'center', justifyContent: 'center'}}>
        <Text
          style={{
            fontWeight: '300',
            fontSize: 12,
            marginTop: 10,
            marginHorizontal:10,
            alignSelf: 'center',
          }}>
          Note: Dates are indicative and may be adjusted based on availability and conditions.
        </Text>
      </View>
      <View style={{height: 100}} />
    </>
  );

  const renderLineItem = (title: string, value: string, icon: JSX.Element) => {
    return (
      <View style={styles.item}>
        <View style={{width: '80%'}}>
          <Text h5 bold color={v2Colors.green}>
            {title}
          </Text>
          <Text h5 color={v2Colors.greenShade2}>
            {value}
          </Text>
        </View>
        {icon}
      </View>
    );
  };

  const CommunicationActions = () => (
    <View style={[styles.commsActionsContainer, communicationBottomPosition]}>
      <Pressable
        onPress={() => {
          setSnapPoint(0);
          setInitChat(true);
        }}>
        <View style={styles.completeButtonContainer}>
          <Text color={'white'}>Message Provider</Text>
        </View>
        {!!chatCount && (
          <View style={styles.badge}>
            <Text h6 bold color={'white'}>
              {chatCount}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  const BottomActions = () => (
    <View style={[styles.bottomContainer, bottomActionPadding]}>
      <CommonButton
        text="Add Feedback"
        onPress={onRate}
        style={{borderRadius: 5}}
      />
    </View>
  );

  const confirmReschedule = () => {
    setIsConfirmReschedule(false);
  };

  const BodyContent = () => (
    <CustomChatComponent
      ServiceProviderId={bookingData?.ServiceProviderId}
      bookingItem={bookingData}
      SPInfo={SPinfo}
      setInitChat={setInitChat}
      setSnapPoint={setSnapPoint}
    />
  );

  return (
    <>
      <HeaderContainer pageTitle="Booking Details" backValue={true} />

      <View style={styles.container}>
        {/* {loading && <Loader />} */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingVertical: 20}}
          style={{height: '70%'}}>
          <Header />
          <Details />
        </ScrollView>
        {/* {BookingStatus === "COMPLETED" && <BottomActions />} */}

        <CommunicationActions />
      </View>

      {initChat && (
        <BottomSheetModal
          handleClose={() => {
            setShowChat(false);
            setInitChat(false);
          }}
          body={<BodyContent />}
          snapPoint={snapPoint}
          setSnapPoint={setSnapPoint}
        />
      )}

      <CalendarModal
        isVisible={showCalendar}
        setIsVisible={setShowCalendar}
        rescheduleBooking={rescheduleBooking}
        bookingRefNo={bookingData?.BookingRefNo ?? ''}
        onSendNotification={onSendNotification}
        selectedServiceType={bookingData?.ServiceTypeId}
        reschedDate={rescheduleDate}
        setReschedDate={setRescheduleDate}
        setFormatedRescheduleDate={setFormatedRescheduleDate}
        processScheduleBooking={processScheduleBooking}
        AddressId={bookingData?.PropertyAddId ?? 0}
      />

      <DisputeBottomModal
        isVisible={showDisputeModal}
        setIsVisible={setShowDisputeModal}
        disputeBooking={disputeBooking}
        bookingRefNo={bookingData?.BookingRefNo ?? ''}
        onSendNotification={onSendNotification}
      />

      {/* cancel modal - yes or no */}
      <CenterModalW2Buttons
        isVisible={showCancelModal}
        setIsVisible={setShowCancelModal}
        text={
          'Are you sure you want to cancel this booking, you will be charged the cancellation fees?'
        }
        onPressYes={onCancel}
        onPressNo={() => {
          setShowCancelModal(false);
        }}
      />
      {loading && <Loader />}
      <RescheduleModal
        title={'Reschedule Summary'}
        isVisible={isReschduleSummaryShow}
        payload={undefined}
        defaultCard={defaultCard}
        propertyName={bookingData?.Alias}
        queue="test"
        scheduleDate={rescheduleDate}
        serviceType={bookingData?.ServiceTypeId}
        setIsVisible={setIsReschduleSummaryShow}
        totalCost={bookingData?.Cost}
        formatedRescheduleDate={formatedRescheduleDate}
        oldBookingRefNo={bookingData?.BookingRefNo}
      />

      {/* cancel modal - yes or no */}
      <CenterModalW2Buttons
        isVisible={isConfirmReschedule}
        setIsVisible={setIsConfirmReschedule}
        text={
          'Rescheduling will cancel your current booking’s payment authorization, and a new one will be required.”'
        }
        onPressYes={confirmReschedule}
        onPressNo={() => {
          setIsConfirmReschedule(false);
        }}
      />
    </>
  );
};

export default BookingDetailScreen;
