"use client";

import { useMemo, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { ALL_PRODUCT_TYPES, type Product, type ProductType } from "@/types";

/** Значение фильтра: конкретный тип продукта либо «все типы». */
export type ProductTypeFilter = ProductType | typeof ALL_PRODUCT_TYPES;

interface SelectCustomProps {
  products: readonly Product[];
  /**
   * Управляемый компонент: выбранное значение приходит снаружи. Своего
   * состояния у него было бы достаточно ровно до первого случая, когда фильтр
   * задаётся не кликом — например, восстанавливается из localStorage: список
   * фильтровался бы, а в самом `<select>` стояло бы «Все типы».
   */
  value: ProductTypeFilter;
  onTypeChange: (type: ProductTypeFilter) => void;
}

const SelectCustom: React.FC<SelectCustomProps> = ({
  products,
  value,
  onTypeChange,
}) => {
  const t = useTranslations("products");

  const productTypes = useMemo<ProductType[]>(
    () => [...new Set(products.map((product) => product.type))].sort(),
    [products]
  );

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onTypeChange(event.target.value);
  };

  return (
    <select
      className="form-select"
      aria-label={t("filterLabel")}
      value={value}
      onChange={handleTypeChange}
    >
      {/* Сами типы продуктов не переводятся: это каталожные данные бэкенда,
          а не строки интерфейса. */}
      <option value={ALL_PRODUCT_TYPES}>{t("allTypes")}</option>
      {productTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
};

export default SelectCustom;
