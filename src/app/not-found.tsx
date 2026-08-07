import Link from "next/link";

/**
 * 404 — и для несуществующего адреса, и для вызова `notFound()` из кода
 * (например, `/orders/999`, где такого прихода нет).
 *
 * Серверный компонент: ни состояния, ни обработчиков здесь нет, а значит нет
 * причин тащить его в клиентский бандл.
 */
export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      {/* TODO(1.5): вынести в словари next-intl */}
      <p className="display-1 fw-bold text-muted mb-3">404</p>
      <h1 className="h4 mb-3">Страница не найдена</h1>
      <p className="text-muted mb-4">
        Возможно, приход удалили, или в адресе опечатка.
      </p>
      <div className="d-flex gap-2 justify-content-center">
        <Link className="btn btn-primary" href="/orders">
          К приходам
        </Link>
        <Link className="btn btn-outline-secondary" href="/products">
          К продуктам
        </Link>
      </div>
    </div>
  );
}
