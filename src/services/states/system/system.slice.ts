import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SystemSlice {
  receivedChatInfo: {
    text: string;
    show: boolean;
    _id: string;
  };
  totalChatCount: number;
  pendingChatCount: number;
  completedChatCount: number;
  inDisputeChatCount: number;
}

const initialState: SystemSlice = {
  receivedChatInfo: {
    text: "",
    show: false,
    _id: "",
  },
  totalChatCount: 0,
  pendingChatCount: 0,
  completedChatCount: 0,
  inDisputeChatCount: 0,
};

export const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    onSetReceivedChatInfo(state, action: PayloadAction<any>) {
      state.receivedChatInfo = action.payload;
    },
    onResetReceivedChat(state) {
      state.receivedChatInfo = {
        text: "",
        show: false,
        _id: "",
      };
    },

    onSetTotalChatCount(state, action: PayloadAction<any>) {
      state.totalChatCount = action.payload;
    },
    onSetPendingChatCount(state, action: PayloadAction<any>) {
      state.pendingChatCount = action.payload;
    },
    onSetInDisputeChatCount(state, action: PayloadAction<any>) {
      state.inDisputeChatCount = action.payload;
    },
    onSetCompletedChatCount(state, action: PayloadAction<any>) {
      state.completedChatCount = action.payload;
    },
  },
});

export const systemActions = systemSlice.actions;
export default systemSlice.reducer;
