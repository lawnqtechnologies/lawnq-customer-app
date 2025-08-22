import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useDispatch, useSelector} from 'react-redux';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
/**
 * ? Local Imports
 */
import WholeScreenLoader from '@shared-components/loaders/WholeScreenLoader';

import createStyles from './ProfileScreen.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {InputText} from '@shared-components/form';
import CommonButton from '@shared-components/buttons/CommonButton';
import InputTextWithTitle from '@shared-components/form/InputText/v2/input-text-with-title';

import {udpateProfileSchema} from 'utils/validation-schemas/profile';
import {useAuth} from '@services/hooks/useAuth';
import {cutMobile} from './helpers';

/**
 * ? Constants
 */
// ? SVGs
import SampleProfile from '@assets/v2/account/images/user-cust.svg';
import {AUTHENTICATION, SCREENS} from '@shared-constants';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import {ScrollView} from 'react-native-gesture-handler';
import {useBooking} from '@services/hooks/useBooking';
import {RootState} from 'store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {userLoggedOut} from '@services/states/user/user.slice';
import {v2Colors} from '@theme/themes';
const {TOKEN, CUSTOMER_ID, MOBILE_NO} = AUTHENTICATION;

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IProfileScreenProps {
  style?: CustomStyleProp;
  navigation?: any;
}

