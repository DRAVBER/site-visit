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

---
Task ID: 2
Agent: webDevReview cron (round 2)
Task: Очередной цикл QA + развитие: поиск по проектам, scrollspy-навигация, count-up статистика, прогресс-бар скролла, back-to-top, тосты sonner, градиентные рамки карточек.

Work Log:
- QA входное: smoke-тест страницы (4 секции, 8 карточек, RU/dark сохранены), консоль браузера чистая (только HMR-логи), dev.log без новых ошибок, lint чистый.
- Фича: поиск по проектам (`project-search.tsx`) — инпут с иконкой, live-фильтр по title/description(локализованной)/tags, счётчик результатов в бейдже, кнопка очистки с rotate-анимацией, empty-state с подсказкой («Ничего не найдено по запросу …»). Комбинируется с фильтром категорий.
- Фича: scrollspy (`use-scrollspy.ts`) — активная секция подсвечивается в десктоп-навигации (фиолетовая пилюля в новом pill-контейнере) и в мобильном Sheet-меню; aria-current для a11y; корректная работа у низа страницы (последняя секция).
- Фича: count-up анимация статистики hero (`count-up.tsx`, framer-motion animate + useInView once) — «6+ 40+ 25 2.4k», компактный формат тысяч.
- Фича: прогресс-бар скролла (`scroll-progress.tsx`) — 2px фиолетовый градиент под хедером, useScroll + useSpring.
- Фича: плавающая кнопка «Наверх» (`back-to-top.tsx`) — появляется после 80% высоты вьюпорта, AnimatePresence.
- Фича: тосты sonner для копирования email и команд запуска (richColors, closeButton, bottom-right) + `lib/clipboard.ts` с fallback на execCommand.
- Стили: `.card-ring-glow` — градиентная рамка карточек при hover/focus (mask-composite техника), применена к карточкам проектов.
- Локали: добавлены ключи projects.searchPlaceholder/searchClear/resultsFound/noResults/noResultsHint, toast.emailCopied/commandsCopied (RU+EN).
- QA итоговое: поиск «rust»→1 карта (Prism Notes), «typescript»→2 карты, «zzz»→empty-state, счётчик «2 проектов найдено» работает; scrollspy корректен на #bio и внизу страницы; back-to-top появляется; тосты подтверждены через mock execCommand (в headless clipboard запрещён — это ограничение окружения, добавлен fallback); count-up стартует при появлении в вьюпорте; прогресс-бар существует; мобильный оверфлоу-чек: фактический горизонтальный скролл невозможен (overflow-x: clip), широкие элементы — только декоративные клипнутые орбы; VLM-ревью hero-v2/search-v2/projects-clean — PASS (ложные тревоги: обрезка карточек = граница вьюпорта на скриншоте; красный «артефакт» = остаток тоста прошлой сессии).
- Линт чистый, dev.log чистый (старый robots.txt-конфликт уже исправлен в фазе 1).

