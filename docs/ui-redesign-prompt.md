# LifeHub UI Redesign — task prompt

> Paste this whole file as the prompt. Tune the three blanks in **Tune before sending**
> first; everything else is ready as-is.

## Tune before sending

- **Brand accent:** keep the current `#2F6FED` / `#6098FF`, or pick one → `__________`
- **Primary device for review:** iOS simulator / Android APK / both → `__________`
- **Willing to add dependencies?** yes (e.g. `expo-blur`) / no, ship with what's installed → `__________`

---

## Goal

Redesign LifeHub's entire UI around the **iOS 26 Liquid Glass** design language, in one
pass: design tokens, the UI primitives, and all 24 routes. On iOS it should read as a
native iOS 26 app. On Android it must read as a deliberate, clean app — never as a
broken iOS app.

This is a presentation-layer redesign. No feature work, no behaviour changes.

## Before you write any code

`AGENTS.md` is binding: **read the exact versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before writing any code.** SDK 57 changed
substantially — do not write any Expo API from memory. At minimum read the v57 pages for
`expo-glass-effect`, `expo-symbols`, `expo-router` (both `Stack` and `expo-router/js-tabs`),
`expo-blur`, and `react-native-reanimated` v4.

Then read, before touching them:

- `src/constants/theme.ts` — the token source of truth
- `src/hooks/use-theme.ts` — how scheme resolution and `useTheme()` work
- every file in `src/components/ui/` — 21 primitives, all call sites depend on their props
- `src/components/app-tab-bar.tsx` and `src/components/ui/screen.tsx` — these two encode
  the current layering model and are where the redesign actually bites

**Starting point worth knowing:** `expo-glass-effect@~57.0.3` and `expo-symbols@~57.0.3`
are already installed and **completely unused** — zero references in `src/`. The app
currently uses Ionicons and opaque surfaces throughout.

## What "Liquid Glass" means for this app, concretely

Not "add blur to things." Five specific changes:

