/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMessaging} from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {enableScreens} from 'react-native-screens';
import App from './App';
import {name as appName} from './app.json';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PENDING_NOTIFEE_PRESS_KEY = 'pendingNotifeeNotification';
const PENDING_BOOKING_COMPLETED_KEY = 'pendingBookingCompleted';

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

    // The OS already shows the tray notification for this message (it has
    // a `notification` block), but if the user opens the app via the app
    // icon instead of tapping that notification, onNotificationOpenedApp /
    // getInitialNotification never fire and the rating-feedback prompt
    // would silently be lost. Stash it here so NoficationHandler can show
    // it the next time the app launches, tap or no tap.
    if (remoteMessage?.data?.Remarks === 'BOOKING_COMPLETED') {
      await AsyncStorage.setItem(
        PENDING_BOOKING_COMPLETED_KEY,
        JSON.stringify({
          data: remoteMessage.data,
          notification: remoteMessage.notification,
        }),
      );
    }
  } catch (error) {
    console.warn('Failed to handle background notification:', error);
  }
});

// Required by notifee whenever the app displays local notifications (see
// NoficationHandler's onDisplayNotification/triggerDefaultNotification) —
// this is what fires when the user taps one of those notifications while
// the app is backgrounded or fully killed. The JS/React tree isn't
// necessarily mounted at this point, so we can't navigate directly; instead
// stash the tapped notification's data and let NoficationHandler replay it
// once the app has actually launched.
notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type !== EventType.PRESS) return;

  try {
    const {notification} = detail;
    if (!notification?.data) return;

    await AsyncStorage.setItem(
      PENDING_NOTIFEE_PRESS_KEY,
      JSON.stringify({
        data: notification.data,
        notification: {title: notification.title, body: notification.body},
      }),
    );
  } catch (error) {
    console.warn('Failed to persist background notifee press:', error);
  }
});

// Load the icon font dynamically
Icon.loadFont();

AppRegistry.registerComponent(appName, () => App);
