/* Render build/worklog.html to Overspray-Website-Build-Log.pdf.
   Run after build/worklog.py:  node build/worklog.js

   Two passes, merged at the end:
     cover - zero margins so the dark cover bleeds to the paper edge, no footer
     body  - page margins plus a running footer with page numbers
   Chromium applies one margin box to the whole document, so a single pass
   cannot do both. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SRC = 'file:///' + path.resolve(__dirname, 'worklog.html').replace(/\\/g, '/');
const COVER = path.resolve(__dirname, '.wl-cover.pdf');
const BODY = path.resolve(__dirname, '.wl-body.pdf');

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

  const c = await load();
  await c.evaluate(() => {
    /* querySelectorAll, not querySelector. There is more than one .page now,
       and removing only the first left the rest to render into the cover pass
       at zero margin — a 9 page document came out as 20. */
    document.querySelectorAll('.page, .pagebreak').forEach((el) => el.remove());
    const cover = document.querySelector('.cover');
    cover.style.margin = '0';
    cover.style.pageBreakAfter = 'auto'; // nothing follows; avoids a blank sheet
  });
  await c.pdf({
    path: COVER, format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  await c.close();

  const b = await load();
  await b.evaluate(() => {
    document.querySelector('.cover').remove();
    /* The stylesheet sets `@page { margin: 0 }` so the cover can bleed to the
       paper edge. CSS wins over the margin option below, so without this the
       body also ran edge to edge and the footer template printed on top of the
       last rows. Later rule, same specificity, so this one takes it. */
    const s = document.createElement('style');
    s.textContent = '@page { size: A4; margin: 14mm 0 26mm; }';
    document.head.appendChild(s);
  });
  await b.pdf({
    path: BODY, format: 'A4', printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#8b93a7;
                  padding:0 18mm;display:flex;justify-content:space-between;">
        <span>The Overspray Removalist &nbsp;&middot;&nbsp; website build log</span>
        <span class="pageNumber"></span>
      </div>`,
    // bottom must clear the footer template or the last line collides with it
    margin: { top: '14mm', bottom: '26mm', left: '0', right: '0' },
  });
  await b.close();

  console.log(problems.length ? 'ISSUES: ' + problems.join('; ') : 'rendered clean');
  console.log('cover', fs.statSync(COVER).size, 'body', fs.statSync(BODY).size);
  await browser.close();
})();
