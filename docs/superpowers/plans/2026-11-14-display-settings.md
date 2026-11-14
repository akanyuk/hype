# Настройки отображения (тёмная тема, крупный шрифт) — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переключатели «светлая/тёмная тема» и «текущий/крупный шрифт» в шапке обоих скинов сайта hype, с хранением выбора в `localStorage`.

**Architecture:** Inline-скрипт в `<head>` ставит `data-theme`/`data-font` на `<html>` до отрисовки; общий `display-settings.js` обслуживает кнопки, системную тему и синхронизацию вкладок. Цвета в CSS обоих скинов переводятся на CSS-переменные из `css/theme.css`, тёмная тема переопределяет только значения переменных; размеры шрифта в зоне контента — `calc(Npx * var(--font-scale))`.

**Tech Stack:** LiveStreet CMS 1.x (PHP, Smarty), jQuery, CSS custom properties; проверки — Node 26 + `puppeteer-core` (системный `/usr/bin/chromium`), `pixelmatch`, `pngjs`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-14-display-settings-design.md` (в `hype-dev-environment`)

## Global Constraints

- Код сайта — репозиторий `public_html` (ветка по умолчанию `master`), работа в ветке `feature/display-settings`. План, спецификация и инструменты проверки — репозиторий `hype-dev-environment`, ветка `main`.
- Отступление от спецификации: инструменты проверки лежат в `hype-dev-environment/tools/display-settings/`, а не в scratchpad — scratchpad не переживает сессию, а задачи могут выполнять разные агенты. В `public_html` они по-прежнему не попадают. Скриншоты — в `tools/display-settings/shots/` (в `.gitignore`).
- Атрибуты: `data-theme` ∈ {`light`,`dark`}, `data-font` ∈ {`normal`,`large`} на `document.documentElement`.
- Ключи `localStorage`: `hype-theme`, `hype-font`. Любое другое значение в хранилище трактуется как «выбора нет».
- Тема по умолчанию — `prefers-color-scheme`; шрифт по умолчанию — `normal`.
- `--font-scale`: `1` по умолчанию, `1.2` при `data-font="large"`.
- Фирменный акцент `--accent: #4ec4ff` (светлая тема).
- Контраст основного текста в тёмной теме ≥ 4.5:1.
- IE не поддерживается: фолбэки перед `var()` не пишем.
- Не трогаем: админку, `print.css`, `hype-hl.css`, файлы в `engine/lib/external/`, файлы логотипов.
- Склеенный CSS/JS кешируется в `public_html/templates/cache/<skin>/` по хешу списка файлов без учёта mtime: после любой правки CSS/JS/конфига скина выполнять `rm -f public_html/templates/cache/*/*` (скрипт `tools/display-settings/clear-cache.sh`).
- `$config['compress']['css']['use']` должен оставаться `false`: CSSTidy с `css_level = CSS2.1` вырежет `var()`/`calc()`. Проверить это и на проде перед выкладкой (см. Task 11).
- Мобильный скин выбирается плагином `mobiletpl` по User-Agent: для мобильных проверок использовать UA iPhone.
- Подписи кнопок — ключи языковых файлов скинов: `display_theme_dark` («Тёмная тема» / «Dark theme»), `display_theme_light` («Светлая тема» / «Light theme»), `display_font_large` («Крупный шрифт» / «Large font»), `display_font_normal` («Обычный шрифт» / «Normal font»). Подпись описывает действие кнопки (что включится по клику).

## Review Focus

1. **`localStorage` бросает исключение** (Safari private, запрет cookies) — страница открывается в системной теме, кнопки переключают тему в рамках страницы, в консоли нет ошибок. Тест: Task 2, `storage-blocked`.
2. **Мусорное значение в хранилище** (`hype-theme = "blue"`, осталось от старой версии) — трактуется как отсутствие выбора. Тест: Task 2, `invalid-stored-value`.
3. **Шапка пользователя с индикатором новых сообщений `+N` и длинным логином** — кнопки не перекрывают `.new-messages`, `dropdown-user`, `ul.auth`. Тест: Task 4, `header-no-overlap` с подставленным `+99`.
4. **Динамически подгружаемый контент** (новые комментарии по «обновить», модальные окна логина/избранного, всплывающие уведомления `jquery.notifier`, выпадающее меню пользователя) в тёмной теме — без белых пятен. Тест: Task 7/8, сценарии `dark-dynamic` в `shoot.mjs`.
5. **Редактор и виджеты на странице создания топика** (markitup, автокомплит тегов jQuery UI) в тёмной теме и крупном шрифте. Тест: страница `topic-add` в матрице + сценарий `dark-dynamic`.

---

## Файловая структура

`public_html` (ветка `feature/display-settings`):

