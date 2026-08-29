# Alex Volkov — Portfolio

Премиальный сайт-визитка независимого разработчика: тёмная/светлая тема, RU/EN локализация, категории проектов, метаданные из GitHub API, командная палитра (⌘K), поиск, сортировка и тег-фильтры.

**Стек:** Next.js (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Framer Motion · next-themes · zustand · cmdk

---

## 🚀 Запуск локально

```bash
bun install        # или npm install
bun run dev        # http://localhost:3000
```

Сборка production:

```bash
bun run build && bun run start
```

## ☁️ Деплой

- **Vercel:** импортируйте репозиторий → всё работает из коробки (домен в `layout.tsx` и `sitemap.ts` заменить на свой).
- **Netlify:** `next build`, плагин `@netlify/plugin-nextjs`.
- **Свой сервер:** `bun run build`, затем `bun run start` (или `node .next/standalone/server.js`) за nginx/caddy.
- Опционально: `GITHUB_TOKEN=ghp_...` в `.env` — поднимает лимит GitHub API с 60 до 5000 запросов/час.

---

## ⌨️ Командная палитра (Ctrl+K / ⌘K)

Нажмите `Ctrl+K` (или `⌘K` на Mac) в любой момент — откроется палитра с командами:

- **Разделы** — быстрый переход к Hero / Проектам / BIO / Контактам (горячие клавиши 01–04);
- **Проекты** — поиск по названию или тегу, Enter открывает карточку проекта;
- **Действия** — переключение темы, смена языка RU⇄EN, копирование email, печать/PDF-резюме, переходы в GitHub / Telegram / Discord.

Палитра полностью локализована (ключи `palette.*` в `locales/*.json`).

## 🔎 Поиск, сортировка, теги и режимы отображения

- **Поиск** — живой фильтр по названию, описанию и тегам (комбинируется с фильтром категорий); счётчик результатов в бейдже.
- **Сортировка** — селектор рядом с поиском: Избранные / По звёздам / По названию / По обновлению.
- **Тег-чипы** — клик по тегу на карточке фильтрует сетку по этому тегу (повторный клик снимает фильтр); активный тег подсвечивается фиолетовым.
- **Сетка / Список** — переключатель режимов (иконки справа от сортировки): компактные строки с миниатюрой для быстрого обзора или карточки-плитки; выбор запоминается в localStorage (`portfolio-view`).
- **Клавиатурная навигация** — стрелки ←→↑↓ / Home / End перемещают фокус между карточками (учитывается текущее число колонок); Escape закрывает диалог.
- **Относительное время** — «Обновлён 3 дня назад» на карточках обновляется каждую минуту (`Intl.RelativeTimeFormat`, RU/EN).

## 📌 Секция «Сейчас в работе» и график активности (BIO)

- **«Сейчас в работе»** — что владелец делает прямо сейчас: пункты лежат в `data/profile.json` → `now[]` (эмодзи + текст `en`/`ru`). Отредактируйте список — секция обновится сама.
- **График активности** — декоративный GitHub-style график коммитов за год. Управляется сидом: `data/profile.json` → `activity.seed` (смените число — график «перетасуется»). Локализованные подписи месяцев, тултипы с числом коммитов, горизонтальный скролл на мобильных.
- **Локальное время** — живые часы владельца в карточке портрета (`profile.timezone`, IANA-формат), обновляются каждые 30 секунд.

## 🖨️ Печать / PDF-резюме

Нажмите `Ctrl+K` → «Печать / сохранить как PDF» (или `Ctrl+P`) — страница печатается как аккуратное светлое резюме: тёмная тема автоматически инвертируется в светлую, скрываются кнопки, обложки проектов, декоративные элементы и UI-хром, карточки не разрываются между страницами.

## ➕ Как добавить проект (≈ 2 минуты)

Откройте [`data/projects.json`](data/projects.json) и добавьте объект в массив:

```json
{
  "id": "my-cool-app",                          // уникальный slug (латиница, дефисы)
  "title": "My Cool App",
  "description": {
    "en": "One-two sentences in English.",
    "ru": "Одно-два предложения на русском."
  },
  "category": "web",                            // id категории из data/categories.json
  "githubUrl": "https://github.com/you/my-cool-app",
  "demoUrl": "https://my-cool-app.vercel.app",  // опционально — кнопка "Live demo"
  "tags": ["Next.js", "TypeScript"],
  "screenshots": ["/images/projects/my-cool-app-1.png"],
  "featured": false,                            // true = закрепить в начале сетки + бейдж
  "stars": 0,                                   // fallback, если GitHub API недоступен
  "language": "TypeScript",
  "lastCommit": "2025-01-01",
  "run": "git clone https://github.com/you/my-cool-app\ncd my-cool-app\nbun install\nbun run dev"
}
```

Скриншоты положите в `public/images/projects/` (или используйте абсолютные URL — например, на `raw.githubusercontent.com`). Если `screenshots` пуст, карточка покажет градиентный монограмм-плейсхолдер.

После коммита/PR проект **автоматически** появится в сетке и в фильтрах. Звёзды и дата последнего коммита подтягиваются живьём через `/api/github` (кэш 1 час); при недоступности API используются `stars` / `lastCommit` из JSON.

> **Подсказка:** если в корне репозитория лежат `screenshot*.png|jpg`, можно указать их напрямую:
> `"screenshots": ["https://raw.githubusercontent.com/you/repo/main/screenshot-1.png"]`

## 🏷️ Как добавить категорию (≈ 1 минута)

Откройте [`data/categories.json`](data/categories.json) и добавьте запись:

```json
{
  "id": "mobile",
  "label": { "en": "Mobile", "ru": "Мобилки" },
  "order": 5,
  "icon": "monitor"
}
```

- `order` — позиция вкладки в фильтрах.
- `icon` — имя из реестра в `src/components/site/icons.tsx` (`globe`, `monitor`, `terminal`, `sparkles`). Неизвестное имя → иконка-папка по умолчанию, ничего не ломается. Чтобы добавить новую иконку, допишите её в объект `CATEGORY_ICONS` (одна строка).

Новая вкладка фильтра появится автоматически — код компонентов менять не нужно. Не забудьте присвоить хотя бы одному проекту `"category": "mobile"`.

## ✏️ Как менять тексты

- **UI-тексты** (меню, кнопки, заголовки, BIO-абзацы, контакты, футер, палитра, сортировка, режимы отображения): [`locales/ru.json`](locales/ru.json) и [`locales/en.json`](locales/en.json). Структура файлов одинаковая — ключ `hero.viewProjects` и т.п.
- **Профиль** (имя, аватар, соцссылки, статистика в hero, навыки, опыт, «Сейчас в работе», сид графика активности, часовой пояс): [`data/profile.json`](data/profile.json). Локализуемые поля (`role`, `company`, `description`…) принимают либо строку, либо `{ "en": "...", "ru": "..." }`.
- **SEO/метаданные:** `src/app/layout.tsx` (title, description, Open Graph, PWA-манифест) + домен в `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`.

## 🎨 Дизайн-токены

Палитра и анимации определены в [`src/app/globals.css`](src/app/globals.css):

| Токен | Тёмная тема | Светлая тема |
|---|---|---|
| Фон | `#0B0F14` | `#F9FAFB` |
| Акцент | `#8B5CF6` (violet-500) | `#7C3AED` (violet-600) |
| Карточки | `#10151D` | `#FFFFFF` |

Тема по умолчанию — тёмная; выбор сохраняется в `localStorage` (next-themes). Язык — тоже (ключ `portfolio-lang`), при первом визите определяется по `navigator.language`.

## 🗂️ Структура

```
data/
  projects.json      # проекты — контент сетки
  categories.json    # категории — вкладки фильтров
  profile.json       # владелец: имя, аватар, соцсети, навыки, опыт, now[], activity.seed
locales/
  ru.json / en.json  # все тексты интерфейса
public/
  favicon.svg
  manifest.webmanifest        # PWA-манифест (installable)
  icon-*.png                  # иконки PWA (any + maskable) и apple-touch-icon
  images/profile/    # avatar.png, og-image.png
  images/projects/   # скриншоты проектов
src/
  app/
    layout.tsx       # SEO-метаданные, шрифты (next/font), PWA, провайдеры
    page.tsx         # единственная страница-лендинг (+ JSON-LD)
    api/github/      # обогащение данных из GitHub API (кэш 1ч, fallback)
    sitemap.ts robots.ts
  components/site/   # header, hero, projects, project-card, project-row (список),
                     # project-dialog, bio, contact, footer, toggles, icons,
                     # command-palette, sort-select, project-search,
                     # activity-graph, relative-time, scroll-progress,
                     # back-to-top (с прогресс-кольцом), count-up
  hooks/
    use-mounted.ts   # клиент-онли рендер без hydration-мисматчей
    use-scrollspy.ts
  lib/
    portfolio.ts     # типы + загрузка data/*.json + formatRelativeTime
    i18n.tsx         # RU/EN провайдер (useSyncExternalStore)
    ui-store.ts      # zustand-стор: палитра, диалог проекта, режим сетка/список
    clock.ts         # общая минутная подписка (useNow) для всех таймстемпов
```

**Заметка по архитектуре:** детали проекта открываются в полноэкранном диалоге (lazy-загружаемом через `next/dynamic`), а не отдельным маршрутом — это мгновенное открытие без навигации и меньше JS в первом чанке. `description` в карточках поддерживает `{en, ru}` — просто поставьте однострочную строку, если перевод не нужен.

## ⚡ Производительность и доступность

- Шрифты Geist через `next/font` (self-hosted, zero CLS).
- Диалог проекта и галерея — code-split (`next/dynamic`), изображения `loading="lazy"`.
- Framer Motion — только `whileInView` с `once: true` (нет рендер-петель).
- Данные GitHub — кэш 1 час (`revalidate` + `s-maxage`), fallback на локальный JSON.
- `prefers-reduced-motion` — все анимации отключаются (CSS + `MotionConfig reducedMotion="user"`).
- SEO: Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD Person-схема (`page.tsx`), PWA-манифест + иконки (в т.ч. maskable).
- A11y: skip-link «Перейти к содержимому», roving-навигация стрелками по сетке проектов, `aria-pressed` на тегах/режимах, тултипы на соцссылках hero, `aria-current` в навигации, sr-only описания для графика активности и мобильного меню.

## 🧪 Адаптивность

| Диапазон | Сетка проектов | Навигация | Отступы |
|---|---|---|---|
| < 640px (мобильные) | 1 колонка | гамбургер (Sheet) | `p-4` |
| 640–1024px (планшеты) | 2 колонки | горизонтальная | `p-6` |
| 1024–1280px (ноутбуки) | 3 колонки | горизонтальная | `p-8` |
| ≥ 1280px (десктопы) | 4 колонки | горизонтальная | `p-8` |
