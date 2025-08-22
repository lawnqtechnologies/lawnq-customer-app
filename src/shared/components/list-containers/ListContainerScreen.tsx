import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
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
import createStyles from './ListContainerScreen.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {v2Colors} from '@theme/themes';
import fonts from '@fonts';
import HeaderContainer from '@shared-components/headers/HeaderContainer';

/**
 * ? SVGs
 */
import SEARCH from '@assets/v2/list/search.svg';
import CHEVRON_RIGHT from '@assets/v2/list/chevron-right.svg';
import AREA from '@assets/v2/list/area.svg';
import PET from '@assets/v2/list/pet.svg';
import MOW_TYPE from '@assets/v2/list/mow-type.svg';
import CHART from '@assets/v2/list/chart.svg';
import PLUS_GREEN from '@assets/v2/common/icons/plus-green.svg';
import {SCREENS} from '@shared-constants';
import {
  onSetBookingIntervalServiceTimeValue,
  onSetBookingServiceTypeValue,
  onSetGrassClippingsValue,
  onSetIsPropertyPickedFromList,
  onSetProperty,
} from '@services/states/booking/booking.slice';
import {
  OnSetIsReloadScreen,
  onSetAddPropLawnImages,
  onSetAddPropUriList,
  onSetCountry,
  onSetIsDefault,
  onSetIsUpdate,
  onSetLawnArea,
  onSetPostalCode,
  onSetPropertyLength,
  onSetSelectedPet,
  onSetSelectedServiceType,
  onSetSelectedTerrainType,
  onSetState,
  onSetStreetName,
  onSetStreetNumber,
  onSetSuburb,
} from '@services/states/property/property.slice';
import {useProperty} from '@services/hooks/useProperty';
import {RootState} from 'store';

/**
 * ? Constants
 */

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IListScreenProps {
  style?: CustomStyleProp;
  navigation?: any;
  route?: any;
}

/**-----------------------------------------------------
 * THIS COMPONENT IS DEDICATED ONLY FOR LIST OF PROPERY
 * -----------------------------------------------------
 */

