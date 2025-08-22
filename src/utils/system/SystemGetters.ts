import { Platform } from "react-native";
import {
  getReadableVersion,
  getSystemVersion,
  getModel,
} from "react-native-device-info";

export const SystemInfo = {
  AppVersion: getReadableVersion(),
  Platform: Platform.OS,
  PlatformOs: Platform.OS,
  DeviceVersion: getSystemVersion(),
  DeviceModel: getModel(),
  MacAddress: "22:22:22:22:22:22",
};
