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
   6.  DashLightbox
   7.  Modal
   8.  Sidebar
   9.  ImageManager
   10. ItineraryBuilder
   11. InclusionsBuilder
   12. PackageList
   13. PackageForm
   14. App
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIG
   ============================================================ */
const Config = Object.freeze({
  SUPABASE_URL: 'https://fgeeysssiesdlryoygoa.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWV5c3NzaWVzZGxyeW95Z29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTI0MzUsImV4cCI6MjA5NTk4ODQzNX0.Sa3vcq9U2BrzFobTqQS4sAmVpXkRH09_PGzol9-NCvw',
  // Service role key — used ONLY on localhost to bypass RLS during development.
  // Get it from: Supabase Dashboard → Project Settings → API → service_role (secret).
  // ⚠️  Never deploy this to a public server. On production the anon key + RLS is used.
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWV5c3NzaWVzZGxyeW95Z29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxMjQzNSwiZXhwIjoyMDk1OTg4NDM1fQ.3M6qJ2nLr9f1UFHIhKK3QMILN2InPma3O4Zc11dpj7c',   // ← paste your service_role key here for local dev
  get STORAGE_URL() { return this.SUPABASE_URL + '/storage/v1/object/public/luxpath-media/'; },
  STORAGE_BUCKET: 'luxpath-media',
  WHATSAPP_NUMBER: '+6281111826527',
  PLACEHOLDER_IMG: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F0EDE8" width="400" height="300"/%3E%3C/svg%3E',
  LOGIN_URL: 'login',
});

const CATEGORY_LABELS = { honeymoon: 'Honeymoon', family: 'Family', luxury: 'Luxury', adventure: 'Adventure' };

// ── Hero images available in the hero-images/ folder ────────
// Developer: add a new entry here each time you upload a new file.
const HERO_IMAGES = [
  { file: 'image-1.webp', label: 'Image 1' },
  { file: 'image-2.webp', label: 'Image 2' },
  { file: 'image-3.webp', label: 'Image 3' },
  { file: 'image-4.webp', label: 'Image 4' },
];

const CITY_MAP = {
  'Riyadh': 'الرياض', 'Jeddah': 'جدة', 'Mecca': 'مكة المكرمة',
  'Medina': 'المدينة المنورة', 'Dammam': 'الدمام', 'Khobar': 'الخبر',
  'Dhahran': 'الظهران', 'Abha': 'أبها', 'Taif': 'الطائف', 'Tabuk': 'تبوك',
  'Buraydah': 'بريدة', 'Khamis Mushait': 'خميس مشيط', 'Jubail': 'الجبيل',
  'Yanbu': 'ينبو', 'Najran': 'نجران', 'Jizan': 'جيزان', 'Hail': 'حائل',
  'Sakaka': 'سكاكا', 'Arar': 'عرعر',
  'Dubai': 'دبي', 'Abu Dhabi': 'أبوظبي', 'Sharjah': 'الشارقة',
  'Ajman': 'عجمان', 'Ras Al Khaimah': 'رأس الخيمة',
  'Doha': 'الدوحة', 'Kuwait City': 'مدينة الكويت',
  'Manama': 'المنامة', 'Muscat': 'مسقط',
  'Amman': 'عمّان', 'Cairo': 'القاهرة', 'Alexandria': 'الإسكندرية',
  'Baghdad': 'بغداد', 'Damascus': 'دمشق',
};
const PRICE_TYPE_LABELS = { exact: 'Exact Price', starting_from: 'Starting From', approximate: 'Approximate' };
const MEAL_LABELS = { breakfast: 'Breakfast 🍳', lunch: 'Lunch 🥗', dinner: 'Dinner 🍽️' };

const INCLUSION_ICONS = [
  ['flight', '✈️ Flight'], ['hotel', '🏨 Hotel'], ['transfer', '🚌 Transfer'],
  ['guide_arabic', '🗣️ Private Driver'],
  ['meal_lunch', '🥗 Lunch'], ['meal_dinner', '🍽️ Dinner'], ['meals_all', '🍽️ All Meals'],
  ['visa', '📋 Visa'], ['insurance', '🛡️ Insurance'], ['sim_card', '📱 SIM Card'],
  ['photo_session', '📸 Photo Session'], ['water_activities', '🤿 Water Activities'],
  ['spa', '💆 Spa'], ['custom', '✨ Custom'],
];

// Pre-defined inclusion options shown as quick-pick checkboxes in the admin form.
// Each entry maps directly to a DB row when checked.
const QUICK_INCLUSIONS = [
  { icon: 'flight', emoji: '✈️', text_en: 'Domestic Flights', text_ar: 'تذاكر الطيران' },
  { icon: 'hotel', emoji: '🏨', text_en: 'Hotels Including Breakfast', text_ar: 'فنادق مع افطار', text_ar_detail: 'اقامة مريحة في فنادق ومنتجعات مختارة تشمل إفطار يومي' },
  { icon: 'transfer', emoji: '🚌', text_en: 'Airport Transfers', text_ar: 'استقبال وتوديع من المطار', text_ar_detail: 'الإستقبال والتوديع والتوصيل من المطار للفنادق والجولات السياحية' },
  { icon: 'guide_arabic', emoji: '🗣️', text_en: 'Private Driver', text_ar: 'جولات يومية مع سائق خاص يتحدث العربية', text_ar_detail: 'سيارة خاصة مريحة مع سائق خاص طوال الرحلة مع برنامج يومي منظم مناسب لكم.' },
  { icon: 'sim_card', emoji: '📱', text_en: 'SIM Card', text_ar: 'شرائح إنترنت' },
  { icon: 'meal_lunch', emoji: '🥗', text_en: 'Lunch', text_ar: 'وجبة الغداء' },
  { icon: 'meal_dinner', emoji: '🍽️', text_en: 'Dinner', text_ar: 'وجبة العشاء' },
  { icon: 'meals_all', emoji: '🍽️', text_en: 'All Meals', text_ar: 'جميع الوجبات' },
  { icon: 'visa', emoji: '📋', text_en: 'Visa Assistance', text_ar: 'مساعدة في التأشيرة' },
  { icon: 'insurance', emoji: '🛡️', text_en: 'Travel Insurance', text_ar: 'تأمين سفر' },
  { icon: 'photo_session', emoji: '📸', text_en: 'Photo Session', text_ar: 'جلسة تصوير' },
  { icon: 'water_activities', emoji: '🤿', text_en: 'Water Activities', text_ar: 'أنشطة مائية' },
  { icon: 'spa', emoji: '💆', text_en: 'Spa Treatment', text_ar: 'جلسة سبا' },
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
    if (!_client) {
      const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
      const key = (isLocal && Config.SUPABASE_SERVICE_KEY)
        ? Config.SUPABASE_SERVICE_KEY
        : Config.SUPABASE_ANON_KEY;
      _client = supabase.createClient(Config.SUPABASE_URL, key);
    }
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
            destination_id,
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
            destination_id, display_order,
            destinations ( id, slug, name_ar, name_en )
          ),
          package_images (
            id, image_url, alt_ar, alt_en, is_hero, display_order
          ),
          package_inclusions (
            id, type, icon, text_ar, text_en, display_order
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

    // ── Site settings (hero images) ───────────────────────
    getHeroImagesSetting: async () => {
      const db = client();
      if (!db) throw new Error('Supabase not configured.');
      const { data } = await db.from('site_settings')
        .select('value').eq('key', 'hero_active_images').maybeSingle();
      return data?.value ?? null;
    },

    saveHeroImagesSetting: (activeFiles) => q(db =>
      db.from('site_settings')
        .upsert(
          { key: 'hero_active_images', value: JSON.stringify(activeFiles) },
          { onConflict: 'key' }
        )
    ),

    // ── Testimonials ──────────────────────────────────────
    getTestimonials: () => q(db =>
      db.from('testimonials')
        .select(`
          id, reviewer_name_display, reviewer_city, reviewer_flag, rating,
          review_ar, review_en, trip_month, trip_year, trip_category,
          is_approved, display_order, created_at,
          reply_ar, reply_en
        `)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
    ),

    getTestimonial: (id) => q(db =>
      db.from('testimonials')
        .select(`
          id, reviewer_name_display, reviewer_city, reviewer_flag, rating,
          review_ar, review_en, trip_month, trip_year, trip_category,
          is_approved, display_order, created_at,
          reply_ar, reply_en
        `)
        .eq('id', id)
        .single()
    ),

    createTestimonial: (data) => q(db =>
      db.from('testimonials').insert(data).select('id').single()
    ),

    updateTestimonial: (id, data) => q(db =>
      db.from('testimonials').update(data).eq('id', id).select('id').single()
    ),

    deleteTestimonial: (id) => q(db =>
      db.from('testimonials').delete().eq('id', id)
    ),
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
  let _session = null;
  let _user = null;
  let _role = null;
  let _idleTimer = null;

  const IDLE_MS = 30 * 60 * 1000; // 30-minute idle timeout

  return {
    /**
     * Called once on dashboard load.
     * Supabase must be configured — unconfigured state redirects to login.
     * Returns true if the caller should proceed to showDashboard().
     */
    async init() {
      // ── LOCAL DEVELOPMENT BYPASS ──────────────────────────────
      // Skip all auth checks when running on localhost so the
      // dashboard can be edited freely without a live Supabase session.
      // On production the real domain will never match this condition.
      const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
      if (isLocal) {
        _role = 'admin';
        _user = { email: 'dev@localhost', id: 'local-dev' };
        return true;
      }
      // ─────────────────────────────────────────────────────────

      const db = DB.client();

      if (!db) {
        // Supabase credentials not configured — refuse access entirely
        window.location.replace(Config.LOGIN_URL);
        return false;
      }

      // Retrieve persisted session (stored in localStorage by Supabase JS)
      let session, sessionErr;
      try {
        ({ data: { session }, error: sessionErr } = await db.auth.getSession());
      } catch (e) {
        console.error('[Auth] getSession threw:', e);
        window.location.replace(Config.LOGIN_URL);
        return false;
      }

      if (sessionErr || !session) {
        window.location.replace(Config.LOGIN_URL);
        return false;
      }

      _session = session;
      _user = session.user;

      // Only system@luxpathtravel.com may access the dashboard
      if (_user.email !== 'system@luxpathtravel.com') {
        await db.auth.signOut().catch(() => { });
        window.location.replace(Config.LOGIN_URL + '?error=unauthorized');
        return false;
      }

      _role = 'admin';

      // Subscribe to auth state changes: forced sign-out + token refresh
      db.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession) {
          window.location.replace(Config.LOGIN_URL);
          return;
        }
        if (event === 'TOKEN_REFRESHED') {
          _session = newSession;
          _user = newSession.user;
          // Re-validate email on every token refresh
          if (_user.email !== 'system@luxpathtravel.com') {
            await db.auth.signOut().catch(() => { });
            window.location.replace(Config.LOGIN_URL + '?error=unauthorized');
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
      if (db) await db.auth.signOut().catch(() => { });
      window.location.replace(Config.LOGIN_URL);
    },

    getUser() { return _user; },
    getRole() { return _role; },
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
      error: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
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
  error: (t, m) => Toast.show('error', t, m),
  warning: (t, m) => Toast.show('warning', t, m),
  info: (t, m) => Toast.show('info', t, m),
};

/* ============================================================
   6. DASH IMAGE LIGHTBOX
   ============================================================ */
const DashLightbox = (() => {
  let box, img;

  const _onKey = (e) => { if (e.key === 'Escape') close(); };

  const open = (src, alt) => {
    if (!box) return;
    img.src = src;
    img.alt = alt ?? '';
    box.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => box.classList.add('is-open'));
    });
    document.addEventListener('keydown', _onKey);
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    if (!box) return;
    box.classList.remove('is-open');
    box.addEventListener('transitionend', () => {
      if (!box.classList.contains('is-open')) box.style.display = 'none';
    }, { once: true });
    document.removeEventListener('keydown', _onKey);
    document.body.style.overflow = '';
  };

  const init = () => {
    box = document.getElementById('dashImgLightbox');
    img = document.getElementById('dashLightboxImg');
    if (!box) return;
    box.style.display = 'none';
    document.getElementById('dashLightboxClose')?.addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
  };

  return { init, open, close };
})();

