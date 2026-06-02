import {useEffect} from 'react';
import {getMessaging} from '@react-native-firebase/messaging';
import {useDispatch} from 'react-redux';
import notifee from '@notifee/react-native';

import {SCREENS} from '@shared-constants';
import {OnSetIsReloadScreen} from '@services/states/property/property.slice';
import {systemActions} from '@services/states/system/system.slice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, Vibration} from 'react-native';
import {
  navigateAfterForeground,
  pushAfterForeground,
} from '../../utils/navigation';

const DEFAULT_NOTIFICATION_CHANNEL_ID = 'default';
const DEFAULT_NOTIFICATION_CHANNEL_NAME = 'Default Channel';
const BOOKINGS_TAB_ROUTE_NAME = 'Bookings';

const parseNotificationMessage = (message: any) => {
  if (typeof message === 'string') {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.warn('Failed to parse data.Message as JSON:', error);
      return undefined;
    }
  }

  return message;
};

const getPromoScreenName = (message: any) => {
  const parsedMessage = parseNotificationMessage(message);
  const screenName =
    parsedMessage?.SreenName ?? parsedMessage?.ScreenName ?? SCREENS.HOME;

  return screenName === 'Home' ? SCREENS.HOME : screenName;
};

const createDefaultNotificationChannel = async () => {
  if (Platform.OS !== 'android') return DEFAULT_NOTIFICATION_CHANNEL_ID;

  return notifee.createChannel({
    id: DEFAULT_NOTIFICATION_CHANNEL_ID,
    name: DEFAULT_NOTIFICATION_CHANNEL_NAME,
    sound: 'default',
  });
};

