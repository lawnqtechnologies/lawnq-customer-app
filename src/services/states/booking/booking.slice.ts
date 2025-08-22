import {createSlice, PayloadAction} from '@reduxjs/toolkit';
interface BokingState {
  fromHome: string;
  bookingType: number;
  selectedServiceTypeId: number;
  property: {
    label: string;
    shortDesc?: string;
    value: string;
    lawnArea: number;
    lawnAreaId: number;
    latitude: number;
    longitude: number;
    propertyIndex: number;
    serviceType: string;
    terrainType: string;
  };
  formattedDate1: string;
  formattedDate2: string;
  rawDate: string;
  queue: string;
  frontyardFilename: string;
  backyardFilename: string;
  lawnImages: Array<string>;
  lawnURIList: Array<any>;
  fee: number;
  bookingIntervalServiceTime: [];
  bookingIntervalServiceTimeValue: {label: string; value: string};
  bookingServiceType: [];
  bookingServiceTypeValue: {label: string; value: string};
  grassClippingsValue: {label: string; value: string};
  bookingRefNo: string;
  message: string;
  bookingItem: any;
  goToScreen: any;
  isPropertyPickedFromList: boolean;
  chatCount: number;
  bookingPayment: {
    customerId: number;
    amount: string;
    paymentCustomerId: string;
    paymentCustomerMehodId: string;
    bookingRefNo: string;
  };
  intiatePayment: boolean;
  ServiceProviderIdAccepted: number;
  isReschedule: boolean;
}

const initialState: BokingState = {
  fromHome: '',
  bookingType: 0,
  selectedServiceTypeId: 0,
  property: {
    label: '',
    shortDesc: '',
    value: '0',
    lawnArea: 0,
    lawnAreaId: 0,
    latitude: 0,
    longitude: 0,
    propertyIndex: 0,
    serviceType: '',
    terrainType: '',
  },
  formattedDate1: '',
  formattedDate2: '',
  rawDate: '',
  queue: '',
  frontyardFilename: '',
  backyardFilename: '',
  lawnImages: [],
  lawnURIList: [],
  fee: 0,
  bookingIntervalServiceTime: [],
  bookingIntervalServiceTimeValue: {label: '', value: '0'},
  bookingServiceType: [],
  bookingServiceTypeValue: {label: '', value: '0'},
  grassClippingsValue: {label: 'No', value: '2'},
  bookingRefNo: '',
  message: '',
  bookingItem: {},
  goToScreen: '',
  isPropertyPickedFromList: false,
  chatCount: 0,
  bookingPayment: {
    customerId: 0,
    amount: '',
    paymentCustomerId: '',
    paymentCustomerMehodId: '',
    bookingRefNo: '',
  },
  ServiceProviderIdAccepted: 0,
  intiatePayment: false,
  isReschedule: false,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    onSetFromHome(state, action: PayloadAction<any>) {
      state.fromHome = action.payload;
    },
    onSetBookingType(state, action: PayloadAction<any>) {
      state.bookingType = action.payload;
    },
    setSelectedServiceTypeId(state, action: PayloadAction<any>) {
      state.selectedServiceTypeId = action.payload;
    },
    onSetProperty(state, action: PayloadAction<any>) {
      state.property = action.payload;
    },
    onSetDateAndQueue(state, action: PayloadAction<any>) {
      state.formattedDate1 = action.payload.formattedDate1;
      state.formattedDate2 = action.payload.formattedDate2;
      state.queue = action.payload.queue;
      state.rawDate = action.payload.rawDate;
    },
    onSetFrontyardFilename(state, action: PayloadAction<any>) {
      state.frontyardFilename = action.payload;
    },
    onSetBackyardFilename(state, action: PayloadAction<any>) {
      state.backyardFilename = action.payload;
    },
    onSetLawnImages(state, action: PayloadAction<any>) {
      state.lawnImages = action.payload;
    },
    onSetLawnURIList(state, action: PayloadAction<any>) {
      state.lawnURIList = action.payload;
    },
    onSetBookingIntervalServiceTime(state, action: PayloadAction<any>) {
      state.bookingIntervalServiceTime = action.payload;
    },
    onSetBookingIntervalServiceTimeValue(state, action: PayloadAction<any>) {
      state.bookingIntervalServiceTimeValue = action.payload;
    },
    onSetBookingServiceType(state, action: PayloadAction<any>) {
      state.bookingServiceType = action.payload;
    },
    onSetBookingServiceTypeValue(state, action: PayloadAction<any>) {
      state.bookingServiceTypeValue = action.payload;
    },
    onSetGrassClippingsValue(state, action: PayloadAction<any>) {
      state.grassClippingsValue = action.payload;
    },
    onSetBookingRefNo(state, action: PayloadAction<any>) {
      state.bookingRefNo = action.payload;
    },
    onSetMessage(state, action: PayloadAction<any>) {
      state.message = action.payload;
    },
    onSetBookingItem(state, action: PayloadAction<any>) {
      state.bookingItem = action.payload;
    },
    onSetChatCount(state, action: PayloadAction<any>) {
      state.chatCount = action.payload;
    },
    onSetFee(state, action: PayloadAction<any>) {
      console.log('action:', action);
      state.fee = action.payload;
    },
    onSetGoToScreen(state, action: PayloadAction<any>) {
      state.goToScreen = action.payload;
    },
    onSetIsPropertyPickedFromList(state, action: PayloadAction<any>) {
      state.isPropertyPickedFromList = action.payload;
    },
    onSetBookingPayment(state, action: PayloadAction<any>) {
      state.bookingPayment = action.payload;
    },
    onserviceProviderIdAccepted(state, action: PayloadAction<any>) {
      state.ServiceProviderIdAccepted = action.payload;
    },
    onSetIsReschedule(state, action: PayloadAction<any>) {
      state.isReschedule = action.payload;
    },
  },
});

export const {
  onSetFromHome,
  onSetBackyardFilename,
  onSetBookingIntervalServiceTime,
  onSetBookingIntervalServiceTimeValue,
  onSetBookingItem,
  onSetBookingPayment,
  onSetBookingRefNo,
  onSetLawnURIList,
  onSetBookingServiceType,
  onSetBookingServiceTypeValue,
  onSetBookingType,
  onSetChatCount,
  onSetDateAndQueue,
  onSetFee,
  onSetFrontyardFilename,
  onSetGoToScreen,
  onSetGrassClippingsValue,
  onSetIsPropertyPickedFromList,
  onSetLawnImages,
  onSetMessage,
  onSetProperty,
  onserviceProviderIdAccepted,
  setSelectedServiceTypeId,
  onSetIsReschedule,
} = bookingSlice.actions;
export default bookingSlice.reducer;
