import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  FlatList,
  ActivityIndicator,
  Alert,
  InteractionManager,
  Pressable,
  TextInput,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import {useDispatch, useSelector} from 'react-redux';
import * as _ from 'lodash';
import PENDING_WHITE from '@assets/v2/bookings/icons/pending-white.svg';
import CHECK_WHITE from '@assets/v2/bookings/icons/check-white.svg';
/**
 * ? Local imports
 */
import createStyles from './MyPropertiesScreen.style';

import {SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';
import HeaderContainer from '@shared-components/headers/HeaderContainer';

import {useProperty} from '@services/hooks/useProperty';
import {v2Colors} from '@theme/themes';
import WholeScreenLoader from '@shared-components/loaders/WholeScreenLoader';
import {
  useSafeBottomPadding,
  useSafeBottomPosition,
} from 'shared/functions/useSafeBottomInset';
/**
 * ? SVGs
 */
import CHEVRON_RIGHT from '@assets/v2/list/chevron-right.svg';
import MOW_TYPE from '@assets/v2/list/mow-type.svg';
import SEARCH from '@assets/v2/list/search.svg';
import PLUS_GREEN from '@assets/v2/common/icons/plus-green.svg';
import {RootState} from 'store';
import {
  onResetAddPropertyStates,
  onSetAddPropLawnImages,
  onSetAddPropUriList,
  onSetAddress,
  onSetCountry,
  onSetGeometry,
  onSetIsDefault,
  onSetIsUpdate,
  onSetLawnArea,
  onSetPostalCode,
  onSetPropertyId,
  onSetPropertyLength,
  onSetPropertyName,
  onSetRemarks,
  onSetSelectedPet,
  onSetSelectedServiceType,
  onSetSelectedTerrainType,
  onSetState,
  onSetStreetName,
  onSetStreetNumber,
  onSetSuburb,
} from '@services/states/property/property.slice';

let SERVICE_TYPE_SELECTION_LIST = [
  {label: 'Push Mowing', value: '1'},
  {label: 'Ride-on Mowing', value: '2'},
];

const PROPERTIES_FOCUS_REFRESH_COOLDOWN_MS = 15000;

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IMyPropertiesScreenProps {
  style?: CustomStyleProp;
}

const MyPropertiesScreen: React.FC<IMyPropertiesScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const listBottomPadding = useSafeBottomPadding(80);
  const addButtonBottomPosition = useSafeBottomPosition(20);
  const dispatch = useDispatch();
  const {isReloadScreen} = useSelector((state: RootState) => state.property);

  /**
   * ? Actions
   */

  const {getCustomerProperties} = useProperty();
  const {updateCustomerProperty} = useProperty();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // ? Redux States
  const {token, deviceDetails} = useSelector((state: RootState) => state.user);
  const {serviceTypes} = useSelector((state: RootState) => state.property);

  /**
   * ? States
   */
  const [data, setData] = useState<Array<any>>([]);
  const [services, setServices] = useState<Array<any>>([
    SERVICE_TYPE_SELECTION_LIST,
  ]);
  // search input
  const [items, setItems] = useState<Array<any>>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const isPropertyRequestInFlightRef = React.useRef<boolean>(false);
  const hasLoadedPropertiesRef = React.useRef<boolean>(false);
  const lastPropertiesFocusLoadAtRef = React.useRef<number>(0);

  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        resetAddPropertyFields();

        const now = Date.now();
        if (
          hasLoadedPropertiesRef.current &&
          now - lastPropertiesFocusLoadAtRef.current <
            PROPERTIES_FOCUS_REFRESH_COOLDOWN_MS
        ) {
          return;
        }

        lastPropertiesFocusLoadAtRef.current = now;
        fetchCustomerProperties();
      });

      return () => {
        task.cancel();
      };
    }, []),
  );

  useEffect(() => {
    if (isReloadScreen) {
      lastPropertiesFocusLoadAtRef.current = Date.now();
      fetchCustomerProperties(true);
    }
  }, [isReloadScreen]);

  /**
   * ? Watchers
   */
  useEffect(() => {
    if (!serviceTypes.length) return;

    let formedData: Array<any> = [];
    serviceTypes.map((item: any) => {
      formedData.push({
        label: item.ServiceTypeDesc,
        value: item.ServiceTypeId,
      });
    });

    setServices(formedData);
  }, [serviceTypes]);

  /**
   * ? Functions
   */
  const resetAddPropertyFields = () => {
    dispatch(onResetAddPropertyStates());
  };

  const fetchCustomerProperties = (forceRefresh = false) => {
    if (isPropertyRequestInFlightRef.current) {
      return;
    }

    isPropertyRequestInFlightRef.current = true;
    setIsLoading(!hasLoadedPropertiesRef.current || forceRefresh);
    const payload = {
      CustomerToken: token,
      PropertyId: 0, // 0 to get all
      ...deviceDetails,
    };

    getCustomerProperties(
      payload,
      (data: any) => {
        const fetchedData = data[0].Data;
        setData(fetchedData);
        setItems(fetchedData);
        hasLoadedPropertiesRef.current = true;
        isPropertyRequestInFlightRef.current = false;
        setIsLoading(false);
        return;
      },
      error => {
        hasLoadedPropertiesRef.current = true;
        isPropertyRequestInFlightRef.current = false;
        setIsLoading(false);
        console.log('error:', error);
      },
    );
  };

  const onSetDefaultProperty = async (data: any) => {
    const {
      Address,
      CustomerPropertyAddId,
      CustomerId,
      Alias,
      Country,
      State,
      Suburb,
      StreetName,
      StreetNumber,
      PostalCode,
      LawnArea,
      LawnImages,
      HasOutdoorPets,
      Longitude,
      Latitude,
      ServiceType,
      TerrainType,
    } = data;

    const payload = {
      Address,
      CustomerPropertyId: CustomerPropertyAddId,
      CustomerToken: token,
      CustomerId,
      PropertyName: Alias,
      Country,
      State,
      Suburb,
      StreetName,
      StreetNumber,
      PostalCode,
      LawnArea,
      LawnImages,
      HasIndoorPets: HasOutdoorPets,
      Longitude,
      Latitude,
      ServiceTypeId: ServiceType.includes('Ride-on') ? '2' : '1',
      TerrainType,
      IsDefault: 1,
      DeviceDetails: deviceDetails,
    };

    updateCustomerProperty(payload, (data: any) => {
      fetchCustomerProperties();
    }),
      (error: any) => {
        console.log('updateCustomerProperty error:', error);
      };
  };

  const onUpdateProperty = (item: any, index: number) => {
    dispatch(onSetIsUpdate(true));
    dispatch(onSetIsDefault(!!item.IsDefault ? true : false));
    dispatch(onSetSelectedPet(item.HasOutdoorPets));
    dispatch(
      onSetSelectedServiceType(item.ServiceType.includes('Push') ? 1 : 2),
    );
    dispatch(onSetSelectedTerrainType(item.TerrainType));
    dispatch(onSetLawnArea(item.LawnArea.toString() || 1));
    dispatch(onSetPropertyName(item.Alias));
    dispatch(onSetAddress(item.Address));
    dispatch(onSetAddPropLawnImages(item.LawnImages));
    dispatch(onSetCountry(item.Country));
    dispatch(onSetState(item.State));
    dispatch(onSetSuburb(item.Suburb));
    dispatch(onSetStreetName(item.StreetName));
    dispatch(onSetStreetNumber(item.StreetNumber));
    dispatch(onSetPostalCode(item.PostalCode));
    dispatch(onSetGeometry({lat: item.Latitude, lng: item.Longitude}));
    dispatch(onSetPropertyId(item.CustomerPropertyAddId));
    dispatch(onSetPropertyLength(index));
    let images = item.LawnImages.split(',');
    dispatch(onSetAddPropUriList(images));
    dispatch(onSetRemarks(item.Remarks ?? ''));
    NavigationService.push(SCREENS.ADD_PROPERTY);
  };

  const addProperty = () => {
    dispatch(onSetIsDefault(false));
    dispatch(onSetPropertyLength(data.length));
    dispatch(onSetIsUpdate(false));
    dispatch(onSetAddPropLawnImages([]));
    dispatch(onSetCountry(''));
    dispatch(onSetState(''));
    dispatch(onSetSuburb(''));
    dispatch(onSetStreetName(''));
    dispatch(onSetStreetNumber(''));
    dispatch(onSetPostalCode(''));
    dispatch(onSetAddPropUriList([]));

    NavigationService.push(SCREENS.ADD_PROPERTY);
  };

  // ? Search function for finding properties
  const onSearch = (searchString: string) => {
    const filteredProperty = data.filter((item: any) =>
      _.toLower(item.Alias).includes(searchString.toLowerCase()),
    );

    if (!searchString) return setItems(data);
    setItems(filteredProperty);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Separator = () => <View style={{width: 20}} />;

  const renderProperties = (value: any) => {
    const {item, index} = value;
    const {
      Alias,
      Address,
      IsDefault,
      LawnArea,
      HasOutdoorPets,
      ServiceType,
      TerrainType,
      IsActive,
    } = item;

    if (!Alias) return null;
    return (
      <Pressable
        onPress={() =>
          IsActive
            ? onUpdateProperty(item, index)
            : Alert.alert('This property is not active.')
        }
        style={{backgroundColor:'#FFFFFF'}}>
        <View style={styles.topContent}>
          <View style={{width: '85%'}}>
            <View style={styles.isDefaultContainer}>
              {/* <Text
                bold
                color={'rgba(0,0,0,0.7)'}
                style={{marginBottom: 4, fontSize: 16}}>
                {_.upperFirst(Alias)}
              </Text> */}
              <View style={{flexDirection: 'row'}}>
                {!IsActive ? (
                  <View style={styles.pendingStatusPropContainer}>
                    <Text
                      bold
                      color={'white'}
                      style={{
                        fontSize: 9,
                        fontStyle: 'italic',
                      }}>
                      Pending
                    </Text>
                    <PENDING_WHITE pointerEvents="none" style={{top: 1, margin: 1}} />
                  </View>
                ) : (
                  <View style={styles.verifiedStatusPropContainer}>
                    <Text
                      bold
                      color={'white'}
                      style={{
                        fontSize: 9,
                        fontStyle: 'italic',
                      }}>
                      Verified
                    </Text>
                    <CHECK_WHITE pointerEvents="none" style={{top: 1, margin: 1}} />
                  </View>
                )}
                {!!IsDefault && (
                  <View style={styles.defaultPropContainer}>
                    <Text
                      bold
                      color={'white'}
                      style={{
                        fontSize: 9,
                        fontStyle: 'italic',
                      }}>
                      Default
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.addressContainer}>
              <Text h5 color={'rgba(0,0,0,0.79)'}>
                {Address}
              </Text>
            </View>
          </View>
          <View style={{width: '10%', alignContent: 'center'}}>
            <CHEVRON_RIGHT pointerEvents="none" />
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Separator />
          <MOW_TYPE pointerEvents="none" />
          {renderBottomText(ServiceType.split(' ')[0])}
        </View>
      </Pressable>
    );
  };

  const renderBottomText = (text: string) => (
    <>
      <View style={{width: 10}} />
      <Text h5 color={v2Colors.green}>
        {text}
      </Text>
    </>
  );

  const AddButton = () => (
    <Pressable onPress={() => addProperty()} style={styles.button}>
      <Text color={'white'}>Add Property</Text>
      <View style={{width: 5}} />
      <PLUS_GREEN pointerEvents="none" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <HeaderContainer
        pageTitle="Properties"
        navigateTo={SCREENS.HOME}
        // backDisabled
      />

      {data.length > 5 && (
        <View style={{marginBottom: 20}}>
          {!searchText && <SEARCH style={styles.search} />}
          <TextInput
            style={styles.searchInputText}
            placeholder="Search Property"
            onChangeText={(text: string) => {
              setLoading(true);
              setItems([]);
              setSearchText(() => text);

              setTimeout(() => {
                setLoading(false);
                onSearch(text);
              }, 1000);
            }}
            defaultValue={searchText}
            placeholderTextColor={v2Colors.gray}
            autoCorrect={false}
            clearButtonMode="always"
          />
        </View>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="black"
          style={styles.loadingContainer}
        />
      )}

      <FlatList
        data={items}
        keyExtractor={(_, index) => `${index}`}
        renderItem={renderProperties}
        contentContainerStyle={[styles.propertyContainer, listBottomPadding]}
        showsVerticalScrollIndicator={false}
      />
      <View style={[styles.buttonContainer, addButtonBottomPosition]}>
        <AddButton />
      </View>
      {isLoading && <WholeScreenLoader />}
    </View>
  );
};

export default MyPropertiesScreen;
