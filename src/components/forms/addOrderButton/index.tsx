"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import Modal from "@/components/modal";
import { useConfirm } from "@/hooks";
import FormLoading from "../formLoading";

/**
 * Кнопка «Добавить приход» вместе с окном формы.
 *
 * Форма подгружается отдельным чанком: Formik с Yup весят заметно больше самой
 * формы, а нужны они только тому, кто нажал кнопку. `ssr: false` — потому что
 * форма всё равно появляется по клику, серверный рендер ей ни к чему.
 */
const OrderForm = dynamic(() => import("../orderForm"), {
  ssr: false,
  loading: () => <FormLoading />,
});

const AddOrderButton = () => {
  const modal = useConfirm();
  const t = useTranslations("orders");

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={modal.open}>
        <i className="bi bi-plus-lg me-2" aria-hidden="true" />
        {t("add")}
      </button>

      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          onClose={modal.close}
          title={t("addTitle")}
        >
          <OrderForm onSuccess={modal.close} onCancel={modal.close} />
        </Modal>
      )}
    </>
  );
};

export default AddOrderButton;
