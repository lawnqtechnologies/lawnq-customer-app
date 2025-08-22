import LottieView from 'lottie-react-native';
import React, {Dispatch, SetStateAction} from 'react';
import {View} from 'react-native';

interface SplashProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const Splash = ({setIsLoading}: SplashProps) => {
  return (
    <View
      style={{
        height: '40%',
        width: '100%',
        marginTop: '30%',
        marginBottom: 40,
      }}>
      <LottieView
        style={{flex: 1}}
        source={require('@assets/animations/custom-lottie-animation/lawnq-loading.json')}
        autoPlay
        loop={false}
        onAnimationFinish={() => setIsLoading(false)}
      />
    </View>
  );
};

export default Splash;
