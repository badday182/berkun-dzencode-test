"use client";

import ProductsCard from "@/components/productsCard";
import { useMemo } from "react";
import SelectCustom, { type ProductTypeFilter } from "@/components/select";
import CardPlaceholder from "@/components/cardPlaceholder";
import AddProductButton from "@/components/forms/addProductButton";
import { ALL_PRODUCT_TYPES } from "@/types";
import { useLocalStorage, useProducts } from "@/hooks";
import styles from "./index.module.css";

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
    <div className={styles.page}>
      <div className={styles.page__header}>
        {/* TODO(1.5): вынести в словари next-intl */}
        <div>
          <h1 className={styles.page__title}>Продукты</h1>
          <p className={styles.page__subtitle}>
            {isLoading
              ? "Загрузка…"
              : `Показано ${filteredProducts.length} из ${products.length}`}
          </p>
        </div>
        <AddProductButton />
      </div>

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between gap-3"
          role="alert"
        >
          {/* TODO(1.5): вынести в словари next-intl */}
          <span>Не удалось загрузить продукты: {error.message}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger flex-shrink-0"
            onClick={refetch}
          >
            Повторить
          </button>
        </div>
      )}

      <div className={styles.filter}>
        <SelectCustom
          products={products}
          value={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      {isLoading ? (
        <div className="d-flex flex-column gap-3">
          {placeholders.map((_, index) => (
            <CardPlaceholder key={`placeholder-${index}`} />
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductsCard key={product.id} product={product} />
            ))
          ) : (
            // TODO(1.5): вынести в словари next-intl
            <div className="alert alert-info mb-0">
              Продуктов по этому фильтру нет
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
