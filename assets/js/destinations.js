/* ============================================================
   LUXPATH TRAVEL — DESTINATIONS OVERVIEW PAGE
   ============================================================ */

'use strict';

const Config = Object.freeze({
  SUPABASE_URL:      'https://fgeeysssiesdlryoygoa.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWV5c3NzaWVzZGxyeW95Z29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTI0MzUsImV4cCI6MjA5NTk4ODQzNX0.Sa3vcq9U2BrzFobTqQS4sAmVpXkRH09_PGzol9-NCvw',
  get STORAGE_URL()  { return this.SUPABASE_URL + '/storage/v1/object/public/luxpath-media/'; },
  WHATSAPP_NUMBER:   '+6281111826527',
  LANG_KEY:          'luxpath_lang',
  DEFAULT_LANG:      'ar',
  PLACEHOLDER_IMG:   'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23F0EDE8" width="800" height="450"/%3E%3C/svg%3E',
});

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
    'wa.general':   'مرحباً، أود الاستفسار عن باقاتكم السياحية إلى إندونيسيا',
    'wa.dest':      'مرحباً، أود الاستفسار عن رحلات {destination}',
    'dests.eyebrow':  'وجهاتنا',
    'dests.title':    'وجهاتنا في إندونيسيا',
    'dests.subtitle': 'اكتشف أجمل مناطق إندونيسيا مع لوكس باث — باقات مصممة خصيصاً لك',
    'dests.breadcrumb': 'الوجهات',
    'dests.explore':  'اكتشف الباقات',
    'dests.cta.title': 'لم تجد وجهتك المثالية؟',
    'dests.cta.sub':   'تواصل معنا وسنصمم لك رحلة مخصصة بالكامل حسب رغباتك',
    'dests.cta.btn':   'تحدث معنا على واتساب',
    'dests.empty':     'سيتم إضافة الوجهات قريباً. تواصل معنا للمزيد.',
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
    'wa.general':   'Hello, I\'d like to inquire about your Indonesia travel packages',
    'wa.dest':      'Hello, I\'d like to inquire about trips to {destination}',
    'dests.eyebrow':  'Our Destinations',
    'dests.title':    'Our Indonesia Destinations',
    'dests.subtitle': 'Discover the most beautiful regions of Indonesia with Luxpath — packages designed for you',
    'dests.breadcrumb': 'Destinations',
    'dests.explore':  'Explore Packages',
    'dests.cta.title': 'Didn\'t Find Your Ideal Destination?',
    'dests.cta.sub':   'Contact us and we\'ll design a fully customised trip according to your wishes',
    'dests.cta.btn':   'Chat with Us on WhatsApp',
    'dests.empty':     'Destinations coming soon. Contact us to learn more.',
  },
};

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
      if (error) { console.warn('[Luxpath]', error.message); return null; }
      return data;
    } catch (e) { console.warn('[Luxpath]', e.message); return null; }
  };
  return {
    isConfigured,
    getDestinations: () => q(db =>
      db.from('destinations')
        .select('id, slug, name_ar, name_en, tagline_ar, tagline_en, hero_image_url, card_image_url, description_ar, description_en')
        .eq('is_active', true)
        .order('display_order')
    ),
  };
})();

const I18n = (() => {
  let lang = Config.DEFAULT_LANG;
  const detect = () => {
    const s = localStorage.getItem(Config.LANG_KEY);
    return (s === 'ar' || s === 'en') ? s : 'ar';
  };
  const applyDOM = () => {
    const html = document.documentElement;
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
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
        applyDOM(); WA.updateAll();
        if (App.destinations) DestinationGrid.render(App.destinations);
        b.classList.remove('lang-switching');
        b.classList.add('lang-entering');
        setTimeout(() => b.classList.remove('lang-entering'), 350);
      }, 200);
    },
    get: () => lang,
    t(key, vars = {}) {
      let text = T[lang][key] ?? T['ar'][key] ?? key;
      Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
      return text;
    },
  };
})();

