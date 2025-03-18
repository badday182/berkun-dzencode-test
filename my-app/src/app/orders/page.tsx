import React from "react";

const orders = [
  {
    id: 1,
    title: "Order 1",
    date: "2017-06-29 12:09:33",
    description: "desc",
    products: [
      {
        id: 1,
        serialNumber: 1234,
        isNew: 1,
        photo: "pathToFile.jpg",
        title: "Product 1",
        type: "Monitors",
        specification: "Specification 1",
        guarantee: {
          start: "2016-06-29 12:09:33",
          end: "2017-06-29 12:09:33",
        },
        price: [
          { value: 100, symbol: "USD", isDefault: 0 },
          { value: 2600, symbol: "UAH", isDefault: 1 },
        ],
      },
    ],
  },
  // Add more orders as needed
];

const Orders = () => {
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

    // <div className="container mt-5">
    //   <h1>Orders</h1>
    //   {orders.map((order) => (
    //     <div key={order.id} className="card mb-3">
    //       <div className="card-header">
    //         <h2>{order.title}</h2>
    //         <p>{order.date}</p>
    //       </div>
    //       <div className="card-body">
    //         <p>{order.description}</p>
    //         <h3>Products</h3>
    //         <ul className="list-group">
    //           {order.products.map((product) => (
    //             <li key={product.id} className="list-group-item">
    //               <h4>{product.title}</h4>
    //               <p>Type: {product.type}</p>
    //               <p>Specification: {product.specification}</p>
    //               <p>
    //                 Price: {product.price.find((p) => p.isDefault).value}{" "}
    //                 {product.price.find((p) => p.isDefault).symbol}
    //               </p>
    //             </li>
    //           ))}
    //         </ul>
    //       </div>
    //     </div>
    //   ))}
    // </div>
  );
};

export default Orders;
