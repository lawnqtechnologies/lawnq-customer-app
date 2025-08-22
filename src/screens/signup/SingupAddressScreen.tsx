import {useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';

import * as _ from 'lodash';
import {yupResolver} from '@hookform/resolvers/yup';

import createStyles from './SingupAddressScreen.style';
import {v2Colors} from '@theme/themes';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import {PROPERTY_MESSAGE, SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CommonButton from '@shared-components/buttons/CommonButton';
import ErrorModal from '@shared-components/modals/error-modal/ErrorModal';
import MiddleModal from '@shared-components/modals/MiddleModal';
import {PropertySchema} from '../../utils/validation-schemas/property';
import InputText from '@shared-components/form/InputText/v2/input-text';
import {isSelected} from '../my-properties/helpers';
import {useProperty} from '@services/hooks/useProperty';

/**
 * ? SVGs
 */
import PIN from '@assets/v2/properties/icons/pin.svg';
import GREEN_CHECK_CIRCLE from '@assets/v2/common/icons/green-check-circle.svg';
import HAS_PET from '@assets/v2/properties/icons/has-pet.svg';
import NO_PET from '@assets/v2/properties/icons/no-pet.svg';
import PUSH_MOWER from '@assets/v2/properties/icons/push-mower.svg';
import RIDE_ON_MOWER from '@assets/v2/properties/icons/ride-on-mower.svg';
import FLAT_TERRAIN from '@assets/v2/properties/icons/flat-terrain.svg';
import STEEP_TERRAIN from '@assets/v2/properties/icons/steep-terrain.svg';
import MIXED_TERRAIN from '@assets/v2/properties/icons/mixed-terrain.svg';
import CenterModalV2 from '@shared-components/modals/center-modal/CenterModalV2';
import CenterModalW2Buttons from '@shared-components/modals/center-modal/with-2-buttons';
import {RootState} from 'store';
import {
  onResetAddPropertyStates,
  onSetLawnArea,
  onSetPropertyName,
  onSetRemarks,
  onSetSelectedPet,
  onSetSelectedServiceType,
  onSetSelectedTerrainType,
} from '@services/states/property/property.slice';
import fonts from '@fonts';
import KeyboardHandler from '@shared-components/containers/KeyboardHandler';
import { InferType } from 'yup';

// ? Constants
const MOW_TYPE_SELECTION = [
  {
    id: 1,
    icon: <PUSH_MOWER />,
    text: 'Push Mower',
  },
  {
    id: 2,
    icon: <RIDE_ON_MOWER />,
    text: 'Ride-on\nMower',
  },
];
const TERRAIN_TYPE_SELECTION = [
  {
    id: 1,
    icon: <FLAT_TERRAIN />,
    text: 'Flat',
  },
  {
    id: 2,
    icon: <STEEP_TERRAIN />,
    text: 'Steep',
  },
  {
    id: 3,
    icon: <MIXED_TERRAIN />,
    text: 'Mixed',
  },
];

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;
interface IAddPropertyScreenProps {
  style?: CustomStyleProp;
  navigation: any;
  route?: any;
}

type PropertyFormData = InferType<typeof PropertySchema>;

const SingupAddressScreen: React.FC<IAddPropertyScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  /**
   * ? Hooks
   */
  const {saveCustomerProperty, deleteCustomerProperty} =
    useProperty();

  // ? Redux States
  const {customerId, token, deviceDetails} = useSelector(
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

  // ? States
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Modal States
  const [error, setError] = useState<Array<any>>([]);
  const [showError, setShowError] = useState<boolean>(false);

  // alert modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalText, setModalText] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // ? Form
  const {
    control,
    formState: {errors},
    reset,
    getValues,
    handleSubmit,
  } = useForm<PropertyFormData>({
    defaultValues: useMemo(() => {
      return {
        propertyName,
        address,
        lawnArea,
        Country,
        StreetName,
        StreetNumber,
        State,
        PostalCode,
        Suburb,
        Remarks,
      };
    }, [address]),
    shouldUnregister: false,
    resolver: yupResolver(PropertySchema),
  });
  useEffect(() => {
    reset({
      propertyName,
      address,
      lawnArea,
      Country,
      StreetName,
      StreetNumber,
      State,
      Suburb,
      PostalCode,
      Remarks,
    });
  }, [
    propertyName,
    address,
    lawnArea,
    Country,
    StreetName,
    StreetNumber,
    State,
    Suburb,
    PostalCode,
    Remarks,
  ]);

  /**
   * ? On Mount
   */

  /**
   * ? Watchers
   */

  useEffect(() => {
    console.log('redux dispatch');
    console.log(
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
      Remarks
    );

    console.log('this the address' , address)
  }, [address]);

  // ? Functions
  const locateProperty = () => {
    setValuesOnChangeScreen();
    NavigationService.navigate(SCREENS.SIGNUP_LOCATE_ADDRESS);
  };

  const onCheckErrors = async () => {
    let errorArray = [];
    if (!address) errorArray.push('Address is empty');
    if (selectedTerrainType === null || selectedTerrainType === '')
      errorArray.push('Terrain type is empty');

    return errorArray;
  };

  const onSubmit = async () => {
    const errorArray = await onCheckErrors();
    if (errorArray.length > 0) {
      setShowError(true);
      setError(errorArray);
      return;
    }
      onSaveProperty();
  };

  /**
  |--------------------------------------------------
  | FORM SAVING
  |--------------------------------------------------
  */


  const onSaveProperty = async () => {
    // setIsFetching(true);
    const values = getValues();
    let request = new FormData();

     onSetShowModal("We’re reviewing your lawn size and terrain type. This usually takes 5 minutes to a few hours. You’ll receive a notification once it’s done, then you can request your free instant quote.");
  };

  const setValuesOnChangeScreen = () => {
    const values = getValues();
    const {propertyName, lawnArea, Remarks} = values;

    dispatch(onSetRemarks(Remarks));
    dispatch(onSetPropertyName(propertyName));
    dispatch(onSetLawnArea(lawnArea));
  };

  const onDeleteProperty = () => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      CustomerPropertyId: propertyId,
      Alias: propertyName,
      DeviceDetails: deviceDetails,
    };

    deleteCustomerProperty(
      payload,
      () => {
        setShowDeleteModal(false);
        setTimeout(() => {
          onSetShowModal('Successfully deleted this property');
        }, 300);
      },
      error => {
        setShowDeleteModal(false);
        console.log('deleteCustomerProperty error:', error);
      },
    );
  };

  const onSetShowModal = (text: string) => {
    setShowModal(true);
    setModalText(text);
  };
  const onUnsetShowModal = () => {
    setShowModal(false);
    setModalText('');
  };
  const onGoBack = () => {
    NavigationService.goBack();
    onUnsetShowModal();
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Spacer = () => <View style={{marginTop: 10}} />;
  const Spacer2 = () => <View style={{marginTop: 20}} />;

  const SelectionContainer = (props: {list: Array<any>; type: string}) => {
    return (
      <View style={styles.selectionContainer}>
        {props.list.map(
          (item: {id: number; icon: JSX.Element; text: string}, index) => {
            return (
              <SquareContent
                key={index}
                id={item.id}
                icon={item.icon}
                text={item.text}
                length={props.list.length}
                type={props.type}
              />
            );
          },
        )}
      </View>
    );
  };

  const SquareContent = (props: {
    id: number;
    icon: JSX.Element;
    text: string;
    length: number;
    type: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.squareContentContainer,
        {
          width: props.length === 2 ? '48%' : '30%',
          borderColor: isSelected(
            props.type,
            props.id,
            props.text,
            props.type === 'pet' ? selectedPet : selectedServiceType,
            selectedTerrainType,
          )
            ? v2Colors.highlight
            : v2Colors.border,
        },
      ]}
      key={props.id}
      onPress={() => {
        if (props.type === 'pet') dispatch(onSetSelectedPet(props.id));
        if (props.type === 'mow-type')
          dispatch(onSetSelectedServiceType(props.id));
        if (props.type === 'terrain-type')
          dispatch(onSetSelectedTerrainType(props.text));
      }}>
      {props.icon}
      <View>
        <Text h4 right color={v2Colors.green}>
          {props.text}
        </Text>
      </View>
      {isSelected(
        props.type,
        props.id,
        props.text,
        props.type === 'pet' ? selectedPet : selectedServiceType,
        selectedTerrainType,
      ) && (
        <View style={styles.greenCheck}>
          <GREEN_CHECK_CIRCLE />
        </View>
      )}
    </TouchableOpacity>
  );

  const Footer = () => (
    <>
      <ErrorModal
        isVisible={showError}
        setIsVisible={setShowError}
        title={'Oops!'}
        style={{borderRadius: 5}}
        data={error}
      />
      <MiddleModal
        isVisible={isSuccess}
        setIsVisible={setIsSuccess}
        title={'Success'}
        body={'Added a property successfully!'}
      />
    </>
  );

  return (
    <>
      <HeaderContainer
        pageTitle={'Add Property'}
        navigateTo={SCREENS.SIGNUP}
        hasDelete={isUpdate}
        onDelete={() => setShowDeleteModal(true)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
          <KeyboardHandler>
            <View style={styles.container}>
              <ScrollView
                contentContainerStyle={{paddingTop: 25}}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="never">
                                  <Text
                  color={v2Colors.green}
                  style={{
                    marginVertical: 10,
                    marginRight: 5,
                    fontWeight: 'bold',
                  }}>
                  Property Address
                </Text>
                <View>
                  <InputText
                    control={control}
                    name="address"
                    label="Address"
                    onFocus={locateProperty}
                    rightIcon={<PIN height={20} width={20} />}
                    style={{
                      flex: 1,
                      height: 80,
                      alignContent: 'center',
                      alignItems: 'center',
                    }}
                    textStyle={{
                      textAlignVertical: 'top',
                      fontSize: 15,
                      fontFamily: fonts.lexend.regular,
                    }}
                    multiline={true}
                  />
                  <Spacer2 />
                </View>
                <Spacer />
                <Text
                  color={v2Colors.green}
                  style={{
                    marginVertical: 10,
                    marginRight: 5,
                    fontWeight: 'bold',
                  }}>
                  Select Service Type
                </Text>
                <SelectionContainer
                  list={MOW_TYPE_SELECTION}
                  type={'mow-type'}
                />

                {/* <Title text={'Select Terrain Type'} /> */}
                <Text
                  color={v2Colors.green}
                  style={{
                    marginRight: 5,
                    fontWeight: 'bold',
                    marginVertical: 10,
                  }}>
                  Select Terrain Type
                </Text>
                <SelectionContainer
                  list={TERRAIN_TYPE_SELECTION}
                  type={'terrain-type'}
                />

                <Spacer />

                <View style={{flexDirection: 'row', marginVertical: 10}}>
                  <Text
                    color={v2Colors.green}
                    style={{marginRight: 5, fontWeight: 'bold'}}>
                    Remarks
                  </Text>
                  <Text color={v2Colors.greenShade2}>(Optional)</Text>
                </View>

                <InputText
                  control={control}
                  name="remarks"
                  label="Notes: Synthetic grass in backyard, trampoline, etc..."
                  style={{
                    height: 80,
                    borderWidth: 0.5,
                    borderRadius: 5,
                    padding: 10,
                  }}
                  textStyle={{
                    textAlignVertical: 'top',
                    fontSize: 15,
                    fontFamily: fonts.lexend.regular,
                  }}
                  multiline={true}
                  placeholderTextColor="#C0C0C0"
                />

                <Spacer />

                {/* <SetAsDefault /> */}

                <View
                  style={{
                    paddingTop: 10,
                    paddingBottom: 30,
                  }}>
                  <CommonButton
                    text={'Next'}
                    onPress={onSubmit}
                    isFetching={isFetching}
                    style={{
                      borderRadius: 5,
                      marginHorizontal: 10,
                      marginBottom: 25,
                    }}
                    disabled={isFetching}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardHandler>
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>

      <CenterModalV2
        isVisible={showModal}
        setIsVisible={setShowModal}
        text={modalText}
        onPressButton={() => { NavigationService.navigate(SCREENS.TNC)}}
        icon={null}
        fontMessageSize={16}
      />

      <CenterModalW2Buttons
        isVisible={showDeleteModal}
        setIsVisible={setShowDeleteModal}
        onPressYes={() => onDeleteProperty()}
        text={'Delete this property?'}
      />
    </>
  );
};

export default SingupAddressScreen;
