# Energy Dashboard

A static browser dashboard for tracking electricity and natural gas bills, visualizing consumption and unit costs, and keeping data locally in the browser.

apcaruso.github.io/e-dashboard/

## Dashboards

- Electricity
- Natural Gas

## Features

- Bill tracking with manual entry
- Paste/import support for tabular bill data
- Consumption and unit-cost charts
- Summary statistics
- Cost breakdown chart
- Local browser persistence with `localStorage`
- Electricity forecast based on selectable usage profiles
- Gas price simulation slider

## Technology

- Static HTML
- Plain JavaScript loaded by script tags
- React 18 from CDN
- ReactDOM from CDN
- Babel standalone from CDN
- Chart.js from CDN
- No package manager, build step, backend, or test suite

## Repository Structure

```txt
.
├── index.html
├── electricity/
│   ├── App.js
│   ├── data.js
│   └── index.html
├── gas/
│   ├── App.js
│   ├── data.js
│   └── index.html
└── common/
    ├── css/
    │   └── style.css
    └── js/
        ├── dashboard.js
        ├── market.js
        ├── utils.js
        └── components/
            ├── CostBreakdownChart.js
            ├── DataTable.js
            ├── EnergyChart.js
            └── SummaryStats.js
```

## Local Usage

From the repository root, run a static server:

```sh
python3 -m http.server 8000
```

Open:

- `http://localhost:8000/`
- `http://localhost:8000/electricity/`
- `http://localhost:8000/gas/`

## GitHub Pages Deployment

This repository includes a GitHub Pages workflow at `.github/workflows/pages.yml`.

The workflow uploads the repository root (`.`) as the static site artifact, because `index.html` is already at the repository root. On GitHub Pages, the deployed root opens the dashboard home directly.

To deploy:

1. Push to the configured default branch (`master` in the current workflow).
2. In the GitHub repository settings, set Pages source to GitHub Actions.
3. Wait for the `Deploy static site to GitHub Pages` workflow to finish.

If the repository default branch is changed to `main`, update the branch name in `.github/workflows/pages.yml`.

## Data And Privacy

The app stores bill data locally in the browser through `localStorage`. There is no backend, and the app itself does not send bill data to a server.

Clearing browser storage or using a different browser/profile will remove or isolate saved data.

## Limitations

- Runtime libraries are loaded from external CDNs, so the app depends on CDN availability.
- Market reference values in `common/js/market.js` are embedded demo values, not live market data.
- Persistence is browser-only through `localStorage`.
- There is no production bundling or automated test suite.

## License

WTFPL - Do What The Fuck You Want To Public License.
