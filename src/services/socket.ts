import { io, type Socket } from "socket.io-client";
import { apiBaseUrl } from "./http";
import {
  assertNever,
  toOrderId,
  toProductId,
  type ClientToServerEvents,
  type ServerEvent,
  type ServerEventPayload,
  type ServerEventType,
  type ServerToClientEvents,
} from "@/types";

/**
 * Клиент socket.io. Второй канал связи с тем же API: HTTP отвечает на запросы,
 * сокет сообщает о том, чего никто не спрашивал — счётчик сессий и удаления,
 * сделанные в другой вкладке или другим пользователем.
 *
 * Модуль ничего не знает про Redux: он отдаёт разобранные события наружу,
 * а раскладывает их по стору `listenerMiddleware`. Это и есть клиентская
 * половина EDA — источник событий отделён от их обработчиков.
 */

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Пауза перед первой попыткой переподключения и её потолок при росте. */
const RECONNECT_DELAY_MS = 1_000;
const RECONNECT_DELAY_MAX_MS = 5_000;

/**
 * Список нужен, чтобы подписаться: сам union существует только в типах.
 * `satisfies` не даст вписать сюда несуществующее событие, а проверка ниже —
 * забыть новое: при добавлении варианта в `ServerEvent` перестанет
 * компилироваться `_EveryServerEventSubscribed`.
 */
const SERVER_EVENT_TYPES = [
  "sessions:count",
  "order:deleted",
  "product:deleted",
] as const satisfies readonly ServerEventType[];

type _EveryServerEventSubscribed =
  Exclude<ServerEventType, (typeof SERVER_EVENT_TYPES)[number]> extends never
    ? true
    : never;

let socket: AppSocket | null = null;

/**
 * Инстанс сокета. На сервере возвращает `null`: во время SSR соединения
 * держать некому, а `io()` там полез бы в несуществующий `window`.
 */
export const getSocket = (): AppSocket | null => {
  if (typeof window === "undefined") return null;

  socket ??= io(apiBaseUrl(), {
    withCredentials: true,
    // Подключаемся не при импорте модуля, а по явной команде из стора —
    // иначе соединение открывалось бы даже там, где оно не нужно.
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: RECONNECT_DELAY_MS,
    reconnectionDelayMax: RECONNECT_DELAY_MAX_MS,
  });

  return socket;
};

export const connectSocket = (): AppSocket | null => {
  const instance = getSocket();
  instance?.connect();
  return instance;
};

/** Инстанс не выбрасывается: настройки переподключения переживают разрыв. */
export const disconnectSocket = (): void => {
  socket?.disconnect();
};

/**
 * Запросить счётчик сессий у сервера. Сервер рассылает его сам при каждом
 * connect/disconnect, но после разрыва рассылка могла пройти мимо нас —
 * дешевле переспросить, чем показывать устаревшее число.
 */
export const requestSessionCount = (): void => {
  socket?.emit("session:ping");
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Разбор события на границе — по тем же правилам, что и HTTP-ответ.
 *
 * Типизированный `Socket` обещает форму payload'а, но обещание проверить
 * нечем: по проводу приходит произвольный JSON. Битое событие лучше
 * пропустить, чем положить `undefined` в стор.
 */
const parseServerEvent = (
  type: ServerEventType,
  payload: unknown
): ServerEvent | null => {
  if (!isRecord(payload)) return null;

  switch (type) {
    case "sessions:count":
      return typeof payload.count === "number"
        ? { type, payload: { count: payload.count } }
        : null;
    case "order:deleted":
      return typeof payload.orderId === "number"
        ? { type, payload: { orderId: toOrderId(payload.orderId) } }
        : null;
    case "product:deleted":
      return typeof payload.productId === "number"
        ? { type, payload: { productId: toProductId(payload.productId) } }
        : null;
    default:
      return assertNever(type);
  }
};

/**
 * Подписка на все события сервера сразу. Наружу отдаётся размеченное
 * объединение `ServerEvent`, поэтому у подписчика будет один `switch` с
 * проверкой полноты, а не три разрозненных обработчика.
 *
 * Приведения типов здесь неизбежны: TypeScript не связывает переменную цикла
 * с конкретным членом мапленного типа `ServerToClientEvents`.
 */
export const subscribeToServerEvents = (
  handler: (event: ServerEvent) => void
): (() => void) => {
  const instance = getSocket();
  if (!instance) return () => {};

  const detachers = SERVER_EVENT_TYPES.map((type) => {
    const listener = (payload: ServerEventPayload<typeof type>) => {
      const event = parseServerEvent(type, payload);
      if (!event) {
        console.warn(`Событие ${type} пришло в неожиданном виде`, payload);
        return;
      }
      handler(event);
    };

    instance.on(type, listener as ServerToClientEvents[typeof type]);
    return () =>
      instance.off(type, listener as ServerToClientEvents[typeof type]);
  });

  return () => detachers.forEach((detach) => detach());
};

/**
 * Подписка на состояние соединения. Отдельно от событий: разрыв — это не
 * доменное событие, а факт о транспорте, и интерфейсу он нужен, чтобы не
 * показывать счётчик сессий, которому больше нельзя верить.
 */
export const subscribeToConnectionState = (
  handler: (isConnected: boolean) => void
): (() => void) => {
  const instance = getSocket();
  if (!instance) return () => {};

  const handleConnect = () => {
    handler(true);
    requestSessionCount();
  };
  const handleDisconnect = () => handler(false);

  instance.on("connect", handleConnect);
  instance.on("disconnect", handleDisconnect);

  return () => {
    instance.off("connect", handleConnect);
    instance.off("disconnect", handleDisconnect);
  };
};
