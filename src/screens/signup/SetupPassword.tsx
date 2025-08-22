import React, {useMemo, useState, useEffect} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  ImageBackground,Alert
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import FastImage from 'react-native-fast-image';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useDispatch, useSelector} from 'react-redux';
import {size} from 'lodash';
import Tooltip from 'react-native-walkthrough-tooltip';

/**
 * ? Local imports
 */
import createStyles from './SetupPassword.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CommonButton from '@shared-components/buttons/CommonButton';
import {SCREENS} from '@shared-constants';
import KeyboardHandler from '@shared-components/containers/KeyboardHandler';
import InputText from '@shared-components/form/InputText/v2/input-text';

import {SetupPasswordSchema} from '../../utils/validation-schemas/registration';
import {v2Colors} from '@theme/themes';
import WholeScreenLoader from '@shared-components/loaders/WholeScreenLoader';
/**
 * ? SVGs
 */
import ARROW_LEFT from '@assets/v2/headers/arrow-left.svg';
import {RootState} from 'store';
import {onSetPasswords} from '@services/states/user/user.slice';
import {useAuth} from '@services/hooks/useAuth';
/**
 * ? Icon Imports
 */

const LOOK = '../../assets/icons/gray/look.png';
const UNSEE = '../../assets/icons/gray/unsee.png';
const IMAGE_BG = '../../assets/v2/auth/images/image-bg.png';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ISetupPasswordScreenProps {
  style?: CustomStyleProp;
  route: any;
}

const SetupPassword: React.FC<ISetupPasswordScreenProps> = ({route}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {colors} = theme;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {updateCustomerPassword} = useAuth();
  /**
   * ? Redux States
   */
  const {password1, password2} = useSelector((state: RootState) => state.user);

  /**
   * States
   */
  const [isPassword1Visible, setIsPasswordVisible] = useState<boolean>(false);
  const [isPassword1Visible2, setIsPasswordVisible2] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [collectErrors, setCollectErrors] = useState<Array<string>>();
  const [showTip, setTip] = useState(false);
  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
  } = useForm({
    defaultValues: {
      password: password1,
      password2: password2,
    },
    resolver: yupResolver(SetupPasswordSchema),
  });

  /**
   * ? Functions
   */
  const onRegister = () => {
    console.log('errors register: ', errors);
    const values = getValues();
    const {password, password2} = values;

    dispatch(onSetPasswords({password1: password, password2}));
    NavigationService.navigate(SCREENS.OTP);
  };
  const setNewPassword = () => {
    console.log('errors register: ', errors);
    const values = getValues();
    const {password, password2} = values;
  
    const payload = {
      "MobileNumber":route.params?.mobile ,
      "NewPassword": password
    };
    dispatch(onSetPasswords({password1: password, password2}));
    setIsLoading(true);
    updateCustomerPassword(
      payload,
      (data:any) => {
        setIsLoading(false);
        if(data.StatusCode=='01'){
          Alert.alert(data.StatusMessage)
        }
        else {
        Alert.alert(
          'Update Profile',
          'Successfuly updated password',
          [
            {
              onPress: () => {
                NavigationService.push(SCREENS.LOGIN);
              },
            },
          ],
        );
        }
      },
      (error) => {
        Alert.alert('Error', error || 'Something went wrong.');
        setIsLoading(false);
       
      },
    );
   
  };

  /**
   * ? Watchers
   */
  // Checks if error sets in to view ErrorMessage and Tooltip error message
  useEffect(() => {
    if (size(errors) === 0) {
      setIsError(false);
      setTip(false);
    } else {
      setIsError(true);
      setTip(true);
    }

    async function testValidate() {
      try {
        const results = await SetupPasswordSchema.validate(
          {
            password: '',
          },
          {abortEarly: false},
        );
        console.log(`Results - ${results}`);
      } catch (e: any) {
        console.log(`Error - ${e?.errors}`);
        const collectedErrors = e?.errors;
        console.log('collectedErrors: ', collectedErrors);
        setCollectErrors(collectedErrors);
      }
    }
    testValidate();
  }, [errors]);
  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Separator = () => <View style={{height: 20}} />;

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
  const SetNewPassword = () => (
    <View style={styles.signup}>
      <CommonButton
        text={'Confirm'}
        onPress={handleSubmit(setNewPassword)}
        style={{borderRadius: 5}}
      />
    </View>
  );
  const SignUp = () => (
    <View style={styles.signup}>
      <CommonButton
        text={'Next'}
        onPress={handleSubmit(onRegister)}
        style={{borderRadius: 5}}
      />
    </View>
  );

  return (
    <KeyboardHandler>
      <Header pageTitle="Set Password" />
      <ImageBackground style={styles.container} source={require(IMAGE_BG)}>
        {/* <SubHeader /> R.Suarez - commented Subheader */}

        <View style={{flexGrow: 1}}>
          <Text h4 color={v2Colors.greenShade2} style={{marginBottom: 20}}>
            The password must be at least 6 characters in length. Password must
            contain at least one letter, one special character, one number and
            capital letter.
          </Text>

          <Tooltip
            isVisible={showTip}
            backgroundColor={'transparent'}
            showChildInTooltip={false}
            contentStyle={{backgroundColor: 'white', marginLeft: 40}}
            content={
              <View style={{padding: 10}}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    marginBottom: 10,
                  }}>
                  <Icon
                    style={{marginRight: 10}}
                    name="warning"
                    type={IconType.AntDesign}
                    color={v2Colors.green}
                    size={15}
                  />
                  <Text h5 bold color={v2Colors.green} style={{fontSize: 18}}>
                    Must contain at least:
                  </Text>
                </View>
                {collectErrors?.map((item: string) => {
                  if (item.includes('Password')) {
                    return null;
                  }
                  return (
                    <Text color={v2Colors.green} style={{fontSize: 14}}>
                      {item}
                    </Text>
                  );
                })}
              </View>
            }
            onClose={() => setTip(false)}
            placement="bottom">
            <InputText
              control={control}
              name="password"
              label="Enter Password"
              isPassword={!isPassword1Visible}
              isError={errors.password}
              rightIcon={
                <TouchableOpacity
                  onPress={() => {
                    setIsPasswordVisible(!isPassword1Visible);
                  }}>
                  {!isPassword1Visible ? (
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
            />
          </Tooltip>

          <Separator />
          <InputText
            control={control}
            name="password2"
            label="Confirm Password"
            isPassword={!isPassword1Visible2}
            isError={errors.password2}
            rightIcon={
              <TouchableOpacity
                onPress={() => {
                  setIsPasswordVisible2(!isPassword1Visible2);
                }}>
                {!isPassword1Visible2 ? (
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
          />
        </View>
       {route.params?.fromForgotPassword?
        <SetNewPassword />
            : 
         <SignUp />
        }
        {isLoading && <WholeScreenLoader />}
      </ImageBackground>
    
    </KeyboardHandler>
  );
};

export default SetupPassword;
