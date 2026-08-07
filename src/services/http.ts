import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { isApiError, type ApiError } from "@/types";

/**
 * Единственный axios-инстанс приложения. Модуль изоморфный: тот же код
 * выполняется в браузере и в серверном рантайме Next, поэтому в фазе 2.1
 * страницы переезжают на SSR без переписывания слоя запросов.
 *
 * Здесь нет ничего, что привязывает модуль к браузеру: ни `window`, ни
 * `localStorage`, ни React. Сессия держится на httpOnly-куках (`withCredentials`),
 * а не на токене из Web Storage — это же решение позволит фазе 2.1 просто
 * прокинуть заголовок `Cookie` в серверные запросы.
 */

/** Адрес API по умолчанию — порт из `berkun-dzencode-api`. */
const DEFAULT_API_URL = "http://localhost:4000";

/**
 * То, что вызывающий код вправе донастроить у отдельного запроса.
 *
 * Намеренно уже, чем `AxiosRequestConfig`: методы из `services/api` не должны
 * позволять переопределять `baseURL` или `withCredentials` — иначе настройки
 * транспорта расползутся по компонентам. `signal` приходит из
 * `createAsyncThunk`, `headers` понадобятся в фазе 2.1, чтобы прокинуть
 * `Cookie` в серверный запрос.
 */
export interface RequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

/** Ответ не пришёл вовсе: обрыв сети, таймаут, отказ CORS. */
export const NETWORK_ERROR_STATUS = 0;

const REQUEST_TIMEOUT_MS = 10_000;

const isServer = (): boolean => typeof window === "undefined";

/**
 * Базовый URL API.
 *
 * Адресов два, и это не дублирование: из браузера API виден по проброшенному
 * наружу порту (`http://localhost:4000`), а из серверного рантайма Next внутри
 * docker-сети — по имени сервиса (`http://api:4000`). До фазы 2.1 серверная
 * ветка не задействована, но переменная читается уже сейчас, чтобы SSR не
 * потребовал правок в этом модуле.
 *
 * `NEXT_PUBLIC_*` подставляется на этапе сборки, поэтому обращение идёт к
 * полному `process.env.NEXT_PUBLIC_API_URL`, а не к вычисляемому ключу.
 */
export const apiBaseUrl = (): string => {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  return isServer() ? (process.env.API_URL_INTERNAL ?? publicUrl) : publicUrl;
};

/**
 * Тело ошибки NestJS. `ValidationPipe` кладёт в `message` массив строк
 * («title should not be empty», …), обычный `HttpException` — одну строку;
 * `isApiError` пропускает только вторую форму, поэтому массив разбирается
 * отдельно.
 */
const readErrorBody = (
  data: unknown
): Pick<ApiError, "message" | "error"> | undefined => {
  if (isApiError(data)) return { message: data.message, error: data.error };

  if (typeof data !== "object" || data === null) return undefined;

  const { message, error } = data as Record<string, unknown>;
  if (!Array.isArray(message)) return undefined;

  return {
    message: message.filter((item) => typeof item === "string").join("; "),
    error: typeof error === "string" ? error : undefined,
  };
};

/**
 * Ошибка запроса в форме, пригодной для стора: у неё всегда есть `statusCode`
 * и человекочитаемое `message`. Слайсы в фазе 1.3 кладут в состояние именно
 * это, а не `AxiosError` — тот несериализуем и Redux ругается на него.
 */
export class HttpError extends Error implements ApiError {
  readonly statusCode: number;
  readonly error: string | undefined;

  constructor(statusCode: number, message: string, error?: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.error = error;
  }

  /** Сетевая ошибка: сервер не ответил, повтор имеет смысл. */
  get isNetworkError(): boolean {
    return this.statusCode === NETWORK_ERROR_STATUS;
  }

  /** Поля, которые переживут сериализацию в Redux. */
  toApiError(): ApiError {
    return {
      statusCode: this.statusCode,
      message: this.message,
      ...(this.error === undefined ? {} : { error: this.error }),
    };
  }

  static from(cause: unknown): HttpError {
    if (cause instanceof HttpError) return cause;

    if (cause instanceof AxiosError) {
      const { response } = cause;
      if (response === undefined) {
        return new HttpError(NETWORK_ERROR_STATUS, cause.message, cause.code);
      }

      const body = readErrorBody(response.data);
      return new HttpError(
        response.status,
        body?.message ?? cause.message,
        body?.error
      );
    }

    return new HttpError(
      NETWORK_ERROR_STATUS,
      cause instanceof Error ? cause.message : String(cause)
    );
  }
}

export const http: AxiosInstance = axios.create({
  baseURL: apiBaseUrl(),
  timeout: REQUEST_TIMEOUT_MS,
  // Куки сессии ходят с каждым запросом; на стороне API этому соответствует
  // `enableCors({ credentials: true })`.
  withCredentials: true,
  headers: { Accept: "application/json" },
});

/**
 * Заготовка под фазу 2.2. `baseURL` здесь намеренно не переписывается: к
 * моменту работы интерсептора в `config` уже лежит либо дефолт инстанса, либо
 * явное переопределение вызывающего кода, и присваивание затёрло бы второе.
 * Next читает `.env` до загрузки модулей, поэтому значения на момент
 * `axios.create` уже верные.
 */
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // TODO(2.2): заголовок `Cookie` при вызове с сервера (серверный рантайм не
  // получает куки браузера автоматически) и `Authorization`, если от
  // httpOnly-кук придётся отказаться.
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (cause: unknown) => {
    const httpError = HttpError.from(cause);

    // TODO(2.2): 401 → один общий `POST /auth/refresh` → повтор исходного
    // запроса. Ветка появится здесь, а не в вызывающем коде, поэтому и
    // интерсептор заведён сейчас: у параллельных запросов рефреш должен быть
    // общим (дедупликация промиса), иначе пять 401 дадут пять рефрешей и
    // гонку за ротацией токена. До фазы 2.2 401 — обычная ошибка.
    return Promise.reject(httpError);
  }
);

export default http;
