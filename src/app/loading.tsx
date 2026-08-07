import CardPlaceholder from "@/components/cardPlaceholder";

const PLACEHOLDER_COUNT = 8;

/**
 * Скелетон на время загрузки сегмента.
 *
 * Сейчас показывается редко: страницы клиентские, и данные они грузят уже
 * после монтирования — свои скелетоны они рисуют сами. Свою настоящую работу
 * этот файл начнёт в фазе 2.1, когда страницы станут серверными и ждать будет
 * уже сам сегмент.
 */
export default function Loading() {
  return (
    <div className="container mt-3 d-flex flex-column gap-3">
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <CardPlaceholder key={`segment-placeholder-${index}`} />
      ))}
    </div>
  );
}
