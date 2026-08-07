import seed from "./seed.json";
import { parseOrder, parseProduct, type Order, type Product } from "@/types";

/**
 * Мок-данные приложения.
 *
 * Приложение ими больше не пользуется: с фазы 1.3 страницы берут данные из API,
 * а сид живёт в репозитории бэкенда. Модуль оставлен как готовые фикстуры.
 *
 * TODO(2.6): либо на них встанут обработчики MSW и юнит-тесты редьюсеров, либо
 * файл удаляется вместе с `seed.json` — решается при выборе стека тестов.
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
