import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface OrdersState {
  isOpenAsideContainer: boolean;
  selectedOrderId: string | null;
}

const initialState: OrdersState = {
  isOpenAsideContainer: false,
  selectedOrderId: null,
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    toggleAsideContainer: (state, action: PayloadAction<boolean>) => {
      state.isOpenAsideContainer = action.payload;
    },
    setSelectedOrderId: (state, action: PayloadAction<string | null>) => {
      state.selectedOrderId = action.payload;
    },
  },
});

export const { toggleAsideContainer, setSelectedOrderId } = ordersSlice.actions;
export default ordersSlice.reducer;
