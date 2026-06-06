/* ============================================================
   LUXPATH TRAVEL — PACKAGE DETAIL PAGE
   Self-contained: includes own Config, I18n, WA, Navbar
   ============================================================
   MODULES
   1.  Config
   2.  Translations
   3.  DB
   4.  I18n
   5.  WA (WhatsApp)
   6.  Navbar
   7.  Meta (dynamic SEO)
   8.  Breadcrumbs
   9.  Gallery
   10. Lightbox
   11. Itinerary
   12. Inclusions
   13. PriceCard
   14. StickyBar
   15. RelatedPackages
   16. ScrollReveal
   17. FloatingWA
   18. PackageApp
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
  PLACEHOLDER_IMG:   'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23F0EDE8" width="800" height="600"/%3E%3C/svg%3E',
});

/* ============================================================
   2. TRANSLATIONS
   ============================================================ */
const T = {
  ar: {
    'a11y.skip': 'تخطَّ إلى المحتوى',
    'nav.home': 'الرئيسية', 'nav.destinations': 'الوجهات', 'nav.packages': 'الباقات',
    'nav.about': 'عن لوكس باث', 'nav.contact': 'تواصل معنا', 'nav.whatsapp': 'واتساب',
    'footer.tagline': 'وكالتك المتخصصة لرحلات إندونيسيا من المملكة العربية السعودية',
    'footer.links': 'روابط سريعة', 'footer.destinations': 'وجهاتنا', 'footer.contact': 'تواصل معنا',
    'footer.copyright': `© ${new Date().getFullYear()} لوكس باث للسياحة. جميع الحقوق محفوظة.`, 'footer.privacy': 'سياسة الخصوصية',
    'dest.bali': 'بالي', 'dest.jakarta': 'جاكرتا', 'dest.bandung': 'باندونغ', 'dest.lombok': 'لومبوك',
    'packages.from': 'يبدأ من', 'packages.bookNow': 'احجز الآن',
    'packages.nights': 'ليالٍ', 'packages.days': 'أيام',
    'category.honeymoon': 'شهر العسل', 'category.family': 'عائلي',
    'category.luxury': 'فاخر', 'category.adventure': 'مغامرة',
    'price.exact': '', 'price.starting_from': 'يبدأ من', 'price.approximate': 'يقارب',
    'currency.SAR': 'ريال', 'currency.USD': 'دولار', 'currency.EUR': 'يورو',
    'pkg.notFound.title': 'الباقة غير موجودة',
    'pkg.notFound.body':  'لم نتمكن من العثور على هذه الباقة. ربما تم تغيير الرابط أو إزالة الباقة.',
    'pkg.notFound.browse':  'تصفح جميع الباقات',
    'pkg.notFound.contact': 'تواصل معنا',
    'pkg.gallery':   'معرض الصور',
    'pkg.about':     'عن هذه الرحلة',
    'pkg.itinerary': 'برنامج الرحلة يوماً بيوم',
    'pkg.inclusions':'ما تشمله وما لا تشمله الباقة',
    'pkg.included':  'ما تشمله الباقة',
    'pkg.excluded':  'ما لا تشمله الباقة',
    'pkg.related':   'باقات مشابهة',
    'pkg.readMore':  'اقرأ المزيد',
    'pkg.readLess':  'اقرأ أقل',
    'pkg.persons':   'شخص',
    'pkg.to':        'إلى',
    'pkg.dayLabel':  'اليوم',
    'pkg.viewAll':   'عرض جميع الصور',
    'pkg.bookTitle': 'سعر الباقة',
    'pkg.callUs':    'أو اتصل بنا:',
    'pkg.trust1':    'أسعار شاملة للضرائب والرسوم',
    'pkg.trust2':    'مرشد ناطق بالعربية',
    'pkg.trust3':    'خدمة واتساب 24/7',
    'pkg.meal.breakfast': 'إفطار',
    'pkg.meal.lunch':     'غداء',
    'pkg.meal.dinner':    'عشاء',
    'pkg.imgCounter': '{current} / {total}',
    'wa.general': 'مرحباً، أود الاستفسار عن باقاتكم السياحية إلى إندونيسيا',
    'wa.package': 'مرحباً، أود الاستفسار عن باقة "{title}" إلى {destination}',
    'breadcrumb.home': 'الرئيسية',
    'breadcrumb.packages': 'الباقات',
  },
  en: {
    'a11y.skip': 'Skip to content',
    'nav.home': 'Home', 'nav.destinations': 'Destinations', 'nav.packages': 'Packages',
    'nav.about': 'About Us', 'nav.contact': 'Contact', 'nav.whatsapp': 'WhatsApp',
    'footer.tagline': 'Your specialist agency for Indonesia travel from Saudi Arabia',
    'footer.links': 'Quick Links', 'footer.destinations': 'Destinations', 'footer.contact': 'Contact Us',
    'footer.copyright': `© ${new Date().getFullYear()} Luxpath Travel. All rights reserved.`, 'footer.privacy': 'Privacy Policy',
    'dest.bali': 'Bali', 'dest.jakarta': 'Jakarta', 'dest.bandung': 'Bandung', 'dest.lombok': 'Lombok',
    'packages.from': 'From', 'packages.bookNow': 'Book Now',
    'packages.nights': 'Nights', 'packages.days': 'Days',
    'category.honeymoon': 'Honeymoon', 'category.family': 'Family',
    'category.luxury': 'Luxury', 'category.adventure': 'Adventure',
    'price.exact': '', 'price.starting_from': 'From', 'price.approximate': 'Approx.',
    'currency.SAR': 'SAR', 'currency.USD': 'USD', 'currency.EUR': 'EUR',
    'pkg.notFound.title': 'Package Not Found',
    'pkg.notFound.body':  'We could not find this package. The link may have changed or the package was removed.',
    'pkg.notFound.browse':  'Browse All Packages',
    'pkg.notFound.contact': 'Contact Us',
    'pkg.gallery':   'Photo Gallery',
    'pkg.about':     'About This Trip',
    'pkg.itinerary': 'Day-by-Day Itinerary',
    'pkg.inclusions':'What\'s Included & Excluded',
    'pkg.included':  'What\'s Included',
    'pkg.excluded':  'What\'s Excluded',
    'pkg.related':   'Similar Packages',
    'pkg.readMore':  'Read More',
    'pkg.readLess':  'Read Less',
    'pkg.persons':   'persons',
    'pkg.to':        'to',
    'pkg.dayLabel':  'Day',
    'pkg.viewAll':   'View All Photos',
    'pkg.bookTitle': 'Package Price',
    'pkg.callUs':    'Or call us:',
    'pkg.trust1':    'Prices include all taxes and fees',
    'pkg.trust2':    'Arabic-speaking guide included',
    'pkg.trust3':    '24/7 WhatsApp support',
    'pkg.meal.breakfast': 'Breakfast',
    'pkg.meal.lunch':     'Lunch',
    'pkg.meal.dinner':    'Dinner',
    'pkg.imgCounter': '{current} of {total}',
    'wa.general': 'Hello, I\'d like to inquire about your Indonesia travel packages',
    'wa.package': 'Hello, I\'m interested in the "{title}" package to {destination}',
    'breadcrumb.home': 'Home',
    'breadcrumb.packages': 'Packages',
  },
};