/* ============================================================
   7. MODAL
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
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  },

  init() {
    document.getElementById('modalCancelBtn').addEventListener('click', () => this.close(false));
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
      // signOut() handles the redirect to login
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
      else { l.removeAttribute('aria-current'); }
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

// ── Price input helpers ───────────────────────────────────────
// Format a raw number string with thousand-separator commas.
function fmtInputNumber(val) {
  if (val === '' || val == null) return '';
  const raw = String(val).replace(/[^0-9.]/g, '');
  const [int, dec] = raw.split('.');
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec !== undefined ? `${formatted}.${dec}` : formatted;
}

// Bind comma-formatting to a text input (call after the input is in the DOM).
function bindPriceInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.value) el.value = fmtInputNumber(el.value);
  el.addEventListener('input', () => {
    const start = el.selectionStart;
    const before = el.value.slice(0, start).replace(/,/g, '').length;
    const raw = el.value.replace(/[^0-9.]/g, '');
    el.value = fmtInputNumber(raw);
    // Restore cursor: count forward 'before' non-comma characters
    let count = 0, pos = 0;
    for (; pos < el.value.length && count < before; pos++) {
      if (el.value[pos] !== ',') count++;
    }
    el.setSelectionRange(pos, pos);
  });
}

// Read a comma-formatted price input and return a float (or null if empty).
function parsePriceInput(id) {
  const el = document.getElementById(id);
  if (!el || !el.value.trim()) return null;
  const n = parseFloat(el.value.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

function getPrimaryDest(pkg) {
  const dests = pkg.package_destinations ?? [];
  return dests[0]?.destinations ?? null;
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
      const ext = item.file.name.split('.').pop().toLowerCase();
      const base = slugify(item.file.name.replace(/\.[^.]+$/, ''));
      const idx = this.items.indexOf(item);
      const path = `packages/${packageSlug}/gallery/${String(idx).padStart(2, '0')}-${base}.${ext}`;
      item.url = await StorageManager.upload(item.file, path);
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
        package_id: packageId,
        image_url: item.url ?? '',
        alt_ar: item.alt_ar,
        alt_en: item.alt_en,
        is_hero: item.is_hero,
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

// ItineraryBuilder removed — itinerary tab dropped, package_itinerary table removed from DB.

/* ============================================================
   10. INCLUSIONS BUILDER
   ============================================================ */