const setBookingAcceptedFlag = async () => {
  try {
    await AsyncStorage.setItem('bookingAccepted', 'true');
  } catch (error) {
    console.warn('Failed to save booking accepted flag:', error);
  }
};

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
  const {onSetReceivedChatInfo} = systemActions;

  /**
  |--------------------------------------------------
  | When app is on screen
  |--------------------------------------------------
  */
  useEffect(() => {
    const handleNotificationOpen = async (remoteMessage: any) => {
      if (!remoteMessage) return;

      console.log('notification opened', remoteMessage);

      const {data, notification} = remoteMessage;

      if (data?.ScreenName === 'property') {
        void triggerDefaultNotification();
        dispatch(OnSetIsReloadScreen(true));
        setShowNotifModal(true);
        setNotifModal({
          title: notification?.title,
          body: notification?.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            navigateAfterForeground(SCREENS.HOME);
          },
        });
      }

      const parsedMessage: any = parseNotificationMessage(data?.Message);

      const action: string | undefined = parsedMessage?.action;
      if (action === 'ACCEPT') {
        await setBookingAcceptedFlag();
      }

      if (data?.Remarks === 'BOOKING_COMPLETED') {
        setShowNotifModal(true);
        setNotifModal({
          title: 'Scheduled Booking',
          body: "Yay! Service is now completed. Please provide your feedback for the 'Service Provider'",
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            pushAfterForeground(SCREENS.RATING_FEEDBACK, {
              completeBookingData: parsedMessage,
            });
          },
        });
      }

      if (data?.Remarks === 'SP_CANCEL_BOOKING') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification?.title ?? 'Notification',
          body: notification?.body ?? '',
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            navigateAfterForeground(SCREENS.HOME, {
              screen: BOOKINGS_TAB_ROUTE_NAME,
            });
          },
        });
      }

      if (data?.Remarks === 'SP_START_BOOKING') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification?.title ?? 'Notification',
          body: notification?.body ?? '',
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            navigateAfterForeground(SCREENS.HOME, {
              screen: BOOKINGS_TAB_ROUTE_NAME,
            });
          },
        });
      }

      if (data?.ScreenName === 'BOOKING_CHAT') {
        handleReceivedChat(data, false);
      }

      if (data?.Remarks === 'PROMO') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification?.title ?? 'Notification',
          body: notification?.body ?? '',
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            pushAfterForeground(getPromoScreenName(data?.Message));
          },
        });
      }

      void onDisplayNotification(
        notification?.title ?? '',
        notification?.body ?? '',
      );
    };

    getMessaging()
      .getInitialNotification()
      .then(handleNotificationOpen)
      .catch((ex) => console.log(ex));

    const unsubscribeNotificationOpen = getMessaging().onNotificationOpenedApp(
      handleNotificationOpen,
    );

    const listenOnMessageReceived = getMessaging().onMessage(
      async (remoteMessage: any) => {
        if (remoteMessage) {
          const {data, notification} = remoteMessage;

          // // this is for property
          if (data?.ScreenName === 'property') {
            void triggerDefaultNotification();
            dispatch(OnSetIsReloadScreen(true));
            setShowNotifModal(true);
            setNotifModal({
              title: notification?.title ?? 'Notification',
              body: notification?.body ?? '',
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                navigateAfterForeground(SCREENS.HOME);
              },
            });
          }

          const parsedMessage: any = parseNotificationMessage(data?.Message);

          const action: string | undefined = parsedMessage?.action;

          if (action === 'ACCEPT') {
            await setBookingAcceptedFlag();
          }

          if (data?.Remarks === 'BOOKING_COMPLETED') {
            setShowNotifModal(true);
            setNotifModal({
              title: 'Scheduled Booking',
              body: "Yay! Service is now completed. Please provide your feedback for the 'Service Provider'",
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                pushAfterForeground(SCREENS.RATING_FEEDBACK, {
                  completeBookingData: parsedMessage,
                });
                console.log('setNotifModal data:', data);
              },
            });
          }

          if (data?.Remarks === 'SP_CANCEL_BOOKING') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification?.title ?? 'Notification',
              body: notification?.body ?? '',
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                navigateAfterForeground(SCREENS.HOME, {
                  screen: BOOKINGS_TAB_ROUTE_NAME,
                });
              },
            });
          }

          if (data?.Remarks === 'SP_START_BOOKING') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification?.title ?? 'Notification',
              body: notification?.body ?? '',
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                navigateAfterForeground(SCREENS.HOME, {
                  screen: BOOKINGS_TAB_ROUTE_NAME,
                });
              },
            });
          }

          if (data?.ScreenName === 'BOOKING_CHAT') {
            handleReceivedChat(data, false);
          }

          if (data?.Remarks === 'PROMO') {
            setShowNotifModal(true);
            setNotifModal({
              title: notification?.title ?? 'Notification',
              body: notification?.body ?? '',
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                pushAfterForeground(getPromoScreenName(data?.Message));
              },
            });
          }

          void onDisplayNotification(
            notification?.title ?? '',
            notification?.body ?? '',
          );
        }
      },
    );

    return () => {
      unsubscribeNotificationOpen();
      listenOnMessageReceived();
    };
  }, []);

  const handleReceivedChat = (data: any, navigate: boolean) => {
    // normalize Message into an object
    let messageObj: any = {};
    if (typeof data?.Message === 'string') {
      try {
        messageObj = JSON.parse(data.Message);
      } catch {
        // fallback: treat raw string as text
        messageObj = {text: data.Message};
      }
    } else if (data?.Message && typeof data.Message === 'object') {
      messageObj = data.Message;
    }

    console.log('message:', messageObj);

    void triggerDefaultNotification();
    const {text, _id, bookingItem, imageName, imageType} = messageObj;
    const image = messageObj?.image || messageObj?.imageUrl || '';
    const notificationText = text || (image ? 'Sent an image' : '');

    if (image) {
      console.log('Received chat image payload:', {
        text,
        _id,
        bookingItem,
        image,
        imageName,
        imageType,
      });
    }

    setDidReceiveNotif(true);

    dispatch(
      onSetReceivedChatInfo({
        text: notificationText,
        show: navigate,
        _id,
        image,
        imageName,
        imageType,
      }),
    );

    if (navigate) {
      // navigate logic...
    } else if (Platform.OS === 'android') {
      void onDisplayNotification('Chat', notificationText);
    }
  };

  const onDisplayNotification = async (title: string, body: string) => {
    if (!title && !body) return;

    try {
      // Request permissions (required for iOS)
      await notifee.requestPermission();

      // Create a channel (required for Android)
      const channelId = await createDefaultNotificationChannel();

      // Display a notification
      await notifee.displayNotification({
        title: title || 'Notification',
        body: body || '',
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
    } catch (error) {
      console.warn('Failed to display local notification:', error);
    }
  };

  return null;
};

const triggerDefaultNotification = async () => {
  try {
    const channelId = await createDefaultNotificationChannel();

    await notifee.displayNotification({
      android: {
        channelId,
        sound: 'default', // This uses the system default sound
      },
      ios: {
        sound: 'default', // iOS default sound
      },
    });
    Vibration.vibrate();
  } catch (error) {
    console.warn('Failed to trigger default notification:', error);
  }
};

export default NotificationHandler;
