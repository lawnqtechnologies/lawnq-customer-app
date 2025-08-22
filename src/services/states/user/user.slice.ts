import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AUTHENTICATION } from "@shared-constants";

const { TOKEN, CUSTOMER_ID } = AUTHENTICATION;

interface UserState {
  token: string;
  isLoggedin: boolean;
  customerId: string;
  appState: string;
  basicSignupDetails: {
    Firstname: string;
    Lastname: string;
    MobileNumber: string;
    EmailAddress: string;
    Birthday: string;
  };
  CustomerPassword: string;
  otpCode: string;
  readableBirthday: string;
  password1: string;
  password2: string;
  deviceDetails: {
    AppVersion: string;
    Platform: string;
    PlatformOs: string;
    DeviceVersion: string;
    DeviceModel: string;
    MacAddress: string;
    IpAddress: string;
  };
  customerInfo: {
    Firstname: string;
    Lastname: string;
    MobileNumber: string;
    EmailAddress: string;
    Birthday: string;
    Age: number;
    IsSuspended: boolean;
    CustomerId: number;
    ProfilePictureLink:string;
  };
  isFromMenu: boolean;
}

const initialState: UserState = {
  token: "",
  isLoggedin: false,
  customerId: "",
  appState: "",
  basicSignupDetails: {
    Firstname: "",
    Lastname: "",
    MobileNumber: "",
    EmailAddress: "",
    Birthday: "",
  },
  CustomerPassword: "",
  otpCode: "",
  readableBirthday: "",
  password1: "",
  password2: "",
  deviceDetails: {
    AppVersion: "",
    Platform: "",
    PlatformOs: "",
    DeviceVersion: "",
    DeviceModel: "",
    MacAddress: "",
    IpAddress: "",
  },
  customerInfo: {
    Firstname: "",
    Lastname: "",
    MobileNumber: "",
    EmailAddress: "",
    Birthday: "",
    Age: 0,
    IsSuspended: false,
    CustomerId: 0,
    ProfilePictureLink:""
  },
  isFromMenu: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    onUserLogin(state, action: PayloadAction<any>) {
      state.customerId = action.payload;
    },
    onSetToken(state, action: PayloadAction<any>) {
      state.token = action.payload;
    },
    onSetDeviceDetails(state, action: PayloadAction<any>) {
      state.deviceDetails = action.payload;
    },
    onSetAppState(state, action: PayloadAction<any>) {
      state.appState = action.payload;
    },
    userLoggedOut(state) {
      state.isLoggedin = false;
      AsyncStorage.removeItem(TOKEN);
      AsyncStorage.removeItem(CUSTOMER_ID);
      state = initialState;
    },
    onSaveBasicSignupDetails(state, action: PayloadAction<any>) {
      state.basicSignupDetails = action.payload;
    },
    onSetBirthday(state, action: PayloadAction<any>) {
      state.basicSignupDetails.Birthday = action.payload;
    },
    onSetReadbleBirthday(state, action: PayloadAction<any>) {
      state.readableBirthday = action.payload;
    },
    onSetPasswords(state, action: PayloadAction<any>) {
      state.password1 = action.payload.password1;
      state.password2 = action.payload.password2;
    },
    onSetCustomerInfo(state, action: PayloadAction<any>) {
      state.customerInfo = action.payload;
    },
    onSetIsFromMenu(state, action: PayloadAction<any>) {
      state.isFromMenu = action.payload;
    },

    onClearSignupState(state) {
      state.basicSignupDetails = {
        Firstname: "",
        Lastname: "",
        MobileNumber: "",
        EmailAddress: "",
        Birthday: "",
      };
      state.CustomerPassword = "";
      state.otpCode = "";
      state.readableBirthday = "";
      state.password1 = "";
      state.password2 = "";
    },
  },
});

export const {
  onUserLogin,
  onClearSignupState,
  onSaveBasicSignupDetails,
  onSetAppState,
  onSetBirthday,
  onSetCustomerInfo,
  onSetDeviceDetails,
  onSetIsFromMenu,
  onSetPasswords,
  onSetReadbleBirthday,
  onSetToken,
  userLoggedOut,
} = userSlice.actions;
export default userSlice.reducer;
