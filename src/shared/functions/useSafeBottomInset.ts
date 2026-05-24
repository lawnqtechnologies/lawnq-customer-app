import {useMemo} from 'react';
import {Platform, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const ANDROID_BOTTOM_INSET_FALLBACK = 24;

export const useSafeBottomInset = (
  androidFallback = ANDROID_BOTTOM_INSET_FALLBACK,
) => {
  const {bottom} = useSafeAreaInsets();

  return Platform.OS === 'android' ? Math.max(bottom, androidFallback) : bottom;
};

export const useSafeBottomPadding = (basePadding = 0) => {
  const bottomInset = useSafeBottomInset();

  return useMemo<ViewStyle>(
    () => ({
      paddingBottom: basePadding + bottomInset,
    }),
    [basePadding, bottomInset],
  );
};

export const useSafeBottomPosition = (baseBottom = 0) => {
  const bottomInset = useSafeBottomInset();

  return useMemo<ViewStyle>(
    () => ({
      bottom: baseBottom + bottomInset,
    }),
    [baseBottom, bottomInset],
  );
};

export const useSafeBottomMargin = (baseMargin = 0) => {
  const bottomInset = useSafeBottomInset();

  return useMemo<ViewStyle>(
    () => ({
      marginBottom: baseMargin + bottomInset,
    }),
    [baseMargin, bottomInset],
  );
};
