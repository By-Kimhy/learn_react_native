# LifeHub — Google Stitch prompts

Copy each fenced block into Stitch, one at a time, in order. Start a **Mobile** project.

**How to use these**

1. Paste **Prompt 0** first and let it generate. It sets the look for everything after.
2. Then paste screen prompts one at a time. Stitch keeps context inside a project, so
   later screens inherit the style — but each prompt below repeats a one-line style
   reminder, because Stitch drifts after five or six generations.
3. If a screen comes back wrong, don't re-paste the whole thing. Follow up with one
   small correction ("make the tab bar a floating pill, not a full-width bar").
4. Generate light mode first. Ask for dark mode as a follow-up on the screen you like —
   Prompt D is written for that.
5. Screens 1–6 are the ones worth getting right. 7–14 can be rougher.

---

## Prompt 0 — the design system

```
I'm designing LifeHub, a personal life-management mobile app for one person. It holds
their money (income and expenses in US dollars and Cambodian riel), notes, tasks,
habits, a calendar, reminders, saved links and a QR code tool — all in one app, all
stored on the phone.

Set the visual style for the whole app:

Design language: iOS 26 "Liquid Glass". The navigation chrome — the bottom tab bar, the
top header, and bottom sheets — is made of translucent frosted glass that blurs and
refracts the content scrolling underneath it. The chrome floats above the content as a
rounded, detached layer, not as an opaque bar attached to the screen edge. Content runs
edge to edge and passes beneath the glass. Glass panels have a faint bright specular
highlight along their top edge and a very subtle inner border, no heavy drop shadows.

Content surfaces: opaque cards on a light neutral canvas, generously rounded, separated
by tonal contrast and whitespace rather than by shadows or dividers. Corners nest
concentrically — a card inside a card has a smaller radius than its parent.

Colour: near-white canvas (#F5F5F7) with pure white cards. One blue accent (#2F6FED)
used sparingly, for the active tab, the primary button and links. Green for income,
red for expenses, amber for warnings. Everything else is neutral grey.

Typography: SF Pro. Large bold screen titles (around 26pt), 17pt semibold section
headings, 15pt body, 13pt captions, and small all-caps letterspaced labels for group
headers. Numbers — money amounts especially — are the loudest thing on any screen.

Density: comfortable, not cramped. Generous vertical rhythm between sections. Every
tappable thing is at least 44pt.

Icons: SF Symbols, thin to regular weight.

Important: labels also get translated into Khmer, which runs noticeably longer and
taller than English, so leave slack in buttons, chips and tab labels — nothing should
be a tight single-line pill that a longer word would break.

Bottom tab bar, on every main screen: a floating glass pill with five slots — Home,
Notes, a raised circular blue "+" button in the centre, Money, More. The "+" overlaps
the top edge of the pill and appears to merge with it, like two drops of liquid glass
touching.

Start by showing me the Home screen.
```

---

## Prompt 1 — Home

```
Style reminder: LifeHub, iOS 26 Liquid Glass, floating glass tab bar, white cards on a
near-white canvas, blue accent.

Home screen. Top of the scroll, in order:

- A greeting: "Good morning 👋" in large bold type, with "Wednesday, 17 September" in
  grey underneath. A small circular settings icon button sits at the top right.
- A balance card: the total balance "$1,284.50" very large, and underneath it two
  smaller figures side by side — "Income this month $2,100.00" in green with a small
  up arrow, "Expenses this month $815.50" in red with a down arrow.
- A row of three square quick-action tiles: "Income" with an up-trend icon on a soft
  green tint, "Expense" with a down-trend icon on a soft red tint, "Note" with a
  document icon on a soft blue tint.
- Section "Today" with a grey "See all" link on the right. Below it a card holding four
  task rows with round checkboxes — "Pay electricity bill" (checked), "Call the bank",
  "Buy rice and vegetables", "Finish the budget sheet" — each with a small due time on
  the right and a coloured priority dot. Above the rows, a thin progress bar and the
  text "1 of 4 done".
- Section "Habits" with "See all". A horizontally scrolling row of small habit cards —
  "Drink water", "Read 20 pages", "Morning walk" — each with an icon, a flame badge
  showing a streak number like "12", and a tick button that fills in when done.
- Section "Upcoming" with "See all". A card with three event rows: a coloured time block
  on the left ("09:00"), the event name, and a small repeat icon on some of them.
- Section "Recent transactions" with "See all". A card with three rows: a circular
  category icon, the category name and a short note, the date underneath, and the amount
  on the right — "-$12.50" in red, "+$450.00" in green.

The glass tab bar floats over the bottom of this scroll, with the content visibly
blurred through it.
```

