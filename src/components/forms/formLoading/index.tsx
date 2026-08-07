"use client";

import { useTranslations } from "next-intl";

/**
 * Заглушка на время загрузки чанка с формой.
 *
 * Отдельный компонент, потому что `loading` у `next/dynamic` — обычная
 * функция без доступа к хукам вызывающего компонента, а строка должна быть
 * переведена.
 */
const FormLoading = () => {
  const t = useTranslations("common");

  return <p className="text-muted mb-0">{t("loadingForm")}</p>;
};

export default FormLoading;