| Файл | Ответственность |
|---|---|
| `templates/common/display-settings-head.tpl` (новый) | inline-скрипт применения настроек до отрисовки + `<meta name="theme-color">` |
| `templates/common/display-settings.js` (новый) | кнопки, системная тема, синхронизация вкладок, `theme-color`, aria |
| `templates/common/display-settings-buttons.tpl` (новый) | разметка двух кнопок (SVG луны/солнца, `A`/`A+`), общая для скинов |
| `templates/skin/<skin>/css/theme.css` (новый, ×2) | переменные светлой/тёмной темы, `--font-scale`, переопределения сторонних стилей, подмена спрайтов |
| `templates/skin/<skin>/css/display-settings.css` (новый, ×2) | стили и позиционирование кнопок в шапке скина |
| `templates/skin/<skin>/header.tpl` (×2) | подключение `display-settings-head.tpl` перед CSS; удалить статичный `<meta name="theme-color">` |
| `templates/skin/<skin>/header_top.tpl` (×2) | подключение `display-settings-buttons.tpl` |
| `templates/skin/<skin>/settings/config/config.php` (×2) | подключение `theme.css`, `display-settings.css`, `display-settings.js` |
| `templates/skin/<skin>/settings/language/*.php` | ключи `display_*` (desktop: ru+en; mobile: ru) |
| `templates/skin/<skin>/css/*.css` (×2) | цвета → `var()`, шрифты контента → `calc()` |
| `templates/skin/<skin>/images/*-dark.png` (новые) | тёмные копии спрайтов |

`hype-dev-environment` (ветка `main`):

| Файл | Ответственность |
|---|---|
| `tools/display-settings/package.json` | зависимости `puppeteer-core`, `pixelmatch`, `pngjs` |
| `tools/display-settings/matrix.mjs` | список страниц, скинов, ролей, тем, шрифтов; логин; UA |
| `tools/display-settings/shoot.mjs` | скриншоты матрицы в `shots/<label>/` |
| `tools/display-settings/diff.mjs` | попиксельное сравнение двух наборов, отчёт |
| `tools/display-settings/test/*.test.mjs` | поведенческие и геометрические тесты (`node --test`) |
| `tools/display-settings/darken-sprite.mjs` | генерация тёмных копий спрайтов |
| `tools/display-settings/contrast.mjs` | проверка контраста текста в тёмной теме |
| `tools/display-settings/clear-cache.sh` | очистка склеенного CSS/JS |

---

### Task 1: Инструменты проверки и эталонные скриншоты

**Files:**
- Create: `tools/display-settings/{package.json,matrix.mjs,shoot.mjs,diff.mjs,clear-cache.sh,.gitignore,README.md}` (в `hype-dev-environment`)

**Interfaces:**
- Produces:
  - `matrix.mjs`: `export const BASE = 'http://hype.local'`; `export const PAGES: {id, path}[]`; `export const SKINS = ['desktop','mobile']`; `export const ROLES = ['guest','user']`; `export async function openPage(browser, {skin, role, theme, font, path, storage?}): Page` — создаёт контекст, ставит UA (mobile → iPhone UA, viewport 390×844; desktop → 1366×900), логинится для `role='user'` через `/login/` логином/паролем из `HYPE_TEST_LOGIN`/`HYPE_TEST_PASSWORD`, до навигации через `evaluateOnNewDocument` кладёт `hype-theme`/`hype-font` в `localStorage` (если `theme`/`font` заданы; `storage: 'blocked'` подменяет `localStorage` геттером, бросающим `SecurityError`), эмулирует `prefers-color-scheme` если передан `system`.
  - CLI: `node shoot.mjs <label> [--skin desktop|mobile] [--theme light|dark] [--font normal|large] [--only <pageId>] [--dynamic]` (без `--skin` — оба скина) → `shots/<label>/<skin>-<role>-<pageId>.png` (fullPage).
  - CLI: `node diff.mjs <labelA> <labelB>` → печатает по файлу `% отличающихся пикселей`, пишет `shots/diff-<A>-<B>/*.png`, код выхода 1 если хоть один файл > 0.
- `PAGES` (id → path): `index` → `/`, `topic` → топик с ≥10 комментариями из дампа, `blogs` → `/blogs/`, `blog` → `/blog/news/`, `people` → `/people/`, `profile` → `/profile/<HYPE_TEST_LOGIN>/`, `wall` → `/profile/<HYPE_TEST_LOGIN>/wall/`, `stream` → `/stream/`, `talk` → `/talk/` (только user), `settings` → `/settings/profile/` (только user), `topic-add` → `/topic/add/` (только user), `search` → `/search/topics/?q=zx`. Конкретный URL топика выбрать запросом к БД и записать константой.
- Перед скриншотом: скрыть случайные элементы (`rndlogo`, баннеры, относительные даты при наличии) через инъекцию CSS `visibility: hidden` в `shoot.mjs`, чтобы `diff` давал 0 на неизменной странице.

- [ ] **Step 1: Подготовить тестового пользователя в локальной БД**

Выбрать обычного (не админа) активированного пользователя с топиками и комментариями; задать ему локальный пароль:
`docker compose exec -T mysql mysql -uroot -proot hype -e "UPDATE user SET user_password=MD5('test') WHERE user_login='<login>'"`.
Записать логин в `tools/display-settings/README.md` и экспортировать `HYPE_TEST_LOGIN=<login> HYPE_TEST_PASSWORD=test`.

