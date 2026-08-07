"use client";

import { Currency, findPrice, type Product } from "@/types";
import styles from "./index.module.css";
import { useAppSelector } from "@/lib/hooks";
import { useConfirm } from "@/hooks";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { formatDateOnly } from "@/utils/formatDate";
import ModalWindow from "../modalWindow";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const confirmDelete = useConfirm();
  const t = useTranslations("products");
  const locale = useLocale();

  const orders = useAppSelector((state) => state.ordersAndProductsData.orders);
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  const pathname = usePathname();

  const usdPrice = findPrice(product.price, Currency.USD);
  const uahPrice = findPrice(product.price, Currency.UAH);

  // TODO(2.1): форматировать в UTC, иначе SSR даст hydration mismatch
  const guaranteeStartDate = formatDateOnly(product.guarantee.start, locale);
  const guaranteeEndDate = formatDateOnly(product.guarantee.end, locale);

  // Приход может быть ещё не загружен — тогда показывать нечего, и пустая
  // строка честнее выдуманного «Default Order».
  const orderTitle =
    orders.find((order) => order.id === product.order)?.title ?? "";

  return (
    <>
      <div className={`card shadow-sm flex-grow-1 ${styles.card}`}>
        <div className={clsx("card-body gap-5", styles.card__body)}>
          <div className={clsx("gap-5", styles.card__content)}>
            <h5 className={clsx("card-title", styles.card__title)}>
              {product.title}
            </h5>
            <span
              className={clsx(
                "badge bg-secondary",
                styles.card__type,
                styles._wordWrap
              )}
            >
              {product.type}
            </span>

            <div className={styles.guarantee}>
              <div>
                <span className="text-muted">{t("guaranteeFrom")} </span>
                <span className="text-muted">{guaranteeStartDate}</span>
              </div>
              <div>
                <span className="text-muted">{t("guaranteeTo")} </span>
                <span className="text-muted fs-6">{guaranteeEndDate}</span>
              </div>
            </div>

            <div className={styles.price}>
              <div className="text-muted fs-6">{usdPrice?.value} USD</div>
              <div className="text-muted fw-medium fs-5">
                {uahPrice?.value} UAH
              </div>
            </div>

            <div
              className={clsx(
                "text-muted",
                styles.card__orderTitle,
                styles._wordWrap,
                styles._smallFontSize,
                {
                  "d-none": isOpenAsideContainer && pathname === "/orders",
                }
              )}
            >
              {orderTitle}
            </div>
          </div>

          <button
            className={clsx("btn btn-sm", styles.deleteButton)}
            onClick={confirmDelete.open}
          >
            <i
              className={`bi bi-trash ${styles.icon} ${styles.deleteButton__icon}`}
            ></i>
          </button>
        </div>
      </div>
      {confirmDelete.isOpen && (
        <ModalWindow
          isOpen={confirmDelete.isOpen}
          onClose={confirmDelete.close}
          title={t("deleteTitle", { title: product.title })}
          category="product"
          id={product.id}
        />
      )}
    </>
  );
};

export default ProductCard;
