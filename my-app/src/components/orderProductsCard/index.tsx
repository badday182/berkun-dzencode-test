import {
  setSelectedOrderId,
  toggleAsideContainer,
} from "@/lib/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import clsx from "clsx";

import styles from "./index.module.css";
import ProductCard from "../productsCard";
import { useState } from "react";
import ModalWindow from "../modalWindow";

const OrderProductsCard = () => {
  const [showModal, setShowModal] = useState(false);

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
    (product) => String(product.order) === selectedOrderId
  );
  const closeModal = () => {
    dispatch(toggleAsideContainer(false));
    dispatch(setSelectedOrderId(null));
  };

  const handleOpenModal = () => {
    setShowModal(true);
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
            className="bi bi-x-circle-fill text-secondary fs-3 position-absolute top-0 start-100 translate-middle"
            onClick={closeModal}
          ></i>
          {selectedOrderId && (
            <div>
              <div className="product-list gap-3 d-flex flex-column">
                <div className="d-flex flex-row justify-content-between">
                  <h5 className="mb-3">{selectedOrderTitle}</h5>
                  <button className="btn btn-sm">
                    <i
                      className={`bi bi-trash pe-2 ${styles.icon}`}
                      onClick={handleOpenModal}
                    ></i>
                  </button>
                </div>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <p>No products found for this order.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <ModalWindow
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Удалить заказ "${selectedOrderTitle}"?`}
          category="order"
          id={selectedOrderId}
        />
      )}
    </>
  );
};

export default OrderProductsCard;
