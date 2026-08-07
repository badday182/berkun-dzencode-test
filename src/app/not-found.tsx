import Link from "next/link";
import { getTranslations } from "next-intl/server";

/**
 * 404 — и для несуществующего адреса, и для вызова `notFound()` из кода
 * (например, `/orders/999`, где такого прихода нет).
 *
 * Серверный компонент: ни состояния, ни обработчиков здесь нет, а значит нет
 * причин тащить его в клиентский бандл. Переводы берутся серверным
 * `getTranslations`, а не хуком.
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="container py-5 text-center">
      <p className="display-1 fw-bold text-muted mb-3">{t("code")}</p>
      <h1 className="h4 mb-3">{t("title")}</h1>
      <p className="text-muted mb-4">{t("description")}</p>
      <div className="d-flex gap-2 justify-content-center">
        <Link className="btn btn-primary" href="/orders">
          {t("toOrders")}
        </Link>
        <Link className="btn btn-outline-secondary" href="/products">
          {t("toProducts")}
        </Link>
      </div>
    </div>
  );
}