- [ ] **Step 2: Написать инструменты по интерфейсам выше; `npm install` в `tools/display-settings`**

`clear-cache.sh`: `rm -f "$(dirname "$0")/../../public_html/templates/cache/"*/*`.

- [ ] **Step 3: Проверить детерминизм**

Run: `./clear-cache.sh && node shoot.mjs a && node shoot.mjs b && node diff.mjs a b`
Expected: все файлы `0.00%`, exit 0. Если нет — расширить список скрываемых элементов.

- [ ] **Step 4: Снять эталон**

Run: `node shoot.mjs baseline`
Expected: 2 скина × (9 страниц гостя + 12 пользователя) = 42 файла в `shots/baseline/`.

- [ ] **Step 5: Commit (hype-dev-environment)**

```bash
git add tools/display-settings
git commit -m "Add display settings verification tools"
```

---

### Task 2: Ядро настроек — head-скрипт и `display-settings.js`

**Files:**
- Create: `public_html/templates/common/display-settings-head.tpl`, `public_html/templates/common/display-settings.js`
- Create: `public_html/templates/skin/{synio-hype-mod,mobile-hype-mod}/css/theme.css` (пока только `:root { --font-scale: 1; }` и `html[data-font="large"] { --font-scale: 1.2; }`)
- Modify: `public_html/templates/skin/{synio-hype-mod,mobile-hype-mod}/header.tpl` — `{include file="{cfg name='path.root.server'}/templates/common/display-settings-head.tpl"}` сразу после `<meta charset>`, до `{$aHtmlHeadFiles.css}`; удалить статичный `<meta name="theme-color" content="#000000">` (переезжает в head-шаблон)
- Modify: `public_html/templates/skin/{synio-hype-mod,mobile-hype-mod}/settings/config/config.php` — `theme.css` в `head.default.css` сразу после `reset.css`; `___path.static.root___/templates/common/display-settings.js` в `head.default.js` последним
- Test: `tools/display-settings/test/behavior.test.mjs` (в `hype-dev-environment`)

**Interfaces:**
- Consumes: `openPage` из Task 1.
- Produces:
  - глобальный объект `window.hypeDisplay` (определяется в head-скрипте, расширяется в `display-settings.js`):
    - `hypeDisplay.get(name: 'theme'|'font'): string` — текущее применённое значение;
    - `hypeDisplay.set(name, value: string): void` — применяет, сохраняет в `localStorage` (без исключений наружу), обновляет кнопки и `theme-color`;
    - `hypeDisplay.toggle(name): void`.
  - Делегированный обработчик кликов на `document` по `[data-display-toggle="theme"|"font"]` → `toggle`. Кнопкам выставляется `aria-pressed` (`true` при `dark`/`large`), `title` и `aria-label` берутся из атрибутов `data-label-on`/`data-label-off` кнопки (их заполняет Task 4).
  - `<meta name="theme-color">`: `#000000` в светлой теме (как сейчас), в тёмной — значение `--bg-header` тёмной темы, вычисленное через `getComputedStyle`.

Head-скрипт — без jQuery, ES5 (код до загрузки jQuery), ≤ 25 строк.

- [ ] **Step 1: Написать падающие тесты `behavior.test.mjs`** (оба скина, гость)

```js
// каждый тест: const page = await openPage(browser, {skin, role:'guest', path:'/', ...})
test('system-dark-default', ...)      // system:'dark', без storage → data-theme === 'dark'
test('system-light-default', ...)     // system:'light' → 'light'; data-font === 'normal'
test('stored-overrides-system', ...)  // system:'dark', theme:'light' → 'light'
test('applied-before-css', ...)       // в evaluateOnNewDocument: MutationObserver фиксирует data-theme
                                      // на момент появления первого <link rel=stylesheet> → уже 'dark'
test('toggle-persists', ...)          // hypeDisplay.toggle('theme') → localStorage['hype-theme'] === 'dark';
                                      // reload → data-theme === 'dark'
test('system-change-live', ...)       // без выбора: emulateMediaFeatures light→dark → data-theme 'dark' без reload
test('system-ignored-after-choice', ...) // set('theme','light'), затем system dark → остаётся 'light'
test('tabs-sync', ...)                // две страницы одного контекста; toggle в первой → во второй data-theme меняется
test('font-toggle', ...)              // toggle('font') → data-font 'large', hype-font 'large'
test('theme-color-meta', ...)         // dark → content !== '#000000'; light → '#000000'
test('storage-blocked', ...)          // storage:'blocked', system:'dark' → 'dark'; toggle → 'light'; pageerror не было
test('invalid-stored-value', ...)     // hype-theme='blue', system:'light' → 'light'; hype-font='huge' → 'normal'
```

- [ ] **Step 2: Запустить — должны упасть**

