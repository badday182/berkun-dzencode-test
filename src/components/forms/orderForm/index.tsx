"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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

const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESCRIPTION_MAX = 500;

const OrderForm: React.FC<OrderFormProps> = ({ onSuccess, onCancel }) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);

  // Схема строится внутри компонента: сообщения переводятся, а `t` доступна
  // только из хука. `useMemo` держит ссылку стабильной между рендерами —
  // иначе Formik считал бы схему новой на каждый ввод символа.
  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string()
          .trim()
          .min(TITLE_MIN, t("validation.minLength", { count: TITLE_MIN }))
          .max(TITLE_MAX, t("validation.maxLength", { count: TITLE_MAX }))
          .required(t("validation.titleRequired")),
        date: Yup.string().required(t("validation.dateRequired")),
        description: Yup.string()
          .trim()
          .max(
            DESCRIPTION_MAX,
            t("validation.maxLength", { count: DESCRIPTION_MAX })
          )
          .required(t("validation.descriptionRequired")),
      }),
    [t]
  );

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
          <div className="mb-3">
            <label className="form-label" htmlFor="order-title">
              {t("orderForm.title")}
            </label>
            <Field
              id="order-title"
              name="title"
              className="form-control"
              placeholder={t("orderForm.titlePlaceholder")}
            />
            <ErrorMessage
              name="title"
              component="div"
              className="form-text text-danger"
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="order-date">
              {t("orderForm.date")}
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
              {t("orderForm.description")}
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
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              // Нетронутая или невалидная форма отправляться не должна, и
              // повторный клик по «Сохранить» тоже: запрос уже в пути.
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

export default OrderForm;
