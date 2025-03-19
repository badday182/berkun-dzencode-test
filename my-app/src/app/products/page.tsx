"use client";

import ProductsCard from "@/components/productsCard";
import {
  setOrders,
  setProducts,
} from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { ordersData, productsData } from "@/base/app";

const Products = () => {
  const [loading, setLoading] = useState(true);
  const orders = useAppSelector((state) => state.ordersAndProductsData.orders);
  const products = useAppSelector(
    (state) => state.ordersAndProductsData.products
  );

  const dispatch = useAppDispatch();
  useEffect(() => {
    // In a real application need fetch data
    // This is a demonstration
    const fetchData = async () => {
      try {
        // Simulating fetching the data
        dispatch(setOrders(ordersData));
        dispatch(setProducts(productsData));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <div className="container">
      <h1 className="mb-4">Products</h1>
      {loading ? (
        <div className="text-center">Loading products...</div>
      ) : (
        <div className="container mt-3 d-flex flex-column gap-3">
          {products && products.length > 0 ? (
            products.map((product) => (
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
