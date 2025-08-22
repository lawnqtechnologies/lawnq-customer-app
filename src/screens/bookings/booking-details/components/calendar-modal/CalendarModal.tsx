import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import CalendarPicker from 'react-native-calendar-picker';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import * as NavigationService from 'react-navigation-helpers';

/**
 * ? Local Imports
 */
import createStyles from './CalendarModal.style';
import {SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CalendarGreenCircle from '@assets/v2/homescreen/icons/calendar-green-circle.svg';
import Message from '@assets/v2/homescreen/icons/message.svg';
import XCircle from '@assets/v2/homescreen/icons/x-circle.svg';
import SlashCircle from '@assets/v2/homescreen/icons/slash-circle.svg';
import ChevronLeft from '@assets/v2/homescreen/icons/chevron-left.svg';
import ChevronRight from '@assets/v2/homescreen/icons/chevron-right.svg';

import {v2Colors} from '@theme/themes';
import fonts from '@fonts';
import CommonAPIalerts from '@shared-components/common-api-alerts/CommonAPIalerts';
import {RootState} from 'store';
import {useBooking} from '@services/hooks/useBooking';
import {onSetIsReschedule} from '@services/states/booking/booking.slice';
import moment from 'moment';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ICalendarModalProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  rescheduleBooking: Function;
  bookingRefNo: string;
  onSendNotification: Function;
  selectedServiceType: number;
  setReschedDate: (e: string) => void;
  reschedDate: string;
  setFormatedRescheduleDate: (e: string) => void;
  processScheduleBooking: () => void;
  AddressId: number;
}