Run: `node --test test/behavior.test.mjs`
Expected: FAIL (`data-theme` = null / `hypeDisplay` undefined).

- [ ] **Step 3: Реализовать head-шаблон, `display-settings.js`, подключения в `header.tpl` и `config.php`**

Head-шаблон оборачивает скрипт в `{literal}`. В `display-settings.js` слушатель `matchMedia(...).addEventListener('change', …)` применяет системную тему только если в хранилище нет валидного значения; слушатель `storage` применяет новое значение ключа (или системную тему при удалении).

- [ ] **Step 4: Очистить кеш, прогнать тесты**

Run: `./clear-cache.sh && node --test test/behavior.test.mjs`
Expected: PASS все 12 × 2 скина.

- [ ] **Step 5: Регрессия**

Run: `node shoot.mjs t2 && node diff.mjs baseline t2`
Expected: `0.00%` везде (кнопок ещё нет, `theme.css` без цветов).

- [ ] **Step 6: Commit**

```bash
cd public_html && git checkout -b feature/display-settings
git add templates/common templates/skin/*/css/theme.css templates/skin/*/header.tpl templates/skin/*/settings/config/config.php
git commit -m "Add display settings core: early apply script and toggles"
cd .. && git add tools/display-settings/test && git commit -m "Add display settings behavior tests"
```

---

### Task 3: Мобильная шапка — перенос «Прямой эфир», «Новости», «Поиск» в боковое меню

**Files:**
- Modify: `public_html/templates/skin/mobile-hype-mod/header_top.tpl` — удалить `li.icon-stream-lg`, `li.icon-news-lg`, `li#item-search`
- Modify: `public_html/templates/skin/mobile-hype-mod/userbar_menu.tpl` — в начало `ul.userbar-menu-items` (первый список) три пункта; удалить старый пункт «Новости» (ссылка `{router page='blog'}news`)
- Modify: `public_html/templates/skin/mobile-hype-mod/js/template.js` — подсветка непрочитанного переключается с `.icon-stream-lg`/`.icon-news-lg` на пункты меню и `#userbar-trigger`
- Modify: `public_html/templates/skin/mobile-hype-mod/css/base.css` — стили `.unread` у пунктов и у `#userbar-trigger`
- Modify: `public_html/templates/skin/mobile-hype-mod/settings/language/russian.php` — ключ `userbar_live` («Прямой эфир»); «Новости» — `{$oConfig->GetValue('plugin.newsblock.header')}`, «Поиск» — `{$aLang.search}`
- Test: `tools/display-settings/test/mobile-menu.test.mjs`

**Interfaces:**
- Produces: пункты меню `<li class="userbar-item-live">`, `<li class="userbar-item-news">`, `<li class="userbar-item-search">`, каждый с иконкой в `.holder` (`icon-profile-activity-white`, `icon-news-white`, иконка поиска из `icons2-4.png`/`icons.png` белого набора, если есть; иначе без иконки) и ссылкой `href="#"` с обработчиком `ls.tools.slide($('#stream-block'|'#news-block'|'#search'), $(this).closest('li'), false)` после `$(document).scrollTop(0)`; `ls.tools.slide` уже вызывает `ls.tools.hideuserbar()`.
- Класс `unread`: на `li.userbar-item-live` при `#unread-stream`, на `li.userbar-item-news` при `#unread-news`, на `#userbar-trigger` при любом из них.
- В `nav-userbar` после задачи остаются: `#next-comment-toolbar` (user, если есть), `li#item-auth` (guest); Task 4 добавляет кнопки перед `item-auth` / в конец.

- [ ] **Step 1: Написать падающие тесты `mobile-menu.test.mjs`** (skin mobile, guest и user)

```js
test('header-icons-moved', ...)   // в #header нет .icon-stream-lg, .icon-news-lg, #item-search
test('menu-items-present', ...)   // в #userbar: .userbar-item-live, .userbar-item-news, .userbar-item-search — по одному,
                                  // идут первыми в первом ul.userbar-menu-items; ссылки на блог новостей (href$="/blog/news") в меню нет
test('menu-opens-panel', ...)     // для каждого пункта: открыть меню (#userbar-trigger click), клик по пункту →
                                  // через 600 мс соответствующая панель видима (#stream-block / #news-block / #search),
                                  // меню закрыто (#userbar left < 0), остальные .slide скрыты
test('unread-highlight', ...)     // вставить в DOM до ready нельзя — проверяем по факту страницы: если есть #unread-stream,
                                  // то .userbar-item-live и #userbar-trigger имеют .unread; иначе нет;
                                  // плюс синтетический случай: page.evaluateOnNewDocument добавляет на DOMContentLoaded
                                  // (до jQuery ready) <span id="unread-news"> в body → .userbar-item-news.unread и #userbar-trigger.unread
```

- [ ] **Step 2: Запустить — FAIL**

Run: `node --test test/mobile-menu.test.mjs`

- [ ] **Step 3: Реализовать изменения шаблонов, `template.js`, CSS, языкового ключа**
- [ ] **Step 4: Тесты**

