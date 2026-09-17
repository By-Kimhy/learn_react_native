# LifeHub

A local-first personal life management app — money, notes, tasks, habits, calendar,
links and QR tools in one place. Built with Expo SDK 57, Expo Router and TypeScript.

Phases 1 to 4 are complete and running:

- **Money** — income and expenses with USD/KHR conversion, history, statistics
- **Notes** — Google Keep-style text and checklist notes, labels, colours, archive
- **Tasks** — Today / Upcoming / Completed, priorities, swipe to complete or delete
- **Habits** — streaks, weekly targets, a tap-to-tick day row
- **Calendar** — month grid, repeating events, per-event reminders
- **Reminders** — one list across tasks, habits and events, backed by local notifications
- **Smart Links** — grouped by category, favourites, search, open / copy / share
- **QR Tools** — generator with save/share/copy, camera scanner with URL and text branches
- **AI** — summarise a note, suggest a title, extract tasks, detect events, in one pass

## Getting started

```bash
npm install
npx expo start
```

Press `i` for the iOS simulator, `a` for Android, or scan the QR code with Expo Go.

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

### If the dev server crashes on `Cannot find module '@expo/metro/...'`

That crash is the Expo CLI failing while *formatting* an error, so it hides the real
one. It means the dependency tree has drifted off SDK 57 — check with:

```bash
node -e "console.log(require('expo/package.json').version)"   # expect 57.0.x
```

If it is not 57, an install re-resolved the tree and dragged the Expo packages
backwards. Restore and reinstall:

```bash
git checkout package.json package-lock.json   # then re-add any deps you were adding
rm -rf node_modules && npm install
npx expo install --check                      # expect "Dependencies are up to date"
```

Keep `package-lock.json` committed — with it in place `npm install` and
`npx expo install` both resolve correctly. To see a genuine bundling error while the
CLI is crashing, use `npx expo export` instead of `npx expo start`.

## Installing on a phone (standalone APK)

The app is built locally — no Expo account, no cloud, and **no dev server at runtime**.
The JS bundle is compiled into the APK, so the installed app works offline and keeps
working after you close Metro.

```bash
npx expo prebuild --platform android   # only needed once, or after changing app.json
npm run apk                            # release APK, arm64 only
npm run apk:install                    # adb install -r ... (phone plugged in, USB debugging on)
```

The APK lands at `android/app/build/outputs/apk/release/app-release.apk` (~45 MB). To
install without a cable, copy that file to the phone and open it — Android will ask you
to allow installing from this source.

Notes:

- **Architecture.** `npm run apk` builds `arm64-v8a` only, which every phone since
  roughly 2017 uses. Drop the `-PreactNativeArchitectures` flag to build all four ABIs
  (about 106 MB) if you need x86 emulator support or a very old device.
