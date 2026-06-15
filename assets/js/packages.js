/* ============================================================
   LUXPATH TRAVEL — PACKAGES LISTING PAGE
   All packages · Category & destination filters · Search
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIG
   ============================================================ */
const Config = Object.freeze({
  SUPABASE_URL:      'https://fgeeysssiesdlryoygoa.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWV5c3NzaWVzZGxyeW95Z29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTI0MzUsImV4cCI6MjA5NTk4ODQzNX0.Sa3vcq9U2BrzFobTqQS4sAmVpXkRH09_PGzol9-NCvw',
  get STORAGE_URL()  { return this.SUPABASE_URL + '/storage/v1/object/public/luxpath-media/'; },
  WHATSAPP_NUMBER:   '+6281111826527',
  LANG_KEY:          'luxpath_lang',
  DEFAULT_LANG:      'ar',
  CURRENCY_KEY:      'luxpath_currency',
  DEFAULT_CURRENCY:  'SAR',
  PLACEHOLDER_IMG:   'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F0EDE8" width="400" height="300"/%3E%3C/svg%3E',
});

/* ============================================================
   2. TRANSLATIONS
   ============================================================ */
const T = {
  ar: {
    'a11y.skip':        'تخطَّ إلى المحتوى',
    'nav.home':         'الرئيسية',
    'nav.destinations': 'الوجهات',
    'nav.packages':     'الباقات',
    'nav.about':        'عن لوكس باث',
    'nav.contact':      'تواصل معنا',
    'nav.whatsapp':     'واتساب',
    'footer.tagline':      'وكالتك المتخصصة لرحلات إندونيسيا من المملكة العربية السعودية',
    'footer.links':        'روابط سريعة',
    'footer.destinations': 'وجهاتنا',
    'footer.contact':      'تواصل معنا',
    'footer.copyright':    `© ${new Date().getFullYear()} لوكس باث للسياحة. جميع الحقوق محفوظة.`,
    'footer.privacy':      'سياسة الخصوصية',
    'dest.bali':    'بالي',
    'dest.jakarta': 'جاكرتا',
    'dest.bandung': 'باندونغ',
    'dest.lombok':  'لومبوك',
    'packages.from':     'يبدأ من',
    'packages.bookNow':  'احجز الآن',
    'packages.nights':   'ليالٍ',
    'packages.days':     'أيام',
    'category.honeymoon': 'شهر العسل',
    'category.family':    'عائلي',
    'category.luxury':    'فاخر',
    'category.adventure': 'مغامرة',
    'price.exact': '', 'price.starting_from': 'يبدأ من', 'price.approximate': 'يقارب',
    'currency.SAR': 'ريال', 'currency.IDR': 'روبية', 'currency.USD': 'دولار', 'currency.EUR': 'يورو',
    'wa.general':  'مرحباً، أود الاستفسار عن باقاتكم السياحية إلى إندونيسيا',
    'wa.package':  'مرحباً، حاب استفسر عن باقة {title}',

    /* Page-specific */
    'pkgs.eyebrow':     'اكتشف وجهتك',
    'pkgs.title':       'جميع الباقات السياحية',
    'pkgs.subtitle':    'تصفح باقاتنا وابحث عن رحلتك المثالية إلى إندونيسيا',
    'pkgs.breadcrumb':  'الباقات',
    'pkgs.filter.all':  'الكل',
    'pkgs.filter.cat':  'الفئة:',
    'pkgs.filter.dest': 'الوجهة:',
    'pkgs.search':      'ابحث عن باقة...',
    'pkgs.count':       'يعرض {n} باقة',
    'pkgs.empty':       'لا توجد باقات مطابقة لبحثك. جرّب تصفية مختلفة أو تواصل معنا.',
    'pkgs.wa':          'تواصل معنا على واتساب',
  },
  en: {
    'a11y.skip':        'Skip to content',
    'nav.home':         'Home',
    'nav.destinations': 'Destinations',
    'nav.packages':     'Packages',
    'nav.about':        'About Us',
    'nav.contact':      'Contact',
    'nav.whatsapp':     'WhatsApp',
    'footer.tagline':      'Your specialist agency for Indonesia travel from Saudi Arabia',
    'footer.links':        'Quick Links',
    'footer.destinations': 'Destinations',
    'footer.contact':      'Contact Us',
    'footer.copyright':    `© ${new Date().getFullYear()} Luxpath Travel. All rights reserved.`,
    'footer.privacy':      'Privacy Policy',
    'dest.bali':    'Bali',
    'dest.jakarta': 'Jakarta',
    'dest.bandung': 'Bandung',
    'dest.lombok':  'Lombok',
    'packages.from':     'From',
    'packages.bookNow':  'Book Now',
    'packages.nights':   'Nights',
    'packages.days':     'Days',
    'category.honeymoon': 'Honeymoon',
    'category.family':    'Family',
    'category.luxury':    'Luxury',
    'category.adventure': 'Adventure',
    'price.exact': '', 'price.starting_from': 'From', 'price.approximate': 'Approx.',
    'currency.SAR': 'SAR', 'currency.IDR': 'IDR', 'currency.USD': 'USD', 'currency.EUR': 'EUR',
    'wa.general':  'Hello, I\'d like to inquire about your Indonesia travel packages',
    'wa.package':  'Hello, I\'m interested in the {title} package',

    /* Page-specific */
    'pkgs.eyebrow':     'Explore & Discover',
    'pkgs.title':       'All Travel Packages',
    'pkgs.subtitle':    'Browse our packages and find your perfect Indonesia trip',
    'pkgs.breadcrumb':  'Packages',
    'pkgs.filter.all':  'All',
    'pkgs.filter.cat':  'Category:',
    'pkgs.filter.dest': 'Destination:',
    'pkgs.search':      'Search packages...',
    'pkgs.count':       'Showing {n} package(s)',
    'pkgs.empty':       'No packages match your search. Try a different filter or contact us.',
    'pkgs.wa':          'Contact us on WhatsApp',
  },
};