Run: `./clear-cache.sh && node --test --test-concurrency=1 test/`
Expected: PASS все.

- [ ] **Step 5: Регрессия** — `node shoot.mjs t3 --skin mobile && node diff.mjs baseline t3`; отличия только в шапке и (на скриншотах не видно) в меню; десктоп не затронут: `node shoot.mjs t3d --skin desktop && node diff.mjs baseline t3d` → identical. Скриншот открытого меню гостя и пользователя осмотреть глазами.
- [ ] **Step 6: Commit**

---

### Task 4: Кнопки в шапке обоих скинов

**Files:**
- Create: `public_html/templates/common/display-settings-buttons.tpl`
- Create: `public_html/templates/skin/{synio-hype-mod,mobile-hype-mod}/css/display-settings.css` (подключить в `config.php` после `navs.css`)
- Modify: `public_html/templates/skin/synio-hype-mod/header_top.tpl` — include перед `{if $oUserCurrent}` (вне условия)
- Modify: `public_html/templates/skin/mobile-hype-mod/header_top.tpl` — include внутри `ul.nav-userbar`: у гостя непосредственно перед `li#item-auth`, у пользователя в конце списка (одно место в разметке: перед `{if !$oUserCurrent}` блока `item-auth`)
- Modify: `settings/language/russian.php` обоих скинов, `synio-hype-mod/settings/language/english.php` — ключи из Global Constraints
- Test: `tools/display-settings/test/header.test.mjs`

**Interfaces:**
- Consumes: `hypeDisplay`, атрибут `data-display-toggle`, `data-label-on`/`data-label-off` (Task 2).
- Produces: шаблон принимает параметр `tag` (`{include … tag='li'}` в мобильном, по умолчанию `span`-обёртка в десктопе). Внутри — два `<button type="button" class="display-toggle display-toggle-theme|font" data-display-toggle="theme|font" data-label-on="…" data-label-off="…">`. Тема: два inline SVG (луна `.icon-moon`, солнце `.icon-sun`, `fill: currentColor`), видимость переключается CSS по `html[data-theme]`. Шрифт: текст `A`, при `large` — `A+` (через CSS `::after`, без JS). Обёртка: `id="display-settings"`.
- Десктоп: блок спозиционирован абсолютно в шапке, как соседи (`#header .auth`, `#header .new-messages` в `css/base.css`); для гостя — левее `ul.auth`, для пользователя — левее `.new-messages` (если есть) и `#dropdown-user`. Различие задаётся селекторами по соседу (`#display-settings.is-guest` / `.is-user` — класс выставляет шаблон по `$oUserCurrent`) и, при наличии, `.has-new-messages` (по `$iUserCurrentCountTalkNew`).

- [ ] **Step 1: Написать падающие тесты `header.test.mjs`**

```js
// матрица: skin × role, страница '/'
test('buttons-present', ...)    // ровно 1 [data-display-toggle=theme] и 1 [data-display-toggle=font], видимы
test('click-toggles', ...)      // клик по теме → data-theme меняется, aria-pressed 'true', title === подпись 'Светлая тема'
test('header-no-overlap', ...)  // bounding box #display-settings не пересекается с .auth / #dropdown-user /
                                // .new-messages / .site-name / #nav-main (desktop) и с соседними li (mobile);
                                // для user дополнительно с подставленным в DOM `<a class="new-messages">+99</a>`
                                // и логином, обрезанным до max-width (проверяем на реальной вёрстке после вставки)
test('header-height-same', ...) // высота #header равна высоте до изменений (замерить на ветке master, записать константой в тест)
```

- [ ] **Step 2: Запустить — FAIL (кнопок нет)**

Run: `node --test test/header.test.mjs`

- [ ] **Step 3: Реализовать шаблон, CSS, языковые ключи, include в шапках**

Цвет иконок в шапке — как у соседних ссылок шапки (в десктопе `#cfcfcf` на тёмной шапке; в мобильном — как иконки `nav-userbar`); в этой задаче цвета пишутся литералами, переводятся на переменные в Task 5/6.

- [ ] **Step 4: Прогнать тесты**

Run: `./clear-cache.sh && node --test test/`
Expected: PASS `behavior` и `header`.

- [ ] **Step 5: Регрессия**

Run: `node shoot.mjs t4 && node diff.mjs baseline t4`
Expected: отличия только в области шапки (проверить diff-картинки глазами); вне шапки 0.

- [ ] **Step 6: Commit** (`public_html`: шаблоны, CSS, конфиги, языки; `hype-dev-environment`: `test/header.test.mjs`)

---

### Task 5: Десктоп — цвета на переменные (светлая тема без изменений)