const CalendarModal: React.FC<ICalendarModalProps> = ({
  isVisible,
  setIsVisible,
  rescheduleBooking,
  bookingRefNo,
  onSendNotification,
  selectedServiceType,
  setReschedDate,
  setFormatedRescheduleDate,
  processScheduleBooking,
  AddressId,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  const maxDate = new Date(Date.now() + 24 * 7 * 60 * 60 * 1000); // next week

  /**
|--------------------------------------------------
| Redux
|--------------------------------------------------
*/
  const {token, customerId, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );

  const dispatch = useDispatch();

  /**
|--------------------------------------------------
| States
|--------------------------------------------------
*/
  const [showRescheduleSuccess, setShowRescheduleSuccess] =
    useState<boolean>(false);
  const [showRescheduleFail, setShowRescheduleFail] = useState<boolean>(false);
  const [showCommonError, setShowCommonError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [enabledDates, setEnabledDates] = useState([]);

  const {getAvailableSchedule} = useBooking();

  /**
   * ? Functions
   */

  const onSelectRescheduleDate = (date: any) => {
    let rescheduleDate = JSON.stringify(moment(date));
    let formatedDate = moment(date).format('LLL');
    setFormatedRescheduleDate(formatedDate);
    setReschedDate(rescheduleDate);
    setIsVisible(false);
    processScheduleBooking();
  };

  useEffect(() => {
    if (isVisible) {
      setLoading(true);
      const payload = {
        CustomerId: customerId,
        CustomerToken: token,
        AddressId: AddressId,
      };
      console.log('getAvailableSchedule payload');
      console.log(payload);
      getAvailableSchedule(
        payload,
        (data: any) => {
          console.log('---getAvailableSchedule---');
          console.log(data);
          if (data.StatusCode === '00') {
            if (selectedServiceType === 1) {
              let filteredByServiceType = data.Data.filter(
                (x: any) => x.HasPushMower === 1,
              ).map((obj: any) => obj.AvailableDates);

              setEnabledDates(filteredByServiceType);
              setLoading(false);
            } else {
              let filteredByServiceType = data.Data.filter(
                (x: any) => x.HasRidingMower === 1,
              ).map((obj: any) => obj.AvailableDates);

              setEnabledDates(filteredByServiceType);
              setLoading(false);
            }
          } else {
            Alert.alert('No Available Schedule for this Month');
            setIsVisible(false);
            setLoading(false);
          }
        },
        (err: any) => {
          console.log('getAvailableSchedule err:', err);
          setLoading(false);
        },
      );
    }
  }, [isVisible]);

  const onRescheduleSuccess = () => {
    // delayedHide(true);
    onSendNotification(`Your booking ${bookingRefNo} has been rescheduled.`);
    // Alert.alert('this will reschedule');
  };
  const onRescheduleFail = () => {
    delayedHide();
  };
  const delayedHide = (isSuccess?: boolean) => {
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
    setTimeout(() => {
      isSuccess && NavigationService.push(SCREENS.HOME);
    }, 800);
  };

  // Function to enable only specific dates
  const enableOnlySpecificDates = (date: any) => {
    // Format date to 'YYYY-MM-DD' to match the format in enabledDates array
    const formattedDate = date.toISOString().split('T')[0];

    // Check if the formattedDate exists in the enabledDates array
    const isEnabled = enabledDates.some(
      (enabledDate: any) => enabledDate.split('T')[0] === formattedDate,
    );

    // Return true if the date is NOT in the enabledDates array (i.e., disable the date)
    return !isEnabled;
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Header = () => (
    <View style={styles.header}>
      <Text color={v2Colors.green} style={{fontWeight: '700', fontSize: 22}}>
        Pick a Date
      </Text>
    </View>
  );

  const BottomContent = (props: {icon: any; text: string}) => {
    return (
      <View style={styles.bottomContent}>
        {props.icon}
        <Text
          color={v2Colors.greenShade2}
          style={{marginLeft: 15, width: '85%'}}>
          {props.text}
        </Text>
      </View>
    );
  };

  const Footer = () => <View style={{marginBottom: 30}}></View>;

  return (
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
      <View style={styles.content}>
        <CalendarGreenCircle
          height={75}
          width={75}
          style={{alignSelf: 'center', marginTop: -28}}
        />
        <TouchableOpacity
          onPress={() => {
            setIsVisible(false);
          }}
          style={styles.closeButton}>
          <Icon
            name="close"
            type={IconType.MaterialIcons}
            color={v2Colors.lightRed}
            size={25}
          />
        </TouchableOpacity>
        <Header />
        <CalendarPicker
          startFromMonday
          minDate={minDate}
          maxDate={maxDate}
          todayBackgroundColor={'transparent'}
          disabledDates={enableOnlySpecificDates}
          onDateChange={thisDate => {
            onSelectRescheduleDate(thisDate);
          }}
          previousComponent={<ChevronLeft />}
          nextComponent={<ChevronRight />}
          textStyle={{
            fontFamily: fonts.lexend.extraBold,
            fontWeight: '700',
            color: v2Colors.green,
            fontSize: 15,
          }}
          monthTitleStyle={{fontSize: 20, color: v2Colors.green}}
          yearTitleStyle={{fontSize: 20, color: v2Colors.green}}
        />

        <View style={styles.bottomContentContainer}>
          <Text
            color={v2Colors.green}
            style={{fontWeight: '700', fontSize: 16, marginBottom: 10}}>
            Booking Rules
          </Text>
          <BottomContent
            icon={<Message />}
            text={`You can chat with the service provider to organise a time suitable for both of you on the selected date.`}
          />
          <BottomContent
            icon={<XCircle />}
            text={`Cancel at no charge within 7 days from today.`}
          />
          <BottomContent
            icon={<SlashCircle />}
            text={`Inaccurate grass height details could result in booking rejection from the service provider.`}
          />
        </View>

        <Text
          color={v2Colors.green}
          style={{
            fontWeight: '500',
            fontSize: 12,
            textAlign: 'right',
            textDecorationLine: 'underline',
            marginTop: 10,
            paddingRight: 30,
          }}>
          See Terms
        </Text>
        <Footer />
      </View>

      {/* success, fail, common error for reschedule API call */}
      <CommonAPIalerts
        loading={loading}
        // success
        successText={'Successfully rescheduled your booking.'}
        successVisible={showRescheduleSuccess}
        setSuccessVisible={setShowRescheduleSuccess}
        onPressSucess={onRescheduleSuccess}
        // fail
        failedText={'No Service Provider(s) available.'}
        failedVisible={showRescheduleFail}
        setFailedVisible={setShowRescheduleFail}
        onPressFailed={onRescheduleFail}
        // common error
        commonErrorVisible={showCommonError}
        setCommonErrorVisible={setShowCommonError}
        onPressCommonError={() => {
          delayedHide();
        }}
      />
    </Modal>
  );
};

export default CalendarModal;
