# AGENTS.md

You are a senior React Native and Expo engineer helping build **HomeBudget**, a local-first mobile application for managing one household budget.

Write clean, simple, maintainable code. Prioritize correctness, data integrity, readability, and a good mobile user experience over unnecessary abstraction.

Treat this file as the source of truth for project-level decisions. Read it before implementing or changing any feature.

---

## 1. Project Overview

HomeBudget is a mobile application that helps a user manage money within a single household budget.

The MVP allows the user to:

- manually add, edit, and delete income and expenses,
- create and manage custom income and expense categories,
- assign transactions to calendar months,
- review monthly opening balance, income, expenses, monthly result, and closing balance,
- browse, sort, and filter transactions,
- analyze financial data using summaries and charts,
- choose one currency for the whole budget,
- store all data locally on the device,
- use the application without registration or login.

The MVP supports:

- one household budget,
- one currency,
- calendar months as settlement periods,
- manual transactions only,
- local device storage only,
- no account, authentication, cloud synchronization, or shared budget.

Do not implement planned post-MVP features unless explicitly requested.

---

## 2. Product Language and Terminology

The application UI is currently Polish.

Use the following domain terms consistently:

- `Wpływ` — income transaction.
- `Wydatek` — expense transaction.
- `Operacja` — a generic income or expense transaction.
- `Kategoria` — transaction category.
- `Miesiąc przypisania` — the budget month to which a transaction belongs.
- `Saldo początkowe` — opening balance.
- `Suma wpływów` — total income.
- `Suma wydatków` — total expenses.
- `Bilans miesiąca` — monthly result.
- `Saldo końcowe` — closing balance.

Do not replace `wpływ` with `przychód` unless the product requirements are changed.

Internal TypeScript identifiers may use English names, but visible labels and validation messages must use Polish.

---

## 3. MVP Functional Scope

### 3.1 Categories

A category has:

- an immutable type: `income` or `expense`,
- a required name,
- an optional color,
- an optional icon.

Rules:

1. A category type is selected when the category is created.
2. A category type cannot be changed after creation in the MVP.
3. An income category can only be used for income transactions.
4. An expense category can only be used for expense transactions.
5. Editing a category updates its presentation in all linked transactions.
6. A category cannot be deleted while any transaction references it.
7. To delete a used category, the user must first delete linked transactions or reassign them to another category of the same type.
8. Category names must be trimmed and cannot be empty.
9. Category names must not exceed the configured maximum length.
10. Prefer preventing duplicate category names within the same category type, using case-insensitive comparison after trimming.
11. The same name may exist once for an income category and once for an expense category.

Required deletion message:

> Nie można usunąć tej kategorii, ponieważ jest przypisana do istniejących operacji. Najpierw usuń powiązane operacje lub zmień ich kategorię.

### 3.2 Income and expenses

Each transaction has:

- a unique ID,
- a type: `income` or `expense`,
- an amount greater than zero,
- an operation date,
- a category of the matching type,
- an assigned budget month,
- an optional description,
- creation and update timestamps.

Rules:

1. The assigned month defaults to the calendar month derived from the operation date.
2. The user may manually change the assigned month without changing the operation date.
3. Changing the operation date should update the assigned month only while the user has not manually overridden it in the current editing session.
4. The amount is always stored as a positive value.
5. Transaction type determines whether it increases or decreases balances.
6. Deleting a transaction requires user confirmation.
7. Invalid or incomplete transactions must not be persisted.

### 3.3 Monthly balances

For a selected month:

```text
monthlyResult = totalIncome - totalExpenses
closingBalance = openingBalance + totalIncome - totalExpenses
```

Rules:

1. The opening balance of a month defaults to the closing balance of the previous month.
2. The first used month may have a manually entered opening balance.
3. A user may manually override the opening balance for any month.
4. A manual opening balance adjustment is not an income or expense transaction.
5. A change to an earlier transaction or opening balance must recalculate that month and all following months.
6. Calculations must be deterministic and derived from persisted source data.
7. Do not persist redundant totals unless there is a demonstrated performance need.
8. Never use binary floating-point arithmetic for money calculations.

### 3.4 Transaction list

