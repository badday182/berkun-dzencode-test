/**
 * TODO(2.1): при переходе на SSR зафиксировать формат на UTC —
 * иначе сервер и клиент дадут разный результат и React упадёт с hydration mismatch.
 * TODO(1.5): локаль месяца берётся из окружения; перевести на next-intl.
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${day} / ${month} / ${year}`;
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${month} / ${year}`;
};
