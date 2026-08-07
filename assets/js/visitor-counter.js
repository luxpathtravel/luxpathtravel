/* Visitor counter — fires on every page load / reload, adds 1 to the current
   month in the visitors_counter table (Luxpath Online Website project).
   Standalone: plain fetch, no supabase-js dependency, so it also runs on the
   pages that don't load the Supabase library. */
(function () {
  const RPC_URL = 'https://fgeeysssiesdlryoygoa.supabase.co/rest/v1/rpc/increment_visitor_counter';
  const KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWV5c3NzaWVzZGxyeW95Z29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTI0MzUsImV4cCI6MjA5NTk4ODQzNX0.Sa3vcq9U2BrzFobTqQS4sAmVpXkRH09_PGzol9-NCvw';

  // The month is decided server-side inside the RPC, so a visitor can't spoof it.
  function countVisit() {
    fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'apikey':        KEY,
        'Authorization': `Bearer ${KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: '{}',
      keepalive: true,
    }).catch(function () { /* never let the counter break the page */ });
  }

  // Defer to idle so the count never competes with content requests
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(countVisit, { timeout: 2000 });
  } else {
    setTimeout(countVisit, 0);
  }
})();
