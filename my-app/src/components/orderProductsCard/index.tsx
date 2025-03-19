import {
  setSelectedOrderId,
  toggleAsideContainer,
} from "@/lib/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import clsx from "clsx";

import styles from "./index.module.css";

const OrderProductsCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  return (
    <div
      className={clsx("card shadow-sm position-relative", styles.card, {
        "d-none": !isOpenAsideContainer,
      })}
    >
      <div className="card-body">
        <i
          className="bi bi-x-circle-fill text-secondary fs-3 position-absolute top-0 start-100 translate-middle"
          onClick={() => {
            dispatch(toggleAsideContainer(false));
            dispatch(setSelectedOrderId(null));
          }}
        ></i>
      </div>
    </div>
  );
};

export default OrderProductsCard;
