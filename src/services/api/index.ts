/**
 * Точка входа в слой запросов: `import { getOrders } from "@/services/api"`.
 *
 * Компоненты и thunks не должны знать про `services/http` и уж тем более про
 * axios — если в фазе 2.3 чтение переедет на GraphQL, поменяется реализация
 * этих функций, а не места вызова.
 */
export * from "./orders";
export * from "./products";