**Files:**
- Modify: `public_html/templates/skin/synio-hype-mod/css/theme.css` — блок `:root` со светлыми значениями
- Modify: все `public_html/templates/skin/synio-hype-mod/css/*.css`, кроме `print.css`, `hype-hl.css`, `reset.css` (в `reset.css` — только если там есть цвета фона/текста body), включая `smoothness/jquery-ui.css` и `display-settings.css`
- Modify: шаблоны десктопа с inline-цветами (найти `grep -rlE 'style="[^"]*(color|background)' templates/skin/synio-hype-mod`) — вынести в классы
- Test: `diff.mjs`

**Interfaces:**
- Produces: имена переменных (используются в Task 6–9, единые для обоих скинов): `--bg-page`, `--bg-surface`, `--bg-surface-alt`, `--bg-input`, `--bg-hover`, `--bg-header`, `--text`, `--text-muted`, `--text-faint`, `--text-inverse`, `--link`, `--link-hover`, `--accent`, `--border`, `--border-strong`, `--shadow`, `--positive`, `--positive-bg`, `--negative`, `--negative-bg`, `--warning`, `--warning-bg`, `--info`, `--info-bg`, `--comment-new`, `--comment-self`, `--code-bg`, `--btn-bg-from`, `--btn-bg-to`, `--btn-border`, `--btn-text`, `--btn-primary-from`, `--btn-primary-to`, `--btn-primary-text`. Добавлять новые можно только для цвета с особой ролью; добавленные имена дописать в шапку `theme.css` комментарием с ролью.
- Правило сведения оттенков (из спеки): близкие оттенки одной роли → одна переменная; каждое сведение, дающее видимое отличие, — в `docs/superpowers/reports/display-settings-light-diff.md` (hype-dev-environment): переменная, исходные цвета, файл:строка, скриншот diff.

- [ ] **Step 1: Инвентаризация**

Run: `grep -noiE '#[0-9a-f]{3,6}\b|rgba?\([^)]*\)' templates/skin/synio-hype-mod/css/*.css | grep -v -e print.css -e hype-hl.css`
Составить таблицу цвет → роль → переменная (в отчёт).

- [ ] **Step 2: По одному файлу (порядок: `base`, `common`, `grid`, `text`, `forms`, `buttons`, `navs`, `icons`, `tables`, `topic`, `comments`, `blocks`, `modals`, `blog`, `profile`, `wall`, `infobox`, `jquery.notifier`, `smoothness/jquery-ui`, `display-settings`): заменить цвета, затем проверить**

Run после каждого файла: `./clear-cache.sh && node shoot.mjs t5 --skin desktop && node diff.mjs t4 t5` (эталон после изменения шапок — снимок `t4` из Task 4)
Expected: 0% либо отличия, занесённые в отчёт как осознанные.

- [ ] **Step 3: Контроль полноты**

Run: `grep -noiE '#[0-9a-f]{3,6}\b|rgba?\(' templates/skin/synio-hype-mod/css/*.css templates/skin/synio-hype-mod/css/smoothness/*.css | grep -v -e print.css -e hype-hl.css -e theme.css`
Expected: пусто, кроме строк, помеченных комментарием `/* theme: fixed */` (цвет одинаков в обеих темах, например белый текст на акцентной кнопке).

- [ ] **Step 4: Тесты**

Run: `node --test test/`
Expected: PASS.

- [ ] **Step 5: Commit** (`public_html` по группам файлов — допустимо несколько коммитов; отчёт — в `hype-dev-environment`)

---

### Task 6: Мобильный — цвета на переменные

Как Task 5 для `templates/skin/mobile-hype-mod/` (порядок файлов: `base`, `common`, `grid`, `text`, `forms`, `buttons`, `navs`, `icons`, `tables`, `topic`, `comments`, `blocks`, `modals`, `blog`, `profile`, `wall`, `jquery.notifier`, `smoothness/jquery-ui`, `tinymce`, `display-settings`), с теми же именами переменных из Task 5 и своими значениями. Проверка: `node shoot.mjs t6 --skin mobile && node diff.mjs t4 t6`; контрольный grep; `node --test test/`; отчёт дополняется разделом «Мобильный».

---

### Task 7: Десктоп — тёмная тема

**Files:**
- Modify: `public_html/templates/skin/synio-hype-mod/css/theme.css` — блок `html[data-theme="dark"]` (значения всех переменных + `color-scheme: dark`); в конце файла — переопределения под `html[data-theme="dark"]` для `engine/lib/external/jquery/markitup/skins/synio/style.css`, `markitup/sets/synio/style.css`, `jcrop/jquery.Jcrop.css`, `prettify/prettify.css`
- Create: `tools/display-settings/contrast.mjs`
- Modify: `tools/display-settings/shoot.mjs` — флаг `--dynamic` (см. ниже)

**Interfaces:**
- Consumes: переменные из Task 5.
- Produces: `node contrast.mjs <skin> <role> <pageId> [--theme dark]` → для всех видимых текстовых узлов считает контраст `color` к эффективному фону (первый непрозрачный `background-color` вверх по дереву), печатает нарушения `< 4.5` для основного текста (`--text`) и `< 3` для `--text-muted`/`--text-faint`/крупного текста; exit 1 при нарушениях.
- `--dynamic` в `shoot.mjs`: на странице `topic` — открыть модальное окно избранного/логина, вызвать `ls.msg.notice('Тест','Тест')` (jquery.notifier), раскрыть `#dropdown-user-menu` (user), нажать «обновить комментарии»; на `topic-add` — фокус в редакторе markitup и ввод в поле тегов для показа автокомплита jQuery UI. Скриншоты с суффиксом `-dyn`.

