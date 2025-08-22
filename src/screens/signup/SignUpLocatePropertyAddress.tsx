import React, {useEffect, useMemo, useState, useRef, useCallback} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  Dimensions,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geocoder from 'react-native-geocoding';
import BottomSheet from '@gorhom/bottom-sheet';
import Geolocation from '@react-native-community/geolocation';
import WholeScreenLoader from '@shared-components/loaders/WholeScreenLoader';
import 'react-native-get-random-values';
/**
 * ? Local imports
 */
import createStyles from './SignUpLocatePropertyAddress.style';
import {v2Colors} from '@theme/themes';
import {SCREENS} from '@shared-constants';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import CommonButton from '@shared-components/buttons/CommonButton';
import InputTextNoControl from '@shared-components/form/InputText/v2/input-text-no-control';
// import Map from '../components/map';
import Map from '../my-properties/components/map'
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

/**
 * ? SVGs
 */
import TARGET from '@assets/v2/common/icons/target.svg';
import {
  onSetAddress,
  onSetAddressComponents,
  onSetCountry,
  onSetGeometry,
  onSetPostalCode,
  onSetState,
  onSetStreetName,
  onSetStreetNumber,
  onSetSuburb,
} from '@services/states/property/property.slice';
import {LocationData} from '@interface/map/LocationData';

/**
 * ? Constants
 */
const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const GOOGLE_PLACES_API_KEY = 'AIzaSyAQ_Hd8-sh8uM6rufkNrkvABip3292UoXs';
const INITIAL_REGION = {
  latitude: -33.7619, // Corrected to use negative latitude for Australia
  longitude: 150.9929,
  // latitudeDelta: 0.0043,
  // longitudeDelta: 0.0043 * ASPECT_RATIO,
};

const initialLocationData: LocationData = {
  coords: {
    accuracy: 5,
    altitude: 99.2,
    heading: 10.979999542236328,
    latitude: -33.8688, // Sydney latitude
    longitude: 151.2093, // Sydney longitude
    speed: 0.8456885814666748,
  },
  extras: {
    maxCn0: 28,
    meanCn0: 19,
    satellites: 8,
  },
  mocked: false,
  timestamp: 1734661836000,
};

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ILocatePropertyAddress {
  style?: CustomStyleProp;
  navigation: any;
}

