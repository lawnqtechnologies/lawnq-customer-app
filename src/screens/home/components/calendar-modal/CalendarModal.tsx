import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  Pressable,
  Alert,
  ActivityIndicator,
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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  // const maxDate = new Date(Date.now() + 24 * 30 * 60 * 60 * 1000); // next month

  const {token, customerId} = useSelector((state: RootState) => state.user);

  const {getAvailableSchedule} = useBooking();

  const [enabledDates, setEnabledDates] = useState<string[]>([]);
  const [isFetchingDates, setIsFetchingDates] = useState<boolean>(false);
  const [isPreparingSelection, setIsPreparingSelection] =
    useState<boolean>(false);

  const enabledDateSet = useMemo(() => {
    return new Set(
      enabledDates.map(date => moment(date).format('YYYY-MM-DD')),
    );
  }, [enabledDates]);

  const normalizeAvailableDates = (items: any[] = []) => {
    return items
      .flatMap((obj: any) => {
        if (Array.isArray(obj?.AvailableDates)) {
          return obj.AvailableDates;
        }

        return obj?.AvailableDates ? [obj.AvailableDates] : [];
      })
      .filter((date: any) => typeof date === 'string');
  };

  const handleClose = useCallback(() => {
    if (isPreparingSelection) {
      return;
    }

    setIsVisible(false);
    setIsLoading(false);
  }, [isPreparingSelection, setIsLoading, setIsVisible]);

  useEffect(() => {
    if (!isVisible) {
      setEnabledDates([]);
      setIsFetchingDates(false);
      setIsPreparingSelection(false);
      return;
    }

    let isCancelled = false;

    if (isVisible) {
      setIsFetchingDates(true);
      setIsLoading(true);
      const payload = {
        CustomerId: customerId,
        CustomerToken: token,
        AddressId: parseInt(addressId, 10),
      };

      getAvailableSchedule(
        payload,
        (data: any) => {
          if (isCancelled) {
            return;
          }

          if (data.StatusCode === '00') {
            if (selectedServiceType === 1) {
              const filteredByServiceType = data.Data.filter(
                (x: any) =>
                  x.HasPushMower === 1 &&
                  (canCollectWaste === 0 ||
                    x.CanCollectWaste === canCollectWaste),
              );
              setEnabledDates(normalizeAvailableDates(filteredByServiceType));
              setIsFetchingDates(false);
              setIsLoading(false);
            } else {
              const filteredByServiceType = data.Data.filter(
                (x: any) =>
                  x.HasRidingMower === 1 &&
                  (canCollectWaste === 0 ||
                    x.CanCollectWaste === canCollectWaste),
              );
              setEnabledDates(normalizeAvailableDates(filteredByServiceType));
              setIsFetchingDates(false);
              setIsLoading(false);
            }
          } else {
            setIsFetchingDates(false);
            Alert.alert('No Available Schedule for this Month');
            handleClose();
          }
        },
        (err: any) => {
          if (isCancelled) {
            return;
          }

          console.log('getAvailableSchedule err:', err);
          setIsFetchingDates(false);
          setIsLoading(false);
        },
      );
    }

    return () => {
      isCancelled = true;
    };
  }, [isVisible]);

  const handleDateChange = useCallback(
    (thisDate: any) => {
      if (isPreparingSelection) {
        return;
      }

      setIsPreparingSelection(true);
      setIsLoading(true);

      const displayDate = moment(thisDate).format('ll');
      const formattedDate1 = moment(thisDate).format('LLL');
      const formattedDate2 = moment(thisDate).format('DD-MM-YYYY');
      const rawDate = JSON.stringify(moment(thisDate));

      setBookingDate(displayDate);
      dispatch(
        onSetDateAndQueue({
          queue: 'later',
          formattedDate1,
          formattedDate2,
          rawDate,
        }),
      );

      setTimeout(() => {
        setIsVisible(false);

        setTimeout(() => {
          setIsPreparingSelection(false);
          setIsLoading(false);
        }, 250);
      }, 450);
    },
    [
      dispatch,
      isPreparingSelection,
      setBookingDate,
      setIsLoading,
      setIsVisible,
    ],
  );

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
    const formattedDate = moment(date).format('YYYY-MM-DD');

    // Constant-time lookup avoids repeated array scans while rendering calendar cells.
    const isEnabled = enabledDateSet.has(formattedDate);

    // Return true if the date is NOT in the enabledDates array (i.e., disable the date)
    return !isEnabled;
  };

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={1000}
      animationOutTiming={2000}
      onSwipeComplete={handleClose}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      useNativeDriver={false}
      hideModalContentWhileAnimating={false}
      backdropTransitionOutTiming={700}>
      <View style={styles.content}>
        <CalendarGreenCircle pointerEvents="none"
          height={75}
          width={75}
          style={{alignSelf: 'center', marginTop: -28}}
        />
        <Pressable
          onPress={handleClose}
          style={styles.closeButton}>
          <Icon
            name="close"
            type={IconType.MaterialIcons}
            color={v2Colors.lightRed}
            size={25}
          />
        </Pressable>
        <Header />
        {isFetchingDates || isPreparingSelection ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={v2Colors.green} />
            <Text color={v2Colors.greenShade2} style={styles.loadingText}>
              {isPreparingSelection
                ? 'Preparing booking schedule...'
                : 'Loading available dates...'}
            </Text>
          </View>
        ) : (
          <CalendarPicker
            startFromMonday
            minDate={minDate}
            // maxDate={maxDate}
            disabledDates={enableOnlySpecificDates}
            selectedDayColor={v2Colors.green}
            selectedDayTextColor={'#FFFFFF'}
            todayBackgroundColor={'transparent'}
            selectedDayStyle={{backgroundColor: v2Colors.green}}
            onDateChange={handleDateChange}
            previousComponent={<ChevronLeft pointerEvents="none" />}
            nextComponent={<ChevronRight pointerEvents="none" />}
            textStyle={{
              fontFamily: fonts.lexend.extraBold,
              fontWeight: '700',
              color: v2Colors.green,
              fontSize: 15,
            }}
            monthTitleStyle={{fontSize: 20, color: v2Colors.green}}
            yearTitleStyle={{fontSize: 20, color: v2Colors.green}}
          />
        )}

        <View style={styles.bottomContentContainer}>
          <Text
            color={v2Colors.green}
            style={{fontWeight: '600', fontSize: 16, marginBottom: 10}}>
            {selectedServiceType === 1
              ? 'Push Mowing Rules'
              : 'Ride-on Mowing Rules'}
          </Text>
          <BottomContent
            icon={<Message pointerEvents="none" />}
            text={`You can chat with the service provider to organise a time suitable for both of you on the selected date.`}
          />
          <BottomContent
            icon={<XCircle pointerEvents="none" />}
            text={`Cancel at no charge within 7 days from today.`}
          />
          <BottomContent
            icon={<SlashCircle pointerEvents="none" />}
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
