import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import * as NavigationService from 'react-navigation-helpers';
import {useDispatch, useSelector} from 'react-redux';
import notifee from '@notifee/react-native';

import {SCREENS} from '@shared-constants';
import {isAndroid} from '@freakycoder/react-native-helpers';
import {RootState} from 'store';
import {
  onSetBookingItem,
  onSetGoToScreen,
  onserviceProviderIdAccepted,
} from '@services/states/booking/booking.slice';
import {OnSetIsReloadScreen} from '@services/states/property/property.slice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';


interface INotificationHandlerProps {
  setShowNotifModal: any;
  setNotifModal: any;
  setDidReceiveNotif: any;
}

const NotificationHandler: React.FC<INotificationHandlerProps> = ({
  setShowNotifModal,
  setNotifModal,
  setDidReceiveNotif,
}) => {
  const dispatch = useDispatch();

  /**
   * ? Redux States
   */

  /**
  |--------------------------------------------------
  | This load From background to foreground
  |--------------------------------------------------
  */
  const {appState} = useSelector((state: RootState) => state.user);
  messaging()
    .getInitialNotification()
    .then(async remoteMessage => {
      const {data, notification} = remoteMessage;
      console.log(remoteMessage);

      if (data?.Remarks === 'SP_CANCEL_BOOKING') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification.title,
          body: notification.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.push(SCREENS.BOOKING);
          },
        });
      }

      if (data?.Remarks === 'SP_START_BOOKING') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification.title,
          body: notification.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.push(SCREENS.BOOKING);
          },
        });
      }

      const messageString =
        typeof data?.Message === 'string' ? data.Message : undefined;
      const action: string | undefined = messageString
        ? JSON.parse(messageString)?.action
        : undefined;

      if (action === 'ACCEPT') {
        console.log('accepted');
        console.log(data);
        await AsyncStorage.setItem('bookingAccepted', 'true');
      }

      if (data?.Remarks === 'PROMO') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification.title,
          body: notification.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.push(data?.Message?.SreenName);
          },
        });
      }
    })
    .catch(ex => console.log(ex));

  /**
  |--------------------------------------------------
  | When app is in background or closed
  |--------------------------------------------------
  */

  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    if (remoteMessage) {
      const {data, notification} = remoteMessage;

      console.log('this is message on background');
      console.log(remoteMessage);

      // // this is for property
      if (data?.ScreenName === 'property') {
         Vibration.vibrate();
        dispatch(OnSetIsReloadScreen(true));
        setShowNotifModal(true);
        setNotifModal({
          title: notification.title,
          body: notification.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.navigate(SCREENS.MY_PROPERTIES);
          },
        });
      }

      const messageString =
        typeof data?.Message === 'string' ? data.Message : undefined;
      const action: string | undefined = messageString
        ? JSON.parse(messageString)?.action
        : undefined;

      if (action === 'ACCEPT') {
        console.log('accepted');
        console.log(data);
        await AsyncStorage.setItem('bookingAccepted', 'true');
      }

      if (data?.Remarks === 'BOOKING_COMPLETED') {
        setShowNotifModal(true);
        setNotifModal({
          title: 'Scheduled Booking',
          body: "Yay! Service is now completed. Please provide your feedback for the 'Service Provider'",
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.push(SCREENS.RATING_FEEDBACK, {
              completeBookingData: JSON.parse(data?.Message),
            });
            console.log('setNotifModal data:', data);
          },
        });
      }

      if (data?.Remarks === 'SP_CANCEL_BOOKING') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification.title,
          body: notification.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.push(SCREENS.BOOKING);
          },
        });
      }

      if (data?.Remarks === 'SP_START_BOOKING') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification.title,
          body: notification.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.push(SCREENS.BOOKING);
          },
        });
      }

      if (data?.Remarks === 'PROMO') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification.title,
          body: notification.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.push(data?.Message?.SreenName);
          },
        });
      }
    }
    //if (ScreenName === "BOOKING_CHAT") handleReceivedChat(data, true);
  });

  /**
  |--------------------------------------------------
  | When app is on screen
  |--------------------------------------------------
  */
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log('came from initial', remoteMessage);

          const {data, notification} = remoteMessage;

          // // this is for property
          if (data?.ScreenName === 'property') {
            // onDisplayNotification(notification?.title ?? '', notification?.body ?? '')
            Vibration.vibrate();
            dispatch(OnSetIsReloadScreen(true));
            setShowNotifModal(true);
            setNotifModal({
              title: notification?.title,
              body: notification?.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.navigate(SCREENS.MY_PROPERTIES);
              },
            });
          }

          const messageString =
            typeof data?.Message === 'string' ? data.Message : undefined;
          const action: string | undefined = messageString
            ? JSON.parse(messageString)?.action
            : undefined;

          if (action === 'ACCEPT') {
            await AsyncStorage.setItem('bookingAccepted', 'true');
          }

          if (data?.Remarks === 'BOOKING_COMPLETED') {
            setShowNotifModal(true);
            setNotifModal({
              title: 'Scheduled Booking',
              body: "Yay! Service is now completed. Please provide your feedback for the 'Service Provider'",
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.push(SCREENS.RATING_FEEDBACK, {
                  completeBookingData: JSON.parse(data?.Message),
                });
                console.log('setNotifModal data:', data);
              },
            });
          }

          if (data?.Remarks === 'SP_CANCEL_BOOKING') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification?.title,
              body: notification?.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.push(SCREENS.BOOKING);
              },
            });
          }

          if (data?.Remarks === 'SP_START_BOOKING') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification?.title,
              body: notification?.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.push(SCREENS.BOOKING);
              },
            });
          }

          if (data?.ScreenName === 'BOOKING_CHAT') {
            handleReceivedChat(data, false);
          }

          if (data?.Remarks === 'PROMO') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification.title,
              body: notification.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.push(data?.Message?.SreenName);
              },
            });
          }

          onDisplayNotification(title, body);
        }
      });

    const listenOnMessageReceived = messaging().onMessage(
      async (remoteMessage: any) => {
        if (remoteMessage) {
          const {data, notification} = remoteMessage;

          // // this is for property
          if (data?.ScreenName === 'property') {
             Vibration.vibrate();
            dispatch(OnSetIsReloadScreen(true));
            setShowNotifModal(true);
            setNotifModal({
              title: notification.title,
              body: notification.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.navigate(SCREENS.MY_PROPERTIES);
              },
            });
          }

          const messageString =
            typeof data?.Message === 'string' ? data.Message : undefined;
          const action: string | undefined = messageString
            ? JSON.parse(messageString)?.action
            : undefined;

          if (action === 'ACCEPT') {
            await AsyncStorage.setItem('bookingAccepted', 'true');
          }

          if (data?.Remarks === 'BOOKING_COMPLETED') {
            setShowNotifModal(true);
            setNotifModal({
              title: 'Scheduled Booking',
              body: "Yay! Service is now completed. Please provide your feedback for the 'Service Provider'",
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.push(SCREENS.RATING_FEEDBACK, {
                  completeBookingData: JSON.parse(data?.Message),
                });
                console.log('setNotifModal data:', data);
              },
            });
          }

          if (data?.Remarks === 'SP_CANCEL_BOOKING') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification.title,
              body: notification.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.push(SCREENS.BOOKING);
              },
            });
          }

          if (data?.Remarks === 'SP_START_BOOKING') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification.title,
              body: notification.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.push(SCREENS.BOOKING);
              },
            });
          }

          if (data?.ScreenName === 'BOOKING_CHAT') {
            handleReceivedChat(data, false);
          }

          if (data?.Remarks === 'PROMO') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification.title,
              body: notification.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.push(data?.Message?.SreenName);
              },
            });
          }

          onDisplayNotification(title, body);
        }
      },
    );

    return listenOnMessageReceived;
  }, []);

  const handleReceivedChat = (data: {Message: string}, navigate: boolean) => {
    const message = JSON.parse(data?.Message);
    console.log('message:', message);
    const {text, _id, bookingItem} = message;

    setDidReceiveNotif(true);

    dispatch(
      onSetReceivedChatInfo({
        text,
        show: navigate,
        _id,
      }),
    );
    if (navigate) {
      dispatch(onSetBookingItem(bookingItem));
      dispatch(onSetGoToScreen('BOOKING_DETAIL'));
      if (appState === 'background')
        NavigationService.navigate(SCREENS.BOOKING_DETAIL);
      else isAndroid && onDisplayNotification('Chat', text);
    } else isAndroid && onDisplayNotification('Chat', text);
  };

  const onDisplayNotification = async (title: string, body: string) => {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'sound',
      name: 'Default Channel',
      sound: 'default',
    });

    // Display a notification
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
        sound: 'default',
      },
      ios: {
        // iOS resource (.wav, aiff, .caf)
        sound: 'default',
      },
    });
  };

  return null;
};

export default NotificationHandler;
function onSetReceivedChatInfo(arg0: {
  text: any;
  show: boolean;
  _id: any;
}): any {
  // throw new Error('Function not implemented.');
  console.log('Function not implemented.');
}
