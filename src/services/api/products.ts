import { http, type RequestOptions } from "../http";
import { parseCollection, parseEntity } from "./parse";
import {
  parseProduct,
  type CreateProductDto,
  type Product,
  type ProductId,
} from "@/types";

/**
 * Продукты. Те же правила, что и в `orders.ts`: изоморфно, без состояния,
 * ответ разбирается на границе.
 */

/**
 * `GET /products`.
 *
 * Фильтр по типу и выборка продуктов конкретного прихода считаются на клиенте:
 * серверных query-параметров для этого нет, а весь каталог — 34 записи. Когда
 * список перестанет помещаться в один ответ, здесь появится `Paginated<Product>`
 * из `types/api.ts`.
 */
export const getProducts = async (
  options?: RequestOptions
): Promise<readonly Product[]> =>
  parseCollection(await http.get<unknown>("/products", options), parseProduct);

/**
 * `POST /products` → `201` с продуктом, которому сервер выдал `id`.
 *
 * `dto.order` — брендовый `OrderId`, но в JSON это обычное число: бренд живёт
 * только в типах. На стороне API его обратно превращает в `OrderId` контроллер.
 */
export const createProduct = async (
  dto: CreateProductDto,
  options?: RequestOptions
): Promise<Product> =>
  parseEntity(
    await http.post<unknown>("/products", dto, options),
    parseProduct
  );

/** `DELETE /products/:id` → `204` без тела. */
export const deleteProduct = async (
  id: ProductId,
  options?: RequestOptions
): Promise<void> => {
  await http.delete(`/products/${id}`, options);
};