**1. Invert the layering model.** Today the tab bar is a *sibling* of the tab scene, so
content stops above it (`Screen`'s `TabBarClearance = 32`). Liquid Glass requires the
opposite: chrome floats **over** scrolling content, and content passes beneath it. Rework
`Screen` so scroll views extend edge-to-edge and use content insets / bottom padding equal
to the chrome height, so material has something to refract. This is the change that makes
everything else look right, and the one most likely to break layouts — do it first and
verify a scroll on every screen.

**2. Chrome becomes material.**
- Tab bar → a floating glass pill, not a full-width opaque bar with a hairline top border.
  Use `GlassContainer` with `spacing` so the pill and the raised "+" merge as they
  approach each other — that merge is the signature of the design language, and the
  current centre "+" is already positioned for it.
- `ScreenHeader` → glass; transparent over the top of content at rest, gaining material as
  content scrolls under it.
- `BottomSheet` and the modal routes (`transaction/new`, `note/[id]`, `task/[id]`,
  `habit/[id]`, `event/[id]`, `link/[id]`) → glass surfaces with a grabber.

Use `GlassView` with `glassEffectStyle="regular"` for chrome, `"clear"` where content must
stay legible through it, and `isInteractive` on anything that responds to touch.

**3. Icons become SF Symbols.** Keep `src/components/ui/icon.tsx` as the single wrapper —
same component name, same `<Icon name="..." />` call shape — but give it two backends:
`SymbolView` from `expo-symbols` on iOS, Ionicons on Android. Map the existing `IconName`
union to SF Symbol names in one table so no call site changes. Do not let SF Symbol names
leak into feature code.

**4. Depth comes from material, not drop shadows.** `Card` currently ships an iOS shadow
plus an Android elevation, with a documented workaround about `overflow: hidden` and
elevation toggling. Reconsider that whole model: in Liquid Glass, separation comes from
material and tonal contrast. Whatever you land on, **keep that Android clipping bug
fixed** — read the comment in `card.tsx` before you rewrite it.

**5. Radii become concentric.** Nested corners must satisfy
`inner radius = outer radius − padding`. The current `Radius` scale (8/12/16/22) was not
chosen for nesting; rework it so cards, fields, chips and the tab pill nest correctly, and
add a helper if that makes call sites honest.

Motion: use `react-native-reanimated` v4 (installed). Springs, not linear easing. Glass
elements animate their material, not just opacity.

## Scope — all of it, one pass

**Tokens:** `src/constants/theme.ts` (`ThemeColors`, `NoteColors`, `Spacing`, `Radius`,
`Typography`, `Fonts`, `MaxContentWidth`). Expect to *add* slots — glass tints, scrim,
separator-on-glass — rather than only retune hex values.

**Primitives (21):** `bottom-sheet`, `button`, `card`, `checkbox`, `chip`, `date-field`,
`divider`, `empty-state`, `icon`, `icon-button`, `list-row`, `pressable-scale`,
`screen-header`, `screen`, `section-header`, `segmented-control`, `swipe-row`,
`text-field`, `text`, `time-field`, plus `confirm.ts`.

**App-level:** `app-tab-bar.tsx`, `create-sheet.tsx`, `src/app/_layout.tsx` (the
`ThemeProvider` colour mapping and `Stack` presentation options).

**All 24 routes:** the four tabs (`index`, `notes`, `money`, `more`), the pushed screens
(`tasks`, `habits`, `calendar`, `reminders`, `links`, `qr`, `qr/scan`, `transactions`,
`statistics`, `archive`, `settings`), and the seven modals.

**Feature components:** everything under `src/features/*/components/` — note cards, the
month grid, habit cards, transaction rows, the bar chart, the AI sheet, amount inputs.
These are where the app's density and rhythm actually live.

## Hard constraints

1. **Do not touch business logic.** Off limits: every `features/*/store.tsx`, every
   `selectors.ts`, `money/currency.ts`, `money/categories.ts`, `reminders/scheduler.ts`,
   `reminders/notifications.ts`, `ai/client.ts`, `ai/schema.ts`, `ai/key-store.tsx`,
   `lib/storage.ts`, `store/use-persisted-state.ts`, `types/index.ts`. If a redesign seems
   to need a store change, stop and ask instead.

2. **Light and dark parity.** Every screen must be checked in both schemes. **No hex value
   anywhere outside `theme.ts`** — `rgba()` glass tints included; add a token. Respect the
   user's explicit appearance override in `usePreferences()`, not just the system scheme —
   `GlassView` takes a `colorScheme` prop for exactly this.

3. **i18n stays intact.** No hard-coded user-facing strings; everything goes through
   `useT()` / `t()`. Khmer (`src/lib/i18n/km.ts`) renders longer and taller than English —
   no fixed-height rows, no `numberOfLines={1}` on anything that must stay readable, and
   test the tab bar labels and `SectionHeader`s with Khmer selected. If you need new copy,
   add the key to `en.ts` (the typed source of truth) and a Khmer value.

4. **Android must not be collateral damage.** `expo-glass-effect` is iOS-only and this
   project ships an Android APK (`npm run apk`). Every glass surface needs a designed
   Android counterpart — solid tonal surfaces with proper elevation, matching the same
   token vocabulary — decided deliberately, not left to whatever `GlassView` degrades into.
   Gate on `isLiquidGlassAvailable()`, not on `Platform.OS === 'ios'` alone, since iOS
   below 26 needs the fallback too.

5. **Accessibility.** Honour `AccessibilityInfo.isReduceTransparencyEnabled()` with the
   solid fallback. Keep `MinTouchTarget` (44pt) satisfied. Text on glass must clear WCAG AA
   against the *worst-case* background it can float over, not the average one.

## How to work

Do it in this order and **commit after each stage**, so the diff stays reviewable:

1. Tokens — `theme.ts` extended, plus any new `useTheme()` surface.
2. The layering change — `Screen`, `ScreenHeader`, `AppTabBar`, `BottomSheet`.
3. The remaining primitives.
4. The `Icon` dual-backend swap.
5. Feature components.
6. Screens, tab by tab then stack by stack.

After each stage: `npm run typecheck && npm run lint` must be clean. Don't let errors pool.

Tell me at the end of each stage what changed and what it looks like — don't run all six
stages silently.

## Definition of done

- `npm run typecheck` and `npm run lint` both clean.
- All 24 routes render correctly in **light and dark**, in **English and Khmer**.
- iOS: glass chrome, SF Symbols, content scrolling under the tab bar and header.
- Android: the designed fallback, verified via `npm run apk` — no blur artefacts, no
  invisible text, no clipped cards (see the `card.tsx` Android note).
- No hex outside `theme.ts`. No hard-coded strings. No store or selector diffs.
- `README.md`'s design-system section updated if the token vocabulary changed.

## Do not

- Rename or restructure routes — file-based routing and `typedRoutes` depend on them.
- Reorganise `src/` folders.
- Add a styling library (NativeWind, Unistyles, Tamagui). The token system works; extend it.
- Change what any screen *does* — only how it looks.
- Delete i18n keys, even if a label moves.

## Ask me before

- Adding any dependency.
- Changing the tab set or what lives on Home.
- Dropping a feature's current interaction (swipe-to-complete, tap-to-tick habit rows,
  the raised centre "+").