/* ============================================================
   3. DB — Supabase queries
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

    getPackage: (slug) => q(db =>
      db.from('packages')
        .select(`
          *,
          package_destinations (
            destination_id,
            destinations ( slug, name_ar, name_en, tagline_ar, tagline_en )
          ),
          package_images (
            image_url, alt_ar, alt_en, is_hero, display_order
          ),
          package_inclusions (
            type, icon, text_ar, text_en, display_order
          ),
        `)
        .eq('slug_en', slug)
        .eq('is_active', true)
        .single()
    ),

    getRelated: (destId, category, excludeId) => q(db =>
      db.from('packages')
        .select(`
          id, slug_en, slug_ar, title_ar, title_en,
          short_description_ar, short_description_en,
          category, price_type,
          price_value, original_price_value,
          price_value_idr, original_price_value_idr,
          price_value_usd, original_price_value_usd,
          currency, duration_nights, duration_days, hero_image_url,
          package_destinations!inner (
            destinations ( slug, name_ar, name_en )
          )
        `)
        .eq('is_active', true)
        .neq('id', excludeId)
        .eq('package_destinations.destination_id', destId)
        .order('display_order', { ascending: true })
        .limit(3)
    ),
  };
})();

/* ============================================================
   4. I18n
   ============================================================ */