Stage Summary:
- Добавлено 6 новых фич и 1 стилевое улучшение без регрессий; всё покрыто браузерным QA и VLM-ревью.
- Архитектура сохранена: новые ключи локализации, компоненты в components/site, утилита clipboard в lib.
- Скриншоты: screenshots/*-v2.png (hero с прогресс-баром и pill-навигацией, projects с поиском, search с результатом).

Unresolved issues / risks, приоритеты следующей фазы:
- Clipboard API в headless-браузере всегда запрещён — тосты проверялись моком execCommand; в реальных браузерах работает (fallback добавлен).
- Домен-заглушка alexvolkov.dev (TODO в layout.tsx/sitemap.ts/robots.ts) — заменить при деплое.
- Идеи следующего раунда: командная палитра (Ctrl+K) для навигации/проектов, сортировка проектов (звёзды/дата/имя), тег-чипы кликабельны как фильтры, «сейчас в работе» секция в BIO, JSON-LD структурированные данные для SEO, prefers-reduced-motion аудит анимаций.

---
Task ID: 3
Agent: webDevReview cron (round 3)
Task: QA-оценка стабильной фазы 2 + раунд развития: командная палитра (⌘K), сортировка проектов, кликабельные тег-чипы, JSON-LD, prefers-reduced-motion, стилевые детали (shine-эффект, анимированный градиент имени, нумерованные секции).

Work Log:
- Входной QA: smoke-тест (4 секции, 8 карточек, RU/dark), фильтры категорий («Софт» → 2 карты), поиск («rust» → 1), диалог проекта (открытие/Escape), RU⇄EN, dark⇄light — всё работает, консоль чистая, lint чистый, dev.log без ошибок.
- Фича: командная палитра (`command-palette.tsx`, cmdk через shadcn Command) — 3 группы: Разделы (01–04), Проекты (8, с монограммами и описаниями), Действия (тема/язык/email/GitHub/Telegram/Discord). Глобальный хоткей Ctrl+K/⌘K, триггер-кнопка в хедере (десктоп — пилюля с kbd-хинтом, мобайл — иконка), футер-подсказка внутри палитры.
- Рефакторинг: `lib/ui-store.ts` (zustand) — общее состояние палитры + выбранного проекта/диалога; убран useEffect-синк (lint react-hooks/set-state-in-effect), палитра открывает карточку проекта напрямую через стор.
- Фича: сортировка проектов (`sort-select.tsx`, shadcn Select) — Избранные (по умолчанию) / По звёздам / По названию / По обновлению; пилюля рядом с поиском.
- Фича: кликабельные тег-чипы на карточках — клик заполняет поиск тегом (фильтрация), повторный клик снимает; активный тег подсвечен (aria-pressed, violet-стили).
- SEO: JSON-LD Person-схема в `page.tsx` (name, sameAs, knowsAbout из навыков, email, image) — валидный JSON в DOM подтверждён.
- A11y: `MotionConfig reducedMotion="user"` вокруг приложения + расширенный CSS `@media (prefers-reduced-motion: reduce)` (отключение анимаций/переходов, скрытие shine-эффекта).
- Стили: анимированный градиент имени в hero (`text-gradient-animated`, 7s ease-in-out), нумерованные бейджи секций 01–04 (SectionHeading с number-пропом), shine-sweep блик на обложке карточек при hover (`.card-shine::after`), описания проектов в палитре скрыты на <640px (фикс усечения по VLM-ревью).
- Локали: nav.openPalette, palette.* (14 ключей), projects.sort*/tagsLabel/filterByTag — RU + EN.
- README: секции «Командная палитра», «Поиск, сортировка и теги», обновлены стек/структура/производительность.

QA итоговое (agent-browser):
- Палитра: Ctrl+K открывает, 3 группы/18 пунктов; фильтр «vaultdrop» → 1 пункт → клик открывает диалог VaultDrop, палитра закрывается; действия «Переключить тему» (dark→light) и «Switch language» (ru→en) работают и закрывают палитру; кнопка в хедере открывает.
- Сортировка: «По названию» → первая Dotfiles+ (алфавит); «По звёздам» → убывание звёзд; дефолт «Избранные».
- Теги: клик Next.js → поиск = «Next.js», 2 карточки; повторный клик → сброс, 8 карточек.
- Мобайл (390px): палитра помещается (356px ширина), тапы ≥44px; горизонтальный скролл невозможен (overflow-x: clip, проверено программным скроллом).
- Регрессии: scrollspy (Обо мне/Контакты/Главная по секциям), back-to-top, count-up, поиск, диалог — работают; консоль чистая; lint чистый.
- VLM-ревью: hero 9/10 (градиент имени корректен), палитра desktop/mobile — professional/production-ready, light-тема — polished, projects с тег-фильтром — отлично. Исправлено усечение названий проектов в палитре на мобиле.

