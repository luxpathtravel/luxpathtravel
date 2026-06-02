/* ============================================================
   LUXPATH TRAVEL — ADMIN DASHBOARD
   Self-contained · Supabase backend · Production-ready
   ============================================================
   MODULES
   1.  Config
   2.  DB  (Supabase CRUD)
   3.  StorageManager
   4.  Auth
   5.  Toast
   6.  Modal
   7.  Sidebar
   8.  ImageManager
   9.  ItineraryBuilder
   10. InclusionsBuilder
   11. PackageList
   12. PackageForm
   13. App
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIG
   ============================================================ */
const Config = Object.freeze({
  SUPABASE_URL:      'https://fgeeysssiesdlryoygoa.supabase.co',        // ← replace
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWV5c3NzaWVzZGxyeW95Z29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTI0MzUsImV4cCI6MjA5NTk4ODQzNX0.Sa3vcq9U2BrzFobTqQS4sAmVpXkRH09_PGzol9-NCvw',   // ← replace
  get STORAGE_URL()  { return this.SUPABASE_URL + '/storage/v1/object/public/luxpath-media/'; },
  STORAGE_BUCKET:    'luxpath-media',
  WHATSAPP_NUMBER:   '+6281111826527',
  PLACEHOLDER_IMG:   'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F0EDE8" width="400" height="300"/%3E%3C/svg%3E',
  LOGIN_URL:         'login.html',
});

const CATEGORY_LABELS = { honeymoon: 'Honeymoon', family: 'Family', luxury: 'Luxury', adventure: 'Adventure' };
const PRICE_TYPE_LABELS = { exact: 'Exact Price', starting_from: 'Starting From', approximate: 'Approximate' };
const CURRENCY_LABELS   = { SAR: 'SAR (Saudi Riyal)', USD: 'USD (US Dollar)', EUR: 'EUR (Euro)' };
const MEAL_LABELS       = { breakfast: 'Breakfast 🍳', lunch: 'Lunch 🥗', dinner: 'Dinner 🍽️' };

const INCLUSION_ICONS = [
  ['flight','✈️ Flight'],['hotel','🏨 Hotel'],['transfer','🚌 Transfer'],
  ['guide_arabic','🗣️ Arabic Guide'],['guide_local','👤 Local Guide'],
  ['tour','🗺️ Tour'],['meal_breakfast','🍳 Breakfast'],
  ['meal_lunch','🥗 Lunch'],['meal_dinner','🍽️ Dinner'],['meals_all','🍽️ All Meals'],
  ['visa','📋 Visa'],['insurance','🛡️ Insurance'],['sim_card','📱 SIM Card'],
  ['photo_session','📸 Photo Session'],['water_activities','🤿 Water Activities'],
  ['spa','💆 Spa'],['custom','✨ Custom'],
];

/* ============================================================
   2. DB — Supabase queries
   ============================================================ */
const DB = (() => {
  let _client = null;

  const isConfigured = () =>
    Config.SUPABASE_URL.startsWith('https://') && Config.SUPABASE_ANON_KEY.startsWith('eyJ');

  const client = () => {
    if (!isConfigured()) return null;
    if (!_client) _client = supabase.createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);
    return _client;
  };

  const q = async (fn) => {
    const db = client();
    if (!db) throw new Error('Supabase not configured. Add credentials to Config in dashboard.js.');
    const { data, error } = await fn(db);
    if (error) throw new Error(error.message);
    return data;
  };

  return {
    isConfigured,
    client,

    // ── Destinations ──────────────────────────────────────
    getDestinations: () => q(db =>
      db.from('destinations').select('id, slug, name_ar, name_en').eq('is_active', true).order('display_order')
    ),

    // ── Packages list ─────────────────────────────────────
    getPackages: () => q(db =>
      db.from('packages')
        .select(`
          id, slug_en, slug_ar, title_ar, title_en,
          category, price_type, price_value, currency,
          duration_nights, duration_days,
          is_featured, is_active, display_order, inquiry_count,
          hero_image_url, created_at,
          package_destinations (
            destination_id, is_primary,
            destinations ( slug, name_ar, name_en )
          )
        `)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
    ),

    // ── Single package (full, for editing) ────────────────
    getPackage: (id) => q(db =>
      db.from('packages')
        .select(`
          *,
          package_destinations (
            destination_id, is_primary, display_order,
            destinations ( id, slug, name_ar, name_en )
          ),
          package_images (
            id, image_url, alt_ar, alt_en, is_hero, display_order
          ),
          package_inclusions (
            id, type, icon, text_ar, text_en, display_order
          ),
          package_itinerary (
            id, day_number, title_ar, title_en,
            description_ar, description_en,
            location_ar, location_en,
            meals_included, image_url
          )
        `)
        .eq('id', id)
        .single()
    ),

    // ── Create package ────────────────────────────────────
    createPackage: (data) => q(db =>
      db.from('packages').insert(data).select('id, slug_en').single()
    ),

    // ── Update package ────────────────────────────────────
    updatePackage: (id, data) => q(db =>
      db.from('packages').update(data).eq('id', id).select('id').single()
    ),

    // ── Delete package ────────────────────────────────────
    deletePackage: (id) => q(db =>
      db.from('packages').delete().eq('id', id)
    ),

    // ── Toggle field (active / featured) ─────────────────
    togglePackageField: (id, field, value) => q(db =>
      db.from('packages').update({ [field]: value }).eq('id', id)
    ),

    // ── Package destinations ──────────────────────────────
    deletePackageDestinations: (packageId) => q(db =>
      db.from('package_destinations').delete().eq('package_id', packageId)
    ),
    insertPackageDestinations: (rows) => q(db =>
      db.from('package_destinations').insert(rows)
    ),

    // ── Package images ────────────────────────────────────
    deletePackageImages: (packageId) => q(db =>
      db.from('package_images').delete().eq('package_id', packageId)
    ),
    insertPackageImages: (rows) => q(db =>
      db.from('package_images').insert(rows)
    ),

    // ── Package inclusions ────────────────────────────────
    deletePackageInclusions: (packageId) => q(db =>
      db.from('package_inclusions').delete().eq('package_id', packageId)
    ),
    insertPackageInclusions: (rows) => q(db =>
      db.from('package_inclusions').insert(rows)
    ),

    // ── Package itinerary ─────────────────────────────────
    deletePackageItinerary: (packageId) => q(db =>
      db.from('package_itinerary').delete().eq('package_id', packageId)
    ),
    insertPackageItinerary: (rows) => q(db =>
      db.from('package_itinerary').insert(rows)
    ),

    // ── Fetch all image paths for a package (used before delete) ─
    getPackageImages: (packageId) => q(db =>
      db.from('package_images').select('image_url').eq('package_id', packageId)
    ),

    // ── Check slug_en uniqueness ──────────────────────────
    checkSlugAvailable: async (slug, excludeId = null) => {
      const db = client();
      if (!db) throw new Error('Supabase not configured.');
      let query = db.from('packages').select('id').eq('slug_en', slug);
      if (excludeId) query = query.neq('id', excludeId);
      const { data } = await query;
      return !data?.length;
    },

    // ── Check slug_ar uniqueness ──────────────────────────
    checkSlugAvailableAr: async (slug, excludeId = null) => {
      const db = client();
      if (!db) throw new Error('Supabase not configured.');
      let query = db.from('packages').select('id').eq('slug_ar', slug);
      if (excludeId) query = query.neq('id', excludeId);
      const { data } = await query;
      return !data?.length;
    },
  };
})();

/* ============================================================
   3. STORAGE MANAGER
   ============================================================ */
const StorageManager = {
  async upload(file, path) {
    const db = DB.client();
    if (!db) throw new Error('Supabase not configured.');
    const { data, error } = await db.storage
      .from(Config.STORAGE_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);
    return data.path;
  },

  async remove(paths) {
    if (!paths.length) return;
    const db = DB.client();
    if (!db) throw new Error('Supabase not configured.');
    const { error } = await db.storage.from(Config.STORAGE_BUCKET).remove(paths);
    if (error) console.warn('[Storage] Delete warning:', error.message);
  },

  publicUrl(path) {
    if (!path) return Config.PLACEHOLDER_IMG;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return Config.STORAGE_URL + path;
  },
};

/* ============================================================
   4. AUTH — Supabase Authentication
   ============================================================ */
const Auth = (() => {
  let _session   = null;
  let _user      = null;
  let _role      = null;
  let _idleTimer = null;

  const IDLE_MS = 30 * 60 * 1000; // 30-minute idle timeout

  return {
    /**
     * Called once on dashboard load.
     * Supabase must be configured — unconfigured state redirects to login.
     * Returns true if the caller should proceed to showDashboard().
     */
    async init() {
      const db = DB.client();

      if (!db) {
        // Supabase credentials not configured — refuse access entirely
        window.location.replace(Config.LOGIN_URL);
        return false;
      }

      // Retrieve persisted session (stored in localStorage by Supabase JS)
      const { data: { session }, error: sessionErr } = await db.auth.getSession();

      if (sessionErr || !session) {
        window.location.replace(Config.LOGIN_URL);
        return false;
      }

      _session = session;
      _user    = session.user;

      // Verify admin role — uses RLS policy rls_user_roles_self_select
      const { data: roleData, error: roleErr } = await db
        .from('user_roles')
        .select('role')
        .eq('user_id', _user.id)
        .maybeSingle();

      if (roleErr || !roleData) {
        // Authenticated but not an admin — sign out and redirect
        await db.auth.signOut();
        window.location.replace(Config.LOGIN_URL + '?error=unauthorized');
        return false;
      }

      _role = roleData.role;

      // Subscribe to auth state changes: forced sign-out + token refresh
      db.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession) {
          window.location.replace(Config.LOGIN_URL);
          return;
        }
        if (event === 'TOKEN_REFRESHED') {
          _session = newSession;
          _user    = newSession.user;
          // Re-validate admin role on every token refresh
          const { data: rd, error: re } = await db
            .from('user_roles')
            .select('role')
            .eq('user_id', _user.id)
            .maybeSingle();
          if (re || !rd) {
            await db.auth.signOut().catch(() => {});
            window.location.replace(Config.LOGIN_URL + '?error=unauthorized');
          } else {
            _role = rd.role;
          }
        }
      });

      // Start 30-minute idle session timeout
      const resetIdle = () => {
        clearTimeout(_idleTimer);
        _idleTimer = setTimeout(() => this.signOut(), IDLE_MS);
      };
      ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
        .forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));
      resetIdle();

      return true;
    },

    /** Sign the user out via Supabase and redirect to login. */
    async signOut() {
      clearTimeout(_idleTimer);
      const db = DB.client();
      if (db) await db.auth.signOut().catch(() => {});
      window.location.replace(Config.LOGIN_URL);
    },

    getUser()    { return _user; },
    getRole()    { return _role; },
    getSession() { return _session; },
  };
})();