/* ============================================================
   3. DB
   ============================================================ */
const DB = (() => {
  const isConfigured = () =>
    Config.SUPABASE_URL.startsWith('https://') && Config.SUPABASE_ANON_KEY.startsWith('eyJ');

  let _client = null;
  const client = () => {
    if (!isConfigured()) return null;
    if (!_client) _client = supabase.createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);
    return _client;
  };

  const q = async (fn) => {
    const db = client();
    if (!db) return null;
    try {
      const { data, error } = await fn(db);
      if (error) { console.warn('[Luxpath DB]', error.message); return null; }
      return data;
    } catch (e) { console.warn('[Luxpath DB]', e.message); return null; }
  };

  return {
    isConfigured,
    getPackages: () => q(db =>
      db.from('packages')
        .select(`
          id, slug_en, slug_ar, title_ar, title_en,
          category, price_type,
          price_value, original_price_value,
          price_value_idr, original_price_value_idr,
          price_value_usd, original_price_value_usd,
          currency, duration_nights, duration_days, hero_image_url,
          is_active, is_featured, display_order,
          package_destinations (
            destination_id,
            destinations ( slug, name_ar, name_en )
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
    ),
    getDestinations: () => q(db =>
      db.from('destinations')
        .select('id, slug, name_ar, name_en')
        .eq('is_active', true)
        .order('display_order')
    ),
  };
})();

/* ============================================================
   4. I18n
   ============================================================ */
const I18n = (() => {
  let lang = Config.DEFAULT_LANG;

  const detect = () => {
    const stored = localStorage.getItem(Config.LANG_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
    return 'ar';
  };

  const applyDOM = () => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const text = T[lang][el.dataset.i18n];
      if (text !== undefined) el.textContent = text;
    });
    document.querySelectorAll('.btn-lang').forEach(btn => {
      btn.textContent = lang === 'ar' ? 'EN' : 'ع';
      btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    });
  };

  return {
    init() {
      lang = detect();
      const _menu = document.getElementById('mobileMenu');
      if (_menu) _menu.style.transition = 'none';
      applyDOM();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (_menu) _menu.style.transition = '';
      }));
    },
    toggle() {
      const b = document.body;
      b.classList.add('lang-switching');
      setTimeout(() => {
        lang = lang === 'ar' ? 'en' : 'ar';
        localStorage.setItem(Config.LANG_KEY, lang);
        applyDOM();
        WA.updateAll();
        if (App.allPackages) PackageList.rerender();
        b.classList.remove('lang-switching');
        b.classList.add('lang-entering');
        setTimeout(() => b.classList.remove('lang-entering'), 350);
      }, 200);
    },
    get:  () => lang,
    t(key, vars = {}) {
      let text = T[lang][key] ?? T[Config.DEFAULT_LANG][key] ?? key;
      Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
      return text;
    },
  };
})();

/* ============================================================
   5. WA
   ============================================================ */
const WA = {
  _number: Config.WHATSAPP_NUMBER,
  url(msg) { return `https://wa.me/${this._number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`; },
  generalUrl() { return this.url(I18n.t('wa.general')); },
  packageUrl(titleAr, titleEn, destNameAr, destNameEn) {
    const title = I18n.get() === 'ar' ? titleAr : titleEn;
    const dest  = I18n.get() === 'ar' ? destNameAr : destNameEn;
    return this.url(I18n.t('wa.package', { title, destination: dest }));
  },
  updateAll() {
    const url = this.generalUrl();
    document.querySelectorAll('[data-wa="general"]').forEach(el => { el.href = url; });
  },
};

/* ============================================================
   6. CURRENCY
   ============================================================ */
const Currency = (() => {
  const ALL = ['SAR', 'IDR', 'USD'];
  let curr = Config.DEFAULT_CURRENCY;

  const applyDOM = () => {
    document.querySelectorAll('.btn-currency').forEach(btn => {
      btn.textContent = curr;
      btn.setAttribute('aria-label', `Currency: ${curr}. Click to switch.`);
    });
  };

  return {
    init() {
      const stored = localStorage.getItem(Config.CURRENCY_KEY);
      if (ALL.includes(stored)) curr = stored;
      applyDOM();
    },
    get() { return curr; },
    cycle() {
      curr = ALL[(ALL.indexOf(curr) + 1) % ALL.length];
      localStorage.setItem(Config.CURRENCY_KEY, curr);
      applyDOM();
    },
    format(pkg) {
      const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
      if (curr === 'IDR' && pkg.price_value_idr != null) {
        return {
          value: fmt(pkg.price_value_idr),
          label: I18n.t('currency.IDR'),
          originalValue: pkg.original_price_value_idr != null ? fmt(pkg.original_price_value_idr) : null,
        };
      }
      if (curr === 'USD' && pkg.price_value_usd != null) {
        return {
          value: fmt(pkg.price_value_usd),
          label: I18n.t('currency.USD'),
          originalValue: pkg.original_price_value_usd != null ? fmt(pkg.original_price_value_usd) : null,
        };
      }
      return {
        value: fmt(pkg.price_value ?? 0),
        label: I18n.t('currency.SAR'),
        originalValue: pkg.original_price_value != null ? fmt(pkg.original_price_value) : null,
      };
    },
  };
})();

/* ============================================================
   7. NAVBAR
   ============================================================ */
const Navbar = {
  init() {
    const navbar   = document.getElementById('navbar');
    const menuBtn  = document.getElementById('menuToggle');
    const closeBtn = document.getElementById('mobileMenuClose');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    const menu     = document.getElementById('mobileMenu');
    if (!navbar) return;
    navbar.classList.add('navbar--scrolled');
    menuBtn?.addEventListener('click', () => this.openMenu());
    closeBtn?.addEventListener('click', () => this.closeMenu());
    backdrop?.addEventListener('click', () => this.closeMenu());
    menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => this.closeMenu()));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeMenu(); });
    document.querySelectorAll('.btn-lang').forEach(btn => btn.addEventListener('click', () => I18n.toggle()));
    document.querySelectorAll('.btn-currency').forEach(btn => btn.addEventListener('click', () => {
      Currency.cycle();
      PackageList.rerender();
    }));
  },
  openMenu() {
    document.getElementById('mobileMenu')?.classList.add('is-open');
    document.getElementById('mobileMenuBackdrop')?.classList.add('is-open');
    document.getElementById('menuToggle')?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.getElementById('mobileMenu')?.querySelector('a')?.focus();
  },
  closeMenu() {
    document.getElementById('mobileMenu')?.classList.remove('is-open');
    document.getElementById('mobileMenuBackdrop')?.classList.remove('is-open');
    document.getElementById('menuToggle')?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },
};

