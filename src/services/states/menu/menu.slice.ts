import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MenuSlice {
  fromAccountToPayment: boolean;
}

const initialState: MenuSlice = {
  fromAccountToPayment: false,
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    onSetFromAccountToPayment(state, action: PayloadAction<any>) {
      state.fromAccountToPayment = action.payload;
    },
  },
});

export const { onSetFromAccountToPayment} = menuSlice.actions;
export default menuSlice.reducer;
