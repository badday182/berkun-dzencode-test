"use client";

import {
  setSelectedOrderId,
  toggleAsideContainer,
} from "@/lib/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import clsx from "clsx";
import { useTranslations } from "next-intl";

import styles from "./index.module.css";
import ProductCard from "../productsCard";
import ModalWindow from "../modalWindow";
import { useConfirm } from "@/hooks";

const OrderProductsCard = () => {
  const confirmDelete = useConfirm();
  const t = useTranslations("orders");

  const dispatch = useAppDispatch();
  const products = useAppSelector(
    (state) => state.ordersAndProductsData.products
  );
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  const selectedOrderId = useAppSelector(
    (state) => state.orders.selectedOrderId
  );
  const selectedOrderTitle = useAppSelector(
    (state) => state.orders.selectedOrderTitle
  );

  const filteredProducts = products.filter(
    (product) => product.order === selectedOrderId
  );

  const closeModal = () => {
    dispatch(toggleAsideContainer(false));
    dispatch(setSelectedOrderId(null));
  };

  return (
    <>
      <div
        className={clsx("card shadow-sm position-relative", styles.card, {
          "d-none": !isOpenAsideContainer,
        })}
      >
        <div className="card-body">
          <i
            className={clsx(
              "bi bi-x-circle-fill text-danger opacity-75 fs-3 position-absolute top-0 start-100 translate-middle",
              styles.icon
            )}
            onClick={closeModal}
          ></i>
          {selectedOrderId !== null && (
            <div>
              <div className="product-list gap-3 d-flex flex-column">
                <div className="d-flex flex-row justify-content-between">
                  <h5 className="mb-3">{selectedOrderTitle}</h5>
                  <button className="btn btn-sm" onClick={confirmDelete.open}>
                    <i className={`bi bi-trash pe-2 ${styles.icon}`}></i>
                  </button>
                </div>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <p className="text-muted mb-0">{t("noProducts")}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {confirmDelete.isOpen && selectedOrderId !== null && (
        <ModalWindow
          isOpen={confirmDelete.isOpen}
          onClose={confirmDelete.close}
          title={t("deleteTitle", { title: selectedOrderTitle ?? "" })}
          category="order"
          id={selectedOrderId}
        />
      )}
    </>
  );
};

export default OrderProductsCard;
