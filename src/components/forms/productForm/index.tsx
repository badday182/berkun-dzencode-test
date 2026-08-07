"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
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

// TODO(1.5): сообщения валидации — через t() из next-intl
const REQUIRED = "Обязательное поле";

const validationSchema = Yup.object({
  title: Yup.string().trim().min(2, "Не короче 2 символов").required(REQUIRED),
  type: Yup.string().trim().required(REQUIRED),
  serialNumber: Yup.number()
    .typeError("Только цифры")
    .integer("Целое число")
    .positive("Больше нуля")
    .required(REQUIRED),
  isNew: Yup.number().oneOf([ProductCondition.Used, ProductCondition.New]),
  photo: Yup.string().trim().required(REQUIRED),
  specification: Yup.string().trim().max(300, "Не длиннее 300 символов"),
  order: Yup.number().typeError("Выберите приход").required("Выберите приход"),
  date: Yup.string().required(REQUIRED),
  guaranteeStart: Yup.string().required(REQUIRED),
  guaranteeEnd: Yup.string()
    .required(REQUIRED)
    .test(
      "after-start",
      "Конец гарантии раньше начала",
      (value, context) =>
        !value ||
        !context.parent.guaranteeStart ||
        value >= context.parent.guaranteeStart
    ),
  priceUSD: Yup.number()
    .typeError("Только цифры")
    .min(0, "Не может быть отрицательной")
    .required(REQUIRED),
  priceUAH: Yup.number()
    .typeError("Только цифры")
    .min(0, "Не может быть отрицательной")
    .required(REQUIRED),
});

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
  const { orders } = useOrders();
  const [serverError, setServerError] = useState<string | null>(null);

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
          {/* TODO(1.5): подписи вынести в словари next-intl */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-title">
                Название
              </label>
              <Field
                id="product-title"
                name="title"
                className="form-control"
                placeholder="Монитор Dell U2720Q"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-type">
                Тип
              </label>
              <Field
                id="product-type"
                name="type"
                className="form-control"
                placeholder="Мониторы"
              />
              <ErrorMessage
                name="type"
                component="div"
                className="form-text text-danger"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-serial">
                Серийный номер
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
                Состояние
              </label>
              <Field
                id="product-condition"
                name="isNew"
                as="select"
                className="form-select"
              >
                <option value={ProductCondition.New}>Новый</option>
                <option value={ProductCondition.Used}>Б/у</option>
              </Field>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="product-order">
                Приход
              </label>
              <Field
                id="product-order"
                name="order"
                as="select"
                className="form-select"
              >
                <option value="">— выберите приход —</option>
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
                Дата поступления
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
                Гарантия с
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
                Гарантия по
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
                Цена, USD
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
                Цена, UAH
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
                Файл фотографии
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
                Характеристики
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
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !isValid || !dirty}
            >
              {isSubmitting ? "Сохранение…" : "Сохранить"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;
