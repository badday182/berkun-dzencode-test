"use client";

import { useEffect, useState } from "react";
import OrderCard from "@public/components/orderCard";
import formatDate from "@public/utils/formatDate";
import getOrderStats from "@public/utils/getOrderStats";
import { Order, Product } from "@public/types";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would import or fetch this data
    // This is a simplified version to demonstrate the concept
    const fetchData = async () => {
      try {
        // Simulating fetching the data from app.js
        const ordersData = [
          {
            id: 1,
            title: "Order 1",
            date: "2017-06-29 12:09:33",
            description: "desc",
          },
          {
            id: 2,
            title: "Order 2",
            date: "2018-05-21 12:09:33",
            description: "desc",
          },
          {
            id: 3,
            title: "Order 3",
            date: "2019-04-10 12:09:33",
            description: "desc",
          },
        ];

        const productsData = [
          {
            id: 1,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 100, symbol: "USD", isDefault: 0 },
              { value: 2600, symbol: "UAH", isDefault: 1 },
            ],
            order: 1,
            date: "2017-06-29 12:09:33",
          },
          {
            id: 2,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 100, symbol: "USD", isDefault: 0 },
              { value: 2600, symbol: "UAH", isDefault: 1 },
            ],
            order: 1,
            date: "2017-06-29 12:09:33",
          },
          {
            id: 3,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 100, symbol: "USD", isDefault: 0 },
              { value: 2600, symbol: "UAH", isDefault: 1 },
            ],
            order: 1,
            date: "2017-06-29 12:09:33",
          },
          {
            id: 4,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 45, symbol: "USD", isDefault: 0 },
              { value: 1800, symbol: "UAH", isDefault: 1 },
            ],
            order: 2,
            date: "2017-06-29 12:09:33",
          },
          {
            id: 5,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 5, symbol: "USD", isDefault: 0 },
              { value: 40, symbol: "UAH", isDefault: 1 },
            ],
            order: 2,
            date: "2017-06-29 12:09:33",
          },
          {
            id: 6,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 45, symbol: "USD", isDefault: 0 },
              { value: 555, symbol: "UAH", isDefault: 1 },
            ],
            order: 2,
            date: "2017-06-29 12:09:33",
          },
          {
            id: 7,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 3, symbol: "USD", isDefault: 0 },
              { value: 150, symbol: "UAH", isDefault: 1 },
            ],
            order: 3,
            date: "2017-06-29 12:09:33",
          },
          {
            id: 8,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 2, symbol: "USD", isDefault: 0 },
              { value: 100, symbol: "UAH", isDefault: 1 },
            ],
            order: 3,
            date: "2017-06-29 12:09:33",
          },
          {
            id: 9,
            serialNumber: 1234,
            isNew: 1,
            photo: "pathToFile.jpg",
            title: "Product 1",
            type: "Monitors",
            specification: "Specification 1",
            guarantee: {
              start: "2017-06-29 12:09:33",
              end: "2017-06-29 12:09:33",
            },
            price: [
              { value: 1, symbol: "USD", isDefault: 0 },
              { value: 50, symbol: "UAH", isDefault: 1 },
            ],
            order: 3,
            date: "2017-06-29 12:09:33",
          },
        ];

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
          <OrderCard
            key={order.id}
            title={order.title}
            productsCount={productsCount}
            date={formatDate(order.date)}
            priceUSD={priceUSD}
            priceUAH={priceUAH}
          />
        );
      })}
    </div>
  );
};

export default Orders;
