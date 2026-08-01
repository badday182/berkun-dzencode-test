# План доработки проекта

Рабочий документ. Отмечай выполненное чекбоксами по ходу.

---

## 1. Контекст

Проект получил ревью тестового задания. Часть замечаний — прямые пробелы
(нет axios, socket.io не подключён, нет i18n, нет форм, нет 404, нет кастомных хуков),
часть — требования расширенного ТЗ, которые не были реализованы вовсе (SSR, JWT, тесты,
PWA, чарты и т.д.).

### Что ревьюер оценил положительно (не ломать)

- Структура: страницы и компоненты раздельно, мок отдельно, стор отдельно.
- Декомпозиция страниц.
- Redux Toolkit, разбитый на два слайса; реактивный выбор прихода, корректные счётчики.
- Переиспользуемые утилиты `formatDate` и `getOrderStats`.
- Глобальный layout, оборачивающий приложение.
- Удаление через модалку подтверждения.
- `setInterval` для часов с корректной отпиской.

### Замечания ревьюера

| Замечание | Фаза |
|---|---|
| Нет axios | 1.3 |
| socket.io установлен, но подключения нет | 1.2 + 1.3 |
| Нет i18n | 1.5 |
| Нет работы с формами | 1.4 |
| Нет обработки 404 | 1.3 |
| Кастомные хуки не писал | 1.3 |
| Типизация — интерфейсы, не более | 1.1 |
| Нет меню слева, по стилям средне | 1.4 |

### Пункты расширенного ТЗ

TypeScript, SSR (Next.js), unit-тесты, i18n, JWT, Web Storage, Lazy Loading,
Charts, GraphQL, Web Workers, PWA, Event-Driven Architecture, FrontEnd Optimization,
Task Runners (npm scripts), интеграционные и функциональные тесты.

**Исключены из скоупа по решению от 2026-08-01:** Microservices,
Micro Frontend Architecture, WebAssembly.

---

## 2. Принятые решения

| Вопрос | Решение | Обоснование |
|---|---|---|
| Архитектура | Фронт (Next) и API (NestJS) — **два отдельных репозитория** | API может быть передан другой команде; разделять дешевле сейчас, чем потом |
| Фронт | **Одно** Next-приложение, без монорепо и Turborepo | Micro Frontend снят → делить нечего; оркестрация обычными npm-скриптами (пункт ТЗ «Task Runners») |
| Бэкенд | NestJS | Из коробки модули, guards под JWT, `@nestjs/graphql`, `@nestjs/websockets`. Альтернатива — Express, экономит ~1 день, но всё пишется руками |
| Стейт-менеджер | Остаёмся на **Redux Toolkit** | Ревьюер стор уже одобрил; `listenerMiddleware` закрывает EDA, `createAsyncThunk` — состояния загрузки. Zustand не даёт выигрыша и добавляет риск новых замечаний |
| Хранилище API | **In-memory + абстракция репозитория**, Postgres — опциональная последняя фаза | Микросервисов нет, инстанс один, БД в ТЗ не требуется. Ревьюеру не нужно поднимать Postgres. Переезд = один новый класс |
| Контракт FE↔BE | GraphQL-схема + OpenAPI, типы через `graphql-codegen` / `openapi-typescript` | Не нужен общий npm-пакет типов — главная боль поли-репо |
| socket.io | Счётчик активных сессий | |
| Формы | **Formik + Yup** | |
| Стили | Bootstrap + левый сайдбар | Без миграции на Tailwind |
| i18n | `next-intl`, локали **RU / EN / UK**, выбор через cookie | |
| Тесты | **Vitest + RTL + MSW + Playwright** | |
| Порядок работ | Сначала блок 1 (фидбек), затем блок 2 (ТЗ) | Предъявляемый результат к концу первой недели |

### Отклонённые варианты

- **Module Federation** для микрофронтендов — `@module-federation/nextjs-mf` официально
  не поддерживает Next 15 + Turbopack, потребовался бы откат версии Next.
  (Пункт снят из скоупа целиком.)
- **WASM на Rust** — тянет Rust-тулчейн в Docker-образ. (Пункт снят.)
- **`next-pwa`** — проект заброшен, берём Serwist.
- **RTK Query** — увёл бы axios на второй план, а ревьюер требует его явно.

