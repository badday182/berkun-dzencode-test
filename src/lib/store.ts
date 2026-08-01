import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "./features/orders/ordersSlice";
import ordersAndProductsReducer from "./features/dataOrdersAndProducts/ordersAndProductsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      orders: ordersReducer,
      ordersAndProductsData: ordersAndProductsReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
