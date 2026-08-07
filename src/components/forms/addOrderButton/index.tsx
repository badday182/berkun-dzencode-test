"use client";

import dynamic from "next/dynamic";
import Modal from "@/components/modal";
import { useConfirm } from "@/hooks";

/**
 * Кнопка «Добавить приход» вместе с окном формы.
 *
 * Форма подгружается отдельным чанком: Formik с Yup весят заметно больше самой
 * формы, а нужны они только тому, кто нажал кнопку. `ssr: false` — потому что
 * форма всё равно появляется по клику, серверный рендер ей ни к чему.
 */
const OrderForm = dynamic(() => import("../orderForm"), {
  ssr: false,
  loading: () => (
    // TODO(1.5): вынести в словари next-intl
    <p className="text-muted mb-0">Загрузка формы…</p>
  ),
});

const AddOrderButton = () => {
  const modal = useConfirm();

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={modal.open}>
        {/* TODO(1.5): вынести в словари next-intl */}
        <i className="bi bi-plus-lg me-2" aria-hidden="true" />
        Добавить приход
      </button>

      {modal.isOpen && (
        <Modal isOpen={modal.isOpen} onClose={modal.close} title="Новый приход">
          <OrderForm onSuccess={modal.close} onCancel={modal.close} />
        </Modal>
      )}
    </>
  );
};

export default AddOrderButton;