---

## 3. Текущее состояние кода

Что нужно держать в голове, приступая к работам:

- **SSR отсутствует полностью.** `my-app/src/app/orders/page.tsx:1` и
  `my-app/src/app/products/page.tsx:1` начинаются с `"use client"`, данные грузятся
  в `useEffect`. App Router есть, серверного рендеринга данных нет.
- **Мок — JS-файл на 931 строку** (`my-app/src/base/app.js`), примерно половина
  закомментирована. Импортируется напрямую в компоненты страниц.
- **Два компонента без типов вообще:** `my-app/src/components/select/index.js`,
  `my-app/src/components/cardPlaceholder/index.js` — пропсы нетипизированы.
- **id гуляет между `string` и `number`:** `String(order.id)` в `orders/page.tsx:87`
  против `Number(action.payload)` в
  `my-app/src/lib/features/dataOrdersAndProducts/ordersAndProductsSlice.ts:22-25`.
- **Хардкод локали:** `"ru-RU"` в `my-app/src/components/topMenu/index.tsx:16` и `:23`,
  `"Все типы"` в `select/index.js:27`.
- **`photo` в типе `Product` — обычная строка**, `next/image` не используется.
- **Загрузка через `useState(true)`** без состояния ошибки (`orders/page.tsx:25`).
- **Dockerfile и docker-compose** заточены под вложенную папку `my-app/`.
- **`socket.io` и `socket.io-client` в зависимостях**, но ни одного импорта в коде.

---

## 4. Целевая структура

**Репозиторий 1 — фронтенд (текущий):**

```
src/
├─ app/
│  ├─ layout.tsx              глобальный layout: sidebar + topbar
│  ├─ not-found.tsx           404
│  ├─ error.tsx               обработка ошибок
│  ├─ loading.tsx             skeleton
│  ├─ login/                  форма логина (Formik + Yup)
│  ├─ orders/
│  ├─ products/
│  └─ dashboard/              чарты
├─ components/                презентационные компоненты
│  ├─ layout/sidebar/
│  ├─ layout/topbar/
│  └─ forms/                  OrderForm, ProductForm, LoginForm
├─ features/                  слайсы + селекторы + thunks
├─ hooks/                     кастомные хуки
├─ services/                  axios-инстанс, api-методы, socket-клиент
│  └─ generated/              типы из graphql-codegen / openapi
├─ workers/                   Web Workers
├─ i18n/                      конфиг next-intl
├─ messages/                  ru.json, en.json, uk.json
├─ types/
└─ utils/
```

**Репозиторий 2 — API (NestJS):**

```
src/
├─ auth/         login, refresh, JwtAuthGuard
├─ orders/       controller, service, repository (interface + in-memory)
├─ products/     то же
├─ events/       socket.io gateway, шина доменных событий
├─ graphql/      code-first схема
└─ seed/         данные из старого base/app.js
```

---

## БЛОК 1 — фидбек ревьюера (~5.5 дней)

Цель: закрыть все прежние претензии ревьюера и получить предъявляемую версию.

### Фаза 1.1 — TypeScript-чистка `0.5 дн` — ✅ сделано

Закрывает: «типизация — интерфейсы, не более», остатки JS.

- [x] `components/select/index.js` → `index.tsx` с типизированными пропсами
- [x] `components/cardPlaceholder/index.js` → `index.tsx`
- [x] `base/app.js` вынесен в `src/mocks/seed.json` + `src/mocks/index.ts`
- [x] `enum Currency`, `enum ProductCondition` вместо магических значений
- [x] Дженерики: `ApiResponse<T>`, `Paginated<T>` (`types/api.ts`)
- [x] DTO через утилити-типы: `CreateOrderDto = Omit<Order, "id">` и остальные
- [x] Дискриминированные юнионы для socket-событий (`types/socket.ts`)
- [x] Type guards: `isOrder`, `isProduct`, `isPrice`, `isCurrency`, `isApiError`
- [x] Branded types: `OrderId`, `ProductId` вместо голого `number`
- [x] Убраны все `String()` / `Number()` конвертации идентификаторов
- [x] Строгий TS: `noUncheckedIndexedAccess`, `noImplicitOverride`,
      `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`, `allowJs: false`