const WA = {
  url(msg) { return `https://wa.me/${Config.WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`; },
  generalUrl() { return this.url(I18n.t('wa.general')); },
  destUrl(nameAr, nameEn) {
    const dest = I18n.get() === 'ar' ? nameAr : nameEn;
    return this.url(I18n.t('wa.dest', { destination: dest }));
  },
  updateAll() {
    const url = this.generalUrl();
    document.querySelectorAll('[data-wa="general"]').forEach(el => { el.href = url; });
  },
};

const Navbar = {
  init() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    navbar.classList.add('navbar--scrolled');
    document.getElementById('menuToggle')?.addEventListener('click', () => this.openMenu());
    document.getElementById('mobileMenuClose')?.addEventListener('click', () => this.closeMenu());
    document.getElementById('mobileMenuBackdrop')?.addEventListener('click', () => this.closeMenu());
    document.getElementById('mobileMenu')?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => this.closeMenu()));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeMenu(); });
    document.querySelectorAll('.btn-lang').forEach(btn => btn.addEventListener('click', () => I18n.toggle()));
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

const FloatingWA = {
  init() {
    const btn = document.getElementById('waFloat');
    if (!btn) return;
    btn.href = WA.generalUrl();
    btn.classList.add('is-visible');
  },
};

const DestinationGrid = {
  render(destinations) {
    const grid = document.getElementById('destGrid');
    if (!grid) return;
    const lang = I18n.get();

    if (!destinations?.length) {
      grid.innerHTML = `<p class="packages-empty" style="grid-column:1/-1">${I18n.t('dests.empty')}</p>`;
      return;
    }

    grid.innerHTML = destinations.map(d => {
      const name    = lang === 'ar' ? d.name_ar    : d.name_en;
      const tagline = lang === 'ar' ? d.tagline_ar : d.tagline_en;
      const imgSrc  = d.hero_image_url
        ? `${Config.STORAGE_URL}${d.hero_image_url}`
        : Config.PLACEHOLDER_IMG;

      return `
        <a href="وجهة-سياحية-اندونيسيا?slug=${d.slug}" class="dest-full-card reveal" aria-label="${name}">
          <img data-src="${imgSrc}" src="${Config.PLACEHOLDER_IMG}" alt="${name}" width="800" height="450" loading="lazy">
          <div class="dest-full-card__overlay" aria-hidden="true"></div>
          <div class="dest-full-card__content">
            <span class="dest-full-card__name">${name}</span>
            ${tagline ? `<span class="dest-full-card__tagline">${tagline}</span>` : ''}
            <span class="dest-full-card__cta">
              ${I18n.t('dests.explore')}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                ${lang === 'ar' ? '<polyline points="15 18 9 12 15 6"/>' : '<polyline points="9 18 15 12 9 6"/>'}
              </svg>
            </span>
          </div>
        </a>`;
    }).join('');

    // Lazy load images
    const imgs = grid.querySelectorAll('img[data-src]');
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

    ScrollReveal.observe(grid);
  },
};

const App = {
  destinations: null,

  async init() {
    I18n.init();
    Navbar.init();
    ScrollReveal.init();
    WA.updateAll();
    FloatingWA.init();

    // Skeleton
    const grid = document.getElementById('destGrid');
    if (grid) {
      grid.innerHTML = Array(4).fill(0).map(() =>
        `<div class="dest-full-card" style="background:var(--color-surface-alt)"><div class="skeleton" style="position:absolute;inset:0"></div></div>`
      ).join('');
    }

    if (!DB.isConfigured()) {
      if (grid) grid.innerHTML = `<p class="packages-empty" style="grid-column:1/-1">${I18n.t('dests.empty')}</p>`;
      return;
    }

    this.destinations = await DB.getDestinations() ?? [];
    DestinationGrid.render(this.destinations);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
