import { HttpError } from "../http";
import type { ApiError } from "@/types";

/**
 * Любая пойманная ошибка → простой объект, который можно положить в стор.
 *
 * Существует, чтобы слайсы и хуки не импортировали `services/http`: им нужен
 * результат нормализации, а не класс ошибки и тем более не axios. В thunk'ах
 * это `rejectWithValue(toApiError(cause))` — Redux требует сериализуемое
 * значение, `Error` в состоянии не хранят.
 */
export const toApiError = (cause: unknown): ApiError =>
  HttpError.from(cause).toApiError();
