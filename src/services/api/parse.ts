import type { AxiosResponse } from "axios";
import { HttpError } from "../http";

/**
 * Разбор тела ответа. Ответ сервера — такие же внешние данные, как `seed.json`:
 * контракт может разъехаться после деплоя бэка (в плане это риск №5, два
 * репозитория без атомарных изменений). Поэтому список приходит в стор только
 * через `parseOrder` / `parseProduct`, а не приводится к типу через `as`.
 */

/**
 * Сервер ответил, но телом прислал не то, что обещал контракт.
 *
 * Статус сохраняется настоящий (обычно `200`), а не подменяется нулём: нуль в
 * `HttpError` означает «ответа не было вовсе» и разрешает повтор запроса,
 * тогда как битое тело повтором не лечится.
 */
const contractError = (
  response: AxiosResponse<unknown>,
  cause: unknown
): HttpError =>
  new HttpError(
    response.status,
    cause instanceof Error ? cause.message : String(cause),
    "Invalid Response"
  );

export const parseCollection = <TItem>(
  response: AxiosResponse<unknown>,
  parseItem: (raw: unknown) => TItem
): TItem[] => {
  const { data } = response;

  if (!Array.isArray(data)) {
    throw contractError(
      response,
      new TypeError(`Ожидался массив, пришло: ${typeof data}`)
    );
  }

  try {
    return data.map((item: unknown) => parseItem(item));
  } catch (cause) {
    throw contractError(response, cause);
  }
};

export const parseEntity = <TItem>(
  response: AxiosResponse<unknown>,
  parseItem: (raw: unknown) => TItem
): TItem => {
  try {
    return parseItem(response.data);
  } catch (cause) {
    throw contractError(response, cause);
  }
};
