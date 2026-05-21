# Frontend — Шлюз оркестрации лабораторных стендов

React-приложение для хакатона «Кибер Инфраструктура»: мониторинг кластера, конфигуратор ресурсов, управление стендом и админ-панель.

## Стек

- Vite + React 19 + TypeScript
- SCSS + CSS Modules
- React Router, TanStack Query, Zustand, React Hook Form + Zod, Recharts, MSW

## Быстрый старт

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Откройте http://localhost:5173

## Демо-аккаунты (MSW)

| Роль    | Email             | Пароль     |
|---------|-------------------|------------|
| Студент | student@test.ru   | student123 |
| Админ   | admin@test.ru     | admin123   |

Отключить моки: `VITE_ENABLE_MSW=false` и указать URL бэкенда в `VITE_API_BASE_URL`.

## Маршруты

| Путь              | Описание                          |
|-------------------|-----------------------------------|
| `/`               | Загрузка кластера, графики        |
| `/login`          | Вход                              |
| `/register`       | Регистрация → конфигуратор        |
| `/configurator`   | Образ ОС, ресурсы, сеть (авто/вручную), время аренды |
| `/stands`         | FSM стенда, TTL, заморозка        |
| `/admin`          | Пользователи, ВМ, ключи, сеть     |
| `/admin/settings` | TTL лабы и заморозки              |

## API для бэкенда

Контракт: [docs/API.md](./docs/API.md)

## Сборка

```bash
npm run build
npm run preview
```
