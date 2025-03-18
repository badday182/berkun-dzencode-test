const getOrderStats = (orderId: number, products) => {
  const orderProducts = products.filter((product) => product.order === orderId);

  const totalPrices = orderProducts.reduce(
    (acc, product) => {
      product.price.forEach((price) => {
        if (price.symbol === "USD") acc.USD += price.value;
        if (price.symbol === "UAH") acc.UAH += price.value;
      });
      return acc;
    },
    { USD: 0, UAH: 0 }
  );

  return {
    productsCount: orderProducts.length,
    priceUSD: totalPrices.USD,
    priceUAH: totalPrices.UAH,
  };
};

export default getOrderStats;