const I18n = (() => {
  let lang = 'ar';

  const detect = () => {
    const stored = localStorage.getItem(Config.LANG_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
    if (window.location.pathname.includes('/en/')) return 'en';
    return 'ar';
  };

  const apply = () => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = T[lang][el.dataset.i18n];
      if (v !== undefined) el.textContent = v;
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
      apply();
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
        apply();
        WA.updateAll();
        if (PackageApp.pkg) PackageApp.rerender();
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

/* ============================================================
   5. WA — WhatsApp
   ============================================================ */
const WA = {
  phone: Config.WHATSAPP_NUMBER,

  url(msg) {
    return `https://wa.me/${this.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  },
  generalUrl() { return this.url(I18n.t('wa.general')); },
  packageUrl(pkg) {
    const lang = I18n.get();
    const title = lang === 'ar' ? pkg.title_ar : pkg.title_en;
    const dest  = getPrimaryDest(pkg);
    const destName = dest ? (lang === 'ar' ? dest.name_ar : dest.name_en) : '';
    return this.url(I18n.t('wa.package', { title, destination: destName }));
  },
  updateAll() {
    const general = this.generalUrl();
    document.querySelectorAll('[data-wa="general"]').forEach(el => { el.href = general; });
  },
};

/* Shared helper: get primary destination from package */
function getPrimaryDest(pkg) {
  const dests = pkg.package_destinations ?? [];
  return dests[0]?.destinations ?? null;
}

/* URL slug from path or query param */
function getSlug() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'package' && parts[1]) return decodeURIComponent(parts[1]);
  return new URLSearchParams(window.location.search).get('slug') ?? '';
}

/* Image URL from storage path */
function imgUrl(path) {
  if (!path) return Config.PLACEHOLDER_IMG;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return Config.STORAGE_URL + path;
}

/* Format price */
function fmtPrice(n) { return new Intl.NumberFormat('en-US').format(n ?? 0); }

/* ============================================================
   6. NAVBAR
   ============================================================ */
const Navbar = {
  init() {
    document.getElementById('menuToggle')?.addEventListener('click',  () => this.open());
    document.getElementById('mobileMenuClose')?.addEventListener('click', () => this.close());
    document.getElementById('mobileMenuBackdrop')?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
    document.querySelectorAll('.btn-lang').forEach(btn => btn.addEventListener('click', () => I18n.toggle()));
    document.getElementById('mobileMenu')?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => this.close()));
  },
  open() {
    document.getElementById('mobileMenu')?.classList.add('is-open');
    document.getElementById('mobileMenuBackdrop')?.classList.add('is-open');
    document.getElementById('menuToggle')?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  },
  close() {
    document.getElementById('mobileMenu')?.classList.remove('is-open');
    document.getElementById('mobileMenuBackdrop')?.classList.remove('is-open');
    document.getElementById('menuToggle')?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },
};

/* ============================================================
   7. META — dynamic SEO tags + schema
   ============================================================ */
const Meta = {
  set(pkg) {
    const lang    = I18n.get();
    const title   = lang === 'ar' ? pkg.title_ar    : pkg.title_en;
    const desc    = lang === 'ar' ? (pkg.seo_description_ar || pkg.short_description_ar)
                                  : (pkg.seo_description_en || pkg.short_description_en);
    const seoTitle = lang === 'ar' ? (pkg.seo_title_ar || title) : (pkg.seo_title_en || title);
    const dest    = getPrimaryDest(pkg);
    const destName = dest ? (lang === 'ar' ? dest.name_ar : dest.name_en) : '';
    const fullTitle = `${seoTitle} | لوكس باث للسياحة`;

    document.title = fullTitle;
    setMeta('description', desc || '');
    setMeta('robots', 'index, follow');

    const heroImg = imgUrl(pkg.hero_image_url);
    const canonicalBase = 'https://luxpathtravel.com';
    const canonicalAr   = `${canonicalBase}/package/${pkg.slug_en}`;
    const canonicalEn   = `${canonicalBase}/en/package/${pkg.slug_en}`;

    setLink('canonical', lang === 'ar' ? canonicalAr : canonicalEn);
    setLinkHreflang('ar', canonicalAr);
    setLinkHreflang('en', canonicalEn);

    // Open Graph
    setOG('og:title',       fullTitle);
    setOG('og:description', desc || '');
    setOG('og:image',       heroImg);
    setOG('og:url',         lang === 'ar' ? canonicalAr : canonicalEn);

    // Schema
    this.setSchema(pkg, heroImg, destName, canonicalAr, canonicalEn);
  },

  setSchema(pkg, heroImg, destName, canonicalAr, canonicalEn) {
    const images = (pkg.package_images || [])
      .sort((a, b) => a.display_order - b.display_order)
      .map(i => imgUrl(i.image_url));

    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        'name': pkg.title_en,
        'description': pkg.short_description_en || '',
        'image': images.length ? images : [heroImg],
        'url': canonicalEn,
        'inLanguage': ['ar', 'en'],
        'provider': { '@type': 'TravelAgency', '@id': 'https://luxpathtravel.com/#organization', 'name': 'Luxpath Travel' },
        'touristType': pkg.category,
        'itinerary': (pkg.package_itinerary || [])
          .sort((a, b) => a.day_number - b.day_number)
          .map(d => ({ '@type': 'TouristAttraction', 'name': d.title_en || d.title_ar })),
        'offers': {
          '@type': 'Offer',
          'price': pkg.price_value,
          'priceCurrency': pkg.currency ?? 'SAR',
          'availability': 'https://schema.org/InStock',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Luxpath Travel', 'item': 'https://luxpathtravel.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Packages', 'item': 'https://luxpathtravel.com/بكجات-سياحية-اندونيسيا.html' },
          { '@type': 'ListItem', 'position': 3, 'name': pkg.title_en },
        ],
      },
    ];

    const el = document.getElementById('pageSchema');
    if (el) el.textContent = JSON.stringify(schemas);
  },
};

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}
function setOG(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
  el.content = content;
}
function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
  el.href = href;
}
function setLinkHreflang(hl, href) {
  let el = document.querySelector(`link[hreflang="${hl}"]`);
  if (!el) { el = document.createElement('link'); el.rel = 'alternate'; el.hreflang = hl; document.head.appendChild(el); }
  el.href = href;
}

/* ============================================================
   8. BREADCRUMBS
   ============================================================ */
const Breadcrumbs = {
  render(pkg) {
    const lang = I18n.get();
    const dest = getPrimaryDest(pkg);
    const destName  = dest ? (lang === 'ar' ? dest.name_ar   : dest.name_en)   : '';
    const destSlug  = dest?.slug ?? '';
    const pkgTitle  = lang === 'ar' ? pkg.title_ar : pkg.title_en;

    const list = document.getElementById('breadcrumbsList');
    if (!list) return;

    list.innerHTML = `
      <li class="breadcrumbs__item">
        <a href="/">${I18n.t('breadcrumb.home')}</a>
      </li>
      <li class="breadcrumbs__item">
        <a href="بكجات-سياحية-اندونيسيا">${I18n.t('breadcrumb.packages')}</a>
      </li>
      ${destName ? `<li class="breadcrumbs__item"><a href="وجهات-السياحة-اندونيسيا">${destName}</a></li>` : ''}
      <li class="breadcrumbs__item breadcrumbs__item--current">${pkgTitle}</li>`;
  },
};

/* ============================================================
   9. GALLERY
   ============================================================ */
const Gallery = {
  images: [],
  mobileIdx: 0,

  init(pkg) {
    const sorted = (pkg.package_images ?? [])
      .sort((a, b) => (a.is_hero ? -1 : 1) - (b.is_hero ? -1 : 1) || a.display_order - b.display_order);

    this.images = sorted.length
      ? sorted.map(i => ({ url: imgUrl(i.image_url), alt_ar: i.alt_ar, alt_en: i.alt_en }))
      : [{ url: imgUrl(pkg.hero_image_url), alt_ar: pkg.title_ar, alt_en: pkg.title_en }];

    // Hide skeleton
    document.getElementById('gallerySkeleton').hidden = true;

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.renderMobile();
    } else {
      this.renderDesktop();
    }

    // Render the appropriate version on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const mobile = window.innerWidth < 768;
        document.getElementById('galleryGrid').hidden   =  mobile;
        document.getElementById('galleryMobile').hidden = !mobile;
      }, 200);
    });
  },

  renderDesktop() {
    const grid = document.getElementById('galleryGrid');
    const imgs = this.images;
    const show = Math.min(5, imgs.length); // show up to 5 cells
    const extra = imgs.length - 5;

    let html = '';
    for (let i = 0; i < show; i++) {
      const isMain = i === 0;
      const isLast = i === show - 1 && extra > 0;
      const { url, alt_ar, alt_en } = imgs[i];
      const alt = I18n.get() === 'ar' ? (alt_ar || '') : (alt_en || '');

      html += `
        <div class="gallery-grid__cell ${isMain ? 'gallery-grid__cell--main' : ''} ${isLast ? 'gallery-grid__cell--more' : ''}"
             ${isLast ? `data-more="+${extra + 1}"` : ''}>
          <img class="gallery-img"
               src="${url}"
               alt="${alt}"
               loading="${i === 0 ? 'eager' : 'lazy'}"
               width="${isMain ? 800 : 400}" height="${isMain ? 580 : 280}"
               data-index="${i}">
        </div>`;
    }

    grid.innerHTML = html;
    grid.hidden = false;

    // Click any image to open lightbox
    grid.querySelectorAll('.gallery-img').forEach(img => {
      img.addEventListener('click', () => Lightbox.open(parseInt(img.dataset.index)));
    });
  },

  renderMobile() {
    const track = document.getElementById('galleryTrack');
    const dots  = document.getElementById('galleryDots');
    const mobile = document.getElementById('galleryMobile');

    track.innerHTML = this.images.map((img, i) => `
      <div class="gallery-mobile__slide" data-index="${i}">
        <img src="${img.url}"
             alt="${I18n.get() === 'ar' ? (img.alt_ar || '') : (img.alt_en || '')}"
             loading="${i === 0 ? 'eager' : 'lazy'}"
             width="800" height="600">
      </div>`).join('');

    dots.innerHTML = this.images.map((_, i) =>
      `<button class="gallery-mobile__dot ${i === 0 ? 'is-active' : ''}"
               data-index="${i}" aria-label="الصورة ${i + 1}"></button>`
    ).join('');

    mobile.hidden = false;
    this.mobileIdx = 0;
    this.bindMobileEvents();
  },

  bindMobileEvents() {
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    prevBtn?.addEventListener('click', () => this.mobileNav(-1));
    nextBtn?.addEventListener('click', () => this.mobileNav(1));

    document.querySelectorAll('.gallery-mobile__dot').forEach(dot => {
      dot.addEventListener('click', () => this.mobileGoTo(parseInt(dot.dataset.index)));
    });

    // Tap main image → lightbox
    document.getElementById('galleryTrack')?.addEventListener('click', e => {
      const slide = e.target.closest('[data-index]');
      if (slide) Lightbox.open(parseInt(slide.dataset.index));
    });

    // Touch swipe
    let startX = 0;
    const track = document.getElementById('galleryTrack');
    track?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track?.addEventListener('touchend', e => {
      const dx = startX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) this.mobileNav(dx > 0 ? 1 : -1);
    }, { passive: true });
  },

  mobileNav(dir) { this.mobileGoTo(this.mobileIdx + dir); },

  mobileGoTo(idx) {
    const total = this.images.length;
    if (idx < 0 || idx >= total) return;
    this.mobileIdx = idx;

    // Scroll slide
    const slides = document.querySelectorAll('.gallery-mobile__slide');
    slides.forEach((s, i) => {
      s.style.display = i === idx ? 'block' : 'none';
    });

    // Update dots
    document.querySelectorAll('.gallery-mobile__dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
    });

    // Update button state
    const prev = document.getElementById('galleryPrev');
    const next = document.getElementById('galleryNext');
    if (prev) prev.disabled = idx === 0;
    if (next) next.disabled = idx === total - 1;
  },
};

/* ============================================================
   10. LIGHTBOX
   ============================================================ */
const Lightbox = {
  current: 0,

  open(index = 0) {
    this.current = index;
    const lb = document.getElementById('lightbox');
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.show();
    this.bindKeys();
  },

  close() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._keyHandler);
  },

  show() {
    const imgs = Gallery.images;
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    const { url, alt_ar, alt_en } = imgs[this.current];

    img.style.opacity = '0';
    img.src = url;
    img.alt = I18n.get() === 'ar' ? (alt_ar || '') : (alt_en || '');
    img.onload = () => { img.style.opacity = '1'; };

    counter.textContent = I18n.t('pkg.imgCounter', {
      current: this.current + 1,
      total: imgs.length,
    });

    document.getElementById('lightboxPrev').disabled = this.current === 0;
    document.getElementById('lightboxNext').disabled = this.current === imgs.length - 1;
  },

  navigate(dir) {
    const next = this.current + dir;
    if (next < 0 || next >= Gallery.images.length) return;
    this.current = next;
    this.show();
  },

  bindKeys() {
    this._keyHandler = (e) => {
      if (e.key === 'ArrowLeft')  this.navigate(I18n.get() === 'ar' ? 1 : -1);
      if (e.key === 'ArrowRight') this.navigate(I18n.get() === 'ar' ? -1 : 1);
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this._keyHandler);
  },

  initUI() {
    document.getElementById('lightboxClose')?.addEventListener('click', () => this.close());
    document.getElementById('lightboxPrev')?.addEventListener('click',  () => this.navigate(-1));
    document.getElementById('lightboxNext')?.addEventListener('click',  () => this.navigate(1));

    // Click backdrop to close
    document.getElementById('lightbox')?.addEventListener('click', e => {
      if (e.target === document.getElementById('lightbox') ||
          e.target === document.getElementById('lightbox').querySelector('.lightbox__stage')) {
        this.close();
      }
    });

    // Touch swipe in lightbox
    let startX = 0;
    const stage = document.querySelector('.lightbox__stage');
    stage?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    stage?.addEventListener('touchend',   e => {
      const dx = startX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) this.navigate(dx > 0 ? 1 : -1);
    }, { passive: true });
  },
};

/* ============================================================
   11. ITINERARY
   ============================================================ */
const Itinerary = {
  render(pkg) {
    const days = (pkg.package_itinerary ?? [])
      .sort((a, b) => a.day_number - b.day_number);

    const section = document.getElementById('itinerarySection');
    const list    = document.getElementById('itineraryList');
    if (!section || !list || !days.length) return;

    const lang = I18n.get();

    list.innerHTML = days.map(day => {
      const title    = lang === 'ar' ? day.title_ar    : day.title_en;
      const desc     = lang === 'ar' ? day.description_ar : day.description_en;
      const location = lang === 'ar' ? day.location_ar  : day.location_en;
      const meals    = day.meals_included ?? [];
      const dayImg   = day.image_url ? imgUrl(day.image_url) : '';

      const mealsHTML = meals.length ? `
        <div class="itinerary-meals">
          ${meals.map(m => `<span class="itinerary-meal">${this.mealIcon(m)} ${I18n.t(`pkg.meal.${m}`)}</span>`).join('')}
        </div>` : '';

      const dayImgHTML = dayImg ? `<img src="${dayImg}" class="itinerary-body__img" alt="${title}" loading="lazy" width="600" height="300">` : '';

      return `
        <div class="itinerary-item" role="listitem">
          <button class="itinerary-btn" aria-expanded="false" aria-controls="itin-body-${day.day_number}">
            <div class="itinerary-day-badge" aria-hidden="true">
              <span class="itinerary-day-badge__label">${I18n.t('pkg.dayLabel')}</span>
              <span class="itinerary-day-badge__num">${day.day_number}</span>
            </div>
            <div class="itinerary-btn__titles">
              <div class="itinerary-btn__title">${title}</div>
              ${location ? `<div class="itinerary-btn__location">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${location}
              </div>` : ''}
            </div>
            <svg class="itinerary-chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="itinerary-body" id="itin-body-${day.day_number}" role="region">
            <div class="itinerary-body__inner">
              <div class="itinerary-body__content">
                ${mealsHTML}
                ${desc ? `<p class="itinerary-body__desc">${desc}</p>` : ''}
                ${dayImgHTML}
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    section.hidden = false;

    // Accordion: open first day by default
    const items = list.querySelectorAll('.itinerary-item');
    if (items[0]) this.toggle(items[0]);

    list.querySelectorAll('.itinerary-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggle(btn.closest('.itinerary-item')));
    });
  },

  toggle(item) {
    const isOpen = item.classList.contains('is-open');
    // Close all
    document.querySelectorAll('.itinerary-item.is-open').forEach(i => {
      i.classList.remove('is-open');
      i.querySelector('.itinerary-btn').setAttribute('aria-expanded', 'false');
    });
    // Open clicked
    if (!isOpen) {
      item.classList.add('is-open');
      item.querySelector('.itinerary-btn').setAttribute('aria-expanded', 'true');
    }
  },

  mealIcon(meal) {
    return { breakfast: '🍳', lunch: '🥗', dinner: '🍽️' }[meal] ?? '🍴';
  },
};

/* ============================================================
   12. INCLUSIONS
   ============================================================ */
const ICONS = {
  flight:           '✈️', hotel:            '🏨',
  meal_breakfast:   '🍳', meal_lunch:       '🥗',
  meal_dinner:      '🍽️', meals_all:        '🍽️',
  transfer:         '🚌', guide_arabic:     '🗣️',
  guide_local:      '👤', tour:             '🗺️',
  visa:             '📋', insurance:        '🛡️',
  sim_card:         '📱', photo_session:    '📸',
  water_activities: '🤿', spa:              '💆',
  custom:           '✨',
};

const Inclusions = {
  render(pkg) {
    const all = (pkg.package_inclusions ?? []).sort((a, b) => a.display_order - b.display_order);
    const included = all.filter(i => i.type === 'included');
    const excluded = all.filter(i => i.type === 'excluded');

    const section = document.getElementById('inclusionsSection');
    if (!section || !all.length) return;

    const lang = I18n.get();

    const renderList = (items, type) =>
      items.map(item => {
        const text = lang === 'ar' ? item.text_ar : item.text_en;
        const icon = ICONS[item.icon] ?? '•';
        return `<li class="inclusions-item inclusions-item--${type}">
          <span class="inclusions-item__icon" aria-hidden="true">${icon}</span>
          <span>${text}</span>
        </li>`;
      }).join('');

    document.getElementById('includedList').innerHTML = renderList(included, 'in');
    document.getElementById('excludedList').innerHTML = renderList(excluded, 'ex');

    section.hidden = false;
  },
};

/* ============================================================
   13. PRICE CARD + PACKAGE HEADER
   ============================================================ */
const PriceCard = {
  render(pkg) {
    const lang      = I18n.get();
    const title     = lang === 'ar' ? pkg.title_ar : pkg.title_en;
    const dest      = getPrimaryDest(pkg);
    const destName  = dest ? (lang === 'ar' ? dest.name_ar : dest.name_en) : '';
    const cat       = pkg.category ?? 'luxury';
    const catLabel  = I18n.t(`category.${cat}`);
    const nights    = pkg.duration_nights ?? 0;
    const days      = pkg.duration_days   ?? 1;
    const priceType = pkg.price_type      ?? 'starting_from';
    const priceLabel = I18n.t(`price.${priceType}`);
    const currency  = I18n.t(`currency.${pkg.currency ?? 'SAR'}`);
    const waUrl     = WA.packageUrl(pkg);
    const phoneNum  = PackageApp.whatsappNumber;

    // ── Render package header ─────────────────────────────────
    const header = document.getElementById('pkgHeader');
    if (header) {
      header.innerHTML = `
        <div class="pkg-header__top">
          <span class="badge badge--${cat}">${catLabel}</span>
          <span class="pkg-header__dest">${destName}</span>
        </div>
        <h1 class="pkg-header__title">${title}</h1>
        <div class="pkg-header__stats">
          <span class="pkg-header__stat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${nights} ${I18n.t('packages.nights')} / ${days} ${I18n.t('packages.days')}
          </span>
          <span class="pkg-header__stat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${destName}
          </span>
        </div>`;
    }

    // ── Render price card ─────────────────────────────────────
    const card = document.getElementById('priceCard');
    if (!card) return;

    const origHTML = pkg.original_price_value
      ? `<span class="price-card__original">${fmtPrice(pkg.original_price_value)}</span>` : '';

    card.innerHTML = `
      <span class="price-card__label">${I18n.t('pkg.bookTitle')}</span>

      <div class="price-card__price-row">
        ${priceLabel ? `<span style="font-size:var(--text-sm);color:var(--color-text-muted)">${priceLabel}</span>` : ''}
        <span class="price-card__value">${fmtPrice(pkg.price_value)}</span>
        <span class="price-card__currency">${currency}</span>
        ${origHTML}
      </div>

      <div class="price-card__meta">
        <div class="price-card__meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${nights} ${I18n.t('packages.nights')} / ${days} ${I18n.t('packages.days')}
        </div>
        ${destName ? `
        <div class="price-card__meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${I18n.t('pkg.to')} ${destName}
        </div>` : ''}
      </div>

      <div class="price-card__actions">
        <a href="${waUrl}" class="btn btn--whatsapp btn--full btn--lg" id="cardWA">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          ${I18n.t('packages.bookNow')}
        </a>
        <p class="price-card__call">
          <span>${I18n.t('pkg.callUs')}</span>
          <a href="tel:${phoneNum}" id="cardPhone" dir="ltr">${phoneNum}</a>
        </p>
      </div>

      <div class="price-card__trust">
        ${['pkg.trust1','pkg.trust2','pkg.trust3'].map(k => `
          <div class="price-card__trust-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            ${I18n.t(k)}
          </div>`).join('')}
      </div>`;
  },
};

/* ============================================================
   14. STICKY BAR (mobile)
   ============================================================ */
const StickyBar = {
  init(pkg) {
    const bar        = document.getElementById('pkgStickyBar');
    const priceEl    = document.getElementById('stickyPrice');
    const stickyWA   = document.getElementById('stickyWA');
    if (!bar) return;

    const lang     = I18n.get();
    const currency = I18n.t(`currency.${pkg.currency ?? 'SAR'}`);
    if (priceEl) priceEl.textContent = `${fmtPrice(pkg.price_value)} ${currency}`;
    if (stickyWA) stickyWA.href = WA.packageUrl(pkg);

    // Show when gallery is out of view
    const gallery = document.getElementById('pkgGallerySection');
    if (!gallery) { bar.classList.add('is-visible'); return; }

    const showObs = new IntersectionObserver(([e]) => {
      bar.classList.toggle('is-visible', !e.isIntersecting);
    }, { threshold: 0 });
    showObs.observe(gallery);

    // Hide when related section is visible (page end)
    const related = document.getElementById('relatedSection');
    if (related) {
      const hideObs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) bar.classList.remove('is-visible');
      }, { threshold: 0.4 });
      hideObs.observe(related);
    }
  },
};

