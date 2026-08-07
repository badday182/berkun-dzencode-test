"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/lib/hooks";
import { addProduct } from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import { toApiError } from "@/services/api";
import { useOrders } from "@/hooks";
import {
  Currency,
  ProductCondition,
  toOrderId,
  type CreateProductDto,
} from "@/types";

export interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const toApiDate = (localValue: string): string =>
  `${localValue.replace("T", " ")}:00`;

const TITLE_MIN = 2;
const SPECIFICATION_MAX = 300;

/**
 * Плоские значения формы. Вложенность (`guarantee`, массив `price`) собирается
 * при отправке: в разметке поля всё равно плоские, а плоскую форму проще и
 * валидировать, и читать.
 */
interface ProductFormValues {
  title: string;
  type: string;
  serialNumber: string;
  isNew: string;
  photo: string;
  specification: string;
  order: string;
  date: string;
  guaranteeStart: string;
  guaranteeEnd: string;
  priceUSD: string;
  priceUAH: string;
}

const initialValues: ProductFormValues = {
  title: "",
  type: "",
  serialNumber: "",
  isNew: String(ProductCondition.New),
  photo: "pathToFile.jpg",
  specification: "",
  order: "",
  date: "",
  guaranteeStart: "",
  guaranteeEnd: "",
  priceUSD: "",
  priceUAH: "",
};

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel }) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const { orders } = useOrders();
  const [serverError, setServerError] = useState<string | null>(null);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string()
          .trim()
          .min(TITLE_MIN, t("validation.minLength", { count: TITLE_MIN }))
          .required(t("validation.required")),
        type: Yup.string().trim().required(t("validation.required")),
        serialNumber: Yup.number()
          .typeError(t("validation.digitsOnly"))
          .integer(t("validation.integer"))
          .positive(t("validation.positive"))
          .required(t("validation.required")),
        isNew: Yup.number().oneOf([
          ProductCondition.Used,
          ProductCondition.New,
        ]),
        photo: Yup.string().trim().required(t("validation.required")),
        specification: Yup.string()
          .trim()
          .max(
            SPECIFICATION_MAX,
            t("validation.maxLength", { count: SPECIFICATION_MAX })
          ),
        order: Yup.number()
          .typeError(t("validation.selectOrder"))
          .required(t("validation.selectOrder")),
        date: Yup.string().required(t("validation.required")),
        guaranteeStart: Yup.string().required(t("validation.required")),
        guaranteeEnd: Yup.string()
          .required(t("validation.required"))
          .test(
            "after-start",
            t("validation.guaranteeOrder"),
            // Строки `datetime-local` сравнимы лексикографически: формат
            // фиксированный, от старшего разряда к младшему.
            (value, context) =>
              !value ||
              !context.parent.guaranteeStart ||
              value >= context.parent.guaranteeStart
          ),
        priceUSD: Yup.number()
          .typeError(t("validation.digitsOnly"))
          .min(0, t("validation.notNegative"))
          .required(t("validation.required")),
        priceUAH: Yup.number()
          .typeError(t("validation.digitsOnly"))
          .min(0, t("validation.notNegative"))
          .required(t("validation.required")),
      }),
    [t]
  );

  const handleSubmit = async (values: ProductFormValues) => {
    setServerError(null);

    const dto: CreateProductDto = {
      serialNumber: Number(values.serialNumber),
      isNew:
        Number(values.isNew) === ProductCondition.New
          ? ProductCondition.New
          : ProductCondition.Used,
      photo: values.photo.trim(),
      title: values.title.trim(),
      type: values.type.trim(),
      specification: values.specification.trim(),
      guarantee: {
        start: toApiDate(values.guaranteeStart),
        end: toApiDate(values.guaranteeEnd),
      },
      price: [
        { value: Number(values.priceUSD), symbol: Currency.USD, isDefault: 0 },
        { value: Number(values.priceUAH), symbol: Currency.UAH, isDefault: 1 },
      ],
      order: toOrderId(Number(values.order)),
      date: toApiDate(values.date),
    };

    try {
      await dispatch(addProduct(dto)).unwrap();
      onSuccess();
    } catch (cause) {
      setServerError(toApiError(cause).message);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, dirty }) => (
        <Form noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-title">
                {t("productForm.title")}
              </label>
              <Field
                id="product-title"
                name="title"
                className="form-control"
                placeholder={t("productForm.titlePlaceholder")}
              />
              <ErrorMessage
                name="title"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-type">
                {t("productForm.type")}
              </label>
              <Field
                id="product-type"
                name="type"
                className="form-control"
                placeholder={t("productForm.typePlaceholder")}
              />
              <ErrorMessage
                name="type"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-serial">
                {t("productForm.serialNumber")}
              </label>
              <Field
                id="product-serial"
                name="serialNumber"
                type="number"
                className="form-control"
              />
              <ErrorMessage
                name="serialNumber"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-condition">
                {t("productForm.condition")}
              </label>
              <Field
                id="product-condition"
                name="isNew"
                as="select"
                className="form-select"
              >
                <option value={ProductCondition.New}>
                  {t("productForm.conditionNew")}
                </option>
                <option value={ProductCondition.Used}>
                  {t("productForm.conditionUsed")}
                </option>
              </Field>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-order">
                {t("productForm.order")}
              </label>
              <Field
                id="product-order"
                name="order"
                as="select"
                className="form-select"
              >
                <option value="">{t("productForm.orderPlaceholder")}</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.title}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="order"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-date">
                {t("productForm.date")}
              </label>
              <Field
                id="product-date"
                name="date"
                type="datetime-local"
                className="form-control"
              />
              <ErrorMessage
                name="date"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-guarantee-start">
                {t("productForm.guaranteeStart")}
              </label>
              <Field
                id="product-guarantee-start"
                name="guaranteeStart"
                type="datetime-local"
                className="form-control"
              />
              <ErrorMessage
                name="guaranteeStart"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-guarantee-end">
                {t("productForm.guaranteeEnd")}
              </label>
              <Field
                id="product-guarantee-end"
                name="guaranteeEnd"
                type="datetime-local"
                className="form-control"
              />
              <ErrorMessage
                name="guaranteeEnd"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-price-usd">
                {t("productForm.priceUSD")}
              </label>
              <Field
                id="product-price-usd"
                name="priceUSD"
                type="number"
                step="0.01"
                className="form-control"
              />
              <ErrorMessage
                name="priceUSD"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-price-uah">
                {t("productForm.priceUAH")}
              </label>
              <Field
                id="product-price-uah"
                name="priceUAH"
                type="number"
                step="0.01"
                className="form-control"
              />
              <ErrorMessage
                name="priceUAH"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="product-photo">
                {t("productForm.photo")}
              </label>
              <Field id="product-photo" name="photo" className="form-control" />
              {/* TODO(2.5): загрузка изображения и `next/image` вместо строки */}
              <ErrorMessage
                name="photo"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="product-specification">
                {t("productForm.specification")}
              </label>
              <Field
                id="product-specification"
                name="specification"
                as="textarea"
                rows={2}
                className="form-control"
              />
              <ErrorMessage
                name="specification"
                component="div"
                className="form-text text-danger"
              />
            </div>
          </div>

          {serverError && (
            <div className="alert alert-danger py-2 mt-3" role="alert">
              {serverError}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !isValid || !dirty}
            >
              {isSubmitting ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;
