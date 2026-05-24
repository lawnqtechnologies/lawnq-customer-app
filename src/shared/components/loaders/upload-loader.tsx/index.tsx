import { v2Colors } from "@theme/themes";
import React from "react";
import { Platform, View } from "react-native";
import LoaderKit from "react-native-loader-kit";

/**
 * ? Local imports
 */
import Text from "@shared-components/text-wrapper/TextWrapper";
import styles from "./styles";

/**
 * ? SVGsx
 */
import MOWER from "@assets/v2/homescreen/icons/mower.svg";

interface IUploadImagesLoader {
  text?: string;
}

const UploadImagesLoader: React.FC<IUploadImagesLoader> = ({
  text = "Uploading...",
}) => (
  <View pointerEvents="none" style={styles.uploadLoaderContainer}>
    <LoaderKit
      style={{ width: 60, height: 60 }}
      name={Platform.OS === "android" ? "BallScaleMultiple" : "CircleStrokeSpin"} // Optional: see list of animations below
      color={v2Colors.highlight} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
    />
    <MOWER pointerEvents="none" style={{ marginTop: -44 }} />
    <Text h3 bold color={"white"} style={{ marginTop: 30 }}>
      {text}
    </Text>
  </View>
);

export default UploadImagesLoader;