---

## Prompt 2 — Notes

```
Style reminder: LifeHub, iOS 26 Liquid Glass, floating glass tab bar, blue accent.

Notes screen. A Google-Keep-style note board.

- Large bold title "Notes" at the top left, a small circular archive icon button at the
  top right.
- A rounded search field, "Search notes".
- A horizontally scrolling row of filter chips: "All" (selected, blue), "#work",
  "#personal", "#ideas", "#shopping".
- A small all-caps grey label "PINNED", then a two-column staggered grid of note cards
  of uneven height.
- Below it another all-caps grey label "OTHERS" and more cards.

Note cards come in soft pastel backgrounds — white, pale coral, sand, mint, sky blue,
lavender, blush pink, slate grey. Each card shows a bold title, a few lines of body text
clipped at the bottom, and small label tags at the base. Some cards are checklists
instead of text: a title and three or four items with small square checkboxes, one or
two ticked with the text struck through. A small pin icon marks the pinned ones.

Sample notes: "Groceries" (checklist: rice, fish sauce, mangoes, coffee), "Meeting notes
— Tuesday", "Book ideas", "Apartment checklist", "Wifi password", "Trip to Siem Reap".

Also show me the empty version of this screen: a centred illustration or large soft icon,
the heading "No notes yet", a line of grey explanation, and one blue "Create note" button.
```

---

## Prompt 3 — Money

```
Style reminder: LifeHub, iOS 26 Liquid Glass, floating glass tab bar, green for income,
red for expenses.

Money screen.

- Large bold title "Money" top left; two small circular icon buttons top right, a chart
  icon and a receipt icon.
- A month navigator: a left chevron, "September 2026" centred in semibold, a right
  chevron.
- A segmented control with two options, "USD" and "KHR" (Cambodian riel), USD selected.
- Three stat cards in a row: "Income" with "$2,100.00" in green, "Expenses" with
  "$815.50" in red, "Savings" with "$1,284.50" in the blue accent. Each has a small icon
  and a faint tinted background.
- Section "Spending by category" with a "See all" link. Below, a card with five
  horizontal bars, each row showing a category icon and name on the left, a proportional
  coloured bar, and the amount and percentage on the right: Food & drink $310.00 38%,
  Transport $145.50 18%, Bills $180.00 22%, Shopping $120.00 15%, Other $60.00 7%.
- Section "Recent transactions" with "See all". A card with six transaction rows: a
  circular tinted category icon, the category name with a short note underneath, the date
  in grey, and the signed amount on the right in green or red.

Sample transactions: Groceries -$32.40, Salary +$1,200.00, Tuk-tuk -$2.50, Electricity
-$45.00, Coffee -$1.75, Freelance +$300.00.
```

---

## Prompt 4 — Tasks

```
Style reminder: LifeHub, iOS 26 Liquid Glass, blue accent, glass header floating over
the content.

Tasks screen, pushed from a menu, so it has a back chevron at the top left, the title
"Tasks" centred, and two small icon buttons at the top right — a broom and a plus.

- A segmented control below the header: "Today" (selected), "Upcoming", "Completed".
- A progress line: a thin rounded progress bar about 40% filled in blue, with "2 of 5
  done" in small grey text.
- A list of task rows on white cards: a large round checkbox on the left, the task title,
  a second line with a small clock icon and the due time, a coloured priority dot on the
  right (red for high, amber for medium, grey for low), and a small bell icon on tasks
  that have a reminder. Completed tasks show a filled blue checkbox and struck-through
  grey text.

Sample tasks: "Pay electricity bill" (high, 5:00 PM), "Call the bank" (medium, 2:30 PM),
"Buy rice and vegetables" (low), "Finish the budget sheet" (high, tomorrow), "Reply to
Sokha" (done).

Also show one row mid-swipe: the row slid to the left revealing a green "Complete" action
and a red "Delete" action behind it.
```

