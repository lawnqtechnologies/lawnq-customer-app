import React, { useEffect } from "react";
import { Alert, BackHandler } from "react-native";

interface IAndroidBackButtonHandler {}

const AndroidBackButtonHandler: React.FC<IAndroidBackButtonHandler> = () => {
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to close the app?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        { text: "YES", onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return null;
};
export default AndroidBackButtonHandler;
