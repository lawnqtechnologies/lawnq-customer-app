import React, {useMemo, useState, useEffect} from 'react';
import {
  Alert,
  ImageBackground,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import KeyboardHandler from '@shared-components/containers/KeyboardHandler';
import {useTheme} from '@react-navigation/native';
import createStyles from './LoginScreen.style';
const IMAGE_BG = '../../assets/v2/auth/images/image-bg.png';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {yupResolver} from '@hookform/resolvers/yup';
import * as NavigationService from 'react-navigation-helpers';
import messaging from '@react-native-firebase/messaging';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  PermissionStatus,
  requestNotifications,
} from 'react-native-permissions';
import auth from '@react-native-firebase/auth';
/**
 * ? SVGs
 */
import PHONE from '@assets/v2/auth/icons/phone.svg';
import LAWNQ from '@assets/v2/auth/images/lawnq.svg';
import InputText from '@shared-components/form/InputText/v2/input-text';
import FastImage from 'react-native-fast-image';
import {Resolver, useForm} from 'react-hook-form';
import CommonButton from '@shared-components/buttons/CommonButton';
import {LoginSchema} from 'utils/validation-schemas/login';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from 'store';
import {AUTHENTICATION, SCREENS} from '@shared-constants';
import {ILoginFormInputs} from '@interface/login/form/ILoginFormInputs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '@services/hooks/useAuth';
import {onUserLogin} from '@services/states/user/user.slice';
import {v2Colors} from '@theme/themes';

/**
 * ? Icon Imports
 */
const LOOK = '../../assets/icons/gray/look.png';
const UNSEE = '../../assets/icons/gray/unsee.png';

