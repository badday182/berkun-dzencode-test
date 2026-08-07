"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface ErrorPageProps {
  error: Error & { digest?: string };
  /** Повторный рендер сегмента — Next передаёт его сам. */
  reset: () => void;
}

/**
 * Граница ошибок сегмента: сюда попадает всё, что упало при рендере и не было
 * поймано ниже. Обязательно клиентский компонент — так требует Next.
 *
 * Ошибки запросов сюда не доходят: их ловят thunk'и и показывают алертом
 * прямо в списке. Здесь остаются настоящие поломки — битые данные, ошибка в
 * компоненте.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations("error");

  useEffect(() => {
    // TODO(2.7): вместо консоли — отправка в систему мониторинга.
    console.error("Необработанная ошибка рендера:", error);
  }, [error]);

  return (
    <div className="container py-5 text-center">
      <h1 className="h4 mb-3">{t("title")}</h1>
      <p className="text-muted mb-4">{error.message}</p>
      <button type="button" className="btn btn-primary" onClick={reset}>
        {t("retry")}
      </button>
    </div>
  );
}
