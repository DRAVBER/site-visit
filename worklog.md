# Worklog — Alex Volkov Portfolio (Next.js 16)

---
Task ID: 1
Agent: main agent (Z.ai Code)
Task: Спроектировать и реализовать премиальный сайт-визитку (портфолио) независимого разработчика: фиолетовые акценты, RU/EN, тёмная/светлая темы, категории проектов, GitHub-метаданные, полная адаптивность, микроанимации.

Work Log:
- Созданы конфиг-файлы контента: `data/projects.json` (8 проектов, 4 категории), `data/categories.json` (id/label{en,ru}/order/icon), `data/profile.json` (имя, аватар, соцссылки, статы, навыки, опыт).
- Созданы словари `locales/ru.json` + `locales/en.json` — все UI-тексты (nav, hero, projects, dialog, bio, contact, footer).
- Дизайн-система в `src/app/globals.css`: тёмная тема #0B0F14 / акцент #8B5CF6, светлая #F9FAFB / #7C3AED; кастомный скроллбар, ::selection, grid-фон, aurora-анимации, shimmer-разделители, text-gradient, fluid font-size (16→17→18px).
- `src/lib/portfolio.ts` — типы (Project/Category/Profile, Localized = string | {en,ru}) + загрузка JSON.
- `src/lib/i18n.tsx` — RU/EN провайдер на useSyncExternalStore + localStorage (`portfolio-lang`), автодетект navigator.language, синк `<html lang>`.
- Компоненты: header (glass при скролле, Sheet-меню на мобиле), hero (aurora orbs, бейдж доступности, статы, CTA, соцссылки, scroll-hint), projects (табы категорий data-driven + AnimatePresence-сетка), project-card (обложка, чипы, звёзды, язык, теги), project-dialog (ленивый через next/dynamic: галерея с точками, how-to-run с копированием, ссылки), bio (аватар-карточка, принципы, timeline опыта, навыки), contact (карточки GitHub/Discord/Telegram + email с копированием), footer (sticky через flex min-h-svh + mt-auto-структуру, made-with, наверх).
- `src/app/api/github/route.ts` — обогащение метаданных из GitHub API (revalidate 3600с, AbortController 4с, GITHUB_TOKEN опционально, graceful fallback на локальные stars/lastCommit).
- SEO: metadata + OG + twitter в layout.tsx, `sitemap.ts`, `robots.ts`, `favicon.svg`, OG-картинка.
- Изображения: сгенерированы 12 картинок через image-generation skill (avatar, og-image, 10 скриншотов проектов) в `public/images/`.
- README.md: инструкции «как добавить проект/категорию», локализация текстов, деплой, структура.
- QA через agent-browser: фильтры, диалог, галерея (переключение скриншотов), RU⇄EN, dark⇄light + persistence после reload, гамбургер-меню, сетка 1/2/3/4 колонки (390/820/1024/1440px), отсутствие горизонтального скролла (исправлен overflow-x: clip), VLM-ревью скриншотов (hero/projects/bio/contact, dark/light, desktop/mobile) — все PASS.
- Исправления по итогам QA: scroll-hint переведён из absolute в normal flow (перекрывал статы на невысоких экранах), добавлен ключ projectDialog.copyCommands, устранён горизонтальный оверфлоу от декоративных орбов.

Stage Summary:
- Готов полнофункциональный одностраничный портфолио-сайт на `/` (единственный видимый маршрут песочницы; детали проекта — в полноэкранном Dialog вместо dynamic route, задокументировано в README).
- Линт чистый, dev.log без ошибок, все интеракции проверены браузерно.
- Ключевые решения: контент полностью data-driven (projects/categories/profile + locales), i18n без перезагрузки через useSyncExternalStore, ленивый диалог, GitHub API с кэшем и fallback.
- Артефакты: скриншоты в `screenshots/` (hero, projects, bio, contact — light/dark, desktop/mobile).

Unresolved issues / risks, приоритеты следующей фазы:
- Метаданные GitHub API возвращают `{}` для вымышленных репо (ожидаемо) — при замене githubUrl на реальные метаданные подтянутся автоматически.
- Домен-заглушка alexvolkov.dev в layout.tsx/sitemap.ts/robots.ts — владелец должен заменить на свой (TODO-комментарии стоят).
- Lighthouse-прогон не выполнялся в песочнице (нет headless Chrome с Lighthouse) — но все базовые оптимизации сделаны: next/font, lazy images, code-splitting диалога, once-in-view анимации.
- Следующие фазы (для cron webDevReview): прогнать расширенный QA, добавить больше деталей стилей (микроанимации карточек, gradient borders), возможные новые фичи (сортировка проектов, поиск по тегам, секция «сейчас в работе», командная палитра).
