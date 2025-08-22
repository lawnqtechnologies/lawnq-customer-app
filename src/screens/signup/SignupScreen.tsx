import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Alert,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {size} from 'lodash';

/**
 * ? Local Imports
 */
import createStyles from './SignupScreen.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {v2Colors} from '@theme/themes';
import CommonButton from '@shared-components/buttons/CommonButton';
import {SCREENS} from '@shared-constants';
import InputText from '@shared-components/form/InputText/v2/input-text';
import {BasicRegistrationSchema} from '../../utils/validation-schemas/registration';

/**
 * ? SVGs
 */
import USER from '@assets/v2/auth/icons/user.svg';
import PHONE from '@assets/v2/auth/icons/phone.svg';
import MAIL from '@assets/v2/auth/icons/mail.svg';
import LAWNQ from '@assets/v2/auth/images/lawnq.svg';
import {RootState} from 'store';
import {onSaveBasicSignupDetails} from '@services/states/user/user.slice';
import {useAuth} from '@services/hooks/useAuth';

/**
 * ? Icon Imports
 */
const IMAGE_BG = '../../assets/v2/auth/images/image-bg.png';
const FB = '../../assets/v2/auth/images/fb.png';
const TWITTER = '../../assets/v2/auth/images/twitter.png';
const GOOGLE = '../../assets/v2/auth/images/google.png';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ISignupScreenProps {
  style?: CustomStyleProp;
}

const SignupScreen: React.FC<ISignupScreenProps> = ({}) => {
  /**
  |--------------------------------------------------
  | State
  |--------------------------------------------------
  */
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


  /**
  |--------------------------------------------------
  | Constant
  |--------------------------------------------------
  */
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const {validateRegistration} = useAuth();

  const formatPhoneNumber = (number: string) => {
    return number.startsWith('+610') ? number.replace('+610', '') : number;
  };


  /**
|--------------------------------------------------
|  REDUX
|--------------------------------------------------
*/
  const {basicSignupDetails} = useSelector((state: RootState) => state.user);
  const {Firstname, Lastname, MobileNumber, EmailAddress} = basicSignupDetails;

  /**
|--------------------------------------------------
| FORM
|--------------------------------------------------
*/
  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
  } = useForm({
    defaultValues: {
      firstName: Firstname,
      lastName: Lastname,
      mobile: formatPhoneNumber(MobileNumber),
      email: EmailAddress,
    },
    resolver: yupResolver(BasicRegistrationSchema),
  });

  useEffect(() => {
    console.log(MobileNumber)
  }, [MobileNumber])
  

  /**
  |--------------------------------------------------
  | STATES
  |--------------------------------------------------
  */
  const [isError, setIsError] = useState<boolean>(false);

  /**
  |--------------------------------------------------
  | EFFECTS
  |--------------------------------------------------
  */
  useEffect(() => {
    if (size(errors) > 0) {
      if (errors?.mobile?.message) {
        console.log(errors);
        Alert.alert(errors?.mobile?.message);
        return;
      }
      setIsError(true);
    } else setIsError(false);
  }, [errors]);

  /**
  |--------------------------------------------------
  | FUNCTIONS
  |--------------------------------------------------
  */

  const _validate = async (_email: string, _mobile: string) => {
    const payload = {EmailAddress: _email, MobileNumber: _mobile};
    setIsSubmitting(true)
    let isSuccess: boolean = true;
    validateRegistration(
      payload,
      (data: any) => {
        console.log(data, 'data from validation');
        if (data.StatusCode === '00') {
          const values: any = getValues();
          const {email, mobile, firstName, lastName} = values;
          let formatedMobile =
            mobile[0] != '0' ? `+610${mobile}` : `+61${mobile}`;
          dispatch(
            onSaveBasicSignupDetails({
              EmailAddress: email,
              MobileNumber: formatedMobile,
              Firstname: firstName,
              Lastname: lastName,
              Address: 'sample address',
              Birthday: '',
            }),
          );
          setIsSubmitting(false)
          NavigationService.navigate(SCREENS.SIGNUP_ADDRESS);
        } else {
            setIsSubmitting(false)
          Alert.alert(data.StatusMessage);
          isSuccess = false;
        }
      },
      (err: any) => {
          setIsSubmitting(false)
        Alert.alert('Please Check details.');
        isSuccess = false;
      },
    );

    return isSuccess;
  };

  const onNext = async () => {
    const values: any = getValues();
    const {email, mobile} = values;

    if (
      (mobile[0] != 5 && mobile[0] != 4 && mobile[0] != 0) ||
      (mobile[1] != 5 && mobile[1] != 4 && mobile[0] == 0)
    ) {
      Alert.alert('Mobile Number is not valid.');
      return;
    }

    await _validate(email, mobile);
  };

  const onLogin = () => {
    NavigationService.goBack();
  };

  /**
|--------------------------------------------------
| COMPONENTS
|--------------------------------------------------
*/
  const Separator = () => <View style={{height: 20}} />;

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
          Required Fields must be filled in
        </Text>
      </View>
    );
  };

  const Next = () => (
    <View style={{flexGrow: 1}}>
      <CommonButton
        text={'Next'}
        onPress={handleSubmit(onNext)}
        style={{borderRadius: 5}}
        isFetching={isSubmitting}
      />
    </View>
  );

  const Or = () => (
    <View style={styles.OrContainer}>
      <View
        style={[
          styles.lineSeparator,
          {
            alignItems: 'flex-start',
          },
        ]}
      />
      <Text
        h5
        color={v2Colors.green}
        style={{paddingHorizontal: 20}}>{` Or `}</Text>
      <View
        style={[
          styles.lineSeparator,
          {
            alignItems: 'flex-end',
          },
        ]}
      />
    </View>
  );

  const Socials = () => (
    <View style={styles.socialsContainer}>
      <FastImage source={require(FB)} style={styles.socialIcon} />
      <FastImage source={require(TWITTER)} style={styles.socialIcon} />
      <FastImage source={require(GOOGLE)} style={styles.socialIcon} />
    </View>
  );

  const SignIn = () => (
    <View style={styles.registerContainer}>
      <Text h4 color={v2Colors.greenShade2}>{`Already have an account? `}</Text>
      <TouchableOpacity onPress={onLogin}>
        <Text h3 bold style={{paddingVertical: 16}} color={v2Colors.green}>
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={'never'}>
      <ImageBackground style={styles.container} source={require(IMAGE_BG)}>
        <View style={{alignSelf: 'center', marginVertical: 50}}>
          <LAWNQ />
        </View>

        {isError && <ErrorMessage />}
        {isError && <View style={{height: 32}} />}

        <View style={{flexGrow: 1}}>
          <InputText
            control={control}
            name="firstName"
            label="First Name"
            rightIcon={<USER />}
            isError={errors?.firstName}
          />
          <Separator />

          <InputText
            control={control}
            name="lastName"
            label="Last Name"
            rightIcon={<USER />}
            isError={errors.lastName}
          />
          <Separator />

          <InputText
            control={control}
            name="mobile"
            label="Mobile Number"
            rightIcon={<PHONE />}
            prefix={'+61'}
            maxLength={10}
            isError={errors.mobile}
            keyboardType={"number-pad"}
          />
          <Separator />

          <InputText
            control={control}
            name="email"
            label="Email"
            rightIcon={<MAIL />}
            isError={errors.email}
            keyboardType={"email-address"}
          />
          <Separator />
        </View>

        <Next />
        <Or />
        {/* <Socials /> */}
        <SignIn />
      </ImageBackground>
    </ScrollView>
  );
};

export default SignupScreen;
