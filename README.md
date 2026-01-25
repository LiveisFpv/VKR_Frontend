# VKR_Frontend

Фронтенд веб‑приложения на Vue 3 для интеллектуального поиска и управления публикациями со входом через SSO, ролями (USER/AUTHOR, MODERATOR, ADMIN), страницами профиля и разделами. Проект собран на Vite и TypeScript, использует Pinia, Vue Router и Axios.

Основные модули: поиск статей с историей чатов (создание, переименование, удаление), добавление статьи, личный кабинет, админ‑панель пользователей, модераторская панель, тёмная/светлая тема, простая i18n (en/ru), тост‑уведомления и диалоги подтверждения.

## Стек

- Vue 3 + TypeScript, Vite 7
- Pinia (хранилище), Vue Router 4
- Axios (HTTP)
- Vitest + jsdom (юнит‑тесты)
- ESLint 9 + Prettier

## Быстрый старт

1. Требования: Node.js ^20.19.0 или >=22.12.0.

2. Установка зависимостей:

```bash
npm install
```

3. Настройте переменные окружения (см. раздел «Переменные окружения») в файле `.env` или `.env.local`.

4. Запуск в режиме разработки:

```bash
npm run dev
```

Vite поднимается на http://localhost:5173 (по умолчанию).

5. Сборка продакшн‑билда:

```bash
npm run build
```

Локальный предпросмотр собранного билда:

```bash
npm run preview
```

## Скрипты npm

- `dev` — запуск дев‑сервера Vite
- `build` — проверка типов и сборка (`vue-tsc` + `vite build`)
- `preview` — предпросмотр собранного приложения
- `test:unit` — юнит‑тесты (Vitest)
- `type-check` — отдельная проверка типов (vue-tsc)
- `lint` — ESLint с авто‑исправлением
- `format` — Prettier форматирует `src/`

Скрипты и ограничения движка Node описаны в `package.json`.

## Переменные окружения

Файл `.env` в репозитории содержит пример значений для локальной разработки:

```env
VITE_API_BASE_URL=http://localhost:5173
VITE_FRONTEND_BASE_URL=http://localhost:5173
VITE_SSO_CLIENT_ID_URL=https://id.liveisfpv.ru/api
VITE_ALIB_API_URL=http://localhost:8080/api
```

Назначение:

- `VITE_FRONTEND_BASE_URL` — базовый URL фронтенда, используется при построении redirect URL для OAuth.
- `VITE_SSO_CLIENT_ID_URL` — базовый URL SSO‑сервиса (логин/логаут/refresh/профиль/пользователи).
- `VITE_ALIB_API_URL` — базовый URL ALib API (чаты, поиск, добавление статей).
- `VITE_API_BASE_URL` — зарезервировано под общий базовый URL (в текущей версии напрямую не используется).

Переменные прокидываются в рантайм через `import.meta.env` (см. `src/config.ts`). Убедитесь, что CORS и `withCredentials` корректно настроены на бэкенде.

## Архитектура и ключевые файлы

- `src/main.ts` — инициализация приложения, Pinia и Router; установка темы (light/dark) и попытка авто‑аутентификации при старте.
- `src/router/index.ts` — маршруты и глобальные гард‑перехватчики: защита приватных страниц, проверка ролей, редиректы для ADMIN/MODERATOR.
- `src/stores/` — Pinia‑хранилища:
  - `authStore.ts` — хранит и обновляет токен доступа, пользователя, роли; интеграция с SSO (login/logout/refresh/authenticate/update, OAuth URL).
  - `chatStore.ts` — история чатов поиска, активный чат, сообщения и сортировка по обновлению.
  - `paperStore.ts` — локальный список «Моих статей» с мок‑данными и сохранением в памяти (до интеграции полной бэкенд‑логики).
  - `settingStore.ts` — состояние интерфейса (сворачивание левой панели).
  - `toastStore.ts` — тост‑уведомления.
- `src/api/` — слои API на Axios:
  - `api/base/useBaseApi.ts` — клиент для SSO с интерцепторами 401→refresh.
  - `api/base/useAlibApi.ts` — клиент для ALib API с теми же интерцепторами.
  - `api/useSSOApi.ts` — методы SSO (login/logout/refresh/authenticate/create/password-reset/updateUser, OAuth URL, список пользователей для админа).
  - `api/useAlibApi.ts` — методы чатов и поиска (`/chats`, `/chats/:id/history`) и добавления статьи (`/ai/paper/add`).
