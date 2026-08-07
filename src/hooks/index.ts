/**
 * Кастомные хуки приложения: `import { useOrders } from "@/hooks"`.
 *
 * Здесь живёт логика, которую иначе пришлось бы копировать по компонентам —
 * загрузка данных, таймеры, подписки, состояние модалок. Типизированные хуки
 * Redux (`useAppDispatch`, `useAppSelector`) остаются в `@/lib/hooks`: они
 * часть стора, а не прикладного слоя.
 */
export * from "./useClock";
export * from "./useConfirm";
export * from "./useLocalStorage";
export * from "./useOrders";
export * from "./useOrderStats";
export * from "./useProducts";
export * from "./useSessionCount";
export * from "./useSocket";
