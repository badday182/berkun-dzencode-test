"use client";

import ProductsCard from "@/components/productsCard";
import { useMemo } from "react";
import SelectCustom, { type ProductTypeFilter } from "@/components/select";
import CardPlaceholder from "@/components/cardPlaceholder";
import { ALL_PRODUCT_TYPES } from "@/types";
import { useLocalStorage, useProducts } from "@/hooks";

const PLACEHOLDER_COUNT = 8;

/** Ключ в localStorage: выбранный фильтр переживает перезагрузку страницы. */
const TYPE_FILTER_KEY = "products:type-filter";

const Products = () => {
  const { products, isLoading, error, refetch } = useProducts();
  const [selectedType, setSelectedType] = useLocalStorage<ProductTypeFilter>(
    TYPE_FILTER_KEY,
    ALL_PRODUCT_TYPES
  );

  const filteredProducts = useMemo(
    () =>
      selectedType === ALL_PRODUCT_TYPES
        ? products
        : products.filter((product) => product.type === selectedType),
    [products, selectedType]
  );

  const placeholders = Array.from({ length: PLACEHOLDER_COUNT });

  return (
    <div className="container">
      <h1 className="mb-4">Products</h1>
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between"
          role="alert"
        >
          {/* TODO(1.5): вынести в словари next-intl */}
          <span>Не удалось загрузить продукты: {error.message}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={refetch}
          >
            Повторить
          </button>
        </div>
      )}
      <SelectCustom
        products={products}
        value={selectedType}
        onTypeChange={setSelectedType}
      />
      {isLoading ? (
        <div className="container mt-3 d-flex flex-column gap-3">
          {placeholders.map((_, index) => (
            <CardPlaceholder key={`placeholder-${index}`} />
          ))}
        </div>
      ) : (
        <div className="container mt-3 d-flex flex-column gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductsCard key={product.id} product={product} />
            ))
          ) : (
            // TODO(1.5): вынести в словари next-intl
            <div className="alert alert-info">Продуктов нет</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