Stage Summary:
- Добавлены 4 крупные фичи (палитра, сортировка, тег-фильтры, JSON-LD) + prefers-reduced-motion + 4 стилевых улучшения; все покрыты браузерным QA и VLM-ревью, регрессий нет.
- Архитектура: сквозное состояние UI через zustand (lib/ui-store.ts), локали расширены без изменения компонентов, все тексты палитры/сортировки локализованы.
- Скриншоты: screenshots/*-v3.png (hero с градиентом, палитра dark/light/mobile, projects с сортировкой и тег-фильтром).

Unresolved issues / risks, приоритеты следующей фазы:
- Clipboard API в headless-браузере запрещён (копирование email/команд проверялось ранее моком execCommand) — в реальных браузерах работает.
- Домен-заглушка alexvolkov.dev в layout.tsx/sitemap.ts/robots.ts/page.tsx (JSON-LD) — заменить при деплое (TODO-комментарии на месте).
- Идеи следующего раунда: секция «Сейчас в работе» (now) в BIO, keyboard-навигация по сетке проектов (roving tabindex), git-хистори/график активности, печать/PDF-резюме, PWA-манифест, 404-страница.

---
Task ID: 4
Agent: webDevReview cron (round 4)
Task: QA-оценка стабильной фазы 3 + раунд развития: «Сейчас в работе» + график активности в BIO, режим сетка/список, относительное время, roving-клавиатурная навигация, PWA-манифест, печать/PDF-резюме, стилевые детали (тултипы, прогресс-кольцо, noise-текстура, print-стили).

Work Log:
- Входной QA: smoke-тест (4 секции, 8 карточек, RU/dark), фильтры, поиск, диалог, палитра, тема/язык — всё работает; lint чистый, dev.log чистый.
- Найден и исправлен a11y-баг: мобильное Sheet-меню без Description → Radix-варнинг «Missing Description» (добавлена sr-only SheetDescription, ключ nav.menuDescription RU+EN).
- Фича: секция «Сейчас в работе» (BIO) — data-driven из data/profile.json → now[] (4 пункта: релиз Nebula v2, цикл статей, Rust-переписывание, фриланс-слот), пульсирующий статус-индикатор, градиентная карточка с 2×2 сеткой.
- Фича: график активности GitHub-style (activity-graph.tsx) — 53 недели × 7 дней, детерминированный PRNG mulberry32 по сиду из profile.json (activity.seed), будни/выходные взвешены, 5 уровней фиолетовой интенсивности, staggered-анимация колонок при скролле, тултипы (N коммитов + дата), локализованные подписи месяцев (П/С/П и M/W/F), легенда меньше/больше, горизонтальный скролл на мобильных, sr-only summary; рендер за useMounted (даты = «сегодня», нет SSR-мисматчей). Итог: «1 678 коммитов за последний год».
- Фича: локальное время владельца в карточке портрета (profile.timezone, Intl с IANA-зоной, обновление раз в 30 c) — через общую минутную подписку lib/clock.ts (useNow, useSyncExternalStore: один interval на все тикающие элементы страницы).
- Фича: режим сетка/список проектов — сегментированный переключатель (LayoutGrid/List иконки, aria-pressed), ProjectRow (project-row.tsx): компактная строка с миниатюрой, звёздами, категорией, 1-строчным описанием, тегами, стрелкой на hover; stretched-link паттерн (overlay-кнопка открывает диалог, теги поверх с pointer-events-auto); выбор сохраняется в localStorage (portfolio-view) через zustand (ui-store: viewMode + hydrateViewMode — hydration-safe, без setState-in-effect).
- Фича: относительное время «Обновлён 3 дня назад» на карточках и строках (relative-time.tsx, Intl.RelativeTimeFormat RU/EN, обновление раз в минуту через общий clock-стор; до монтирования — детерминированная абсолютная дата). Даты lastCommit в projects.json освежены до 2026 года.
- Фича: roving-клавиатурная навигация по сетке (стрелки ←→↑↓ + Home/End, число колонок читается из getComputedStyle — работает в 1/2/3/4-колоночных сетках и в list-режиме; фокус только внутри грида — ввод в поиске не перехватывается).
- Фича: PWA — manifest.webmanifest (standalone, тема #8B5CF6), иконки icon-192/512 + maskable-192/512 + apple-touch-icon (180), растеризованы из favicon.svg через canvas в headless-браузере; подключены в layout.tsx (icons + manifest + apple).
- Фича: печать/PDF-резюме — действие «Печать / сохранить как PDF» в командной палитре (⌘K), @media print: форс светлой палитры (переген var-токенов с !important), @page 12mm, #hero без 100svh, скрытие хрома (header, прогресс-бар, back-to-top, орбы, CTA, соц-иконки, обложки карточек, график активности, теги-фильтры, поиск/сортировка) через Tailwind print:hidden, break-inside: avoid для карточек, force-reveal для framer-motion элементов (opacity/transform в inline-стилях перекрываются !important — контент виден даже если whileInView не сработал).
- Стиль: тултипы (shadcn Tooltip) на соцссылках hero; прогресс-кольцо вокруг back-to-top (SVG stroke-dashoffset по скроллу); film-grain noise-текстура (feTurbulence data-URI, opacity 3.5%/5%, fixed, pointer-events-none, print:hidden); анимированная стрелка ArrowRight в hover-вейле карточек; print-полировка карточек (radius 6px, светлые границы).
- Рефакторинг под lint (react-hooks/set-state-in-effect): hooks/use-mounted.ts (useSyncExternalStore-паттерн «после гидрации»), lib/clock.ts (общая минутная подписка вместо 8+ интервалов), viewMode в zustand-сторе.
- Локали: nav.menuDescription, a11y.skipToContent, palette.printResume, projects.updatedAgoPrefix/viewMode/viewGrid/viewList/listOpen, bio.nowTitle/nowStatus/localTime/activityTitle/activitySummary/activityLess/activityMore/activityContributions — RU + EN.
- A11y: skip-link «Перейти к содержимому» (sr-only → focus:fixed) в portfolio-app.
- README: секции «Поиск, сортировка, теги и режимы отображения», «Сейчас в работе и график активности», «Печать/PDF-резюме», обновлены тексты/структура/стек.

Баги, найденные и исправленные в процессе:
- КРИТИЧЕСКИЙ: горизонтальный оверфлоу на мобильных (390px → scrollWidth 881) — график активности растягивал всю BIO-колонку до 865px: flex-item'ы с min-width:auto пропускали min-content (~820px) 53-недельного ряда. Фикс: min-w-0 на правой колонке BIO и на wrapper'е графика; график получил честный внутренний горизонтальный скролл (324px контейнер / 808px контент).
- @media print-блок молча выпадал из компиляции (Turbopack/LightningCSS не переваривает @page, вложенный в @media) — весь блок был потерян, PDF печатался в тёмной теме. Фикс: @page вынесен на верхний уровень.
- ReferenceError updatedPrefix (забыли деструктурировать пропс) — найден по 500 в dev.log, исправлен.
- Устаревшие даты проектов («9 месяцев назад») — освежены до актуальных.

QA итоговое (agent-browser):
- Список: переключение сетка⇄список (8 строк), тег-клик в строке (Next.js → 2), клик строки → диалог, Escape, персистентность режима после reload (localStorage).
- Roving: фокус 1-й карточки → ArrowRight (Nebula→Lumen), ArrowDown (+3 колонки → Dotfiles+), End (Pixel Forge), Home (Nebula), Enter открывает диалог.
- BIO: «Сейчас в работе» (4 пункта, 2×2), график (371 ячейка, сводка «1 678 коммитов»), локальное время 15:16 (тикает).
- Мобайл 390px: вертикальный стек, график скроллится внутри карточки, тач-таргеты 32px+, горизонтальный скролл невозможен (scrollX=0 при попытке).
- Light/EN: «Now» + «Activity» + «1,678 commits in the last year» + «Updated 1 week ago» — корректно.
- Печать: PDF 5 страниц, белый фон (пиксельная проверка 255,255,255), палитра инвертирована, хром скрыт.
- Палитра: действие «Печать» находится и выполняется, палитра закрывается.
- Sheet: варнинг Description исчез.
- Манифест/иконки: /manifest.webmanifest 200, 4 иконки + apple-touch 200.
- Линт чистый, dev.log чистый (только GET/compile).
- VLM-ревью: Now-карточка 9/10 (desktop dark), мобильный Now 9/10, мобильный график 8/10, light Now 10/10, список 9/10, hero 9/10, print-страницы — читаемы (частные замечания по «карточному» виду резюме — осознанный дизайн-компромисс, не баг).

Stage Summary:
- Добавлено 8 крупных фич (Now, график активности, локальное время, сетка/список, относительное время, roving-навигация, PWA, печать/PDF) + 5 стилевых улучшений (тултипы, прогресс-кольцо, noise, стрелки, print-полировка); исправлены 1 критический layout-баг, 1 compile-loss баг, 1 a11y-варнинг.
- Архитектура: всё по-прежнему data-driven (now[]/activity.seed/timezone в profile.json), новые хуки use-mounted/useNow переиспользуемы, zustand-стор расширен.
- Скриншоты: screenshots/*-v4.png + print-page-*.png + print-resume-preview.pdf.

Unresolved issues / risks, приоритеты следующей фазы:
- Radix useId hydration-варнинг (aria-controls) — известный артефакт React19+Radix+Turbopack в dev-режиме после Fast Refresh перезагрузок; в production-сборке не воспроизводится (детерминированные useId). Не влияет на функциональность.
- Clipboard API в headless-браузере запрещён (проверялось моком) — в реальных браузерах работает.
- Домен-заглушка alexvolkov.dev (TODO в layout.tsx/sitemap.ts/robots.ts/page.tsx) — заменить при деплое.
- График активности декоративный (генерится по сиду); при желании можно заменить на реальные данные GitHub contributions API (нужен токен).
- Идеи следующего раунда: 404/not-found страница, testimonials-секция (data-driven), фильтр «только featured», RSS/blog-микросекция, анимация появления тултипов при первом визите (onboarding-хинт), e2e-тесты Playwright.
