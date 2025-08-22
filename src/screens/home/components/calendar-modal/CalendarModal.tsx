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
import moment from 'moment';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

/**
 * ? Local Imports
 */
import createStyles from './CalendarModal.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CalendarGreenCircle from '@assets/v2/homescreen/icons/calendar-green-circle.svg';
import Message from '@assets/v2/homescreen/icons/message.svg';
import XCircle from '@assets/v2/homescreen/icons/x-circle.svg';
import SlashCircle from '@assets/v2/homescreen/icons/slash-circle.svg';
import ChevronLeft from '@assets/v2/homescreen/icons/chevron-left.svg';
import ChevronRight from '@assets/v2/homescreen/icons/chevron-right.svg';
import {v2Colors} from '@theme/themes';
import fonts from '@fonts';
import {onSetDateAndQueue} from '@services/states/booking/booking.slice';
import {RootState} from 'store';
import {useBooking} from '@services/hooks/useBooking';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ICalendarModalProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  setBookingDate: Function;
  setIsLoading: Function;
  selectedServiceType: number;
  addressId: string;
  canCollectWaste: number;
}

const CalendarModal: React.FC<ICalendarModalProps> = ({
  isVisible,
  setIsVisible,
  setBookingDate,
  setIsLoading,
  selectedServiceType,
  addressId,
  canCollectWaste,
}) => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  const maxDate = new Date(Date.now() + 24 * 30 * 60 * 60 * 1000); // next month

  const {token, customerId} = useSelector((state: RootState) => state.user);

  const {getAvailableSchedule} = useBooking();

  const [enabledDates, setEnabledDates] = useState([]);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      const payload = {
        CustomerId: customerId,
        CustomerToken: token,
        AddressId: parseInt(addressId),
      };

      getAvailableSchedule(
        payload,
        (data: any) => {
          if (data.StatusCode === '00') {
            if (selectedServiceType === 1) {
              let filteredByServiceType = data.Data.filter(
                (x: any) =>
                  x.HasPushMower === 1 &&
                  (canCollectWaste === 0 ||
                    x.CanCollectWaste === canCollectWaste),
              ).map((obj: any) => obj.AvailableDates);
              setEnabledDates(filteredByServiceType);
              setIsLoading(true);
            } else {
              let filteredByServiceType = data.Data.filter(
                (x: any) =>
                  x.HasRidingMower === 1 &&
                  (canCollectWaste === 0 ||
                    x.CanCollectWaste === canCollectWaste),
              ).map((obj: any) => obj.AvailableDates);
              setEnabledDates(filteredByServiceType);
              setIsLoading(true);
            }
          } else {
            Alert.alert('No Available Schedule for this Month');
            setIsVisible(false);
            setIsLoading(true);
          }
        },
        (err: any) => {
          console.log('getAvailableSchedule err:', err);
          setIsLoading(false);
        },
      );
    }
  }, [isVisible]);

  /**
   * ? States
   */

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

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection="down"
      style={styles.modal}
      animationOut="slideOutDown"
      animationInTiming={100}
      animationOutTiming={200}
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
            setIsLoading(false);
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
          disabledDates={enableOnlySpecificDates}
          todayBackgroundColor={'transparent'}
          onDateChange={thisDate => {
            setIsVisible(false);
            setBookingDate(moment(thisDate).format('ll'));
            setTimeout(() => {
              dispatch(
                onSetDateAndQueue({
                  queue: 'later',
                  formattedDate1: moment(thisDate).format('LLL'),
                  formattedDate2: moment(thisDate).format('DD-MM-YYYY'),
                  rawDate: JSON.stringify(moment(thisDate)),
                }),
              );
            }, 500);
            setIsLoading(false);
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
            style={{fontWeight: '600', fontSize: 16, marginBottom: 10}}>
            {selectedServiceType === 1
              ? 'Push Mowing Rules'
              : 'Ride-on Mowing Rules'}
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
    </Modal>
  );
};

export default CalendarModal;
