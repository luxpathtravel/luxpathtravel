/* ============================================================
   LUXPATH TRAVEL — SINGLE DESTINATION PAGE
   Reads ?slug= from URL · Loads destination + packages
   ============================================================ */

'use strict';

const Config = Object.freeze({
  SUPABASE_URL:      'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  get STORAGE_URL()  { return this.SUPABASE_URL + '/storage/v1/object/public/luxpath-media/'; },
  WHATSAPP_NUMBER:   '+6281111826527',
  LANG_KEY:          'luxpath_lang',
  DEFAULT_LANG:      'ar',
  PLACEHOLDER_IMG:   'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F0EDE8" width="400" height="300"/%3E%3C/svg%3E',
  HERO_PLACEHOLDER:  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Crect fill="%230A2540" width="1920" height="1080"/%3E%3C/svg%3E',
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
    'packages.from':    'يبدأ من',
    'packages.bookNow': 'احجز الآن',
    'packages.nights':  'ليالٍ',
    'packages.days':    'أيام',
    'category.honeymoon': 'شهر العسل',
    'category.family':    'عائلي',
    'category.luxury':    'فاخر',
    'category.adventure': 'مغامرة',
    'price.exact': '', 'price.starting_from': 'يبدأ من', 'price.approximate': 'يقارب',
    'currency.SAR': 'ريال', 'currency.USD': 'دولار', 'currency.EUR': 'يورو',
    'wa.general':   'مرحباً، أود الاستفسار عن باقاتكم السياحية إلى إندونيسيا',
    'wa.package':   'مرحباً، أود الاستفسار عن باقة "{title}" إلى {destination}',
    'wa.dest':      'مرحباً، أود الاستفسار عن رحلات {destination}',
    'dest.tag':     'إندونيسيا',
    'dest.pkgs.eyebrow': 'باقاتنا',
    'dest.pkgs.title':   'باقات {destination}',
    'dest.pkgs.empty':   'لا توجد باقات متاحة لهذه الوجهة حالياً. تواصل معنا للحصول على عرض مخصص.',
    'dest.pkgs.wa':      'اسألنا عن باقات {destination}',
    'dest.cta.title':    'جاهز لاستكشاف {destination}؟',
    'dest.cta.sub':      'تواصل معنا وسنصمم لك الرحلة المثالية خلال 24 ساعة',
    'dest.cta.btn':      'احجز رحلتي على واتساب',
    'dest.notfound':     'لم نتمكن من إيجاد هذه الوجهة.',
    'dest.breadcrumb.dests': 'الوجهات',
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
    'packages.from':    'From',
    'packages.bookNow': 'Book Now',
    'packages.nights':  'Nights',
    'packages.days':    'Days',
    'category.honeymoon': 'Honeymoon',
    'category.family':    'Family',
    'category.luxury':    'Luxury',
    'category.adventure': 'Adventure',
    'price.exact': '', 'price.starting_from': 'From', 'price.approximate': 'Approx.',
    'currency.SAR': 'SAR', 'currency.USD': 'USD', 'currency.EUR': 'EUR',
    'wa.general':   'Hello, I\'d like to inquire about your Indonesia travel packages',
    'wa.package':   'Hello, I\'m interested in the "{title}" package to {destination}',
    'wa.dest':      'Hello, I\'d like to inquire about trips to {destination}',
    'dest.tag':     'Indonesia',
    'dest.pkgs.eyebrow': 'Our Packages',
    'dest.pkgs.title':   '{destination} Packages',
    'dest.pkgs.empty':   'No packages available for this destination right now. Contact us for a custom quote.',
    'dest.pkgs.wa':      'Ask us about {destination} packages',
    'dest.cta.title':    'Ready to Explore {destination}?',
    'dest.cta.sub':      'Contact us and we\'ll design your perfect trip within 24 hours',
    'dest.cta.btn':      'Book My Trip on WhatsApp',
    'dest.notfound':     'We could not find this destination.',
    'dest.breadcrumb.dests': 'Destinations',
  },
};

