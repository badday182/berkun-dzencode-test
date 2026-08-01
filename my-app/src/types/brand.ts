declare const __brand: unique symbol;

/**
 * Номинальная типизация поверх примитивов.
 *
 * Существует только на этапе компиляции: в рантайме `OrderId` — обычный `number`.
 * Нужна, чтобы нельзя было передать `ProductId` туда, где ждут `OrderId`,
 * и чтобы идентификаторы перестали молча конвертироваться между `string` и `number`.
 */
export type Brand<TValue, TBrand extends string> = TValue & {
  readonly [__brand]: TBrand;
};
