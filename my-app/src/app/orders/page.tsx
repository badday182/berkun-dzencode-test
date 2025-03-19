"use client";

import { useEffect, useState } from "react";
import {
  toggleAsideContainer,
  setSelectedOrderId,
  setSelectedOrderTitle,
} from "@/lib/features/orders/ordersSlice";
import { formatDate, formatDateShort } from "@/utils/formatDate";
import getOrderStats from "@/utils/getOrderStats";
import { Order, Product } from "@/types";
import { ordersData, productsData } from "@/base/app";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import OrderCard from "@/components/orderCard";
import clsx from "clsx";

import styles from "./index.module.css";
import OrderProductsCard from "@/components/orderProductsCard";
import {
  setOrders,
  setProducts,
} from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";

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
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1 className="mb-4">Orders</h1>
      <div className="container mt-3 d-flex flex-row">
        <div className={clsx("flex-grow-1", { orders: isOpenAsideContainer })}>
          <div>
            {orders.map((order) => {
              const { productsCount, priceUSD, priceUAH } = getOrderStats(
                order.id,
                products
              );
              return (
                <div className="container mb-3" key={order.id}>
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
                </div>
              );
            })}
          </div>
        </div>

        <OrderProductsCard />
      </div>
    </div>
  );
};

export default Orders;
