# Аватарки ботов

Сгенерированы [DiceBear](https://www.dicebear.com/) и лежат здесь, чтобы не зависеть от внешнего сервиса
(у части игроков в России api.dicebear.com не открывался — боты были пустыми кружками).
С 19.10.2026 — набор `w-01…w-24.svg` (девушки) и `m-01…m-24.svg` (парни) из разных стилей; бот при посадке
за стол получает случайную картинку своего пола (`server/src/games/bots.js`). Пересоздать или расширить —
`bash deploy/gen-bot-avatars.sh` (другой `SALT` — другие лица). Стили и лицензии (записаны и в `<dc:rights>` каждого SVG):

- avataaars — «Avataaars», Pablo Stanley, free for personal and commercial use
- adventurer — «Adventurer», Lisa Wischofsky, CC BY 4.0
- lorelei — «Lorelei», Lisa Wischofsky, CC0 1.0
- micah — «Avatar Illustration System», Micah Lanier, CC BY 4.0
- big-smile — «Custom Avatar», Ashley Seo, CC BY 4.0

Старые `alex-m.svg` и др. (по одной на имя) оставлены, пока у игроков может быть открыт прежний клиент; потом удалить.
