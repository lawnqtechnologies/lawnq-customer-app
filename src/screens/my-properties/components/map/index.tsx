import React, {useMemo, useState, memo, useEffect} from 'react';
import {View, StyleProp, ViewStyle, Dimensions, Platform} from 'react-native';
import {useTheme} from '@react-navigation/native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
/**
 * ? Local imports
 */
import createStyles from './Map.style';
import {customMap} from './customMap';
import {RootState} from '../../../../store';

/**
 * ? Constants
 */
const PHONE = '../../../assets/icons/gray/phone.png';

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const GOOGLE_PLACES_API_KEY = 'AIzaSyAQ_Hd8-sh8uM6rufkNrkvABip3292UoXs';

interface IMapProps {
  mapHeight?: string | number;
  mapWidth?: string | number;
  region: any;
  onWatchCoords: any;
}

const Map: React.FC<IMapProps> = ({style, region, onWatchCoords}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [lat, setLat] = useState<number>(region.latitude);
  const [lng, setLng] = useState<number>(region.longitude);

  const handleRegionChange = (mapData: any) => {
    setLat(mapData.latitude);
    setLng(mapData.longitude);
    onWatchCoords(mapData.latitude, mapData.longitude);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  const Map = memo(() => {
    return (
      <>
        <MapView
          toolbarEnabled
          mapType="standard"
          provider={
            Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          customMapStyle={customMap}
          initialRegion={{
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: 0.0043,
            longitudeDelta: 0.0043 * ASPECT_RATIO,
          }}
          onRegionChangeComplete={handleRegionChange}
          style={[styles.mapContainer]}
          // liteMode

          // loadingIndicatorColor="#666666"
          loadingBackgroundColor="#eeeeee"
          // showsUserLocation={true}
          zoomControlEnabled={true}></MapView>
      </>
    );
  });

  return (
    <View style={[styles.container, style]}>
      <Map />
    </View>
  );
};

export default Map;
