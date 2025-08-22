import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import VideoPlayer from 'react-native-video-controls';
import notifee from '@notifee/react-native';

// local imports
import createStyles from './HomeScreen.style';
import {useDispatch, useSelector} from 'react-redux';
import HeaderHome from '@shared-components/headers/HeaderHome';
import _ from 'lodash';
import {RootState} from 'store';
import FastImage from 'react-native-fast-image';
import Text from '@shared-components/text-wrapper/TextWrapper';
import fonts from '@fonts';
import Loader from '@shared-components/loaders/loader';
import UploadImagesLoader from '@shared-components/loaders/upload-loader.tsx';
import {grassLengthItems, mowHeightItems} from './data';
import * as NavigationService from 'react-navigation-helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
const GRASS_IMAGE_BG = '../../assets/v2/homescreen/images/grass-image.png';
import PIN from '@assets/v2/homescreen/icons/pin.svg';
import CALENDAR from '@assets/v2/homescreen/icons/calendar.svg';
import GALLERY from '@assets/v2/homescreen/icons/gallery.svg';

import ANKLE_HEIGHT from '@assets/v2/homescreen/images/ankle-height.svg';
import MID_CALF_HEIGHT from '@assets/v2/homescreen/images/mid-calf-height.svg';
import ABOVE_CALF_HEIGHT from '@assets/v2/homescreen/images/above-calf-height.svg';
import CALF_HEIGHT from '@assets/v2/homescreen/images/calf-height.svg';
import KNEE_HEIGHT from '@assets/v2/homescreen/images/knee-height.svg';
import GREEN_CHECK_CIRCLE from '@assets/v2/homescreen/icons/green-check-circle.svg';
import BIN from '@assets/v2/homescreen/images/bin.svg';
import COLLECT from '@assets/v2/homescreen/images/collect.svg';
import GRASS_HEIGHT_LOW from '@assets/v2/homescreen/images/grass-height-low.svg';
import GRASS_HEIGHT_MEDIUM from '@assets/v2/homescreen/images/grass-height-medium.svg';
import GRASS_HEIGHT_HIGH from '@assets/v2/homescreen/images/grass-height-high.svg';
import {
  onSetBookingIntervalServiceTimeValue,
  onSetBookingType,
  onSetDateAndQueue,
  onSetFee,
  onSetGrassClippingsValue,
  setSelectedServiceTypeId,
} from '@services/states/booking/booking.slice';
import {useAuth} from '@services/hooks/useAuth';
import {useProperty} from '@services/hooks/useProperty';
import {usePayment} from '@services/hooks/usePayment';
import {SCREENS} from '@shared-constants';
import {v2Colors} from '@theme/themes';
import CommonButton from '@shared-components/buttons/CommonButton';
import ActionSheet, {ActionSheetRef} from 'react-native-actions-sheet';
import SummaryModal from './components/summary-modal/SummaryModal';
import {
  CustomerPaymentInfo,
  ICustomerPaymentInfo,
} from '@services/models/payment';
import ActionSheetComponent from '@shared-components/bottom-sheets/action-sheet';
import CalendarModal from './components/calendar-modal/CalendarModal';
import {useBooking} from '@services/hooks/useBooking';
import BookingModal from './components/booking-modal/BookingModal';
import moment from 'moment';
import {onSetPropertyLength} from '@services/states/property/property.slice';
import ImageUploadFunction from 'shared/functions/ImageUpload';
import ChatCountHandler from 'shared/functions/ChatCountHandler';
import CenterModalV2 from '@shared-components/modals/center-modal/CenterModalV2';
import Onboarding from 'react-native-onboarding-swiper';
import WalletBottomValidation from '@shared-components/wallet-bottom-validation';
import NotificationEnabler from 'shared/functions/NotificationEnabler';
import CHEVRON_RIGHT from '@assets/v2/list/chevron-right.svg';

const ITEM_WIDTH = 100;

