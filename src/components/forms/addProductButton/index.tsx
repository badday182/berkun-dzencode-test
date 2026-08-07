"use client";

import dynamic from "next/dynamic";
import Modal from "@/components/modal";
import { useConfirm } from "@/hooks";

const ProductForm = dynamic(() => import("../productForm"), {
  ssr: false,
  loading: () => (
    // TODO(1.5): вынести в словари next-intl
    <p className="text-muted mb-0">Загрузка формы…</p>
  ),
});

/** Кнопка «Добавить продукт». Форма шире, поэтому окно открывается большим. */
const AddProductButton = () => {
  const modal = useConfirm();

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={modal.open}>
        {/* TODO(1.5): вынести в словари next-intl */}
        <i className="bi bi-plus-lg me-2" aria-hidden="true" />
        Добавить продукт
      </button>

      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          onClose={modal.close}
          title="Новый продукт"
          size="large"
        >
          <ProductForm onSuccess={modal.close} onCancel={modal.close} />
        </Modal>
      )}
    </>
  );
};

export default AddProductButton;
