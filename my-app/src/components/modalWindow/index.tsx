import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/hooks";
// import { deleteOrder } from "@/lib/features/orders/ordersSlice";

import styles from "./index.module.css";
interface ModalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  orderId: number;
}

const ModalWindow: React.FC<ModalWindowProps> = ({
  isOpen,
  onClose,
  title,
  orderId,
}) => {
  const dispatch = useAppDispatch();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();

      // Add event listener for ESC key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };

      document.addEventListener("keydown", handleEscape);

      // Prevent scrolling on the body
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, onClose]);

  const handleDelete = () => {
    // dispatch(deleteOrder(orderId));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${styles.modalBackdrop}`} onClick={onClose}>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                ref={closeButtonRef}
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p>Вы уверены, что хотите удалить этот заказ?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Отмена
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWindow;