- [x] ESLint (flat config) + Prettier + husky + lint-staged
- [x] npm-скрипты: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `verify`

#### Отклонение от плана

**`enum ProductType` не сделан намеренно.** В данных 11 категорий (`Мониторы`,
`Периферия`, `Ноутбуки`, …), и это открытый каталог, который ведёт бэкенд.
Enum пришлось бы править при каждой новой категории и он всё равно врал бы про
данные с сервера. Оставлена `type ProductType = string` с константой
`ALL_PRODUCT_TYPES` для фильтра. Глубина типизации добрана в других местах:
branded types, мапленный тип `ServerToClientEvents`, размеченные объединения,
утилити-типы DTO, `assertNever`.

#### Попутно найдено и исправлено

- **Нарушение правил хуков** в `productsCard`: ранний `return` при `product === undefined`
  стоял выше `useState` и `useAppSelector` — при появлении продукта менялся порядок
  хуков. Проп сделан обязательным, ранняя ветка убрана.
- **`ModalWindow` мог получить `id === null`** из `orderProductsCard` — модалка
  рендерилась вне проверки `selectedOrderId`. Добавлена защита.
- **`onClick` висел на `<i>` внутри `<button>`** в `productsCard` и `orderProductsCard` —
  клик по кнопке мимо иконки не срабатывал. Перенесён на `<button>`.
- **Дублирование данных в моке:** у каждого заказа было вложенное поле `products`,
  посимвольно совпадающее с плоским списком. Из сида убрано.
- **Нестрогое сравнение** `selectedOrderId == orderId` в `orderCard` → `===`
  (правило `eqeqeq` теперь ловит такое).

#### Найдено, отложено осознанно

- **`clsx("flex-grow-1", { orders: … })` в `orders/page.tsx`** подставляет литеральную
  строку `orders`, а не хешированный класс CSS-модуля, поэтому `.orders { width: 30% }`
  из `orders/index.module.css` никогда не применялся. Починка меняет раскладку —
  разбирается в фазе 1.4 вместе с сайдбаром. В коде стоит `TODO(1.4)`.
- **`deleteOrder` и `deleteAllOrderProduct` обязаны диспатчиться парой**, иначе
  остаются продукты-сироты. Пока помечено комментарием; каскад делает API в фазе 1.2.
- **Предупреждение `react-hooks/exhaustive-deps`** в `orders/page.tsx` — уходит
  в фазе 1.3 вместе с заменой `useEffect` на `createAsyncThunk`.

#### Проверка

`npm run verify` (typecheck + lint + format:check) и `npm run build` проходят;
остаётся одно известное предупреждение `exhaustive-deps`.

### Фаза 1.2 — минимальный API `1.5 дн`

Нужен до axios: без реального сервера подключение остаётся бутафорией.

- [ ] Инициализировать репозиторий NestJS
- [ ] Модуль `orders`: `GET /orders`, `POST /orders`, `DELETE /orders/:id`
- [ ] Модуль `products`: `GET /products`, `POST /products`, `DELETE /products/:id`
- [ ] Интерфейсы репозиториев + in-memory реализации, сид из старого мока
- [ ] Каскад: удаление прихода удаляет его продукты
- [ ] Модуль `events`: socket.io gateway, счётчик подключённых сессий,
      эмит `sessions:count` на connect/disconnect
- [ ] Доменные события `order.deleted` / `product.deleted` через EventEmitter2 → broadcast
      (серверная половина EDA)
- [ ] CORS, валидация через `ValidationPipe`, `.env.example`
- [ ] Dockerfile + запуск в общем compose

### Фаза 1.3 — axios, стор, хуки, 404 `1.5 дн`

Закрывает: нет axios, socket не подключён, нет кастомных хуков, нет 404.

- [ ] `services/http.ts`: axios-инстанс, `baseURL`, `withCredentials`,
      интерсепторы (заготовка под 401→refresh из фазы 2.2)
- [ ] `services/api/orders.ts`, `products.ts` — типизированные методы
- [ ] **Важно:** вызовы вынести в модуль, работающий и на сервере, и на клиенте —
      тогда SSR в фазе 2.1 станет надстройкой, а не переписыванием
