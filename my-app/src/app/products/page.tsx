"use client";

import ProductsCard from "@/components/productsCard";
import {
  setOrders,
  setProducts,
} from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { ordersData, productsData } from "@/base/app";
import SelectCustom from "@/components/select";

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const orders = useAppSelector((state) => state.ordersAndProductsData.orders);
  const products = useAppSelector(
    (state) => state.ordersAndProductsData.products
  );

  // Filter products by selected type
  const filteredProducts =
    selectedType === "all"
      ? products
      : products?.filter((product) => product.type === selectedType);

  const dispatch = useAppDispatch();
  useEffect(() => {
    // In a real application need fetch data
    // This is a demonstration
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

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  return (
    <div className="container">
      <h1 className="mb-4">Products</h1>
      <SelectCustom products={products} onTypeChange={handleTypeChange} />
      {loading ? (
        <div className="text-center">Loading products...</div>
      ) : (
        <div className="container mt-3 d-flex flex-column gap-3">
          {filteredProducts && filteredProducts.length > 0 ? (
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
