import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  connectSocket,
  disconnectSocket,
  subscribeToConnectionState,
  subscribeToServerEvents,
} from "@/services/socket";
import {
  setActiveSessions,
  setSocketConnected,
  socketConnectionStarted,
  socketConnectionStopped,
} from "./features/session/sessionSlice";
import {
  deleteAllOrderProduct,
  deleteOrder,
  deleteProduct,
  fetchOrders,
  fetchProducts,
} from "./features/dataOrdersAndProducts/ordersAndProductsSlice";
import { assertNever } from "@/types";
import type { AppDispatch, RootState } from "./store";

/**
 * Клиентская половина event-driven архитектуры.
 *
 * Компоненты не подписываются на сокет и вообще о нём не знают: события
 * приходят сюда и превращаются в обычные экшены. Из-за этого удаление,
 * сделанное в соседней вкладке, доезжает до интерфейса тем же путём, что и
 * своё собственное, — через редьюсеры, которые уже написаны.
 */
export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

startAppListening({
  actionCreator: socketConnectionStarted,
  effect: async (_action, listenerApi) => {
    // Подписка ровно одна на приложение: в дев-режиме StrictMode монтирует
    // эффект дважды, а вкладку могут открыть и закрыть несколько раз.
    listenerApi.cancelActiveListeners();

    const socket = connectSocket();
    // На сервере сокета нет — во время SSR подписывать некого.
    if (!socket) return;

    // Первое подключение от переподключения отличается только историей,
    // поэтому её приходится помнить здесь.
    let wasConnected = false;

    const stopConnectionState = subscribeToConnectionState((isConnected) => {
      listenerApi.dispatch(setSocketConnected(isConnected));

      if (isConnected && wasConnected) {
        // Пока связи не было, события удаления шли мимо нас, и списки могли
        // разойтись с сервером. Счётчик сессий сервер пришлёт сам, а данные
        // надо перечитать — обычный запрос отсекся бы `condition`.
        void listenerApi.dispatch(fetchOrders({ force: true }));
        void listenerApi.dispatch(fetchProducts({ force: true }));
      }
      wasConnected = isConnected || wasConnected;
    });

    const stopEvents = subscribeToServerEvents((event) => {
      switch (event.type) {
        case "sessions:count":
          listenerApi.dispatch(setActiveSessions(event.payload.count));
          break;
        case "order:deleted":
          // Тот же каскад, что и в `removeOrder`: сервер удалил продукты
          // прихода и отдельных событий по ним не рассылает.
          listenerApi.dispatch(deleteOrder(event.payload.orderId));
          listenerApi.dispatch(deleteAllOrderProduct(event.payload.orderId));
          break;
        case "product:deleted":
          listenerApi.dispatch(deleteProduct(event.payload.productId));
          break;
        default:
          assertNever(event);
      }
    });

    // Слушатель живёт, пока не придёт команда остановиться. `await` держит
    // эффект открытым — это штатный приём RTK для долгоживущих подписок.
    await listenerApi.condition(socketConnectionStopped.match);

    stopEvents();
    stopConnectionState();
    disconnectSocket();
    listenerApi.dispatch(setSocketConnected(false));
  },
});
