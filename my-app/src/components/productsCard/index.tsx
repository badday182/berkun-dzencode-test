import { ProductCardProps } from "@/types";
import styles from "./index.module.css";

const ProductsCard: React.FC<ProductCardProps> = ({
  title = "Unknown Product",
  productType = "Unknown Type",
  guaranteeStartDate = "Unknown Date",
  guaranteeEndDate = "Unknown Date",
  priceUSD = "0",
  priceUAH = "0",
  date = "Unknown Receipt",
  order = 0,
}) => {
  return (
    <div className={`card shadow-sm flex-grow-1 ${styles.card}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center gap-5">
          <div
            className={`d-flex flex-grow-1 justify-content-between align-items-center gap-5 ${styles.cardContent}`}
          >
            <div className="d-flex justify-content-between align-items-center gap-3 flex-grow-1">
              <h5 className="card-title flex-grow-1 m-0">{title}</h5>
              <span className="badge bg-secondary flex-shrink-0">
                {productType}
              </span>
            </div>

            <div className="d-flex flex-column align-items-center flex-shrink-0">
              <div className="text-muted">Гарантия до:</div>
              <div className="text-muted">{guaranteeEndDate}</div>
              <div className="text-muted fs-6">({guaranteeStartDate})</div>
            </div>

            <div className="d-flex flex-column flex-shrink-0">
              <div className="text-muted fs-6">{priceUSD} USD</div>
              <div className="text-muted fw-medium fs-5">{priceUAH} UAH</div>
            </div>

            <div className="d-flex flex-column flex-shrink-0">
              <div className="text-muted">Приход:</div>
              <div className="fw-semibold">{date}</div>
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

export default ProductsCard;