const ProfileScreen: React.FC<IProfileScreenProps> = ({navigation}) => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const {
    getCustomerInfo,
    updateCustomerInfo,
    updateCustomerEmailInfo,
    deleteCustomerInfo,
  } = useAuth();
  const [isNameChanged, setNameChanged] = useState<boolean>(false);
  const [isEmailChanged, setEmailChanged] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<any>(null);
  const {updateProfilePhoto} = useBooking();
  const {token, customerId, deviceDetails, customerInfo} = useSelector(
    (state: RootState) => state.user,
  );

  /**
   * ? States
   */
  const [isFetching, setIsFetching] = useState<boolean>(false);

  /**
   * ? Form States
   */
  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
  } = useForm({
    defaultValues: {
      firstName: customerInfo.Firstname,
      lastName: customerInfo.Lastname,
      mobile: customerInfo.MobileNumber,
      email: customerInfo.EmailAddress,
      birthday: customerInfo.Birthday,
    },
    resolver: yupResolver(udpateProfileSchema),
  });

  /**
   * ? On Mount
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCustomerInfo();
      if (customerInfo?.ProfilePictureLink?.length) {
        setImageUri(customerInfo?.ProfilePictureLink);
      }
    });

    return unsubscribe;
  }, [navigation]);

  /**
   * ? Functions
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
  const deleteCustomerProfile = () => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
    };

    deleteCustomerInfo(
      payload,
      () => {
        setIsLoading(false);
        Alert.alert(
          'Profile Deleted',
          'Successfuly deleted your profile information',
          [
            {
              onPress: () => {
                AsyncStorage.removeItem(TOKEN);
                AsyncStorage.removeItem(CUSTOMER_ID);
                AsyncStorage.removeItem(MOBILE_NO);
                dispatch(userLoggedOut());
                NavigationService.push(SCREENS.LOGIN);
              },
            },
          ],
        );
      },
      () => {
        setIsLoading(false);
      },
    );
  };
  const postDeleteCustomerInfo = () => {
    Alert.alert('Hold on!', 'Are you sure you want to delete your profile?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {text: 'YES', onPress: () => deleteCustomerProfile()},
    ]);
  };

  const saveCustomerInfo = () => {
    const values = getValues();
    console.log('values:', values);
    const {firstName, lastName, email} = values;
    if (isNameChanged) {
      const payload = {
        CustomerToken: token,
        CustomerId: customerId,
        Firstname: firstName,
        Lastname: lastName,
      };

      console.log('saveCustomerInfo payload:', payload);
      setIsLoading(true);

      updateCustomerInfo(
        payload,
        (data: any) => {
          if (data.StatusCode === '00') {
            setIsLoading(false);
            Alert.alert(
              'Update Profile',
              'Successfuly updated your profile information',
              [
                {
                  onPress: () => {
                    NavigationService.push(SCREENS.HOME);
                  },
                },
              ],
            );
          }
        },
        () => {
          setIsLoading(false);
        },
      );
    }

    if (isEmailChanged) {
      const payload = {
        CustomerToken: token,
        CustomerId: customerId,
        EmailAddress: email,
      };

      console.log('saveCustomerInfo payload:', payload);
      setIsLoading(true);
      updateCustomerEmailInfo(
        payload,
        () => {
          setIsLoading(false);
          Alert.alert(
            'Update Profile',
            'Successfuly updated your email address',
            [
              {
                onPress: () => {
                  NavigationService.push(SCREENS.HOME);
                },
              },
            ],
          );
        },
        () => {
          setIsLoading(false);
        },
      );
    }
  };
  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      // selectionLimit: 0,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        console.log(response.assets);

        const name = {fileName: response.assets[0].fileName};
        const type = {type: response.assets[0].type};
        const source = {uri: response.assets[0].uri};

        changePhoto(name.fileName, type.type, source.uri);
        setImageUri(source.uri);
      }
    });
  };
  const changePhoto = async (imageName: any, imageType: any, imageUri: any) => {
    setIsLoading(true);

    let request = new FormData();
    request.append('CustomerToken', token);
    request.append('CustomerId', customerId);
    request.append('Photo', {
      name: imageName,
      type: imageType,
      uri: imageUri,
    });

    console.log('onprofilephotoupdate payload:', JSON.stringify(request));
    updateProfilePhoto(
      request,
      (data: any) => {
        console.log('onprofilephotoupdate data:', data);
        setIsLoading(false);
        const {StatusCode} = data;

        if (StatusCode === '00') {
          fetchCustomerInfo();
          return Alert.alert('Profile picture updated successfully');
        }
        return Alert.alert('Server Error Occured');
      },
      (err: any) => {
        setIsLoading(false);
        console.log('onprofilephotoupdate err:', err);
      },
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const ProfileImage = () => (
    <View style={styles.imageHeaderContainer}>
      {imageUri !== null ? (
        <FastImage
          source={{uri: imageUri}}
          style={styles.profilePicImageStyle}
          resizeMode={'contain'}
        />
      ) : (
        <SampleProfile
          height={100}
          width={100}
          style={{
            borderColor: v2Colors.green,
            borderWidth: 1,
            borderRadius: 50,
          }}
        />
      )}
      <TouchableOpacity
        style={styles.subProfilePicImageStyle}
        onPress={() => selectImage()}>
        <Text h5 color={'black'}>
          Change Photo
        </Text>
      </TouchableOpacity>
    </View>
  );

  const Separator = () => <View style={{height: 15}} />;

  const Form = () => {
    return (
      <View style={styles.formContainer}>
        <InputTextWithTitle
          control={control}
          name="firstName"
          label="First Name"
          editable={true}
          onChangeText={() => {
            setNameChanged(true);
          }}
        />
        <Separator />

        <InputTextWithTitle
          control={control}
          name="lastName"
          label="Last Name"
          editable={true}
          onChangeText={() => {
            setNameChanged(true);
          }}
        />
        <Separator />

        <InputTextWithTitle
          control={control}
          name="mobile"
          label="Mobile Number"
          editable={false}
        />
        <Separator />

        <InputTextWithTitle
          control={control}
          name="email"
          label="Email"
          editable={true}
          onChangeText={() => {
            setEmailChanged(true);
          }}
        />
      </View>
    );
  };

  const Save = () => (
    <View style={styles.button}>
      <CommonButton
        text={'Update Profile'}
        onPress={handleSubmit(saveCustomerInfo)}
        style={{borderRadius: 5}}
        isFetching={isFetching}
      />
    </View>
  );

  const Delete = () => (
    <View style={{flexGrow: 1, justifyContent: 'flex-end', margin: 10}}>
      <CommonButton
        text={'Delete Account'}
        onPress={handleSubmit(postDeleteCustomerInfo)}
        style={{borderRadius: 5}}
        isFetching={isFetching}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderContainer
        pageTitle="Edit Profile"
        navigateTo={SCREENS.HOME}
        hasCancel
        onCancel={() => NavigationService.goBack()}
      />
      <ScrollView style={{flexGrow: 1}}>
        <View style={styles.profileContainer}>
          <ProfileImage />
        </View>
        <View style={styles.subContainer}>
          <Form />
          <Save />
          <Delete />
        </View>
      </ScrollView>
      {isLoading && <WholeScreenLoader />}
    </View>
  );
};

export default ProfileScreen;
