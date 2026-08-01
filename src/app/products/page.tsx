"use client";

import ProductsCard from "@/components/productsCard";
import {
  setOrders,
  setProducts,
} from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useMemo, useState } from "react";
import { ordersData, productsData } from "@/mocks";
import SelectCustom, { type ProductTypeFilter } from "@/components/select";
import CardPlaceholder from "@/components/cardPlaceholder";
import { ALL_PRODUCT_TYPES } from "@/types";

const PLACEHOLDER_COUNT = 8;

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] =
    useState<ProductTypeFilter>(ALL_PRODUCT_TYPES);
  const orders = useAppSelector((state) => state.ordersAndProductsData.orders);
  const products = useAppSelector(
    (state) => state.ordersAndProductsData.products
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
    // TODO(1.3): заменить на createAsyncThunk + axios, добавить состояние ошибки
    const fetchData = async () => {
      try {
        // Simulating fetching the data
        // Only dispatch if orders or products are empty/null
        if (!orders || orders.length === 0) {
          dispatch(setOrders(ordersData));
        }

        if (!products || products.length === 0) {
          dispatch(setProducts(productsData));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, orders, products]);

  const handleTypeChange = (type: ProductTypeFilter) => {
    setSelectedType(type);
  };

  const placeholders = Array.from({ length: PLACEHOLDER_COUNT });

  return (
    <div className="container">
      <h1 className="mb-4">Products</h1>
      <SelectCustom products={products} onTypeChange={handleTypeChange} />
      {loading ? (
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
