/* ============================================================
   LUXPATH TRAVEL — ADMIN LOGIN
   Google OAuth only · single allowed account
   ============================================================ */

'use strict';

/* ============================================================
   CONFIG
   ============================================================ */
const Config = Object.freeze({
  SUPABASE_URL: 'https://fgeeysssiesdlryoygoa.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWV5c3NzaWVzZGxyeW95Z29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTI0MzUsImV4cCI6MjA5NTk4ODQzNX0.Sa3vcq9U2BrzFobTqQS4sAmVpXkRH09_PGzol9-NCvw',
  DASHBOARD_URL: 'dashboard',
  ALLOWED_EMAIL: 'system@luxpathtravel.com',  // only this Google account is accepted
});

/* ── Helpers ─────────────────────────────────────────────── */
function isConfigured() {
  return Config.SUPABASE_URL.startsWith('https://') && Config.SUPABASE_ANON_KEY.startsWith('eyJ');
}

let _client = null;
function getClient() {
  if (!_client && isConfigured()) {
    _client = supabase.createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);
  }
  return _client;
}

function showError(msg) {
  const banner = document.getElementById('loginError');
  const text = document.getElementById('loginErrorMsg');
  if (text) text.textContent = msg;
  if (banner) banner.hidden = false;
}

function hideError() {
  const el = document.getElementById('loginError');
  if (el) el.hidden = true;
}

function resetGoogleBtn() {
  const btn = document.getElementById('googleBtn');
  if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); }
}

/* ============================================================
   GOOGLE OAUTH
   ============================================================ */
async function handleGoogleLogin() {
  const db = getClient();
  console.log('[Login] ── Google: signInWithOAuth starting...');

  const redirectTo = window.location.origin + window.location.pathname;
  console.log('[Login]    redirectTo:', redirectTo);

  const btn = document.getElementById('googleBtn');
  if (btn) { btn.disabled = true; btn.classList.add('btn--loading'); }
  hideError();

  try {
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) {
      console.error('[Login]    Google OAuth error:', error.message);
      showError('Google sign-in failed: ' + error.message);
      resetGoogleBtn();
    } else {
      console.log('[Login]    Google: browser is redirecting to Google...');
      // Browser navigates away — nothing else to do here
    }
  } catch (err) {
    console.error('[Login]    Google OAuth threw:', err.message);
    showError('Google sign-in failed. Check your internet connection.');
    resetGoogleBtn();
  }
}

function initGoogleBtn() {
  const btn = document.getElementById('googleBtn');
  if (!btn) return;
  btn.addEventListener('click', handleGoogleLogin);
  console.log('[Login]    Google button wired up.');
}

/* ============================================================
   ENTRY POINT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Login] ── Step 1: DOMContentLoaded fired ──────────────────');

  // Logo fallback (no inline handlers — CSP safe)
  document.querySelectorAll('img[data-logo-fallback]').forEach(img => {
    const fallback = () => {
      img.style.display = 'none';
      const sib = img.nextElementSibling;
      if (sib?.tagName === 'SPAN') sib.style.display = 'block';
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });

  const checking = document.getElementById('authChecking');
  const authScreen = document.getElementById('authScreen');
  const notConfigured = document.getElementById('notConfiguredScreen');

  // ── Step 2: Credentials check ───────────────────────────
  const configured = isConfigured();
  console.log('[Login] ── Step 2: isConfigured() =', configured);
  console.log('[Login]    SUPABASE_URL  starts with https:// ?', Config.SUPABASE_URL.startsWith('https://'));
  console.log('[Login]    ANON_KEY      starts with eyJ       ?', Config.SUPABASE_ANON_KEY.startsWith('eyJ'));

  if (!configured) {
    console.warn('[Login]    → Not configured — showing setup screen.');
    checking.hidden = true;
    notConfigured.hidden = false;
    return;
  }

  // ── Step 3: Create Supabase client ──────────────────────
  console.log('[Login] ── Step 3: Creating Supabase client...');
  let db;
  try {
    db = getClient();
    console.log('[Login]    Client created:', db ? 'OK' : 'NULL');
    if (!db) throw new Error('client-is-null');
  } catch (err) {
    console.error('[Login]    Failed to create client:', err.message);
    console.error('[Login]    Supabase CDN loaded?', typeof supabase !== 'undefined' ? 'YES' : 'NO — check CDN script');
    checking.hidden = true;
    authScreen.hidden = false;
    return;
  }

  // ── Step 3.5: Auth state listener (catches Google OAuth redirect) ──
  // Supabase fires SIGNED_IN after it exchanges the ?code= param in the URL.
  // This fires BEFORE getSession() resolves when returning from Google.
  console.log('[Login] ── Step 3.5: Registering onAuthStateChange...');
  db.auth.onAuthStateChange(async (event, session) => {
    console.log('[Login]    onAuthStateChange →', event, '|', session?.user?.email ?? 'no-user');

    if (event !== 'SIGNED_IN' || !session) return;

    const email = session.user.email;
    console.log('[Login]    Signed-in email :', email);
    console.log('[Login]    Allowed email   :', Config.ALLOWED_EMAIL);
    console.log('[Login]    Email matches?  :', email === Config.ALLOWED_EMAIL);

    // Guard: only the allowed account may proceed
    if (email !== Config.ALLOWED_EMAIL) {
      console.warn('[Login]    → Wrong Google account — signing out immediately.');
      await db.auth.signOut().catch(() => { });
      showError(
        `Access denied. Choose the correct email address.`
      );
      resetGoogleBtn();
      return;
    }

    // Correct email — grant access
    console.log('[Login]    → Correct email — redirecting to dashboard.');
    window.location.replace(Config.DASHBOARD_URL);
  });

  // ── Step 4: Check for existing session ──────────────────
  console.log('[Login] ── Step 4: Calling getSession() — timeout: 6 s...');
  const t0 = Date.now();

  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('session-check-timeout')), 6000)
    );
    const result = await Promise.race([db.auth.getSession(), timeout]);
    console.log('[Login]    getSession() resolved in', Date.now() - t0, 'ms');

    const { data: { session } } = result;

    if (session) {
      console.log('[Login] ── Step 5: Existing session found —', session.user.email);

      if (session.user.email !== Config.ALLOWED_EMAIL) {
        console.warn('[Login]    → Session belongs to wrong account — signing out.');
        await db.auth.signOut().catch(() => { });
      } else {
        console.log('[Login]    → Correct account — redirecting to dashboard.');
        window.location.replace(Config.DASHBOARD_URL);
        return;
      }
    } else {
      console.log('[Login] ── Step 5: No existing session — showing login screen.');
    }

  } catch (err) {
    const elapsed = Date.now() - t0;
    if (err.message === 'session-check-timeout') {
      console.warn('[Login] ── Step 5: getSession() timed out after', elapsed, 'ms — forcing login screen.');
    } else {
      console.error('[Login] ── Step 5: getSession() threw after', elapsed, 'ms:', err.message);
    }
  }

  // ── Step 6: Show login screen ────────────────────────────
  console.log('[Login] ── Step 6: Revealing login screen.');
  checking.hidden = true;
  authScreen.hidden = false;
  initGoogleBtn();
  console.log('[Login] ── Done. Ready for Google sign-in. ──────────────────');
});
