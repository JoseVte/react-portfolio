# Portfolio

Personal portfolio site. A Laravel backend renders React pages through Inertia, with server side
rendering, bilingual content (English and Spanish) and an IP restricted admin area for managing
photos and board games.

Live at [app.josrom.io](https://app.josrom.io).

## Tech stack

| Layer | Stack |
| --- | --- |
| Backend | [Laravel 13](https://laravel.com) on PHP 8.5 |
| Frontend | [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org) |
| Bridge | [Inertia.js 3](https://inertiajs.com) with SSR |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) and [Flowbite React](https://flowbite-react.com) |
| Build | [Vite 8](https://vite.dev) |
| i18n | [i18next](https://www.i18next.com) |
| Storage | Backblaze B2 through Flysystem S3 |
| Cache and queue | Redis and the database queue |
| Testing | [Pest 5](https://pestphp.com) and [Vitest 4](https://vitest.dev) |
| Monitoring | [Sentry](https://sentry.io) and [Laravel Nightwatch](https://nightwatch.laravel.com) |

## Features

- **Server side rendering.** Pages are pre rendered for fast first paints and for crawlers.
- **Bilingual.** Every public string exists in English and Spanish, with the browser language
  detected automatically and a switch in the header.
- **Installable PWA.** A manifest, a service worker and an offline page are served from `public/`.
  Hashed build assets are cached, page loads always go to the network first.
- **GitHub feed.** Public repositories and the contribution calendar, paginated with infinite scroll.
- **Steam library.** Recently played games with achievement progress, plus the full owned library.
- **Playroom.** A board game collection with bilingual descriptions, sortable from the admin area.
- **Admin area.** Upload and delete photos, manage board games. Access is limited by IP address.
- **Light and dark themes.** Persisted in localStorage and in a cookie so SSR renders the right one.

## Project structure

```text
app/
├── Console/Commands/     # sitemap generation
├── Enums/                # ImageCategory
├── Http/
│   ├── Controllers/      # public controllers plus Admin/
│   ├── Middleware/       # IP allowlist, appearance cookie, Inertia
│   └── Requests/         # form requests
├── Models/               # Image, PlayroomGame, User
├── Observers/            # keep stored files in step with records
└── Services/             # GitHub, Steam and image upload

resources/js/
├── components/           # shared UI, plus sections/admin
├── hooks/                # appearance, dark mode, scroll, viewport
├── layouts/              # default layout
├── pages/                # homepage, about, projects, more, admin
├── tests/                # Vitest suite
├── types/                # TypeScript definitions
├── i18n.tsx              # every translation string
└── app.tsx               # client entrypoint (ssr.tsx for SSR)
```

## Getting started

Requires PHP 8.5, Composer, Node 24 (see `.nvmrc`) and Redis.

```bash
git clone <repo-url> portfolio
cd portfolio

composer install
npm install

cp .env.example .env
php artisan key:generate

touch database/database.sqlite
php artisan migrate
```

Then start everything at once:

```bash
composer run dev
```

That runs the PHP server, the queue worker, the log tailer and Vite together. For a build that
includes the SSR bundle, use `composer run dev:ssr`.

### Configuration

| Variable | Purpose |
| --- | --- |
| `ALLOWED_IPS` | Comma separated IPs or CIDR ranges allowed into `/admin`. Everything else gets a 401. |
| `CACHE_STORE` | Must be `redis` or `memcached`. The GitHub and Steam caches use tags, which the database and file stores do not support. |
| `FILESYSTEM_DISK` | `backblaze` in production, `public` locally. Uploaded images live here. |
| `B3_*` | Backblaze B2 credentials, bucket and endpoint. |
| `GITHUB_OAUTH_TOKEN` | Personal access token used to list repositories. |
| `STEAM_API_KEY`, `STEAM_USER_ID`, `STEAM_API_URL`, `STEAM_STORE_URL` | Steam Web API credentials and endpoints. |
| `SENTRY_LARAVEL_DSN` | Backend error reporting. |
| `VITE_*` | Local development only. Production values are set on the build step in the deploy workflow, see [Client side configuration](#client-side-configuration). |

## Testing

```bash
php artisan test        # backend, Pest
npm run test            # frontend, Vitest
npm run test:watch      # frontend, watch mode
```

The backend suite covers the models, the observers, every controller, the IP allowlist, the
external API clients (with faked HTTP) and the PWA assets. The frontend suite covers the
components and hooks, and asserts that both locales stay in sync.

## Code quality

```bash
vendor/bin/pint         # PHP formatting
npm run types           # TypeScript
npm run lint            # ESLint with --fix
npm run format          # Prettier
```

CI runs the same checks in report only mode, so anything unformatted fails the build.

## Translations

Every string lives in `resources/js/i18n.tsx`. Both locales must define the same keys with the
same interpolation placeholders. `resources/js/tests/i18n.test.ts` fails the build otherwise, and
it also checks that every `t('...')` call in the codebase resolves.

## PWA

`public/manifest.json`, `public/sw.js`, `public/offline.html` and `public/icons/` are committed, not
generated at deploy time. The service worker:

- Precaches the offline page, the manifest and the app icons.
- Serves hashed assets under `/build/` cache first, refreshing them in the background.
- Fetches pages from the network, falling back to the offline page when there is no connection.
- Leaves everything else (Inertia visits, the JSON API, remote images) alone.

After changing the precached list, bump `VERSION` in `public/sw.js` so old caches are dropped.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which:

1. Runs the full backend and frontend suites. Nothing ships on a red build.
2. Installs production Composer dependencies and builds the client and SSR bundles. The server
   never builds anything, which is what used to exhaust its memory.
3. Rsyncs the release to the server, excluding everything the server owns (`.env`, `storage/`,
   `bootstrap/cache/`, the `public/storage` symlink).
4. Triggers the Forge deployment webhook and fails if Forge does not return a 2xx.
5. Polls the health endpoint until the site answers.

### Required secrets

Secrets: `SSH_PRIVATE_KEY`, `SSH_USER`, `SSH_HOST`, `SSH_KNOWN_HOSTS` (from
`ssh-keyscan -H <host>`), `DEPLOY_PATH`, `FORGE_DEPLOY_URL` and optionally `HEALTHCHECK_URL`.

`SSH_HOST` is the server IP, not the domain: the domain sits behind Cloudflare and port 22 is
not reachable through it.

Variables: the nine `VITE_*` keys described under
[Client side configuration](#client-side-configuration).

### Forge deploy script

The workflow uploads `vendor/`, `public/build/` and `bootstrap/ssr/` already built, so the Forge
script must not build anything. Building on the server is what used to exhaust its memory.

```bash
cd $FORGE_SITE_PATH

# vendor/ arrives by rsync and Forge never runs Composer, so the compiled package manifest
# still describes the previous release. Drop it before anything reads it, otherwise a
# provider from a package that no longer exists on disk can fatal the whole application.
$FORGE_PHP artisan clear-compiled

$FORGE_PHP artisan migrate --force
$FORGE_PHP artisan optimize

# Chunks are content hashed and the deploy keeps the previous ones around so visitors mid
# session do not hit a 404. Drop the ones old enough that nobody is still requesting them.
find public/build/assets -type f -mtime +7 -delete 2>/dev/null || true
find bootstrap/ssr/assets -type f -mtime +7 -delete 2>/dev/null || true

$FORGE_PHP artisan queue:restart
$FORGE_PHP artisan inertia:stop-ssr || true

( flock -w 10 9 || exit 1
    echo 'Restarting FPM...'; sudo -S service $FORGE_PHP_FPM reload ) 9>/tmp/fpmlock
```

`inertia:stop-ssr` lets the Forge daemon running `php artisan inertia:start-ssr` come back on the
new bundle. Keep that daemon, and point the site health check at `/up`.

Three things the script deliberately no longer does:

- `npm install` and `npm run build:ssr`, because CI already built those.
- `erag:pwa-update-manifest`, because `public/manifest.json` is versioned now and a test keeps it
  in step with `config/pwa.php`.
- `cache:clear`. The GitHub and Steam caches carry a version suffix in their keys, so a release
  that changes what they store cannot read the previous shape. Leaving the cache warm keeps the
  first request after a deploy from having to walk the whole Steam API again.

Push to deploy is switched off in Forge on purpose. The deployment only ever runs when the
workflow calls the webhook, which is what keeps the rsync and the artisan run in the right order.

### Client side configuration

`VITE_*` values are compiled into the bundle, so they have to exist when the bundle is built, and
that now happens in CI where there is no server `.env`. They come from **repository variables**,
read by the build job in `.github/workflows/deploy.yml`.

They are variables and not secrets on purpose. None of them is confidential: every one is
readable by anyone who downloads `public/build`. Storing them as secrets would mask them in the
build log for no benefit and make a broken build harder to diagnose. They are kept out of the
workflow file itself only because this repository is public and the contact address would
otherwise be trivially scrapeable from the source.

A variable that is missing or misspelled resolves to an empty string, and Vite would bake
`undefined` into the bundle without complaining. The build job checks all nine up front and
fails rather than shipping a broken site.

They are not in a `.env.production` file either. Laravel loads `.env.<APP_ENV>` in place of
`.env` whenever `APP_ENV` is present in the process environment, so that file would silently
replace the server configuration and take the site down.

**Changing them in Forge has no effect on production.** Locally they still come from `.env`,
which Vite reads in development mode.

## License

MIT.