const DB = (() => {
  const isConfigured = () =>
    Config.SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    Config.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
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
    getDestination: (slug) => q(db =>
      db.from('destinations')
        .select('id, slug, name_ar, name_en, tagline_ar, tagline_en, description_ar, description_en, hero_image_url, meta_title_ar, meta_title_en, meta_description_ar, meta_description_en')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
    ),
    getPackagesByDestination: (destinationId) => q(db =>
      db.from('packages')
        .select(`
          id, slug_en, slug_ar, title_ar, title_en,
          category, price_type, price_value, original_price_value, currency,
          duration_nights, duration_days, hero_image_url, display_order,
          package_destinations!inner (
            destination_id, is_primary,
            destinations ( slug, name_ar, name_en )
          )
        `)
        .eq('is_active', true)
        .eq('package_destinations.destination_id', destinationId)
        .order('display_order', { ascending: true })
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
        if (App.destination && App.packages) DestinationPage.rerender(App.destination, App.packages);
        b.classList.remove('lang-switching');
        b.classList.add('lang-entering');
        setTimeout(() => b.classList.remove('lang-entering'), 350);
      }, 200);
    },
    get:  () => lang,
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
  packageUrl(tAr, tEn, dAr, dEn) {
    const title = I18n.get() === 'ar' ? tAr : tEn;
    const dest  = I18n.get() === 'ar' ? dAr : dEn;
    return this.url(I18n.t('wa.package', { title, destination: dest }));
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

function lazyLoad(container) {
  const imgs = container?.querySelectorAll('img[data-src]');
  if (!imgs?.length) return;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.src = entry.target.dataset.src;
        entry.target.removeAttribute('data-src');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '200px' });
    imgs.forEach(img => obs.observe(img));
  } else {
    imgs.forEach(img => { img.src = img.dataset.src; });
  }
}

