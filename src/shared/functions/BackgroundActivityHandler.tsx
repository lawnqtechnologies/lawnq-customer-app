import {onSetGoToScreen} from '@services/states/booking/booking.slice';
import {onSetAppState} from '@services/states/user/user.slice';
import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {useDispatch} from 'react-redux';

const BackgroundActivityHandler = () => {
  const appState = useRef(AppState.currentState);
  const dispatch = useDispatch();

  /**
   * ? Watchers
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log('nextAppState:', nextAppState);
      if (
        appState.current.match(/inactive|background|inactive/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      if (!['inactive'].includes(appState.current)) {
      }

      appState.current = nextAppState;
      dispatch(onSetAppState(appState.current));

      if (!['background', 'active'].includes(appState.current))
        dispatch(onSetGoToScreen(''));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
};

export default BackgroundActivityHandler;
