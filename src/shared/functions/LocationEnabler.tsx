import {isAndroid} from '@freakycoder/react-native-helpers';
// const LocationEnabler = isAndroid
//   ? require("react-native-location-enabler")
//   : null;
import LocationEnabler from 'react-native-location-enabler';

const {
  PRIORITIES: {HIGH_ACCURACY},
  addListener,
  checkSettings,
  requestResolutionSettings,
} = LocationEnabler;

const LocationEnablerComponent = () => {
  // Adds a listener to be invoked when location settings checked using
  // [checkSettings] or changed using [requestResolutionSettings]
  const listener = addListener(({locationEnabled}) =>
    console.log(`Location are ${locationEnabled ? 'enabled' : 'disabled'}`),
  );

  // Define configuration
  const config = {
    priority: HIGH_ACCURACY, // default BALANCED_POWER_ACCURACY
    alwaysShow: true, // default false
    needBle: false, // default false
  };

  // Check if location is enabled or not
  checkSettings(config);

  // If location is disabled, prompt the user to turn on device location
  requestResolutionSettings(config);

  // ...
  // Removes this subscription
  listener.remove();

  return null;
};

export default LocationEnablerComponent;
