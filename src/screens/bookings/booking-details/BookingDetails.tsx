import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
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
import CommonAPIalerts from '@shared-components/common-api-alerts/CommonAPIalerts';
import CenterModalW2Buttons from '@shared-components/modals/center-modal/with-2-buttons';
import DisputeBottomModal from './components/dispute-bottom-modal/DisputeBottomModal';
import {isAndroid} from '@freakycoder/react-native-helpers';
import {RootState} from 'store';
import fonts from '@fonts';
import RescheduleModal from './components/reschedule-summary/RescheduleSummary';
import {usePayment} from '@services/hooks/usePayment';
import {
  CustomerPaymentInfo,
  ICustomerPaymentInfo,
} from '@services/models/payment';
import Loader from '@shared-components/loaders/loader';
import PENDING from '@assets/v2/bookings/icons/pending.svg';
import CenterModalV2 from '@shared-components/modals/center-modal/CenterModalV2';
import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * ? Constants
 */
const INITIAL_BOOKING_DATA = {
  Alias: '',
  Address1: '',
  BookingRefNo: '',
  BookingStatus: '',
  BookingTypeDesc: '',
  CustomerId: '',
  DateCompleted: '',
  IntervalTimeLabel: '',
  LawnAreaLabel: '',
  PropertyAddId: '',
  ServiceFee: '',
  ServiceProviderId: '',
  ServiceTypeDesc: '',
  BookingDate: '',
};

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBookingDetailScreenProps {
  style?: CustomStyleProp;
  route?: any;
  navigation?: any;
}