- [ ] `createAsyncThunk` для загрузки: заменить `useState(loading)` на
      `pending/fulfilled/rejected` в слайсе, появится состояние ошибки
- [ ] `StoreProvider` научить принимать `preloadedState` — заранее, под SSR
- [ ] `services/socket.ts` — клиент socket.io, подключение с переподключением
- [ ] `listenerMiddleware`: socket-события → диспатч в стор (клиентская половина EDA)
- [ ] Кастомные хуки: `useOrders`, `useProducts`, `useSocket`, `useSessionCount`,
      `useClock`, `useLocalStorage`, `useConfirm`, `useOrderStats`
- [ ] `useClock` — перенести туда логику из `topMenu`, сохранив отписку
- [ ] `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx`
- [ ] `notFound()` при обращении к несуществующему приходу

### Фаза 1.4 — сайдбар и формы `1.5 дн`

Закрывает: «нет меню слева, по стилям средне», «нет работы с формами».

- [ ] Компонент `Sidebar`: сворачиваемый, иконки bootstrap-icons,
      active-состояние по `usePathname`, пункты Приходы / Продукты / Дашборд / Настройки
- [ ] Grid-раскладка `sidebar + content`, адаптив с оверлеем на мобильном
- [ ] `Topbar` наполнить: время, счётчик активных сессий, переключатель языка, профиль
- [ ] Установить `formik`, `yup`
- [ ] Форма «Добавить приход»: title, date, description
- [ ] Форма «Добавить продукт»: все поля `Product`, включая цены USD/UAH и гарантию
- [ ] Ошибки под полями, дизейбл сабмита, обработка серверных ошибок
- [ ] Формы открываются в существующей модалке, подгружаются через `next/dynamic`
- [ ] Причесать таблицы и карточки, единые отступы и типографика

### Фаза 1.5 — i18n `0.5 дн`

- [ ] Установить `next-intl`, настроить провайдер в layout
- [ ] `messages/ru.json`, `en.json`, `uk.json`
- [ ] Выбор локали через cookie + переключатель в topbar
- [ ] Локализованные даты вместо хардкода `"ru-RU"` в `topMenu` и `formatDate`
- [ ] Перевести `"Все типы"` и остальные хардкод-строки
- [ ] Сообщения валидации Yup — через `t()`

---

## БЛОК 2 — пункты ТЗ (~7 дней)

### Фаза 2.1 — SSR `1.5 дн`

- [ ] Страницы `orders` и `products` → Server Components, данные тянутся на сервере
- [ ] Прокидывание cookie в серверные запросы
- [ ] Гидрация стора через `preloadedState`
- [ ] Интерактив (выбор прихода, удаление, фильтр) вынести в клиентские острова
- [ ] Форматирование дат зафиксировать на UTC — иначе hydration mismatch
- [ ] Часы рендерить только на клиенте

### Фаза 2.2 — JWT `1 дн`

- [ ] API: `POST /auth/login` → access 15m + refresh 7d, оба httpOnly + Secure + SameSite=Lax
- [ ] API: `POST /auth/refresh`, `POST /auth/logout`, `JwtAuthGuard`
- [ ] Фронт: страница логина на Formik + Yup
- [ ] Интерсептор `401 → refresh → retry` с дедупликацией параллельных рефрешей
- [ ] `middleware.ts` защищает роуты
- [ ] Socket авторизуется тем же токеном из handshake-cookie
- [ ] Logout: чистка cookie, стора и Web Storage

### Фаза 2.3 — GraphQL `1 дн`

- [ ] `@nestjs/graphql` code-first, схема Order / Product
- [ ] Запрос `orders { products { … } }` одним вызовом — решает реальный N+1
- [ ] Чтение через GraphQL, мутации через REST + axios
- [ ] `graphql-codegen` на фронте → типы в `services/generated/`
- [ ] `openapi-typescript` для REST-части контракта

### Фаза 2.4 — Charts и Web Workers `1 дн`

- [ ] Страница `/dashboard`
- [ ] Recharts через `dynamic(..., { ssr: false })`
- [ ] Графики: приходы по месяцам, распределение продуктов по типам, суммы USD/UAH
- [ ] Агрегацию вынести в Web Worker — UI не блокируется
- [ ] Хук `useStatsWorker` с корректным терминированием воркера