/* ============================================================
   15. RELATED PACKAGES
   ============================================================ */
const RelatedPackages = {
  async load(pkg) {
    const dest = getPrimaryDest(pkg);
    if (!dest) return;

    const destId = pkg.package_destinations?.[0]?.destination_id ?? null;
    const related = await DB.getRelated(destId, pkg.category, pkg.id);

    if (!related?.length) {
      document.getElementById('relatedSection').hidden = true;
      return;
    }

    this.render(related);
  },

  render(packages) {
    const grid = document.getElementById('relatedGrid');
    if (!grid) return;
    const lang = I18n.get();

    grid.innerHTML = packages.map(pkg => {
      const title    = lang === 'ar' ? pkg.title_ar : pkg.title_en;
      const dests    = pkg.package_destinations ?? [];
      const dest     = dests[0]?.destinations;
      const destName = dest ? (lang === 'ar' ? dest.name_ar : dest.name_en) : '';
      const cat      = pkg.category ?? 'luxury';
      const nights   = pkg.duration_nights ?? 0;
      const days     = pkg.duration_days   ?? 1;
      const price    = fmtPrice(pkg.price_value);
      const currency = I18n.t(`currency.${pkg.currency ?? 'SAR'}`);
      const href     = `بكج-سياحي-اندونيسيا.html?slug=${pkg.slug_en}`;
      const imgSrc   = imgUrl(pkg.hero_image_url);

      return `
        <article class="pkg-card" role="listitem">
          <a href="${href}" class="pkg-card__img">
            <img data-src="${imgSrc}" src="${Config.PLACEHOLDER_IMG}"
                 alt="${title}" width="400" height="300" loading="lazy">
            <div class="pkg-card__badge">
              <span class="badge badge--${cat}">${I18n.t(`category.${cat}`)}</span>
            </div>
          </a>
          <div class="pkg-card__body">
            <p class="pkg-card__destination">${destName}</p>
            <h3 class="pkg-card__title"><a href="${href}">${title}</a></h3>
            <p class="pkg-card__duration">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${nights} ${I18n.t('packages.nights')} / ${days} ${I18n.t('packages.days')}
            </p>
            <div class="pkg-card__price">
              <span class="pkg-card__price-label">${I18n.t('packages.from')}</span>
              <div>
                <span class="pkg-card__price-value">${price}</span>
                <span class="pkg-card__price-currency">${currency}</span>
              </div>
            </div>
            <a href="${WA.packageUrl(pkg)}" class="btn btn--whatsapp btn--full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              ${I18n.t('packages.bookNow')}
            </a>
          </div>
        </article>`;
    }).join('');

    // Lazy load related images
    grid.querySelectorAll('img[data-src]').forEach(img => {
      const obs = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      }, { rootMargin: '200px' });
      obs.observe(img);
    });
  },
};

