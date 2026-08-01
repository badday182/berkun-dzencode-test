/** Конверт ответа API. Заполнится смыслом в фазе 1.3 вместе с axios. */
export interface ApiResponse<TData> {
  data: TData;
  message?: string;
}

/** Постраничный ответ — понадобится, когда список продуктов перестанет помещаться в один запрос. */
export interface Paginated<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** Формат ошибки NestJS (`HttpException`). */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

/** Состояние асинхронной операции в сторе. Заменит ручной `useState(loading)` в фазе 1.3. */
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isApiError = (value: unknown): value is ApiError =>
  isRecord(value) &&
  typeof value.statusCode === "number" &&
  typeof value.message === "string";