const InclusionsBuilder = {
  // quickChecked: Set of icon keys for pre-defined items that are checked
  quickChecked: new Set(),
  // custom: free-form items with unique icons or custom text
  custom: [],

  reset() {
    this.quickChecked = new Set();
    this.custom = [];
  },

  loadFromDB(inclusions) {
    this.quickChecked = new Set();
    this.custom = [];
    const quickIcons = new Set(QUICK_INCLUSIONS.map(q => q.icon));
    (inclusions ?? [])
      .filter(x => x.type === 'included')
      .sort((a, b) => a.display_order - b.display_order)
      .forEach(item => {
        if (quickIcons.has(item.icon)) {
          this.quickChecked.add(item.icon);
        } else {
          this.custom.push({
            _lid: `incl_${item.id ?? Date.now() + Math.random()}`,
            text_ar: item.text_ar ?? '',
            text_en: item.text_en ?? '',
          });
        }
      });
  },

  addCustom() {
    this._collectCustomFromDOM();
    const lid = `incl_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.custom.push({ _lid: lid, text_ar: '', text_en: '' });
    this.render();
    setTimeout(() => {
      const rows = document.querySelectorAll('#customInclusionsList .incl-item');
      rows[rows.length - 1]?.querySelector('.incl-item__input')?.focus();
    }, 50);
  },

  removeCustom(lid) {
    this._collectCustomFromDOM();
    this.custom = this.custom.filter(x => x._lid !== lid);
    this.render();
  },

  _collectCustomFromDOM() {
    const listEl = document.getElementById('customInclusionsList');
    if (!listEl) return;
    this.custom.forEach(item => {
      const el = listEl.querySelector(`[data-lid="${item._lid}"]`);
      if (!el) return;
      item.text_en = el.querySelector('[data-f="text_en"]')?.value ?? '';
      item.text_ar = el.querySelector('[data-f="text_ar"]')?.value ?? '';
    });
  },

  _customItemHTML(item) {
    return `
      <div class="incl-item" data-lid="${item._lid}">
        <div class="incl-item__inputs">
          <input class="incl-item__input" type="text" data-f="text_en" value="${escHtml(item.text_en)}" placeholder="Description (EN)">
          <input class="incl-item__input" type="text" data-f="text_ar" dir="rtl" value="${escHtml(item.text_ar)}" placeholder="الوصف بالعربي" style="font-family:var(--font-arabic)">
        </div>
        <button class="incl-item__remove" type="button" data-action="remove-custom-incl" data-lid="${item._lid}" aria-label="Remove">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
  },

  render() {
    const qpGrid = document.getElementById('quickPickGrid');
    const customList = document.getElementById('customInclusionsList');
    if (!qpGrid || !customList) return;

    // Quick-pick checkboxes
    qpGrid.innerHTML = QUICK_INCLUSIONS.map(qp => `
      <label class="qp-item ${this.quickChecked.has(qp.icon) ? 'is-checked' : ''}">
        <input type="checkbox" class="qp-item__check" data-icon="${qp.icon}"
               ${this.quickChecked.has(qp.icon) ? 'checked' : ''}>
        <span class="qp-item__emoji" aria-hidden="true">${qp.emoji}</span>
        <span class="qp-item__en">${escHtml(qp.text_en)}</span>
        <span class="qp-item__ar" dir="rtl" style="font-family:var(--font-arabic)">${escHtml(qp.text_ar)}</span>
      </label>`).join('');

    // Custom free-form items
    customList.innerHTML = this.custom.map(i => this._customItemHTML(i)).join('') ||
      '<p style="font-size:var(--text-xs);color:var(--text-light);padding:var(--sp-2) 0">No custom items yet.</p>';

    // Bind quick-pick toggle
    qpGrid.querySelectorAll('.qp-item__check').forEach(chk => {
      chk.addEventListener('change', () => {
        if (chk.checked) this.quickChecked.add(chk.dataset.icon);
        else this.quickChecked.delete(chk.dataset.icon);
        chk.closest('.qp-item').classList.toggle('is-checked', chk.checked);
      });
    });

    // Bind custom remove
    customList.querySelectorAll('[data-action="remove-custom-incl"]').forEach(btn => {
      btn.addEventListener('click', () => this.removeCustom(btn.dataset.lid));
    });
  },

  toDBRows(packageId) {
    this._collectCustomFromDOM();
    const rows = [];
    let order = 0;
    // Quick-pick items first (in QUICK_INCLUSIONS definition order)
    QUICK_INCLUSIONS.forEach(qp => {
      if (!this.quickChecked.has(qp.icon)) return;
      rows.push({ package_id: packageId, type: 'included', icon: qp.icon, text_ar: qp.text_ar_detail ?? qp.text_ar, text_en: qp.text_en, display_order: order++ });
    });
    // Then custom items
    this.custom.forEach(item => {
      rows.push({ package_id: packageId, type: 'included', icon: 'custom', text_ar: item.text_ar, text_en: item.text_en, display_order: order++ });
    });
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
    const total = this.all.length;
    const active = this.all.filter(p => p.is_active).length;
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
    const cat = document.getElementById('filterCategory').value;
    const dest = document.getElementById('filterDestination').value;
    const status = document.getElementById('filterStatus').value;

    this.filtered = this.all.filter(p => {
      if (search && !(
        p.title_en?.toLowerCase().includes(search) ||
        p.title_ar?.includes(search) ||
        p.slug_en?.toLowerCase().includes(search)
      )) return false;
      if (cat && p.category !== cat) return false;
      if (dest && !p.package_destinations?.some(pd => pd.destination_id === dest)) return false;
      if (status === 'active' && !p.is_active) return false;
      if (status === 'inactive' && p.is_active) return false;
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
      const dest = getPrimaryDest(pkg);
      const destEN = dest?.name_en ?? '—';
      const imgSrc = pkg.hero_image_url ? StorageManager.publicUrl(pkg.hero_image_url) : Config.PLACEHOLDER_IMG;
      const nights = pkg.duration_nights ?? 0;
      const days = pkg.duration_days ?? 1;
      const price = fmtPrice(pkg.price_value, pkg.currency);
      const pLabel = PRICE_TYPE_LABELS[pkg.price_type] ?? '';

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
      img.addEventListener('error', function () {
        this.style.display = 'none';
        if (this.nextElementSibling) this.nextElementSibling.style.display = 'flex';
      }, { once: true });
      img.addEventListener('click', function () {
        if (this.style.display === 'none') return; // placeholder visible — no image to show
        DashLightbox.open(this.src, this.alt);
      });
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
  mode: null,
  packageId: null,
  pkg: null,
  destinations: [],
  _dirty: false,
  _activeTab: 'basic',

  async open(mode, packageId = null) {
    this.mode = mode;
    this.packageId = packageId;
    this.pkg = null;
    this._dirty = false;
    this._activeTab = 'basic';

    // Reset sub-builders
    ImageManager.reset();
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
            <button class="btn btn--icon btn--danger-ghost" id="formCancelBtn" type="button" aria-label="Cancel">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button class="btn btn--primary" id="formSaveBtn" type="button" aria-label="${isEdit ? 'Save Changes' : 'Create Package'}">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span class="btn-label">${isEdit ? 'Save Changes' : 'Create Package'}</span>
            </button>
          </div>
        </div>

        <!-- Tabs nav -->
        <div class="form-tabs-nav" role="tablist" aria-label="Form sections">
          ${[['basic', 'Basic Info'], ['content', 'Descriptions'], ['media', 'Media'],
      ['includes', 'Inclusions'], ['pricing', 'Pricing']
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
          ${this._renderPanelInclusions()}
          ${this._renderPanelPricing()}
        </div>

      </div>`;

    this._bindFormEvents();
    this._switchTab(this._activeTab);
    if (this.pkg) {
      ImageManager.render();
      InclusionsBuilder.render();
    }
  },

  _renderPanelBasic() {
    const pkg = this.pkg;
    const dests = this.destinations;

    const destRows = dests.map(d => {
      const isSelected = pkg?.package_destinations?.some(pd => pd.destination_id === d.id);
      return `
        <div class="dest-selector__item">
          <input type="checkbox" class="dest-selector__check" name="dest_check" id="dc_${d.id}" value="${d.id}" ${isSelected ? 'checked' : ''}>
          <div class="dest-selector__name">
            <label for="dc_${d.id}">${escHtml(d.name_en)}</label>
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
          </div>
          <div class="form-group">
            <label class="form-label form-label--ar"><span class="lang-chip lang-chip--ar">AR</span> عنوان الباقة <span style="color:var(--error)">*</span></label>
            <input class="form-input" type="text" id="titleAr" dir="rtl" value="${escHtml(pkg?.title_ar ?? '')}"
                   placeholder="مثال: باقة شهر العسل الذهبي — بالي" maxlength="120" required style="font-family:var(--font-arabic)">
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
                       value="${pkg?.duration_days ?? (pkg?.duration_nights != null ? pkg.duration_nights + 1 : '')}"
                       placeholder="Days" readonly
                       style="background:var(--surface-alt);color:var(--text-muted);cursor:default">
                <p class="form-note">Auto (nights + 1)</p>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section-title" style="margin-top:var(--sp-4)">Destinations <span style="color:var(--error)">*</span></div>
        <div class="dest-selector" id="destSelector">
          ${destRows || '<p style="padding:var(--sp-4);color:var(--text-light)">Loading destinations…</p>'}
        </div>
        <p class="form-note">Select one or more destinations for this package.</p>

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

  _renderPanelInclusions() {
    return `
      <div class="form-tab-panel" id="panel-includes" role="tabpanel" aria-labelledby="tab-includes" data-panel="includes">
        <div class="form-section-title">What's Included</div>
        <p class="form-note" style="margin-bottom:var(--sp-4)">
          Check the items included in this package. These appear as a checklist on the package detail page.
        </p>

        <!-- Quick-pick checkboxes -->
        <div class="qp-grid" id="quickPickGrid"></div>

        <!-- Custom / additional items -->
        <div class="incl-custom-section" style="margin-top:var(--sp-5)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3)">
            <span style="font-size:var(--text-sm);font-weight:600;color:var(--text-muted)">Additional Items</span>
            <button class="btn btn--sm btn--ghost" id="addIncludedBtn" type="button">+ Add Custom</button>
          </div>
          <div class="incl-list" id="customInclusionsList"></div>
        </div>
      </div>`;
  },

  _renderPanelPricing() {
    const pkg = this.pkg;
    const fv = (n) => (n != null && n !== '') ? fmtInputNumber(n) : '';

    // IDR / USD blocks auto-expand when the package already has prices set
    const idrOpen = pkg?.price_value_idr != null;
    const usdOpen = pkg?.price_value_usd != null;

    const chevronSVG = `<svg class="price-block__chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"/></svg>`;

    return `
      <div class="form-tab-panel" id="panel-pricing" role="tabpanel" aria-labelledby="tab-pricing" data-panel="pricing">
        <div class="form-section-title">Pricing</div>

        <div class="form-group" style="max-width:260px">
          <label class="form-label">Price Type <span style="color:var(--error)">*</span></label>
          <select class="form-select" id="priceType" required>
            ${Object.entries(PRICE_TYPE_LABELS).map(([v, l]) => `<option value="${v}" ${(pkg?.price_type ?? 'starting_from') === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          <p class="form-note">Label shown before the price (e.g. "Starting From 3,500 SAR").</p>
        </div>

        <div class="form-section-title" style="margin-top:var(--sp-5)">Price by Currency</div>
        <p class="form-note" style="margin-bottom:var(--sp-4)">
          SAR is required. IDR and USD are optional — click to expand and add prices for visitors who switch their currency.
        </p>

        <!-- ── SAR (always visible, required) ── -->
        <div class="price-block price-block--sar">
          <div class="price-block__header price-block__header--static">
            <span class="price-block__flag">🇸🇦</span>
            <span class="price-block__name">SAR — Saudi Riyal <span style="color:var(--error)">*</span></span>
            <span id="sarDiscountBadge" class="badge badge--discount" style="display:none;margin-right:auto;margin-left:var(--sp-3)"></span>
          </div>
          <div class="price-block__body">
            <div class="field-row">
              <div class="form-group">
                <label class="form-label">Price</label>
                <input class="form-input" type="text" inputmode="decimal" id="priceValueSAR"
                       value="${fv(pkg?.price_value)}" placeholder="3,500" required>
              </div>
              <div class="form-group">
                <label class="form-label form-label--optional">Original Price <span style="font-size:var(--text-xs);color:var(--text-muted)">(crossed-out)</span></label>
                <input class="form-input" type="text" inputmode="decimal" id="originalPriceValue"
                       value="${fv(pkg?.original_price_value)}" placeholder="Leave blank if no discount">
              </div>
            </div>
            <p class="form-note">Original price must be greater than the sale price if set.</p>
          </div>
        </div>

        <!-- ── IDR (collapsible) ── -->
        <div class="price-block ${idrOpen ? 'is-open' : ''}" id="priceBlockIDR">
          <button class="price-block__header" type="button" data-toggle="priceBlockIDR" aria-expanded="${idrOpen}">
            <span class="price-block__flag">🇮🇩</span>
            <span class="price-block__name">IDR — Indonesian Rupiah</span>
            <span class="price-block__status">${idrOpen ? fv(pkg.price_value_idr) + ' IDR' : 'Not set'}</span>
            ${chevronSVG}
          </button>
          <div class="price-block__body">
            <div class="price-block__body-inner">
              <div class="field-row">
                <div class="form-group">
                  <label class="form-label form-label--optional">IDR Price</label>
                  <input class="form-input" type="text" inputmode="decimal" id="priceValueIDR"
                         value="${fv(pkg?.price_value_idr)}" placeholder="14,000,000">
                </div>
                <div class="form-group">
                  <label class="form-label form-label--optional">Original IDR Price <span style="font-size:var(--text-xs);color:var(--text-muted)">(crossed-out)</span></label>
                  <input class="form-input" type="text" inputmode="decimal" id="originalPriceValueIDR"
                         value="${fv(pkg?.original_price_value_idr)}" placeholder="Leave blank if no discount">
                </div>
              </div>
              <p class="form-note">Shown when a visitor switches to IDR on the website.</p>
            </div>
          </div>
        </div>

        <!-- ── USD (collapsible) ── -->
        <div class="price-block ${usdOpen ? 'is-open' : ''}" id="priceBlockUSD">
          <button class="price-block__header" type="button" data-toggle="priceBlockUSD" aria-expanded="${usdOpen}">
            <span class="price-block__flag">🇺🇸</span>
            <span class="price-block__name">USD — US Dollar</span>
            <span class="price-block__status">${usdOpen ? fv(pkg.price_value_usd) + ' USD' : 'Not set'}</span>
            ${chevronSVG}
          </button>
          <div class="price-block__body">
            <div class="price-block__body-inner">
              <div class="field-row">
                <div class="form-group">
                  <label class="form-label form-label--optional">USD Price</label>
                  <input class="form-input" type="text" inputmode="decimal" id="priceValueUSD"
                         value="${fv(pkg?.price_value_usd)}" placeholder="950">
                </div>
                <div class="form-group">
                  <label class="form-label form-label--optional">Original USD Price <span style="font-size:var(--text-xs);color:var(--text-muted)">(crossed-out)</span></label>
                  <input class="form-input" type="text" inputmode="decimal" id="originalPriceValueUSD"
                         value="${fv(pkg?.original_price_value_usd)}" placeholder="Leave blank if no discount">
                </div>
              </div>
              <p class="form-note">Shown when a visitor switches to USD on the website.</p>
            </div>
          </div>
        </div>

      </div>`;
  },

  // Set initial body heights: 0 for collapsed blocks, auto for open ones.
  _bindPriceBlockToggles() {
    document.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const block = document.getElementById(btn.dataset.toggle);
        const status = block?.querySelector('.price-block__status');
        const currency = btn.dataset.toggle === 'priceBlockIDR' ? 'IDR' : 'USD';
        if (!block) return;

        const opening = !block.classList.contains('is-open');
        block.classList.toggle('is-open', opening);
        btn.setAttribute('aria-expanded', String(opening));

        if (opening) {
          // Bind comma formatting and focus the main price input
          bindPriceInput(`priceValue${currency}`);
          bindPriceInput(`originalPriceValue${currency}`);
          document.getElementById(`priceValue${currency}`)?.focus();
        } else {
          // Update the status chip to reflect the last entered value
          const val = document.getElementById(`priceValue${currency}`)?.value?.trim();
          if (status) status.textContent = val ? `${val} ${currency}` : 'Not set';
        }
      });
    });
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
    if (tabId === 'media') ImageManager.render();
    if (tabId === 'includes') InclusionsBuilder.render();
    if (tabId === 'pricing') {
      ['priceValueSAR', 'priceValueIDR', 'priceValueUSD', 'originalPriceValue']
        .forEach(id => bindPriceInput(id));
    }
  },

  populateForm() {
    if (!this.pkg) return;
    // Refresh char counter displays only — listeners are already attached in _bindFormEvents.
    // Calling _updateCharCount here again would add duplicate input listeners.
    [
      ['shortDescEn', 'shortDescEnCount', 300], ['shortDescAr', 'shortDescArCount', 300],
    ].forEach(([inputId, countId, max]) => {
      const input = document.getElementById(inputId);
      const counter = document.getElementById(countId);
      if (!input || !counter) return;
      const len = input.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.className = 'form-char-count' + (len > max * 0.9 ? (len >= max ? ' is-error' : ' is-warning') : '');
    });
    // Sync primary destination radio disabled states
    this._syncDestChecks();
  },

  _syncDestChecks() { /* no-op — primary destination removed */ },

  _updateCharCount(inputId, countId, max) {
    const input = document.getElementById(inputId);
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
      App.navigateTo('packages');
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
      const idx = tabs.findIndex(t => t.dataset.tab === this._activeTab);
      let next = -1;
      if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      this._switchTab(tabs[next].dataset.tab);
      tabs[next].focus();
    });

    // Dirty tracking on title inputs
    document.getElementById('titleEn')?.addEventListener('input', () => { this._dirty = true; });
    document.getElementById('titleAr')?.addEventListener('input', () => { this._dirty = true; });

    // Destination change → mark dirty
    document.getElementById('destSelector')?.addEventListener('change', () => {
      this._dirty = true;
    });

    // Clicking anywhere on a dest-selector__item toggles its checkbox
    document.getElementById('destSelector')?.addEventListener('click', (e) => {
      const item = e.target.closest('.dest-selector__item');
      if (!item) return;
      // Let native checkbox/label behaviour handle itself — only intercept clicks on the rest of the row
      if (e.target.closest('input') || e.target.closest('label')) return;
      const chk = item.querySelector('input[name="dest_check"]');
      if (chk) {
        chk.checked = !chk.checked;
        chk.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Duration nights → auto-calculate days (nights + 1)
    document.getElementById('durationNights')?.addEventListener('input', (e) => {
      const nights = parseInt(e.target.value, 10);
      const daysEl = document.getElementById('durationDays');
      if (daysEl && !isNaN(nights) && nights >= 0) daysEl.value = nights + 1;
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

    // Inclusions: add custom item
    document.getElementById('addIncludedBtn')?.addEventListener('click', () => InclusionsBuilder.addCustom());

    // Char counters
    [['shortDescEn', 'shortDescEnCount', 300], ['shortDescAr', 'shortDescArCount', 300],
    ].forEach(([id, cid, max]) => this._updateCharCount(id, cid, max));

    // Comma formatting for price inputs (runs after the pricing tab is rendered)
    ['priceValueSAR', 'originalPriceValue', 'priceValueIDR', 'originalPriceValueIDR', 'priceValueUSD', 'originalPriceValueUSD']
      .forEach(id => bindPriceInput(id));
    this._bindPriceBlockToggles();

    // SAR discount badge — auto-calculate when price or original price changes
    const _updateSarBadge = () => {
      const badge = document.getElementById('sarDiscountBadge');
      if (!badge) return;
      const price = parsePriceInput('priceValueSAR');
      const orig = parsePriceInput('originalPriceValue');
      if (price && orig && orig > price) {
        const pct = Math.round((1 - price / orig) * 100);
        badge.textContent = `-${pct}%`;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    };
    document.getElementById('priceValueSAR')?.addEventListener('input', _updateSarBadge);
    document.getElementById('originalPriceValue')?.addEventListener('input', _updateSarBadge);
    _updateSarBadge();
  },

  validate() {
    const errors = [];
    const v = (id) => document.getElementById(id)?.value?.trim() ?? '';

    if (!v('titleEn')) errors.push({ tab: 'basic', msg: 'English title is required.' });
    if (!v('titleAr')) errors.push({ tab: 'basic', msg: 'Arabic title is required.' });
    if (!v('category')) errors.push({ tab: 'basic', msg: 'Category is required.' });
    if (!v('durationNights') && v('durationNights') !== '0') errors.push({ tab: 'basic', msg: 'Duration nights is required.' });

    const checkedDests = document.querySelectorAll('#destSelector input[name="dest_check"]:checked');
    if (!checkedDests.length) errors.push({ tab: 'basic', msg: 'Select at least one destination.' });

    const price = parsePriceInput('priceValueSAR');
    const orig = parsePriceInput('originalPriceValue');
    const priceIDR = parsePriceInput('priceValueIDR');
    const origIDR = parsePriceInput('originalPriceValueIDR');
    const priceUSD = parsePriceInput('priceValueUSD');
    const origUSD = parsePriceInput('originalPriceValueUSD');

    if (!price) errors.push({ tab: 'pricing', msg: 'SAR price is required.' });
    if (price && orig && orig <= price)
      errors.push({ tab: 'pricing', msg: 'Original SAR price must be greater than the sale price.' });
    if (origIDR && priceIDR && origIDR <= priceIDR)
      errors.push({ tab: 'pricing', msg: 'Original IDR price must be greater than the IDR sale price.' });
    if (!priceIDR && origIDR)
      errors.push({ tab: 'pricing', msg: 'Set an IDR sale price before adding an original IDR price.' });
    if (origUSD && priceUSD && origUSD <= priceUSD)
      errors.push({ tab: 'pricing', msg: 'Original USD price must be greater than the USD sale price.' });
    if (!priceUSD && origUSD)
      errors.push({ tab: 'pricing', msg: 'Set a USD sale price before adding an original USD price.' });

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

    // Declared OUTSIDE the try block so the catch block can reference them
    // for rollback. (let inside try{} is block-scoped and invisible to catch{})
    let packageId = this.packageId;
    let isNewPackage = false;

    try {
      // Build destinations array
      const destRows = [];
      document.querySelectorAll('#destSelector input[name="dest_check"]:checked').forEach((chk, i) => {
        destRows.push({ destination_id: chk.value, display_order: i });
      });

      // Slug: keep existing on edit; auto-generate from title on create
      const slugEn = (this.mode === 'edit' && this.pkg?.slug_en)
        ? this.pkg.slug_en
        : slugify(v('titleEn'));
      const slugAr = (this.mode === 'edit' && this.pkg?.slug_ar)
        ? this.pkg.slug_ar
        : slugEn + '-ar';

      // Check slug_en uniqueness (only matters on create; edit keeps the same slug)
      if (this.mode === 'create') {
        const slugOk = await DB.checkSlugAvailable(slugEn, this.packageId).catch(() => true);
        if (!slugOk) {
          Toast.error('Slug conflict', `A package with the slug "${slugEn}" already exists. Try a different title.`);
          saveBtn.classList.remove('btn--loading');
          saveBtn.disabled = false;
          return;
        }
      }

      // Collect image alt texts before upload
      ImageManager.collectFromDOM();

      // Upload new images
      await ImageManager.uploadNew(slugEn);

      // Delete removed images from storage
      await ImageManager.deleteRemoved();

      const titleEn = v('titleEn');
      const titleAr = v('titleAr');
      const shortDescEn = v('shortDescEn');
      const shortDescAr = v('shortDescAr');

      const packageData = {
        slug_en: slugEn,
        slug_ar: slugAr,
        title_en: titleEn,
        title_ar: titleAr,
        short_description_en: shortDescEn || null,
        short_description_ar: shortDescAr || null,
        full_description_en: v('fullDescEn') || null,
        full_description_ar: v('fullDescAr') || null,
        duration_nights: parseInt(v('durationNights'), 10),
        duration_days: parseInt(v('durationDays'), 10),
        category: v('category'),
        price_type: v('priceType') || 'starting_from',
        price_value: parsePriceInput('priceValueSAR') ?? 0,
        original_price_value: parsePriceInput('originalPriceValue'),
        price_value_idr: parsePriceInput('priceValueIDR'),
        original_price_value_idr: parsePriceInput('originalPriceValueIDR'),
        price_value_usd: parsePriceInput('priceValueUSD'),
        original_price_value_usd: parsePriceInput('originalPriceValueUSD'),
        currency: 'SAR',
        is_active: document.getElementById('isActive')?.checked ?? true,
        is_featured: document.getElementById('isFeatured')?.checked ?? false,
        display_order: parseInt(v('displayOrder'), 10) || 0,
        hero_image_url: ImageManager.heroUrl(),
        // SEO auto-generated from package content — no manual SEO tab needed
        seo_title_en: titleEn.slice(0, 70) || null,
        seo_title_ar: titleAr.slice(0, 70) || null,
        seo_description_en: (shortDescEn || v('fullDescEn')).slice(0, 170) || null,
        seo_description_ar: (shortDescAr || v('fullDescAr')).slice(0, 170) || null,
        seo_keywords: [],
      };

      if (this.mode === 'create') {
        const result = await DB.createPackage(packageData);
        packageId = result.id;
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

      this._dirty = false;
      Toast.success(
        this.mode === 'create' ? 'Package created!' : 'Changes saved!',
        `"${packageData.title_en}" has been ${this.mode === 'create' ? 'created' : 'updated'} successfully.`
      );

      App.navigateTo('packages');  // restores topbar + loads list

    } catch (err) {
      // Best-effort rollback: if we created a new package but subsequent operations failed,
      // delete the orphaned package record so the admin can retry cleanly.
      if (isNewPackage && packageId) {
        DB.deletePackage(packageId).catch(() => { });
      }
      // Clean up any images that were already uploaded to Storage this session
      // but whose DB records were never committed.
      const orphanedPaths = ImageManager.items
        .filter(x => x.status === 'saved')
        .map(x => x.url)
        .filter(Boolean);
      if (orphanedPaths.length) {
        StorageManager.remove(orphanedPaths).catch(() => { });
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
   13. TESTIMONIALS LIST
   ============================================================ */
const TestimonialsList = {
  all: [],
  destinations: [],
  filtered: [],

  async load() {
    const el = document.getElementById('testimonialsList');
    if (!el) return;
    try {
      [this.all, this.destinations] = await Promise.all([
        DB.getTestimonials(),
        DB.getDestinations(),
      ]);
      this.filtered = [...this.all];
      this.renderStats();
      this.renderList();
    } catch (err) {
      el.innerHTML = `
        <div class="load-error">
          <div class="load-error__title">Failed to load testimonials</div>
          <div class="load-error__body">${escHtml(err.message)}</div>
        </div>`;
      if (err.message.includes('configured')) {
        document.getElementById('testiStatsRow').innerHTML =
          '<p style="color:var(--warning);font-size:var(--text-sm);font-weight:600">⚠️ Supabase not configured — add credentials to Config in dashboard.js</p>';
      }
    }
  },

  renderStats() {
    const total = this.all.length;
    const approved = this.all.filter(t => t.is_approved).length;
    const replied = this.all.filter(t => t.reply_ar || t.reply_en).length;
    document.getElementById('testiStatsRow').innerHTML = `
      <div class="stat-card stat-card--navy">
        <div class="stat-card__label">Total Reviews</div>
        <div class="stat-card__value">${total}</div>
      </div>
      <div class="stat-card stat-card--success">
        <div class="stat-card__label">Approved</div>
        <div class="stat-card__value">${approved}</div>
        <div class="stat-card__sub">${total - approved} pending</div>
      </div>
      <div class="stat-card stat-card--accent">
        <div class="stat-card__label">With Reply</div>
        <div class="stat-card__value">${replied}</div>
        <div class="stat-card__sub">Company replies added</div>
      </div>`;
  },

  applyFilters() {
    const search = (document.getElementById('testiSearch')?.value ?? '').toLowerCase().trim();
    const status = document.getElementById('testiFilterStatus')?.value ?? '';
    const category = document.getElementById('testiFilterCategory')?.value ?? '';

    this.filtered = this.all.filter(t => {
      if (search && !(
        t.reviewer_name_display?.toLowerCase().includes(search) ||
        t.reviewer_city?.toLowerCase().includes(search) ||
        t.review_ar?.includes(search) ||
        t.review_en?.toLowerCase().includes(search)
      )) return false;
      if (status === 'approved' && !t.is_approved) return false;
      if (status === 'unapproved' && t.is_approved) return false;
      if (status === 'replied' && !t.reply_ar && !t.reply_en) return false;
      if (category && t.trip_category !== category) return false;
      return true;
    });
    this.renderList();
  },

  renderList() {
    const el = document.getElementById('testimonialsList');
    if (!el) return;

    if (!this.filtered.length) {
      el.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">💬</div>
          <div class="empty-state__title">${this.all.length ? 'No testimonials match your filters' : 'No testimonials yet'}</div>
          <div class="empty-state__body">${this.all.length ? 'Try adjusting your filters.' : 'Add your first testimonial to get started.'}</div>
        </div>`;
      return;
    }

    el.innerHTML = this.filtered.map(t => {
      const filled = '★'.repeat(Math.max(0, Math.min(5, t.rating ?? 5)));
      const empty = '☆'.repeat(5 - Math.max(0, Math.min(5, t.rating ?? 5)));
      const excerpt = (t.review_ar ?? '').slice(0, 90) + ((t.review_ar ?? '').length > 90 ? '…' : '');
      const catLabel = CATEGORY_LABELS[t.trip_category] ?? '';
      const cityAr = CITY_MAP[t.reviewer_city] ?? t.reviewer_city ?? '';
      const hasReply = !!(t.reply_ar || t.reply_en);

      return `
        <div class="testi-row" role="listitem" data-id="${escHtml(t.id)}">
          <div class="testi-row__stars" aria-label="${t.rating ?? 5} out of 5 stars">${filled}${empty}</div>

          <div class="testi-row__info">
            <div class="testi-row__name">${escHtml(t.reviewer_name_display)} ${escHtml(t.reviewer_flag ?? '🇸🇦')}</div>
            <div class="testi-row__meta">
              ${t.reviewer_city ? `<span title="${escHtml(cityAr)}">${escHtml(t.reviewer_city)}</span>` : ''}
              ${catLabel ? `<span class="badge badge--${t.trip_category}">${catLabel}</span>` : ''}
              ${t.trip_year ? `<span>${t.trip_year}</span>` : ''}
            </div>
            <div class="testi-row__excerpt" dir="rtl">${escHtml(excerpt)}</div>
          </div>

          <div class="testi-row__badges">
            <span class="badge badge--${t.is_approved ? 'active' : 'inactive'}">${t.is_approved ? 'Approved' : 'Pending'}</span>
            ${hasReply ? '<span class="testi-reply-badge">💬 Reply</span>' : ''}
          </div>

          <div class="testi-row__actions">
            <button class="btn btn--icon" data-action="edit" data-id="${escHtml(t.id)}"
                    aria-label="Edit review by ${escHtml(t.reviewer_name_display)}" title="Edit" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn--icon btn--danger-ghost" data-action="delete" data-id="${escHtml(t.id)}"
                    data-name="${escHtml(t.reviewer_name_display)}"
                    aria-label="Delete review by ${escHtml(t.reviewer_name_display)}" title="Delete" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => TestimonialForm.open('edit', btn.dataset.id));
    });
    el.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => TestimonialsList.deleteTestimonial(btn.dataset.id, btn.dataset.name));
    });
  },

  async deleteTestimonial(id, name) {
    const confirmed = await Modal.confirm(
      'Delete Testimonial',
      `Are you sure you want to delete the review by "${name}"? This action cannot be undone.`,
      'Delete'
    );
    if (!confirmed) return;
    try {
      await DB.deleteTestimonial(id);
      Toast.success('Testimonial deleted', `Review by "${name}" has been permanently removed.`);
      await this.load();
    } catch (err) {
      Toast.error('Delete failed', err.message);
    }
  },

  bindControls() {
    document.getElementById('testiSearch')
      ?.addEventListener('input', debounce(() => this.applyFilters(), 250));
    document.getElementById('testiFilterStatus')
      ?.addEventListener('change', () => this.applyFilters());
    document.getElementById('testiFilterCategory')
      ?.addEventListener('change', () => this.applyFilters());
  },
};

/* ============================================================
   14. TESTIMONIAL FORM
   ============================================================ */
const TestimonialForm = {
  mode: null,
  testimonialId: null,
  testi: null,
  destinations: [],
  _dirty: false,
  _rating: 5,

  async open(mode, id = null) {
    this.mode = mode;
    this.testimonialId = id;
    this.testi = null;
    this._dirty = false;
    this._rating = 5;

    App.showView('testimonialForm');
    document.getElementById('topbarTitle').textContent = mode === 'create' ? 'New Testimonial' : 'Edit Testimonial';
    document.getElementById('topbarActions').innerHTML = '';

    // Render empty shell immediately for responsiveness
    this.render();

    if (mode === 'edit' && id) {
      try {
        this.testi = await DB.getTestimonial(id);
        this._rating = this.testi.rating ?? 5;
        this.render();  // re-render with data
      } catch (err) {
        Toast.error('Load failed', err.message);
      }
    }
  },

  render() {
    const t = this.testi;
    const isEdit = this.mode === 'edit';
    const dest = document.getElementById('testimonialFormContainer');
    if (!dest) return;

    const NOW_YEAR = new Date().getFullYear();

    // Star buttons — rendered left-to-right (1→5) for simplicity
    const starsHTML = [1, 2, 3, 4, 5].map(n => `
      <button class="star-btn ${this._rating >= n ? 'is-active' : ''}"
              data-star="${n}" type="button" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`
    ).join('');

    dest.innerHTML = `
      <div class="form-shell">

        <!-- ── Header ──────────────────────────────────────── -->
        <div class="form-header">
          <div class="form-header__left">
            <div class="form-header__title">${isEdit ? 'Edit Testimonial' : 'Add New Testimonial'}</div>
            <div class="form-header__subtitle">${isEdit ? 'Editing review by ' + escHtml(t?.reviewer_name_display ?? '—') : 'Fill in the review details below'}</div>
          </div>
          <div class="form-header__actions">
            <button class="btn btn--icon btn--danger-ghost" id="testiCancelBtn" type="button" aria-label="Cancel">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button class="btn btn--primary" id="testiSaveBtn" type="button" aria-label="${isEdit ? 'Save Changes' : 'Add Testimonial'}">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span class="btn-label">${isEdit ? 'Save Changes' : 'Add Testimonial'}</span>
            </button>
          </div>
        </div>

        <div class="testi-form-body">

          <!-- ── 1. Reviewer Info ─────────────────────────── -->
          <div class="testi-section">
            <div class="form-section-title">Reviewer Information</div>
            <div class="field-row">
              <div class="form-group">
                <label class="form-label">Reviewer Name <span style="color:var(--error)">*</span></label>
                <input class="form-input" type="text" id="testiName"
                       value="${escHtml(t?.reviewer_name_display ?? '')}"
                       placeholder="e.g. Ahmed Al-Rashidi" maxlength="80">
                <p class="form-note">Displayed publicly on the website.</p>
              </div>
              <div class="form-group">
                <label class="form-label form-label--optional">City</label>
                <input class="form-input" type="text" id="testiCity" list="cityList"
                       value="${escHtml(t?.reviewer_city ?? '')}" placeholder="e.g. Riyadh" maxlength="60"
                       autocomplete="off">
                <datalist id="cityList">
                  ${Object.keys(CITY_MAP).map(c => `<option value="${escHtml(c)}">`).join('')}
                </datalist>
                <p class="form-note">Pick from the list — Arabic translation applied automatically on the website.</p>
              </div>
            </div>
            <div class="field-row">
              <div class="form-group">
                <label class="form-label form-label--optional">Country Flag</label>
                <select class="form-select" id="testiFlag">
                  ${[['🇸🇦', 'Saudi Arabia'], ['🇦🇪', 'UAE'], ['🇶🇦', 'Qatar'],
      ['🇰🇼', 'Kuwait'], ['🇧🇭', 'Bahrain'], ['🇴🇲', 'Oman'],
      ['🇯🇴', 'Jordan'], ['🇪🇬', 'Egypt'], ['🇮🇶', 'Iraq']
      ].map(([flag, label]) =>
        `<option value="${flag}" ${(t?.reviewer_flag ?? '🇸🇦') === flag ? 'selected' : ''}>${flag} ${label}</option>`
      ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Rating <span style="color:var(--error)">*</span></label>
                <div class="star-selector" id="starSelector" role="group" aria-label="Select star rating">
                  ${starsHTML}
                  <span class="star-selector__label" id="starLabel">${this._rating} / 5</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── 2. Review Content ────────────────────────── -->
          <div class="testi-section">
            <div class="form-section-title">Review Content</div>
            <div class="form-bilingual">
              <div class="form-group">
                <label class="form-label"><span class="lang-chip lang-chip--ar">AR</span> Arabic Review <span style="color:var(--error)">*</span></label>
                <textarea class="form-textarea" id="testiReviewAr" dir="rtl" rows="5" maxlength="600"
                          placeholder="أكتب تجربتك بالتفصيل…"
                          style="font-family:var(--font-arabic)">${escHtml(t?.review_ar ?? '')}</textarea>
                <div class="form-char-count" id="testiReviewArCount">0 / 600</div>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <span class="lang-chip lang-chip--en">EN</span> English Review
                  <span style="font-size:var(--text-xs);color:var(--text-light);font-weight:400">(Optional)</span>
                </label>
                <textarea class="form-textarea" id="testiReviewEn" rows="5" maxlength="600"
                          placeholder="Write the experience in English…">${escHtml(t?.review_en ?? '')}</textarea>
                <div class="form-char-count" id="testiReviewEnCount">0 / 600</div>
              </div>
            </div>
          </div>

          <!-- ── 3. Trip Details ──────────────────────────── -->
          <div class="testi-section">
            <div class="form-section-title">
              Trip Details
              <span style="font-size:var(--text-xs);font-weight:400;color:var(--text-light)">(Optional — shown under reviewer name on the site)</span>
            </div>
            <div class="field-row">
              <div class="form-group">
                <label class="form-label form-label--optional">Category</label>
                <select class="form-select" id="testiCategory">
                  <option value="">— None —</option>
                  ${Object.entries(CATEGORY_LABELS).map(([v, l]) =>
        `<option value="${v}" ${t?.trip_category === v ? 'selected' : ''}>${l}</option>`
      ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label form-label--optional">Trip Month &amp; Year</label>
                <div style="display:flex;gap:var(--sp-2)">
                  <select class="form-select" id="testiTripMonth">
                    <option value="">— Month —</option>
                    ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        .map((m, i) => `<option value="${i + 1}" ${t?.trip_month === i + 1 ? 'selected' : ''}>${m}</option>`).join('')}
                  </select>
                  <select class="form-select" id="testiTripYear">
                    <option value="">— Year —</option>
                    ${Array.from({ length: NOW_YEAR - 2015 + 1 }, (_, i) => NOW_YEAR - i)
        .map(y => `<option value="${y}" ${t?.trip_year === y ? 'selected' : ''}>${y}</option>`).join('')}
                  </select>
                </div>
                <p class="form-note">Select the month and year of the trip.</p>
              </div>
            </div>
          </div>

          <!-- ── 4. Visibility Settings ───────────────────── -->
          <div class="testi-section">
            <div class="form-section-title">Visibility Settings</div>
            <div class="toggle-group">
              <label class="toggle-label" for="testiApproved">Approved</label>
              <label class="toggle-switch">
                <input type="checkbox" id="testiApproved" ${(t?.is_approved ?? false) ? 'checked' : ''}>
                <span class="toggle-switch__track"></span>
              </label>
              <span style="font-size:var(--text-xs);color:var(--text-muted)">Visible on public site when checked</span>
            </div>
            <div class="form-group" style="margin-top:var(--sp-4)">
              <label class="form-label form-label--optional">Display Order</label>
              <input class="form-input" type="number" id="testiOrder" min="0"
                     value="${t?.display_order ?? 0}" style="max-width:120px">
              <p class="form-note">Lower numbers appear first in the website section.</p>
            </div>
          </div>

          <!-- ── 5. Company Reply (optional) ─────────────── -->
          <div class="testi-section testi-section--reply">
            <div class="testi-reply-header">
              <div>
                <div class="form-section-title" style="margin-bottom:4px">Company Reply</div>
                <p class="form-note" style="margin:0">
                  Optionally add a reply from the Luxpath team — shows customers the company cares about their experience.
                </p>
              </div>
              <label class="toggle-switch" title="Enable company reply" style="flex-shrink:0">
                <input type="checkbox" id="testiHasReply"
                       ${(t?.reply_ar || t?.reply_en) ? 'checked' : ''}>
                <span class="toggle-switch__track"></span>
              </label>
            </div>

            <div class="testi-reply-fields" id="testiReplyFields"
                 ${(t?.reply_ar || t?.reply_en) ? '' : 'hidden'}>
              <div class="testi-reply-author">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Reply will appear as: <strong>Luxpath Travel Team</strong>
              </div>
              <div class="form-bilingual">
                <div class="form-group">
                  <label class="form-label"><span class="lang-chip lang-chip--ar">AR</span> Arabic Reply</label>
                  <textarea class="form-textarea" id="testiReplyAr" dir="rtl" rows="3" maxlength="400"
                            placeholder="شكراً جزيلاً على مشاركتك تجربتك الرائعة معنا…"
                            style="font-family:var(--font-arabic)">${escHtml(t?.reply_ar ?? '')}</textarea>
                  <div class="form-char-count" id="testiReplyArCount">0 / 400</div>
                </div>
                <div class="form-group">
                  <label class="form-label"><span class="lang-chip lang-chip--en">EN</span> English Reply</label>
                  <textarea class="form-textarea" id="testiReplyEn" rows="3" maxlength="400"
                            placeholder="Thank you so much for sharing your wonderful experience with us…">${escHtml(t?.reply_en ?? '')}</textarea>
                  <div class="form-char-count" id="testiReplyEnCount">0 / 400</div>
                </div>
              </div>
            </div>
          </div>

        </div><!-- /testi-form-body -->
      </div><!-- /form-shell -->`;

    this._bindFormEvents();
  },

  _bindFormEvents() {
    // Cancel
    document.getElementById('testiCancelBtn')?.addEventListener('click', () => {
      if (this._dirty && !confirm('You have unsaved changes. Leave anyway?')) return;
      App.navigateTo('testimonials');
    });

    // Save
    document.getElementById('testiSaveBtn')?.addEventListener('click', () => this.save());

    // Star rating selector
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._rating = parseInt(btn.dataset.star, 10);
        document.querySelectorAll('.star-btn').forEach(b => {
          b.classList.toggle('is-active', parseInt(b.dataset.star, 10) <= this._rating);
        });
        const label = document.getElementById('starLabel');
        if (label) label.textContent = `${this._rating} / 5`;
        this._dirty = true;
      });
    });

    // Reply section toggle
    document.getElementById('testiHasReply')?.addEventListener('change', (e) => {
      const fields = document.getElementById('testiReplyFields');
      if (fields) fields.hidden = !e.target.checked;
    });

    // Dirty tracking
    document.getElementById('testimonialFormContainer')?.addEventListener('input', () => {
      this._dirty = true;
    });

    // Character counters
    [
      ['testiReviewAr', 'testiReviewArCount', 600],
      ['testiReviewEn', 'testiReviewEnCount', 600],
      ['testiReplyAr', 'testiReplyArCount', 400],
      ['testiReplyEn', 'testiReplyEnCount', 400],
    ].forEach(([inputId, countId, max]) => {
      const input = document.getElementById(inputId);
      const counter = document.getElementById(countId);
      if (!input || !counter) return;
      const update = () => {
        const len = input.value.length;
        counter.textContent = `${len} / ${max}`;
        counter.className = 'form-char-count' +
          (len > max * 0.9 ? (len >= max ? ' is-error' : ' is-warning') : '');
      };
      update();
      input.addEventListener('input', update);
    });
  },

  validate() {
    const errors = [];
    const v = (id) => document.getElementById(id)?.value?.trim() ?? '';

    if (!v('testiName')) errors.push('Reviewer name is required.');
    if (!v('testiReviewAr')) errors.push('Arabic review text is required.');
    if (!this._rating) errors.push('Please select a star rating.');

    const tripYear = v('testiTripYear');
    if (tripYear) {
      const yr = parseInt(tripYear, 10);
      const NOW = new Date().getFullYear();
      if (isNaN(yr) || yr < 2015 || yr > NOW) {
        errors.push(`Trip year must be between 2015 and ${NOW}.`);
      }
    }

    const hasReply = document.getElementById('testiHasReply')?.checked;
    if (hasReply && !v('testiReplyAr') && !v('testiReplyEn')) {
      errors.push('Please write the reply text (AR or EN) or turn off the Reply toggle.');
    }

    return errors;
  },

  async save() {
    const errors = this.validate();
    if (errors.length) {
      Toast.error('Validation error', errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} more)` : ''));
      return;
    }

    const saveBtn = document.getElementById('testiSaveBtn');
    saveBtn.classList.add('btn--loading');
    saveBtn.disabled = true;

    const v = (id) => document.getElementById(id)?.value?.trim() ?? '';
    const hasReply = document.getElementById('testiHasReply')?.checked ?? false;

    const trip_year = v('testiTripYear') ? parseInt(v('testiTripYear'), 10) : null;
    const trip_month = v('testiTripMonth') ? parseInt(v('testiTripMonth'), 10) : null;

    const data = {
      reviewer_name_display: v('testiName'),
      reviewer_city: v('testiCity') || null,
      reviewer_flag: v('testiFlag') || '🇸🇦',
      rating: this._rating,
      review_ar: v('testiReviewAr'),
      review_en: v('testiReviewEn') || null,
      trip_category: v('testiCategory') || null,
      trip_month,
      trip_year,
      is_approved: document.getElementById('testiApproved')?.checked ?? false,
      display_order: parseInt(v('testiOrder'), 10) || 0,
      reply_ar: hasReply ? (v('testiReplyAr') || null) : null,
      reply_en: hasReply ? (v('testiReplyEn') || null) : null,
    };

    try {
      if (this.mode === 'create') {
        await DB.createTestimonial(data);
      } else {
        await DB.updateTestimonial(this.testimonialId, data);
      }
      this._dirty = false;
      Toast.success(
        this.mode === 'create' ? 'Testimonial added!' : 'Changes saved!',
        `"${data.reviewer_name_display}" ${this.mode === 'create' ? 'has been added.' : 'updated successfully.'}`
      );
      await TestimonialsList.load();
      App.navigateTo('testimonials');
    } catch (err) {
      Toast.error('Save failed', err.message);
      console.error('[TestimonialForm.save]', err);
    } finally {
      saveBtn.classList.remove('btn--loading');
      saveBtn.disabled = false;
    }
  },
};

/* ============================================================
   15. HERO IMAGES
   ============================================================ */
const HeroImages = {
  _active: [],  // filenames currently marked active

  async load() {
    const container = document.getElementById('heroImagesContainer');
    if (!container) return;

    try {
      const raw = await DB.getHeroImagesSetting();
      // Default: all images are active if no setting is saved yet
      this._active = raw ? JSON.parse(raw) : HERO_IMAGES.map(h => h.file);
    } catch (_) {
      this._active = HERO_IMAGES.map(h => h.file);
    }

    this.render();
  },

  render() {
    const container = document.getElementById('heroImagesContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="hero-img-shell">

        <div class="hero-img-shell__header">
          <div>
            <h2 class="hero-img-shell__title">Homepage Hero Images</h2>
            <p class="hero-img-shell__desc">
              Toggle which images appear in the homepage slideshow.
              Images cycle in the order listed below.
              To add new images, upload a <code>.webp</code> file to the
              <code>hero-images/</code> folder and add its name to
              <code>HERO_IMAGES</code> in <code>dashboard.js</code>.
            </p>
          </div>
          <button class="btn btn--primary" id="heroSaveBtn" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save Changes
          </button>
        </div>

        <div class="hero-img-grid" id="heroImgGrid">
          ${HERO_IMAGES.map(img => {
      const isActive = this._active.includes(img.file);
      return `
              <div class="hero-img-card ${isActive ? 'is-active' : ''}" data-file="${escHtml(img.file)}">
                <div class="hero-img-card__thumb-wrap">
                  <img class="hero-img-card__thumb"
                       src="hero-images/${escHtml(img.file)}"
                       alt="${escHtml(img.label)}"
                       loading="lazy">
                  <div class="hero-img-card__badge ${isActive ? 'hero-img-card__badge--on' : 'hero-img-card__badge--off'}">
                    ${isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div class="hero-img-card__body">
                  <span class="hero-img-card__label">${escHtml(img.label)}</span>
                  <label class="toggle-switch" title="Toggle image">
                    <input type="checkbox" class="hero-img-toggle"
                           data-file="${escHtml(img.file)}"
                           ${isActive ? 'checked' : ''}>
                    <span class="toggle-switch__track"></span>
                  </label>
                </div>
              </div>`;
    }).join('')}
        </div>

      </div>`;

    this._bindEvents();
  },

  _bindEvents() {
    // Toggle card active state live
    document.querySelectorAll('.hero-img-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const card = chk.closest('.hero-img-card');
        const badge = card.querySelector('.hero-img-card__badge');
        const on = chk.checked;
        card.classList.toggle('is-active', on);
        badge.textContent = on ? 'Active' : 'Inactive';
        badge.className = `hero-img-card__badge ${on ? 'hero-img-card__badge--on' : 'hero-img-card__badge--off'}`;
      });
    });

    // Save
    document.getElementById('heroSaveBtn')?.addEventListener('click', () => this.save());
  },

  async save() {
    const saveBtn = document.getElementById('heroSaveBtn');
    saveBtn.classList.add('btn--loading');
    saveBtn.disabled = true;

    // Collect enabled files in HERO_IMAGES order
    const activeFiles = HERO_IMAGES
      .map(h => h.file)
      .filter(file => {
        const chk = document.querySelector(`.hero-img-toggle[data-file="${CSS.escape(file)}"]`);
        return chk?.checked ?? false;
      });

    if (!activeFiles.length) {
      Toast.warning('Nothing selected', 'At least one image must be active. Please enable at least one image.');
      saveBtn.classList.remove('btn--loading');
      saveBtn.disabled = false;
      return;
    }

    try {
      await DB.saveHeroImagesSetting(activeFiles);
      this._active = activeFiles;
      Toast.success('Saved!', `${activeFiles.length} image${activeFiles.length > 1 ? 's' : ''} will now appear in the homepage slideshow.`);
    } catch (err) {
      Toast.error('Save failed', err.message);
    } finally {
      saveBtn.classList.remove('btn--loading');
      saveBtn.disabled = false;
    }
  },
};

/* ============================================================
   16. APP — ORCHESTRATION
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

    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

    try {
      const authed = await Auth.init();
      if (!authed) return;
      this.showDashboard();
    } catch (err) {
      // Any uncaught error (network failure, CDN unavailable, etc.)
      // redirects to login instead of leaving the spinner stuck forever.
      // On localhost we skip the redirect so we don't get "Cannot GET /login".
      console.error('[Dashboard] Auth init error:', err);
      if (!isLocal) window.location.replace(Config.LOGIN_URL);
    }
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
    DashLightbox.init();
    Sidebar.init();
    PackageList.bindControls();
    TestimonialsList.bindControls();

    // Populate sidebar user info
    this._renderUserInfo();

    // Warn before leaving with unsaved form changes
    window.addEventListener('beforeunload', (e) => {
      if (PackageForm._dirty || TestimonialForm._dirty) { e.preventDefault(); e.returnValue = ''; }
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
        <button class="btn btn--primary" id="newPackageBtn" aria-label="New Package">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span class="btn-label">New Package</span>
        </button>`;
      document.getElementById('newPackageBtn')
        .addEventListener('click', () => PackageForm.open('create'));
      PackageList.load();

    } else if (view === 'testimonials') {
      this.showView('testimonials');
      document.getElementById('topbarTitle').textContent = 'Testimonials';
      document.getElementById('topbarActions').innerHTML = `
        <button class="btn btn--primary" id="newTestiBtn" aria-label="Add Testimonial">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span class="btn-label">Add Testimonial</span>
        </button>`;
      document.getElementById('newTestiBtn')
        .addEventListener('click', () => TestimonialForm.open('create'));
      TestimonialsList.load();

    } else if (view === 'heroImages') {
      this.showView('heroImages');
      document.getElementById('topbarTitle').textContent = 'Website Images';
      document.getElementById('topbarActions').innerHTML = '';
      HeroImages.load();
    }
  },

  showView(view) {
    document.getElementById('viewPackages').hidden = view !== 'packages';
    document.getElementById('viewForm').hidden = view !== 'form';
    document.getElementById('viewTestimonials').hidden = view !== 'testimonials';
    document.getElementById('viewTestimonialForm').hidden = view !== 'testimonialForm';
    document.getElementById('viewHeroImages').hidden = view !== 'heroImages';

    const sidebarActive =
      (view === 'packages' || view === 'form') ? 'packages' :
        (view === 'testimonials' || view === 'testimonialForm') ? 'testimonials' :
          view === 'heroImages' ? 'heroImages' : '';
    Sidebar.setActive(sidebarActive);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

/* ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  App.init().catch(err => {
    console.error('[Dashboard] Fatal startup error:', err);
    if (!isLocal) window.location.replace(Config.LOGIN_URL);
  });
});
