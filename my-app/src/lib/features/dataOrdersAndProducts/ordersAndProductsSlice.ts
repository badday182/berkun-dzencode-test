import { Order, Product } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface ordersAndProducts {
  orders: Order[];
  products: Product[];
}

const initialState: ordersAndProducts = {
  orders: [],
  products: [],
};

export const ordersAndProductsSlice = createSlice({
  name: "ordersAndProductsData",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
  },
});

export const { setOrders, setProducts } = ordersAndProductsSlice.actions;
export default ordersAndProductsSlice.reducer;