const DestinationPage = {
  renderHero(dest) {
    const lang    = I18n.get();
    const name    = lang === 'ar' ? dest.name_ar    : dest.name_en;
    const tagline = lang === 'ar' ? dest.tagline_ar : dest.tagline_en;
    const imgSrc  = dest.hero_image_url
      ? `${Config.STORAGE_URL}${dest.hero_image_url}`
      : Config.HERO_PLACEHOLDER;

    // Hero image
    const heroImg = document.getElementById('destHeroImg');
    if (heroImg) { heroImg.src = imgSrc; heroImg.alt = name; }

    // Text
    const nameEl    = document.getElementById('destHeroName');
    const taglineEl = document.getElementById('destHeroTagline');
    if (nameEl)    nameEl.textContent    = name;
    if (taglineEl) taglineEl.textContent = tagline ?? '';

    // Breadcrumb
    const bcCurrent = document.getElementById('bcCurrent');
    if (bcCurrent) bcCurrent.textContent = name;

    // SEO
    const metaTitle = (lang === 'ar' ? dest.meta_title_ar : dest.meta_title_en)
      ?? `${name} | لوكس باث للسياحة`;
    const metaDesc  = (lang === 'ar' ? dest.meta_description_ar : dest.meta_description_en) ?? '';
    document.title = metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metaDesc);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://luxpathtravel.com/وجهة-سياحية-اندونيسيا.html?slug=${dest.slug}`);

    // Packages section heading
    const pkgsTitle = document.getElementById('destPkgsTitle');
    if (pkgsTitle) pkgsTitle.textContent = I18n.t('dest.pkgs.title', { destination: name });

    // CTA
    const ctaTitle = document.getElementById('destCtaTitle');
    const ctaBtn   = document.getElementById('destCtaBtn');
    if (ctaTitle) ctaTitle.textContent = I18n.t('dest.cta.title', { destination: name });
    if (ctaBtn)   ctaBtn.href = WA.destUrl(dest.name_ar, dest.name_en);

    // Description
    const descEl = document.getElementById('destDescription');
    if (descEl) {
      const desc = (lang === 'ar' ? dest.description_ar : dest.description_en) ?? '';
      descEl.textContent = desc;
      descEl.hidden = !desc;
    }
  },

  renderPackages(packages, dest) {
    const grid = document.getElementById('destPkgGrid');
    if (!grid) return;
    const lang     = I18n.get();
    const destName = lang === 'ar' ? dest.name_ar : dest.name_en;

    if (!packages?.length) {
      grid.innerHTML = `
        <div class="packages-empty" style="grid-column:1/-1">
          <p>${I18n.t('dest.pkgs.empty')}</p>
          <a href="#" class="btn btn--whatsapp" data-wa="general" style="margin-top:1rem">
            ${I18n.t('dest.pkgs.wa', { destination: destName })}
          </a>
        </div>`;
      WA.updateAll();
      return;
    }

    grid.innerHTML = packages.map(pkg => {
      const title   = lang === 'ar' ? pkg.title_ar : pkg.title_en;
      const cat     = pkg.category ?? 'luxury';
      const nights  = pkg.duration_nights ?? 0;
      const days    = pkg.duration_days ?? 1;
      const priceLabel = T[lang][`price.${pkg.price_type ?? 'starting_from'}`] ?? '';
      const currLabel  = T[lang][`currency.${pkg.currency ?? 'SAR'}`] ?? '';
      const price   = new Intl.NumberFormat('en-US').format(pkg.price_value ?? 0);
      const imgSrc  = pkg.hero_image_url ? `${Config.STORAGE_URL}${pkg.hero_image_url}` : Config.PLACEHOLDER_IMG;
      const origHTML = pkg.original_price_value
        ? `<span class="pkg-card__price-original">${new Intl.NumberFormat('en-US').format(pkg.original_price_value)}</span>`
        : '';

      return `
        <article class="pkg-card reveal" data-pkg-id="${pkg.id}">
          <a href="بكج-سياحي-اندونيسيا.html?slug=${pkg.slug_en}" class="pkg-card__img" aria-label="${title}">
            <img data-src="${imgSrc}" src="${Config.PLACEHOLDER_IMG}" alt="${title}" width="400" height="300" loading="lazy">
            <div class="pkg-card__badge"><span class="badge badge--${cat}">${I18n.t('category.' + cat)}</span></div>
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
    }).join('');

    // Bind WA links
    grid.querySelectorAll('[data-wa-pkg]').forEach(btn => {
      const pkg = packages.find(p => p.id === btn.dataset.waPkg);
      if (pkg) btn.href = WA.packageUrl(pkg.title_ar, pkg.title_en, dest.name_ar, dest.name_en);
    });

    lazyLoad(grid);
    ScrollReveal.observe(grid);
  },

  rerender(dest, packages) {
    this.renderHero(dest);
    this.renderPackages(packages, dest);
    WA.updateAll();
  },
};

const App = {
  destination: null,
  packages:    null,

  async init() {
    I18n.init();
    Navbar.init();
    ScrollReveal.init();
    WA.updateAll();
    FloatingWA.init();

    const slug = new URLSearchParams(window.location.search).get('slug');

    if (!slug) {
      this._showNotFound();
      return;
    }

    if (!DB.isConfigured()) {
      document.getElementById('destPkgGrid').innerHTML = `
        <p class="packages-empty" style="grid-column:1/-1">Supabase not configured.</p>`;
      return;
    }

    const [destResult, pkgsResult] = await Promise.allSettled([
      DB.getDestination(slug),
      DB.getPackagesByDestination(null), // temporary — will be replaced after dest loads
    ]);

    const dest = destResult.status === 'fulfilled' ? destResult.value : null;

    if (!dest) {
      this._showNotFound();
      return;
    }

    this.destination = dest;

    // Now fetch packages for this destination
    this.packages = await DB.getPackagesByDestination(dest.id) ?? [];

    DestinationPage.renderHero(dest);
    DestinationPage.renderPackages(this.packages, dest);
    WA.updateAll();

    document.getElementById('destLoading')?.remove();
    document.getElementById('destContent')?.removeAttribute('hidden');
  },

  _showNotFound() {
    document.getElementById('destLoading')?.remove();
    const nf = document.getElementById('destNotFound');
    if (nf) nf.hidden = false;
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
