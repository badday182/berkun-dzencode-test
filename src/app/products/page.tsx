"use client";

import ProductsCard from "@/components/productsCard";
import { fetchProducts } from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useMemo, useState } from "react";
import SelectCustom, { type ProductTypeFilter } from "@/components/select";
import CardPlaceholder from "@/components/cardPlaceholder";
import { ALL_PRODUCT_TYPES, isPendingStatus } from "@/types";

const PLACEHOLDER_COUNT = 8;

const Products = () => {
  const [selectedType, setSelectedType] =
    useState<ProductTypeFilter>(ALL_PRODUCT_TYPES);
  const products = useAppSelector(
    (state) => state.ordersAndProductsData.products
  );
  const status = useAppSelector(
    (state) => state.ordersAndProductsData.productsStatus
  );
  const error = useAppSelector(
    (state) => state.ordersAndProductsData.productsError
  );

  const filteredProducts = useMemo(
    () =>
      selectedType === ALL_PRODUCT_TYPES
        ? products
        : products.filter((product) => product.type === selectedType),
    [products, selectedType]
  );

  const dispatch = useAppDispatch();
  useEffect(() => {
    // Приходы этой странице не нужны: она показывает плоский каталог.
    // Раньше грузились оба списка просто потому, что эффект был скопирован.
    void dispatch(fetchProducts());
  }, [dispatch]);

  const handleTypeChange = (type: ProductTypeFilter) => {
    setSelectedType(type);
  };

  const placeholders = Array.from({ length: PLACEHOLDER_COUNT });

  return (
    <div className="container">
      <h1 className="mb-4">Products</h1>
      {/* TODO(1.5): вынести в словари next-intl */}
      {error && (
        <div className="alert alert-danger" role="alert">
          Не удалось загрузить продукты: {error.message}
        </div>
      )}
      <SelectCustom products={products} onTypeChange={handleTypeChange} />
      {isPendingStatus(status) ? (
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
            <div className="alert alert-info">No products available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
