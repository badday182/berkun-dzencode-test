"use client";

import { useEffect, useState } from "react";
import OrderCard from "../../../public/components/orderCard";

const Orders = () => {
  const [orderData, setOrderData] = useState<{
    id: number;
    title: string;
    date: string;
    description: string;
  } | null>(null);
  const [orderProducts, setOrderProducts] = useState<
    {
      id: number;
      serialNumber: number;
      isNew: number;
      photo: string;
      title: string;
      type: string;
      specification: string;
      guarantee: {
        start: string;
        end: string;
      };
      price: {
        value: number;
        symbol: string;
        isDefault: number;
      }[];
      order: number;
      date: string;
    }[]
  >([]);
  const [totalPrices, setTotalPrices] = useState({ USD: 0, UAH: 0 });

  useEffect(() => {
    // In a real application, you would import or fetch this data
    // This is a simplified version to demonstrate the concept
    const fetchData = async () => {
      try {
        // Simulating fetching the data from app.js
        const orders = [
          {
            id: 1,
            title: "Order 1",
            date: "2017-06-29 12:09:33",
            description: "desc",
          },
          // Other orders...
        ];

        const products = [
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
        ];

        // Get the order with id: 1
        const targetOrder = orders.find((order) => order.id === 1);

        // Get products for this order (where order: 1)
        const orderProducts = products.filter((product) => product.order === 1);

        // Calculate total prices
        const totalPrices = orderProducts.reduce(
          (acc, product) => {
            product.price.forEach((price) => {
              if (price.symbol === "USD") acc.USD += price.value;
              if (price.symbol === "UAH") acc.UAH += price.value;
            });
            return acc;
          },
          { USD: 0, UAH: 0 }
        );

        setOrderData(targetOrder || null);
        setOrderProducts(orderProducts);
        setTotalPrices(totalPrices);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // If data is not loaded yet
  if (!orderData) return <div>Loading...</div>;

  // Format date: "DD / MMM / YYYY"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  return (
    <div className="container">
      <h1 className="mb-4">Orders</h1>
      <OrderCard
        title={orderData.title}
        productsCount={orderProducts.length}
        date={formatDate(orderData.date)}
        priceUSD={totalPrices.USD}
        priceUAH={totalPrices.UAH}
      />
    </div>
  );
};

export default Orders;