- [ ] **Step 1: Написать падающий тест `test/theme.test.mjs` и `contrast.mjs`**

```js
// skin='desktop', оба role, страницы index и topic, theme:'dark'
test('dark-bg-applied', ...)   // относительная яркость getComputedStyle(body).backgroundColor < 0.05,
                               // фона .topic (или #content) < 0.08, color у .topic-content > 0.7
```

Run: `node --test test/theme.test.mjs`
Expected: FAIL — фон в тёмной теме ещё белый.

- [ ] **Step 2: Задать тёмные значения переменных и переопределения сторонних стилей**

Палитра: фон страницы ~`#121417`, поверхности ~`#1b1e23`/`#22262c`, текст ~`#e3e6ea`, приглушённый ~`#a3a9b3`, рамки ~`#33383f`, акцент — оставить `#4ec4ff` (контраст на тёмном фоне достаточный), ссылки — светлее светлотемных; состояния — те же оттенки с затемнёнными фонами. Точные значения подбираются по контрасту.

- [ ] **Step 3: Проверка**

Run: `./clear-cache.sh && node --test test/theme.test.mjs && node shoot.mjs dark7 --skin desktop --theme dark --dynamic` и для каждой страницы матрицы `node contrast.mjs desktop <role> <page> --theme dark`
Expected: `dark-bg-applied` PASS; контраст — exit 0; на скриншотах (смотреть все, включая `-dyn`) нет светлых участков, кроме иконок-спрайтов и нарисованных фонов (Task 9).

- [ ] **Step 4: Регрессия светлой темы и тесты**

Run: `node shoot.mjs t7 --skin desktop && node diff.mjs t5 t7 && node --test test/`
Expected: 0% отличий от Task 5; PASS.

- [ ] **Step 5: Commit**

---

### Task 8: Мобильный — тёмная тема

Как Task 7 для `mobile-hype-mod`; сторонние переопределения — для `markitup/skins/simple/style.css` и `markitup/sets/default/style.css`; значения тёмных переменных согласованы с десктопными (те же роли — те же цвета), если мобильная светлая палитра не требует иного. Тест `dark-bg-applied` в `test/theme.test.mjs` расширить на `skin='mobile'` (сначала FAIL). Проверка: `shoot.mjs dark8 --skin mobile --theme dark --dynamic`, `contrast.mjs mobile …`, `diff.mjs t6 t8` для светлой, `node --test test/`.

---

### Task 9: Спрайты и нарисованные фоны

**Files:**
- Create: `tools/display-settings/darken-sprite.mjs`
- Create: `public_html/templates/skin/synio-hype-mod/images/{icons,icons-synio,icons2-4,icons-white}-dark.png` (только те, где реально есть тёмные глифы; `icons2-4.png` — проверить, к какому скину относится, по `grep -rn icons2-4 templates/skin`), `public_html/templates/skin/mobile-hype-mod/images/icons-dark.png`; при необходимости `loader-dark.gif`, `update-dark.gif`
- Modify: `theme.css` обоих скинов — подмена `background-image` под `html[data-theme="dark"]` для всех селекторов, использующих эти спрайты
- Modify: CSS, где используются `dots.png`, `block-sep.png`, `sidebar-border.png`, `dropdown-user-shadow.png` → `border`/`box-shadow`/`linear-gradient` на переменных; файлы картинок не удалять (могут использоваться плагинами), только перестать ссылаться

**Interfaces:**
- Produces: `node darken-sprite.mjs <in.png> <out.png> [--threshold-l 0.45] [--threshold-s 0.25] [--target-l 0.85]` — для каждого пикселя с alpha > 0, HSL-насыщенностью < `threshold-s` и светлотой < `threshold-l` ставит светлоту `target-l - L` (инвертирует яркость серых, сохраняя alpha и тон); цветные пиксели не трогает; размер и геометрия сохраняются.

- [ ] **Step 1: Тест генератора** — `test/darken-sprite.test.mjs`: на синтетическом PNG 3×1 (чёрный непрозрачный, красный `#e00`, полупрозрачный серый) → чёрный стал светлым (L > 0.7), красный без изменений, alpha серого сохранена; размер выхода равен входу. Запустить — FAIL.
- [ ] **Step 2: Реализовать `darken-sprite.mjs`** (`pngjs`), прогнать тест — PASS.
- [ ] **Step 3: Сгенерировать тёмные спрайты, осмотреть их глазами** (Read на PNG), при необходимости подстроить пороги.
- [ ] **Step 4: Подменить спрайты в `theme.css`; заменить нарисованные фоны на CSS.**

