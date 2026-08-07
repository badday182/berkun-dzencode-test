"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useSessionCount } from "@/hooks";
import styles from "./index.module.css";

/**
 * Сколько вкладок сейчас работает с приложением.
 *
 * Число приходит только по сокету: HTTP-запросом его не получить, сервер
 * рассылает его сам при каждом подключении и отключении. Пока связи нет,
 * показывать нечего — счётчик честно говорит «нет связи», а не держит на
 * экране последнее известное число.
 */
const SessionCounter = () => {
  const { activeSessions, isConnected } = useSessionCount();
  const t = useTranslations("session");

  return (
    <div
      className={clsx("d-flex align-items-center gap-2", styles.counter)}
      title={isConnected ? t("activeSessions") : t("noConnection")}
    >
      {/* Не `{ [styles.x]: cond }`: под `noUncheckedIndexedAccess` класс
          модуля имеет тип `string | undefined` и вычисляемым ключом быть
          не может. `clsx` со значением `false` отбрасывает его сам. */}
      <span
        className={clsx(
          styles.indicator,
          isConnected && styles.indicator_online
        )}
        aria-hidden="true"
      />
      {isConnected ? (
        <span className="small">
          <i className="bi bi-people me-1" aria-hidden="true" />
          <span className="fw-bold">{activeSessions}</span>
          <span className="text-muted"> {t("online")}</span>
        </span>
      ) : (
        <span className="small text-muted">{t("offline")}</span>
      )}
    </div>
  );
};

export default SessionCounter;
