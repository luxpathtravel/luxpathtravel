/* WhatsApp click tracker — fires on any wa.me link click, logs to click_counter table */
(function () {
  const URL_BASE = 'https://dkerfetnaquggtlpicul.supabase.co/rest/v1/click_counter';
  const KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZXJmZXRuYXF1Z2d0bHBpY3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODY5MDUsImV4cCI6MjA2MjM2MjkwNX0.GMEkAcx_SWTjV_TdlhQNXzIzh9mDM_L2h8SaLXllQsw';
  const WEBSITE  = 'luxpathtravel.com';
  const MONTHS   = ['january','february','march','april','may','june',
                    'july','august','september','october','november','december'];

  const AUTH_HEADERS = {
    'apikey':        KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type':  'application/json',
  };

  async function insertNewClick() {
    const now   = new Date();
    const month = MONTHS[now.getMonth()];
    const year  = now.getFullYear();

    // 1. Fetch current row
    const res = await fetch(
      `${URL_BASE}?website=eq.${encodeURIComponent(WEBSITE)}&select=*`,
      { headers: AUTH_HEADERS }
    );
    if (!res.ok) return;
    const rows = await res.json();
    if (!rows.length) return;
    const data = rows[0];

    // 2. Parse this month's array
    let monthData = data[month] || [];
    if (typeof monthData === 'string') {
      try { monthData = JSON.parse(monthData); } catch { monthData = []; }
    }
    // Normalize any legacy object entries
    monthData = monthData.map(e =>
      (typeof e === 'object' && e !== null) ? `Clicks ${e.clicks} - ${e.year}` : e
    );

    // 3. Increment or create this year's entry
    const idx = monthData.findIndex(e => e.includes(`- ${year}`));
    if (idx !== -1) {
      const m = monthData[idx].match(/Clicks (\d+) - (\d+)/);
      monthData[idx] = `Clicks ${m ? parseInt(m[1], 10) + 1 : 1} - ${year}`;
    } else {
      monthData.push(`Clicks 1 - ${year}`);
    }

    // 4. Persist
    await fetch(
      `${URL_BASE}?website=eq.${encodeURIComponent(WEBSITE)}`,
      { method: 'PATCH', headers: AUTH_HEADERS, body: JSON.stringify({ [month]: monthData }) }
    );
  }

  // Capture-phase listener so it fires before the browser follows the link
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (a && a.href && a.href.includes('wa.me')) {
      insertNewClick().catch(function () {});
    }
  }, true);
})();
