/* ============================================================
   LUXPATH TRAVEL — ADMIN LOGIN
   Supabase Auth · email/password · role-based access
   ============================================================
   FLOW
   1. DOMContentLoaded → check existing session
   2. If valid admin session → redirect to dashboard
   3. If no session → show login form
   4. On submit → signInWithPassword → check user_roles → redirect
   ============================================================ */

'use strict';

/* ============================================================
   CONFIG  (must match dashboard.js Config)
   ============================================================ */
const Config = Object.freeze({
  SUPABASE_URL:      'YOUR_SUPABASE_URL',      // ← replace
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY', // ← replace
  DASHBOARD_URL:     'dashboard.html',
});

/* ── Is Supabase configured? ─────────────────────────────── */
function isConfigured() {
  return (
    Config.SUPABASE_URL      !== 'YOUR_SUPABASE_URL' &&
    Config.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
  );
}

/* ── Supabase client (singleton) ─────────────────────────── */
let _client = null;
function getClient() {
  if (!_client && isConfigured()) {
    _client = supabase.createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);
  }
  return _client;
}

/* ============================================================
   HELPERS
   ============================================================ */

/** Check whether the authenticated user has admin/super_admin role. */
async function checkAdminRole(userId) {
  const db = getClient();
  if (!db) return false;
  // RLS policy rls_user_roles_self_select allows the authed user to read their own row
  const { data, error } = await db
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  return !error && !!data;
}

/** Show the error banner with a given message. */
function showError(msg) {
  const banner = document.getElementById('loginError');
  const text   = document.getElementById('loginErrorMsg');
  if (text)   text.textContent = msg;
  if (banner) banner.hidden = false;
}

/** Hide the error banner. */
function hideError() {
  document.getElementById('loginError').hidden = true;
}

/** Set form + button into loading/idle state. */
function setLoading(on) {
  const btn  = document.getElementById('loginBtn');
  const eml  = document.getElementById('emailInput');
  const pwd  = document.getElementById('passwordInput');
  const tog  = document.getElementById('passwordToggle');
  if (btn) { btn.classList.toggle('btn--loading', on); btn.disabled = on; }
  if (eml) eml.disabled = on;
  if (pwd) pwd.disabled = on;
  if (tog) tog.disabled = on;
}

/** Mark a field as invalid (visual feedback). */
function setFieldError(id, hasError) {
  document.getElementById(id)?.classList.toggle('is-error', hasError);
}

/** Map Supabase/network error messages to human-friendly copy. */
function friendlyError(supabaseMsg) {
  const msg = (supabaseMsg ?? '').toLowerCase();
  if (msg.includes('invalid login') || msg.includes('invalid credentials'))
    return 'Incorrect email or password. Please try again.';
  if (msg.includes('email not confirmed'))
    return 'Email not confirmed. Check your inbox for a confirmation link.';
  if (msg.includes('too many requests') || msg.includes('rate limit'))
    return 'Too many login attempts. Please wait a few minutes and try again.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Connection error. Check your internet connection and try again.';
  return supabaseMsg || 'An unexpected error occurred. Please try again.';
}

/* ============================================================
   CORE FLOW
   ============================================================ */

/** Handle form submission. */
async function handleLogin(email, password) {
  setLoading(true);
  hideError();
  setFieldError('emailInput',    false);
  setFieldError('passwordInput', false);

  const db = getClient();

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      showError(friendlyError(error.message));
      // Highlight the relevant field
      if (error.message.toLowerCase().includes('email'))
        setFieldError('emailInput', true);
      else
        setFieldError('passwordInput', true);
      setLoading(false);
      return;
    }

    // Supabase sign-in succeeded — now check admin role
    const isAdmin = await checkAdminRole(data.user.id);

    if (!isAdmin) {
      // Sign out immediately — this user has no admin access
      await db.auth.signOut();
      showError(
        'Access denied. Your account does not have admin permissions. ' +
        'Contact the super admin to request access.'
      );
      setLoading(false);
      return;
    }

    // ✅ Authenticated & authorised — navigate to dashboard
    // Keep loading state active during redirect so the button doesn't flash back
    window.location.replace(Config.DASHBOARD_URL);

  } catch (err) {
    showError(friendlyError(err.message));
    setLoading(false);
  }
}

/* ============================================================
   PASSWORD REVEAL TOGGLE
   ============================================================ */
function initPasswordToggle() {
  const btn   = document.getElementById('passwordToggle');
  const input = document.getElementById('passwordInput');
  const show  = btn?.querySelector('.eye-show');
  const hide  = btn?.querySelector('.eye-hide');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const revealing = input.type === 'password';
    input.type = revealing ? 'text' : 'password';
    btn.setAttribute('aria-label',   revealing ? 'Hide password' : 'Show password');
    btn.setAttribute('aria-pressed', String(revealing));
    if (show) show.style.display = revealing ? 'none' : '';
    if (hide) hide.style.display = revealing ? ''     : 'none';
  });
}

/* ============================================================
   FORM INIT
   ============================================================ */
function initForm() {
  const form    = document.getElementById('loginForm');
  const emailEl = document.getElementById('emailInput');
  const pwdEl   = document.getElementById('passwordInput');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email    = emailEl.value.trim();
    const password = pwdEl.value;

    // Basic client-side validation
    if (!email) {
      showError('Please enter your email address.');
      setFieldError('emailInput', true);
      emailEl.focus();
      return;
    }
    if (!password) {
      showError('Please enter your password.');
      setFieldError('passwordInput', true);
      pwdEl.focus();
      return;
    }

    handleLogin(email, password);
  });

  // Clear error state on input
  emailEl.addEventListener('input', () => { hideError(); setFieldError('emailInput', false); });
  pwdEl.addEventListener('input',   () => { hideError(); setFieldError('passwordInput', false); });

  // Auto-focus email field
  emailEl.focus();
}

/* ============================================================
   ENTRY POINT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // Handle logo load failure without inline handlers (required for strict CSP)
  document.querySelectorAll('img[data-logo-fallback]').forEach(img => {
    const fallback = () => {
      img.style.display = 'none';
      const sib = img.nextElementSibling;
      if (sib?.tagName === 'SPAN') sib.style.display = 'block';
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });

  const checking     = document.getElementById('authChecking');
  const authScreen   = document.getElementById('authScreen');
  const notConfigured = document.getElementById('notConfiguredScreen');

  // ── Supabase not configured ──────────────────────────────
  if (!isConfigured()) {
    checking.hidden      = true;
    notConfigured.hidden = false;
    return;
  }

  // ── Show any error passed via URL (?error=unauthorized) ──
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error') === 'unauthorized') {
    // Will be shown after form appears below
  }

  // ── Check for an existing valid session ──────────────────
  const db = getClient();
  try {
    const { data: { session } } = await db.auth.getSession();

    if (session) {
      const isAdmin = await checkAdminRole(session.user.id);
      if (isAdmin) {
        // Already authenticated as admin — go straight to dashboard
        window.location.replace(Config.DASHBOARD_URL);
        return; // leave spinner visible during redirect
      } else {
        // Session exists but not an admin — sign out silently
        await db.auth.signOut();
      }
    }
  } catch (_) {
    // Network error during session check — fall through to show form
  }

  // ── Show login form ───────────────────────────────────────
  checking.hidden    = true;
  authScreen.hidden  = false;

  // Show error from URL param after form is visible
  if (urlParams.get('error') === 'unauthorized') {
    showError(
      'Access denied. Your account does not have admin permissions. ' +
      'Sign in with an authorised admin account.'
    );
  }

  initPasswordToggle();
  initForm();
});