### Фаза 2.5 — PWA, Web Storage, оптимизация `1 дн`

- [ ] Serwist: manifest, service worker, офлайн-фолбэк, иконки, установка
- [ ] Web Storage через `useLocalStorage`: язык, состояние сайдбара,
      последний выбранный приход, офлайн-кэш последних данных
- [ ] `next/image` вместо строкового `photo`
- [ ] `React.memo` на карточках, мемоизация селекторов
- [ ] `@next/bundle-analyzer`, разбор бандла
- [ ] Lazy loading: `next/dynamic` для модалок, форм и чартов (skeleton уже есть)
- [ ] Виртуализация списка продуктов при большом объёме

### Фаза 2.6 — тесты `2 дн`

- [ ] Vitest + RTL + jsdom, конфиг под Next
- [ ] Unit: оба редьюсера, `formatDate`, `getOrderStats`, кастомные хуки, карточки
- [ ] MSW + интеграционные: загрузка страницы, удаление с пересчётом счётчиков,
      сабмит форм, обработка 4xx, refresh токена на 401
- [ ] Playwright + функциональные: логин → приходы → выбор → удаление
      с подтверждением → счётчики пересчитались
- [ ] E2E: смена языка; рост счётчика сессий в двух браузерных контекстах
- [ ] Coverage-порог
- [ ] GitHub Actions: lint + typecheck + test + e2e

### Фаза 2.7 — Docker и документация `0.5 дн`

- [ ] Переписать Dockerfile и docker-compose (сейчас заточены под вложенный `my-app/`)
- [ ] Compose на два сервиса, healthchecks, `.env.example`
- [ ] README: схема архитектуры, запуск, карта «пункт ТЗ → где реализован»
- [ ] Отдельный README в репозитории API

### Фаза 2.8 — Postgres `+1 дн, опционально`

Делать, только если API реально передаётся другой команде как рабочая заготовка.

- [ ] Prisma, схема, миграции
- [ ] `PostgresOrdersRepository` / `PostgresProductsRepository` — сервисы не трогаем
- [ ] Сид-скрипт из текущего мока
- [ ] Postgres в compose с healthcheck

---

## 5. Риски и подводные камни

1. **Гидрация дат (фаза 2.1).** `formatDate` и часы на сервере и клиенте дадут разный
   результат из-за таймзоны → hydration mismatch. Форматирование фиксируем на UTC,
   часы рендерим только на клиенте.
2. **Переделка из-за порядка работ.** Feedback-first означает, что клиентская загрузка
   из 1.3 переводится на SSR в 2.1. Чтобы это стоило часы, а не день: вызовы api сразу
   пишем изоморфными, `StoreProvider` с первого дня готовим под `preloadedState`.
3. **socket.io требует long-running сервер** — деплой на Vercel отпадает, нужен Docker/VPS.
4. **In-memory ломается при масштабировании.** Пока инстанс API один — всё корректно.
   Два и более — у каждого свой массив, счётчик сессий разъезжается. Лечение:
   фаза 2.8 + Redis-адаптер для socket.io. Для текущего скоупа не требуется.
5. **Два репозитория — нет атомарных изменений контракта.** Меняя API, сначала
   выкатываем бэк, потом перегенерируем типы на фронте. Локальная разработка требует
   поднять оба — закрывается общим compose.
6. **Cookie между разными портами в dev.** `SameSite=Lax` + разные origin фронта и API
   потребуют аккуратной настройки CORS `credentials` и, вероятно, прокси через Next
   rewrites на время разработки.

---

## 6. Открытые вопросы

- [ ] Postgres — нужен ли (фаза 2.8)? Решается тем, передаётся ли API другой команде.
- [ ] NestJS или Express для API? Принят NestJS; Express сэкономил бы ~1 день.
- [ ] Куда деплоим — VPS, Railway, Render? Влияет на фазу 2.7.

---

## 7. Оценка

| Блок | Срок |
|---|---|
| Блок 1 — фидбек ревьюера | ~5.5 дней |
| Блок 2 — пункты ТЗ | ~7 дней |
| **Итого** | **~12–13 рабочих дней** |
| Фаза 2.8 (Postgres, опционально) | +1 день |
