# ProMoney Lite — Fast, Functional Frontend

ProMoney Lite is the simplified version of the previous Aurora Glass project, using **React + Vite + plain CSS**. It is intentionally designed for clarity and speed instead of decorative effects.

## Start the website

1. Install **Node.js 20+** if it is not installed.
2. Extract this ZIP file.
3. Open the `ProMoney-Fast` folder in VS Code.
4. Open **Terminal → New Terminal** and run:

   ```bash
   npm install
   npm run dev
   ```

5. Visit the address Vite prints (usually http://localhost:5173).

To test the optimized production version:

```bash
npm run build
npm run preview
```

For Vercel: import your repository, choose Vite, build command `npm run build`, output directory `dist`. `vercel.json` is included to support React Router deep links.

## What works in this edition

| Page | Functionality |
|---|---|
| Dashboard | Income, expenses, balance, recent transactions, budgets, goals, period filter |
| Income / Expenses | Add, edit, delete, search, period filter, export CSV |
| Categories | Built-in categories, add / rename / remove custom categories (used categories protected) |
| Budgets & Goals | Set, update and remove monthly category limits; show spending and goal progress |
| Savings | Add savings goals, record contributions, remove goals |
| Reports | 12-month income/expense table, category summaries, CSV export |
| Custom Report | Date, type and category filters; reorder/rename columns; safe arithmetic; preview and CSV |
| Settings | Change demo profile and display currency; JSON download; reset demo data |
| Demo Login / Register | Update local demo profile only; **not secure authentication** |

## Important: NOT a finished production finance platform

- No backend, Express API, MySQL or server-authenticated accounts have been added.
- Data is stored in browser `localStorage` under the *same storage key* as the older Aurora demo (`promoney-aurora-demo-v1`), so locally saved records in the **same browser and origin** are retained when you switch versions.
- Data is not safely stored across devices or separated by user. **Do not enter sensitive real financial details.**
- Currency selection changes the displayed symbol and number formatting. It does not convert currency values.
- Budget amounts are monthly. On the dashboard the budget overview always uses the **current month**, even when another dashboard period is selected.
- The simplified Custom Report supports basic arithmetic on transaction amounts; advanced multi-field formulas/conditional expressions are not yet implemented.

## Performance-focused changes

- Flat white/gray styling, **no glass blur, animations, background artwork, gradients or Google Fonts**.
- Dashboard uses simple text, progress bars, and up to eight recent transactions instead of charts.
- Reports use numeric tables instead of graphical charts.
- Other pages are loaded on demand using `React.lazy`.
- Transactions render 50 results at a time with a Show More button.
- Finance currency formatters and key dashboard calculations are cached or computed once per update.
- Does not bundle the 2 MB reference image; no external images required.

The performance improvements are implementation changes, not a benchmark claim. Actual speed depends on the device, browser, data size, and hosting.

## Files to edit

```
src/
  App.jsx                     App routes
  components/Layout.jsx       Simple header and sidebar
  components/UI.jsx           Shared components and dialog
  context/FinanceContext.jsx  Demo data and update methods
  pages/Dashboard.jsx         Dashboard
  pages/Transactions.jsx      Income and expense pages
  pages/Budgets.jsx           Budgets
  pages/Savings.jsx           Savings goals
  pages/Categories.jsx        Categories
  pages/Reports.jsx           Financial reports
  pages/CustomReport.jsx      Custom reports
  pages/Settings.jsx          Settings
  styles.css                  All styling
```

## Verification in the creation environment

- All 15 JavaScript/JSX source files parsed and relative imports resolved.
- CSS parsed without errors.
- Finance functions passed small sample calculation tests.
- Full npm install and production build could **not** run in the file-generation environment because `registry.npmjs.org` returned a DNS/network error. Build and browser performance are **not confirmed** yet; run the commands above on your machine.
