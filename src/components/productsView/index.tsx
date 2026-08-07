"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import ProductsCard from "../productsCard";
import SelectCustom, { type ProductTypeFilter } from "../select";
import CardPlaceholder from "../cardPlaceholder";
import AddProductButton from "../forms/addProductButton";
import { ALL_PRODUCT_TYPES } from "@/types";
import { useLocalStorage, useProducts } from "@/hooks";
import styles from "./index.module.css";

const PLACEHOLDER_COUNT = 8;

/** Ключ в localStorage: выбранный фильтр переживает перезагрузку страницы. */
const TYPE_FILTER_KEY = "products:type-filter";

/**
 * Клиентский остров страницы продуктов: фильтр, форма добавления, удаление.
 *
 * Данные при серверном рендере уже лежат в сторе (их кладёт `StoreHydrator`),
 * поэтому `useProducts` здесь ничего не запрашивает — `condition` внутри
 * thunk'а видит статус `succeeded`. Если сервер до API не достучался, остров
 * сходит за данными сам: страница деградирует до прежнего поведения.
 */
const ProductsView = () => {
  const t = useTranslations();
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
        <div>
          <h1 className={styles.page__title}>{t("products.title")}</h1>
          <p className={styles.page__subtitle}>
            {isLoading
              ? t("products.loading")
              : t("products.shown", {
                  shown: filteredProducts.length,
                  total: products.length,
                })}
          </p>
        </div>
        <AddProductButton />
      </div>

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between gap-3"
          role="alert"
        >
          <span>{t("products.loadError", { message: error.message })}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger flex-shrink-0"
            onClick={refetch}
          >
            {t("common.retry")}
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
            <div className="alert alert-info mb-0">{t("products.empty")}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsView;