---

## Prompt 5 — Habits

```
Style reminder: LifeHub, iOS 26 Liquid Glass, blue accent, glass header.

Habits screen. Back chevron, title "Habits", a plus icon button at the top right.

- A summary line at the top: "3 of 4 done today" with a thin progress bar, or the
  celebratory version "All done today 🎉".
- A vertical list of habit cards. Each card has: a circular tinted icon on the left, the
  habit name in semibold, a subtitle like "5 days a week", a flame badge in the top right
  with a streak number ("12 day streak"), and along the bottom a row of seven small day
  circles labelled S M T W T F S — filled solid blue for completed days, an outline for
  missed days, and a slightly larger ring around today. The whole day row is tappable.

Sample habits: "Drink 2L water" (7 days a week, 12 day streak, 5 of 7 filled), "Read 20
pages" (5 days a week, 4 day streak), "Morning walk" (3 days a week, 21 day streak),
"No sugar" (7 days a week, 0 day streak, nothing filled).
```

---

## Prompt 6 — Calendar

```
Style reminder: LifeHub, iOS 26 Liquid Glass, blue accent, glass header.

Calendar screen. Back chevron, title "Calendar", a plus icon button top right.

- A month navigator: left chevron, "September 2026", right chevron.
- A month grid: a row of single-letter weekday headers, then the dates. Today's date sits
  in a filled blue circle. The selected date sits in a lighter blue circle. Dates that
  have events carry one to three small dots beneath the number. Dates from the
  neighbouring months are faded.
- Below the grid, a heading "Today · 3 events" in semibold.
- Then event rows on a white card: a coloured vertical bar on the left, the start time
  in bold above the end time in grey, the event title, a location or note underneath, a
  small repeat icon on recurring events and a small bell icon on ones with a reminder.

Sample events: "09:00 Team standup" (repeats daily), "12:30 Lunch with Dara", "19:00 Khmer
class" (repeats weekly, reminder set).

Also show the empty version for a day with nothing on it: a soft calendar icon, "No events",
a grey line of explanation, and a blue "Create event" button.
```

---

## Prompt 7 — More

```
Style reminder: LifeHub, iOS 26 Liquid Glass, floating glass tab bar, blue accent.

The "More" tab — a directory screen. Large bold title "More" at the top left, then a
single tall white card holding a list of rows separated by hairline dividers that are
inset to start after the icons.

Each row: a circular tinted icon on the left, the label, and a grey chevron on the right.
In order: Tasks (checkbox icon), Habits (flame), Calendar (calendar), Reminders (alarm
clock), Links (chain link), QR Tools (QR code), Statistics (bar chart), Transaction
history (receipt), Archive (archive box — this one shows a small grey count "12" before
the chevron), Settings (gear).

The glass tab bar floats at the bottom.
```

---

## Prompt 8 — Settings

```
Style reminder: LifeHub, iOS 26 Liquid Glass, blue accent, glass header.

Settings screen. Back chevron, title "Settings".

A stack of grouped sections. Each group has a small all-caps grey heading above a white
rounded card, iOS Settings style.

- CURRENCY — a row "Preferred currency" with a two-option segmented control, "USD" and
  "KHR". A second row "Exchange rate" showing "1 USD = 4,000 KHR" with a chevron.
- APPEARANCE — a three-option segmented control: "Light", "Dark", "System" (System
  selected).
- LANGUAGE — a two-option segmented control: "English" and "ខ្មែរ".
- NOTIFICATIONS — a row "Reminders" with a grey subtitle explaining what it does, and an
  iOS-style toggle switch on the right, switched on.
- AI — a row "Anthropic API key" with the subtitle "Key saved" and a chevron, plus a red
  "Remove key" row underneath.
- DATA — three rows: "Export data" with an upload icon, "Import data" with a download
  icon, and "Clear all data" in red with a trash icon.

At the very bottom, small centred grey text: "LifeHub 1.0.0".
```

