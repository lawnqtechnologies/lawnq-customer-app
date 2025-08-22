import { InteractionManager } from "react-native";

export const getDeviceDetails = (payload: any) => {
  const {
    AppVersion,
    Platform,
    PlatformOs,
    DeviceVersion,
    DeviceModel,
    IpAddress,
    MacAddress,
  } = payload;

  const devicedetails = `DeviceDetails.AppVersion=${AppVersion}&DeviceDetails.Platform=${Platform}&DeviceDetails.PlatformOs=${PlatformOs}&DeviceDetails.DeviceVersion=${DeviceVersion}&DeviceDetails.DeviceModel=${DeviceModel}&DeviceDetails.IpAddress=${IpAddress}&DeviceDetails.MacAddress=${MacAddress}`;

  return devicedetails;
};

export const getCardIconName = (brand: string) => {
  switch (brand) {
    case "visa":
      return "cc-visa";
    default:
      return "cc-visa";
  }
};

export const getCardIconSource = (brand: string) => {
  switch (brand) {
    case "visa":
      return "FontAwesome";
    default:
      return "FontAwesome";
  }
};

export const useCustomInteraction = (timeLocked = 2000) => {
  useMount(() => {
    const handle = InteractionManager.createInteractionHandle();

    setTimeout(
      () => InteractionManager.clearInteractionHandle(handle),
      timeLocked,
    );

    return () => InteractionManager.clearInteractionHandle(handle);
  });
};
