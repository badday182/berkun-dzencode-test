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
    deleteAllOrderProduct: (state, action: PayloadAction<number>) => {
      state.products = state.products.filter(
        (product) => product.order !== action.payload
      );
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload
      );
    },
  },
});

export const {
  setOrders,
  setProducts,
  deleteOrder,
  deleteProduct,
  deleteAllOrderProduct,
} = ordersAndProductsSlice.actions;
export default ordersAndProductsSlice.reducer;
