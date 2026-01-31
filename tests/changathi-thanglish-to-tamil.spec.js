const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const URL = 'https://tamil.changathi.com/';

function splitTrailingPunctuation(token) {
  const match = token.match(/^(.*?)([.?!,]+)$/);
  if (!match) return { base: token, punct: '' };
  const base = match[1];
  const punct = match[2];
  if (!base) return { base: token, punct: '' };
  return { base, punct };
}

async function typeWithTransliteration(page, input, rawInput) {
  await input.click();
  await input.fill('');

  // Split but keep whitespace, so newlines/multiple spaces are preserved.
  const parts = String(rawInput).match(/\s+|\S+/g) ?? [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^\s+$/.test(part)) continue;

    const nextIsWhitespace = i + 1 < parts.length && /^\s+$/.test(parts[i + 1]);
    const nextWhitespace = nextIsWhitespace ? parts[i + 1] : '';

    const { base, punct } = splitTrailingPunctuation(part);

    if (punct) {
      await input.type(base, { delay: 80 });
      await page.keyboard.press('Space');
      await page.waitForTimeout(150);
      await page.keyboard.press('Backspace');
      await input.type(punct, { delay: 30 });
    } else {
      await input.type(part, { delay: 80 });
    }

    if (nextIsWhitespace) {
      // Force conversion, but keep the original whitespace formatting exactly.
      await page.keyboard.press('Space');
      await page.waitForTimeout(150);
      await page.keyboard.press('Backspace');
      await input.type(nextWhitespace, { delay: 50 });
      i++; // consume whitespace part
    }
  }

  // Trigger conversion for the last word (trimmed out when we read output).
  await page.keyboard.press('Space');
}

function getAssertionTimeoutMs(tc) {
  const inputLen = String(tc?.input ?? '').length;
  if (inputLen >= 300) return 30000;
  if (inputLen >= 31) return 15000;
  return 9000;
}

async function enableTamilTransliteration(page) {
  await page.waitForFunction(
    () =>
      // @ts-ignore
      !!(window.google && window.google.elements && window.google.elements.transliteration),
    { timeout: 15000 }
  );

  await page.evaluate(() => {
    // @ts-ignore
    const g = window.google;
    // @ts-ignore
    const control = new g.elements.transliteration.TransliterationControl({
      sourceLanguage: g.elements.transliteration.LanguageCode.ENGLISH,
      destinationLanguage: [g.elements.transliteration.LanguageCode.TAMIL],
      transliterationEnabled: true,
    });
    // @ts-ignore
    control.makeTransliteratable(['transliterateTextarea']);
    // @ts-ignore
    window.__pwTransliterationControl = control;
  });
}

function loadCases() {
  const casesPath = path.resolve(__dirname, '..', 'testdata', 'cases.json');
  const raw = fs.readFileSync(casesPath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('testdata/cases.json must be an array');
  return parsed;
}

async function getOutputText(locator) {
  const text = await locator.evaluate((el) => {
    const anyEl = el;
    if (typeof anyEl.value === 'string') return anyEl.value;
    return el.textContent ?? '';
  });
  return text ?? '';
}

async function findInput(page) {
  const byId = page.locator('#transliterateTextarea');
  if (await byId.count()) return byId;

  const byRole = page.getByRole('textbox').first();
  if (await byRole.count()) return byRole;

  return page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
}

async function findOutput(page) {
  const byId = page.locator('#transliterateTextarea');
  if (await byId.count()) return byId;

  return await findInput(page);
}

test.describe('Changathi Thanglish → Tamil', () => {
  test.setTimeout(60000);

  const cases = loadCases();

  for (const tc of cases) {
    test(tc.id, async ({ page }) => {
      page.setDefaultNavigationTimeout(60000);

      try {
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      } catch (e) {
        await page.waitForTimeout(1000);
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      }

      await enableTamilTransliteration(page);

      const input = await findInput(page);
      await expect(input).toBeVisible();

      await page.waitForFunction(() => {
        const el = document.getElementById('transliterateTextarea');
        return el && !el.hasAttribute('disabled') && !el.hasAttribute('readonly');
      }, { timeout: 10000 });

      await typeWithTransliteration(page, input, tc.input);

      // Occasionally the site drops keystrokes; retry once if we didn't type enough.
      if (tc.input.length) {
        const typed = (await getOutputText(input)).trim();
        if (typed.length < Math.min(3, tc.input.trim().length)) {
          await typeWithTransliteration(page, input, tc.input);
        }
      }

      const output = await findOutput(page);
      await expect(output).toBeVisible();

      const readActual = async () => (await getOutputText(output)).trim();
      const readHasTamil = async () => /[\u0B80-\u0BFF]/.test(await readActual());

      const assertionTimeout = getAssertionTimeoutMs(tc);

      if (Array.isArray(tc.expectedAny) && tc.expectedAny.length) {
        const expectedAny = tc.expectedAny.map((s) => String(s).trim());
        await expect
          .poll(async () => expectedAny.includes((await readActual()).trim()), { timeout: assertionTimeout })
          .toBe(true);
      } else if (tc.expected !== undefined) {
        await expect.poll(readActual, { timeout: assertionTimeout }).toBe((tc.expected ?? '').trim());
      } else if (tc.contains) {
        await expect.poll(readActual, { timeout: assertionTimeout }).toContain(tc.contains);
      } else if (tc.type === 'positive') {
        await expect.poll(readActual, { timeout: Math.max(assertionTimeout, 15000) }).not.toBe('');

        if (/[A-Za-z]/.test(tc.input)) {
          await expect.poll(readHasTamil, { timeout: Math.max(assertionTimeout, 15000) }).toBe(true);
        }
      }

      const actual = await readActual();
      if (process.env.PW_LOG_CASE_OUTPUT === '1') {
        console.log(`\n[${tc.id}] INPUT: ${tc.input}\nACTUAL: ${actual}\n`);
      }
    });
  }
});