/* ============================================================
   5. TOAST
   ============================================================ */
const Toast = {
  show(type, title, msg = '', duration = 4000) {
    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `
      <div class="toast__icon toast__icon--${type}">${icons[type] ?? icons.info}</div>
      <div class="toast__body">
        <div class="toast__title">${escHtml(title)}</div>
        ${msg ? `<div class="toast__msg">${escHtml(msg)}</div>` : ''}
      </div>
      <button class="toast__close" aria-label="Dismiss">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    document.getElementById('toastContainer').appendChild(el);
    el.querySelector('.toast__close').addEventListener('click', () => this._dismiss(el));
    if (duration > 0) setTimeout(() => this._dismiss(el), duration);
  },
  _dismiss(el) {
    el.classList.add('is-hiding');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  },
  success: (t, m) => Toast.show('success', t, m),
  error:   (t, m) => Toast.show('error',   t, m),
  warning: (t, m) => Toast.show('warning', t, m),
  info:    (t, m) => Toast.show('info',    t, m),
};

/* ============================================================
   6. MODAL
   ============================================================ */
const Modal = {
  _resolve: null,

  confirm(title, body, confirmLabel = 'Confirm') {
    return new Promise((resolve) => {
      this._resolve = resolve;
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalBody').textContent = body;
      document.getElementById('modalConfirmBtn').textContent = '';
      document.getElementById('modalConfirmBtn').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        ${confirmLabel}`;
      document.getElementById('confirmModal').hidden = false;
      document.getElementById('modalConfirmBtn').focus();
    });
  },

  close(result) {
    document.getElementById('confirmModal').hidden = true;
    if (this._resolve) { this._resolve(result); this._resolve = null; }
  },

  _trapFocus(e) {
    const modal = document.getElementById('confirmModal');
    if (modal.hidden) return;
    const focusable = Array.from(modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  },

  init() {
    document.getElementById('modalCancelBtn').addEventListener('click',  () => this.close(false));
    document.getElementById('modalConfirmBtn').addEventListener('click', () => this.close(true));
    document.getElementById('confirmModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('confirmModal')) this.close(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !document.getElementById('confirmModal').hidden) this.close(false);
      if (e.key === 'Tab') this._trapFocus(e);
    });
  },
};

/* ============================================================
   7. SIDEBAR
   ============================================================ */
const Sidebar = {
  init() {
    document.getElementById('menuToggle').addEventListener('click', () => this.open());
    document.getElementById('sidebarClose')?.addEventListener('click', () => this.close());
    document.getElementById('sidebarBackdrop').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await Auth.signOut();
      // signOut() handles the redirect to login.html
    });
    document.querySelectorAll('.sidebar__link[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActive(link.dataset.view);
        App.navigateTo(link.dataset.view);
        this.close();
      });
    });
  },
  open() {
    document.getElementById('sidebar').classList.add('is-open');
    document.getElementById('sidebarBackdrop').classList.add('is-open');
    document.getElementById('menuToggle').setAttribute('aria-expanded', 'true');
  },
  close() {
    document.getElementById('sidebar').classList.remove('is-open');
    document.getElementById('sidebarBackdrop').classList.remove('is-open');
    document.getElementById('menuToggle').setAttribute('aria-expanded', 'false');
  },
  setActive(view) {
    document.querySelectorAll('.sidebar__link[data-view]').forEach(l => {
      const isActive = l.dataset.view === view;
      l.classList.toggle('is-active', isActive);
      if (isActive) { l.setAttribute('aria-current', 'page'); }
      else          { l.removeAttribute('aria-current'); }
    });
  },
};

/* ============================================================
   HELPERS
   ============================================================ */
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

