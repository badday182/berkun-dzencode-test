import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import styles from "./index.module.css";

interface OrderCardProps {
  title: string;
  productsCount: number;
  date: string;
  dateShort: string;
  priceUSD: number;
  priceUAH: number;
}

const OrderCard: React.FC<OrderCardProps> = ({
  title,
  productsCount,
  date,
  dateShort,
  priceUSD,
  priceUAH,
}) => {
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  return (
    <div className={`card shadow-sm ${styles.card}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center gap-5">
          <div
            className={`d-flex flex-grow-1 justify-content-between align-items-center gap-5 ${styles.cardContent}`}
          >
            <h5 className="card-title flex-grow-1 m-0">{title}</h5>
            <div className="flex-shrink-0">
              <span className="fw-semibold">{productsCount}</span>
              <span className="text-muted">{` Продукта`}</span>
            </div>
            <div className="d-flex flex-column align-items-center flex-shrink-0">
              <div className="text-muted">{dateShort}</div>
              <div className="text-muted fs-5">{date}</div>
            </div>
            <div className="d-flex flex-column">
              <div className="text-muted fs-6">{priceUSD} USD</div>
              <div className="text-muted fw-medium fs-5">{priceUAH} UAH</div>
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

export default OrderCard;