const SignUpLocatePropertyAddress: React.FC<ILocatePropertyAddress> = ({
  navigation,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  Geocoder.init(GOOGLE_PLACES_API_KEY);

  /**
   * ? States
   */
  const [region, setRegion] = useState<any>(INITIAL_REGION);

  const [URL, SetURL] = useState<string>('');
  const [desc, setDesc] = useState<string>('');

  // ? bottom sheet handlers
  const [i, setI] = useState<number>(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '80%'], []);
  const handleSheetChanges = useCallback((index: number) => {
    setI(() => index);
  }, []);

  /**
   * ? Mounted
   */

  useEffect(() => {
    if (Platform.OS === 'ios') {
      requestLocationPermission();
    } else {
      requestLocationAndroidPermission();
    }
  }, []);

  const requestLocationAndroidPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message:
            'This app needs access to your location ' +
            'to provide location-based services.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const requestLocationPermission = async () => {
    const permissionStatus = await request(
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    );

    switch (permissionStatus) {
      case RESULTS.UNAVAILABLE:
        Alert.alert(
          'Location Permission',
          'Location services are blocked. Please enable them in settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        break;
      case RESULTS.DENIED:
        requestLocationPermission();
        break;
      case RESULTS.GRANTED:
        getCurrentLocation();
        break;
      case RESULTS.BLOCKED:
        Alert.alert(
          'Location Permission',
          'Location services are blocked. Please enable them in settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        break;
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);

    Geolocation.getCurrentPosition(
      position => {
        onWatchCoords(position.coords.latitude, position.coords.longitude);
        const thisRegion = {
          ...region,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setRegion(thisRegion);
        setIsLoading(false);
      },
      async error => {
        console.log(error.message);
        setIsLoading(false);
        if (Platform.OS === 'android') {
          await _enableGPS();
        }
      },

      {enableHighAccuracy: true, timeout: 60000},
    );

    setIsLoading(false);
  };
  const _enableGPS = async () => {
    Alert.alert(
      'Please enable location in settings or check your internet connection',
    );
    navigation.navigate(SCREENS.ADD_PROPERTY);
  };
  const onRegionChange = async (thisRegion: any) => {
    return thisRegion;
  };

  const onWatchCoords = (thisLat: number, thisLng: number) => {
    dispatch(
      onSetGeometry({
        lat: thisLat.toString(),
        lng: thisLng.toString(),
      }),
    );
    setIsLoading(true);
    Geocoder.from({
      latitude: thisLat,
      longitude: thisLng,
    })
      .then(json => {
        const formattedAddress = json.results[0].formatted_address;
        setDesc(formattedAddress);
        const addressComponent = json.results[0].address_components;

        if (addressComponent.length > 0) {
          addressComponent.forEach(item => {
            console.log(item);
            // dispatch street number
            if (item.types[0] === 'street_number') {
              dispatch(onSetStreetNumber(item.long_name));
            }

            // // dispatch street name
            if (item.types[0] === 'route') {
              dispatch(onSetStreetName(item.long_name));
            }

            // get the suburb
            if (item.types[0] === 'locality') {
              dispatch(onSetSuburb(item.short_name));
            }

            // get the state
            if (item.types[0] === 'administrative_area_level_1') {
              dispatch(onSetState(item.long_name));
            }

            //get postal code
            if (item.types[0] === 'postal_code') {
              dispatch(onSetPostalCode(item.long_name));
            }

            //get country
            if (item.types[0] === 'country') {
              dispatch(onSetCountry(item.long_name));
            }
          });
        }

        dispatch(onSetAddressComponents(addressComponent));
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const _clearAddress = () => {
    setI(1);
    setDesc('');
    dispatch(onSetStreetNumber(''));
    dispatch(onSetStreetNumber(''));
    dispatch(onSetSuburb(''));
    dispatch(onSetState(''));
    dispatch(onSetPostalCode(''));
    dispatch(onSetCountry(''));
  };

  const navigateBackto = () => {
    dispatch(onSetAddress(desc));
    navigation.navigate(SCREENS.SIGNUP_ADDRESS);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  const GooglePlacesInput = () => {
    return (
      <>
        <View style={{height, width: width * 0.92, marginTop: 5}}>
          <GooglePlacesAutocomplete
            placeholder="Search Address"
            currentLocation={true}
            currentLocationLabel="Current location"
            onPress={(data: any, details: any = null) => {
              const newLat: number = Number(details?.geometry.location.lat);
              const newLng: number = Number(details?.geometry.location.lng);
              const newUrl: string = details?.url || '';

              dispatch(
                onSetGeometry({
                  lat: newLat.toString(),
                  lng: newLng.toString(),
                }),
              );

              Geocoder.from({
                latitude: newLat,
                longitude: newLng,
              })
                .then(json => {
                  var addressComponent = json.results[0].address_components;

                  if (addressComponent.length > 0) {
                    addressComponent.forEach(item => {
                      if (item.types[0] === 'street_number') {
                        dispatch(onSetStreetNumber(item.long_name));
                      }
                      // // dispatch street name
                      if (item.types[0] === 'route') {
                        dispatch(onSetStreetName(item.long_name));
                      }

                      // get the suburb
                      if (item.types[0] === 'locality') {
                        dispatch(onSetSuburb(item.short_name));
                      }

                      // get the state
                      if (item.types[0] === 'administrative_area_level_1') {
                        dispatch(onSetState(item.long_name));
                      }

                      //get postal code
                      if (item.types[0] === 'postal_code') {
                        dispatch(onSetPostalCode(item.long_name));
                      }

                      //get country
                      if (item.types[0] === 'country') {
                        dispatch(onSetCountry(item.long_name));
                      }
                    });
                  }

                  dispatch(onSetAddressComponents(addressComponent));
                })
                .catch(error => {
                  console.log('here is the error');
                  console.log(error);
                });

              setDesc(data.description);
              setI(() => 0);
              SetURL(newUrl);

              const thisRegion = {
                ...region,
                latitude: newLat,
                longitude: newLng,
              };
              setRegion(thisRegion);
              onWatchCoords(newLat, newLng);
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
              components: 'country:aus',
            }}
            fetchDetails
            enableHighAccuracyLocation
            keepResultsAfterBlur={true}
            keyboardShouldPersistTaps={'always'}
            styles={{
              description: {color: 'black'},
              textInput: {
                color: '#5d5d5d',
                backgroundColor: '#FFFFFF',
                height: 60,
                fontSize: 16,
                borderColor: v2Colors.border,
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.23,
                shadowRadius: 2.62,
                elevation: 4,
              },
            }}
          />
        </View>
      </>
    );
  };

  const ConfirmButton = () => {
    return (
      <View
        style={{height, width: width * 0.92, marginTop: 10, marginBottom: 20}}>
        <CommonButton
          style={{borderRadius: 5}}
          text="Confirm"
          onPress={navigateBackto}
        />
      </View>
    );
  };

  const AddressInput = () => {
    return (
      <InputTextNoControl
        value={desc}
        setValue={setDesc}
        label="Enter Address"
        rightIcon={<TARGET height={20} width={20} />}
        onFocus={_clearAddress}
        contentContainerStyle={{width: width * 0.92}}
      />
    );
  };

  return (
    <View style={styles.container}>
      <HeaderContainer
        pageTitle="Locate Property"
        navigateTo={SCREENS.ADD_PROPERTY}
      />
      <Map
        region={region}
        // onRegionChange={onRegionChange}

        onWatchCoords={onWatchCoords}
        // setRegion={setRegion}
        // styles={styles}
      />
      {isLoading && <WholeScreenLoader />}
      <BottomSheet
        ref={bottomSheetRef}
        index={i}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enableOverDrag={false}>
        <View style={styles.bottomSheetContainer}>
          {!i ? (
            <>
              <View style={{marginTop: 10}}>
                <AddressInput />
                <View style={{height: 15}} />
                <ConfirmButton />
              </View>
            </>
          ) : (
            <GooglePlacesInput />
          )}
        </View>
      </BottomSheet>
    </View>
  );
};

export default SignUpLocatePropertyAddress;
