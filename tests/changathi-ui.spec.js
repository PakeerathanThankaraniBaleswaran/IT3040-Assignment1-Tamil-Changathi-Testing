const { test, expect } = require('@playwright/test');

const URL = 'https://tamil.changathi.com/';

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

async function findInput(page) {
  const byId = page.locator('#transliterateTextarea');
  if (await byId.count()) return byId;
  return page.getByRole('textbox').first();
}

test.describe('Changathi UI', () => {
  test.setTimeout(60000);

  test('Pos_UI_0001 - Real-time update + clear input', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await enableTamilTransliteration(page);

    const input = await findInput(page);
    await expect(input).toBeVisible();

    await input.click();
    await input.fill('');

    // Type partially and ensure output updates (Tamil chars appear)
    await input.type('van', { delay: 80 });
    await page.keyboard.press('Space');

    const readValue = async () => String(await input.inputValue()).trim();
    const hasTamil = async () => /[\u0B80-\u0BFF]/.test(await readValue());

    await expect.poll(hasTamil, { timeout: 10000 }).toBe(true);

    const before = await readValue();

    // Continue typing; output should change again
    await page.keyboard.press('Backspace');
    await input.type('akkam', { delay: 80 });
    await page.keyboard.press('Space');

    await expect.poll(async () => (await readValue()) !== before, { timeout: 10000 }).toBe(true);

    // Clear and verify textarea is empty
    await input.fill('');
    await expect.poll(readValue, { timeout: 5000 }).toBe('');
  });
});
