import React, { useMemo, useState, memo, useEffect } from "react";
import { View, StyleProp, ViewStyle, Dimensions } from "react-native";
import { useTheme } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-dynamic-vector-icons";
import { useSelector } from "react-redux";

/**
 * ? Local imports
 */
import createStyles from "./Map.style";
import { customMap } from "./customMap";
import { RootState } from "../../../../store";

/**
 * ? Constants
 */
const PHONE = "../../../assets/icons/gray/phone.png";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const GOOGLE_PLACES_API_KEY = "AIzaSyAQ_Hd8-sh8uM6rufkNrkvABip3292UoXs";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ISearchableMapProps {
  style?: CustomStyleProp;
  height?: string | number;
  width?: string | number;
  mapHeight?: string | number;
  mapWidth?: string | number;
  outLatitude?: number;
  outLongitude?: number;
}

const SearchableMap: React.FC<ISearchableMapProps> = ({
  height = "100%",
  width = "100%",
  mapHeight = "50%",
  mapWidth = "50%",
  style,
  outLatitude,
  outLongitude,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [lat, setLat] = useState<number>(-33.80825);
  const [lng, setLng] = useState<number>(151.00502);

  const [desc, setDesc] = useState<string>("");

  /**
   * ? Redux States
   */
  const { property } = useSelector((state: RootState) => state.booking);

  /**
   * ? Watchers
   */
  // useEffect(() => {
  //   setLat(property.latitude);
  //   setLng(property.longitude);
  // }, [property]);

  /**
   * ? Functions
   */

  const handleRegionChange = (mapData: any) => {
    setLat(mapData.latitude);
    setLng(mapData.longitude);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const MapMarker = memo(() => {
    return (
      <Marker
        title={desc}
        coordinate={{ latitude: lat, longitude: lng }}
        key={"1"}
      >
        <Icon name="location-sharp" type="Ionicons" color={"red"} size={30} />
      </Marker>
    );
  });

  const Map = memo(() => {
    return (
      <MapView
        // toolbarEnabled
        mapType="standard"
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMap}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.0043,
          longitudeDelta: 0.0043 * ASPECT_RATIO,
        }}
        // onRegionChangeComplete={handleRegionChange}
        style={[
          styles.mapContainer,
          {
            height: mapHeight,
            width: mapWidth,
          },
        ]}
        liteMode
        loadingEnabled
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#eeeeee"
        showsUserLocation={true}
        zoomControlEnabled={true}
      >
        <MapMarker />
      </MapView>
    );
  });

  return (
    <View style={[styles.container, style]}>
      <Map />
    </View>
  );
};

export default SearchableMap;
