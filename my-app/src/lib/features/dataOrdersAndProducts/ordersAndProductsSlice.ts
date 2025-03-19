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
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(
        (order) => order.id !== Number(action.payload)
      );
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
  },
});

export const { setOrders, setProducts, deleteOrder } =
  ordersAndProductsSlice.actions;
export default ordersAndProductsSlice.reducer;
