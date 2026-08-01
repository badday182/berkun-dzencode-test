import type { Brand } from "./brand";

/* ------------------------------------------------------------------ */
/* Идентификаторы                                                      */
/* ------------------------------------------------------------------ */

export type OrderId = Brand<number, "OrderId">;
export type ProductId = Brand<number, "ProductId">;

export const toOrderId = (value: number): OrderId => value as OrderId;
export const toProductId = (value: number): ProductId => value as ProductId;

/* ------------------------------------------------------------------ */
/* Перечисления                                                        */
/* ------------------------------------------------------------------ */

/** Закрытый набор: приложение оперирует ровно двумя валютами. */
export enum Currency {
  USD = "USD",
  UAH = "UAH",
}

/** `isNew` в исходных данных — 0/1. Здесь у чисел появляются имена. */
export enum ProductCondition {
  Used = 0,
  New = 1,
}

/**
 * Тип продукта намеренно оставлен строкой, а не enum: каталог категорий
 * ведёт бэкенд, набор открыт и пополняется без релиза фронта.
 * Для фильтра используется {@link ALL_PRODUCT_TYPES}.
 */
export type ProductType = string;

export const ALL_PRODUCT_TYPES = "all" as const;

/* ------------------------------------------------------------------ */
/* Доменные сущности                                                   */
/* ------------------------------------------------------------------ */

export interface Price {
  value: number;
  symbol: Currency;
  isDefault: 0 | 1;
}

export interface Guarantee {
  start: string;
  end: string;
}

export interface Order {
  id: OrderId;
  title: string;
  date: string;
  description: string;
}

export interface Product {
  id: ProductId;
  serialNumber: number;
  isNew: ProductCondition;
  photo: string;
  title: string;
  type: ProductType;
  specification: string;
  guarantee: Guarantee;
  price: Price[];
  order: OrderId;
  date: string;
}

export interface OrderStats {
  productsCount: number;
  priceUSD: number;
  priceUAH: number;
}

/* ------------------------------------------------------------------ */
/* DTO — выводятся из сущностей утилити-типами, а не дублируются руками */
/* ------------------------------------------------------------------ */

export type CreateOrderDto = Omit<Order, "id">;
export type UpdateOrderDto = Partial<CreateOrderDto>;

export type CreateProductDto = Omit<Product, "id">;
export type UpdateProductDto = Partial<CreateProductDto>;

/* ------------------------------------------------------------------ */
/* Type guards и разбор данных на границе приложения                   */
/* ------------------------------------------------------------------ */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isCurrency = (value: unknown): value is Currency =>
  typeof value === "string" &&
  (Object.values(Currency) as string[]).includes(value);

export const isProductCondition = (value: unknown): value is ProductCondition =>
  value === 0 || value === 1;

export const isPrice = (value: unknown): value is Price =>
  isRecord(value) &&
  typeof value.value === "number" &&
  isCurrency(value.symbol) &&
  (value.isDefault === 0 || value.isDefault === 1);

export const isGuarantee = (value: unknown): value is Guarantee =>
  isRecord(value) &&
  typeof value.start === "string" &&
  typeof value.end === "string";

export const isOrder = (value: unknown): value is Order =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.title === "string" &&
  typeof value.date === "string" &&
  typeof value.description === "string";

export const isProduct = (value: unknown): value is Product =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.serialNumber === "number" &&
  isProductCondition(value.isNew) &&
  typeof value.photo === "string" &&
  typeof value.title === "string" &&
  typeof value.type === "string" &&
  typeof value.specification === "string" &&
  isGuarantee(value.guarantee) &&
  Array.isArray(value.price) &&
  value.price.every(isPrice) &&
  typeof value.order === "number" &&
  typeof value.date === "string";

/**
 * Разбор «сырых» данных на границе: мок сейчас, ответ axios в фазе 1.3.
 * Падает громко — молча пропустить битую запись в стор хуже, чем упасть.
 */
export const parseOrder = (raw: unknown): Order => {
  if (!isOrder(raw)) {
    throw new TypeError(`Некорректные данные заказа: ${JSON.stringify(raw)}`);
  }
  return raw;
};

export const parseProduct = (raw: unknown): Product => {
  if (!isProduct(raw)) {
    throw new TypeError(`Некорректные данные продукта: ${JSON.stringify(raw)}`);
  }
  return raw;
};

/* ------------------------------------------------------------------ */
/* Помощники                                                           */
/* ------------------------------------------------------------------ */

export const findPrice = (
  prices: readonly Price[],
  currency: Currency
): Price | undefined => prices.find((price) => price.symbol === currency);
