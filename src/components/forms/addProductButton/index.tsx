"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import Modal from "@/components/modal";
import { useConfirm } from "@/hooks";
import FormLoading from "../formLoading";

const ProductForm = dynamic(() => import("../productForm"), {
  ssr: false,
  loading: () => <FormLoading />,
});

/** Кнопка «Добавить продукт». Форма шире, поэтому окно открывается большим. */
const AddProductButton = () => {
  const modal = useConfirm();
  const t = useTranslations("products");

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
          size="large"
        >
          <ProductForm onSuccess={modal.close} onCancel={modal.close} />
        </Modal>
      )}
    </>
  );
};

export default AddProductButton;
