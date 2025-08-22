import {useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
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
import FastImage from 'react-native-fast-image';

import * as _ from 'lodash';
import {yupResolver} from '@hookform/resolvers/yup';

import createStyles from './AddPropertyScreen.style';
import {v2Colors} from '@theme/themes';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import {PROPERTY_MESSAGE, SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';
import CommonButton from '@shared-components/buttons/CommonButton';
import ErrorModal from '@shared-components/modals/error-modal/ErrorModal';
import MiddleModal from '@shared-components/modals/MiddleModal';
import {PropertySchema} from '../../utils/validation-schemas/property';
import ImageUploadFunction from 'shared/functions/ImageUpload';
import InputText from '@shared-components/form/InputText/v2/input-text';
import {isSelected} from './helpers';
import UploadImagesLoader from '@shared-components/loaders/upload-loader.tsx';
import {useProperty} from '@services/hooks/useProperty';

/**
 * ? SVGs
 */
import PROPERTY_NAME from '@assets/v2/properties/icons/property-name.svg';
import PIN from '@assets/v2/properties/icons/pin.svg';
import AREA from '@assets/v2/properties/icons/area.svg';

import GREEN_CHECK_CIRCLE from '@assets/v2/common/icons/green-check-circle.svg';
import HAS_PET from '@assets/v2/properties/icons/has-pet.svg';
import NO_PET from '@assets/v2/properties/icons/no-pet.svg';
import PUSH_MOWER from '@assets/v2/properties/icons/push-mower.svg';
import RIDE_ON_MOWER from '@assets/v2/properties/icons/ride-on-mower.svg';
import FLAT_TERRAIN from '@assets/v2/properties/icons/flat-terrain.svg';
import STEEP_TERRAIN from '@assets/v2/properties/icons/steep-terrain.svg';
import MIXED_TERRAIN from '@assets/v2/properties/icons/mixed-terrain.svg';

import GALLERY from '@assets/v2/homescreen/icons/gallery.svg';
import CAMERA from '@assets/v2/homescreen/icons/camera.svg';
import CenterModalV2 from '@shared-components/modals/center-modal/CenterModalV2';
import CenterModalW2Buttons from '@shared-components/modals/center-modal/with-2-buttons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// ? Constants
const CONTAINER = 'Lawns';
const PET_SELECTION = [
  {
    id: 1,
    icon: <HAS_PET />,
    text: 'Yes',
  },
  {
    id: 0,
    icon: <NO_PET />,
    text: 'No Pets',
  },
];
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

const AddPropertyScreen: React.FC<IAddPropertyScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  /**
   * ? Hooks
   */
  const {saveCustomerProperty, updateCustomerProperty, deleteCustomerProperty} =
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

  const [isDefault, setIsDefault] = useState(false);
  const toggleSwitch = () => setIsDefault(previousState => !previousState);

  // For image related functionality
  const [imageAction, setImageAction] = useState<string>('');
  const [onUpload, setOnUpload] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDoneUploading, setIsDoneUploading] = useState<boolean>(false);

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
  } = useForm({
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
    setIsDefault(isUsed);
  }, [isUsed]);

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
  }, [address]);

  // ? Functions
  const locateProperty = () => {
    setValuesOnChangeScreen();
    NavigationService.navigate(SCREENS.LOCATE_PROPERTY);
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
    if (isUpdate) {
      onUpdateProperty();
    } else {
      onSaveProperty();
    }
  };

  /**
  |--------------------------------------------------
  | FORM SAVING
  |--------------------------------------------------
  */

  const requestLawnImages = async () => {
    let request = new FormData();
    if (addPropURIList.length > 0) {
      for (let i = 0; i < addPropURIList.length; i++) {
        return request.append('LawnImages', addPropURIList[i]);
      }
    } else {
      request.append('LawnImages', []);
    }
  };

  const onSaveProperty = async () => {
    setIsFetching(true);
    const values = getValues();
    let request = new FormData();

    let _titleName =
      StreetName === '' ? Suburb : StreetNumber + ' ' + StreetName;

    request.append('CustomerToken', token);
    request.append('CustomerId', customerId);
    await requestLawnImages();
    request.append('Address', address);
    request.append('PropertyName', _titleName);
    request.append('Country', Country);
    request.append('State', State);
    request.append('Suburb', Suburb);
    request.append('StreetNumber', StreetNumber);
    request.append('PostalCode', PostalCode);
    request.append('LawnArea', 0);
    request.append('StreetName', StreetName);
    request.append('HasIndoorPets', selectedPet || 0);
    request.append('Longitude', geometry.lng);
    request.append('Latitude', geometry.lat);
    request.append('ServiceTypeId', selectedServiceType || 0);
    request.append('TerrainType', selectedTerrainType || '');
    request.append('IsDefault', isDefault ? 1 : 0);
    request.append('Remarks', values.Remarks);
    request.append('DeviceDetails.AppVersion', deviceDetails.AppVersion);
    request.append('DeviceDetails.DeviceModel', deviceDetails.DeviceModel);
    request.append('DeviceDetails.DeviceVersion', deviceDetails.DeviceVersion);
    request.append('DeviceDetails.IpAddress', deviceDetails.IpAddress);
    request.append('DeviceDetails.MacAddress', deviceDetails.MacAddress);
    request.append('DeviceDetails.Platform', deviceDetails.Platform);
    request.append('DeviceDetails.PlatformOs', deviceDetails.PlatformOs);

    saveCustomerProperty(request, (data: any) => {
      setIsFetching(false);

      if (data[0]?.StatusCode === '01')
        return Alert.alert(data[0]?.StatusMessage);

      if (isDefault)
        AsyncStorage.setItem('DEFAULT_PROPERTY', values.propertyName);

      if (data[0]?.Data[0]?.HasValidRadius === false) {
        onSetShowModal(PROPERTY_MESSAGE.OUTSIDE_RADIUS);
        dispatch(onResetAddPropertyStates());
      } else {
        onSetShowModal(PROPERTY_MESSAGE.INSIDE_RADIUS);
        dispatch(onResetAddPropertyStates());
      }
    }),
      (error: any) => {
        console.log('saveCustomerProperty error:', error);
        Alert.alert('Something went wrong on network please try again!');
        setIsFetching(false);
      };
  };

  const setValuesOnChangeScreen = () => {
    const values = getValues();
    const {propertyName, lawnArea, Remarks} = values;

    dispatch(onSetRemarks(Remarks));
    dispatch(onSetPropertyName(propertyName));
    dispatch(onSetLawnArea(lawnArea));
  };

  const onUpdateProperty = async () => {
    setIsFetching(true);
    const values = getValues();
    let _titleName =
      StreetName === '' ? Suburb : StreetNumber + ' ' + StreetName;

    let request = new FormData();
    request.append('CustomerToken', token);
    request.append('CustomerId', customerId);
    await requestLawnImages();
    request.append('Address', address);
    request.append('PropertyName', _titleName);
    request.append('Country', Country);
    request.append('State', State);
    request.append('Suburb', Suburb);
    request.append('StreetNumber', StreetNumber);
    request.append('PostalCode', PostalCode);
    request.append('LawnArea', 0);
    request.append('StreetName', StreetName);
    request.append('HasIndoorPets', selectedPet || 0);
    request.append('Longitude', geometry.lng);
    request.append('Latitude', geometry.lat);
    request.append('ServiceTypeId', selectedServiceType || 0);
    request.append('TerrainType', selectedTerrainType || '');
    request.append('Remarks', Remarks || '');
    request.append('IsDefault', isDefault ? 1 : 0);

    request.append('CustomerPropertyId', propertyId);

    request.append('DeviceDetails.AppVersion', deviceDetails.AppVersion);
    request.append('DeviceDetails.DeviceModel', deviceDetails.DeviceModel);
    request.append('DeviceDetails.DeviceVersion', deviceDetails.DeviceVersion);
    request.append('DeviceDetails.IpAddress', deviceDetails.IpAddress);
    request.append('DeviceDetails.MacAddress', deviceDetails.MacAddress);
    request.append('DeviceDetails.Platform', deviceDetails.Platform);
    request.append('DeviceDetails.PlatformOs', deviceDetails.PlatformOs);

    updateCustomerProperty(request, (data: any) => {
      if (data[0]?.StatusCode === '01') {
        Alert.alert(data[0]?.StatusMessage);
        return;
      }

      setIsFetching(false);
      if (isDefault)
        AsyncStorage.setItem('DEFAULT_PROPERTY', values.propertyName);

      onSetShowModal('Updated property successfully');
      dispatch(onResetAddPropertyStates());
      setShowModal(true);
    }),
      (error: any) => {
        console.log('updateCustomerProperty error:', error);
        setIsFetching(false);
        Alert.alert('Something went wrong on network please try again!');
      };
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

  const Title = (props: {text: string}) => (
    <View style={styles.titleContainer}>
      <Text h4 bold color={v2Colors.green}>
        {props.text}
      </Text>
    </View>
  );

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

  const renderImages = (value: any) => {
    return (
      <View>
        <FastImage
          source={{uri: value?.item?.length ? value.item : value.item.uri}}
          style={styles.lawnImages}
          resizeMode={'cover'}
        />
      </View>
    );
  };

  const ImageUploads = () => (
    <View style={styles.imageContainer}>
      {!addPropURIList.length ? (
        <>
          <Text color={v2Colors.green} style={{fontSize: 21}}>
            Upload Yard Images
          </Text>
          <Text color={v2Colors.greenShade2} style={{marginTop: 5}}>
            Uploaded images should be recent and clearly display the yard’s
            terrain.
          </Text>
        </>
      ) : (
        <View style={{height: 100, width: '100%'}}>
          <FlatList
            data={addPropURIList}
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
  );

  const ImageUploadAction = (props: any) => (
    <TouchableOpacity
      onPress={() => {
        setImageAction('gallery');
      }}
      style={[styles.buttonSelectImage, {opacity: 1}]}>
      {props.icon}
      <Text color={v2Colors.green} style={{fontSize: 12, marginLeft: 10}}>
        From Gallery
      </Text>
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

  const SetAsDefault = () => (
    <View style={styles.setAsDefaultContainer}>
      <Text color="black" style={{marginRight: 10}}>
        Set as default
      </Text>
      <Switch
        trackColor={{false: '#767577', true: v2Colors.green}}
        thumbColor={isDefault ? 'white' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isDefault}
      />
    </View>
  );

  return (
    <>
      <HeaderContainer
        pageTitle={isUpdate ? 'Update Property' : 'Add Property'}
        navigateTo={SCREENS.HOME}
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
              {isUploading && <UploadImagesLoader />}
              <ScrollView
                contentContainerStyle={{paddingTop: 25}}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="never">
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
                {/* <Title text={'Do you have outdoor pets?'} />
          <SelectionContainer list={PET_SELECTION} type={'pet'} /> */}

                {/* <Title text={'Select Service Type'} /> */}
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

                <SetAsDefault />

                <View
                  style={{
                    paddingTop: 10,
                    paddingBottom: 30,
                  }}>
                  <CommonButton
                    text={isUpdate ? 'Update' : 'Save'}
                    onPress={onSubmit}
                    isFetching={isFetching || isUploading}
                    style={{
                      borderRadius: 5,
                      marginHorizontal: 10,
                      marginBottom: 25,
                    }}
                    disabled={isFetching || isUploading}
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
        onPressButton={onGoBack}
        icon={null}
      />

      <CenterModalW2Buttons
        isVisible={showDeleteModal}
        setIsVisible={setShowDeleteModal}
        onPressYes={() => onDeleteProperty()}
        text={'Delete this property?'}
      />

      <ImageUploadFunction
        processType={'add-property'}
        action={imageAction}
        setAction={setImageAction}
        onUpload={onUpload}
        setOnUpload={setOnUpload}
        setIsUploading={setIsUploading}
        setIsDoneUploading={setIsDoneUploading}
        actionOnDoneUploading={() => {
          if (isUpdate) onUpdateProperty();
          else onSaveProperty();
        }}
        setImageChanged={() => {}}
      />
    </>
  );
};

export default AddPropertyScreen;