Селекторы для подмены: `grep -rn "icons-synio.png\|icons.png\|icons2-4.png\|icons-white.png" templates/skin/<skin>/css/` — в `theme.css` перечислить те же селекторы с `background-image: url(../images/<name>-dark.png)`.

- [ ] **Step 5: Логотипы и лоадеры** — на скриншотах `dark7`/`dark8` проверить `rndlogo`, `hypelogo5_87x28.png`, `loader.gif`, `update.gif`; при сливании логотипа — подложка/обводка CSS в `theme.css`; GIF с белым фоном — тёмная версия и подмена.
- [ ] **Step 6: Проверка**

Run: `./clear-cache.sh && node shoot.mjs dark9 --theme dark --dynamic && node shoot.mjs t9 && node diff.mjs t8 t9 && node --test test/`
Expected: иконки видимы в тёмной теме; светлая — 0% отличий от `t8` (кроме мест замены нарисованных фонов на CSS — занести в отчёт, если видны); PASS.

- [ ] **Step 7: Commit**

---

### Task 10: Крупный шрифт в зоне контента

**Files:**
- Modify: CSS обоих скинов — `font-size` и текстовые `line-height` в зоне контента → `calc(Npx * var(--font-scale))`
- Test: `tools/display-settings/test/font.test.mjs`

**Interfaces:**
- Consumes: `--font-scale` (Task 2).
- Зона контента — селекторы внутри: десктоп `#content`, `#sidebar`, модальные окна `.modal`; мобильный `#content`, `#sidebar`/`.slide` (выдвижные блоки поиска, потока, новостей), `.modal`. Не масштабировать: `#header` и всё внутри, `#nav-main`, `.nav-*` меню разделов, `.vote*`, `#userbar` (мобильное меню), `#footer`, `.toolbar*`.
- Фиксированные `height` текстовых блоков в зоне контента → `min-height` или `calc(… * var(--font-scale))`.

- [ ] **Step 1: Написать падающие тесты `font.test.mjs`** (skin × role, страницы `topic`, `index`, `profile`, `talk`, `topic-add`)

```js
test('content-scaled', ...)      // font-size .topic-content p и .comment-content: large / normal ≈ 1.2 (±0.01)
test('sidebar-scaled', ...)      // то же для текста блоков сайдбара (desktop)
test('header-not-scaled', ...)   // font-size и bbox #header и его потомков одинаковы в normal/large
test('nav-not-scaled', ...)      // #nav-main / меню разделов / .vote — одинаковы
test('no-overflow', ...)         // large: в #content нет элементов с scrollWidth > clientWidth+1
                                 // при overflow:hidden и нет текстовых элементов, обрезанных по высоте (scrollHeight > clientHeight+1 при overflow:hidden)
```

- [ ] **Step 2: Запустить — FAIL** (`content-scaled`: отношение 1.0).
- [ ] **Step 3: Перевести `font-size`/`line-height` в зоне контента на `calc()`** — пофайлово, оба скина. Где шрифт задан у общего предка (например, `body` 12px) и наследуется в контент — масштабировать на корне зоны (`#content`, `#sidebar`, `.modal`), а не у `body`.
- [ ] **Step 4: Тесты и регрессия**

Run: `./clear-cache.sh && node --test test/ && node shoot.mjs t10 && node diff.mjs t9 t10`
Expected: PASS; текущий шрифт — 0% отличий от `t9`.

- [ ] **Step 5: Скриншоты крупного режима, осмотр** — `node shoot.mjs large10 --font large` и `node shoot.mjs dlarge10 --font large --theme dark --dynamic`; ничего не наезжает и не обрезается.
- [ ] **Step 6: Commit**

---

### Task 11: Финальный проход и подготовка к выкладке

**Files:**
- Create: `docs/superpowers/reports/display-settings-final.md` (hype-dev-environment)

- [ ] **Step 1: Полная матрица**

Run: `./clear-cache.sh && for t in light dark; do for f in normal large; do node shoot.mjs final-$t-$f --theme $t --font $f --dynamic; done; done && node --test test/ && node diff.mjs baseline final-light-normal`
Expected: тесты PASS; `diff` — только области шапки (кнопки) и отличия, перечисленные в отчёте о сведении оттенков.

- [ ] **Step 2: Контраст по всей матрице тёмной темы** — `contrast.mjs` для всех skin × role × page; exit 0.
- [ ] **Step 3: Отчёт** — `display-settings-final.md`: что сделано, список осознанных отличий светлой темы с картинками diff, пары скриншотов светлая/тёмная/крупный для главной и топика по обоим скинам, известные ограничения.
- [ ] **Step 4: Чек-лист выкладки в отчёте:** на проде `compress.css.use = false`; после выкладки очистить `templates/cache/*/`; хеш склеенного CSS изменится сам (новый список файлов), браузерный кеш не помешает.
- [ ] **Step 5: Commit** (отчёт — `hype-dev-environment`). Ветку `feature/display-settings` не мержить и не пушить без решения пользователя.
