"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { addOrder } from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import { toApiError } from "@/services/api";
import type { CreateOrderDto } from "@/types";

export interface OrderFormProps {
  /** Закрыть окно после успешного создания. */
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Формат даты, который ждёт API: `2026-08-07 12:00:00`. Поле `datetime-local`
 * отдаёт `2026-08-07T12:00`, поэтому перед отправкой значение приводится.
 */
const toApiDate = (localValue: string): string =>
  `${localValue.replace("T", " ")}:00`;

// TODO(1.5): сообщения валидации — через t() из next-intl
const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, "Не короче 3 символов")
    .max(120, "Не длиннее 120 символов")
    .required("Укажите название"),
  date: Yup.string().required("Укажите дату"),
  description: Yup.string()
    .trim()
    .max(500, "Не длиннее 500 символов")
    .required("Добавьте описание"),
});

interface OrderFormValues {
  title: string;
  date: string;
  description: string;
}

const initialValues: OrderFormValues = {
  title: "",
  date: "",
  description: "",
};

const OrderForm: React.FC<OrderFormProps> = ({ onSuccess, onCancel }) => {
  const dispatch = useAppDispatch();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: OrderFormValues) => {
    setServerError(null);

    const dto: CreateOrderDto = {
      title: values.title.trim(),
      date: toApiDate(values.date),
      description: values.description.trim(),
    };

    try {
      // `unwrap` превращает `rejected` в исключение: без него форма закрылась
      // бы даже когда сервер отказал.
      await dispatch(addOrder(dto)).unwrap();
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
          <div className="mb-3">
            <label className="form-label" htmlFor="order-title">
              Название
            </label>
            <Field
              id="order-title"
              name="title"
              className="form-control"
              placeholder="Приход от поставщика"
            />
            <ErrorMessage
              name="title"
              component="div"
              className="form-text text-danger"
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="order-date">
              Дата
            </label>
            <Field
              id="order-date"
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

          <div className="mb-3">
            <label className="form-label" htmlFor="order-description">
              Описание
            </label>
            <Field
              id="order-description"
              name="description"
              as="textarea"
              rows={3}
              className="form-control"
            />
            <ErrorMessage
              name="description"
              component="div"
              className="form-text text-danger"
            />
          </div>

          {serverError && (
            <div className="alert alert-danger py-2" role="alert">
              {serverError}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
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
              // Нетронутая или невалидная форма отправляться не должна, и
              // повторный клик по «Сохранить» тоже: запрос уже в пути.
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

export default OrderForm;
