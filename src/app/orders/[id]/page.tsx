import { notFound } from "next/navigation";
import OrderDeepLink from "@/components/orderDeepLink";
import { toOrderId, type OrderId } from "@/types";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Ссылка на конкретный приход: `/orders/12` показывает тот же список, но с
 * заранее открытой боковой панелью. Существует ради двух вещей — ссылкой на
 * приход можно поделиться, и появляется настоящий повод вызвать `notFound()`.
 *
 * Страница серверная, и это важно: проверку формата она делает до того, как
 * отправит ответ, поэтому `/orders/abc` возвращает честный HTTP 404, а не 200
 * с последующим переключением на клиенте. Всё, что зависит от загруженных
 * данных, вынесено в клиентский `OrderDeepLink` — до фазы 2.1 списка на
 * сервере просто нет.
 */
export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const orderId = parseOrderIdParam(id);

  if (orderId === null) notFound();

  return <OrderDeepLink orderId={orderId} />;
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
