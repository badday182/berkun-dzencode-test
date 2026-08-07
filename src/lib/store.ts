import { combineReducers, configureStore } from "@reduxjs/toolkit";
import ordersReducer from "./features/orders/ordersSlice";
import ordersAndProductsReducer from "./features/dataOrdersAndProducts/ordersAndProductsSlice";
import sessionReducer from "./features/session/sessionSlice";
import { listenerMiddleware } from "./listenerMiddleware";

/**
 * Корневой редьюсер объявлен отдельно от стора намеренно: `RootState` выводится
 * из него, а не из `makeStore`. Иначе `makeStore(preloadedState: RootState)`
 * ссылался бы на тип, который сам же и порождает, и TypeScript упёрся бы в
 * циклический вывод.
 */
const rootReducer = combineReducers({
  orders: ordersReducer,
  ordersAndProductsData: ordersAndProductsReducer,
  session: sessionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * `preloadedState` — задел под SSR (фаза 2.1): сервер сложит уже загруженные
 * приходы и продукты в состояние, клиент поднимет стор сразу с ними и не
 * пойдёт за теми же данными второй раз. Отсутствующие слайсы получают свой
 * `initialState`, поэтому передавать состояние целиком не требуется.
 */
export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    // `prepend`, а не `concat`: слушатель должен увидеть экшен раньше, чем
    // тот дойдёт до редьюсеров и остальных middleware.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
