import { Currency, type OrderId, type OrderStats, type Product } from "@/types";

/** Количество продуктов в приходе и суммы по каждой валюте. */
const getOrderStats = (
  orderId: OrderId,
  products: readonly Product[]
): OrderStats => {
  const orderProducts = products.filter((product) => product.order === orderId);

  const totals = orderProducts.reduce<Record<Currency, number>>(
    (acc, product) => {
      for (const price of product.price) {
        acc[price.symbol] += price.value;
      }
      return acc;
    },
    { [Currency.USD]: 0, [Currency.UAH]: 0 }
  );

  return {
    productsCount: orderProducts.length,
    priceUSD: totals[Currency.USD],
    priceUAH: totals[Currency.UAH],
  };
};

export default getOrderStats;
