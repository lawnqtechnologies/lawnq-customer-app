import {AppState, InteractionManager, Platform} from 'react-native';
import * as NavigationService from 'react-navigation-helpers';

const IOS_FOREGROUND_NAVIGATION_DELAY_MS = 250;

const runAfterForeground = (navigationAction: () => void): (() => void) => {
  let appStateSubscription: {remove: () => void} | undefined;
  let interactionTask: {cancel?: () => void} | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let animationFrame: number | undefined;
  let cancelled = false;

  const navigate = () => {
    if (cancelled) return;

    interactionTask = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;

      animationFrame = requestAnimationFrame(() => {
        if (!cancelled) {
          navigationAction();
        }
      });
    });
  };

  const scheduleNavigation = () => {
    timeout = setTimeout(
      navigate,
      Platform.OS === 'ios' ? IOS_FOREGROUND_NAVIGATION_DELAY_MS : 0,
    );
  };

  if (Platform.OS === 'ios' && AppState.currentState !== 'active') {
    appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') return;

      appStateSubscription?.remove();
      appStateSubscription = undefined;
      scheduleNavigation();
    });
  } else {
    scheduleNavigation();
  }

  return () => {
    cancelled = true;
    appStateSubscription?.remove();
    interactionTask?.cancel?.();

    if (timeout) {
      clearTimeout(timeout);
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
};

export const navigateAfterForeground = (
  routeName: string,
  params?: any,
): (() => void) =>
  runAfterForeground(() => NavigationService.navigate(routeName, params));

export const pushAfterForeground = (
  routeName: string,
  params?: any,
): (() => void) =>
  runAfterForeground(() => NavigationService.push(routeName, params));

export const resetAfterForeground = (params: any): (() => void) =>
  runAfterForeground(() => NavigationService.reset(params));