/* ============================================================
   16. DESCRIPTION
   ============================================================ */
const Description = {
  render(pkg) {
    const lang   = I18n.get();
    const full   = lang === 'ar' ? pkg.full_description_ar : pkg.full_description_en;
    const short  = lang === 'ar' ? pkg.short_description_ar : pkg.short_description_en;
    const text   = full || short;

    const section  = document.getElementById('descSection');
    const textEl   = document.getElementById('pkgDescText');
    const toggleBtn = document.getElementById('descToggle');
    if (!section || !textEl || !text) return;

    textEl.textContent = text;

    // Show "read more" if text is long
    const isLong = text.length > 300;
    if (isLong) {
      textEl.classList.add('is-collapsed');
      toggleBtn.hidden = false;

      toggleBtn.addEventListener('click', () => {
        const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        textEl.classList.toggle('is-collapsed', expanded);
        toggleBtn.setAttribute('aria-expanded', String(!expanded));
        const label = toggleBtn.querySelector('[data-i18n]');
        if (label) label.textContent = expanded
          ? I18n.t('pkg.readMore')
          : I18n.t('pkg.readLess');
        toggleBtn.querySelector('svg').style.transform = expanded ? '' : 'rotate(180deg)';
      });
    }

    section.hidden = false;
  },
};

