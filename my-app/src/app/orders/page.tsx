"use client";

import { useEffect, useState } from "react";
import {
  toggleAsideContainer,
  setSelectedOrderId,
  setSelectedOrderTitle,
} from "@/lib/features/orders/ordersSlice";
import { formatDate, formatDateShort } from "@/utils/formatDate";
import getOrderStats from "@/utils/getOrderStats";
import { ordersData, productsData } from "@/base/app";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import OrderCard from "@/components/orderCard";
import clsx from "clsx";
import { motion } from "framer-motion";

import styles from "./index.module.css";
import OrderProductsCard from "@/components/orderProductsCard";
import {
  setOrders,
  setProducts,
} from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import CardPlaceholder from "@/components/cardPlaceholder";

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const orders = useAppSelector((state) => state.ordersAndProductsData.orders);
  const products = useAppSelector(
    (state) => state.ordersAndProductsData.products
  );

  const dispatch = useAppDispatch();
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  const selectedOrderId = useAppSelector(
    (state) => state.orders.selectedOrderId
  );
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
  }, [dispatch]);

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
      <h1 className="mb-4">Orders</h1>
      <div className="container mt-3 d-flex flex-row">
        <div className={clsx("flex-grow-1", { orders: isOpenAsideContainer })}>
          <div>
            {loading ? (
              <div className="container mt-3 d-flex flex-column gap-3">
                {placeholders.map((_, index) => (
                  <CardPlaceholder key={`placeholder-${index}`} />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {orders.map((order) => {
                  const { productsCount, priceUSD, priceUAH } = getOrderStats(
                    order.id,
                    products
                  );
                  return (
                    <motion.div
                      className="container mb-3"
                      key={order.id}
                      variants={itemVariants}
                    >
                      <OrderCard
                        key={order.id}
                        orderId={String(order.id)}
                        title={order.title}
                        productsCount={productsCount}
                        date={formatDate(order.date)}
                        dateShort={formatDateShort(order.date)}
                        priceUSD={priceUSD}
                        priceUAH={priceUAH}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>

        <OrderProductsCard />
      </div>
    </div>
  );
};

export default Orders;
