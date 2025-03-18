interface OrderCardProps {
  title: string;
  productsCount: number;
  date: string;
  priceUSD: number;
  priceUAH: number;
}

const OrderCard: React.FC<OrderCardProps> = ({
  title,
  productsCount,
  date,
  priceUSD,
  priceUAH,
}) => {
  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title">{title}</h5>
            <div>
              <span className="fw-semibold">{productsCount}</span>
              <span className="text-muted">{` Продукта`}</span>
            </div>
            <div className="text-muted">{date}</div>
            <div className="d-flex flex-column align-items-center">
              <div className="text-muted fs-6">{priceUSD} USD</div>
              <div className="text-muted fw-medium fs-5">{priceUAH} UAH</div>
            </div>
            <button className="btn btn-sm">
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