---

## Prompt 9 — Create sheet

```
Style reminder: LifeHub, iOS 26 Liquid Glass.

Show the Home screen dimmed behind a bottom sheet that has slid up over it.

The sheet is a frosted glass panel with a rounded top, a small grey grab handle at the
top centre, and the heading "Create". The Home screen behind it is visibly blurred and
darkened through the glass.

Inside the sheet: a grid of eight large tappable tiles, four across, two rows. Each tile
is a rounded square with a circular tinted icon above a short label:
Income (up-trend, green tint), Expense (down-trend, red tint), Note (document, blue),
Task (checkbox, blue), Habit (flame, blue), Reminder (alarm, blue), Link (chain, blue),
QR code (QR, blue).

The raised blue "+" button of the tab bar is still visible at the bottom, now rotated
into an "×".
```

---

## Prompt 10 — Add transaction

```
Style reminder: LifeHub, iOS 26 Liquid Glass, green for income, red for expenses.

A full-height modal sheet for adding a transaction, presented over a blurred Money
screen. Frosted glass top edge with a grab handle, "Cancel" at the top left and "Save"
in blue at the top right, "New transaction" centred.

Inside, in order:
- A two-option segmented control, "Income" and "Expense", with Expense selected and the
  control tinted red.
- A very large amount entry, centre aligned: "$ 32.40" at around 40pt bold, with a small
  currency toggle underneath showing "USD" and "KHR" and a grey conversion line
  "≈ 129,600 ៛".
- A heading "Category", then a grid of category chips, four across — each a circular
  tinted icon above a small label: Food & drink, Transport, Bills, Shopping, Health,
  Entertainment, Home, Other. "Food & drink" is selected and outlined in the accent.
- A row "Date" showing "Today, 17 September" with a calendar icon and a chevron.
- A multi-line "Note" text field with the placeholder "What was this for?".
- A full-width blue "Save transaction" button pinned above the keyboard area.
```

---

## Prompt 11 — Note editor with AI

```
Style reminder: LifeHub, iOS 26 Liquid Glass.

A note editor, opened as a full screen over the notes board. The whole page background is
a soft pastel sand colour, because the note's colour fills the editor.

Top bar: a back chevron on the left; on the right a row of small icon buttons — a pin, a
sparkle (AI), an archive box, and a three-dot menu. The bar is glass, so the sand colour
shows through it.

Body: a large bold title "Meeting notes — Tuesday" as an editable field, then several
paragraphs of body text in 15pt. Below the text, a row of small label tags "#work" and
"#project" with a dashed "+ Label" chip at the end.

Along the bottom, above a glass toolbar: a horizontal row of eight colour swatch circles
— white, coral, sand, mint, sky, lavender, blush, slate — with the sand one ringed as
selected. Small grey text at the very bottom: "Edited 2 hours ago".

Then show a second version of this screen with an AI results sheet slid up over it. The
sheet is frosted glass with a grab handle and the heading "AI analysis", containing four
collapsible sections, each with a small icon and a coloured heading:
"Summary" (a short paragraph), "Suggested title" (one line with an "Apply" button),
"Tasks found" (three task rows each with an "Add" button), "Events found" (one event row
with a date and an "Add" button).
```

---

## Prompt 12 — Statistics