/* ============================================================
   17. FLOATING WA
   ============================================================ */
const FloatingWA = {
  init(pkg) {
    const btn = document.getElementById('waFloat');
    if (!btn) return;
    btn.href = WA.packageUrl(pkg);

    // Always visible on package page (no hero to hide it behind)
    setTimeout(() => btn.classList.add('is-visible'), 800);
  },
};

/* ============================================================
   18. PACKAGE APP — orchestration
   ============================================================ */
const PackageApp = {
  pkg: null,
  whatsappNumber: Config.WHATSAPP_NUMBER,

  async init() {
    // 1. Language
    I18n.init();

    // 2. Static UI
    Navbar.init();
    Lightbox.initUI();

    // 3. Update all general WA links
    WA.updateAll();

    // 4. Get slug
    const slug = getSlug();
    if (!slug) { this.showNotFound(); return; }

    // 5. Fetch package
    if (!DB.isConfigured()) {
      console.info('[Luxpath] Supabase not configured — showing demo state.');
      this.showDemo(slug);
      return;
    }

    const pkg = await DB.getPackage(slug);

    if (!pkg) { this.showNotFound(); return; }

    this.pkg = pkg;

    // 6. Render all sections
    this.render(pkg);
  },

  render(pkg) {
    // SEO + schema
    Meta.set(pkg);

    // ── Hero: set background image + populate title / badge / meta ──
    const lang = I18n.get();
    const heroBg = document.getElementById('pkgHeroBg');
    if (heroBg && pkg.hero_image_url) {
      heroBg.style.backgroundImage  = `url('${imgUrl(pkg.hero_image_url)}')`;
      heroBg.style.backgroundSize   = 'cover';
      heroBg.style.backgroundPosition = 'center';
    }
    const pkgTitleEl = document.getElementById('pkgTitle');
    if (pkgTitleEl) {
      pkgTitleEl.textContent = lang === 'ar' ? pkg.title_ar : pkg.title_en;
      pkgTitleEl.removeAttribute('aria-hidden');
    }
    const pkgCatBadge = document.getElementById('pkgCategoryBadge');
    if (pkgCatBadge) {
      const cat = pkg.category ?? 'luxury';
      pkgCatBadge.innerHTML = `<span class="badge badge--${cat}">${I18n.t('category.' + cat)}</span>`;
      pkgCatBadge.removeAttribute('aria-hidden');
    }
    const pkgHeroMetaEl = document.getElementById('pkgHeroMeta');
    if (pkgHeroMetaEl) {
      const dest = getPrimaryDest(pkg);
      const destName = dest ? (lang === 'ar' ? dest.name_ar : dest.name_en) : '';
      pkgHeroMetaEl.innerHTML = `
        <span style="display:flex;align-items:center;gap:6px">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${pkg.duration_nights} ${I18n.t('packages.nights')} / ${pkg.duration_days} ${I18n.t('packages.days')}
        </span>
        ${destName ? `<span style="display:flex;align-items:center;gap:6px">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${destName}
        </span>` : ''}`;
      pkgHeroMetaEl.removeAttribute('aria-hidden');
    }

    // Breadcrumbs
    Breadcrumbs.render(pkg);

    // Gallery
    Gallery.init(pkg);

    // Package header + price card
    PriceCard.render(pkg);

    // Description
    Description.render(pkg);

    // Itinerary
    Itinerary.render(pkg);

    // Inclusions
    Inclusions.render(pkg);

    // Sticky bar (mobile)
    StickyBar.init(pkg);

    // Floating WA
    FloatingWA.init(pkg);

    // Update all WA general links
    WA.updateAll();

    // Related (async, non-blocking)
    RelatedPackages.load(pkg).catch(() => {});
  },

  // Re-render after language change
  rerender() {
    if (!this.pkg) return;
    Breadcrumbs.render(this.pkg);
    PriceCard.render(this.pkg);
    Description.render(this.pkg);
    Itinerary.render(this.pkg);
    Inclusions.render(this.pkg);
    WA.updateAll();
  },

  showNotFound() {
    document.getElementById('pkgMain').hidden    = true;
    document.getElementById('pkgNotFound').hidden = false;
    document.title = I18n.t('pkg.notFound.title') + ' | لوكس باث';
    WA.updateAll();
  },

  // Demo mode: show a placeholder package when Supabase is not configured
  showDemo(slug) {
    const demo = {
      id: 'demo',
      slug_en: slug,
      slug_ar: slug,
      title_ar: 'باقة شهر العسل الذهبي — بالي',
      title_en: 'Golden Honeymoon Package — Bali',
      short_description_ar: 'تجربة شهر عسل استثنائية في قلب جنة الآلهة. 7 ليالٍ من الرفاهية والحب في أجمل فنادق بالي.',
      short_description_en: 'An exceptional honeymoon experience in the heart of the Island of the Gods. 7 nights of luxury and love in Bali\'s finest hotels.',
      full_description_ar: 'تجربة شهر عسل استثنائية في قلب جنة الآلهة. 7 ليالٍ من الرفاهية والحب في أجمل فنادق بالي. يشمل البرنامج جولات رومانسية في أوبود، زيارة معابد أولوواتو، وتجربة السبا الباليّة الشهيرة. مرشد ناطق بالعربية في كل يوم، وخدمة واتساب 24/7 طوال الرحلة.',
      full_description_en: 'An exceptional honeymoon experience in the heart of the Island of the Gods. 7 nights of luxury and love in Bali\'s finest hotels. The program includes romantic tours in Ubud, visits to Uluwatu Temple, and the famous Balinese spa experience. Arabic-speaking guide every day, and 24/7 WhatsApp support throughout the trip.',
      category: 'honeymoon',
      price_type: 'starting_from',
      price_value: 3500,
      original_price_value: 4200,
      currency: 'SAR',
      duration_nights: 7,
      duration_days: 8,
      min_persons: 2,
      max_persons: 2,
      hero_image_url: null,
      seo_title_ar: 'باقة شهر العسل الذهبي بالي 7 ليالٍ | لوكس باث',
      seo_title_en: 'Golden Honeymoon Package Bali 7 Nights | Luxpath Travel',
      seo_description_ar: 'استمتع بشهر عسل لا يُنسى في بالي مع لوكس باث. 7 ليالٍ شاملة الطيران والفندق والجولات. يبدأ من 3,500 ريال.',
      seo_description_en: 'Enjoy an unforgettable honeymoon in Bali with Luxpath Travel. 7 nights including flights, hotel, and tours. From SAR 3,500.',
      package_destinations: [{
        destinations: { slug: 'bali', name_ar: 'بالي', name_en: 'Bali', tagline_ar: 'جنة الآلهة', tagline_en: 'Island of the Gods' },
      }],
      package_images: [],
      package_inclusions: [
        { type: 'included', icon: 'flight',        text_ar: 'تذاكر الطيران ذهاباً وإياباً', text_en: 'Round-trip flights', display_order: 0 },
        { type: 'included', icon: 'hotel',          text_ar: 'إقامة 7 ليالٍ في فندق 5 نجوم', text_en: '7-night 5-star hotel stay', display_order: 1 },
        { type: 'included', icon: 'transfer',       text_ar: 'نقل من وإلى المطار', text_en: 'Airport transfers', display_order: 2 },
        { type: 'included', icon: 'guide_arabic',   text_ar: 'مرشد سياحي ناطق بالعربية', text_en: 'Arabic-speaking guide', display_order: 3 },
        { type: 'included', icon: 'tour',           text_ar: 'جولات سياحية يومية مختارة', text_en: 'Selected daily guided tours', display_order: 4 },
        { type: 'included', icon: 'meal_breakfast', text_ar: 'إفطار يومي في الفندق', text_en: 'Daily breakfast at hotel', display_order: 5 },
        { type: 'excluded', icon: 'visa',           text_ar: 'تأشيرة الدخول', text_en: 'Entry visa', display_order: 0 },
        { type: 'excluded', icon: 'insurance',      text_ar: 'التأمين السياحي', text_en: 'Travel insurance', display_order: 1 },
        { type: 'excluded', icon: 'custom',         text_ar: 'المصاريف الشخصية', text_en: 'Personal expenses', display_order: 2 },
      ],
      package_itinerary: [
        { day_number: 1, title_ar: 'الوصول والاستقبال في بالي',       title_en: 'Arrival & Welcome in Bali',      description_ar: 'الاستقبال في مطار نغوراه راي الدولي من قبل مرشدنا الناطق بالعربية، ثم التوجه إلى الفندق. مساء ترحيبي وعشاء رومانسي على شاطئ الغروب.', description_en: 'Meet your Arabic-speaking guide at Ngurah Rai Airport and transfer to the hotel. Welcome evening with a romantic sunset dinner.',       location_ar: 'نوسا دوا',  location_en: 'Nusa Dua',  meals_included: ['breakfast'], image_url: null },
        { day_number: 2, title_ar: 'جولة أوبود الثقافية',            title_en: 'Ubud Cultural Tour',             description_ar: 'رحلة إلى أوبود لاستكشاف حقول الأرز الخضراء، ومعبد تيرتا إمبول، وقرية الحرفيين. تجربة مساج باليّ في سبا فاخر.',              description_en: 'Trip to Ubud to explore green rice terraces, Tirta Empul Temple, and the artisan village. Balinese massage experience at a luxury spa.', location_ar: 'أوبود',     location_en: 'Ubud',       meals_included: ['breakfast', 'lunch'], image_url: null },
        { day_number: 3, title_ar: 'شواطئ سيمينياك والتسوق',         title_en: 'Seminyak Beach & Shopping',       description_ar: 'يوم استرخاء على شاطئ سيمينياك الرائع. تسوق في المراكز الراقية والاستمتاع بالأجواء الساحرة.',                               description_en: 'Relaxation day on beautiful Seminyak Beach. Shopping in upscale centers and enjoying the magical atmosphere.',                             location_ar: 'سيمينياك', location_en: 'Seminyak',   meals_included: ['breakfast'], image_url: null },
        { day_number: 4, title_ar: 'معبد أولوواتو وعرض كيجاك',       title_en: 'Uluwatu Temple & Kecak Show',     description_ar: 'زيارة معبد أولوواتو الشهير على حافة المنحدر مع إطلالة خلابة على المحيط. مشاهدة عرض الكيجاك التقليدي عند الغروب.',             description_en: 'Visit the famous Uluwatu Temple on the cliff edge with stunning ocean views. Watch the traditional Kecak dance show at sunset.',         location_ar: 'أولوواتو', location_en: 'Uluwatu',    meals_included: ['breakfast', 'dinner'], image_url: null },
        { day_number: 5, title_ar: 'جزيرة نوسا بينيدا',               title_en: 'Nusa Penida Island',             description_ar: 'رحلة يوم كامل إلى جزيرة نوسا بينيدا الساحرة، مع زيارة كيلينغكينغ بيتش الشهير وبركة الملاك الطبيعية.',                         description_en: 'Full-day trip to the magical Nusa Penida island, visiting famous Kelingking Beach and the natural Angel Billabong pool.',                  location_ar: 'نوسا بينيدا', location_en: 'Nusa Penida', meals_included: ['breakfast'], image_url: null },
        { day_number: 6, title_ar: 'يوم الاسترخاء والسبا',            title_en: 'Relaxation & Spa Day',           description_ar: 'يوم خاص بالاسترخاء التام. سبا استثنائي في فندقكم، وعشاء رومانسي خاص برتبه لكم الفريق.',                                     description_en: 'A special day for complete relaxation. Exceptional spa at your hotel, and a romantic private dinner arranged by our team.',                  location_ar: 'الفندق',    location_en: 'Hotel',       meals_included: ['breakfast', 'dinner'], image_url: null },
        { day_number: 7, title_ar: 'آخر يوم وتسوق التذكارات',         title_en: 'Last Day & Souvenir Shopping',   description_ar: 'تسوق أخير لشراء هدايا وتذكارات بالي للأهل والأصدقاء. غداء وداعي في مطعم مطل على المحيط.',                               description_en: 'Last shopping for Bali gifts and souvenirs for family and friends. Farewell lunch at an ocean-view restaurant.',                           location_ar: 'كوتا',      location_en: 'Kuta',        meals_included: ['breakfast', 'lunch'], image_url: null },
        { day_number: 8, title_ar: 'العودة إلى المملكة',               title_en: 'Return to Saudi Arabia',         description_ar: 'إفطار في الفندق، ثم التوجه إلى المطار مع مرشدنا. وداع من بالي حاملين أجمل الذكريات.',                                     description_en: 'Breakfast at hotel, then transfer to airport with our guide. Farewell from Bali with the most beautiful memories.',                         location_ar: 'المطار',    location_en: 'Airport',     meals_included: ['breakfast'], image_url: null },
      ],
    };

    this.pkg = demo;
    this.render(demo);
  },
};

/* ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => PackageApp.init());
