import { notFound } from "next/navigation";
import OrderDeepLink from "@/components/orderDeepLink";
import StoreHydrator from "@/components/storeHydrator";
import { loadOrdersAndProducts } from "@/services/serverData";
import { toOrderId, type OrderId } from "@/types";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Ссылка на конкретный приход: `/orders/12` показывает тот же список, но с
 * заранее открытой боковой панелью. Существует ради двух вещей — ссылкой на
 * приход можно поделиться, и появляется настоящий повод вызвать `notFound()`.
 *
 * С фазы 2.1 обе проверки идут на сервере: формат номера и наличие прихода в
 * загруженном списке. Клиенту больше не нужно ждать данных, чтобы понять, что
 * страницы не существует, — 404 приходит сразу, без промежуточного экрана.
 */
export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const orderId = parseOrderIdParam(id);

  if (orderId === null) notFound();

  const { orders, products, error } = await loadOrdersAndProducts();

  // Если сервер до API не достучался, судить о существовании прихода нельзя:
  // 404 здесь означал бы «удалён», а на самом деле «неизвестно». Отдаём
  // страницу, клиент повторит запрос и покажет ошибку с кнопкой «Повторить».
  if (!error && !orders?.some((order) => order.id === orderId)) notFound();

  return (
    <>
      <StoreHydrator orders={orders} products={products} />
      <OrderDeepLink orderId={orderId} />
    </>
  );
}

/**
 * `/orders/12` → `OrderId`. Единственное место, где строка из адресной строки
 * превращается в идентификатор, — та самая конвертация на границе, ради
 * которой заведены брендовые типы.
 */
const parseOrderIdParam = (raw: string): OrderId | null => {
  if (!/^\d+$/.test(raw)) return null;

  const parsed = Number.parseInt(raw, 10);
  return Number.isSafeInteger(parsed) ? toOrderId(parsed) : null;
};
