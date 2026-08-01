"use client";

import { useEffect, useState } from "react";
import { formatDate, formatDateShort } from "@/utils/formatDate";
import getOrderStats from "@/utils/getOrderStats";
import { ordersData, productsData } from "@/mocks";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import OrderCard from "@/components/orderCard";
import clsx from "clsx";

import OrderProductsCard from "@/components/orderProductsCard";
import {
  setOrders,
  setProducts,
} from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import CardPlaceholder from "@/components/cardPlaceholder";

const PLACEHOLDER_COUNT = 8;

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
  }, [dispatch]);

  const placeholders = Array.from({ length: PLACEHOLDER_COUNT });

  return (
    <div className="container">
      <h1 className="mb-4">Orders</h1>
      <div className="container mt-3 d-flex flex-row">
        {/* TODO(1.4): класс `orders` — литеральная строка, а не класс CSS-модуля,
            поэтому ширина 30% из index.module.css никогда не применялась.
            Разбирается вместе с раскладкой при вводе сайдбара. */}
        <div className={clsx("flex-grow-1", { orders: isOpenAsideContainer })}>
          <div>
            {loading ? (
              <div className="container mt-3 d-flex flex-column gap-3">
                {placeholders.map((_, index) => (
                  <CardPlaceholder key={`placeholder-${index}`} />
                ))}
              </div>
            ) : (
              orders.map((order) => {
                const { productsCount, priceUSD, priceUAH } = getOrderStats(
                  order.id,
                  products
                );
                return (
                  <div className="container mb-3" key={order.id}>
                    <OrderCard
                      orderId={order.id}
                      title={order.title}
                      productsCount={productsCount}
                      date={formatDate(order.date)}
                      dateShort={formatDateShort(order.date)}
                      priceUSD={priceUSD}
                      priceUAH={priceUAH}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <OrderProductsCard />
      </div>
    </div>
  );
};

export default Orders;
