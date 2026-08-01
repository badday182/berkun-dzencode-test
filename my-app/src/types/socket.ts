import type { OrderId, ProductId } from "./domain";

/**
 * Контракт событий socket.io. Общий для фронта и API — в фазе 1.2
 * этот файл копируется в репозиторий бэкенда без изменений.
 *
 * Описан размеченным объединением: у слушателя в фазе 1.3 будет один
 * `switch (event.type)`, и TypeScript сам проверит, что разобраны все ветки
 * и что `payload` в каждой соответствует своему типу события.
 */
export type ServerEvent =
  | { type: "sessions:count"; payload: { count: number } }
  | { type: "order:deleted"; payload: { orderId: OrderId } }
  | { type: "product:deleted"; payload: { productId: ProductId } };

export type ClientEvent = { type: "session:ping"; payload: undefined };

export type ServerEventType = ServerEvent["type"];

/** Payload конкретного события по его типу. */
export type ServerEventPayload<TType extends ServerEventType> = Extract<
  ServerEvent,
  { type: TType }
>["payload"];

/**
 * Карта обработчиков в формате, который ожидает `Socket<ServerToClientEvents>`.
 * Выводится из {@link ServerEvent}, поэтому список событий описан ровно один раз.
 */
export type ServerToClientEvents = {
  [TType in ServerEventType]: (payload: ServerEventPayload<TType>) => void;
};

export type ClientToServerEvents = {
  [TType in ClientEvent["type"]]: () => void;
};
