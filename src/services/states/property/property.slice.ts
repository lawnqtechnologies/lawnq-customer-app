import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface PropertyState {
  isUpdate: boolean;
  isUsed: boolean;
  selectedPet: number;
  selectedServiceType: number;
  selectedTerrainType: string;
  lawnArea: any;
  addProplawnImages: Array<string>;
  hasPets: number;
  propertyName: string;
  address: string;
  addressComponents: Array<any>;
  geometry: {lat: string; lng: string};
  propertyId: number;
  propertyLength: number;
  serviceType: string;
  terrainType: string;
  addPropURIList: Array<string>;
  serviceTypes: Array<any>;
  Country: string;
  State: string;
  Suburb: string;
  HouseNumber: string;
  StreetName: string;
  StreetNumber: string;
  PostalCode: string;
  isReloadScreen: boolean;
  Remarks?: string;
}

const initialState: PropertyState = {
  isUpdate: false,
  isUsed: false,
  selectedPet: 99,
  selectedServiceType: 99,
  selectedTerrainType: '',
  lawnArea: '',
  addProplawnImages: [],
  hasPets: 2,
  propertyName: '',
  address: '',
  addressComponents: [],
  geometry: {lat: '', lng: ''},
  propertyId: 0,
  propertyLength: 0,
  serviceType: '',
  terrainType: '',
  addPropURIList: [],
  StreetNumber: '',
  serviceTypes: [],
  Country: '',
  State: '',
  Suburb: '',
  HouseNumber: '',
  StreetName: '',
  PostalCode: '',
  isReloadScreen: false,
  Remarks: '',
};

export const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    onSetIsUpdate(state, action: PayloadAction<any>) {
      state.isUpdate = action.payload;
    },
    onSetIsDefault(state, action: PayloadAction<any>) {
      state.isUsed = action.payload;
    },
    onSetSelectedPet(state, action: PayloadAction<any>) {
      state.selectedPet = action.payload;
    },
    onSetSelectedServiceType(state, action: PayloadAction<any>) {
      state.selectedServiceType = action.payload;
    },
    onSetStreetNumber(state, action: PayloadAction<any>) {
      state.StreetNumber = action.payload;
    },
    onSetStreetName(state, action: PayloadAction<any>) {
      state.StreetName = action.payload;
    },
    onSetState(state, action: PayloadAction<any>) {
      state.State = action.payload;
    },
    onSetCountry(state, action: PayloadAction<any>) {
      state.Country = action.payload;
    },
    onSetSuburb(state, action: PayloadAction<any>) {
      state.Suburb = action.payload;
    },
    onSetPostalCode(state, action: PayloadAction<any>) {
      state.PostalCode = action.payload;
    },
    onSetSelectedTerrainType(state, action: PayloadAction<any>) {
      state.selectedTerrainType = action.payload;
    },
    onSetLawnArea(state, action: PayloadAction<any>) {
      state.lawnArea = action.payload;
    },
    onSetAddPropLawnImages(state, action: PayloadAction<any>) {
      state.addProplawnImages = action.payload;
    },
    onSetHasPets(state, action: PayloadAction<any>) {
      state.hasPets = action.payload;
    },
    onSetServiceType(state, action: PayloadAction<any>) {
      state.serviceType = action.payload;
    },
    onSetTerrainType(state, action: PayloadAction<any>) {
      state.terrainType = action.payload;
    },
    onSetPropertyName(state, action: PayloadAction<any>) {
      state.propertyName = action.payload;
    },
    onSetAddress(state, action: PayloadAction<any>) {
      state.address = action.payload;
    },
    onSetAddressComponents(state, action: PayloadAction<any>) {
      state.addressComponents = action.payload;
    },
    onSetGeometry(state, action: PayloadAction<any>) {
      state.geometry = action.payload;
    },
    onSetPropertyId(state, action: PayloadAction<any>) {
      state.propertyId = action.payload;
    },
    onSetPropertyLength(state, action: PayloadAction<any>) {
      state.propertyLength = action.payload;
    },
    onSetAddPropUriList(state, action: PayloadAction<any>) {
      state.addPropURIList = action.payload;
    },
    onSetServiceTypes(state, action: PayloadAction<any>) {
      state.serviceTypes = action.payload;
    },
    OnSetIsReloadScreen(state, action: PayloadAction<any>) {
      state.isReloadScreen = action.payload;
    },
    onSetRemarks(state, action: PayloadAction<any>) {
      state.Remarks = action.payload;
    },

    onResetAddPropertyStates(state) {
      state.selectedPet = 99;
      state.selectedServiceType = 99;
      state.selectedTerrainType = '';
      state.lawnArea = '';
      state.propertyName = '';
      state.address = '';
      state.addProplawnImages = [];
      state.hasPets = 2;
      state.serviceType = '';
      state.terrainType = '';
      state.addressComponents = [];
      state.geometry = {lat: '', lng: ''};
      state.propertyId = 0;
      state.propertyLength = 0;
      state.Country = '';
      state.StreetNumber = '';
      state.StreetName = '';
      state.Suburb = '';
      state.State = '';
      state.PostalCode = '';
      state.Remarks = '';
    },
  },
});

export const {
  onResetAddPropertyStates,
  onSetAddPropLawnImages,
  onSetAddPropUriList,
  onSetAddress,
  onSetAddressComponents,
  onSetCountry,
  onSetGeometry,
  onSetHasPets,
  onSetIsDefault,
  onSetIsUpdate,
  onSetLawnArea,
  onSetPostalCode,
  onSetPropertyId,
  onSetPropertyLength,
  onSetPropertyName,
  onSetSelectedPet,
  onSetSelectedServiceType,
  onSetSelectedTerrainType,
  onSetServiceType,
  onSetServiceTypes,
  onSetState,
  onSetStreetName,
  onSetStreetNumber,
  onSetSuburb,
  onSetTerrainType,
  OnSetIsReloadScreen,
  onSetRemarks,
} = propertySlice.actions;
export default propertySlice.reducer;