/* ============================================================
   7. SCROLL REVEAL
   ============================================================ */
const ScrollReveal = {
  init() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  },
  observe(container) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.06 });
    container?.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  },
};

/* ============================================================
   8. FLOATING WHATSAPP
   ============================================================ */
const FloatingWA = {
  init() {
    const btn = document.getElementById('waFloat');
    if (!btn) return;
    btn.href = WA.generalUrl();
    btn.classList.add('is-visible');
  },
};

/* ============================================================
   9. LAZY LOAD IMAGES
   ============================================================ */
function lazyLoadImages(container) {
  const imgs = container.querySelectorAll('img[data-src]');
  if (!imgs.length) return;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      });
    }, { rootMargin: '200px' });
    imgs.forEach(img => obs.observe(img));
  } else {
    imgs.forEach(img => { img.src = img.dataset.src; });
  }
}

/* ============================================================
   10. PACKAGE LIST
   ============================================================ */
const PackageList = {
  grid:    null,
  count:   null,
  searchQ: '',
  activeCat:  'all',
  activeDest: 'all',

  init(packages) {
    this.grid  = document.getElementById('pkgGrid');
    this.count = document.getElementById('pkgCount');
    this._renderSkeletons();
    this._bindFilters(packages);
    this._bindSearch(packages);
    this._render(packages);
  },

  _renderSkeletons() {
    if (!this.grid) return;
    this.grid.innerHTML = Array(6).fill(0).map(() => `
      <article class="pkg-card pkg-card--skeleton" aria-hidden="true">
        <div class="pkg-card__img skeleton"></div>
        <div class="pkg-card__body">
          <div class="skeleton skeleton--text" style="width:50%"></div>
          <div class="skeleton skeleton--text" style="width:80%;height:1.25rem;margin-block:0.5rem"></div>
          <div class="skeleton skeleton--text" style="width:40%"></div>
          <div class="skeleton skeleton--text" style="width:60%;margin-top:1rem"></div>
        </div>
      </article>`).join('');
  },

  _bindFilters(allPkgs) {
    document.querySelectorAll('.filter-pill[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCat = btn.dataset.cat;
        document.querySelectorAll('.filter-pill[data-cat]').forEach(b => b.classList.toggle('is-active', b === btn));
        this._render(allPkgs);
      });
    });
    document.querySelectorAll('.filter-pill[data-dest]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeDest = btn.dataset.dest;
        document.querySelectorAll('.filter-pill[data-dest]').forEach(b => b.classList.toggle('is-active', b === btn));
        this._render(allPkgs);
      });
    });
  },

  _bindSearch(allPkgs) {
    const input = document.getElementById('pkgSearch');
    if (!input) return;
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        this.searchQ = input.value.trim().toLowerCase();
        this._render(allPkgs);
      }, 200);
    });
  },

  _filter(packages) {
    return packages.filter(pkg => {
      if (this.activeCat !== 'all' && pkg.category !== this.activeCat) return false;
      if (this.activeDest !== 'all') {
        const dests = pkg.package_destinations ?? [];
        const hasDest = dests.some(d => d.destinations?.slug === this.activeDest);
        if (!hasDest) return false;
      }
      if (this.searchQ) {
        const title = ((pkg.title_ar ?? '') + ' ' + (pkg.title_en ?? '')).toLowerCase();
        if (!title.includes(this.searchQ)) return false;
      }
      return true;
    });
  },

  _getPrimaryDest(pkg) {
    const dests = pkg.package_destinations ?? [];
    return dests[0]?.destinations ?? null;
  },

  _cardHTML(pkg) {
    const lang     = I18n.get();
    const title    = lang === 'ar' ? pkg.title_ar : pkg.title_en;
    const dest     = this._getPrimaryDest(pkg);
    const destName = dest ? (lang === 'ar' ? dest.name_ar : dest.name_en) : '';
    const cat      = pkg.category ?? 'luxury';
    const nights   = pkg.duration_nights ?? 0;
    const days     = pkg.duration_days ?? 1;
    const priceLabel = I18n.t(`price.${pkg.price_type ?? 'starting_from'}`);
    const priceInfo  = Currency.format(pkg);
    const price      = priceInfo.value;
    const currLabel  = priceInfo.label;
    const imgSrc     = pkg.hero_image_url ? `${Config.STORAGE_URL}${pkg.hero_image_url}` : Config.PLACEHOLDER_IMG;
    const origHTML   = priceInfo.originalValue
      ? `<span class="pkg-card__price-original">${priceInfo.originalValue}</span>`
      : '';

    const discountPct = (pkg.price_value && pkg.original_price_value && pkg.original_price_value > pkg.price_value)
      ? Math.round((1 - pkg.price_value / pkg.original_price_value) * 100) : 0;
    const discountBadge = discountPct > 0 ? `<span class="badge badge--discount">-${discountPct}%</span>` : '';

    return `
      <article class="pkg-card reveal" data-pkg-id="${pkg.id}">
        <a href="بكج-سياحي-اندونيسيا.html?slug=${pkg.slug_en}" class="pkg-card__img" aria-label="${title}">
          <img data-src="${imgSrc}" src="${Config.PLACEHOLDER_IMG}" alt="${title} — ${destName}" width="400" height="300" loading="lazy">
          <div class="pkg-card__badge"><span class="badge badge--${cat}">${I18n.t('category.' + cat)}</span>${discountBadge}</div>
        </a>
        <div class="pkg-card__body">
          <p class="pkg-card__destination">${destName}</p>
          <h3 class="pkg-card__title"><a href="بكج-سياحي-اندونيسيا.html?slug=${pkg.slug_en}">${title}</a></h3>
          <p class="pkg-card__duration">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${nights} ${I18n.t('packages.nights')} / ${days} ${I18n.t('packages.days')}
          </p>
          <div class="pkg-card__price">
            ${priceLabel ? `<span class="pkg-card__price-label">${priceLabel}</span>` : ''}
            <div>
              <span class="pkg-card__price-value">${price}</span>
              <span class="pkg-card__price-currency">${currLabel}</span>
              ${origHTML}
            </div>
          </div>
          <a href="#" class="btn btn--whatsapp btn--full" data-wa-pkg="${pkg.id}" aria-label="${I18n.t('packages.bookNow')} — ${title}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            ${I18n.t('packages.bookNow')}
          </a>
        </div>
      </article>`;
  },

  _bindWALinks(packages) {
    this.grid?.querySelectorAll('[data-wa-pkg]').forEach(btn => {
      const pkg  = packages.find(p => p.id === btn.dataset.waPkg);
      if (!pkg) return;
      const dest = this._getPrimaryDest(pkg);
      btn.href = WA.packageUrl(pkg.title_ar, pkg.title_en, dest?.name_ar ?? '', dest?.name_en ?? '');
    });
  },

  _bindCardClicks() {
    this.grid?.addEventListener('click', (e) => {
      if (e.target.closest('.btn--whatsapp')) return;
      const card = e.target.closest('.pkg-card');
      if (!card) return;
      const link = card.querySelector('.pkg-card__title a');
      if (link?.href) window.location.href = link.href;
    });
  },

  _render(allPkgs) {
    const filtered = this._filter(allPkgs);
    if (!this.grid) return;

    if (!filtered.length) {
      this.grid.innerHTML = `
        <div class="packages-empty" style="grid-column:1/-1">
          <p data-i18n="pkgs.empty">${I18n.t('pkgs.empty')}</p>
          <a href="#" class="btn btn--outline-navy" data-wa="general" data-i18n="pkgs.wa" style="margin-top:1rem">${I18n.t('pkgs.wa')}</a>
        </div>`;
      WA.updateAll();
    } else {
      this.grid.innerHTML = filtered.map(p => this._cardHTML(p)).join('');
      this._bindWALinks(allPkgs);
      this._bindCardClicks();
      lazyLoadImages(this.grid);
      ScrollReveal.observe(this.grid);
    }

    if (this.count) {
      this.count.innerHTML = `<strong>${filtered.length}</strong> ${I18n.t('pkgs.count', { n: '' }).replace('{n}', '').trim()}`;
      this.count.textContent = I18n.t('pkgs.count', { n: String(filtered.length) });
    }
  },

  rerender() {
    if (App.allPackages) this._render(App.allPackages);
  },
};

