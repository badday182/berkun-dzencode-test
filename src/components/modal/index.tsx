"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import styles from "./index.module.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Кнопки внизу. Без них подвал не рисуется вовсе. */
  footer?: React.ReactNode;
  /** Формам нужно больше места, чем вопросу «удалить?». */
  size?: "default" | "large";
}

/**
 * Оболочка модального окна: затемнение, Escape, блокировка прокрутки, фокус.
 *
 * Вынесена из `modalWindow`, когда в тех же рамках понадобилось показывать не
 * только подтверждение удаления, но и формы. Подтверждение осталось отдельным
 * компонентом поверх этой оболочки — у него своя логика удаления, и мешать её
 * с разметкой окна незачем.
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "default",
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("common");

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${styles.modalBackdrop}`} onClick={onClose}>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={clsx(
            "modal-dialog modal-dialog-centered modal-dialog-scrollable",
            size === "large" && "modal-lg"
          )}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                ref={closeButtonRef}
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label={t("close")}
              />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