function slugify(text) {
  return (text || '').toLowerCase().trim()
    .replace(/[\s_]+/g, '-').replace(/[^\w-]/g, '')
    .replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function fmtPrice(n, currency = 'SAR') {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('en-US').format(n) + ' ' + currency;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getPrimaryDest(pkg) {
  const dests = pkg.package_destinations ?? [];
  return (dests.find(d => d.is_primary) ?? dests[0])?.destinations ?? null;
}

/* ============================================================
   8. IMAGE MANAGER
   ============================================================ */
const ImageManager = {
  items: [],  // { _lid, status:'existing'|'new'|'deleted', id?, url, file?, preview, alt_ar, alt_en, is_hero, display_order }

  reset() {
    // Revoke all pending object URLs to prevent memory leaks
    this.items.filter(x => x.status === 'new' && x.preview).forEach(item => {
      URL.revokeObjectURL(item.preview);
    });
    this.items = [];
  },

  loadFromDB(images) {
    this.items = (images ?? [])
      .sort((a, b) => (a.is_hero ? -1 : 1) - (b.is_hero ? -1 : 1) || a.display_order - b.display_order)
      .map((img, i) => ({
        _lid: `img_${Date.now()}_${i}`,
        status: 'existing',
        id: img.id,
        url: img.image_url,
        file: null,
        preview: StorageManager.publicUrl(img.image_url),
        alt_ar: img.alt_ar ?? '',
        alt_en: img.alt_en ?? '',
        is_hero: img.is_hero,
        display_order: img.display_order,
      }));
  },

  addFiles(files) {
    const ALLOWED_TYPES = ['image/jpeg', 'image/webp', 'image/png'];
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    const MAX_IMAGES = 10;

    Array.from(files).forEach((file) => {
      // Type validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        Toast.error('Invalid file type', `"${file.name}" must be JPEG, WebP, or PNG.`);
        return;
      }
      // Size validation
      if (file.size > MAX_SIZE_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        Toast.error('File too large', `"${file.name}" is ${mb} MB — max 10 MB per image.`);
        return;
      }
      // Count limit
      const currentCount = this.items.filter(x => x.status !== 'deleted').length;
      if (currentCount >= MAX_IMAGES) {
        Toast.warning('Image limit reached', `Maximum ${MAX_IMAGES} images per package. Remove an existing image first.`);
        return;
      }
      const lid = `img_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      this.items.push({
        _lid: lid, status: 'new', id: null,
        url: null, file,
        preview: URL.createObjectURL(file),
        alt_ar: '', alt_en: '',
        is_hero: this.items.filter(x => x.status !== 'deleted').length === 0,
        display_order: this.items.length,
      });
    });
    this.syncHero();
  },

  remove(lid) {
    const item = this.items.find(x => x._lid === lid);
    if (!item) return;
    if (item.status === 'new') {
      URL.revokeObjectURL(item.preview);
      this.items = this.items.filter(x => x._lid !== lid);
    } else {
      item.status = 'deleted';
    }
    if (item.is_hero) {
      const first = this.items.find(x => x.status !== 'deleted');
      if (first) { first.is_hero = true; item.is_hero = false; }
    }
    this.syncHero();
  },

  setHero(lid) {
    this.items.forEach(x => { if (x.status !== 'deleted') x.is_hero = (x._lid === lid); });
  },

  syncHero() {
    const visible = this.items.filter(x => x.status !== 'deleted');
    if (visible.length && !visible.some(x => x.is_hero)) visible[0].is_hero = true;
  },

  collectFromDOM() {
    this.items.filter(x => x.status !== 'deleted').forEach(item => {
      const el = document.querySelector(`[data-lid="${item._lid}"]`);
      if (!el) return;
      item.alt_ar = el.querySelector('[data-field="alt_ar"]')?.value ?? '';
      item.alt_en = el.querySelector('[data-field="alt_en"]')?.value ?? '';
      item.is_hero = el.querySelector('[data-field="is_hero"]')?.checked ?? false;
    });
    this.syncHero();
  },

  async uploadNew(packageSlug) {
    const newItems = this.items.filter(x => x.status === 'new');
    if (!newItems.length) return;

    // Upload all new images in parallel
    const results = await Promise.allSettled(newItems.map(async (item) => {
      const ext  = item.file.name.split('.').pop().toLowerCase();
      const base = slugify(item.file.name.replace(/\.[^.]+$/, ''));
      const idx  = this.items.indexOf(item);
      const path = `packages/${packageSlug}/gallery/${String(idx).padStart(2,'0')}-${base}.${ext}`;
      item.url    = await StorageManager.upload(item.file, path);
      item.status = 'saved';
    }));

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length) {
      throw new Error(`${failures.length} image(s) failed to upload: ${failures[0].reason.message}`);
    }
  },

  async deleteRemoved() {
    const paths = this.items.filter(x => x.status === 'deleted' && x.url).map(x => x.url);
    await StorageManager.remove(paths);
    this.items = this.items.filter(x => x.status !== 'deleted');
  },

  toDBRows(packageId) {
    return this.items
      .filter(x => x.status !== 'deleted')
      .map((item, i) => ({
        package_id:    packageId,
        image_url:     item.url ?? '',
        alt_ar:        item.alt_ar,
        alt_en:        item.alt_en,
        is_hero:       item.is_hero,
        display_order: i,
      }));
  },

  heroUrl() {
    const hero = this.items.find(x => x.is_hero && x.status !== 'deleted');
    return hero?.url ?? null;
  },

  render() {
    const zone = document.getElementById('imageDropZone');
    const grid = document.getElementById('imageGrid');
    if (!grid) return;

    const visible = this.items.filter(x => x.status !== 'deleted');

    grid.innerHTML = visible.map(item => `
      <div class="image-card ${item.is_hero ? 'is-hero' : ''}" data-lid="${item._lid}">
        <div class="image-card__thumb-wrap">
          <img class="image-card__thumb" src="${escHtml(item.preview)}" alt="" loading="lazy">
          ${item.is_hero ? '<span class="image-card__hero-badge">HERO</span>' : ''}
          ${item.status === 'new' ? '<span class="image-card__new-badge">NEW</span>' : ''}
          <button class="image-card__delete" data-action="remove-img" data-lid="${item._lid}" aria-label="Remove image" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="image-card__body">
          <label class="image-card__hero-toggle">
            <input type="radio" name="heroImg" data-field="is_hero" ${item.is_hero ? 'checked' : ''} data-lid="${item._lid}">
            Set as hero image
          </label>
          <input class="image-card__alt-input" type="text" placeholder="Alt text (AR)" dir="rtl"
                 data-field="alt_ar" value="${escHtml(item.alt_ar)}" style="font-family:var(--font-arabic)">
          <input class="image-card__alt-input" type="text" placeholder="Alt text (EN)" dir="ltr"
                 data-field="alt_en" value="${escHtml(item.alt_en)}">
        </div>
      </div>`).join('');

    grid.querySelectorAll('[data-action="remove-img"]').forEach(btn => {
      btn.addEventListener('click', () => { this.remove(btn.dataset.lid); this.render(); });
    });
    grid.querySelectorAll('[data-field="is_hero"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.collectFromDOM();
        this.setHero(radio.dataset.lid);
        this.render();
      });
    });
  },
};

/* ============================================================
   9. ITINERARY BUILDER
   ============================================================ */
const ItineraryBuilder = {
  days: [],

  reset() { this.days = []; },

  loadFromDB(itinerary) {
    this.days = (itinerary ?? [])
      .sort((a, b) => a.day_number - b.day_number)
      .map(d => ({
        _lid: `day_${d.id ?? Date.now() + Math.random()}`,
        day_number:     d.day_number,
        title_ar:       d.title_ar ?? '',
        title_en:       d.title_en ?? '',
        description_ar: d.description_ar ?? '',
        description_en: d.description_en ?? '',
        location_ar:    d.location_ar ?? '',
        location_en:    d.location_en ?? '',
        meals_included: d.meals_included ?? [],
        image_url:      d.image_url ?? '',
      }));
  },

  addDay() {
    this.collectFromDOM();
    this.days.push({
      _lid: `day_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      day_number:     this.days.length + 1,
      title_ar: '', title_en: '',
      description_ar: '', description_en: '',
      location_ar: '', location_en: '',
      meals_included: [], image_url: '',
    });
    this.render();
    // Open the new day
    const items = document.querySelectorAll('.itin-day');
    if (items.length) this._toggleItem(items[items.length - 1]);
  },

  removeDay(lid) {
    this.collectFromDOM();
    this.days = this.days.filter(d => d._lid !== lid);
    this.days.forEach((d, i) => { d.day_number = i + 1; });
    this.render();
  },

  collectFromDOM() {
    this.days.forEach(day => {
      const el = document.querySelector(`.itin-day[data-lid="${day._lid}"]`);
      if (!el) return;
      day.title_ar       = el.querySelector('[data-f="title_ar"]')?.value ?? '';
      day.title_en       = el.querySelector('[data-f="title_en"]')?.value ?? '';
      day.description_ar = el.querySelector('[data-f="description_ar"]')?.value ?? '';
      day.description_en = el.querySelector('[data-f="description_en"]')?.value ?? '';
      day.location_ar    = el.querySelector('[data-f="location_ar"]')?.value ?? '';
      day.location_en    = el.querySelector('[data-f="location_en"]')?.value ?? '';
      day.image_url      = el.querySelector('[data-f="image_url"]')?.value ?? '';
      day.meals_included = Array.from(el.querySelectorAll('[data-f="meal"]:checked')).map(c => c.value);
    });
  },

  render() {
    const container = document.getElementById('itineraryContainer');
    if (!container) return;
    container.innerHTML = this.days.map(day => this._dayHTML(day)).join('');
    this._bindEvents();
  },

  _dayHTML(day) {
    const mealsHTML = Object.entries(MEAL_LABELS).map(([val, label]) => `
      <label class="meal-opt">
        <input type="checkbox" data-f="meal" value="${val}" ${(day.meals_included ?? []).includes(val) ? 'checked' : ''}>
        ${label}
      </label>`).join('');

    return `
      <div class="itin-day" data-lid="${day._lid}">
        <button class="itin-day__header" type="button" aria-expanded="false">
          <div class="itin-day__badge">${day.day_number}</div>
          <div class="itin-day__title-wrap">
            <div class="itin-day__title">${escHtml(day.title_en || 'Day ' + day.day_number)}</div>
            <div class="itin-day__subtitle" dir="rtl" style="font-family:var(--font-arabic)">${escHtml(day.title_ar || 'اليوم ' + day.day_number)}</div>
          </div>
          <svg class="itin-day__chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          <button class="itin-day__remove" type="button" data-action="remove-day" data-lid="${day._lid}" aria-label="Remove day ${day.day_number}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </button>
        <div class="itin-day__body">
          <div class="itin-day__body-inner">
            <div class="itin-day__fields">
              <div class="field-row">
                <div class="form-group">
                  <label class="form-label"><span class="lang-chip lang-chip--en">EN</span> Day Title</label>
                  <input class="form-input" type="text" data-f="title_en" value="${escHtml(day.title_en)}" placeholder="e.g. Arrival & Welcome in Bali">
                </div>
                <div class="form-group">
                  <label class="form-label"><span class="lang-chip lang-chip--ar">AR</span> عنوان اليوم</label>
                  <input class="form-input" type="text" data-f="title_ar" dir="rtl" value="${escHtml(day.title_ar)}" placeholder="مثال: الوصول والاستقبال في بالي" style="font-family:var(--font-arabic)">
                </div>
              </div>
              <div class="field-row">
                <div class="form-group">
                  <label class="form-label"><span class="lang-chip lang-chip--en">EN</span> Description</label>
                  <textarea class="form-textarea" data-f="description_en" placeholder="Full day narrative in English…" rows="4">${escHtml(day.description_en)}</textarea>
                </div>
                <div class="form-group">
                  <label class="form-label"><span class="lang-chip lang-chip--ar">AR</span> الوصف</label>
                  <textarea class="form-textarea" data-f="description_ar" dir="rtl" placeholder="وصف اليوم بالتفصيل…" rows="4" style="font-family:var(--font-arabic)">${escHtml(day.description_ar)}</textarea>
                </div>
              </div>
              <div class="field-row">
                <div class="form-group">
                  <label class="form-label"><span class="lang-chip lang-chip--en">EN</span> Location / Area</label>
                  <input class="form-input" type="text" data-f="location_en" value="${escHtml(day.location_en)}" placeholder="e.g. Nusa Dua">
                </div>
                <div class="form-group">
                  <label class="form-label"><span class="lang-chip lang-chip--ar">AR</span> المنطقة</label>
                  <input class="form-input" type="text" data-f="location_ar" dir="rtl" value="${escHtml(day.location_ar)}" placeholder="مثال: نوسا دوا" style="font-family:var(--font-arabic)">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Meals Included</label>
                <div class="meals-selector">${mealsHTML}</div>
              </div>
              <div class="form-group">
                <label class="form-label form-label--optional">Day Image URL (Storage path)</label>
                <input class="form-input" type="text" data-f="image_url" value="${escHtml(day.image_url)}" placeholder="packages/slug/day-1.webp">
                <p class="form-note">Optional image for this specific day (leave blank to skip).</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  _toggleItem(el) {
    const isOpen = el.classList.contains('is-open');
    el.classList.toggle('is-open', !isOpen);
    el.querySelector('.itin-day__header').setAttribute('aria-expanded', String(!isOpen));
  },

  _bindEvents() {
    document.querySelectorAll('.itin-day__header').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="remove-day"]')) return;
        this._toggleItem(btn.closest('.itin-day'));
      });
    });
    document.querySelectorAll('[data-action="remove-day"]').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); this.removeDay(btn.dataset.lid); });
    });
    // Live update day header titles
    document.querySelectorAll('.itin-day').forEach(el => {
      const enInput = el.querySelector('[data-f="title_en"]');
      const arInput = el.querySelector('[data-f="title_ar"]');
      const titleEN = el.querySelector('.itin-day__title');
      const titleAR = el.querySelector('.itin-day__subtitle');
      if (enInput && titleEN) enInput.addEventListener('input', () => { titleEN.textContent = enInput.value || titleEN.textContent; });
      if (arInput && titleAR) arInput.addEventListener('input', () => { titleAR.textContent = arInput.value || titleAR.textContent; });
    });
  },

  toDBRows(packageId) {
    this.collectFromDOM();
    return this.days.map(d => ({
      package_id:     packageId,
      day_number:     d.day_number,
      title_ar:       d.title_ar,
      title_en:       d.title_en,
      description_ar: d.description_ar,
      description_en: d.description_en,
      location_ar:    d.location_ar,
      location_en:    d.location_en,
      meals_included: d.meals_included,
      image_url:      d.image_url || null,
    }));
  },
};

/* ============================================================
   10. INCLUSIONS BUILDER
   ============================================================ */
const InclusionsBuilder = {
  included: [],
  excluded: [],

  reset() { this.included = []; this.excluded = []; },

  loadFromDB(inclusions) {
    this.included = [];
    this.excluded = [];
    (inclusions ?? []).sort((a, b) => a.display_order - b.display_order).forEach(item => {
      const obj = { _lid: `incl_${item.id ?? Date.now()}`, icon: item.icon ?? 'custom', text_ar: item.text_ar ?? '', text_en: item.text_en ?? '' };
      if (item.type === 'included') this.included.push(obj);
      else this.excluded.push(obj);
    });
  },

  addItem(type) {
    this.collectFromDOM();
    const lid = `incl_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const obj = { _lid: lid, icon: 'custom', text_ar: '', text_en: '' };
    if (type === 'included') this.included.push(obj);
    else this.excluded.push(obj);
    this.render();
    // Focus first input of new row
    setTimeout(() => {
      const rows = document.querySelectorAll(`#${type === 'included' ? 'includedList' : 'excludedList'} .incl-item`);
      rows[rows.length - 1]?.querySelector('.incl-item__input')?.focus();
    }, 50);
  },

  removeItem(type, lid) {
    this.collectFromDOM();
    if (type === 'included') this.included = this.included.filter(x => x._lid !== lid);
    else this.excluded = this.excluded.filter(x => x._lid !== lid);
    this.render();
  },

  collectFromDOM() {
    ['included', 'excluded'].forEach(type => {
      const listEl = document.getElementById(type === 'included' ? 'includedList' : 'excludedList');
      if (!listEl) return;
      const arr = type === 'included' ? this.included : this.excluded;
      arr.forEach(item => {
        const el = listEl.querySelector(`[data-lid="${item._lid}"]`);
        if (!el) return;
        item.icon    = el.querySelector('[data-f="icon"]')?.value ?? 'custom';
        item.text_ar = el.querySelector('[data-f="text_ar"]')?.value ?? '';
        item.text_en = el.querySelector('[data-f="text_en"]')?.value ?? '';
      });
    });
  },

  _itemHTML(type, item) {
    const iconOptions = INCLUSION_ICONS.map(([v, l]) =>
      `<option value="${v}" ${item.icon === v ? 'selected' : ''}>${l}</option>`).join('');
    return `
      <div class="incl-item" data-lid="${item._lid}">
        <select class="incl-icon-select" data-f="icon">${iconOptions}</select>
        <div class="incl-item__inputs">
          <input class="incl-item__input" type="text" data-f="text_en" value="${escHtml(item.text_en)}" placeholder="Description (EN)">
          <input class="incl-item__input" type="text" data-f="text_ar" dir="rtl" value="${escHtml(item.text_ar)}" placeholder="الوصف (AR)" style="font-family:var(--font-arabic)">
        </div>
        <button class="incl-item__remove" type="button" data-action="remove-incl" data-type="${type}" data-lid="${item._lid}" aria-label="Remove">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
  },

  render() {
    const inc = document.getElementById('includedList');
    const exc = document.getElementById('excludedList');
    if (inc) inc.innerHTML = this.included.map(i => this._itemHTML('included', i)).join('') || '<p style="font-size:var(--text-xs);color:var(--text-light);padding:var(--sp-2) 0">No included items yet.</p>';
    if (exc) exc.innerHTML = this.excluded.map(i => this._itemHTML('excluded', i)).join('') || '<p style="font-size:var(--text-xs);color:var(--text-light);padding:var(--sp-2) 0">No excluded items yet.</p>';
    document.querySelectorAll('[data-action="remove-incl"]').forEach(btn => {
      btn.addEventListener('click', () => this.removeItem(btn.dataset.type, btn.dataset.lid));
    });
  },

  toDBRows(packageId) {
    this.collectFromDOM();
    const rows = [];
    this.included.forEach((item, i) => rows.push({ package_id: packageId, type: 'included', icon: item.icon, text_ar: item.text_ar, text_en: item.text_en, display_order: i }));
    this.excluded.forEach((item, i) => rows.push({ package_id: packageId, type: 'excluded', icon: item.icon, text_ar: item.text_ar, text_en: item.text_en, display_order: i }));
    return rows;
  },
};

/* ============================================================
   11. PACKAGE LIST
   ============================================================ */
const PackageList = {
  all: [],
  destinations: [],
  filtered: [],

  async load() {
    try {
      [this.all, this.destinations] = await Promise.all([
        DB.getPackages(),
        DB.getDestinations(),
      ]);
      this.filtered = [...this.all];
      this.renderStats();
      this.renderDestinationFilter();
      this.renderList();
    } catch (err) {
      document.getElementById('packagesList').innerHTML = `
        <div class="load-error">
          <div class="load-error__title">Failed to load packages</div>
          <div class="load-error__body">${escHtml(err.message)}</div>
        </div>`;
      if (err.message.includes('configured')) {
        document.getElementById('statsRow').innerHTML = '<p style="color:var(--warning);font-size:var(--text-sm);font-weight:600">⚠️ Supabase not configured — add credentials to Config in dashboard.js</p>';
      }
    }
  },

  renderStats() {
    const total    = this.all.length;
    const active   = this.all.filter(p => p.is_active).length;
    const featured = this.all.filter(p => p.is_featured).length;
    document.getElementById('statsRow').innerHTML = `
      <div class="stat-card stat-card--navy">
        <div class="stat-card__label">Total Packages</div>
        <div class="stat-card__value">${total}</div>
      </div>
      <div class="stat-card stat-card--success">
        <div class="stat-card__label">Active</div>
        <div class="stat-card__value">${active}</div>
        <div class="stat-card__sub">${total - active} inactive</div>
      </div>
      <div class="stat-card stat-card--accent">
        <div class="stat-card__label">Featured</div>
        <div class="stat-card__value">${featured}</div>
        <div class="stat-card__sub">Shown on homepage</div>
      </div>`;
  },

  renderDestinationFilter() {
    const sel = document.getElementById('filterDestination');
    // Reset to the default "All Destinations" option before (re-)populating
    // to prevent duplicate entries on subsequent PackageList.load() calls.
    sel.length = 1;
    this.destinations.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `${d.name_en} / ${d.name_ar}`;
      sel.appendChild(opt);
    });
  },

  applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase().trim();
    const cat    = document.getElementById('filterCategory').value;
    const dest   = document.getElementById('filterDestination').value;
    const status = document.getElementById('filterStatus').value;

    this.filtered = this.all.filter(p => {
      if (search && !(
        p.title_en?.toLowerCase().includes(search) ||
        p.title_ar?.includes(search) ||
        p.slug_en?.toLowerCase().includes(search)
      )) return false;
      if (cat && p.category !== cat) return false;
      if (dest && !p.package_destinations?.some(pd => pd.destination_id === dest)) return false;
      if (status === 'active'   && !p.is_active)   return false;
      if (status === 'inactive' &&  p.is_active)   return false;
      if (status === 'featured' && !p.is_featured) return false;
      return true;
    });
    this.renderList();
  },

  renderList() {
    const el = document.getElementById('packagesList');
    if (!this.filtered.length) {
      el.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📦</div>
          <div class="empty-state__title">${this.all.length ? 'No packages match your filters' : 'No packages yet'}</div>
          <div class="empty-state__body">${this.all.length ? 'Try adjusting your search or filters.' : 'Create your first package to get started.'}</div>
        </div>`;
      return;
    }

    el.innerHTML = this.filtered.map(pkg => {
      const dest    = getPrimaryDest(pkg);
      const destEN  = dest?.name_en ?? '—';
      const imgSrc  = pkg.hero_image_url ? StorageManager.publicUrl(pkg.hero_image_url) : Config.PLACEHOLDER_IMG;
      const nights  = pkg.duration_nights ?? 0;
      const days    = pkg.duration_days   ?? 1;
      const price   = fmtPrice(pkg.price_value, pkg.currency);
      const pLabel  = PRICE_TYPE_LABELS[pkg.price_type] ?? '';

      return `
        <div class="pkg-row" role="listitem" data-id="${pkg.id}">
          <img class="pkg-row__thumb" src="${escHtml(imgSrc)}" alt="${escHtml(pkg.title_en)}" loading="lazy">
          <div class="pkg-row__thumb-placeholder" style="display:none" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>

          <div class="pkg-row__info">
            <div class="pkg-row__title">${escHtml(pkg.title_en)}</div>
            <div class="pkg-row__title-ar">${escHtml(pkg.title_ar)}</div>
            <div class="pkg-row__meta">
              <span class="badge badge--${pkg.category}">${CATEGORY_LABELS[pkg.category] ?? pkg.category}</span>
              <span class="pkg-row__meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${escHtml(destEN)}
              </span>
              <span class="pkg-row__meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${nights}N / ${days}D
              </span>
              ${pkg.inquiry_count ? `<span class="pkg-row__meta-item" title="Inquiries"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>${pkg.inquiry_count}</span>` : ''}
            </div>
          </div>

          <div class="pkg-row__price">
            <span class="pkg-row__price-label">${escHtml(pLabel)}</span>
            ${escHtml(price)}
          </div>

          <div class="pkg-row__status">
            <span class="badge badge--${pkg.is_active ? 'active' : 'inactive'}">${pkg.is_active ? 'Active' : 'Inactive'}</span>
            ${pkg.is_featured ? '<span class="badge badge--featured">Featured</span>' : ''}
          </div>

          <div class="pkg-row__actions">
            <button class="btn btn--icon" data-action="edit" data-id="${pkg.id}"
                    aria-label="Edit ${escHtml(pkg.title_en)}" title="Edit" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn--icon btn--danger-ghost" data-action="delete" data-id="${pkg.id}"
                    data-title="${escHtml(pkg.title_en)}"
                    aria-label="Delete ${escHtml(pkg.title_en)}" title="Delete" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => PackageForm.open('edit', btn.dataset.id));
    });
    el.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => PackageList.deletePackage(btn.dataset.id, btn.dataset.title));
    });
    el.querySelectorAll('.pkg-row__thumb').forEach(img => {
      img.addEventListener('error', function() {
        this.style.display = 'none';
        if (this.nextElementSibling) this.nextElementSibling.style.display = 'flex';
      }, { once: true });
    });
  },

  async deletePackage(id, title) {
    const confirmed = await Modal.confirm(
      'Delete Package',
      `Are you sure you want to delete "${title}"? This removes all associated images, itinerary, and inclusions. This action cannot be undone.`,
      'Delete Package'
    );
    if (!confirmed) return;

    try {
      // Fetch ALL image paths before deletion so we can clean up Storage
      const imageRecords = await DB.getPackageImages(id).catch(() => []);
      const storagePaths = (imageRecords ?? [])
        .map(img => img.image_url)
        .filter(Boolean);

      // Delete the package (DB cascades remove child table rows)
      await DB.deletePackage(id);

      // Clean up all Storage files (best-effort — don't block on storage errors)
      if (storagePaths.length) {
        StorageManager.remove(storagePaths).catch(err =>
          console.warn('[Delete] Storage cleanup warning:', err.message)
        );
      }

      Toast.success('Package deleted', `"${title}" has been permanently removed.`);
      await this.load();
    } catch (err) {
      Toast.error('Delete failed', err.message);
    }
  },

  bindControls() {
    // Debounce search to avoid filtering on every keystroke / IME composition
    document.getElementById('searchInput').addEventListener('input', debounce(() => this.applyFilters(), 250));
    document.getElementById('filterCategory').addEventListener('change', () => this.applyFilters());
    document.getElementById('filterDestination').addEventListener('change', () => this.applyFilters());
    document.getElementById('filterStatus').addEventListener('change', () => this.applyFilters());
  },
};

/* ============================================================
   12. PACKAGE FORM
   ============================================================ */
const PackageForm = {
  mode:        null,
  packageId:   null,
  pkg:         null,
  destinations: [],
  _dirty:      false,
  _activeTab:  'basic',

  async open(mode, packageId = null) {
    this.mode      = mode;
    this.packageId = packageId;
    this.pkg       = null;
    this._dirty    = false;
    this._activeTab = 'basic';

    // Reset sub-builders
    ImageManager.reset();
    ItineraryBuilder.reset();
    InclusionsBuilder.reset();

    // Load destinations
    this.destinations = PackageList.destinations.length
      ? PackageList.destinations
      : await DB.getDestinations().catch(() => []);

    App.showView('form');
    document.getElementById('topbarTitle').textContent = mode === 'create' ? 'New Package' : 'Edit Package';
    document.getElementById('topbarActions').innerHTML = '';

    // Render empty shell first for instant feedback
    this.render();

    if (mode === 'edit' && packageId) {
      try {
        this.pkg = await DB.getPackage(packageId);
        ImageManager.loadFromDB(this.pkg.package_images);
        ItineraryBuilder.loadFromDB(this.pkg.package_itinerary);
        InclusionsBuilder.loadFromDB(this.pkg.package_inclusions);
        this.render();          // re-render with populated data
        this.populateForm();
      } catch (err) {
        Toast.error('Load failed', err.message);
      }
    }
    // Create mode: already rendered above as empty shell — no second render needed
  },

  render() {
    const pkg = this.pkg;
    const isEdit = this.mode === 'edit';
    const dest = document.getElementById('packageFormContainer');
    if (!dest) return;

    dest.innerHTML = `
      <div class="form-shell">

        <!-- Header -->
        <div class="form-header">
          <div class="form-header__left">
            <div class="form-header__title">${isEdit ? 'Edit Package' : 'Create New Package'}</div>
            <div class="form-header__subtitle">${isEdit ? 'slug: ' + escHtml(pkg?.slug_en ?? '—') : 'Fill in all required fields before saving'}</div>
          </div>
          <div class="form-header__actions">
            <button class="btn btn--ghost" id="formCancelBtn" type="button">Cancel</button>
            <button class="btn btn--primary" id="formSaveBtn" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              ${isEdit ? 'Save Changes' : 'Create Package'}
            </button>
          </div>
        </div>

        <!-- Tabs nav -->
        <div class="form-tabs-nav" role="tablist" aria-label="Form sections">
          ${[['basic','Basic Info'],['content','Descriptions'],['media','Media'],
             ['itinerary','Itinerary'],['includes','Inclusions'],['pricing','Pricing'],['seo','SEO']
            ].map(([id, label]) => `
            <button class="form-tab-btn ${this._activeTab === id ? 'is-active' : ''}"
                    role="tab" id="tab-${id}" data-tab="${id}"
                    aria-selected="${this._activeTab === id}"
                    aria-controls="panel-${id}"
                    tabindex="${this._activeTab === id ? '0' : '-1'}"
                    type="button">
              ${label}
            </button>`).join('')}
        </div>

        <!-- Tab panels -->
        <div class="form-body" id="formPanels">
          ${this._renderPanelBasic()}
          ${this._renderPanelContent()}
          ${this._renderPanelMedia()}
          ${this._renderPanelItinerary()}
          ${this._renderPanelInclusions()}
          ${this._renderPanelPricing()}
          ${this._renderPanelSEO()}
        </div>

      </div>`;

    this._bindFormEvents();
    this._switchTab(this._activeTab);
    if (this.pkg) {
      ImageManager.render();
      ItineraryBuilder.render();
      InclusionsBuilder.render();
    }
  },

  _renderPanelBasic() {
    const pkg  = this.pkg;
    const dests = this.destinations;

    const destRows = dests.map(d => {
      const isPrimary  = pkg?.package_destinations?.find(pd => pd.destination_id === d.id && pd.is_primary);
      const isSelected = pkg?.package_destinations?.some(pd => pd.destination_id === d.id);
      return `
        <div class="dest-selector__item">
          <input type="checkbox" class="dest-selector__check" name="dest_check" id="dc_${d.id}" value="${d.id}" ${isSelected ? 'checked' : ''}>
          <div class="dest-selector__name">
            <label for="dc_${d.id}">${escHtml(d.name_en)}</label>
            <span class="dest-selector__name-ar">${escHtml(d.name_ar)}</span>
          </div>
          <div class="dest-selector__primary">
            <input type="radio" name="dest_primary" id="dp_${d.id}" value="${d.id}" ${isPrimary ? 'checked' : ''}>
            <label class="dest-selector__primary-label" for="dp_${d.id}">Primary</label>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="form-tab-panel" id="panel-basic" role="tabpanel" aria-labelledby="tab-basic" data-panel="basic">
        <div class="form-section-title">Basic Information</div>

        <div class="form-bilingual">
          <div class="form-group">
            <label class="form-label"><span class="lang-chip lang-chip--en">EN</span> Package Title <span style="color:var(--error)">*</span></label>
            <input class="form-input" type="text" id="titleEn" value="${escHtml(pkg?.title_en ?? '')}"
                   placeholder="e.g. Golden Honeymoon Package — Bali" maxlength="120" required>
            <p class="form-note">Used in page title, breadcrumbs, and English WhatsApp message.</p>
          </div>
          <div class="form-group">
            <label class="form-label form-label--ar"><span class="lang-chip lang-chip--ar">AR</span> عنوان الباقة <span style="color:var(--error)">*</span></label>
            <input class="form-input" type="text" id="titleAr" dir="rtl" value="${escHtml(pkg?.title_ar ?? '')}"
                   placeholder="مثال: باقة شهر العسل الذهبي — بالي" maxlength="120" required style="font-family:var(--font-arabic)">
            <p class="form-note">Used in Arabic page title and Arabic WhatsApp message.</p>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Category <span style="color:var(--error)">*</span></label>
            <select class="form-select" id="category" required>
              <option value="">— Select category —</option>
              ${Object.entries(CATEGORY_LABELS).map(([v, l]) => `<option value="${v}" ${pkg?.category === v ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Duration <span style="color:var(--error)">*</span></label>
            <div class="field-row">
              <div class="form-group">
                <input class="form-input" type="number" id="durationNights" min="0" max="365"
                       value="${pkg?.duration_nights ?? ''}" placeholder="Nights" required>
                <p class="form-note">Nights</p>
              </div>
              <div class="form-group">
                <input class="form-input" type="number" id="durationDays" min="1" max="366"
                       value="${pkg?.duration_days ?? ''}" placeholder="Days" required>
                <p class="form-note">Days</p>
              </div>
            </div>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Min Persons</label>
            <input class="form-input" type="number" id="minPersons" min="1" max="100" value="${pkg?.min_persons ?? 1}">
          </div>
          <div class="form-group">
            <label class="form-label form-label--optional">Max Persons</label>
            <input class="form-input" type="number" id="maxPersons" min="1" max="100" value="${pkg?.max_persons ?? ''}">
          </div>
        </div>

        <div class="form-section-title" style="margin-top:var(--sp-4)">Destinations <span style="color:var(--error)">*</span></div>
        <div class="dest-selector" id="destSelector">
          ${destRows || '<p style="padding:var(--sp-4);color:var(--text-light)">Loading destinations…</p>'}
        </div>
        <p class="form-note">Select one or more destinations and mark one as Primary (shown in package header and WhatsApp message).</p>

        <div class="form-section-title" style="margin-top:var(--sp-4)">Package Settings</div>
        <div class="field-row">
          <div class="toggle-group">
            <label class="toggle-label" for="isActive">Active</label>
            <label class="toggle-switch">
              <input type="checkbox" id="isActive" ${(pkg?.is_active ?? true) ? 'checked' : ''}>
              <span class="toggle-switch__track"></span>
            </label>
            <span style="font-size:var(--text-xs);color:var(--text-muted)">Visible on public site</span>
          </div>
          <div class="toggle-group">
            <label class="toggle-label" for="isFeatured">Featured</label>
            <label class="toggle-switch">
              <input type="checkbox" id="isFeatured" ${pkg?.is_featured ? 'checked' : ''}>
              <span class="toggle-switch__track"></span>
            </label>
            <span style="font-size:var(--text-xs);color:var(--text-muted)">Shown on homepage</span>
          </div>
        </div>

        <div class="form-group" style="margin-top:var(--sp-4)">
          <label class="form-label form-label--optional">Display Order</label>
          <input class="form-input" type="number" id="displayOrder" min="0" value="${pkg?.display_order ?? 0}" style="max-width:120px">
          <p class="form-note">Lower numbers appear first. Default 0.</p>
        </div>

        <div class="form-section-title" style="margin-top:var(--sp-4)">URL Slugs</div>
        <div class="field-row">
          <div class="form-group">
            <label class="form-label">English Slug <span style="color:var(--error)">*</span></label>
            <input class="form-input" type="text" id="slugEn" value="${escHtml(pkg?.slug_en ?? '')}"
                   placeholder="bali-honeymoon-7d" pattern="[a-z0-9-]+">
            <p class="form-note">Auto-generated from English title. Lowercase, hyphens only. Used in page URL.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Arabic Slug</label>
            <input class="form-input" type="text" id="slugAr" value="${escHtml(pkg?.slug_ar ?? '')}"
                   placeholder="bali-honeymoon-7d-ar">
            <p class="form-note">Auto-generated. Must be unique. Shown for reference only.</p>
          </div>
        </div>
      </div>`;
  },

  _renderPanelContent() {
    const pkg = this.pkg;
    return `
      <div class="form-tab-panel" id="panel-content" role="tabpanel" aria-labelledby="tab-content" data-panel="content">
        <div class="form-section-title">Short Descriptions <span style="font-size:var(--text-xs);font-weight:400;color:var(--text-light)">(100–150 chars — shown on package cards)</span></div>
        <div class="form-bilingual">
          <div class="form-group">
            <label class="form-label"><span class="lang-chip lang-chip--en">EN</span> Short Description</label>
            <textarea class="form-textarea" id="shortDescEn" rows="3" maxlength="300"
                      placeholder="Brief teaser shown on package cards and search results…">${escHtml(pkg?.short_description_en ?? '')}</textarea>
            <div class="form-char-count" id="shortDescEnCount">0 / 300</div>
          </div>
          <div class="form-group">
            <label class="form-label form-label--ar"><span class="lang-chip lang-chip--ar">AR</span> وصف مختصر</label>
            <textarea class="form-textarea" id="shortDescAr" dir="rtl" rows="3" maxlength="300"
                      placeholder="وصف مختصر يظهر على بطاقات الباقات…" style="font-family:var(--font-arabic)">${escHtml(pkg?.short_description_ar ?? '')}</textarea>
            <div class="form-char-count" id="shortDescArCount">0 / 300</div>
          </div>
        </div>

        <div class="form-section-title">Full Descriptions <span style="font-size:var(--text-xs);font-weight:400;color:var(--text-light)">(shown on package detail page)</span></div>
        <div class="form-bilingual">
          <div class="form-group">
            <label class="form-label"><span class="lang-chip lang-chip--en">EN</span> Full Description</label>
            <textarea class="form-textarea form-textarea--tall" id="fullDescEn" rows="8"
                      placeholder="Full package description in English. Describe the experience, highlights, unique selling points…">${escHtml(pkg?.full_description_en ?? '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label form-label--ar"><span class="lang-chip lang-chip--ar">AR</span> وصف تفصيلي</label>
            <textarea class="form-textarea form-textarea--tall" id="fullDescAr" dir="rtl" rows="8"
                      placeholder="الوصف الكامل للباقة بالعربية. اذكر التجربة والمميزات وأبرز ما تقدمه الباقة…" style="font-family:var(--font-arabic)">${escHtml(pkg?.full_description_ar ?? '')}</textarea>
          </div>
        </div>
      </div>`;
  },

  _renderPanelMedia() {
    return `
      <div class="form-tab-panel" id="panel-media" role="tabpanel" aria-labelledby="tab-media" data-panel="media">
        <div class="form-section-title">Package Images</div>
        <p class="form-note" style="margin-bottom:var(--sp-4)">
          Upload up to 10 images. The first image (or one you mark as hero) becomes the main card and page header image.
          WebP or JPEG, max 10 MB each. Recommended: 1200×800px for gallery, 1200×800px for hero.
        </p>

        <div class="image-drop-zone" id="imageDropZone" role="button" tabindex="0" aria-label="Upload images">
          <div class="image-drop-zone__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div class="image-drop-zone__title">Drop images here</div>
          <div class="image-drop-zone__sub">or <span class="image-drop-zone__link">click to browse</span></div>
          <div class="image-drop-zone__spec">JPEG, WebP, PNG · Max 10 MB per file</div>
          <input type="file" id="imageFileInput" class="image-file-input" accept="image/jpeg,image/webp,image/png" multiple>
        </div>

        <div class="image-grid" id="imageGrid"></div>
      </div>`;
  },

  _renderPanelItinerary() {
    return `
      <div class="form-tab-panel" id="panel-itinerary" role="tabpanel" aria-labelledby="tab-itinerary" data-panel="itinerary">
        <div class="form-section-title">Day-by-Day Itinerary</div>
        <p class="form-note" style="margin-bottom:var(--sp-5)">
          Build the day-by-day program. Each day collapses into an accordion on the package detail page.
          The first day is expanded by default.
        </p>
        <div class="itin-builder">
          <div id="itineraryContainer"></div>
          <button class="btn btn--ghost itin-add-btn" id="addDayBtn" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Day
          </button>
        </div>
      </div>`;
  },

  _renderPanelInclusions() {
    return `
      <div class="form-tab-panel" id="panel-includes" role="tabpanel" aria-labelledby="tab-includes" data-panel="includes">
        <div class="form-section-title">What's Included & Excluded</div>
        <p class="form-note" style="margin-bottom:var(--sp-5)">
          Add items to both columns. These appear as a checklist on the package detail page.
        </p>
        <div class="incl-builder">
          <div class="incl-col">
            <div class="incl-col__header">
              <div class="incl-col__title incl-col__title--in">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Included
              </div>
              <button class="btn btn--sm btn--ghost" id="addIncludedBtn" type="button">+ Add</button>
            </div>
            <div class="incl-list" id="includedList"></div>
          </div>
          <div class="incl-col">
            <div class="incl-col__header">
              <div class="incl-col__title incl-col__title--ex">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Excluded
              </div>
              <button class="btn btn--sm btn--ghost" id="addExcludedBtn" type="button">+ Add</button>
            </div>
            <div class="incl-list" id="excludedList"></div>
          </div>
        </div>
      </div>`;
  },

  _renderPanelPricing() {
    const pkg = this.pkg;
    return `
      <div class="form-tab-panel" id="panel-pricing" role="tabpanel" aria-labelledby="tab-pricing" data-panel="pricing">
        <div class="form-section-title">Pricing</div>

        <div class="field-row field-row--3">
          <div class="form-group">
            <label class="form-label">Price Type <span style="color:var(--error)">*</span></label>
            <select class="form-select" id="priceType" required>
              ${Object.entries(PRICE_TYPE_LABELS).map(([v, l]) => `<option value="${v}" ${pkg?.price_type === v ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
            <p class="form-note">Shown as prefix before the price (e.g. "Starting From").</p>
          </div>
          <div class="form-group">
            <label class="form-label">Price Value <span style="color:var(--error)">*</span></label>
            <input class="form-input" type="number" id="priceValue" min="0" step="0.01"
                   value="${pkg?.price_value ?? ''}" placeholder="3500" required>
            <p class="form-note">The displayed sale price.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Currency <span style="color:var(--error)">*</span></label>
            <select class="form-select" id="currency" required>
              ${Object.entries(CURRENCY_LABELS).map(([v, l]) => `<option value="${v}" ${(pkg?.currency ?? 'SAR') === v ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group" style="max-width:280px">
          <label class="form-label form-label--optional">Original Price (crossed-out "was" price)</label>
          <input class="form-input" type="number" id="originalPriceValue" min="0" step="0.01"
                 value="${pkg?.original_price_value ?? ''}" placeholder="Leave blank if no discount">
          <p class="form-note">Must be greater than the sale price. Leave blank if not discounted.</p>
        </div>

        <hr style="margin:var(--sp-6) 0">
        <div class="form-section-title">WhatsApp Message Preview</div>
        <p class="form-note" style="margin-bottom:var(--sp-4)">
          Preview of the pre-filled WhatsApp message sent when a customer taps any booking button.
          Updates automatically as you edit the package title and destinations.
        </p>
        <div class="wa-preview">
          <div class="wa-preview__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Live WhatsApp Message Preview
          </div>
          <div class="wa-preview__message">
            <div>
              <div class="wa-preview__lang">Arabic message sent when customer taps "Book via WhatsApp":</div>
              <div class="wa-preview__ar" id="waPreviewAr">${escHtml(this._buildWAMsg('ar'))}</div>
            </div>
            <hr style="border-color:var(--border)">
            <div>
              <div class="wa-preview__lang">English message (EN toggle):</div>
              <div id="waPreviewEn">${escHtml(this._buildWAMsg('en'))}</div>
            </div>
          </div>
        </div>
      </div>`;
  },

  _renderPanelSEO() {
    const pkg = this.pkg;
    const kwArr = pkg?.seo_keywords ?? [];

    return `
      <div class="form-tab-panel" id="panel-seo" role="tabpanel" aria-labelledby="tab-seo" data-panel="seo">
        <div class="form-section-title">SEO Metadata</div>
        <p class="form-note" style="margin-bottom:var(--sp-5)">
          These fields are injected into the page &lt;head&gt; and override the default title/description on the package detail page.
          Leave blank to auto-generate from package title/description.
        </p>

        <div class="form-bilingual">
          <div class="form-group">
            <label class="form-label form-label--optional"><span class="lang-chip lang-chip--en">EN</span> SEO Title</label>
            <input class="form-input" type="text" id="seoTitleEn" value="${escHtml(pkg?.seo_title_en ?? '')}"
                   placeholder="Golden Honeymoon Package Bali 7 Nights | Luxpath Travel" maxlength="70">
            <div class="form-char-count" id="seoTitleEnCount">0 / 70</div>
          </div>
          <div class="form-group">
            <label class="form-label form-label--optional form-label--ar"><span class="lang-chip lang-chip--ar">AR</span> عنوان SEO</label>
            <input class="form-input" type="text" id="seoTitleAr" dir="rtl" value="${escHtml(pkg?.seo_title_ar ?? '')}"
                   placeholder="باقة شهر العسل الذهبي بالي 7 ليالٍ | لوكس باث" maxlength="70" style="font-family:var(--font-arabic)">
            <div class="form-char-count" id="seoTitleArCount">0 / 70</div>
          </div>
        </div>

        <div class="form-bilingual">
          <div class="form-group">
            <label class="form-label form-label--optional"><span class="lang-chip lang-chip--en">EN</span> SEO Description</label>
            <textarea class="form-textarea" id="seoDescEn" rows="3" maxlength="170"
                      placeholder="Enjoy an unforgettable honeymoon in Bali with Luxpath Travel. 7 nights including flights, hotel, and tours. From SAR 3,500.">${escHtml(pkg?.seo_description_en ?? '')}</textarea>
            <div class="form-char-count" id="seoDescEnCount">0 / 170</div>
          </div>
          <div class="form-group">
            <label class="form-label form-label--optional form-label--ar"><span class="lang-chip lang-chip--ar">AR</span> وصف SEO</label>
            <textarea class="form-textarea" id="seoDescAr" dir="rtl" rows="3" maxlength="170"
                      placeholder="استمتع بشهر عسل لا يُنسى في بالي مع لوكس باث. 7 ليالٍ شاملة الطيران والفندق والجولات. يبدأ من 3,500 ريال." style="font-family:var(--font-arabic)">${escHtml(pkg?.seo_description_ar ?? '')}</textarea>
            <div class="form-char-count" id="seoDescArCount">0 / 170</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label form-label--optional">SEO Keywords</label>
          <div class="tag-input-wrap" id="tagInputWrap">
            ${kwArr.map(kw => `
              <span class="tag-chip">
                ${escHtml(kw)}
                <button class="tag-chip__remove" data-kw="${escHtml(kw)}" type="button" aria-label="Remove keyword">×</button>
              </span>`).join('')}
            <input class="tag-input-field" id="kwInput" type="text" placeholder="Type keyword, press Enter…" autocomplete="off">
          </div>
          <p class="form-note">Press Enter or comma to add. These are stored in the database for search optimisation. Include both Arabic and English keywords.</p>
        </div>
      </div>`;
  },

  _buildWAMsg(lang) {
    const title = lang === 'ar'
      ? (document.getElementById('titleAr')?.value || this.pkg?.title_ar || '[package title AR]')
      : (document.getElementById('titleEn')?.value || this.pkg?.title_en || '[package title EN]');
    const destEl = document.querySelector('#destSelector input[name="dest_primary"]:checked');
    let destName = '';
    if (destEl) {
      const dest = this.destinations.find(d => d.id === destEl.value);
      destName = dest ? (lang === 'ar' ? dest.name_ar : dest.name_en) : '';
    } else if (this.pkg) {
      const d = getPrimaryDest(this.pkg);
      destName = d ? (lang === 'ar' ? d.name_ar : d.name_en) : '';
    }
    if (lang === 'ar') return `مرحباً، أود الاستفسار عن باقة "${title}" إلى ${destName || '[destination]'}`;
    return `Hello, I'm interested in the "${title}" package to ${destName || '[destination]'}`;
  },

  _switchTab(tabId) {
    this._activeTab = tabId;
    document.querySelectorAll('.form-tab-btn').forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      // Roving tabindex: only active tab is in the tab order
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    document.querySelectorAll('.form-tab-panel').forEach(panel => {
      panel.classList.toggle('is-active', panel.dataset.panel === tabId);
    });
    if (tabId === 'media')     ImageManager.render();
    if (tabId === 'itinerary') ItineraryBuilder.render();
    if (tabId === 'includes')  InclusionsBuilder.render();
  },

  populateForm() {
    if (!this.pkg) return;
    // Refresh char counter displays only — listeners are already attached in _bindFormEvents.
    // Calling _updateCharCount here again would add duplicate input listeners.
    [
      ['shortDescEn','shortDescEnCount',300],['shortDescAr','shortDescArCount',300],
      ['seoTitleEn', 'seoTitleEnCount', 70], ['seoTitleAr', 'seoTitleArCount', 70],
      ['seoDescEn',  'seoDescEnCount',  170], ['seoDescAr', 'seoDescArCount',  170],
    ].forEach(([inputId, countId, max]) => {
      const input   = document.getElementById(inputId);
      const counter = document.getElementById(countId);
      if (!input || !counter) return;
      const len = input.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.className = 'form-char-count' + (len > max * 0.9 ? (len >= max ? ' is-error' : ' is-warning') : '');
    });
    // Sync primary destination radio disabled states
    this._syncDestChecks();
  },

  _syncDestChecks() {
    // Update disabled states only — no event listeners here.
    // Destination change events are handled via delegation in _bindFormEvents()
    // to prevent duplicate listener accumulation on repeated calls.
    document.querySelectorAll('#destSelector input[name="dest_check"]').forEach(chk => {
      const primeRadio = document.querySelector(`#destSelector input[name="dest_primary"][value="${chk.value}"]`);
      if (!primeRadio) return;
      primeRadio.disabled = !chk.checked;
      // If this destination is deselected but was primary, clear primary + promote next checked
      if (!chk.checked && primeRadio.checked) {
        primeRadio.checked = false;
        const first = document.querySelector('#destSelector input[name="dest_check"]:checked');
        if (first) {
          const r = document.querySelector(`#destSelector input[name="dest_primary"][value="${first.value}"]`);
          if (r) r.checked = true;
        }
      }
    });
  },

  _updateCharCount(inputId, countId, max) {
    const input   = document.getElementById(inputId);
    const counter = document.getElementById(countId);
    if (!input || !counter) return;
    const update = () => {
      const len = input.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.className = 'form-char-count' + (len > max * 0.9 ? (len >= max ? ' is-error' : ' is-warning') : '');
    };
    update();
    input.addEventListener('input', update);
  },

  _bindFormEvents() {
    // Cancel
    document.getElementById('formCancelBtn').addEventListener('click', () => {
      if (this._dirty && !confirm('You have unsaved changes. Leave anyway?')) return;
      App.showView('packages');
    });

    // Save
    document.getElementById('formSaveBtn').addEventListener('click', () => this.save());

    // Tab switching — click
    document.querySelectorAll('.form-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this._switchTab(btn.dataset.tab));
    });

    // Tab switching — keyboard (ARIA tablist arrow-key pattern)
    document.querySelector('.form-tabs-nav')?.addEventListener('keydown', (e) => {
      const tabs = [...document.querySelectorAll('.form-tab-btn')];
      const idx  = tabs.findIndex(t => t.dataset.tab === this._activeTab);
      let next = -1;
      if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home')  next = 0;
      else if (e.key === 'End')   next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      this._switchTab(tabs[next].dataset.tab);
      tabs[next].focus();
    });

    // Title → slug auto-generate
    document.getElementById('titleEn')?.addEventListener('input', (e) => {
      const slugEl = document.getElementById('slugEn');
      if (slugEl && !this.pkg) slugEl.value = slugify(e.target.value);
      const slugArEl = document.getElementById('slugAr');
      if (slugArEl && !this.pkg) slugArEl.value = slugify(e.target.value) + '-ar';
      this._updateWAPreview();
      this._dirty = true;
    });
    document.getElementById('titleAr')?.addEventListener('input', () => {
      this._updateWAPreview();
      this._dirty = true;
    });

    // Destination primary → WA preview
    document.getElementById('destSelector')?.addEventListener('change', () => {
      this._syncDestChecks();
      this._updateWAPreview();
      this._dirty = true;
    });

    // Dirty tracking
    document.getElementById('packageFormContainer').addEventListener('input', () => { this._dirty = true; });

    // Image upload
    const dropZone = document.getElementById('imageDropZone');
    const fileInput = document.getElementById('imageFileInput');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', (e) => { if (!e.target.closest('.image-card')) fileInput.click(); });
      dropZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('is-dragging'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-dragging'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('is-dragging');
        ImageManager.addFiles(e.dataTransfer.files);
        ImageManager.render();
        this._dirty = true;
      });
      fileInput.addEventListener('change', () => {
        ImageManager.addFiles(fileInput.files);
        ImageManager.render();
        fileInput.value = '';
        this._dirty = true;
      });
    }

    // Itinerary add day
    document.getElementById('addDayBtn')?.addEventListener('click', () => ItineraryBuilder.addDay());

    // Inclusions add
    document.getElementById('addIncludedBtn')?.addEventListener('click', () => InclusionsBuilder.addItem('included'));
    document.getElementById('addExcludedBtn')?.addEventListener('click', () => InclusionsBuilder.addItem('excluded'));

    // SEO keyword tag input
    this._bindTagInput();

    // Char counters
    [['shortDescEn','shortDescEnCount',300],['shortDescAr','shortDescArCount',300],
     ['seoTitleEn','seoTitleEnCount',70],['seoTitleAr','seoTitleArCount',70],
     ['seoDescEn','seoDescEnCount',170],['seoDescAr','seoDescArCount',170]
    ].forEach(([id, cid, max]) => this._updateCharCount(id, cid, max));
  },

  _updateWAPreview() {
    const arEl = document.getElementById('waPreviewAr');
    const enEl = document.getElementById('waPreviewEn');
    if (arEl) arEl.textContent = this._buildWAMsg('ar');
    if (enEl) enEl.textContent = this._buildWAMsg('en');
  },

  _bindTagInput() {
    const wrap = document.getElementById('tagInputWrap');
    const input = document.getElementById('kwInput');
    if (!wrap || !input) return;

    const addKw = (kw) => {
      kw = kw.trim().replace(/,+$/, '').trim();
      if (!kw) return;
      if (wrap.querySelector(`[data-kw="${CSS.escape(kw)}"]`)) return;
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${escHtml(kw)}<button class="tag-chip__remove" type="button" data-kw="${escHtml(kw)}" aria-label="Remove">×</button>`;
      chip.querySelector('button').addEventListener('click', () => chip.remove());
      wrap.insertBefore(chip, input);
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addKw(input.value); input.value = ''; }
      if (e.key === 'Backspace' && !input.value) {
        const chips = wrap.querySelectorAll('.tag-chip');
        if (chips.length) chips[chips.length - 1].remove();
      }
    });
    input.addEventListener('blur', () => { if (input.value.trim()) { addKw(input.value); input.value = ''; } });
    wrap.querySelectorAll('.tag-chip__remove').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.tag-chip').remove());
    });
    wrap.addEventListener('click', () => input.focus());
  },

  _collectKeywords() {
    return Array.from(document.querySelectorAll('#tagInputWrap .tag-chip'))
      .map(chip => chip.childNodes[0]?.textContent?.trim())
      .filter(Boolean);
  },

  validate() {
    const errors = [];
    const v = (id) => document.getElementById(id)?.value?.trim() ?? '';

    if (!v('titleEn'))        errors.push({ tab: 'basic',   msg: 'English title is required.' });
    if (!v('titleAr'))        errors.push({ tab: 'basic',   msg: 'Arabic title is required.' });
    if (!v('category'))       errors.push({ tab: 'basic',   msg: 'Category is required.' });
    if (!v('durationNights') && v('durationNights') !== '0') errors.push({ tab: 'basic', msg: 'Duration nights is required.' });
    if (!v('durationDays'))   errors.push({ tab: 'basic',   msg: 'Duration days is required.' });
    if (!v('slugEn'))         errors.push({ tab: 'basic',   msg: 'English slug is required.' });

    const nights = parseInt(v('durationNights'), 10);
    const days   = parseInt(v('durationDays'),   10);
    if (!isNaN(nights) && !isNaN(days) && days < nights) {
      errors.push({ tab: 'basic', msg: 'Duration days must be ≥ duration nights.' });
    }

    const checkedDests = document.querySelectorAll('#destSelector input[name="dest_check"]:checked');
    const primaryDest  = document.querySelector('#destSelector input[name="dest_primary"]:checked');
    if (!checkedDests.length)    errors.push({ tab: 'basic', msg: 'Select at least one destination.' });
    if (checkedDests.length && !primaryDest) errors.push({ tab: 'basic', msg: 'Mark one destination as primary.' });

    if (!v('priceValue'))     errors.push({ tab: 'pricing', msg: 'Price value is required.' });
    const price = parseFloat(v('priceValue'));
    const orig  = parseFloat(v('originalPriceValue'));
    if (!isNaN(price) && !isNaN(orig) && orig <= price) {
      errors.push({ tab: 'pricing', msg: 'Original price must be greater than the sale price.' });
    }

    // Validate itinerary day titles (DB schema: title_ar/title_en are NOT NULL)
    ItineraryBuilder.collectFromDOM();
    ItineraryBuilder.days.forEach(day => {
      if (!day.title_en?.trim()) errors.push({ tab: 'itinerary', msg: `Day ${day.day_number}: English title is required.` });
      if (!day.title_ar?.trim()) errors.push({ tab: 'itinerary', msg: `Day ${day.day_number}: Arabic title is required.` });
    });

    const seoTitleEnLen  = v('seoTitleEn').length;
    const seoTitleArLen  = v('seoTitleAr').length;
    const seoDescEnLen   = v('seoDescEn').length;
    const seoDescArLen   = v('seoDescAr').length;
    if (seoTitleEnLen > 70)  errors.push({ tab: 'seo', msg: 'SEO title EN exceeds 70 characters.' });
    if (seoTitleArLen > 70)  errors.push({ tab: 'seo', msg: 'SEO title AR exceeds 70 characters.' });
    if (seoDescEnLen  > 170) errors.push({ tab: 'seo', msg: 'SEO description EN exceeds 170 characters.' });
    if (seoDescArLen  > 170) errors.push({ tab: 'seo', msg: 'SEO description AR exceeds 170 characters.' });

    return errors;
  },

  async save() {
    const errors = this.validate();
    if (errors.length) {
      // Highlight error tabs
      const errorTabs = [...new Set(errors.map(e => e.tab))];
      document.querySelectorAll('.form-tab-btn').forEach(btn => {
        btn.classList.toggle('has-error', errorTabs.includes(btn.dataset.tab));
      });
      const firstErrorEl = document.querySelector('.form-tab-btn.has-error');
      if (firstErrorEl) this._switchTab(firstErrorEl.dataset.tab);
      Toast.error('Validation errors', errors[0].msg + (errors.length > 1 ? ` (+${errors.length - 1} more)` : ''));
      return;
    }

    // Clear error tabs
    document.querySelectorAll('.form-tab-btn').forEach(btn => btn.classList.remove('has-error'));

    const saveBtn = document.getElementById('formSaveBtn');
    saveBtn.classList.add('btn--loading');
    saveBtn.disabled = true;

    const v = (id) => document.getElementById(id)?.value?.trim() ?? '';

    try {
      // Build destinations array
      const destRows = [];
      document.querySelectorAll('#destSelector input[name="dest_check"]:checked').forEach((chk, i) => {
        const isPrimary = document.querySelector(`#destSelector input[name="dest_primary"][value="${chk.value}"]`)?.checked ?? false;
        destRows.push({ destination_id: chk.value, is_primary: isPrimary, display_order: i });
      });

      const slugEn = v('slugEn') || slugify(v('titleEn'));
      const slugAr = v('slugAr') || slugEn + '-ar';

      // Check slug_en uniqueness
      const slugOk = await DB.checkSlugAvailable(slugEn, this.packageId).catch(() => true);
      if (!slugOk) {
        Toast.error('Slug conflict', `The slug "${slugEn}" is already used by another package. Please edit it.`);
        this._switchTab('basic');
        document.getElementById('slugEn')?.classList.add('is-error');
        saveBtn.classList.remove('btn--loading');
        saveBtn.disabled = false;
        return;
      }
      // Check slug_ar uniqueness
      const slugArOk = await DB.checkSlugAvailableAr(slugAr, this.packageId).catch(() => true);
      if (!slugArOk) {
        Toast.error('Slug conflict', `The Arabic slug "${slugAr}" is already used. Please edit it.`);
        this._switchTab('basic');
        document.getElementById('slugAr')?.classList.add('is-error');
        saveBtn.classList.remove('btn--loading');
        saveBtn.disabled = false;
        return;
      }

      // Collect image alt texts before upload
      ImageManager.collectFromDOM();

      // Upload new images
      await ImageManager.uploadNew(slugEn);

      // Delete removed images from storage
      await ImageManager.deleteRemoved();

      const packageData = {
        slug_en:               slugEn,
        slug_ar:               slugAr,
        title_en:              v('titleEn'),
        title_ar:              v('titleAr'),
        short_description_en:  v('shortDescEn')  || null,
        short_description_ar:  v('shortDescAr')  || null,
        full_description_en:   v('fullDescEn')   || null,
        full_description_ar:   v('fullDescAr')   || null,
        duration_nights:       parseInt(v('durationNights'), 10),
        duration_days:         parseInt(v('durationDays'),   10),
        category:              v('category'),
        price_type:            v('priceType')     || 'starting_from',
        price_value:           parseFloat(v('priceValue')),
        original_price_value:  v('originalPriceValue') ? parseFloat(v('originalPriceValue')) : null,
        currency:              v('currency')      || 'SAR',
        min_persons:           parseInt(v('minPersons'), 10) || 1,
        max_persons:           v('maxPersons') ? parseInt(v('maxPersons'), 10) : null,
        is_active:             document.getElementById('isActive')?.checked   ?? true,
        is_featured:           document.getElementById('isFeatured')?.checked ?? false,
        display_order:         parseInt(v('displayOrder'), 10) || 0,
        hero_image_url:        ImageManager.heroUrl(),
        seo_title_en:          v('seoTitleEn')   || null,
        seo_title_ar:          v('seoTitleAr')   || null,
        seo_description_en:    v('seoDescEn')    || null,
        seo_description_ar:    v('seoDescAr')    || null,
        seo_keywords:          this._collectKeywords(),
      };

      let packageId   = this.packageId;
      let isNewPackage = false;

      if (this.mode === 'create') {
        const result = await DB.createPackage(packageData);
        packageId    = result.id;
        isNewPackage = true;
      } else {
        await DB.updatePackage(packageId, packageData);
      }

      // Save related records (delete-all + re-insert)
      await DB.deletePackageDestinations(packageId);
      if (destRows.length) await DB.insertPackageDestinations(destRows.map(r => ({ ...r, package_id: packageId })));

      await DB.deletePackageImages(packageId);
      const imgRows = ImageManager.toDBRows(packageId);
      if (imgRows.length) await DB.insertPackageImages(imgRows);

      await DB.deletePackageInclusions(packageId);
      const inclRows = InclusionsBuilder.toDBRows(packageId);
      if (inclRows.length) await DB.insertPackageInclusions(inclRows);

      await DB.deletePackageItinerary(packageId);
      const itinRows = ItineraryBuilder.toDBRows(packageId);
      if (itinRows.length) await DB.insertPackageItinerary(itinRows);

      this._dirty = false;
      Toast.success(
        this.mode === 'create' ? 'Package created!' : 'Changes saved!',
        `"${packageData.title_en}" has been ${this.mode === 'create' ? 'created' : 'updated'} successfully.`
      );

      await PackageList.load();
      App.showView('packages');

    } catch (err) {
      // Best-effort rollback: if we created a new package but subsequent operations failed,
      // delete the orphaned package record so the admin can retry cleanly.
      if (isNewPackage && packageId) {
        DB.deletePackage(packageId).catch(() => {});
      }
      // Clean up any images that were already uploaded to Storage this session
      // but whose DB records were never committed.
      const orphanedPaths = ImageManager.items
        .filter(x => x.status === 'saved')
        .map(x => x.url)
        .filter(Boolean);
      if (orphanedPaths.length) {
        StorageManager.remove(orphanedPaths).catch(() => {});
        // Reset status so they can be re-uploaded on retry
        ImageManager.items.forEach(x => { if (x.status === 'saved') x.status = 'new'; });
      }
      Toast.error('Save failed', err.message);
      console.error('[PackageForm.save]', err);
    } finally {
      saveBtn.classList.remove('btn--loading');
      saveBtn.disabled = false;
    }
  },
};

/* ============================================================
   13. APP — ORCHESTRATION
   ============================================================ */
const App = {
  async init() {
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

    const authed = await Auth.init();
    if (!authed) return;

    this.showDashboard();
  },

  showDashboard() {
    // Dismiss the checking overlay with a fade
    const overlay = document.getElementById('dashChecking');
    if (overlay) {
      overlay.classList.add('is-done');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    document.getElementById('dashboard').hidden = false;

    Modal.init();
    Sidebar.init();
    PackageList.bindControls();

    // Populate sidebar user info
    this._renderUserInfo();

    // Warn before leaving with unsaved form changes
    window.addEventListener('beforeunload', (e) => {
      if (PackageForm._dirty) { e.preventDefault(); e.returnValue = ''; }
    });

    this.navigateTo('packages');
  },

  _renderUserInfo() {
    const el = document.getElementById('sidebarUser');
    if (!el) return;

    const user = Auth.getUser();
    const role = Auth.getRole();
    if (!user) return;

    const initial = (user.email ?? '?').charAt(0).toUpperCase();
    el.innerHTML = `
      <div class="sidebar__user-inner">
        <div class="sidebar__user-avatar" aria-hidden="true">${escHtml(initial)}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-email" title="${escHtml(user.email)}">${escHtml(user.email)}</div>
          <div class="sidebar__user-role">${escHtml(role ?? 'admin')}</div>
        </div>
      </div>`;
  },

  navigateTo(view) {
    if (view === 'packages') {
      this.showView('packages');
      document.getElementById('topbarTitle').textContent = 'Packages';
      document.getElementById('topbarActions').innerHTML = `
        <button class="btn btn--primary" id="newPackageBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Package
        </button>`;
      document.getElementById('newPackageBtn')
        .addEventListener('click', () => PackageForm.open('create'));
      PackageList.load();
    }
  },

  showView(view) {
    document.getElementById('viewPackages').hidden = view !== 'packages';
    document.getElementById('viewForm').hidden     = view !== 'form';
    Sidebar.setActive(view === 'packages' ? 'packages' : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

/* ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => App.init());