```
Style reminder: LifeHub, iOS 26 Liquid Glass, green for income, red for expenses.

A statistics screen. Back chevron, title "Statistics".

- A segmented control: "Daily", "Weekly" (selected), "Monthly".
- A card headed "Income vs expenses" with a small legend of two dots — a green "Income"
  and a red "Expenses". Below it a grouped bar chart: seven pairs of rounded vertical
  bars, one pair per day, green and red side by side, with day labels beneath and light
  horizontal gridlines behind.
- A two-by-two grid of stat cards: "Income $2,100.00" green, "Expenses $815.50" red,
  "Avg per day $27.18", "Savings $1,284.50" blue. Each has a small icon and a tinted
  background.
- A card headed "Spending by category" with a horizontal stacked bar at the top showing
  the whole month as coloured proportions, then a legend list underneath: a coloured dot,
  the category name, the amount, and the percentage.

Charts use soft, desaturated colours and rounded bar caps. No 3D, no gradients, no
drop shadows.
```

---

## Prompt 13 — Links and QR

```
Style reminder: LifeHub, iOS 26 Liquid Glass, blue accent, glass header.

Two screens.

First, a saved links screen. Back chevron, title "Links", a plus icon button top right.
A rounded search field, then grouped sections with small all-caps grey headings —
"FAVOURITES", "WORK", "LEARNING", "UNCATEGORISED". Each section is a white card of rows;
a row has a circular icon with the site's first letter, the link title in semibold, the
URL underneath in small grey text, a filled blue star on favourites and an outline star
elsewhere, and a chevron. Sample links: "Expo docs — docs.expo.dev", "National Bank of
Cambodia — nbc.gov.kh", "Khmer dictionary", "Figma".

Second, a QR tools screen. Back chevron, title "QR", a camera icon button at the top
right. A labelled text field "Content" with the placeholder "Text or URL to encode".
Below it a large white card containing a generated QR code, centred with generous
padding, and under the code three secondary buttons in a row: "Save", "Share", "Copy".
Then a small all-caps grey heading "HISTORY" with a trash icon on the right, and a card
of history rows — each with a small QR icon, the encoded value in one clipped line, and
the subtitle "Scanned" or "Generated" with a time.
```

---

## Prompt 14 — Reminders

```
Style reminder: LifeHub, iOS 26 Liquid Glass, blue accent, glass header.

A reminders screen that gathers reminders from tasks, habits and calendar events into
one list. Back chevron, title "Reminders".

A small all-caps grey heading "UPCOMING", then a white card of rows. Each row: a circular
tinted icon showing what it came from — a checkbox for a task, a flame for a habit, a
calendar for an event — the title in semibold, and underneath in grey either "Today at
5:00 PM", "Tomorrow at 9:00 AM", or "Every day at 8:00 AM". A small bell icon sits on the
right of each row.

Sample rows: "Pay electricity bill — Today at 5:00 PM", "Drink 2L water — Every day at
8:00 AM", "Team standup — Tomorrow at 9:00 AM", "Khmer class — Thursday at 7:00 PM".

Also show the permission state of this screen: a centred card with a bell icon, the
heading "Turn on notifications", two lines of grey explanation, and a blue "Allow
notifications" button.
```

---

## Follow-up prompts

### D — dark mode

```
Now show this same screen in dark mode. Near-black canvas (#0C0C0E) with dark grey cards
(#171719), a lighter blue accent (#6098FF), and a mint green and soft red for income and
expenses so they stay readable on dark. The glass chrome becomes dark translucent — you
can still see the content blurred through it, and it still has its faint bright top edge,
but it's now a dark smoked glass rather than a frosted white one. Cards get a hairline
grey border instead of a shadow.
```

### E — empty states

```
Show me the empty state for this screen: a large soft grey icon centred with lots of
space around it, a short heading, one line of grey explanatory text, and a single blue
button. Keep the header and the glass tab bar exactly as they are.
```

### F — fix the tab bar

```
The bottom tab bar isn't right. Make it a detached floating pill with rounded ends,
inset from the screen edges with a margin below it, made of translucent frosted glass
with the screen content visibly blurred behind it. Five slots: Home, Notes, a raised
circular blue "+" in the centre that overlaps the top edge of the pill, Money, More.
The active tab's icon and label are blue; the others are grey.
```

### G — density

```
This is too cramped. Increase the vertical space between sections, increase the padding
inside cards, and make the section headings larger and bolder relative to the body text.
Let the screen breathe.
```
