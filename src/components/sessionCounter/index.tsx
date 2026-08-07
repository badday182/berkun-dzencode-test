"use client";

import clsx from "clsx";
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

  return (
    <div
      className={clsx("d-flex align-items-center gap-2", styles.counter)}
      // TODO(1.5): вынести в словари next-intl
      title={isConnected ? "Активных сессий" : "Нет связи с сервером"}
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
          {/* TODO(1.5): вынести в словари next-intl */}
          <span className="fw-bold">{activeSessions}</span>
          <span className="text-muted"> в сети</span>
        </span>
      ) : (
        // TODO(1.5): вынести в словари next-intl
        <span className="small text-muted">нет связи</span>
      )}
    </div>
  );
};

export default SessionCounter;
