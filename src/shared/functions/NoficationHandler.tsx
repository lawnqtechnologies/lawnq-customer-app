import {useEffect} from 'react';
import {getMessaging} from '@react-native-firebase/messaging';
import {useDispatch} from 'react-redux';
import notifee, {EventType} from '@notifee/react-native';

import {SCREENS} from '@shared-constants';
import {OnSetIsReloadScreen} from '@services/states/property/property.slice';
import {onSetBookingItem} from '@services/states/booking/booking.slice';
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
const PENDING_NOTIFEE_PRESS_KEY = 'pendingNotifeeNotification';
const PENDING_BOOKING_COMPLETED_KEY = 'pendingBookingCompleted';

const readAndClearPendingNotification = async (
  key: string,
): Promise<any | undefined> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return undefined;

  await AsyncStorage.removeItem(key);
  return JSON.parse(raw);
};

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

const getBookingCompletedMessage = (parsedMessage: any): string => {
  const address: string =
    parsedMessage?.property?.Address1 || parsedMessage?.property?.Alias || '';

  return address
    ? `Your LawnQ booking at ${address} has been completed. Please rate your service provider and let us know how they did.`
    : 'Your LawnQ booking has been completed. Please rate your service provider and let us know how they did.';
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
   * Shared processor for any notification that was *tapped* — whether that
   * tap came from the OS notification tray (FCM, app backgrounded/killed)
   * or from a locally-created notifee notification (see the notifee event
   * listeners below). Always safe to call after the component has mounted.
   */
  const handleNotificationOpen = async (remoteMessage: any) => {
    if (!remoteMessage) return;


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
      // Handled via a tap (or the pending-notification replay below) — if
      // the background handler in index.js also stashed this one, it's
      // moot now, so clear it to avoid showing the prompt a second time.
      void AsyncStorage.removeItem(PENDING_BOOKING_COMPLETED_KEY);
      setShowNotifModal(true);
      setNotifModal({
        title: 'Service Completed',
        body: getBookingCompletedMessage(parsedMessage),
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
      // This path only runs when the user tapped the notification (tray
      // tap, or a locally-created notifee notification), so it's safe to
      // navigate straight to the booking's chat.
      handleReceivedChat(data, true);
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
      data,
    );
  };

  /**
  |--------------------------------------------------
  | When app is on screen
  |--------------------------------------------------
  */
  useEffect(() => {
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
              title: 'Service Completed',
              body: getBookingCompletedMessage(parsedMessage),
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
            data,
          );
        }
      },
    );

    return () => {
      unsubscribeNotificationOpen();
      listenOnMessageReceived();
    };
  }, []);

  /**
  |--------------------------------------------------
  | When app is backgrounded or killed
  |--------------------------------------------------
  | Locally-created notifee notifications (chat "buzz", foreground banners
  | re-shown in the tray) aren't covered by getMessaging().onNotificationOpenedApp
  | above — that only fires for notifications the OS displayed from the FCM
  | payload directly. notifee.onForegroundEvent covers a press while the JS
  | context is still alive (app backgrounded, not killed). A press while the
  | app is fully killed is caught by the notifee.onBackgroundEvent handler
  | registered in index.js, which stashes the notification so we can replay
  | it here once the app has actually launched.
  */
  useEffect(() => {
    const unsubscribeNotifeeForegroundEvent = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type !== EventType.PRESS) return;

        const notificationData = detail.notification?.data;
        if (!notificationData) return;

        void handleNotificationOpen({
          data: notificationData,
          notification: {
            title: detail.notification?.title,
            body: detail.notification?.body,
          },
        });
      },
    );

    // Anything stashed by index.js while the app was backgrounded/killed —
    // either a tapped local notification, or (for BOOKING_COMPLETED) a
    // message that arrived but may never get tapped at all if the user
    // opens the app via its icon instead. Replayed through the same
    // handler that processes a real notification tap.
    const replayPendingNotification = async (key: string) => {
      try {
        const pending = await readAndClearPendingNotification(key);
        if (pending) void handleNotificationOpen(pending);
      } catch (error) {
        console.warn(`Failed to replay pending notification (${key}):`, error);
      }
    };

    void replayPendingNotification(PENDING_NOTIFEE_PRESS_KEY);
    void replayPendingNotification(PENDING_BOOKING_COMPLETED_KEY);

    return () => {
      unsubscribeNotifeeForegroundEvent();
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
      // Mirrors how tapping a booking card navigates: put the booking in
      // redux, then land on its detail screen where the chat lives.
      if (bookingItem) {
        dispatch(onSetBookingItem(bookingItem));
      }
      pushAfterForeground(SCREENS.BOOKING_DETAIL);
    } else if (Platform.OS === 'android') {
      void onDisplayNotification('Chat', notificationText, data);
    }
  };

  const onDisplayNotification = async (
    title: string,
    body: string,
    data?: any,
  ) => {
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
        // Carried through to notifee's press events so a tap on this
        // notification (foreground or background) can be routed the same
        // way as a tap on the OS/FCM tray notification.
        data: data ?? undefined,
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
