import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import LottieView from "lottie-react-native";

/**
 * ? Local imports
 */
import createStyles from "./loading-letters-animation.style";

/**
 * ? Constants
 */
const ANIMATION =
  "../../../assets/animations/loaders/loading-letters-animation.json";

const LoadingLettersAnimation: any = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const Animation = () => (
    <LottieView source={require(ANIMATION)} autoPlay loop />
  );

  return (
    <View style={styles.container}>
      <Animation />
    </View>
  );
};

export default LoadingLettersAnimation;