const BookingDetailScreen: React.FC<IBookingDetailScreenProps> = () => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

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
  const [text, setText] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCommonError, setShowCommonError] = useState<boolean>(false);

  // for cancel booking
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState<boolean>(false);
  const [showCancelFail, setShowCancelFail] = useState<boolean>(false);

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

  /**
  |--------------------------------------------------
  | Effects
  |--------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      // if (!message) return handleGetItem();
      onFetchBookingHistory();
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
    console.log('booking details getSPDeviceInfo payload:', payload);
    getSPDeviceInfo(
      payload,
      (data: any) => {
        console.log('getSPDeviceInfo data:', data);
        const {DeviceId, PlatformOs} = data[0];
        setSPinfo({
          DeviceId,
          PlatformOs,
        });
      },
      (err: any) => {
        console.log('err:', err);
      },
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
        let resultData = Object.values(data.Data as Array<any>);

        resultData.forEach((card: any) => {
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

          if (resultData.some(e => e.IsDefault === 1)) {
            if (IsDefault === 1) {
              setDefaultCard(StripeCustomerInfomation);
            }
          }
        });
      },
      (error: any) => {
        console.log('customerPaymentMethodList error:', error);
        return;
      },
    );
  };

  const cancelBooking = () => {
    let BookingRefNo = bookingData?.BookingRefNo;
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
        setLoading(false);
        const {StatusCode} = data;
        if (StatusCode === '00') return setShowCancelSuccess(true);
        return setShowCancelFail(true);
      },
      (err: any) => {
        console.log('err:', err);
        setLoading(false);
        setShowCommonError(true);
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
    const payload = {
      CustomerId: customerId,
      BookingRefNo: !message
        ? (bookingItem?.BookingRefNo ?? '')
        : (JSON?.parse(message).bookingRefNo ?? ''),
      DeviceDetails: deviceDetails,
    };

    getBookingHistory(
      payload,
      (data: any) => {
        console.log('---onFetchBookingHistory---');
        console.log('onFetchBookingHistory data:', data[0]);
        console.log('----------------------------');
        if (data) {
          setBookingData(data[0]);
          setLoading(false);
        }
      },
      error => {
        console.log('error:', error);
        setLoading(false);
      },
    );
  };
  const getBookingReceipt = () => {
    const payload = {
      BookingRefNo: !message
        ? bookingItem?.BookingRefNo
        : JSON?.parse(message).bookingRefNo,
    };

    getReceipt(
      payload,
      (data: any) => {
        console.log('onFetchBookingReceipt data:', data);
        if (data) {
          if (data?.CustomerReceiptLink)
            Linking.openURL(data.CustomerReceiptLink);
          else Alert.alert('no Receipts found');
        }
      },
      error => {
        console.log('error:', error);
      },
    );
  };
  const handleGetItem = () => {
    if (!!bookingItem) setBookingData(bookingItem);
    console.log('bookingItem:', bookingItem);
  };

  const getChatCount = async () => {
    console.log('customerId:', customerId);
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
    cancelBooking();
  };

  const onCancelSuccess = () => {
    delayedHide(true);
  };
  const onCancelFail = () => {
    delayedHide();
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
      IsAndroiodDevice: isAndroid ? true : false,
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
    console.log('onSendNotification payload:', notifPayload);
    sendNotification(
      notifPayload,
      data => {
        console.log('onSendNotification data:', data);
      },
      err => {
        console.log('onSendNotification err:', err);
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

  const ViewOnTop = () => <View style={styles.viewOnTop} />;

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
        <PENDING_WHITE style={{top: 2}} />
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
      <CHECK_WHITE />
    </View>
  );

  const InDisputeStatus = () => (
    <View style={[styles.statusContainer, {backgroundColor: v2Colors.red}]}>
      <Text h4 color={'white'}>
        {'In Dispute'}
      </Text>
      <View style={{width: 5}} />
      <ALERT_WHITE />
    </View>
  );

  const PendingActions = () => (
    <View style={styles.headerBottomContent}>
      {bookingData?.BookingStatus !== 'IN PROGRESS' && (
        <TouchableOpacity
          style={styles.squareContainer}
          onPress={onPressReschedule}>
          <RESCHEDULE />
          <View style={{width: 20}} />
          <Text color={v2Colors.green}>Reschedule</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={onShowCancelModal}
        style={styles.squareContainer}>
        <CANCEL />
        <View style={{width: 20}} />
        <Text color={v2Colors.highlight}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const CompletedActions = () => (
    <View style={styles.headerBottomContent}>
      <TouchableOpacity
        style={styles.squareContainer}
        onPress={onShowDisputeModal}>
        <DISPUTE />
        <View style={{width: 20}} />
        <Text color={v2Colors.green}>Dispute</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.squareContainer}
        onPress={getBookingReceipt}>
        <RECEIPT />
        <View style={{width: 20}} />
        <Text color={v2Colors.highlight}>Receipt</Text>
      </TouchableOpacity>
    </View>
  );

  const PaidStatus = () => (
    <View style={[styles.statusContainer, {backgroundColor: v2Colors.blue}]}>
      <Text h4 color={'white'}>
        {'PAID'}
      </Text>
      <View style={{width: 5}} />
      <CHECK_WHITE />
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
              fontWeight: 'thin',
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
        <CALENDAR_GREEN height={24} width={24} />,
      )}
      {renderLineItem(
        'Service Type',
        bookingData?.ServiceTypeDesc,
        <MOWER height={24} width={24} />,
      )}
      {renderLineItem(
        'Service Provider Name',
        bookingData?.ServiceProviderName,
        <MOWER height={24} width={24} />,
      )}
      {renderLineItem(
        'Property Name',
        bookingData?.Alias,
        <HOUSE_PROPERY_GREEN height={24} width={24} />,
      )}
      {renderLineItem(
        'Address',
        bookingData?.Address1,
        <PIN_GREEN height={24} width={24} />,
      )}
      {!!bookingData?.DateCompleted &&
        renderLineItem(
          'Date Completed',
          bookingData?.DateCompleted,
          <CALENDAR_GREEN height={24} width={24} />,
        )}
      {renderLineItem(
        'Outdoor Pets',
        !!Number(bookingData?.HasOutdoorPets) ? 'Yes' : 'No',
        <PET_GREEN height={30} width={30} />,
      )}
      <View style={{alignContent: 'center', justifyContent: 'center'}}>
        <Text
          style={{
            fontWeight: 'thin',
            fontSize: 12,
            marginTop: 10,
            alignSelf: 'center',
          }}>
          Note: On-demand bookings may take up to 24 hours.
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
    <View style={styles.commsActionsContainer}>
      <TouchableOpacity onPress={() => setInitChat(true)}>
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
      </TouchableOpacity>
    </View>
  );

  const BottomActions = () => (
    <View style={styles.bottomContainer}>
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

      {snapPoint === 1 && initChat && <ViewOnTop />}

      {initChat && (
        <BottomSheetModal
          handleClose={() => {
            setShowChat(false);
            setInitChat(false);
          }}
          body={<BodyContent />}
          snapPoint={snapPoint}
          setSnapPoint={setSnapPoint}
          text={text}
          setText={setText}
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
      {/* success, fail, common error for cancel API call */}
      <CommonAPIalerts
        loading={loading}
        // success
        successText={'Successfully Cancelled your booking.'}
        successVisible={showCancelSuccess}
        setSuccessVisible={setShowCancelSuccess}
        onPressSucess={onCancelSuccess}
        // fail
        failedText={'Cancel Failed, please try again.'}
        failedVisible={showCancelFail}
        setFailedVisible={onCancelFail}
        onPressFailed={onCancelFail}
        // common error
        commonErrorVisible={showCommonError}
        setCommonErrorVisible={setShowCommonError}
        onPressCommonError={() => {
          delayedHide();
        }}
      />
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
