"use client";

import { useEffect, useState } from "react";
import OrderCard from "@public/components/orderCard";
import { formatDate, formatDateShort } from "@public/utils/formatDate";
import getOrderStats from "@public/utils/getOrderStats";
import { Order, Product } from "@public/types";
import { ordersData, productsData } from "@public/base/app";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      {orders.map((order) => {
        const { productsCount, priceUSD, priceUAH } = getOrderStats(
          order.id,
          products
        );
        return (
          <div className="container mt-3">
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
  );
};

export default Orders;
