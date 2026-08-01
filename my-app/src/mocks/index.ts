import seed from "./seed.json";
import { parseOrder, parseProduct, type Order, type Product } from "@/types";

/**
 * Мок-данные приложения.
 *
 * `seed.json` в фазе 1.2 переезжает в репозиторий API как сид репозиториев,
 * а отсюда исчезнет вместе с этим модулем — его место займут вызовы axios.
 *
 * Данные прогоняются через `parseOrder` / `parseProduct`, поэтому расхождение
 * между JSON и доменными типами обнаружится сразу, а не в глубине рендера.
 */
export const ordersData: Order[] = seed.orders.map((order) =>
  parseOrder(order)
);

export const productsData: Product[] = seed.products.map((product) =>
  parseProduct(product)
);