/* ============================================================
   11. APP
   ============================================================ */
const App = {
  allPackages: null,

  async init() {
    I18n.init();
    Currency.init();
    Navbar.init();
    ScrollReveal.init();
    WA.updateAll();
    FloatingWA.init();

    if (!DB.isConfigured()) {
      document.getElementById('pkgGrid').innerHTML = `
        <div class="packages-empty" style="grid-column:1/-1">
          <p style="color:var(--color-text-muted)">Supabase not configured — add credentials to packages.js to load packages.</p>
          <a href="#" class="btn btn--outline-navy" data-wa="general" style="margin-top:1rem">${I18n.t('pkgs.wa')}</a>
        </div>`;
      WA.updateAll();
      return;
    }

    const [pkgsResult, destsResult] = await Promise.allSettled([
      DB.getPackages(),
      DB.getDestinations(),
    ]);

    this.allPackages = pkgsResult.status === 'fulfilled' ? (pkgsResult.value ?? []) : [];
    const destinations = destsResult.status === 'fulfilled' ? (destsResult.value ?? []) : [];

    // Build dynamic destination filter pills
    this._buildDestFilters(destinations);

    PackageList.init(this.allPackages);
  },

  _buildDestFilters(destinations) {
    const container = document.getElementById('destFilterPills');
    if (!container || !destinations.length) return;
    const lang = I18n.get();
    destinations.forEach(d => {
      const btn = document.createElement('button');
      btn.className = 'filter-pill';
      btn.dataset.dest = d.slug;
      btn.textContent = lang === 'ar' ? d.name_ar : d.name_en;
      container.appendChild(btn);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