The user can view transactions assigned to the selected month.

Supported views:

- all transactions,
- income only,
- expenses only.

Supported sorting:

- newest date first,
- oldest date first,
- amount ascending,
- amount descending.

Supported filters:

- transaction type,
- category,
- date range,
- minimum amount,
- maximum amount.

A transaction row should show at least:

- amount,
- date,
- category name,
- transaction type,
- optional description,
- optional category color or icon.

### 3.5 Analytics

The application may present:

- expense distribution by category,
- income distribution by category,
- monthly income trend,
- monthly expense trend,
- monthly result trend,
- closing balance trend,
- comparisons across multiple months.

Charts must be derived from the same selectors and calculation functions used by summaries. Do not duplicate financial calculation logic inside screen components.

### 3.6 Currency

The MVP uses one currency for all values.

Rules:

1. The user chooses a currency during initial setup.
2. Supported examples include PLN, EUR, USD, and GBP.
3. Changing the currency changes only the displayed currency code or symbol.
4. Existing numeric values are not converted.
5. Show a warning before changing currency after financial data has been added.

### 3.7 Local-only data

The MVP has:

- no registration,
- no login,
- no email requirement,
- no cloud backend,
- no automatic synchronization,
- no shared budget.

Do not introduce authentication, PostgreSQL, Clerk, remote APIs, or cloud synchronization unless explicitly requested.

---

## 4. Planned Features Outside MVP

The following are future features and must not be implemented implicitly:

- recurring income and expenses,
- automatic transaction generation,
- multiple budgets,
- shared budgets,
- accounts and authentication,
- multi-currency transactions and exchange rates,
- custom settlement periods,
- category and monthly spending limits,
- notifications,
- cloud sync and backups,
- CSV/XLSX/bank import,
- data export,
- PDF/XLSX reports,
- advanced forecasting,
- year-over-year reports.

Architecture may avoid blocking these features, but do not add unused abstractions for them.

---

## 5. Tech Stack

Use the versions already installed in the repository. Check `package.json` before making changes.

Preferred stack:

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind for styling, if already configured
- Zustand for global client state, if already installed
- a local persistent database suitable for structured relational data
- Expo-compatible charting library only after approval

Persistence decision:

- Prefer SQLite for categories, transactions, month overrides, and settings.
- AsyncStorage may be used for small, non-relational UI preferences.
- Do not store the entire financial dataset as one large JSON object unless the existing project already does so and migration has not been approved.

Do not install or upgrade a major library without approval.

When recommending a new dependency:

1. explain the problem it solves,
2. explain why built-in APIs are insufficient,
3. mention the main alternative considered,
4. wait for approval before installing it.

---

## 6. Development Philosophy

Build feature by feature.

For every feature:

1. Read this file first.
2. Inspect the existing implementation and package versions.
3. Identify the smallest complete vertical slice.
4. Keep changes focused.
5. Avoid overengineering.
6. Prefer readable code over clever code.
7. Follow existing patterns unless they violate a documented business rule.
8. Refactor only when repetition or complexity is already visible.
9. Do not rewrite unrelated code.
10. Verify the feature end to end before finishing.

One task should result in one reviewable change set.

Do not generate the entire application in one step.

---

## 7. Architecture

Use this structure unless the repository already has an established equivalent:

```text
app/
  (tabs)/
  categories/
  transactions/
  settings/
components/
  common/
  categories/
  transactions/
  monthly-summary/
constants/
db/
  migrations/
  repositories/
  schema/
domain/
  calculations/
  validation/
  selectors/
hooks/
lib/
store/
types/
assets/
  images/
  icons/
tests/
```

### Folder responsibilities

