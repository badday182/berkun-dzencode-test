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
import CardPlaceholder from "@/components/cardPlaceholder";
import { motion } from "framer-motion";

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

  // Create array of 8 placeholders
  const placeholders = Array(8).fill(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

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
        <motion.div
          className="container mt-3 d-flex flex-column gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductsCard product={product} />
              </motion.div>
            ))
          ) : (
            <div className="alert alert-info">No products available</div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Products;
