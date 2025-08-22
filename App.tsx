/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import 'react-native-gesture-handler';
import {store} from './src/store';
import {Provider} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import {QueryClient, QueryClientProvider} from 'react-query';
import BackgroundActivityHandler from 'shared/functions/BackgroundActivityHandler';
import NotificationHandler from 'shared/functions/NoficationHandler';
import ChatCountHandler from 'shared/functions/ChatCountHandler';
import CenterModal from '@shared-components/modals/center-modal/CenterModal';
import {LogBox} from 'react-native';
export const queryClient = new QueryClient();


const App = () => {
  // const isDarkMode = useColorScheme() === 'dark';

  /**
|--------------------------------------------------
| States
|--------------------------------------------------
*/
  const [showNotifModal, setShowNotifModal] = useState<boolean>(false);
  const [notifModal, setNotifModal] = useState<any>({
    title: '',
    body: '',
    btnText: 'Ok',
    onPress: () => {},
  });
  const [didReceiveNotif, setDidReceiveNotif] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 500);

    LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
    LogBox.ignoreAllLogs(); //Ignore all log notifications
  }, []);

  /**
  |--------------------------------------------------
  | SideEffects
  |--------------------------------------------------
  */

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <SafeAreaProvider>
            <Navigation />
            <BackgroundActivityHandler />

            <NotificationHandler
              setNotifModal={setNotifModal}
              setShowNotifModal={setShowNotifModal}
              setDidReceiveNotif={setDidReceiveNotif}
            />

            <ChatCountHandler
              didReceiveNotif={didReceiveNotif}
              setDidReceiveNotif={setDidReceiveNotif}
            />
          </SafeAreaProvider>
        </Provider>
      </QueryClientProvider>

      <CenterModal
        isVisible={showNotifModal}
        setIsVisible={setShowNotifModal}
        title={notifModal.title}
        onPress={notifModal.onPress}
        body={notifModal.body}
        buttonText={notifModal.btnText}
      />
    </>
  );
};

export default App;
