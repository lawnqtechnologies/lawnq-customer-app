import { isAndroid } from "@freakycoder/react-native-helpers";
import { v2Colors } from "@theme/themes";
import React from "react";
import { View } from "react-native";
import LoaderKit from "react-native-loader-kit";

/**
 * ? Local imports
 */
import Text from "@shared-components/text-wrapper/TextWrapper";
import styles from "./styles";

/**
 * ? SVGs
 */
import MOWER from "@assets/v2/homescreen/icons/mower.svg";

interface ILoaderProps {
  text?: string;
}

const Loader: React.FC<ILoaderProps> = ({ text = "Loading..." }) => (
  <View style={styles.uploadLoaderContainer}>
    <LoaderKit
      style={{ width: 60, height: 60 }}
      name={isAndroid ? "BallScaleMultiple" : "CircleStrokeSpin"} // Optional: see list of animations below
      shouldRasterizeIOS
      // size={60} // Required on iOS
      color={v2Colors.highlight} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
    />
    <MOWER style={{ marginTop: -44 }} />
    <Text h3 bold color={"white"} style={{ marginTop: 30 }}>
      {text}
    </Text>
  </View>
);

export default Loader;
