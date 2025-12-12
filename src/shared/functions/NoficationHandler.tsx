import {useEffect} from 'react';
import { getMessaging } from '@react-native-firebase/messaging';
import * as NavigationService from 'react-navigation-helpers';
import {useDispatch, useSelector} from 'react-redux';
import notifee from '@notifee/react-native';

import {SCREENS} from '@shared-constants';
import {isAndroid} from '@freakycoder/react-native-helpers';
import {RootState} from 'store';
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
  getMessaging()
    .getInitialNotification()
    .then(async remoteMessage => {
      if (!remoteMessage) return; // <-- add this guard

      const {data, notification} = remoteMessage;
      console.log(remoteMessage);

      if (data?.Remarks === 'SP_CANCEL_BOOKING') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification?.title ?? 'Notification',
          body: notification?.body ?? '',
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
          title: notification?.title ?? 'Notification',
          body: notification?.body ?? '',
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.push(SCREENS.BOOKING);
          },
        });
      }

      const messageString =
        typeof data?.Message === 'string' ? data.Message : undefined;

      // Normalize into an object (if it's a string, parse it; if it's already an object, use it)
      let parsedMessage: any = undefined;
      if (typeof data?.Message === 'string') {
        try {
          parsedMessage = JSON.parse(data.Message);
        } catch (e) {
          console.warn('Failed to parse data.Message as JSON:', e);
          parsedMessage = undefined;
        }
      } else {
        parsedMessage = data?.Message;
      }

      const action: string | undefined = parsedMessage?.action;

      if (action === 'ACCEPT') {
        console.log('accepted');
        console.log(data);
        await AsyncStorage.setItem('bookingAccepted', 'true');
      }

      if (data?.Remarks === 'PROMO') {
        setShowNotifModal(true);
        setNotifModal({
          title: notification?.title ?? 'Notification',
          body: notification?.body ?? '',
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            const promoScreen =
              (typeof data?.Message === 'string'
                ? (() => {
                    try {
                      const parsed = JSON.parse(data.Message) as any;
                      return parsed?.SreenName ?? parsed?.ScreenName;
                    } catch {
                      return undefined;
                    }
                  })()
                : (data?.Message as any)?.SreenName ?? (data?.Message as any)?.ScreenName) ?? 'Home';
            NavigationService.push(promoScreen);
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

  getMessaging().setBackgroundMessageHandler(async (remoteMessage: any) => { 
    if (remoteMessage) {
      const {data, notification} = remoteMessage;

      console.log('this is message on background');
      console.log(remoteMessage);

      // // this is for property
      if (data?.ScreenName === 'property') {
         triggerDefaultNotification()
        dispatch(OnSetIsReloadScreen(true));
        setShowNotifModal(true);
        setNotifModal({
          title: notification.title,
          body: notification.body,
          btnText: 'Confirm',
          onPress: () => {
            setShowNotifModal(false);
            NavigationService.navigate(SCREENS.HOME);
          },
        });
      }

      const messageString =
        typeof data?.Message === 'string' ? data.Message : undefined;

      // Normalize into an object (if it's a string, parse it; if it's already an object, use it)
      let parsedMessage: any = undefined;
      if (typeof data?.Message === 'string') {
        try {
          parsedMessage = JSON.parse(data.Message);
        } catch (e) {
          console.warn('Failed to parse data.Message as JSON:', e);
          parsedMessage = undefined;
        }
      } else {
        parsedMessage = data?.Message;
      }

      const action: string | undefined = parsedMessage?.action;

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
              completeBookingData: parsedMessage,
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

      if (data?.ScreenName === "BOOKING_CHAT") {handleReceivedChat(data, false)};
    }
  }); 

  /**
  |--------------------------------------------------
  | When app is on screen
  |--------------------------------------------------
  */
  useEffect(() => {
    getMessaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log('came from initial', remoteMessage);

          const {data, notification} = remoteMessage;

          // // this is for property
          if (data?.ScreenName === 'property') {
            // onDisplayNotification(notification?.title ?? '', notification?.body ?? '')
            triggerDefaultNotification();
            dispatch(OnSetIsReloadScreen(true));
            setShowNotifModal(true);
            setNotifModal({
              title: notification?.title,
              body: notification?.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.navigate(SCREENS.HOME);
              },
            });
          }

          const messageString =
            typeof data?.Message === 'string' ? data.Message : undefined;

          // Normalize into an object (if it's a string, parse it; if it's already an object, use it)
          let parsedMessage: any = undefined;
          if (typeof data?.Message === 'string') {
            try {
              parsedMessage = JSON.parse(data.Message);
            } catch (e) {
              console.warn('Failed to parse data.Message as JSON:', e);
              parsedMessage = undefined;
            }
          } else {
            parsedMessage = data?.Message;
          }

          const action: string | undefined = parsedMessage?.action;

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
                  completeBookingData: parsedMessage,
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
              title: notification?.title ?? 'Notification',
              body: notification?.body ?? '',
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                const promoScreen =
                  (typeof data?.Message === 'string'
                    ? (() => {
                        try {
                          const parsed = JSON.parse(data.Message) as any;
                          return parsed?.SreenName ?? parsed?.ScreenName;
                        } catch {
                          return undefined;
                        }
                      })()
                    : (data?.Message as any)?.SreenName ?? (data?.Message as any)?.ScreenName) ?? 'Home';
                NavigationService.push(promoScreen);
              },
            });
          }

          onDisplayNotification(notification?.title ?? '', notification?.body ?? '');
        }
      });

    const listenOnMessageReceived = getMessaging().onMessage(
      async (remoteMessage: any) => {
        if (remoteMessage) {
          const {data, notification} = remoteMessage;

          // // this is for property
          if (data?.ScreenName === 'property') {
             triggerDefaultNotification();
            dispatch(OnSetIsReloadScreen(true));
            setShowNotifModal(true);
            setNotifModal({
              title: notification.title,
              body: notification.body,
              btnText: 'Confirm',
              onPress: () => {
                setShowNotifModal(false);
                NavigationService.navigate(SCREENS.HOME);
              },
            });
          }

          const messageString =
            typeof data?.Message === 'string' ? data.Message : undefined;

          // Normalize into an object (if it's a string, parse it; if it's already an object, use it)
          let parsedMessage: any = undefined;
          if (typeof data?.Message === 'string') {
            try {
              parsedMessage = JSON.parse(data.Message);
            } catch (e) {
              console.warn('Failed to parse data.Message as JSON:', e);
              parsedMessage = undefined;
            }
          } else {
            parsedMessage = data?.Message;
          }

          const action: string | undefined = parsedMessage?.action;

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
                  completeBookingData: parsedMessage,
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

         onDisplayNotification(notification?.title ?? '', notification?.body ?? '');
        }
      },
    );

    return listenOnMessageReceived;
  }, []);

  const handleReceivedChat = (data: any, navigate: boolean) => {
    // normalize Message into an object
    let messageObj: any = {};
    if (typeof data?.Message === 'string') {
      try {
        messageObj = JSON.parse(data.Message);
      } catch {
        // fallback: treat raw string as text
        messageObj = { text: data.Message };
      }
    } else if (data?.Message && typeof data.Message === 'object') {
      messageObj = data.Message;
    }

    console.log('message:', messageObj);

    triggerDefaultNotification();
    const { text, _id, bookingItem } = messageObj;

    setDidReceiveNotif(true);

    dispatch(
      onSetReceivedChatInfo({
        text,
        show: navigate,
        _id,
      }),
    );

    if (navigate) {
      // navigate logic...
    } else if (isAndroid) {
      onDisplayNotification('Chat', text);
    }
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

const triggerDefaultNotification = async () => {
  await notifee.displayNotification({
    android: {
      channelId: 'default',
      sound: 'default', // This uses the system default sound
    },
    ios: {
      sound: 'default', // iOS default sound
    },
  });
  Vibration.vibrate();
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
