import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/**
 * Состояние раскладки. Живёт в сторе, а не внутри сайдбара, потому что им
 * пользуются двое: сам сайдбар и кнопка-бургер в шапке.
 *
 * Два флага, а не один: на широком экране сайдбар сворачивается до иконок и
 * остаётся на месте, на узком — выезжает поверх содержимого. Это разные
 * состояния, и объединять их в одно означало бы, что сворачивание на десктопе
 * оставляет мобильную панель открытой.
 */
export interface LayoutState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
}

const initialState: LayoutState = {
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
};

export const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleSidebarCollapsed: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    // TODO(2.5): состояние сайдбара сохранять в localStorage через
    // `useLocalStorage` — там же язык и последний выбранный приход.
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileSidebarOpen = action.payload;
    },
  },
});

export const {
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setMobileSidebarOpen,
} = layoutSlice.actions;
export default layoutSlice.reducer;
