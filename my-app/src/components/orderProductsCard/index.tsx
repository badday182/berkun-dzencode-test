import {
  setSelectedOrderId,
  toggleAsideContainer,
} from "@/lib/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { productsData } from "@/base/app";
import clsx from "clsx";

import styles from "./index.module.css";
import ProductCard from "../productsCard";

const OrderProductsCard = () => {
  const dispatch = useAppDispatch();
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  const selectedOrderId = useAppSelector(
    (state) => state.orders.selectedOrderId
  );
  const selectedOrderTitle = useAppSelector(
    (state) => state.orders.selectedOrderTitle
  );

  const filteredProducts = productsData.filter(
    (product) => String(product.order) === selectedOrderId
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
        {selectedOrderId && (
          <div>
            <div className="product-list gap-3 d-flex flex-column">
              <h5 className="mb-3">{selectedOrderTitle}</h5>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <>
                    <ProductCard key={product.id} product={product} />
                  </>
                ))
              ) : (
                <p>No products found for this order.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProductsCard;