const LoginScreen = () => {
  /**
|--------------------------------------------------
| Constant
|--------------------------------------------------
*/
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {TOKEN, CUSTOMER_ID, MOBILE_NO} = AUTHENTICATION;
  const dispatch = useDispatch();
  const {login} = useAuth();

  /**
|--------------------------------------------------
| Redux
|--------------------------------------------------
*/
  const {deviceDetails} = useSelector((state: RootState) => state.user);

  /**
|--------------------------------------------------
| States
|--------------------------------------------------
*/
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<Array<string>>([]);
  const [isError, setIsError] = useState<boolean>(false);
  const [isPassVisible, setIsPassVisible] = useState<boolean>(false);
  const [cachedMobile, setCachedMobile] = useState<string | undefined>('');

  /**
|--------------------------------------------------
| Components
|--------------------------------------------------
*/
  const ErrorMessage = () => {
    return (
      <View style={styles.errorContainer}>
        <Icon
          style={{marginRight: 10}}
          name="warning"
          type={IconType.AntDesign}
          color={'white'}
          size={20}
        />
        <Text color={'white'} bold>
          {errorMessages}
        </Text>
      </View>
    );
  };

  const Separator = () => <View style={{height: 15}} />;

  const SignIn = () => (
    <View style={{flexGrow: 1}}>
      <CommonButton
        text={'Sign In'}
        style={{marginTop: 50, borderRadius: 5}}
        onPress={handleSubmit(onLogin)}
        isFetching={isFetching}
      />
    </View>
  );

  const onForgotPassword = () => {
    const values: any = getValues();
    const {mobile} = values;

    if (!mobile.length) {
      Alert.alert('Please enter the mobile number for resetting the password');

      return;
    } else {
      if (
        (mobile[0] != 5 && mobile[0] != 4 && mobile[0] != 0) ||
        (mobile[0] == 0 && mobile[1] != 5 && mobile[1] != 4)
      ) {
        Alert.alert('Mobile Number is not valid.');
        return;
      }
      NavigationService.push(SCREENS.OTP, {
        fromForgotPassword: true,
        mobile: mobile[0] != '0' ? `0${mobile}` : `${mobile}`,
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const permissionStatus = await request(
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      );
      switch (permissionStatus) {
        case RESULTS.UNAVAILABLE:
          Alert.alert(
            'Notification services are not available on this device.',
          );
          break;
        case RESULTS.DENIED:
          requestNotificationPermission();
          break;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Notification Permission',
            'Notification services are blocked. Please enable them in settings.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: () => openSettings()},
            ],
          );
          break;
      }
    }
  };

  const requestiOSNotificationPermission = async (): Promise<void> => {
    if (Platform.OS !== 'ios') return; // Ensure this runs only on iOS

    const {status} = await requestNotifications(['alert', 'sound', 'badge']);

    switch (status) {
      case 'unavailable':
        Alert.alert('Notifications are not available on this device.');
        break;
      case 'denied':
        Alert.alert(
          'Notification Permission',
          'Please enable notifications in settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        break;
      case 'blocked':
        Alert.alert(
          'Notification Permission',
          'Notifications are blocked. Enable them in settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        break;
      case 'granted':
        console.log('Notification permission granted for iOS.');
        break;
    }
  };

  // const Socials = () => (
  //   <View style={styles.socialsContainer}>
  //     <FastImage source={require(FACEBOOK)} style={styles.socialIcon} />
  //     <FastImage source={require(TWITTER)} style={styles.socialIcon} />
  //     <FastImage source={require(GOOGLE)} style={styles.socialIcon} />
  //   </View>
  // );

  const SignUp = () => (
    <View style={{flexGrow: 1, marginTop: 50}}>
      <Text
        style={{margin: 10}}
        color={v2Colors.green}>{`Don't have an account? `}</Text>
      <CommonButton
        color={v2Colors.green}
        text={'Sign Up'}
        style={{
          borderRadius: 5,
          backgroundColor: 'white',
          borderColor: v2Colors.lightGreen,
        }}
        onPress={onRegister}
        // isFetching={isFetching}
      />
    </View>
  );

  const Forgotpassword = () => (
    <TouchableOpacity
      onPress={onForgotPassword}
      style={styles.forgotpasswordContainer}>
      <Text h3 bold color={'#1E4940'}>
        Forgot Password?
      </Text>
    </TouchableOpacity>
  );
  /**
|--------------------------------------------------
| Form
|--------------------------------------------------
*/
  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
    getValues,
  } = useForm<ILoginFormInputs>({
    defaultValues: useMemo(() => {
      return {
        mobile: cachedMobile,
        password: '',
        // mobile: '0599999999',
        // password: 'Wilm3r@12',
      };
    }, []),
    resolver: yupResolver(LoginSchema) as Resolver<ILoginFormInputs>, // Ensure resolver matches the form input types
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestNotificationPermission();
    } else {
      requestiOSNotificationPermission();
    }
  }, []);

  /**
|--------------------------------------------------
| Methods
|--------------------------------------------------
*/
  const onLogin = () => {
    const values: any = getValues();
    const {mobile, password} = values;
    if (
      (mobile[0] != 5 && mobile[0] != 4 && mobile[0] != 0) ||
      (mobile[0] == 0 && mobile[1] != 5 && mobile[1] != 4)
    ) {
      Alert.alert('Mobile Number is not valid.');
      return;
    }
    const payload = {
      MobileNumber: mobile[0] != '0' ? `+610${mobile}` : `61${mobile}`,
      CustomerPassword: password,
      DeviceDetails: deviceDetails,
    };

    console.log(payload);
    setIsFetching(true);
    login(payload, (data: any) => {
      let errorArray: any = [];
      
      console.log(data)
      if (data.StatusCode !== '00') {

        data.map((d: any) => {
          if (d.StatusCode !== '00') {
            errorArray.push(d.StatusMessage);
          }
        });
      }

      console.log(errorArray);

      if (errorArray.length > 0) {
        setErrorMessages(errorArray);
        setIsError(true);
        setIsFetching(false);
        return;
      }
      setIsError(false);
      setErrorMessages([]);
      setIsFetching(false);

      const {CustomerToken, CustomerId} = data[0].Data[0];
      AsyncStorage.setItem(TOKEN, CustomerToken);
      AsyncStorage.setItem(CUSTOMER_ID, CustomerId);
      AsyncStorage.setItem(MOBILE_NO, mobile);
      dispatch(onUserLogin(CustomerId));
      requestUserPermissionForFirebase();
      NavigationService.navigate(SCREENS.WELCOME);
    });
  };

  const onRegister = () => {
    NavigationService.push(SCREENS.SIGNUP);
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

  return (
    <KeyboardHandler>
      <ImageBackground style={styles.container} source={require(IMAGE_BG)}>
        <View style={{flex: 1, alignSelf: 'center', alignItems: 'center'}}>
          <LAWNQ />
          <Text color={v2Colors.green} style={{marginVertical: 10}}>
            New here? Tap ‘Sign Up’ below to create an account and get started!
          </Text>
        </View>
        <View>{isError && <ErrorMessage />}</View>

        <View style={{flex: 5, marginVertical: 10}}>
          <View style={{minHeight: 100}}>
            <InputText
              control={control}
              name="mobile"
              label="Enter Mobile Number"
              rightIcon={<PHONE />}
              prefix={'+61'}
              maxLength={10}
              keyboardType={'phone-pad'}
              isError={errors.mobile}
            />
            <Separator />
            <InputText
              control={control}
              name="password"
              label="Enter Password"
              rightIcon={
                <TouchableOpacity
                  onPress={() => {
                    setIsPassVisible(!isPassVisible);
                  }}>
                  {!isPassVisible ? (
                    <FastImage
                      key={'look'}
                      source={require(LOOK)}
                      style={styles.rightIcon}
                    />
                  ) : (
                    <FastImage
                      key={'unsee'}
                      source={require(UNSEE)}
                      style={styles.rightIcon}
                    />
                  )}
                </TouchableOpacity>
              }
              isPassword={!isPassVisible}
              isError={errors.password}
            />
          </View>

          <View>
            <SignIn />
            {/* <TestSms /> */}
          </View>
          <Forgotpassword />
          <SignUp />
        </View>
      </ImageBackground>
    </KeyboardHandler>
  );
};

export default LoginScreen;
