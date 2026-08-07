import { createAction, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/**
 * Состояние соединения с сервером событий. Третий слайс рядом с доменными
 * данными и UI-выбором: счётчик активных сессий — не данные приложения
 * (его нельзя загрузить запросом и он ничей не атрибут) и не выбор
 * пользователя.
 */
export interface SessionState {
  /** Сколько клиентов сейчас подключено к API. Приходит только по сокету. */
  activeSessions: number;
  isSocketConnected: boolean;
}

const initialState: SessionState = {
  activeSessions: 0,
  isSocketConnected: false,
};

/**
 * Команды для `listenerMiddleware`: состояние они не меняют, их работа —
 * запустить и остановить подписку на сокет. Отдельные экшены, а не вызов
 * функции из компонента, потому что подписка живёт вне React: так её видно
 * в devtools и её легко переиспользовать из другого места.
 */
export const socketConnectionStarted = createAction(
  "session/socketConnectionStarted"
);
export const socketConnectionStopped = createAction(
  "session/socketConnectionStopped"
);

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setActiveSessions: (state, action: PayloadAction<number>) => {
      state.activeSessions = action.payload;
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
      // Оборвалось соединение — прежнему числу верить нельзя: пока нас нет,
      // сессии приходят и уходят без нашего ведома.
      if (!action.payload) {
        state.activeSessions = 0;
      }
    },
  },
});

export const { setActiveSessions, setSocketConnected } = sessionSlice.actions;
export default sessionSlice.reducer;
