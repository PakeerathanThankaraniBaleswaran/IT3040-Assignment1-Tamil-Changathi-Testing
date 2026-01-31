# IT3040 Assignment 1 — Thanglish → Tamil (Changathi) Testing

This repository contains a data-driven Playwright test suite to evaluate the accuracy and UI stability of:
- https://tamil.changathi.com/

It is designed to match **IT3040 – ITPM (Assignment 1)** Option 2 requirements.

## What’s included

- **24 positive functional scenarios**: `Pos_Fun_0001` → `Pos_Fun_0024`
- **10 negative functional scenarios** (robustness/limitations): `Neg_Fun_0001` → `Neg_Fun_0010`
- **1 UI scenario**: `Pos_UI_0001` (real-time / clearing behavior)

Test data lives in `testdata/cases.json` and is executed by Playwright specs under `tests/`.

## Prerequisites

- Node.js (LTS recommended)

## Install

```bash
npm install
npx playwright install
```

## Run tests (terminal PASS/FAIL)

Chromium only (recommended):

```bash
npm test
```

Run and print each case’s actual output (useful for filling the Excel template):

```bash
npm run test:log
```

Run all configured projects (Chromium always; Firefox/WebKit only if enabled via env):

```bash
npm run test:all
```

### Optional: enable Firefox / WebKit

Firefox:

```bash
PW_ENABLE_FIREFOX=1 npm run test:all
```

WebKit (may require additional OS packages on Linux):

```bash
PW_ENABLE_WEBKIT=1 npm run test:all
```

## Reports / outputs

- Terminal reporter: **list** (shows PASS/FAIL in terminal)
- JSON execution output: `latest-results.json`
- HTML report: `playwright-report/`

Open the HTML report:

```bash
npm run report
```

## How to fill the Excel test case template (Appendix 2)

Suggested workflow:
1. Use each entry in `testdata/cases.json` as a row in the Excel template.
2. Run `npm run test:log`.
3. Copy **ACTUAL** outputs (printed in terminal) into Excel.
4. Set **Status** based on your evaluation:
   - Positive cases: normally should be **Pass** if output matches `expected`/`contains`.
   - Negative cases: you can mark **Fail** if the system output is incorrect/undesired (even if the automation run itself is “green”, because the automation is verifying the observed limitation).

> Note: This suite is intentionally written to be stable and re-runnable, so some “negative” cases are asserted against the current observed output. This helps you consistently capture Actual Output for analysis.
