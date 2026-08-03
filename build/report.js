/* Render build/audit-report.html to PDF. Run after build/report.py.
   Usage: node build/report.js

   Two passes, then merged by report.py:
     cover  - zero margins so the dark cover bleeds to the paper edge, no footer
     body   - page margins + a running footer with page numbers
   Chromium applies one margin box to the whole document, so a single pass
   cannot do both. */
const { chromium } = require('playwright');
const path = require('path');

const SRC = 'file:///' + path.resolve(__dirname, 'audit-report.html').replace(/\\/g, '/');
const COVER = path.resolve(__dirname, '.cover.pdf');
const BODY = path.resolve(__dirname, '.body.pdf');

(async () => {
  const browser = await chromium.launch();
  const problems = [];

  async function load() {
    const page = await browser.newPage();
    page.on('pageerror', e => problems.push('JS ' + e.message));
    page.on('requestfailed', r => problems.push('REQ ' + r.url()));
    await page.goto(SRC, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    return page;
  }

  // ---- cover: full bleed ----
  const c = await load();
  await c.evaluate(() => {
    document.querySelector('.page').remove();
    const cover = document.querySelector('.cover');
    cover.style.margin = '0';
    cover.style.pageBreakAfter = 'auto';   // nothing follows; avoids a blank sheet
  });
  await c.pdf({
    path: COVER, format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  await c.close();

  // ---- body: margins + footer ----
  const b = await load();
  await b.evaluate(() => document.querySelector('.cover').remove());
  await b.pdf({
    path: BODY, format: 'A4', printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width:100%;font-family:'DM Sans',Arial,sans-serif;font-size:7pt;color:#8b93a7;
                  padding:0 18mm;display:flex;justify-content:space-between;">
        <span>Website audit &nbsp;&middot;&nbsp; oversprayremovalists.com.au &nbsp;&middot;&nbsp; 2 August 2026</span>
        <span class="pageNumber"></span>
      </div>`,
    // bottom must clear the footer template, or the last line of a page collides with it
    margin: { top: '15mm', bottom: '20mm', left: '0', right: '0' },
  });
  await b.close();

  console.log(problems.length ? 'ISSUES: ' + problems.join('; ') : 'rendered clean');
  await browser.close();
})();
