"use client";

import { Product } from "@/types";
import styles from "./index.module.css";
import { useAppSelector } from "@/lib/hooks";
import clsx from "clsx";
import { usePathname } from "next/navigation";
const defaultProduct: Product = {
  id: 0,
  serialNumber: 7777777777,
  isNew: 1,
  photo: "",
  title: "Default Product",
  type: "Default",
  specification: "",
  guarantee: {
    start: new Date().toISOString(),
    end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  price: [
    { value: 0, symbol: "USD", isDefault: 0 },
    { value: 0, symbol: "UAH", isDefault: 1 },
  ],
  order: 0,
  date: new Date().toISOString(),
};

const ProductCard: React.FC<{ product?: Product }> = ({
  product = defaultProduct,
}) => {
  // Extract the default price (UAH) and USD price
  //   const defaultPrice = product.price.find((p) => p.isDefault === 1);
  const usdPrice = product.price.find((p) => p.symbol === "USD");
  const uahPrice = product.price.find((p) => p.symbol === "UAH");

  // Format the dates for display
  const guaranteeStartDate = new Date(
    product.guarantee.start
  ).toLocaleDateString();
  const guaranteeEndDate = new Date(product.guarantee.end).toLocaleDateString();
  // const receiptDate = new Date(product.date).toLocaleDateString();

  const orders = useAppSelector((state) => state.ordersAndProductsData.orders);

  const orderTitle =
    orders.find((order) => order.id === product.order)?.title ||
    "Default Order";

  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  const pathname = usePathname();
  return (
    <div className={`card shadow-sm flex-grow-1 ${styles.card}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center gap-5">
          <div
            className={`d-flex flex-grow-1 justify-content-between align-items-center gap-5 ${styles.cardContent}`}
          >
            <div className="d-flex justify-content-between align-items-center gap-3 flex-grow-1">
              <h5 className="card-title flex-grow-1 m-0">{product.title}</h5>
              <span
                className={`badge bg-secondary flex-shrink-0 ${styles.wordWrap}`}
              >
                {product.type}
              </span>
            </div>

            <div className="d-flex flex-column align-items-center flex-shrink-0">
              <div>
                <span className="text-muted">с: </span>
                <span className="text-muted">{guaranteeStartDate}</span>
              </div>
              <div>
                <span className="text-muted">по: </span>
                <span className="text-muted fs-6">{guaranteeEndDate}</span>
              </div>
            </div>

            <div className="d-flex flex-column flex-shrink-0">
              <div className="d-flex flex-column">
                <div className="text-muted fs-6">{usdPrice?.value} USD</div>
                <div className="text-muted fw-medium fs-5">
                  {uahPrice?.value} UAH
                </div>
              </div>
            </div>

            <div
              className={clsx(
                "text-muted d-flex flex-column flex-shrink-0",
                styles.wordWrap,
                styles.smallFontSize,
                {
                  "d-none": isOpenAsideContainer && pathname === "/orders",
                }
              )}
            >
              {orderTitle}
            </div>
          </div>

          <button className="btn btn-sm">
            <i className={`bi bi-trash ${styles.icon}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