const ListScreen: React.FC<IListScreenProps> = ({route}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const {token, customerId, customerInfo, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );
  const {isReloadScreen} = useSelector((state: RootState) => state.property);

  const {data, isSearchable, type, pageTitle, navigateTo} = route.params;

  /**
   * ? References
   */
  const textRef = useRef<any>();
  const {getCustomerProperties} = useProperty();

  /**
   * ? States
   */
  const [items, setItems] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  /**
  |--------------------------------------------------
  | Side effect
  |--------------------------------------------------
  */
  useFocusEffect(
    useCallback(() => {
      fetchCustomerProperties();
    }, []),
  );

  useEffect(() => {
    if (isReloadScreen) {
      fetchCustomerProperties();
    }
  }, [isReloadScreen]);

  /**
   * ? Functions
   */
  const fetchCustomerProperties = () => {
    setLoading(true);
    const payload = {
      CustomerToken: token,
      PropertyId: 0,
      ...deviceDetails,
    };

    getCustomerProperties(
      payload,
      (data: any) => {
        const fetchedData = data[0].Data;
        let propertyArrayList: Array<any> = [];
        // if customer has no property will navigate to this propery screen
        if (!data[0].Data.length || !data[0].Data[0].CustomerId.length) {
          NavigationService.push(SCREENS.ADD_PROPERTY);
          Alert.alert('Please add a property first');
          return;
        }

        fetchedData.map((item: any, index: number) => {
          propertyArrayList.push({
            label: item.Alias,
            value: item.CustomerPropertyAddId,
            shortDesc: item.Address,
            lawnArea: parseInt(item.LawnArea),
            latitude: item.Latitude,
            longitude: item.Longitude,
            serviceType: item.ServiceType,
            terrainType: item.TerrainType,
            propertyIndex: index,
            hasPet: item.HasOutdoorPets,
            isActive: item.IsActive,
            isDefault: item.IsDefault,
          });
        });
        setItems(propertyArrayList);
        setLoading(false);
        dispatch(OnSetIsReloadScreen(false));
      },
      error => {
        console.log('error:', error);
        setLoading(false);
      },
    );
  };

  // ? Search function for finding properties
  const onSearch = (searchString: string) => {
    const filteredProperty = items.filter((item: any) =>
      _.toLower(item.label).includes(searchString.toLowerCase()),
    );

    setItems(filteredProperty);
  };
  const VerifiedStatus = () => (
    <View style={[styles.statusContainer, {backgroundColor: v2Colors.blue}]}>
      <Text h4 color={'white'}>
        {'Verified'}
      </Text>
      <View style={{width: 5}} />
      <CHECK_WHITE />
    </View>
  );
  const PendingStatus = () => (
    <View style={styles.statusContainer}>
      <Text h4 color={'white'}>
        {'Pending'}
      </Text>
      <View style={{width: 5}} />
      <PENDING_WHITE style={{top: 2}} />
    </View>
  );
  const handleReset = () => {
    setItems([]);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setItems(data);
    }, 1000);
  };

  const addProperty = () => {
    dispatch(onSetIsDefault(false));
    dispatch(onSetPropertyLength(items.length));
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

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const renderItem = (values: any) => {
    const {
      label,
      shortDesc,
      value,
      lawnArea,
      lawnAreaId,
      latitude,
      longitude,
      propertyIndex,
      serviceType,
      terrainType,
      hasPet,
      isActive,
      isDefault,
    } = values.item;

    /**-----------------------------------------------------
     * METHODS
     * -----------------------------------------------------
     */
    const handleOnPressPropertyItem = () => {
      if (isActive) {
        if (type === 'property') {
          dispatch(
            onSetProperty({
              label,
              shortDesc,
              value,
              lawnArea,
              lawnAreaId,
              latitude,
              longitude,
              propertyIndex,
              serviceType,
              terrainType,
            }),
          );
          dispatch(onSetIsPropertyPickedFromList(true));
        }
        type === 'bookingIntervalServiceTime' &&
          dispatch(onSetBookingIntervalServiceTimeValue({label, value}));
        type === 'bookingService' &&
          dispatch(onSetBookingServiceTypeValue({label, value}));
        type === 'grassClippings' &&
          dispatch(onSetGrassClippingsValue({label, value}));
        type === 'lawnArea1' && dispatch(onSetLawnArea({label, value}));
        type === 'pet' && dispatch(onSetSelectedPet({label, value}));
        type === 'serviceType' &&
          dispatch(onSetSelectedServiceType({label, value}));
        type === 'terrainType' &&
          dispatch(onSetSelectedTerrainType({label, value}));

        NavigationService.goBack();
      } else {
        Alert.alert('This property is not active.');
      }
    };

    return (
      <>
        <TouchableOpacity
          onPress={handleOnPressPropertyItem}
          style={{backgroundColor: isActive ? '#FFFFFF' : '#E1E6E1'}}>
          <View style={styles.topContent}>
            <View style={{width: '85%'}}>
              <View style={styles.isDefaultContainer}>
                {/* Right header */}
                <Text
                  bold
                  color={'rgba(0,0,0,0.7)'}
                  style={{marginBottom: 4, fontSize: 16}}>
                  {_.upperFirst(label)}
                </Text>

                {/* Left header */}
                <View style={{flexDirection: 'row'}}>
                  {!isActive ? (
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
                      <PENDING_WHITE style={{top: 1, margin: 1}} />
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
                      <CHECK_WHITE style={{top: 1, margin: 1}} />
                    </View>
                  )}
                  {!!isDefault && (
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
                <Text color={v2Colors.greenShade2} style={{fontSize: 14}}>
                  {shortDesc}
                </Text>
              </View>
            </View>
            <View style={{width: '10%', alignContent: 'center'}}>
              <CHEVRON_RIGHT />
            </View>
          </View>
          <View style={styles.bottomContent}>
            <AREA />
            {renderBottomText(lawnArea)}

            <Separator />
            <PET />
            {renderBottomText(!hasPet ? 'No' : 'Yes')}

            <Separator />
            <MOW_TYPE />
            {renderBottomText(serviceType.split(' ')[0])}

            <Separator />

            <CHART />
            {renderBottomText(terrainType)}
          </View>
        </TouchableOpacity>
      </>
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

  const Separator = () => <View style={{width: 20}} />;

  const AddButton = () => (
    <TouchableOpacity onPress={() => addProperty()} style={styles.button}>
      <Text color={'white'}>Add Property</Text>
      <View style={{width: 5}} />
      <PLUS_GREEN />
    </TouchableOpacity>
  );

  return (
    <>
      <HeaderContainer pageTitle={pageTitle} navigateTo={navigateTo} />
      <View style={styles.container}>
        {/* {isSearchable && (
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
              ref={textRef}
            />
          </View>
        )} */}

        {loading && (
          <ActivityIndicator
            size="large"
            color="black"
            style={styles.loadingContainer}
          />
        )}

        <FlatList
          data={items}
          renderItem={item => renderItem(item)}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.propertyContainer}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.buttonContainer}>
          <AddButton />
        </View>
      </View>
    </>
  );
};

export default ListScreen;
