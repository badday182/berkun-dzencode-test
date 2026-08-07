import type {
  ApiError,
  Order,
  OrderId,
  Product,
  ProductId,
  RequestStatus,
} from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "@/services/api";
import { createAppAsyncThunk } from "@/lib/createAppAsyncThunk";

export interface OrdersAndProductsState {
  orders: Order[];
  products: Product[];
  /** Статусы раздельные: списки грузятся двумя независимыми запросами. */
  ordersStatus: RequestStatus;
  productsStatus: RequestStatus;
  /** Ошибка последней операции со списком — и загрузки, и удаления. */
  ordersError: ApiError | null;
  productsError: ApiError | null;
}

const initialState: OrdersAndProductsState = {
  orders: [],
  products: [],
  ordersStatus: "idle",
  productsStatus: "idle",
  ordersError: null,
  productsError: null,
};

/**
 * Данные уже в сторе — повторный запрос не нужен.
 *
 * Заменяет прежнюю проверку «диспатчить, только если массив пуст»: та не
 * различала «ещё не грузили» и «загрузили, но сервер вернул пусто», и в дев-
 * режиме React StrictMode монтирует эффект дважды, отправляя два запроса.
 * Заодно это работает и на гидрации из `preloadedState` в фазе 2.1: серверный
 * рендер положит статус `succeeded`, и клиент за теми же данными не пойдёт.
 */
const shouldSkipFetch = (status: RequestStatus): boolean =>
  status === "loading" || status === "succeeded";

export const fetchOrders = createAppAsyncThunk(
  "ordersAndProductsData/fetchOrders",
  async (_: void, { signal, rejectWithValue }) => {
    try {
      return await api.getOrders({ signal });
    } catch (cause) {
      return rejectWithValue(api.toApiError(cause));
    }
  },
  {
    condition: (_: void, { getState }) =>
      !shouldSkipFetch(getState().ordersAndProductsData.ordersStatus),
  }
);

export const fetchProducts = createAppAsyncThunk(
  "ordersAndProductsData/fetchProducts",
  async (_: void, { signal, rejectWithValue }) => {
    try {
      return await api.getProducts({ signal });
    } catch (cause) {
      return rejectWithValue(api.toApiError(cause));
    }
  },
  {
    condition: (_: void, { getState }) =>
      !shouldSkipFetch(getState().ordersAndProductsData.productsStatus),
  }
);

/**
 * Удаление прихода: сначала сервер, потом стор.
 *
 * Локальные редьюсеры `deleteOrder` / `deleteAllOrderProduct` остались — их
 * дёргает этот thunk, а в фазе 1.3 к ним подключится ещё и слушатель
 * socket-событий. Оба вызываются одной веткой `fulfilled`, поэтому забыть
 * второй и оставить продукты-сиротами больше нельзя: каскад на сервере и
 * каскад в сторе описаны в одном месте.
 */
export const removeOrder = createAppAsyncThunk(
  "ordersAndProductsData/removeOrder",
  async (id: OrderId, { rejectWithValue }) => {
    try {
      await api.deleteOrder(id);
      return id;
    } catch (cause) {
      return rejectWithValue(api.toApiError(cause));
    }
  }
);

export const removeProduct = createAppAsyncThunk(
  "ordersAndProductsData/removeProduct",
  async (id: ProductId, { rejectWithValue }) => {
    try {
      await api.deleteProduct(id);
      return id;
    } catch (cause) {
      return rejectWithValue(api.toApiError(cause));
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.ordersStatus = "loading";
        state.ordersError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.ordersStatus = "succeeded";
        // Копия, а не сама пришедшая коллекция: сервисный слой отдаёт readonly.
        state.orders = [...action.payload];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.ordersStatus = "failed";
        state.ordersError =
          action.payload ?? unknownError(action.error.message);
      })
      .addCase(fetchProducts.pending, (state) => {
        state.productsStatus = "loading";
        state.productsError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsStatus = "succeeded";
        state.products = [...action.payload];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsStatus = "failed";
        state.productsError =
          action.payload ?? unknownError(action.error.message);
      })
      .addCase(removeOrder.fulfilled, (state, action) => {
        // Каскад: сервер удалил продукты прихода и отдельных событий по ним
        // не шлёт — значит и в сторе они убираются здесь же.
        ordersAndProductsSlice.caseReducers.deleteOrder(state, action);
        ordersAndProductsSlice.caseReducers.deleteAllOrderProduct(
          state,
          action
        );
      })
      .addCase(removeOrder.rejected, (state, action) => {
        // Статус не трогаем: список загружен и остаётся валидным, сломалось
        // конкретное удаление. Иначе интерфейс вместо данных показал бы ошибку.
        state.ordersError =
          action.payload ?? unknownError(action.error.message);
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        ordersAndProductsSlice.caseReducers.deleteProduct(state, action);
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.productsError =
          action.payload ?? unknownError(action.error.message);
      });
  },
});

/**
 * `action.payload` в ветке `rejected` пуст, если thunk упал мимо
 * `rejectWithValue` — например, на отмене запроса. Тогда в стор кладётся то,
 * что известно, а не `null` вместо ошибки.
 */
const unknownError = (message: string | undefined): ApiError => ({
  statusCode: 0,
  message: message ?? "Неизвестная ошибка",
});

export const {
  setOrders,
  setProducts,
  deleteOrder,
  deleteProduct,
  deleteAllOrderProduct,
} = ordersAndProductsSlice.actions;
export default ordersAndProductsSlice.reducer;