- **Signing.** Release is signed with the Android debug keystore, which is fine for
  sideloading but not accepted by the Play Store. For that, generate a real keystore —
  see the React Native [signed APK guide](https://reactnative.dev/docs/signed-apk-android).
- **After changing code**, re-run `npm run apk` — Gradle is incremental and re-bundles
  the JS, so it takes well under a minute.
- `android/` is generated and gitignored. `npx expo prebuild --clean` recreates it; any
  hand edits inside it are lost, so configuration belongs in `app.json`.
- Local notifications only fully work in a real build like this one, not in Expo Go.

## How it is organised

```
src/
  app/                  Expo Router routes (file-based)
    (tabs)/             Home · Notes · Money · More
    note/[id]           Note editor (also handles /note/new)
    transaction/        new + [id] editor, presented as modals
  components/ui/        Design-system primitives — Text, Card, Button, BottomSheet…
  components/           App-level composites (tab bar, create sheet)
  features/
    money/              Currency maths, categories, store, selectors, components
    notes/              Note store, search, editor components
    tasks/              Task store, day bucketing, list and form
    habits/             Habit store, streak maths, cards and form
    calendar/           Event store, recurrence expansion, month grid
    reminders/          Notification wrapper, scheduler, cross-feature aggregation
    links/              Link store, grouping, URL normalisation
    qr/                 QR history store, image save helper
    ai/                 Cursor client, schema, secure key store, results sheet
    settings/           User preferences + translator
  store/                Persistence primitives shared by every feature store
  lib/                  storage, dates, ids, i18n
  constants/theme.ts    Colours, spacing, radius, typography
  types/                Core entities for every phase
```

Each feature owns its store, its selectors and its components. Screens compose them
and hold no business logic, so a feature can move behind an API later without
touching the rest of the app.

### State and persistence

Feature stores are React contexts over `usePersistedState`, which hydrates from
AsyncStorage on mount and writes back on change. `DataVersionProvider` bumps a
counter after an import or a data wipe, forcing every store to re-read from disk.

Swapping AsyncStorage for SQLite or a backend means changing `src/lib/storage.ts`
and `src/store/use-persisted-state.ts` — nothing else.

### Currency

Two currencies, USD and KHR, at a rate that defaults to 1 USD = 4,000 KHR and is
editable in Settings. Every transaction stores the original amount and currency, the
rate used, and the converted amount, so **editing the rate never rewrites history** —
`amountIn()` reads each transaction at the rate it was saved with.

### Reminders and notifications

`features/reminders/notifications.ts` is the only module that touches
`expo-notifications`. Above it, `scheduler.ts` exposes `syncOnceReminder` and
`syncDailyReminder`: callers pass the previously stored notification id plus the new
intent, and get back the id to persist. Rescheduling is always "cancel, then create",
and clearing is the same call with no fire time — so there is one code path, not three.

Entities store their own `notificationId`. Screens save first, close, then reconcile
the notification and write the id back, so the user never waits on the OS. Completing
or deleting a task cancels its reminder.

Repeating events schedule only their next occurrence; the repeat itself is expanded on
read in `calendar/selectors.ts`, so a daily event costs one row and one pending
notification rather than hundreds.

Local notifications work in Expo Go on both platforms. Push notifications do not — but
LifeHub does not use them.

### AI

`features/ai/client.ts` is the only module that talks to the network. One
`analyzeNote()` call covers all four AI actions in the spec — summary, title,
tasks, events — because they all read the same text, so the user waits once
instead of four times. Cursor has no chat-completions API, so the phone launches
a **no-repo Cloud Agent**, polls the run, and parses the assistant text with the
same Zod schema.

Everything degrades honestly: no key shows a setup prompt, no network says so and
points out that the rest of the app still works, and an invalid key is reported as
such. Detected events are created with a reminder at their start time — the reason
to pull an event out of a note is not to forget it.

**About the API key.** LifeHub is local-first with no backend, so AI calls go
straight from the device to Cursor using a key *you* supply in Settings (from
[cursor.com/dashboard](https://cursor.com/dashboard)). It is held in the iOS
keychain / Android keystore via `expo-secure-store`, never in AsyncStorage, and
it is deliberately excluded from the export bundle.

That is the right design for a personal app, but it is worth being explicit about
the tradeoff: **a key shipped inside any client app can be extracted from it.**
This is fine when the key is your own and the app is on your own phone. If LifeHub
is ever distributed to other people, the AI calls should move behind the backend
that arrives in Phase 5, so the key lives on a server and the app never sees it.

Each analysis is one Cursor cloud agent (`composer-2.5`) billed to the key's
account. No-repo agents must be enabled for that Cursor account.

### Internationalisation

`src/lib/i18n/en.ts` is the source of truth; its shape types `TranslationKey`, so
every other locale is checked against it. Khmer (`km.ts`) is a `Partial`, and any
missing key falls back to English. Adding a language means adding a file and one
entry in `Languages`.

## Roadmap

Phases 1 to 4 are done. Phase 5 — authentication, a backend API, cloud sync, backup
and multi-device — is laid out in `AGENTS.md`. It is also where the AI key should
move server-side, per the note above.
