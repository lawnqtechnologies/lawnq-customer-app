import { configureStore } from '@reduxjs/toolkit';

import userReducer from "@services/states/user/user.slice";
import bookingReducer from "@services/states/booking/booking.slice";
import propertyReducer from "@services/states/property/property.slice";
import systemReducer from "@services/states/system/system.slice";
import menuReducer from "@services/states/menu/menu.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    booking: bookingReducer,
    property: propertyReducer,
    system: systemReducer,
    menu: menuReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
