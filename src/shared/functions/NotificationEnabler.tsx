import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {Alert, Platform} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  openSettings,
  request,
  requestNotifications,
} from 'react-native-permissions';

const NotificationEnabler = () => {
  useFocusEffect(
    useCallback(() => {
      notifPermissionChecker();
    }, []),
  );

  const notifPermissionChecker = () => {
    console.log('permission checkpoint');
    if (Platform.OS === 'android') {
      requestNotificationPermission();
    } else {
      console.log('permission checkpoint ios');
      requestiOSNotificationPermission();
    }
  };

  /**
  |--------------------------------------------------
  | Android 
  |--------------------------------------------------
  */

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const permissionStatus = await request(
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      );
      switch (permissionStatus) {
        case RESULTS.UNAVAILABLE:
          Alert.alert(
            'Notification services are not available on this device.',
          );
          break;
        case RESULTS.DENIED:
          requestNotificationPermission();
          break;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Notification Permission',
            'Notification services are blocked. Please enable them in settings.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: () => openSettings()},
            ],
          );
          break;
      }
    }
  };

  /**
    |--------------------------------------------------
    | IOS
    |--------------------------------------------------
    */

  const requestiOSNotificationPermission = async (): Promise<void> => {
    if (Platform.OS !== 'ios') return; // Ensure this runs only on iOS

    const {status} = await requestNotifications(['alert', 'sound', 'badge']);

    console.log('permission checkpoint ios status', status);

    switch (status) {
      case 'unavailable':
        Alert.alert('Notifications are not available on this device.');
        break;
      case 'denied':
        Alert.alert(
          'Notification Permission',
          'This app needs access to notifications. Tap "Allow Access" to enable them.',
          [
            {
              text: 'Allow Access',
              onPress: async () => {
                const {status} = await requestNotifications([
                  'alert',
                  'sound',
                  'badge',
                ]);
                console.log('iOS Notification Permission Status:', status);
              },
            },
          ],
        );
        break;
      case 'blocked':
        Alert.alert(
          'Notification Permission',
          'This app needs access to notifications. Tap "Allow Access" to enable them.',
          [
            {
              text: 'Allow Access',
              onPress: async () => {
                const {status} = await requestNotifications([
                  'alert',
                  'sound',
                  'badge',
                ]);
                console.log('iOS Notification Permission Status:', status);
              },
            },
          ],
        );
        break;
      case 'granted':
        console.log('Notification permission granted for iOS.');
        break;
    }
  };

  return null;
};

export default NotificationEnabler;