- `src/i18n.ts` — простая i18n без внешних библиотек: реактивная локаль, словарь сообщений, хелпер `t()` и `useI18n()`.
- `src/components/` — UI‑компоненты: верхняя панель `UpTab`, левая панель/история `LeftTab` (список чатов и действия), поиск `MainChat`, тост‑центр `ToastCenter`, диалог подтверждения `ConfirmDialog`, футер `FooterTab`.
- `src/views/` — страницы: Главная/Поиск, Вход, Профиль, Настройки, Мои статьи, Добавить/Редактировать статью, 404, Админ‑панель, Модератор.
- `src/assets/theme.css` — тема и CSS‑переменные; есть переключение темы в настройках.
- Конфигурация инструментов: `vite.config.ts`, `vitest.config.ts`, `eslint.config.ts`, `tsconfig*.json`.

## Маршруты и роли

Маршруты объявлены в `src/router/index.ts` и используют `meta.requiresAuth` и `meta.roles`.

- Роли пользователя берутся из SSO: `ADMIN`, `MODERATOR`, `USER`, `AUTHOR`.
- Для `ADMIN` и `MODERATOR` поиск на главной отключён, а навигация жёстко ограничена их панелями.
- Приватные страницы требуют авторизации (редирект на `/auth` с `redirect` обратно после логина).

## Аутентификация и SSO

Механика SSO реализована в `authStore` и `useSSOApi`:

- Хранение `access_token` в `localStorage` (ключ `auth.access_token`).
- Интерцепторы axios перехватывают 401 и выполняют `refresh` один раз с очередью ожидания; при неуспехе — `logout`.
- OAuth (Google/Yandex) работает через редирект на URL из SSO: `/oauth/:provider?redirect_url=...`.

Ожидаемые эндпоинты SSO (базовый URL — `VITE_SSO_CLIENT_ID_URL`):

- `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- `GET /auth/authenticate` — текущий пользователь
- `POST /auth/create` — регистрация
- `POST /auth/password-reset` — запрос письма для сброса пароля
- `GET /oauth/:provider?redirect_url=...` — построение OAuth‑редиректа
- `GET /auth/users` — список пользователей (админ)

## Поиск, чаты и «Мои статьи»

- Чаты: `LeftTab.vue` показывает историю (загрузка `get_all_user_chats`), позволяет выбирать, переименовывать и удалять; `UpTab.vue` копирует ссылку на активный чат.
- Поиск: `MainChat.vue` создаёт чат при первом запросе (`create_chat`), отправляет поиск в `/chats/:id/history`, подгружает историю через `get_chat_history` и отображает результаты по «ходам». Предпросмотр карточки, ссылки на PDF/страницу, OpenAccess‑мета.
- Добавление статьи: `PaperAddView.vue` вызывает `AlibApi.addPaper` и параллельно обновляет локальный список в `paperStore` (статус PENDING).
- Раздел «Мои статьи» и «Редактирование» сейчас работают на мок‑данных в памяти (`paperStore.ts`). Логика статусов: DRAFT/PENDING/REJECTED/APPROVED; approved — только чтение.

## i18n и тема

- Локализация: `src/i18n.ts` (английский/русский), переключение в настройках. Сообщения хранятся в одном файле, текущая локаль — в `localStorage` (`app.locale`).
- Тема: `data-theme` на элементе `<html>`, переключение light/dark в настройках, состояние темы также сохраняется в `localStorage`.

## Тесты и качество кода

- Тесты: Vitest (jsdom). Запуск: `npm run test:unit`.
- Линт/формат: `npm run lint`, `npm run format`.

## Сборка и деплой

1. Соберите проект: `npm run build` — результаты в папке `dist/`.
2. Раздавайте как статический сайт (Nginx/Apache/облако). Убедитесь, что значения `VITE_*` соответствуют продакшн‑окружению (используйте `.env.production`).
3. Настройте CORS и куки на бэкенде (axios настроен с `withCredentials: true`, авторизация через Bearer токен).

## Известные ограничения

- Раздел «Мои статьи» и страница редактирования используют локальные мок‑данные.
- Русские строки в `src/i18n.ts` должны быть в UTF‑8. Если видите «кракозябры» — проверьте кодировку файла и шрифт.
- Токен доступа хранится в `localStorage`. Для продакшна используйте HTTPS и корректные флаги безопасности на стороне SSO.

## Лицензия

Проект распространяется по лицензии Apache 2.0. См. файл `LICENSE`.
