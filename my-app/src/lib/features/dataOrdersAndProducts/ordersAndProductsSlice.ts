import type { Order, OrderId, Product, ProductId } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface OrdersAndProductsState {
  orders: Order[];
  products: Product[];
}

const initialState: OrdersAndProductsState = {
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
    deleteOrder: (state, action: PayloadAction<OrderId>) => {
      state.orders = state.orders.filter(
        (order) => order.id !== action.payload
      );
    },
    /** Всегда диспатчится в паре с `deleteOrder`, иначе продукты останутся сиротами. */
    deleteAllOrderProduct: (state, action: PayloadAction<OrderId>) => {
      state.products = state.products.filter(
        (product) => product.order !== action.payload
      );
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    deleteProduct: (state, action: PayloadAction<ProductId>) => {
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