**app/**  
Routes and screens only. Screens compose components, invoke hooks, and coordinate navigation. Do not place substantial business logic in route files.

**components/**  
Reusable presentation components. Create a component when it is reused, represents a clear UI concept, or meaningfully improves screen readability.

Examples:

- `MonthSelector`
- `MonthlySummaryCard`
- `TransactionListItem`
- `TransactionForm`
- `CategoryBadge`
- `CategoryForm`
- `EmptyState`
- `ConfirmDeleteDialog`

Do not split every small JSX fragment into a component prematurely.

**domain/**  
Pure business logic independent of React Native and storage.

Place here:

- balance calculations,
- month propagation logic,
- transaction aggregation,
- filtering and sorting,
- validation rules,
- money conversion between display text and minor units.

Domain functions should be easy to unit test.

**db/**  
Database schema, migrations, repositories, and persistence-specific mapping.

UI components must not execute raw SQL.

**store/**  
Global UI and client state that is genuinely shared across routes.

Examples:

- selected month,
- transaction filters,
- onboarding state,
- active currency,
- data refresh version or hydration status.

Do not copy the full database into Zustand if repositories can query it directly.

**hooks/**  
Reusable hooks coordinating repositories, stores, navigation, and lifecycle behavior.

**types/**  
Shared domain types and discriminated unions.

**constants/**  
Static configuration, limits, default categories, route constants, and centralized asset imports.

**lib/**  
Small infrastructure helpers. Do not place core financial rules here.

---

## 8. Domain Model

Prefer explicit types.

```ts
type TransactionType = "income" | "expense";

type YearMonth = `${number}-${string}`;

interface Category {
  id: string;
  type: TransactionType;
  name: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  type: TransactionType;
  amountMinor: number;
  operationDate: string;
  assignedMonth: YearMonth;
  categoryId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OpeningBalanceOverride {
  month: YearMonth;
  amountMinor: number;
  updatedAt: string;
}

interface AppSettings {
  currencyCode: string;
  initialSetupCompleted: boolean;
}
```

Use a discriminated union when it improves type safety.

Do not use ambiguous field names such as `date`, `value`, or `kind` when a more precise domain name is available.

---

## 9. Money Rules

Money correctness is critical.

1. Store money in integer minor units, for example grosze or cents.
2. `10.25 PLN` is stored as `1025`.
3. Do not store monetary amounts as JavaScript floating-point decimals.
4. Formatting and parsing must respect the selected currency and the Polish locale where appropriate.
5. Accept both comma and dot as decimal separators in user input when practical.
6. Normalize input before validation.
7. Round only at the input boundary when converting to minor units.
8. All aggregation functions operate on integers.
9. Never infer transaction type from the sign of the amount.
10. Display expense signs consistently in the UI without storing negative expense amounts.

Add tests for:

- whole amounts,
- two decimal places,
- comma input,
- dot input,
- zero,
- negative input,
- large values,
- invalid text,
- repeated aggregation.

---

## 10. Date and Month Rules

Use local calendar dates for user-entered financial operations.

1. Store operation dates as date-only values in `YYYY-MM-DD` format where possible.
2. Store assigned months as `YYYY-MM`.
3. Avoid creating date-only values through UTC conversions that can shift the day.
4. Use explicit helper functions for:
   - deriving a month from a date,
   - comparing months,
   - adding or subtracting months,
   - enumerating a month range.
5. Do not scatter manual string slicing across components.
6. Calendar month boundaries are based on the user's local calendar.
7. Monthly calculations use `assignedMonth`, not `operationDate`.

---

## 11. Balance Calculation Rules

Implement balance calculations as pure functions.

For month `M`:

```text
income(M) = sum of income transaction amounts assigned to M
expenses(M) = sum of expense transaction amounts assigned to M
result(M) = income(M) - expenses(M)
```

Opening balance:

```text
if manual override exists for M:
  opening(M) = override(M)
else if M has a previous month:
  opening(M) = closing(previousMonth(M))
else:
  opening(M) = 0
```

Closing balance:

```text
closing(M) = opening(M) + result(M)
```

Important:

- A manual override breaks automatic inheritance for that month only.
- Following months continue from the recalculated closing balance.
- Recalculation must cover every affected later month in chronological order.
- The algorithm must work when some months contain no transactions.
- Avoid recursive implementations that can overflow or repeatedly query storage.
- Prefer loading the required range and calculating iteratively.

---

## 12. Validation Rules

Keep validation in reusable domain functions or schemas, not inline across screens.

### Category

- type is required on create,
- name is required,
- trimmed name cannot be empty,
- maximum length must be enforced,
- duplicate name and type should be blocked case-insensitively,
- category type cannot be changed after creation.

### Transaction

- amount is required,
- amount must be greater than zero,
- operation date is required and valid,
- assigned month is required and valid,
- category is required,
- category must exist,
- category type must match transaction type,
- optional description must respect the configured maximum length.

Validation messages shown to the user must be clear and in Polish.

Do not rely only on UI controls for data integrity. Repositories or use cases must also reject invalid writes.

---

## 13. Persistence and Data Integrity

All financial writes must preserve consistency.

1. Use database transactions when one user action modifies multiple records.
2. Add foreign-key protection between transactions and categories where supported.
3. Prevent deleting categories that are referenced by transactions.
4. Do not silently delete linked transactions.
5. Use schema migrations for persistence changes.
6. Never destroy or reset user data as part of a normal application update.
7. Development reset utilities must be clearly marked and excluded from production.
8. Handle first-run database initialization safely and idempotently.
9. Seed sample categories only once.
10. Seeded categories are normal editable categories after creation.

Repository methods should return typed domain data and hide storage implementation details.

---

## 14. State Management

Use local component state for:

- form input before save,
- open/closed modal state,
- temporary picker selection,
- temporary validation display,
- pressed or expanded UI state.

Use global state only for data shared across routes or needed for navigation-level behavior.

Persist durable financial data in the database, not only in Zustand.

Avoid duplicated sources of truth. A persisted transaction should not have an independently editable copy in multiple stores.

On app startup:

1. initialize storage,
2. run migrations,
3. seed initial data when necessary,
4. load settings,
5. mark hydration as complete,
6. render the main application.

Show a stable loading state during hydration. Do not briefly render incorrect zero balances.

---

## 15. UI Rules

When a design reference is provided:

- replicate it as closely as practical,
- match spacing, padding, typography, hierarchy, colors, radii, shadows, alignment, and proportions,
- preserve existing navigation and behavior unless a change is requested,
- do not simplify or redesign without approval.

General rules:

1. Use mobile-first layouts.
2. Respect safe areas.
3. Ensure forms remain usable with the keyboard open.
4. Support small screens and long Polish labels.
5. Avoid horizontal scrolling caused by fixed widths.
6. Use accessible touch targets.
7. Provide empty states for lists and charts.
8. Distinguish income and expenses consistently.
9. Do not rely on color alone to communicate transaction type or validation.
10. Confirm destructive operations.
11. Show actionable validation near the relevant field.
12. Preserve user input after a recoverable validation error.

---

## 16. Styling Rules

Use the styling system already configured in the project.

If NativeWind is configured:

- prefer `className`,
- reuse design tokens and shared class patterns,
- do not mix multiple styling systems without a reason.

Use `StyleSheet` or inline styles for cases where runtime values or platform APIs require them, including:

- dynamic chart dimensions,
- animated values,
- platform-specific shadows,
- computed category colors,
- safe-area or keyboard behavior not supported by the installed styling version,
- runtime-calculated layout values.

Check installed library versions before using syntax from newer documentation.

Do not upgrade NativeWind or Expo as part of an unrelated feature.

---

## 17. Assets and Icons

Centralize static image imports in `constants/images.ts` when images are used.

Use descriptive file names:

```text
empty_transactions.png
empty_categories.png
onboarding_budget.png
```

Do not import the same image through inconsistent paths.

Use one icon system consistently. Do not add another icon library for a single missing icon without approval.

User-selected category icons should be stored as stable icon identifiers, not React components or arbitrary serialized objects.

---

## 18. TypeScript Rules

- TypeScript strict mode.
- No `any`.
- Avoid unsafe type assertions.
- Prefer explicit domain types.
- Keep types simple and readable.
- Use exhaustive checks for discriminated unions.
- Validate external or persisted data before trusting it.
- Do not suppress errors with `@ts-ignore`.
- Use `unknown` for genuinely unknown values and narrow them safely.
- Keep screen props and route params typed.

Fix type errors before considering a task complete.

---

## 19. Error Handling

Errors must not fail silently.

For user-triggered actions:

- show a clear Polish message,
- retain unsaved input when possible,
- log technical details only in development,
- do not display raw database or stack-trace text.

For persistence failures:

- do not report success,
- avoid partial writes,
- make retry possible,
- preserve existing stored data.

Use targeted error boundaries where a screen-level failure could otherwise crash the whole app.

---

## 20. Testing

Prioritize tests for business-critical logic.

### Unit tests

Required for:

- money parsing and formatting,
- category validation,
- transaction validation,
- month derivation,
- month comparison and iteration,
- monthly aggregation,
- opening and closing balance calculations,
- recalculation after historical edits,
- filters and sorting.

### Integration tests

Add where practical for:

- category creation and deletion protection,
- transaction creation and editing,
- category type enforcement,
- persistence across app restart,
- first-run seeding,
- migration behavior.

### Manual verification

For every completed feature:

1. Run lint.
2. Run typecheck.
3. Run relevant tests.
4. Test the new flow on a real device or Expo Go when possible.
5. Re-test previously completed core flows.
6. Verify empty, invalid, and boundary states.
7. Verify data remains after restarting the app.

Do not finish with known lint, type, or test errors.

---

## 21. Feature Implementation Workflow

For each feature:

1. Read `AGENTS.md`.
2. Review the current repository structure and relevant files.
3. Restate the exact behavior being implemented.
4. Identify files to modify.
5. Implement one focused feature.
6. Avoid unrelated refactoring.
7. Add or update tests for domain logic.
8. Run lint, typecheck, and tests.
9. Explain:
   - what changed,
   - which files changed,
   - how to test it,
   - any assumptions or remaining limitations.

If the requirement conflicts with this file, stop and point out the conflict before implementing.

---

## 22. Decision Rules

Ask before:

- installing a new dependency,
- changing the persistence technology,
- changing the project architecture,
- adding authentication or a backend,
- changing existing navigation,
- redesigning established UI,
- changing the meaning of stored data,
- introducing a breaking database migration,
- implementing a post-MVP feature.

Do not ask for approval for small, local implementation details that follow these rules.

When requirements are ambiguous:

1. preserve existing behavior,
2. choose the simplest reversible implementation,
3. state the assumption,
4. avoid adding unrequested features.

---

## 23. Security and Privacy

The MVP stores personal financial information locally.

Rules:

- collect only data required by the feature,
- do not add analytics, tracking, crash reporting, or remote logging without approval,
- do not transmit financial data to external services,
- never hardcode secrets,
- never commit `.env` files containing secrets,
- do not log transaction descriptions or financial amounts in production,
- avoid exposing user data in notifications or screenshots unless explicitly designed.

Because the MVP has no backend, no secret server key should be needed in client code.

---

## 24. Performance

Optimize only after correctness, but avoid obvious inefficiencies.

- Use indexed queries for assigned month and category where appropriate.
- Do not load all historical transactions for a single-month screen.
- Aggregate in domain selectors or database queries, not during every list row render.
- Memoize only when measurement or clear render behavior justifies it.
- Virtualize long transaction lists.
- Recalculate only affected month ranges after historical changes.
- Avoid writing to storage on every keystroke.

---

## 25. Accessibility

- Provide accessible labels for icon-only buttons.
- Maintain sufficient contrast.
- Support system font scaling where practical.
- Do not communicate income and expense using color alone.
- Ensure confirmation dialogs are keyboard and screen-reader accessible.
- Use clear field labels, not placeholders as the only label.
- Keep touch targets appropriately sized.

---

## 26. Git and Change Discipline

Keep commits small and feature-focused.

Recommended commit examples:

```text
feat: add income category creation
feat: add monthly balance calculations
fix: prevent deleting categories used by transactions
test: cover balance propagation after historical edit
```

Do not combine unrelated formatting, dependency upgrades, refactors, and feature work in one change.

Never commit:

- local environment files,
- generated secrets,
- debug logs,
- temporary test buttons,
- database files containing personal data.

---

## 27. Final Reminder

Before every feature:

- read this file,
- follow the documented MVP scope,
- preserve data integrity,
- keep money calculations integer-based,
- keep financial rules outside UI components,
- make one focused change,
- do not add libraries or post-MVP features without approval,
- run lint, typecheck, and tests,
- explain how the result can be verified.
