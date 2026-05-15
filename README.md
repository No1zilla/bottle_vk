# Бутылочка — VK Mini App

Весёлая игра в бутылочку на React + Vite + VKUI. Хранение данных только через VKWebAppStorage, без бэкенда.

## Локальный запуск

```bash
npm install
npm run dev
```

Приложение откроется на http://localhost:5173. Вне ВК используются моковые данные пользователя и друзей.

## Сборка

```bash
npm run build
```

Готовые файлы кладутся в `dist/`.

## Деплой и подключение к ВК

1. Зарегистрируй новое VK Mini App: https://vk.com/editapp?act=create
2. Загрузи содержимое папки `dist` на любой статический хостинг с HTTPS:
   - **Netlify**: перетащи папку `dist` в https://app.netlify.com/drop
   - **Vercel**: `vercel --prod` в папке проекта
   - **GitHub Pages**: запушь содержимое `dist` в ветку `gh-pages`
3. В настройках приложения на https://vk.com/editapp?act=info укажи URL хостинга в поле "Адрес для пользователей мобильных устройств" и "Адрес для пользователей ПК".
4. Сохрани и открой приложение через `vk.com/app<ID>`.

## Структура

```
src/
  panels/        — Home, Game, Leaderboard, Profile
  components/    — BottleSpinner, TaskCard, PlayerAvatar
  hooks/         — useVKUser, useVKFriends, useStorage
  data/tasks.js  — 40 заданий 3 уровней сложности
  App.jsx
  main.jsx
```

## Возможности

- Добавление произвольного числа игроков (минимум 2 для старта)
- SVG-бутылка с CSS-анимацией вращения
- 40 заданий: 15 лёгких (+10), 15 средних (+20), 10 сложных (+30)
- Очки и статистика хранятся в VKWebAppStorage
- Рейтинг друзей через VKWebAppGetFriends
- Поделиться результатом и пригласить друзей нативными вызовами bridge
- Автоматическая поддержка тёмной темы через VKUI
