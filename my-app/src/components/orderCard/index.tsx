import { OrderCardProps } from "@/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useState } from "react";
import ModalWindow from "../modalWindow";
import styles from "./index.module.css";
import {
  setSelectedOrderId,
  setSelectedOrderTitle,
  toggleAsideContainer,
} from "@/lib/features/orders/ordersSlice";

const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  title,
  productsCount,
  date,
  dateShort,
  priceUSD,
  priceUAH,
}) => {
  const [showModal, setShowModal] = useState(false);
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  const selectedOrderId = useAppSelector(
    (state) => state.orders.selectedOrderId
  );

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const dispatch = useAppDispatch();
  return (
    <>
      <div
        className={`card shadow-sm d-flex flex-row justify-content-between align-items-center ${styles.card}`}
      >
        <div
          className={`card-body ${styles.cardContent}`}
          onClick={() => {
            dispatch(toggleAsideContainer(true));
            dispatch(setSelectedOrderId(String(orderId)));
            dispatch(setSelectedOrderTitle(String(title)));
          }}
        >
          <div className="d-flex justify-content-between align-items-center gap-5">
            <div
              className={`d-flex flex-grow-1 justify-content-between align-items-center gap-5`}
            >
              {!isOpenAsideContainer && (
                <h5 className="card-title flex-grow-1 m-0">{title}</h5>
              )}
              <div className="flex-shrink-0">
                <span className="fw-semibold">{productsCount}</span>
                <span className="text-muted">{` Продукта`}</span>
              </div>
              <div className="d-flex flex-column align-items-center flex-shrink-0">
                <div className="text-muted">{dateShort}</div>
                <div className="text-muted fs-5">{date}</div>
              </div>
              {!isOpenAsideContainer && (
                <div className="d-flex flex-column">
                  <div className="text-muted fs-6">{priceUSD} USD</div>
                  <div className="text-muted fw-medium fs-5">
                    {priceUAH} UAH
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedOrderId === orderId ? (
          <i className="bi bi-play-fill text-info fs-4 pe-2"></i>
        ) : (
          <button className="btn btn-sm" onClick={handleOpenModal}>
            <i className={`bi bi-trash pe-2 ${styles.icon}`}></i>
          </button>
        )}
      </div>

      {showModal && (
        <ModalWindow
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Удалить заказ "${title}"?`}
          category="order"
          id={orderId}
        />
      )}
    </>
  );
};

export default OrderCard;
