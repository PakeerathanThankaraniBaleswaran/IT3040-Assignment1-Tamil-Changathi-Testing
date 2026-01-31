# Changathi Thanglish → Tamil – Playwright Run Result

Date: 2026-01-29

## What this repo does

This Playwright suite opens https://tamil.changathi.com/ and checks Thanglish → Tamil transliteration using the test cases in `testdata/cases.json`.

- Test file: `tests/changathi-thanglish-to-tamil.spec.ts`
- Test data: `testdata/cases.json`

## Latest run (Chromium)

Command:

```bash
npx playwright test tests/changathi-thanglish-to-tamil.spec.ts --project=chromium --reporter=line
```

Result:

- Total: 34
- Passed: 34
- Failed: 0
- Duration: ~1.8m

## How to run

Run only this suite:

```bash
npx playwright test tests/changathi-thanglish-to-tamil.spec.ts --project=chromium
```

Run a single case by id:

```bash
npx playwright test tests/changathi-thanglish-to-tamil.spec.ts --project=chromium --grep Pos_Fun_0001
```

Open HTML report:

```bash
npx playwright show-report
```

## Notes

- The site sometimes responds slowly; the test increases navigation timeout to 60s and retries `page.goto()` once.
- For `type: "positive"` cases, the test expects Tamil characters to appear when the input contains Latin letters.
- For `type: "negative"` cases, the test prints the actual output to console but does not do strict Tamil assertions (robustness cases).
