/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMessaging} from '@react-native-firebase/messaging';
import {enableScreens} from 'react-native-screens';
import App from './App';
import {name as appName} from './app.json';
import Icon from 'react-native-vector-icons/MaterialIcons';

if (Platform.OS === 'ios') {
  enableScreens(false);
}

const getMessageData = (message) => {
  if (!message) return undefined;

  if (typeof message === 'string') {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.warn('Failed to parse background notification message:', error);
      return undefined;
    }
  }

  return message;
};

getMessaging().setBackgroundMessageHandler(async (remoteMessage) => {
  try {
    const messageData = getMessageData(remoteMessage?.data?.Message);

    if (messageData?.action === 'ACCEPT') {
      await AsyncStorage.setItem('bookingAccepted', 'true');
    }
  } catch (error) {
    console.warn('Failed to handle background notification:', error);
  }
});

// Load the icon font dynamically
Icon.loadFont();

AppRegistry.registerComponent(appName, () => App);