const HomeScreen = () => {
  /**
  |--------------------------------------------------
  | Constant
  |--------------------------------------------------
  */
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const errorActionSheetRef = useRef<ActionSheetRef>(null);
  const errorWalletActionRef = useRef<ActionSheetRef>(null);
  const [isOnboardVisible, setOnboardVisible] = useState<boolean>(false);
  /**
  |--------------------------------------------------
  | Hooks
  |--------------------------------------------------
  */
  const {getCustomerInfo, customerAppVersion} = useAuth();
  const {getCustomerProperties} = useProperty();
  const {customerPaymentMethodList} = usePayment();
  const {getRideOnMowingPricing, getGrassLengthList, getMowLengthList} =
    useBooking();

  /**
  |--------------------------------------------------
  | Redux
  |--------------------------------------------------
  */
  const {token, customerId, customerInfo, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );
  const {bookingType, property, formattedDate1, queue, lawnURIList} =
    useSelector((state: RootState) => state.booking);
  /**
  |--------------------------------------------------
  | States
  |--------------------------------------------------
  */
  //grass state
  const [selectedServiceType, setSelectedServiceType] = useState<number>(0);
  const [selectedGrassHeight, setSelectedGrassHeight] = useState<number>(99);
  const [selectedGrassClippings, setSelectedGrassClippings] =
    useState<number>(2);
  const [preferredHeight, setPreferredHeight] = useState<number>(99);

  const [error, setError] = useState<Array<any>>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // For image related functionalities
  const [imageAction, setImageAction] = useState<string>('');
  const [onUpload, setOnUpload] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDoneUploading, setIsDoneUploading] = useState<boolean>(false);

  // Modals
  const [showError, setShowError] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [refreshing, setRefreshing] = React.useState(false);

  //booking state

  const [bookingModalShow, setBookingModalShow] = useState<boolean>(false);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [grassLengthList, setGrassLengthList] =
    useState<Array<any>>(grassLengthItems);
  const [mowHeightList, setMowHeightList] =
    useState<Array<any>>(mowHeightItems);
  const [saveBookingData, setSaveBookingData] = useState<any>({});

  const [bookingServiceFeeObject, setBookingServiceFeeObject] = useState<{
    BookingServiceFee: string;
    CustomerDiscountId: number;
    DiscountName: string;
    TotalDiscount: string;
  }>({
    BookingServiceFee: '0',
    CustomerDiscountId: 0,
    DiscountName: '',
    TotalDiscount: '0',
  });
  const [propertyCount, setPropertyCount] = useState<number>(0);

  // cards related functionalities
  const [defaultCard, setDefaultCard] = useState<CustomerPaymentInfo>();

  // chat count handler
  const [didReceiveNotif, setDidReceiveNotif] = useState<boolean>(false);

  const videoRef = useRef(null);
  /**
  |--------------------------------------------------
  | Effects
  |--------------------------------------------------
  */
  useFocusEffect(
    useCallback(() => {
      onLoadOfHome();
    }, []),
  );

  const onLoadOfHome = () => {
    notifee.requestPermission();
    setIsLoading(true);
    fetchCustomerInfo();
    appversionCheck();
    setDidReceiveNotif(true);
    fetchGrassLengthList();
    setIsFetching(false);
    getDefaultCard();
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // remove playing when not in focus on home screen
        setOnboardVisible(false);
        AsyncStorage.setItem('Onboarding', 'true');
      };
    }, []),
  );

  // useEffect(async () => {
  //   let onboarding = await AsyncStorage.getItem('Onboarding');
  //   if(onboarding)
  //   // if (isOnboardVisible) {
  //   //   getCustomerProperty();
  //   // }
  // }, []);

  useEffect(() => {
    if (!bookingType) return;
    setBookingModalShow(false);

    // Queue Now
    if (bookingType === 1) {
      setBookingDate('Today');
      setShowCalendar(false);
      setIsLoading(false);
      dispatch(
        onSetDateAndQueue({
          queue: 'now',
          formattedDate1: moment().format('LLL'),
          formattedDate2: moment().format('DD-MM-YYYY'),
          rawDate: JSON.stringify(moment()),
        }),
      );
      return;
    }
  }, [bookingType]);

  useEffect(() => {
    checkoboardingSceenStatus();
  }, []);

  const checkoboardingSceenStatus = async () => {
    let onboarding = await AsyncStorage.getItem('Onboarding');
    if (onboarding == 'null' || onboarding == null) {
      setOnboardVisible(true);
    }
  };
  // ? resets the value of selectedServiceType when property.propertyIndex changes
  useEffect(() => {
    if (!property?.propertyIndex) return;
    dispatch(onSetPropertyLength(property?.propertyIndex));
    dispatch(onSetGrassClippingsValue({label: 'No', value: '2'}));
    resetBookingIntervalServiceTimeValue();
  }, [property?.propertyIndex]);

  // ? resets the value of grassClippingsValue when selectedServiceType changes to 29 (Mulch & Edge)
  useEffect(() => {
    if (selectedServiceType === 1) {
      dispatch(onSetGrassClippingsValue({label: 'No', value: '2'}));
    }
  }, [selectedServiceType]);

  // ? resets the selectedServiceType when property requires ride-on mowing service only
  useEffect(() => {
    if (property?.serviceType?.includes('Ride-on')) setSelectedServiceType(2);
    else setSelectedServiceType(1);
  }, [property.serviceType]);

  // ? Selects the service type to show
  useEffect(() => {
    if (property?.serviceType?.includes('Push')) setSelectedServiceType(1);
  }, [property.serviceType]);

  // ? Dispatches the service type for scheduled booking
  useEffect(() => {
    dispatch(setSelectedServiceTypeId(selectedServiceType));
  }, [selectedServiceType]);

  /**
  |--------------------------------------------------
  | API Calls
  |--------------------------------------------------
  */

  const fetchCustomerInfo = () => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      ...deviceDetails,
    };

    setIsLoading(true);
    getCustomerInfo(
      payload,
      () => {
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
    );
  };

  const appversionCheck = () => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
    };

    customerAppVersion(
      payload,
      (data: any) => {
        if (data.StatusCode === '00') {
          // check os version
          if (Platform.OS === 'ios') {
            console.log('current version', deviceDetails.AppVersion);
            console.log('version from api', data.AppVersionIos);
            if (
              parseInt(data.AppVersionIos) > parseInt(deviceDetails.AppVersion)
            ) {
              Alert.alert(
                'Update Required',
                'A new version of the app is available. Please update to continue.',
                [
                  {
                    text: 'Update Now',
                    onPress: () => Linking.openURL(data.AppIosUrl),
                  },
                  {text: 'Cancel', style: 'cancel'},
                ],
                {cancelable: false},
              );
            } else {
              console.log('up to date');
            }
          } else {
            // for android update
            if (
              parseInt(data.AppVersionAndroid) >
              parseInt(deviceDetails.AppVersion)
            ) {
              Alert.alert(
                'Update Required',
                'A new version of the app is available. Please update to continue.',
                [
                  {
                    text: 'Update Now',
                    onPress: () => Linking.openURL(data.AppAndroidUrl),
                  },
                  {text: 'Cancel', style: 'cancel'},
                ],
                {cancelable: false},
              );
            } else {
              console.log('up to date');
            }
          }
        }
      },
      () => {
        setIsLoading(false);
      },
    );
  };

  const fetchCustomerProperties = () => {
    NavigationService.push(SCREENS.LIST, {
      isSearchable: true,
      type: 'property',
      pageTitle: 'Select Property',
      navigateTo: SCREENS.HOME,
    });
  };

  const fetchGrassLengthList = () => {
    const payload = {
      CustomerId: customerId,
      CustomerToken: token,
      DeviceDetails: deviceDetails,
    };
    // console.log("getGrassLengthList payload:", payload);
    getGrassLengthList(
      payload,
      (data: any) => {
        const fetchedData = data[0].Data;
        const formatData = fetchedData?.map((item: any, index: number) => {
          item.GrassLengthDesc = `${item.GrassLengthDesc.split(' ')[0]}\n${
            item.GrassLengthDesc.split(' ')[1]
          }`;
          item.GrassLengthId = Number(item.GrassLengthId);
          item.PercentageChange = Number(item.PercentageChange);
          return item;
        });
        setGrassLengthList(formatData);

        fetchMowLengthList();
      },
      (err: any) => {
        console.log('getGrassLengthList err:', err);
        setIsLoading(false);
      },
    );
  };

  const fetchMowLengthList = () => {
    const payload = {
      CustomerId: customerId,
      CustomerToken: token,
      DeviceDetails: deviceDetails,
    };
    getMowLengthList(
      payload,
      (data: any) => {
        const fetchedData = data[0].Data;
        // console.log("getMowLengthList fetchedData:", fetchedData);
        const formatData = fetchedData?.map((item: any) => {
          item.MowLengthId = Number(item.MowLengthId);
          return item;
        });
        setMowHeightList(formatData);
        setIsLoading(false);
      },
      (err: any) => {
        console.log('getMowLengthList err:', err);
        setIsLoading(false);
      },
    );
  };

  const fetchMowingPricing = () => {
    setIsFetching(true);

    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      PropertyId: property.value,
      ServiceType: `${property.serviceType}`,
      LandArea: property.lawnArea,
      BookingServiceId: selectedServiceType,
      IsGrassCollected: selectedGrassClippings,
      GrassLengthId: selectedGrassHeight,
      DeviceDetails: deviceDetails,
      PaymentCustomerMethodId: defaultCard?.CustomerStripePaymentId ?? '',
    };

    console.log(payload);
    getRideOnMowingPricing(
      payload,
      (data: any) => {
        const fetchedFee = data[0];

        console.log(fetchedFee);

        const {
          GSTFee,
          OriginalAmount,
          StatusCode,
          StatusMessage,
          StripeFee,
          TotalAmount,
          CustomerDiscountId,
          TotalDiscount,
          DiscountName,
        } = fetchedFee;
        console.log(GSTFee, OriginalAmount, StripeFee, TotalAmount);

        saveBooking(GSTFee, OriginalAmount, StripeFee, TotalAmount);
        setBookingServiceFeeObject({
          BookingServiceFee: TotalAmount,
          CustomerDiscountId: CustomerDiscountId,
          TotalDiscount: TotalDiscount,
          DiscountName: DiscountName,
        });
        onSaveFee(TotalAmount);

        setShowSummary(true);
        setIsFetching(false);
      },
      (err: any) => {
        Alert.alert('Oops', 'Something went wrong. Please try again later.');
        setIsFetching(false);
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
              setIsFetching(false);
            }
          } else {
            setIsFetching(false);
          }
        });
      },
      (error: any) => {
        console.log('customerPaymentMethodList error:', error);
        setIsFetching(false);
        return;
      },
    );
  };

  /**
  |--------------------------------------------------
  | Methods
  |--------------------------------------------------
  */

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

  const getCurrentDateTimePlus30Seconds = () => {
    const now = new Date();

    // Add 30 seconds to the current time
    now.setSeconds(now.getSeconds() + 30);

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

  const getCurrentEpochTimePlus30Seconds = () => {
    const now = new Date();

    // Add 30 seconds to the current time
    now.setSeconds(now.getSeconds() + 30);

    // Convert to epoch time (milliseconds since Jan 1, 1970)
    const epochTime = now.getTime();

    return epochTime;
  };

  const getCurrentEpochTimeSeconds = () => {
    const now = new Date();

    const epochTime = now.getTime();

    return epochTime;
  };

  const saveBooking = (
    _gSTFee: string,
    _originalAmount: string,
    _stripeFee: string,
    _totalAmount: string,
  ) => {
    let request = new FormData();

    let _getCurrentDateTime = getCurrentDateTime();
    let _getExpiryDate = getCurrentDateTimePlus30Seconds();
    let _getCurrentEpoch = getCurrentEpochTimeSeconds();
    let _getExpiryEpoch = getCurrentEpochTimePlus30Seconds();

    request.append('CustomerToken', token);
    request.append('CustomerId', customerId);
    for (let i = 0; i < lawnURIList.length; i++) {
      request.append('LawnImages', lawnURIList[i]);
    }
    request.append('AddressId', property.value);
    request.append('ServiceProviderId', 0);
    request.append('Cost', Number(_originalAmount) || 0);
    request.append('TotalCost', Number(_totalAmount) || 0);
    request.append('GSTFee', Number(_gSTFee) || 0);
    request.append('StripeCommissionFee', Number(_stripeFee) || 0);
    request.append('BookingServiceStepId', selectedServiceType);
    request.append('BookingTypeId', selectedServiceType);
    request.append('Remarks', 'Empty');
    request.append('GrassLengthId', selectedGrassHeight || '1');
    request.append('MowLengthId', preferredHeight || '1');
    request.append('BookingServiceTypeId', selectedServiceType || 0);

    //--
    request.append('BookingStartDateTime', _getCurrentDateTime);
    request.append('BookingExpiryDateTime', _getExpiryDate);
    request.append('BoookingStartEpochTime', _getCurrentEpoch);
    request.append('BookingExpiryEpochTime', _getExpiryEpoch);

    request.append('DeviceDetails.AppVersion', deviceDetails.AppVersion);
    request.append('DeviceDetails.DeviceModel', deviceDetails.DeviceModel);
    request.append('DeviceDetails.DeviceVersion', deviceDetails.DeviceVersion);
    request.append('DeviceDetails.IpAddress', deviceDetails.IpAddress);
    request.append('DeviceDetails.MacAddress', deviceDetails.MacAddress);
    request.append('DeviceDetails.Platform', deviceDetails.Platform);
    request.append('DeviceDetails.PlatformOs', deviceDetails.PlatformOs);

    setSaveBookingData(request);
  };

  const onSaveFee = (fee: number) => {
    dispatch(onSetFee(fee));
  };
  const resetBookingIntervalServiceTimeValue = () => {
    dispatch(onSetBookingIntervalServiceTimeValue({label: '', value: '0'}));
  };

  /**
  |--------------------------------------------------
  | Event Handlers
  |--------------------------------------------------
  */
  const handleSelectProperty = () => {
    fetchCustomerProperties();
  };

  const _validateBeforeBookSchedule = async () => {
    let errorArray = [];
    if (!property.label) errorArray.push(`Please select a property`);
    if (selectedGrassHeight === 99)
      errorArray.push(`Please select a grass height`);
    if (selectedGrassClippings === 2)
      errorArray.push(`Please select grass a clippings option`);
    if (preferredHeight === 99)
      errorArray.push(`Please select preffered mow height`);

    if (errorArray.length > 0) {
      setError(errorArray);
      setShowError(true);
      errorActionSheetRef.current?.show();
      return true;
    }
    return false;
  };

  const onConfirm = async () => {
    // validate all booking details
    let errorArray = [];
    if (!property.label) errorArray.push(`Please select a property`);
    if (!bookingType) errorArray.push(`Please select a booking type`);
    if (selectedGrassHeight === 99)
      errorArray.push(`Please select a grass height`);
    if (selectedGrassClippings === 2)
      errorArray.push(`Please select grass a clippings option`);
    if (preferredHeight === 99)
      errorArray.push(`Please select preffered mow height`);

    if (errorArray.length > 0) {
      setError(errorArray);
      setShowError(true);
      errorActionSheetRef.current?.show();
      return;
    }
    fetchMowingPricing();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      onLoadOfHome();
      setRefreshing(false);
    }, 2000);
  }, []);

  /**
  |--------------------------------------------------
  | Components
  |--------------------------------------------------
  */
  const ServiceType = () => (
    <View style={styles.serviceTypeContainer}>
      <View style={styles.serviceTypeTextContainer}>
        <FastImage
          style={styles.grassBGcontainer}
          resizeMode="contain"
          source={require(GRASS_IMAGE_BG)}
        />
        <Text
          fontFamily={fonts.lexend.extraBold}
          h3
          color="white"
          style={styles.serviceTypeText}>
          Trim - Edge - Mow - Blow
        </Text>
      </View>
    </View>
  );

  const PropertyAndDateSelection = () => (
    <>
      <Text
        color={v2Colors.greenShade2}
        style={{marginTop: 20, fontWeight: 'bold'}}>
        STEP 1
      </Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.leftActionContainer}
          onPress={handleSelectProperty}>
          <View style={{flexDirection: 'row'}}>
            <Text
              h4
              color={property.value === '0' ? 'rgba(0,0,0,0.5)' : 'black'}
              style={{fontWeight: '300'}}>
              {property.value === '0'
                ? 'Tap here to choose a property'
                : _.truncate(_.upperFirst(property.label), {length: 20})}
            </Text>
          </View>

          <CHEVRON_RIGHT />
        </TouchableOpacity>
        <View style={styles.verticalSeparator} />
      </View>
    </>
  );

  const DateSelectionScreen = () => (
    <>
      <Text
        color={v2Colors.greenShade2}
        style={{marginBottom: 5, marginTop: 20, fontWeight: 'bold'}}>
        STEP 6
      </Text>
      <View style={styles.dateActionsContainer}>
        <TouchableOpacity
          style={styles.leftActionContainer}
          onPress={async () => {
            if (await _validateBeforeBookSchedule()) {
              return;
            } else {

              // setBookingModalShow(true);
                  dispatch(onSetBookingType(2));
                  setIsLoading(true);
                  setTimeout(() => {
                    setShowCalendar(true);
                    setIsLoading(false);
                  }, 1000);
              setBookingDate('');
            }
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text
              h4
              color={property.value === '0' ? 'rgba(0,0,0,0.5)' : 'black'}
              style={{fontWeight: '300'}}>
              {bookingDate || 'Select Booking Schedule'}
            </Text>
          </View>
          <CALENDAR />
        </TouchableOpacity>
      </View>
    </>
  );

  const GreenCircleCheck = () => (
    <GREEN_CHECK_CIRCLE
      height={35}
      width={35}
      style={styles.greenCheckCircle}
    />
  );

  const computeGrassLengthId = (
    GrassLengthId: number,
    GrassLengthUnit: any,
    PercentageCharge: number,
  ) => {
    setSelectedGrassHeight(GrassLengthId);
  };

  const GrassCard = (item: any) => {
    const {GrassLengthId, GrassLengthDesc, GrassLengthUnit, PercentageCharge} =
      item.item;
    return (
      <TouchableOpacity
        onPress={() =>
          computeGrassLengthId(GrassLengthId, GrassLengthUnit, PercentageCharge)
        }
        style={styles.grassHeightCardContainer}>
        <View
          style={[
            styles.grassLengthSquareContainer,
            selectedGrassHeight === GrassLengthId && styles.highlightedBorder,
          ]}>
          {selectedGrassHeight === GrassLengthId && <GreenCircleCheck />}
        </View>

        <View style={styles.grassLengthTopPart}>
          {GrassLengthId === 1 && <ANKLE_HEIGHT />}
          {GrassLengthId === 2 && <MID_CALF_HEIGHT />}
          {GrassLengthId === 3 && <ABOVE_CALF_HEIGHT />}
          {GrassLengthId === 4 && <CALF_HEIGHT />}
          {GrassLengthId === 5 && <KNEE_HEIGHT />}
        </View>

        <View style={styles.grassLengthLowerPart}>
          <Text center h5 color={'black'}>
            {GrassLengthDesc}
          </Text>
          <View style={{height: 5}} />
          <Text center h5 color={v2Colors.highlight}>
            {GrassLengthUnit}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const GrassLength = () => (
    <>
      <Text
        color={v2Colors.greenShade2}
        style={{marginTop: 30, fontWeight: 'bold'}}>
        STEP 2
      </Text>
      <Text color={v2Colors.green} style={{fontSize: 21}}>
        Select Current Lawn Height
      </Text>
      <View style={styles.grassLengthContainer}>
        <FlatList
          data={grassLengthList}
          renderItem={GrassCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={
            selectedGrassHeight === 99 ? 0 : selectedGrassHeight - 1
          }
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
        />
      </View>
    </>
  );

  const GrassCilippings = () => (
    <>
      <Text
        color={v2Colors.greenShade2}
        style={{marginTop: 30, fontWeight: 'bold'}}>
        STEP 3
      </Text>
      <Text color={v2Colors.green} style={{fontSize: 21}}>
        Select Lawn Clippings Option
      </Text>
      <View style={styles.grassClippingsContainer}>
        <TouchableOpacity
          onPress={() => {
            setSelectedGrassClippings(0);
            dispatch(onSetGrassClippingsValue({label: 'No', value: '2'}));
          }}
          style={[
            styles.grassClippingsSquare,
            selectedGrassClippings === 0 && styles.highlightedBorder,
          ]}>
          {selectedGrassClippings === 0 && <GreenCircleCheck />}
          <BIN style={{marginRight: 10}} />
          <Text color={v2Colors.green}>{`I have my\nown bin`}</Text>
        </TouchableOpacity>
        <View style={{width: '8%'}} />

        <TouchableOpacity
          onPress={() => {
            setSelectedGrassClippings(1);
            dispatch(onSetGrassClippingsValue({label: 'Yes', value: '1'}));
          }}
          style={[
            styles.grassClippingsSquare,
            selectedGrassClippings === 1 && styles.highlightedBorder,
          ]}>
          {selectedGrassClippings === 1 && <GreenCircleCheck />}
          <COLLECT style={{marginRight: 10}} />
          <Text color={v2Colors.green}>{`Collect lawn\nclippings`}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const MowCard = (props: {
    item: {MowLengthId: number; MowLengthDesc: string};
  }) => {
    const {MowLengthId, MowLengthDesc} = props.item;
    return (
      <TouchableOpacity
        onPress={() => setPreferredHeight(MowLengthId)}
        style={[
          styles.mowHeightCardContainer,
          preferredHeight === MowLengthId && styles.highlightedBorder,
        ]}
        key={MowLengthId}>
        <Text
          center
          color={v2Colors.green}
          style={{fontSize: 18, marginTop: 30}}>
          {MowLengthDesc}
        </Text>
        {MowLengthId === 1 && (
          <GRASS_HEIGHT_LOW
            width={'100%'}
            style={[styles.grassBottom, {marginBottom: -16}]}
          />
        )}
        {MowLengthId === 2 && (
          <GRASS_HEIGHT_MEDIUM
            width={'100%'}
            style={[styles.grassBottom, {marginBottom: -10}]}
          />
        )}
        {MowLengthId === 3 && (
          <GRASS_HEIGHT_HIGH width={'100%'} style={[styles.grassBottom]} />
        )}
        {preferredHeight === MowLengthId && <GreenCircleCheck />}
      </TouchableOpacity>
    );
  };

  const MowHeight = () => (
    <>
      <Text
        color={v2Colors.greenShade2}
        style={{marginTop: 30, fontWeight: 'bold'}}>
        STEP 4
      </Text>
      <Text color={v2Colors.green} style={{fontSize: 21}}>
        Preferred Mowing Height
      </Text>
      <Text color={v2Colors.green} style={{marginTop: 5}}>
        Tip:{' '}
        <Text color={v2Colors.greenShade2}>
          Confirm mower height settings with your provider on service day for
          optimal results
        </Text>
      </Text>
      <View style={styles.mowHeightSelectionContainer}>
        {mowHeightList.map((item: any, index: number) => {
          return <MowCard item={item} key={index} />;
        })}
      </View>
    </>
  );

  const ImageUploadAction = (props: any) => (
    <TouchableOpacity
      onPress={() => {
        if (!property.label) {
          const errorArray = ['Please select a property first'];

          setError(errorArray);
          Alert.alert('Please select a property first');
          return;
        }
        setImageAction('gallery');
      }}
      disabled={props.actionType === 'camera'}
      style={[styles.buttonSelectImage, {opacity: 1}]}>
      {props.icon}
      <View style={{margin: 2, paddingRight: 10}}></View>
      <Text color={v2Colors.green} style={{fontSize: 12}}>
        {'From Gallery'}
      </Text>
    </TouchableOpacity>
  );

  const renderImages = (value: any) => {
    return (
      <View>
        <FastImage
          source={{uri: value.item.uri}}
          style={styles.lawnImages}
          resizeMode={'cover'}
        />
      </View>
    );
  };
  const ImageUploads = () => (
    <>
      <View style={{flexDirection: 'row'}}>
        <Text
          color={v2Colors.greenShade2}
          style={{marginBottom: 5, fontWeight: 'bold'}}>
          STEP 5
        </Text>
        <Text color={v2Colors.orange} style={{marginBottom: 5, marginLeft: 5}}>
          (Optional)
        </Text>
      </View>

      <View style={styles.imageContainer}>
        {!lawnURIList.length ? (
          <>
            <Text color={v2Colors.green} style={{fontSize: 21}}>
              Upload lawn images
            </Text>
            <Text color={v2Colors.greenShade2} style={{marginTop: 5}}>
              Uploaded images should reflect the current lawn height
            </Text>
          </>
        ) : (
          <View style={{height: 100, width: '100%'}}>
            <FlatList
              data={lawnURIList}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
              renderItem={renderImages}
              keyExtractor={(item, index) => `${index}${item}`}
            />
          </View>
        )}
        <View style={styles.imageUploadSelectContainer}>
          <ImageUploadAction icon={<GALLERY />} actionType="gallery" />
        </View>
      </View>
    </>
  );

  const Confirm = () => (
    <View style={styles.button}>
      <CommonButton
        text={'Instant Quote'}
        onPress={onConfirm}
        isFetching={isFetching || isUploading}
        disabled={isFetching || isUploading}
        backgroundColor={v2Colors.green}
      />
    </View>
  );
  const DoneButton = ({...props}) => (
    <TouchableOpacity
      style={{
        padding: 20,
        backgroundColor: 'green',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      }}
      {...props}
      onPress={() => {
        setOnboardVisible(false);
        AsyncStorage.setItem('Onboarding', 'true');
        onLoadOfHome();
      }}>
      <Text h3 bold color={'white'}>
        Exit
      </Text>
    </TouchableOpacity>
  );
  return (
    <>
      <HeaderHome
        name={_.truncate(_.upperFirst(customerInfo.Firstname), {length: 20})}
      />
      <NotificationEnabler />
      {isOnboardVisible ? (
        <View style={{flex: 1}}>
          <Onboarding
            DoneButtonComponent={DoneButton}
            onDone={() => {
              setOnboardVisible(false);
              AsyncStorage.setItem('Onboarding', 'true');
            }}
            nextLabel="Ready"
            skipLabel="Replay"
            onSkip={() => {
              NavigationService.navigate(SCREENS.HOME);
            }}
            imageContainerStyles={{flex: 1}}
            pages={[
              {
                backgroundColor: '#fff',
                image: (
                  <VideoPlayer
                    ref={videoRef}
                    // Can be a URL or a local file.
                    source={require('../../assets/images/defaults/onboarding.mp4')}
                    style={{
                      position: 'absolute',
                      aspectRatio: 1,
                      height: '60%',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                    }}
                  />
                ),
                title: 'Onboarding',
                subtitle: 'Done with React Native Onboarding Swiper',
              },
            ]}
          />
        </View>
      ) : (
        <View style={styles.container}>
          <ServiceType />
          {isLoading && <Loader />}
          {isUploading && <UploadImagesLoader />}

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={[
              styles.scrollContainer,
              {zIndex: isUploading || isLoading ? 1 : 99},
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {/* Select Property & Select Date */}
            <PropertyAndDateSelection />

            {/* Select your current grass length */}
            <GrassLength />

            {/* Collect grass Clippings */}
            <GrassCilippings />

            {/* Preferred mow heigth */}
            <MowHeight />

            {/* Upload Lawn images */}
            <ImageUploads />

            <DateSelectionScreen />

            {/* Submit Confirm */}
            <Confirm />
          </ScrollView>
        </View>
      )}
      <SummaryModal
        isVisible={showSummary}
        setIsVisible={setShowSummary}
        title={'Summary'}
        style={{borderRadius: 5}}
        data={{
          date: formattedDate1,
          serviceName: selectedServiceType,
          name: property.label,
          fee: bookingServiceFeeObject?.BookingServiceFee || '0',
          customerDiscountId: bookingServiceFeeObject.CustomerDiscountId ?? 0,
          discountName: bookingServiceFeeObject?.DiscountName ?? '',
          totalDiscount: bookingServiceFeeObject?.TotalDiscount ?? '0',
          collectClippings: selectedGrassClippings,
        }}
        payload={saveBookingData}
        queue={queue}
        defaultCard={defaultCard}
      />
      {/* Error items bottom sheet*/}
      <ActionSheet ref={errorActionSheetRef}>
        <ActionSheetComponent
          title={'Missing Items'}
          data={error}
          onHide={errorActionSheetRef}
          onPressConfirm={() => {}}
        />
      </ActionSheet>
      <ActionSheet ref={errorWalletActionRef}>
        <WalletBottomValidation
          title={'Setup Your Wallet '}
          data={error}
          onHide={errorWalletActionRef}
          onPressConfirm={() => NavigationService.navigate(SCREENS.PAYMENT)}
        />
      </ActionSheet>

      {/* Calendar Modal */}
      <CalendarModal
        isVisible={showCalendar}
        setIsVisible={setShowCalendar}
        setBookingDate={setBookingDate}
        setIsLoading={setIsLoading}
        selectedServiceType={selectedServiceType}
        addressId={property.value}
        canCollectWaste={selectedGrassClippings}
      />

      {/* <BookingModal
        isVisible={bookingModalShow}
        setIsVisible={setBookingModalShow}
        setShowCalendar={setShowCalendar}
        setIsLoading={setIsLoading}
      /> */}

      <ImageUploadFunction
        processType={'booking'}
        action={imageAction}
        setAction={setImageAction}
        onUpload={onUpload}
        setOnUpload={setOnUpload}
        setIsUploading={setIsUploading}
        setIsDoneUploading={setIsDoneUploading}
        actionOnDoneUploading={() => setIsDoneUploading(true)}
      />

      <ChatCountHandler
        didReceiveNotif={didReceiveNotif}
        setDidReceiveNotif={setDidReceiveNotif}
      />

      <CenterModalV2
        isVisible={isDoneUploading}
        setIsVisible={setIsDoneUploading}
        onPressButton={fetchMowingPricing}
      />
    </>
  );
};

export default HomeScreen;
