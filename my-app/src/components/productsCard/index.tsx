"use client";

import { Currency, findPrice, type Product } from "@/types";
import styles from "./index.module.css";
import { useAppSelector } from "@/lib/hooks";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ModalWindow from "../modalWindow";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [showModal, setShowModal] = useState(false);

  const orders = useAppSelector((state) => state.ordersAndProductsData.orders);
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  const pathname = usePathname();

  const usdPrice = findPrice(product.price, Currency.USD);
  const uahPrice = findPrice(product.price, Currency.UAH);

  // TODO(2.1): форматировать в UTC, иначе SSR даст hydration mismatch
  const guaranteeStartDate = new Date(
    product.guarantee.start
  ).toLocaleDateString();
  const guaranteeEndDate = new Date(product.guarantee.end).toLocaleDateString();

  const orderTitle =
    orders.find((order) => order.id === product.order)?.title ??
    "Default Order";

  const handleOpenModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className={`card shadow-sm flex-grow-1 ${styles.card}`}>
        <div className={clsx("card-body gap-5", styles.card__body)}>
          <div className={clsx("gap-5", styles.card__content)}>
            <h5 className={clsx("card-title", styles.card__title)}>
              {product.title}
            </h5>
            <span
              className={clsx(
                "badge bg-secondary",
                styles.card__type,
                styles._wordWrap
              )}
            >
              {product.type}
            </span>

            <div className={styles.guarantee}>
              <div>
                <span className="text-muted">с: </span>
                <span className="text-muted">{guaranteeStartDate}</span>
              </div>
              <div>
                <span className="text-muted">по: </span>
                <span className="text-muted fs-6">{guaranteeEndDate}</span>
              </div>
            </div>

            <div className={styles.price}>
              <div className="text-muted fs-6">{usdPrice?.value} USD</div>
              <div className="text-muted fw-medium fs-5">
                {uahPrice?.value} UAH
              </div>
            </div>

            <div
              className={clsx(
                "text-muted",
                styles.card__orderTitle,
                styles._wordWrap,
                styles._smallFontSize,
                {
                  "d-none": isOpenAsideContainer && pathname === "/orders",
                }
              )}
            >
              {orderTitle}
            </div>
          </div>

          <button
            className={clsx("btn btn-sm", styles.deleteButton)}
            onClick={handleOpenModal}
          >
            <i
              className={`bi bi-trash ${styles.icon} ${styles.deleteButton__icon}`}
            ></i>
          </button>
        </div>
      </div>
      {showModal && (
        <ModalWindow
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Удалить продукт "${product.title}"?`}
          category="product"
          id={product.id}
        />
      )}
    </>
  );
};

export default ProductCard;
