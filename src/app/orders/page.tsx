import OrdersView from "@/components/ordersView";
import StoreHydrator from "@/components/storeHydrator";
import { loadOrdersAndProducts } from "@/services/serverData";

/**
 * Серверный компонент: приходы и продукты загружаются до отправки разметки,
 * поэтому первый экран приходит уже со списком, а не со скелетонами.
 *
 * Интерактив (выбор прихода, удаление, формы) живёт в клиентском острове
 * `OrdersView`; страница отвечает только за данные.
 */
export default async function OrdersPage() {
  const { orders, products } = await loadOrdersAndProducts();

  return (
    <>
      {/* Выше `OrdersView`: к его первому рендеру стор уже заполнен. */}
      <StoreHydrator orders={orders} products={products} />
      <OrdersView />
    </>
  );
}
