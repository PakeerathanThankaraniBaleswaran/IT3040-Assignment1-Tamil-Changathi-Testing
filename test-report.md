# Playwright Test Report

Date: 2026-01-29
 Total: 37
## Summary (Chromium)

Command used:

```bash
npx playwright test --project=chromium --reporter=line
```

Results:

- Total: 37line
- Passed: 37
- Failed: 0
- Duration: ~1.8m

## Suites covered

- Changathi Thanglish → Tamil (data-driven)
  - Spec: `tests/changathi-thanglish-to-tamil.spec.ts`
  - Data: `testdata/cases.json`
  - Cases: 34

- Tamil Changathi website load check

## Per-test Pass/Fail

Full per-test status table is in [test-report-details.md](test-report-details.md).

If you want to see PASS/FAIL in terminal output:

```bash
npx playwright test --project=chromium --reporter=list
```
  - Spec: `tests/tamil-changathi.spec.ts`
  - Checks: page loads + title non-empty

## Useful commands

Run only Changathi suite:

```bash
npx playwright test tests/changathi-thanglish-to-tamil.spec.ts --project=chromium
```

Run one case by id:

```bash
npx playwright test tests/changathi-thanglish-to-tamil.spec.ts --project=chromium --grep Pos_Fun_0001
```

Open HTML report:

```bash
npx playwright show-report
```

## Notes

- The Changathi suite sets navigation timeout to 60s and retries `page.goto()` once to reduce flakiness.
- Positive cases expect Tamil characters when the input contains Latin letters.
- Negative cases are logged to console for review (robustness cases).
