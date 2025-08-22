import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  Alert,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import {useDispatch, useSelector} from 'react-redux';
import moment, {Moment} from 'moment';
import {size} from 'lodash';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useForm} from 'react-hook-form';
import auth from '@react-native-firebase/auth';

/** Local imports */
import createStyles from './OTPScreen.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CommonButton from '@shared-components/buttons/CommonButton';
import KeyboardHandler from '@shared-components/containers/KeyboardHandler';

import {AUTHENTICATION, SCREENS} from '@shared-constants';
import {useAuth} from '@services/hooks/useAuth';
import {v2Colors} from '@theme/themes';
import ARROW_LEFT from '@assets/v2/headers/arrow-left.svg';
import InputText from '@shared-components/form/InputText/v2/input-text';
import {RootState} from 'store';
import {
  onSaveBasicSignupDetails,
  onSetPasswords,
  onUserLogin,
} from '@services/states/user/user.slice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_BG = '../../../assets/v2/auth/images/image-bg.png';
const INITIAL_OTP_TIMER = moment().set('minutes', 0).set('second', 30);
import messaging from '@react-native-firebase/messaging';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IOTPScreenProps {
  style?: CustomStyleProp;
  route: any;
}

const OTPScreen: React.FC<IOTPScreenProps> = ({route}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /** Redux state */
  const dispatch = useDispatch();
  const {basicSignupDetails, password1, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );

    const {
      isUpdate,
      isUsed,
      lawnArea,
      propertyName,
      address,
      geometry,
      propertyId,
      addPropURIList,
      selectedPet,
      selectedServiceType,
      selectedTerrainType,
      Country,
      StreetName,
      StreetNumber,
      State,
      Suburb,
      PostalCode,
      Remarks,
    } = useSelector((state: RootState) => state.property);

  const {MobileNumber} = basicSignupDetails;

  const {TOKEN, CUSTOMER_ID, MOBILE_NO} = AUTHENTICATION;

  /** If fromForgotPassword, use route.params.mobile; otherwise, use MobileNumber */
  const isForgotPassword = route.params?.fromForgotPassword;
  const phoneForOTP = isForgotPassword
    ? // If the incoming phone doesn't start with '0', add '0' after country code
      route.params?.mobile[0] !== '0'
      ? `+610${route.params?.mobile}`
      : `+61${route.params?.mobile}`
    : MobileNumber;

  /** Hook from your custom useAuth() */
  const {register, saveRegistration} = useAuth();

  /**
   * State
   */
  const [confirmation, setConfirmation] =
    useState<auth.ConfirmationResult | null>(null);

  /** Tracks if user was auto-verified */
  const [isAutoVerified, setIsAutoVerified] = useState<boolean>(false);

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(
    'The OTP you have entered is incorrect',
  );

  const [showResend, setShowResend] = useState<boolean>(false);
  const [timer, setTimer] = useState<Moment>(INITIAL_OTP_TIMER);

  /**
   * Form (React Hook Form + Yup)
   */
  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
  } = useForm({
    defaultValues: {
      code: '',
    },
    resolver: yupResolver(
      yup.object().shape({
        code: yup
          .string()
          .required('OTP is required.')
          .min(6, 'OTP must be 6 digits')
          .max(6, 'OTP must be 6 digits'),
      }),
    ),
  });

  /**
   * ----------------------------------------------------------------
   * useEffects and Focus Effects
   * ----------------------------------------------------------------
   */

  // 1) onAuthStateChanged -> detect auto-verification
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async user => {
      if (user && !isAutoVerified) {
        setIsAutoVerified(true);
        // Alert.alert('Success', 'Phone number verified automatically!');

        // If from Forgot Password, navigate to Set Password
        if (isForgotPassword) {
          auth()
            .signOut()
            .then(() => {
              setIsFetching(false);
              NavigationService.navigate(SCREENS.SET_PASS, {
                fromForgotPassword: true,
                mobile: route.params?.mobile,
              });
            })
            .catch(error => {
              console.error('SignOut error', error);
            });
        } else {
          // Otherwise, do the registration flow
          setIsFetching(false);
          onRegister();
        }
      }
    });
    return () => subscriber(); // Cleanup listener
  }, [isAutoVerified, isForgotPassword, route.params?.mobile]);

  // 2) On screen focus → Send OTP initially
  useFocusEffect(
    useCallback(() => {
      onSendOTP();
    }, []),
  );

  // 3) Timer logic for resend
  useEffect(() => {
    if (!showResend) {
      setTimer(INITIAL_OTP_TIMER);
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => moment(prev).subtract(1, 'seconds'));
    }, 1000);

    // Stop when time hits "0:00"
    if (moment(timer).format('m:ss') === '0:00') {
      setShowResend(false);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [showResend, timer]);

  // 4) Watch form errors -> set error states
  useEffect(() => {
    if (size(errors) > 0) {
      setErrorMessage('The OTP you have entered is incorrect');
      setIsError(true);
    } else {
      setIsError(false);
    }
  }, [errors]);

  /**
   * ----------------------------------------------------------------
   * Helper Methods
   * ----------------------------------------------------------------
   */

  /** Optional: Check if device time is in sync (your existing check) */
  const checkTimeSync = () => {
    const serverTime = moment(); // Simulate fetching server time
    const deviceTime = moment();
    const timeDifference = Math.abs(serverTime.diff(deviceTime, 'seconds'));

    if (timeDifference > 10) {
      Alert.alert(
        'Time Error',
        'Your device time appears to be incorrect. Please enable automatic date and time settings and try again.',
      );
      return false;
    }
    return true;
  };

  const onSendOTP = useCallback(async () => {
    setIsFetching(true);
    try {
      console.log(phoneForOTP, 'jmdd');
      const confirmationResult =
        await auth().signInWithPhoneNumber(phoneForOTP);
      setConfirmation(confirmationResult);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      let msg = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/too-many-requests') {
        msg = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        msg = 'SMS quota exceeded. Please try again later.';
      } else if (error.code === 'auth/invalid-phone-number') {
        msg = 'Invalid phone number. Please check the format.';
      }
      Alert.alert('OTP Error', msg);
    }
    setIsFetching(false);
  }, [phoneForOTP]);

  /**
   * Called when user taps "Confirm" button
   */
  const onSubmit = handleSubmit(() => {
    // 1) Check device time
    if (!checkTimeSync()) {
      return;
    }

    // 2) If already auto-verified, skip manual confirm
    if (isAutoVerified) {
      Alert.alert('Already Verified', 'Your phone is already verified.');
      return;
    }

    // 3) Validate code format
    const {code} = getValues();
    if (!/^\d{6}$/.test(code.trim())) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    // 4) Manually confirm code (since not auto-verified)
    setIsFetching(true);
    onValidateOTP(code.trim());
  });

  /**
   * Manually confirm the OTP code if auto-verification didn't happen
   */
  const onValidateOTP = async (code: string) => {
    if (!confirmation) {
      setIsFetching(false);
      Alert.alert('Error', 'Please request an OTP first.');
      return;
    }

    try {
      await confirmation.confirm(code);
      // If success, we proceed
      setIsFetching(false);
      Alert.alert(
        'Success',
        'Phone number verified successfully!Click Ok to register!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (isForgotPassword) {
                // forgot password → go to set pass
                NavigationService.navigate(SCREENS.SET_PASS, {
                  fromForgotPassword: true,
                  mobile: route.params?.mobile,
                });
              } else {
                // do registration
                onRegister();
              }
            },
          },
        ],
      );
    } catch (error: any) {
      setIsFetching(false);
      console.error('OTP verification failed:', error);

      switch (error.code) {
        case 'auth/invalid-verification-code':
          Alert.alert('Error', 'Invalid OTP. Please try again.');
          break;
        case 'auth/session-expired':
          Alert.alert(
            'Error',
            'The OTP session has expired. Please request a new OTP.',
          );
          break;
        default:
          Alert.alert('Error', 'Something went wrong. Please try again later.');
          break;
      }
    }
  };

  /**
   * Registration flow if not fromForgotPassword
   */
  const onRegister = async () => {
    await auth().signOut(); // clear local session


    const payload = {
      CustomerPassword: password1,
      EmailAddress: basicSignupDetails.EmailAddress,
      MobileNumber: basicSignupDetails.MobileNumber,
      Firstname: basicSignupDetails.Firstname,
      Lastname: basicSignupDetails.Lastname,
      Alias: StreetName === '' ? Suburb : StreetNumber + ' ' + StreetName,
      Address: address,
      Country: Country,
      State: State,
      Suburb: Suburb,
      StreetName: StreetName,
      StreetNumber: StreetNumber,
      PostalCode: PostalCode,
      HasIndoorPets: selectedPet,
      Longitude: geometry.lng,
      Latitude: geometry.lat,
      ServiceTypeId: selectedServiceType,
      TerrainType: selectedTerrainType,
      Remarks: Remarks,
      DeviceDetails: deviceDetails,
    };

    setIsFetching(true);

    saveRegistration(
      payload,
      (data: any) => {
        if (data.StatusCode === '00') {
          Alert.alert('Registration', 'Successfully signed up!', [
            {
              text: 'Confirm',
              onPress: async () => {
                // Clear Redux states
                dispatch(
                  onSaveBasicSignupDetails({
                    EmailAddress: '',
                    MobileNumber: '',
                    Firstname: '',
                    Lastname: '',
                    Address: '',
                  }),
                );
                dispatch(onSetPasswords({password1: '', password2: ''}));

                // implementation of after sigunup go to welcome page

                const {CustomerToken, CustomerId, MobileNuber} = data;

                console.log('TOKEN', CustomerToken);
                console.log('CUSTOMER_ID', CustomerToken);
                console.log('MOBILE_NO', MobileNuber);

                AsyncStorage.setItem(TOKEN, CustomerToken);
                AsyncStorage.setItem(CUSTOMER_ID, CustomerId);
                AsyncStorage.setItem(MOBILE_NO, MobileNuber);
                dispatch(onUserLogin(CustomerId));
                // await requestUserPermissionForFirebase();
                NavigationService.navigate(SCREENS.WELCOME);
              },
            },
          ]);
        } else {
          setIsError(true);
          setIsFetching(false);
          setErrorMessage(data.StatusMessage);
        }
      },
      (err: any) => {
        console.log('onRegister err:', err);
        Alert.alert('Registration', 'Something went wrong. Please try again.');
        setIsError(false);
        setIsFetching(false);
      },
    );
  };

  const requestUserPermissionForFirebase = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  };

  /**
   * Resend logic
   */
  const onResend = () => {
    setShowResend(true);
    onSendOTP();
  };

  /**
   * ----------------------------------------------------------------
   * Render Methods
   * ----------------------------------------------------------------
   */
  const Header = (props: {pageTitle: string}) => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => NavigationService.goBack()}>
        <ARROW_LEFT style={{marginTop: 4, marginRight: 10}} />
      </TouchableOpacity>
      <Text h2 bold color={v2Colors.green}>
        {props.pageTitle}
      </Text>
    </View>
  );

  const ErrorMessageView = () => {
    if (!isError) return null;
    return (
      <View style={styles.errorContainer}>
        <Icon
          style={{marginRight: 10}}
          name="warning"
          type={IconType.AntDesign}
          color="white"
          size={20}
        />
        <Text color="white" bold>
          {errorMessage}
        </Text>
      </View>
    );
  };

  const Subheader = () => (
    <View style={styles.subHeader}>
      <Text h4 color={v2Colors.greenShade2}>
        We have sent the code to{' '}
        <Text h4 bold color={v2Colors.greenShade2}>
          {isForgotPassword
            ? `${route.params?.mobile}`
            : `${basicSignupDetails.MobileNumber.slice(3)}`}
        </Text>
      </Text>
    </View>
  );

  const ResendOTP = () => (
    <View style={styles.resendOTP}>
      <Text h4 color={v2Colors.greenShade2}>
        {"Didn't receive the code? "}
        {showResend ? (
          <>
            <Text h4 color={v2Colors.greenShade2}>
              Resend in{' '}
            </Text>
            <Text h4 bold color={v2Colors.greenShade2}>
              {moment(timer).format('m:ss')}
            </Text>
          </>
        ) : (
          <Text h4 bold color={v2Colors.greenShade2} onPress={onResend}>
            Resend
          </Text>
        )}
      </Text>
    </View>
  );

  const SubmitButton = () => (
    <View style={styles.submit}>
      <CommonButton
        text="Confirm"
        onPress={onSubmit}
        isFetching={isFetching}
        style={{borderRadius: 5}}
      />
    </View>
  );

  return (
    <>
      <Header pageTitle="Account Verification" />
      <KeyboardHandler>
        <ImageBackground style={styles.container} source={require(IMAGE_BG)}>
          <Subheader />
          {ErrorMessageView()}
          <InputText
            control={control}
            name="code"
            label="Enter 6 digit code"
            maxLength={6}
            keyboardType={'phone-pad'}
            isError={errors.code}
            textStyle={{
              letterSpacing: 1,
              fontSize: 18,
              fontWeight: 'bold',
            }}
          />
          <View style={{height: 20}} />
          <ResendOTP />
          <SubmitButton />
        </ImageBackground>
      </KeyboardHandler>
    </>
  );
};

export default OTPScreen;
