"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { ALL_PRODUCT_TYPES, type Product, type ProductType } from "@/types";

/** Значение фильтра: конкретный тип продукта либо «все типы». */
export type ProductTypeFilter = ProductType | typeof ALL_PRODUCT_TYPES;

interface SelectCustomProps {
  products: readonly Product[];
  onTypeChange: (type: ProductTypeFilter) => void;
}

const SelectCustom: React.FC<SelectCustomProps> = ({
  products,
  onTypeChange,
}) => {
  const [selectedType, setSelectedType] =
    useState<ProductTypeFilter>(ALL_PRODUCT_TYPES);

  const productTypes = useMemo<ProductType[]>(
    () => [...new Set(products.map((product) => product.type))].sort(),
    [products]
  );

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newType: ProductTypeFilter = event.target.value;
    setSelectedType(newType);
    onTypeChange(newType);
  };

  return (
    <select
      className="form-select"
      aria-label="Filter products by type"
      value={selectedType}
      onChange={handleTypeChange}
    >
      {/* TODO(1.5): вынести в словари next-intl */}
      <option value={ALL_PRODUCT_TYPES}>Все типы</option>
      {productTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
};

export default SelectCustom;
