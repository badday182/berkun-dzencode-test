import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { OrderId } from "@/types";

export interface OrdersState {
  isOpenAsideContainer: boolean;
  selectedOrderId: OrderId | null;
  selectedOrderTitle: string | null;
}

const initialState: OrdersState = {
  isOpenAsideContainer: false,
  selectedOrderId: null,
  selectedOrderTitle: null,
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    toggleAsideContainer: (state, action: PayloadAction<boolean>) => {
      state.isOpenAsideContainer = action.payload;
    },
    setSelectedOrderId: (state, action: PayloadAction<OrderId | null>) => {
      state.selectedOrderId = action.payload;
    },
    setSelectedOrderTitle: (state, action: PayloadAction<string | null>) => {
      state.selectedOrderTitle = action.payload;
    },
  },
});

export const {
  toggleAsideContainer,
  setSelectedOrderId,
  setSelectedOrderTitle,
} = ordersSlice.actions;
export default ordersSlice.reducer;
