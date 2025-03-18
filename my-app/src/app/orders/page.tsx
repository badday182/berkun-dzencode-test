"use client";

import { useEffect, useState } from "react";
import OrderCard from "@public/components/orderCard";
import { formatDate, formatDateShort } from "@public/utils/formatDate";
import getOrderStats from "@public/utils/getOrderStats";
import { Order, Product } from "@public/types";
import { ordersData, productsData } from "@public/base/app";

import styles from "./index.module.css";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOpenAsideContainer, setIsOpenAsideContainer] =
    useState<boolean>(false);

  useEffect(() => {
    // In a real application need fetch data
    // This is a demonstration
    const fetchData = async () => {
      try {
        // Simulating fetching the data

        // const ordersData = [
        // ];
        // const productsData = [
        // ];

        setOrders(ordersData);
        setProducts(productsData);
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
        <div className={`${isOpenAsideContainer ? "w-50" : ""}`}>
          <div>
            {orders.map((order) => {
              const { productsCount, priceUSD, priceUAH } = getOrderStats(
                order.id,
                products
              );
              return (
                <div
                  className="container mb-3"
                  onClick={() => setIsOpenAsideContainer(true)}
                >
                  <OrderCard
                    key={order.id}
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
        <div
          className={`${isOpenAsideContainer ? "w-50" : "d-none"} ${
            styles.asideContainer
          }`}
        ></div>
      </div>
    </div>
  );
};

export default Orders;
