const OrderCard = () => {
  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title">
              Длинное предлинное длиннючее название прихода
            </h5>
            <div>
              <span className="fw-semibold">23</span>
              <span className="text-muted">{` Продукта`}</span>
            </div>
            <div className="text-muted">06 / Апр / 2017</div>
            <div className="d-flex flex-column align-items-center">
              <div className="text-muted fs-6">100 USD</div>
              <div className="text-muted fw-medium fs-5">2600 UAH</div>
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
