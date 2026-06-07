/* ============================================================
   LUXPATH TRAVEL — MAIN APPLICATION
   Modular vanilla JS · Supabase backend · Bilingual AR/EN
   ============================================================
   MODULES
   1.  Config
   2.  Translations
   3.  DB (Supabase queries)
   4.  I18n (language system)
   5.  WA (WhatsApp helper)
   6.  Navbar
   7.  ScrollReveal
   8.  Stats (animated counters)
   9.  FloatingWA
   10. Packages
   11. Destinations
   12. Testimonials
   13. FAQ
   14. App (init)
   ============================================================ */

'use strict';

/* ── HTML escape helper (prevents XSS in rendered cards) ── */
const escHtml = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── City map: English key → Arabic display ─────────────── */
const CITY_MAP = {
  // Saudi Arabia
  'Riyadh': 'الرياض', 'Jeddah': 'جدة', 'Mecca': 'مكة المكرمة',
  'Medina': 'المدينة المنورة', 'Dammam': 'الدمام', 'Khobar': 'الخبر',
  'Dhahran': 'الظهران', 'Abha': 'أبها', 'Taif': 'الطائف', 'Tabuk': 'تبوك',
  'Buraydah': 'بريدة', 'Khamis Mushait': 'خميس مشيط', 'Jubail': 'الجبيل',
  'Yanbu': 'ينبو', 'Najran': 'نجران', 'Jizan': 'جيزان', 'Hail': 'حائل',
  'Sakaka': 'سكاكا', 'Arar': 'عرعر',
  // UAE
  'Dubai': 'دبي', 'Abu Dhabi': 'أبوظبي', 'Sharjah': 'الشارقة',
  'Ajman': 'عجمان', 'Ras Al Khaimah': 'رأس الخيمة',
  // Other Gulf
  'Doha': 'الدوحة', 'Kuwait City': 'مدينة الكويت',
  'Manama': 'المنامة', 'Muscat': 'مسقط',
  // Levant & beyond
  'Amman': 'عمّان', 'Cairo': 'القاهرة', 'Alexandria': 'الإسكندرية',
  'Baghdad': 'بغداد', 'Damascus': 'دمشق',
};

/* ============================================================
   1. CONFIG
   ============================================================ */
const Config = Object.freeze({
  SUPABASE_URL: 'https://fgeeysssiesdlryoygoa.supabase.co',        // ← replace
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWV5c3NzaWVzZGxyeW95Z29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTI0MzUsImV4cCI6MjA5NTk4ODQzNX0.Sa3vcq9U2BrzFobTqQS4sAmVpXkRH09_PGzol9-NCvw',   // ← replace
  get STORAGE_URL() { return this.SUPABASE_URL + '/storage/v1/object/public/luxpath-media/'; },
  WHATSAPP_NUMBER: '+6281111826527',
  LANG_KEY: 'luxpath_lang',
  DEFAULT_LANG: 'ar',
  CURRENCY_KEY: 'luxpath_currency',
  DEFAULT_CURRENCY: 'SAR',
  PLACEHOLDER_IMG: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F0EDE8" width="400" height="300"/%3E%3C/svg%3E',
});


/* ============================================================
   2. TRANSLATIONS
   ============================================================ */
const T = {
  ar: {
    // Accessibility
    'a11y.skip': 'تخطَّ إلى المحتوى',

    // Nav
    'nav.home': 'الرئيسية',
    'nav.destinations': 'الوجهات',
    'nav.packages': 'الباقات',
    'nav.about': 'عن لوكس باث',
    'nav.contact': 'تواصل معنا',
    'nav.whatsapp': 'واتساب',

    // Hero
    'hero.badge': 'وجهة أكثر من 2,000 عائلة وعرسان سعوديين',
    'hero.title': 'اكتشف سحر إندونيسيا',
    'hero.subtitle': 'رحلات فاخرة مصممة لك من المملكة العربية السعودية',
    'hero.cta.whatsapp': 'احجز عبر واتساب الآن',
    'hero.cta.packages': 'تصفح باقاتنا',

    // Stats
    'stats.trips': 'رحلة ناجحة',
    'stats.families': 'عائلة وعرسان سعوديين',
    'stats.destinations': 'وجهات',
    'stats.years': 'سنوات خبرة',

    // Packages
    'packages.eyebrow': 'الأكثر طلباً',
    'packages.title': 'باقاتنا المميزة',
    'packages.subtitle': 'اختر من أفضل باقاتنا السياحية إلى إندونيسيا',
    'packages.viewAll': 'عرض جميع الباقات',
    'packages.bookNow': 'احجز الآن',
    'packages.from': 'يبدأ من',
    'packages.nights': 'ليالٍ',
    'packages.days': 'أيام',
    'packages.empty': 'لا توجد باقات متاحة حالياً. تواصل معنا مباشرة.',

    // Category labels
    'category.honeymoon': 'شهر العسل',
    'category.family': 'عائلي',
    'category.luxury': 'فاخر',
    'category.adventure': 'مغامرة',

    // Price types
    'price.exact': '',
    'price.starting_from': 'يبدأ من',
    'price.approximate': 'يقارب',

    // Currency
    'currency.SAR': 'ريال',
    'currency.IDR': 'روبية',
    'currency.USD': 'دولار',
    'currency.EUR': 'يورو',

    // Why
    'why.eyebrow': 'ميزتنا',
    'why.title': 'لماذا تختار لوكس باث؟',
    'why.subtitle': 'نحن لسنا مجرد وكالة سياحية أخرى',
    'why.1.title': 'تخصص كامل في إندونيسيا',
    'why.1.body': 'نحن متخصصون في وجهة واحدة فقط لنقدم لك أعمق خبرة وأفضل تجربة ممكنة',
    'why.2.title': 'خدمة واتساب 24/7',
    'why.2.body': 'فريقنا متاح على واتساب قبل رحلتك وأثناءها وبعدها. أنت لست وحدك أبداً',
    'why.3.title': 'أسعار شاملة وشفافة',
    'why.3.body': 'لا رسوم مخفية. كل شيء واضح ومحدد من اليوم الأول قبل أن تدفع أي ريال',
    'why.4.title': 'مرشدون يتحدثون العربية',
    'why.4.body': 'جميع مرشدينا السياحيين في إندونيسيا يتحدثون العربية بطلاقة. رحلتك بلغتك',

    // Destinations
    'destinations.eyebrow': 'وجهاتنا',
    'destinations.title': 'وجهاتنا في إندونيسيا',
    'destinations.subtitle': 'استكشف أجمل المناطق السياحية معنا',
    'destinations.explore': 'اكتشف',
    'dest.bali': 'بالي',
    'dest.jakarta': 'جاكرتا',
    'dest.bandung': 'باندونغ',
    'dest.lombok': 'لومبوك',

    // Testimonials
    'testimonials.eyebrow': 'آراء العملاء',
    'testimonials.title': 'ماذا يقول عملاؤنا؟',
    'testimonials.subtitle': 'تجارب حقيقية من مسافرين سعوديين',
    'testimonials.empty': 'سيتم إضافة تجارب عملائنا قريباً.',
    'testimonials.loadMore': 'عرض المزيد',
    'testimonials.reply': 'رد',
    'testimonials.replyBy': 'فريق لوكس باث',
    'testimonials.cat.honeymoon': 'شهر عسل',
    'testimonials.cat.family': 'عائلي',
    'testimonials.cat.luxury': 'فاخر',
    'testimonials.cat.adventure': 'مغامرة',

    // FAQ
    'faq.eyebrow': 'مساعدة',
    'faq.title': 'الأسئلة الشائعة',
    'faq.subtitle': 'إجابات على أكثر الأسئلة التي نتلقاها',
    'faq.more': 'عندك سؤال آخر؟ اسألنا على واتساب',
    'faq.cta': 'تواصل معنا الآن',
    'faq.q1': 'كيف أحجز رحلتي مع لوكس باث؟',
    'faq.a1': 'تواصل معنا عبر واتساب وأخبرنا بوجهتك وعدد المسافرين وتاريخ الرحلة المفضل. سنرسل لك عرضاً مخصصاً خلال ساعات قليلة.',
    'faq.q2': 'ما الذي تشمله الباقة؟',
    'faq.a2': 'تشمل باقاتنا عادةً تذاكر الطيران ذهاباً وإياباً، الإقامة في فنادق 4 و5 نجوم، الجولات السياحية اليومية، والمرشد السياحي المتحدث بالعربية.',
    'faq.q3': 'هل الأسعار شاملة للضرائب والرسوم؟',
    'faq.a3': 'نعم، الأسعار المعروضة شاملة لجميع الضرائب والرسوم. لا توجد أي رسوم مخفية أو مفاجآت.',
    'faq.q4': 'هل يتحدث مرشدوكم اللغة العربية؟',
    'faq.a4': 'نعم، جميع مرشدينا السياحيين في إندونيسيا يتحدثون العربية بطلاقة. رحلتك ستكون بلغتك الأم بالكامل.',
    'faq.q5': 'ماذا لو احتجت مساعدة أثناء الرحلة؟',
    'faq.a5': 'فريقنا متاح على واتساب على مدار الساعة طوال أيام رحلتك. ستجد دائماً شخصاً يرد عليك في دقائق.',
    'faq.q6': 'ما هي سياسة الإلغاء؟',
    'faq.a6': 'سياسة الإلغاء تختلف حسب الباقة وتواريخ الرحلة. تواصل معنا عبر واتساب للحصول على التفاصيل الكاملة لباقتك.',

    // Contact CTA
    'cta.title': 'جاهز لتخطيط رحلتك الفاخرة؟',
    'cta.subtitle': 'تواصل معنا الآن وسنصمم لك رحلة الأحلام في اقل من ساعة',
    'cta.whatsapp': 'تحدث معنا على واتساب',
    'cta.phone': 'أو اتصل بنا:',

    // Footer
    'footer.tagline': 'وكالتك المتخصصة لرحلات إندونيسيا من المملكة العربية السعودية',
    'footer.links': 'روابط سريعة',
    'footer.destinations': 'وجهاتنا',
    'footer.contact': 'تواصل معنا',
    'footer.copyright': `© ${new Date().getFullYear()} لوكس باث للسياحة. جميع الحقوق محفوظة.`,
    'footer.privacy': 'سياسة الخصوصية',

    // WhatsApp pre-fill messages
    'wa.general': 'مرحباً، أود الاستفسار عن باقاتكم السياحية إلى إندونيسيا',
    'wa.package': 'مرحباً، حاب استفسر عن باقة "{title}"',
    'wa.dest': 'مرحباً، أود الاستفسار عن رحلات {destination}',
  },

  en: {
    'a11y.skip': 'Skip to content',
    'nav.home': 'Home',
    'nav.destinations': 'Destinations',
    'nav.packages': 'Packages',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.whatsapp': 'WhatsApp',
    'hero.badge': 'Trusted by 2,000+ Saudi families & couples',
    'hero.title': 'Discover the Magic of Indonesia',
    'hero.subtitle': 'Luxury travel packages crafted for Saudi travelers',
    'hero.cta.whatsapp': 'Book Now via WhatsApp',
    'hero.cta.packages': 'Browse Our Packages',
    'stats.trips': 'Successful Trips',
    'stats.families': 'Saudi Families & couples',
    'stats.destinations': 'Destinations',
    'stats.years': 'Years Experience',
    'packages.eyebrow': 'Most Popular',
    'packages.title': 'Featured Packages',
    'packages.subtitle': 'Explore our most popular Indonesia travel packages',
    'packages.viewAll': 'View All Packages',
    'packages.bookNow': 'Book Now',
    'packages.from': 'From',
    'packages.nights': 'Nights',
    'packages.days': 'Days',
    'packages.empty': 'No packages available right now. Contact us directly.',
    'category.honeymoon': 'Honeymoon',
    'category.family': 'Family',
    'category.luxury': 'Luxury',
    'category.adventure': 'Adventure',
    'price.exact': '',
    'price.starting_from': 'From',
    'price.approximate': 'Approx.',
    'currency.SAR': 'SAR',
    'currency.IDR': 'IDR',
    'currency.USD': 'USD',
    'currency.EUR': 'EUR',
    'why.eyebrow': 'Our Advantage',
    'why.title': 'Why Choose Luxpath?',
    'why.subtitle': 'We are not just another travel agency',
    'why.1.title': 'Indonesia Specialists',
    'why.1.body': 'We focus exclusively on Indonesia so you get expert-level planning and insider knowledge',
    'why.2.title': '24/7 WhatsApp Support',
    'why.2.body': 'Our team is with you before, during, and after your trip — always one message away',
    'why.3.title': 'Fully Inclusive Pricing',
    'why.3.body': 'No hidden fees. Everything is clear and confirmed before you pay a single riyal',
    'why.4.title': 'Arabic-Speaking Guides',
    'why.4.body': 'All our guides in Indonesia speak fluent Arabic. Your trip, in your language',
    'destinations.eyebrow': 'Our Destinations',
    'destinations.title': 'Our Indonesia Destinations',
    'destinations.subtitle': 'Explore the most beautiful regions with us',
    'destinations.explore': 'Explore',
    'dest.bali': 'Bali',
    'dest.jakarta': 'Jakarta',
    'dest.bandung': 'Bandung',
    'dest.lombok': 'Lombok',
    'testimonials.eyebrow': 'Client Reviews',
    'testimonials.title': 'What Our Clients Say',
    'testimonials.subtitle': 'Real experiences from Saudi travelers',
    'testimonials.empty': 'Client testimonials coming soon.',
    'testimonials.loadMore': 'Load More',
    'testimonials.reply': 'Reply',
    'testimonials.replyBy': 'Luxpath Travel Team',
    'testimonials.cat.honeymoon': 'Honeymoon',
    'testimonials.cat.family': 'Family',
    'testimonials.cat.luxury': 'Luxury',
    'testimonials.cat.adventure': 'Adventure',
    'faq.eyebrow': 'Help',
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Answers to the questions we hear most',
    'faq.more': 'Have another question? Ask us on WhatsApp',
    'faq.cta': 'Contact Us Now',
    'faq.q1': 'How do I book a trip with Luxpath?',
    'faq.a1': 'Contact us on WhatsApp with your destination, number of travelers, and preferred dates. We\'ll send you a custom quote within a few hours.',
    'faq.q2': 'What does the package include?',
    'faq.a2': 'Our packages typically include round-trip flights, 4/5-star accommodation, daily guided tours, and an Arabic-speaking guide.',
    'faq.q3': 'Are prices inclusive of all taxes and fees?',
    'faq.a3': 'Yes. All displayed prices include taxes and fees. No hidden charges, no surprises.',
    'faq.q4': 'Do your guides speak Arabic?',
    'faq.a4': 'Yes. All our Indonesian guides speak fluent Arabic. Your entire trip will be in your native language.',
    'faq.q5': 'What if I need help during the trip?',
    'faq.a5': 'Our team is available on WhatsApp 24/7 for the entire duration of your trip. Someone will always reply within minutes.',
    'faq.q6': 'What is the cancellation policy?',
    'faq.a6': 'Cancellation policies vary by package and travel dates. Contact us on WhatsApp for the full details of your specific package.',
    'cta.title': 'Ready to Plan Your Luxury Trip?',
    'cta.subtitle': 'Contact us now and we\'ll design your dream trip in less than an hour',
    'cta.whatsapp': 'Chat with Us on WhatsApp',
    'cta.phone': 'Or call us:',
    'footer.tagline': 'Your specialist agency for Indonesia travel from Saudi Arabia',
    'footer.links': 'Quick Links',
    'footer.destinations': 'Destinations',
    'footer.contact': 'Contact Us',
    'footer.copyright': `© ${new Date().getFullYear()} Luxpath Travel. All rights reserved.`,
    'footer.privacy': 'Privacy Policy',
    'wa.general': 'Hello, I\'d like to inquire about your Indonesia travel packages',
    'wa.package': 'Hello, I\'m interested in the "{title}" package',
    'wa.dest': 'Hello, I\'d like to inquire about trips to {destination}',
  },
};


/* ============================================================
   3. DB — Supabase query helpers
   ============================================================ */
const DB = (() => {
  // Guard: skip if placeholder credentials
  const isConfigured = () =>
    Config.SUPABASE_URL.startsWith('https://') && Config.SUPABASE_ANON_KEY.startsWith('eyJ');

  let _client = null;

  const client = () => {
    if (!_client) {
      if (!isConfigured()) return null;
      _client = supabase.createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);
    }
    return _client;
  };

  // Wrap every query with try/catch; return null on error
  const q = async (fn) => {
    const db = client();
    if (!db) return null;
    try {
      const { data, error } = await fn(db);
      if (error) { console.warn('[Luxpath DB]', error.message); return null; }
      return data;
    } catch (err) {
      console.warn('[Luxpath DB]', err.message);
      return null;
    }
  };

  return {
    isConfigured,

    getFeaturedPackages: () => q(db =>
      db.from('packages')
        .select(`
          id, slug_en, slug_ar, title_ar, title_en,
          short_description_ar, short_description_en,
          category, price_type,
          price_value, original_price_value,
          price_value_idr, original_price_value_idr,
          price_value_usd, original_price_value_usd,
          currency,
          duration_nights, duration_days, hero_image_url,
          package_destinations (
            destinations ( slug, name_ar, name_en )
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(6)
    ),

    getDestinations: () => q(db =>
      db.from('destinations')
        .select('id, slug, name_ar, name_en, tagline_ar, tagline_en, card_image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
    ),

    getTestimonials: () => q(db =>
      db.from('testimonials')
        .select(`
          reviewer_name_display, reviewer_city, reviewer_flag, rating,
          review_ar, review_en, reply_ar, reply_en,
          trip_month, trip_year, trip_category
        `)
        .eq('is_approved', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
    ),

    getSettings: () => q(async db => {
      const { data, error } = await db
        .from('site_settings')
        .select('key, value, value_ar, value_en');
      if (error) return { data: null, error };
      // Convert array to key-value object for easy access
      const obj = {};
      (data || []).forEach(row => { obj[row.key] = row; });
      return { data: obj, error: null };
    }),
  };
})();


/* ============================================================
   4. I18n — language detection, switching, DOM update
   ============================================================ */
const I18n = (() => {
  let lang = Config.DEFAULT_LANG;

  const detect = () => {
    // 1. Honour an explicit user preference saved in localStorage
    const stored = localStorage.getItem(Config.LANG_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
    // 2. English sub-directory → English
    if (window.location.pathname.startsWith('/en/')) return 'en';
    // 3. Default: always Arabic (Saudi-market primary language)
    return 'ar';
  };

  // Update every [data-i18n] element in the DOM
  const applyDOM = () => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = T[lang][key];
      if (text !== undefined) el.textContent = text;
    });

    // Update lang toggle buttons
    document.querySelectorAll('.btn-lang').forEach(btn => {
      btn.textContent = lang === 'ar' ? 'EN' : 'ع';
      btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    });
  };

  return {
    init() {
      lang = detect();
      // Freeze the mobile menu transform during direction init so it
      // snaps to position rather than sliding visibly across the screen.
      const _menu = document.getElementById('mobileMenu');
      if (_menu) _menu.style.transition = 'none';
      applyDOM();
      // Restore after two paint frames — browser has committed the
      // correct initial position by then, so restoring is invisible.
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
        // Re-render dynamic sections if data already loaded
        if (App.cachedPackages) Packages.render(App.cachedPackages);
        if (App.cachedDestinations) Destinations.render(App.cachedDestinations);
        if (App.cachedTestimonials) Testimonials.render(App.cachedTestimonials);
        b.classList.remove('lang-switching');
        b.classList.add('lang-entering');
        setTimeout(() => b.classList.remove('lang-entering'), 350);
      }, 200);
    },

    get: () => lang,

    // Translate a key, substituting {var} placeholders
    t(key, vars = {}) {
      let text = T[lang][key] ?? T[Config.DEFAULT_LANG][key] ?? key;
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
      return text;
    },
  };
})();


/* ============================================================
   5. CURRENCY — visitor currency preference (SAR / IDR / USD)
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

    // Returns { value, label, originalValue } for the current currency, falling back to SAR.
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
   6. WA — WhatsApp URL builder
   ============================================================ */
const WA = {
  get phone() { return Config.WHATSAPP_NUMBER; },
  set phone(v) { Config = { ...Config, WHATSAPP_NUMBER: v }; }, // won't work with Object.freeze — managed via App

  url(message) {
    const num = App.whatsappNumber.replace(/\D/g, '');
    return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  },

  generalUrl() {
    return this.url(I18n.t('wa.general'));
  },

  packageUrl(titleAr, titleEn, destNameAr, destNameEn) {
    const title = I18n.get() === 'ar' ? titleAr : titleEn;
    const dest = I18n.get() === 'ar' ? destNameAr : destNameEn;
    return this.url(I18n.t('wa.package', { title, destination: dest }));
  },

  destUrl(nameAr, nameEn) {
    const dest = I18n.get() === 'ar' ? nameAr : nameEn;
    return this.url(I18n.t('wa.dest', { destination: dest }));
  },

  // Update all [data-wa="general"] links in the DOM
  updateAll() {
    const url = this.generalUrl();
    document.querySelectorAll('[data-wa="general"]').forEach(el => { el.href = url; });
  },
};


/* ============================================================
   6. NAVBAR
   ============================================================ */
const Navbar = {
  init() {
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('menuToggle');
    const closeBtn = document.getElementById('mobileMenuClose');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    const menu = document.getElementById('mobileMenu');

    if (!navbar) return;

    // Sticky: transparent → white on scroll
    const onScroll = () => {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run on init in case page is pre-scrolled

    // Mobile menu
    menuBtn?.addEventListener('click', () => this.openMenu());
    closeBtn?.addEventListener('click', () => this.closeMenu());
    backdrop?.addEventListener('click', () => this.closeMenu());

    // Close on internal links
    menu?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => this.closeMenu());
    });

    // Close on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeMenu();
    });

    // Language toggles (navbar + mobile menu)
    document.querySelectorAll('.btn-lang').forEach(btn => {
      btn.addEventListener('click', () => I18n.toggle());
    });

    // Currency toggle — cycles SAR → IDR → USD → SAR
    document.querySelectorAll('.btn-currency').forEach(btn => {
      btn.addEventListener('click', () => {
        Currency.cycle();
        // Re-render package grid with new currency if already loaded
        if (App.cachedPackages?.length) Packages.render(App.cachedPackages);
      });
    });

    // Logo: scroll to top if already on homepage, otherwise navigate
    const isHomepage = () => {
      const p = window.location.pathname;
      return p === '/' || p === '/index.html' || p.endsWith('/index.html');
    };
    document.querySelectorAll('.navbar__logo, .mobile-menu__logo').forEach(logo => {
      logo.addEventListener('click', e => {
        if (isHomepage()) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.closeMenu();
        }
        // On other pages: default href="/" navigation applies
      });
    });

    // Footer logo: same smooth-scroll-to-top behaviour on homepage
    document.querySelector('.footer__logo-link')?.addEventListener('click', e => {
      if (isHomepage()) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  },

  openMenu() {
    const menu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    const btn = document.getElementById('menuToggle');
    menu?.classList.add('is-open');
    backdrop?.classList.add('is-open');
    btn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus first link for accessibility
    menu?.querySelector('a')?.focus();
  },

  closeMenu() {
    const menu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    const btn = document.getElementById('menuToggle');
    menu?.classList.remove('is-open');
    backdrop?.classList.remove('is-open');
    btn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },
};


/* ============================================================
   7. SCROLL REVEAL
   ============================================================ */
const ScrollReveal = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  },

  // Call after dynamically added content to observe new .reveal elements
  observe(container) {
    if (!container) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  },
};


/* ============================================================
   8. STATS — animated number counters
   ============================================================ */
const Stats = {
  animateEl(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';

    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix ?? '';
    const duration = 1400;
    const step = 16;
    const steps = duration / step;
    const increment = target / steps;
    let current = 0;

    const tick = () => {
      current = Math.min(current + increment, target);
      // Format number with locale-appropriate separator
      el.textContent = new Intl.NumberFormat('en-US').format(Math.floor(current)) + suffix;
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  init() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (prefersReduced) {
          // Just set the final value
          const el = entry.target;
          el.textContent = new Intl.NumberFormat('en-US').format(parseInt(el.dataset.target, 10)) + (el.dataset.suffix ?? '');
        } else {
          this.animateEl(entry.target);
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
  },
};


/* ============================================================
   9. HERO SLIDER
   ============================================================ */
const HeroSlider = {
  _slides: [],
  _current: 0,
  _timer: null,
  INTERVAL: 5500,   // ms between transitions

  init() {
    this._slides = Array.from(document.querySelectorAll('.hero__slide'));
    if (this._slides.length < 2) return;

    // Skip animation when user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Pause when tab is hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(this._timer);
      } else {
        this._start();
      }
    });

    this._start();
  },

  _start() {
    clearInterval(this._timer);
    this._timer = setInterval(() => this._next(), this.INTERVAL);
  },

  _next() {
    this._slides[this._current].classList.remove('is-active');
    this._current = (this._current + 1) % this._slides.length;
    this._slides[this._current].classList.add('is-active');
  },

  reinit() {
    clearInterval(this._timer);
    this._current = 0;
    this.init();
  },
};


/* ============================================================
   10. FLOATING WHATSAPP
   ============================================================ */
const FloatingWA = {
  btn: null,

  init() {
    this.btn = document.getElementById('waFloat');
    if (!this.btn) return;

    this.btn.href = WA.generalUrl();

    // Show button once hero scrolls out of view
    const hero = document.getElementById('hero');
    if (!hero) {
      this.btn.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      this.btn.classList.toggle('is-visible', !entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(hero);
  },

  updateHref() {
    if (this.btn) this.btn.href = WA.generalUrl();
  },
};


/* ============================================================
   10. PACKAGES
   ============================================================ */
const Packages = {
  grid: null,

  init() {
    this.grid = document.getElementById('packagesGrid');
    if (this.grid) this.grid.setAttribute('aria-busy', 'true');
  },

  render(packages) {
    const grid = document.getElementById('packagesGrid');
    if (!grid) return;

    grid.setAttribute('aria-busy', 'false');

    if (!packages?.length) {
      grid.innerHTML = `
        <div class="packages-empty">
          <p data-i18n="packages.empty">${I18n.t('packages.empty')}</p>
        </div>`;
      return;
    }

    grid.innerHTML = packages.map(pkg => this.cardHTML(pkg)).join('');
    this.bindWALinks(grid, packages);
    this.lazyLoadImages(grid);
    this.bindCardClicks(grid);
  },

  bindCardClicks(grid) {
    grid.addEventListener('click', (e) => {
      if (e.target.closest('.btn--whatsapp')) return;
      const card = e.target.closest('.pkg-card');
      if (!card) return;
      const link = card.querySelector('.pkg-card__title a');
      if (link?.href) window.location.href = link.href;
    });
  },

  // Get the primary destination from nested package_destinations
  getPrimaryDest(pkg) {
    const dests = pkg.package_destinations ?? [];
    return dests[0]?.destinations ?? null;
  },

  cardHTML(pkg) {
    const lang = I18n.get();
    const title = lang === 'ar' ? pkg.title_ar : pkg.title_en;
    const dest = this.getPrimaryDest(pkg);
    const destName = dest ? (lang === 'ar' ? dest.name_ar : dest.name_en) : '';
    const cat = pkg.category ?? 'luxury';
    const catLabel = I18n.t(`category.${cat}`);
    const nights = pkg.duration_nights ?? 0;
    const days = pkg.duration_days ?? 1;
    const priceType = pkg.price_type ?? 'starting_from';
    const priceLabel = I18n.t(`price.${priceType}`);
    const priceInfo = Currency.format(pkg);
    const price = priceInfo.value;
    const currLabel = priceInfo.label;
    const imgSrc = pkg.hero_image_url
      ? `${Config.STORAGE_URL}${pkg.hero_image_url}`
      : Config.PLACEHOLDER_IMG;
    const slugKey = lang === 'ar' ? pkg.slug_ar : pkg.slug_en;
    const detailUrl = `بكج-سياحي-اندونيسيا.html?slug=${pkg.slug_en}`;

    const origHTML = priceInfo.originalValue
      ? `<span class="pkg-card__price-original">${priceInfo.originalValue}</span>`
      : '';

    const discountPct = (pkg.price_value && pkg.original_price_value && pkg.original_price_value > pkg.price_value)
      ? Math.round((1 - pkg.price_value / pkg.original_price_value) * 100) : 0;
    const discountBadge = discountPct > 0 ? `<span class="badge badge--discount">-${discountPct}%</span>` : '';

    return `
      <article class="pkg-card" data-package-id="${pkg.id}" role="listitem">
        <a href="${detailUrl}" class="pkg-card__img" aria-label="${title}">
          <img
            data-src="${imgSrc}"
            src="${Config.PLACEHOLDER_IMG}"
            alt="${title} — ${destName}"
            width="400" height="300"
            loading="lazy">
          <div class="pkg-card__badge">
            <span class="badge badge--${cat}">${catLabel}</span>
            ${discountBadge}
          </div>
        </a>
        <div class="pkg-card__body">
          <p class="pkg-card__destination">${destName}</p>
          <h3 class="pkg-card__title">
            <a href="${detailUrl}">${title}</a>
          </h3>
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
          <a href="#"
             class="btn btn--whatsapp btn--full"
             data-pkg-wa="${pkg.id}"
             aria-label="${I18n.t('packages.bookNow')} — ${title}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            ${I18n.t('packages.bookNow')}
          </a>
        </div>
      </article>`;
  },

  bindWALinks(grid, packages) {
    grid.querySelectorAll('[data-pkg-wa]').forEach(btn => {
      const id = btn.dataset.pkgWa;
      const pkg = packages.find(p => p.id === id);
      if (!pkg) return;
      const dest = this.getPrimaryDest(pkg);
      btn.href = WA.packageUrl(
        pkg.title_ar, pkg.title_en,
        dest?.name_ar ?? '', dest?.name_en ?? ''
      );
    });
  },

  lazyLoadImages(container) {
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
  },
};


/* ============================================================
   11. DESTINATIONS
   Hardcoded data for Bali, Jakarta, Puncak.
   Cards open an in-page panel instead of navigating.
   ============================================================ */

const DEST_DATA = [
  {
    slug: 'bali',
    name_ar: 'بالي',
    name_en: 'Bali',
    tagline_ar: 'جزيرة الرفاهية والروقان',
    tagline_en: 'Island of the Gods',
    images: [
      'destination-image/bali/bali-1.webp',
      'destination-image/bali/bali-2.webp',
      'destination-image/bali/bali-3.webp',
      'destination-image/bali/bali-4.webp',
      'destination-image/bali/bali-5.webp',
      'destination-image/bali/bali-6.webp',
    ],
    hero_ar: 'جزيرة بالي هي جوهرة إندونيسيا السياحية — تجمع بين روحانية المعابد القديمة وسحر الطبيعة الخضراء وفخامة المنتجعات الحصرية في تجربة لا تُنسى.',
    hero_en: 'Bali is Indonesia\'s crown jewel — an island where ancient temple spirituality meets lush nature and world-class luxury resorts in an unforgettable experience.',
    attractions: [
      { icon: '🛕', name_ar: 'معبد تانا لوت', name_en: 'Tanah Lot Temple' },
      { icon: '🎨', name_ar: 'قرية أوبود الثقافية', name_en: 'Ubud Cultural Village' },
      { icon: '🏖️', name_ar: 'شاطئ سمينياك الفاخر', name_en: 'Seminyak Luxury Beach' },
      { icon: '🌿', name_ar: 'مدرجات الأرز تيغالالانغ', name_en: 'Tegalalang Rice Terraces' },
      { icon: '🤿', name_ar: 'غوص نوسا بينيدا', name_en: 'Nusa Penida Diving' },
      { icon: '⭐', name_ar: 'منتجعات نوسا دوا 5 نجوم', name_en: 'Nusa Dua 5-Star Resorts' },
    ],
    luxpath_ar: [
      'إقامة في أفضل المنتجعات الخمس نجوم المطلة على البحر أو حقول الأرز',
      'جولات خاصة مع مرشد سياحي متحدث بالعربية بشكل حصري',
      'تجربة غروب الشمس في معبد تانا لوت مع ترتيبات VIP',
      'باقات شهر العسل مع تجارب رومانسية مخصصة',
    ],
    luxpath_en: [
      'Stay in top 5-star resorts overlooking the ocean or rice fields',
      'Private tours with an exclusive Arabic-speaking guide',
      'Sunset experience at Tanah Lot Temple with VIP arrangements',
      'Honeymoon packages with tailored romantic experiences',
    ],
  },
  {
    slug: 'jakarta',
    name_ar: 'جاكرتا',
    name_en: 'Jakarta',
    tagline_ar: 'العاصمة النابضة بالحياة',
    tagline_en: 'The Vibrant Capital',
    images: [
      'destination-image/jakarta/jakarta-1.webp',
      'destination-image/jakarta/jakarta-2.webp',
      'destination-image/jakarta/jakarta-3.webp',
      'destination-image/jakarta/jakarta-4.webp',
    ],
    hero_ar: 'جاكرتا، عاصمة إندونيسيا، مدينة لا تنام — تمزج بين ناطحات السحاب الحديثة والأحياء التاريخية الأصيلة ومراكز التسوق الفاخرة في مشهد حضري استثنائي.',
    hero_en: 'Jakarta, Indonesia\'s capital, is a city that never sleeps — blending modern skyscrapers, authentic historic districts, and luxury shopping malls in an exceptional urban landscape.',
    attractions: [
      { icon: '🏛️', name_ar: 'موناس — الصرح الوطني', name_en: 'Monas National Monument' },
      { icon: '🏘️', name_ar: 'كوتا القديمة (باتافيا)', name_en: 'Old Batavia (Kota Tua)' },
      { icon: '🛍️', name_ar: 'مولات التسوق الفاخرة', name_en: 'Luxury Shopping Malls' },
      { icon: '🍽️', name_ar: 'مطاعم فاخرة متنوعة', name_en: 'World-Class Restaurants' },
      { icon: '🌃', name_ar: 'سكاي لاونج على الطابق 47', name_en: 'Sky Lounge on Floor 47' },
      { icon: '🎭', name_ar: 'المتحف الوطني الإندونيسي', name_en: 'National Museum of Indonesia' },
    ],
    luxpath_ar: [
      'إقامة في الفنادق المركزية الفاخرة بأسعار تنافسية',
      'جولة في الأحياء التاريخية مع مرشد عربي متمكن',
      'تجربة التسوق في أفخم مولات جاكرتا مع مرافق شخصي',
      'وجبات في أفضل المطاعم الإندونيسية والدولية',
    ],
    luxpath_en: [
      'Stay in central luxury hotels at competitive prices',
      'Tour of historic districts with a knowledgeable Arabic guide',
      'Shopping experience in Jakarta\'s finest malls with a personal assistant',
      'Dining at the best Indonesian and international restaurants',
    ],
  },
  {
    slug: 'puncak',
    name_ar: 'بونشاك',
    name_en: 'Puncak',
    tagline_ar: 'جبال الطبيعة الخضراء',
    tagline_en: 'A Magical Mountain Escape',
    images: [
      'destination-image/puncak/puncak-1.webp',
      'destination-image/puncak/puncak-2.webp',
      'destination-image/puncak/puncak-3.webp',
    ],
    hero_ar: 'بونشاك هي منتجع الجبال المفضل لعائلات جاكرتا — تشتهر بمزارع الشاي الخضراء اللانهائية والهواء النقي المنعش والإطلالات الخلابة على القمم الجبلية.',
    hero_en: 'Puncak is Jakarta\'s favourite mountain resort — famous for endless green tea plantations, fresh mountain air, and stunning views of volcanic peaks.',
    attractions: [
      { icon: '🍃', name_ar: 'مزارع الشاي الكبرى', name_en: 'Grand Tea Plantations' },
      { icon: '💧', name_ar: 'شلالات جميلة', name_en: 'Beautiful Waterfalls' },
      { icon: '🌺', name_ar: 'حديقة سيبوداس النباتية', name_en: 'Cibodas Botanical Garden' },
      { icon: '⛰️', name_ar: 'قمم جبلية خلابة', name_en: 'Scenic Mountain Summits' },
      { icon: '🏡', name_ar: 'فيلات جبلية خاصة', name_en: 'Private Mountain Villas' },
      { icon: '🌿', name_ar: 'محمية طبيعية خضراء', name_en: 'Lush Nature Reserve' },
    ],
    luxpath_ar: [
      'إقامة في فيلات جبلية خاصة بإطلالات خلابة',
      'جولة حصرية في مزارع الشاي مع تجربة القطاف والتحضير',
      'باقة عائلية مع أنشطة طبيعية آمنة للأطفال',
      'مسافة ساعتين فقط من جاكرتا — مثالية لرحلة يوم أو ليلة',
    ],
    luxpath_en: [
      'Stay in private mountain villas with breathtaking views',
      'Exclusive tea plantation tour with picking and brewing experience',
      'Family package with safe nature activities for children',
      'Just 2 hours from Jakarta — perfect for a day trip or overnight stay',
    ],
  },

  // ── Visible by default (4th card) ────────────────────────
  {
    slug: 'lombok',
    name_ar: 'لومبوك',
    name_en: 'Lombok',
    tagline_ar: 'جزيرة الطبيعة الخام',
    tagline_en: 'Island of Raw Nature',
    images: [
      'destination-image/lombok/lombok-1.webp',
      'destination-image/lombok/lombok-2.webp',
      'destination-image/lombok/lombok-3.webp',
      'destination-image/lombok/lombok-4.webp',
      'destination-image/lombok/lombok-5.webp',
    ],
    hero_ar: 'لومبوك هي جوهرة إندونيسيا الخفية — جزيرة بركانية خلابة بشواطئ بيضاء ناصعة ومياه فيروزية صافية وقمم جبلية شامخة.',
    hero_en: 'Lombok is Indonesia\'s hidden gem — a stunning volcanic island with pristine white beaches, turquoise waters, and majestic mountain peaks.',
    attractions: [
      { icon: '⛰️', name_ar: 'جبل رينجاني البركاني', name_en: 'Mount Rinjani Volcano' },
      { icon: '🏝️', name_ar: 'جزر جيلي القريبة', name_en: 'Nearby Gili Islands' },
      { icon: '🏖️', name_ar: 'شاطئ سينغيغي الفاخر', name_en: 'Senggigi Luxury Beach' },
      { icon: '🤿', name_ar: 'غوص وسنوركل احترافي', name_en: 'Professional Diving & Snorkeling' },
      { icon: '🎋', name_ar: 'قرى الساساك الأصيلة', name_en: 'Authentic Sasak Villages' },
      { icon: '🌅', name_ar: 'غروب شمس ساحر', name_en: 'Breathtaking Sunsets' },
    ],
    luxpath_ar: [
      'فيلات فاخرة مطلة على المحيط الهندي',
      'جولات خاصة لجبل رينجاني مع مرشد عربي',
      'رحلات بحرية خاصة لجزر جيلي',
      'تجربة ثقافة الساساك بشكل حصري',
    ],
    luxpath_en: [
      'Luxury villas overlooking the Indian Ocean',
      'Private Mount Rinjani tours with an Arabic-speaking guide',
      'Private boat trips to the Gili Islands',
      'Exclusive Sasak cultural experience',
    ],
  },

  // ── Hidden initially (revealed by "عرض المزيد" button) ───
  {
    slug: 'bandung',
    name_ar: 'باندونج',
    name_en: 'Bandung',
    tagline_ar: 'باريس جاوة',
    tagline_en: 'Paris of Java',
    images: [
      'destination-image/bandung/bandung-1.webp',
      'destination-image/bandung/bandung-2.webp',
      'destination-image/bandung/bandung-3.webp',
      'destination-image/bandung/bandung-4.webp',
    ],
    hero_ar: 'باندونج، باريس جاوة، مدينة جبلية ساحرة تجمع بين الهواء المنعش والعمارة الاستعمارية الهولندية الأنيقة وأسواق التسوق الحديثة والمصانع الحصرية.',
    hero_en: 'Bandung, the Paris of Java, is a charming mountain city that blends cool fresh air, elegant Dutch colonial architecture, modern shopping, and exclusive factory outlets.',
    attractions: [
      { icon: '🌋', name_ar: 'بركان تانغكوبان براهو', name_en: 'Tangkuban Perahu Volcano' },
      { icon: '🛍️', name_ar: 'متاجر المصانع الحصرية', name_en: 'Exclusive Factory Outlets' },
      { icon: '🕌', name_ar: 'المسجد الكبير', name_en: 'Grand Mosque of Bandung' },
      { icon: '🌸', name_ar: 'بحيرة كاواه بوتيه', name_en: 'Kawah Putih Crater Lake' },
      { icon: '☕', name_ar: 'مقاهي ومطاعم راقية', name_en: 'Premium Cafés & Restaurants' },
      { icon: '🏘️', name_ar: 'الحي الاستعماري التاريخي', name_en: 'Historic Colonial Quarter' },
    ],
    luxpath_ar: [
      'إقامة في الفنادق الجبلية الفاخرة بهواء منعش',
      'جولة في متاجر المصانع مع مرشد تسوق شخصي',
      'رحلة حصرية لبركان تانغكوبان براهو',
      'تجربة المطبخ الجاوي الأصيل في أفضل المطاعم',
    ],
    luxpath_en: [
      'Stay in luxury mountain hotels with fresh cool air',
      'Factory outlet tour with a personal shopping guide',
      'Exclusive trip to Tangkuban Perahu volcano',
      'Experience authentic Javanese cuisine at top restaurants',
    ],
  },
  {
    slug: 'gili',
    name_ar: 'جزر جيلي',
    name_en: 'Gili Islands',
    tagline_ar: 'جنة استوائية',
    tagline_en: 'Tropical Paradise',
    images: [
      'destination-image/gili-islands/gili-islands-1.webp',
      'destination-image/gili-islands/gili-islands-2.webp',
      'destination-image/gili-islands/gili-islands-3.webp',
      'destination-image/gili-islands/gili-islands-4.webp',
      'destination-image/gili-islands/gili-islands-5.webp',
    ],
    hero_ar: 'جزر جيلي الثلاث — جيلي ترواينغان، جيلي مينو، وجيلي أير — أكثر وجهات إندونيسيا سحراً. بلا سيارات ولا ضجيج، فقط الرمال البيضاء والمياه الزرقاء الشفافة.',
    hero_en: 'The three Gili Islands — Gili Trawangan, Gili Meno, and Gili Air — are Indonesia\'s most enchanting destination. No cars, no noise — just white sand and crystal-clear water.',
    attractions: [
      { icon: '🤿', name_ar: 'غوص بين السلاحف البحرية', name_en: 'Diving with Sea Turtles' },
      { icon: '🏖️', name_ar: 'شواطئ بيضاء نقية', name_en: 'Pure White Sand Beaches' },
      { icon: '🌊', name_ar: 'سنوركل في مياه شفافة', name_en: 'Snorkeling in Crystal Waters' },
      { icon: '🌅', name_ar: 'غروب شمس أسطوري', name_en: 'Legendary Sunsets' },
      { icon: '🚴', name_ar: 'استكشاف بالدراجات', name_en: 'Explore by Bicycle' },
      { icon: '🏝️', name_ar: 'عزلة استوائية تامة', name_en: 'Complete Tropical Seclusion' },
    ],
    luxpath_ar: [
      'إقامة في فيلات مطلة على الشاطئ مباشرةً',
      'رحلة بحرية خاصة بين الجزر الثلاث',
      'تجربة غوص مع مدرب معتمد ومعدات حديثة',
      'جولة مسائية حصرية لأجمل غروب شمس',
    ],
    luxpath_en: [
      'Stay in beachfront villas with direct ocean access',
      'Private boat tour between all three islands',
      'Diving experience with a certified instructor and modern equipment',
      'Exclusive evening sunset cruise',
    ],
  },
];

/* ── Destination Panel ───────────────────────────────────── */
const DestPanel = {
  _panel: null,
  _scrollY: 0,
  _slides: [],
  _current: 0,
  _dragStartX: 0,
  _dragStartY: 0,
  _dragging: false,

  _ensurePanel() {
    if (document.getElementById('destPanel')) return;
    const el = document.createElement('div');
    el.id = 'destPanel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="dest-panel__sheet" id="destPanelSheet">
        <div class="dest-panel__hero" id="destPanelHero">
          <!-- Slider track -->
          <div class="dest-panel__slider" id="destPanelSlider">
            <div class="dest-panel__slides" id="destPanelSlides"></div>
          </div>
          <!-- Nav arrows (hidden when only 1 image) -->
          <button class="dest-panel__arrow dest-panel__arrow--prev" id="destPanelPrev" aria-label="Previous image" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="dest-panel__arrow dest-panel__arrow--next" id="destPanelNext" aria-label="Next image" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <!-- Dot indicators -->
          <div class="dest-panel__dots" id="destPanelDots" aria-hidden="true"></div>
          <!-- Overlay + text -->
          <div class="dest-panel__hero-overlay" aria-hidden="true"></div>
          <div class="dest-panel__hero-text">
            <div class="dest-panel__hero-name" id="destPanelName"></div>
            <div class="dest-panel__hero-tagline" id="destPanelTagline"></div>
          </div>
          <button class="dest-panel__close" id="destPanelClose" aria-label="إغلاق">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="dest-panel__body" id="destPanelBody"></div>
        <div class="dest-panel__cta" id="destPanelCTA"></div>
      </div>`;
    document.body.appendChild(el);
    this._panel = el;

    // Close on backdrop click
    el.addEventListener('click', (e) => {
      if (!document.getElementById('destPanelSheet').contains(e.target)) this.close();
    });
    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.classList.contains('dest-panel--open')) this.close();
    });
    document.getElementById('destPanelClose').addEventListener('click', () => this.close());

    // Arrow buttons — pass explicit direction so wrap-around always animates correctly
    document.getElementById('destPanelPrev').addEventListener('click', () => this._goTo(this._current - 1, 1));
    document.getElementById('destPanelNext').addEventListener('click', () => this._goTo(this._current + 1, -1));

    // ── Swipe on the hero area ───────────────────────────────────
    // Listeners go on destPanelHero (the ancestor), not on destPanelSlider.
    // The overlay div sits above the slider in the z-order, so touch events
    // land on the overlay and bubble UP to the hero — they never reach the
    // sibling slider element.
    const heroEl = document.getElementById('destPanelHero');

    heroEl.addEventListener('touchstart', (e) => {
      this._dragStartX = e.touches[0].clientX;
      this._dragStartY = e.touches[0].clientY;
      this._dragging = false;
    }, { passive: true });

    heroEl.addEventListener('touchmove', (e) => {
      const dx = Math.abs(e.touches[0].clientX - this._dragStartX);
      const dy = Math.abs(e.touches[0].clientY - this._dragStartY);
      if (dx > dy && dx > 5) {
        this._dragging = true;
        e.preventDefault(); // claim the horizontal gesture; stops pointercancel
      }
    }, { passive: false });

    heroEl.addEventListener('touchend', (e) => {
      if (!this._dragging) return;
      this._dragging = false;
      const dx = e.changedTouches[0].clientX - this._dragStartX;
      if (Math.abs(dx) > 40) {
        // Index: swipe left → prev, swipe right → next
        // Animation dir matches physical gesture: swipe left → animate left (1), swipe right → animate right (-1)
        if (dx < 0) this._goTo(this._current - 1, 1);
        else this._goTo(this._current + 1, -1);
      }
    }, { passive: true });

    // ── Mouse drag (desktop) ──────────────────────────────────────
    heroEl.addEventListener('mousedown', (e) => {
      this._dragStartX = e.clientX;
      this._dragging = true;
      e.preventDefault(); // prevent native image drag
    });

    window.addEventListener('mouseup', (e) => {
      if (!this._dragging) return;
      this._dragging = false;
      const dx = e.clientX - this._dragStartX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) this._goTo(this._current - 1, 1);
        else this._goTo(this._current + 1, -1);
      }
    });
  },

  _buildSlider(images, altText) {
    this._slides = images.length ? images : [Config.PLACEHOLDER_IMG];
    this._current = 0;

    const slidesEl = document.getElementById('destPanelSlides');
    slidesEl.innerHTML = this._slides.map((src, i) =>
      `<div class="dest-panel__slide ${i === 0 ? 'is-active' : ''}" aria-hidden="${i !== 0}">
        <img src="${src}" alt="${altText}${this._slides.length > 1 ? ' ' + (i + 1) : ''}" width="520" height="240" loading="${i === 0 ? 'eager' : 'lazy'}">
      </div>`
    ).join('');

    // Dots
    const dotsEl = document.getElementById('destPanelDots');
    const multi = this._slides.length > 1;
    dotsEl.hidden = !multi;
    dotsEl.innerHTML = multi
      ? this._slides.map((_, i) =>
        `<button class="dest-panel__dot ${i === 0 ? 'is-active' : ''}" data-idx="${i}" type="button" aria-label="Image ${i + 1}"></button>`
      ).join('')
      : '';
    if (multi) {
      dotsEl.querySelectorAll('.dest-panel__dot').forEach(dot => {
        dot.addEventListener('click', () => this._goTo(+dot.dataset.idx));
      });
    }

    // Arrows visibility
    document.getElementById('destPanelPrev').hidden = !multi;
    document.getElementById('destPanelNext').hidden = !multi;
  },

  // dir:  1 = forward/next (new slide enters from right)
  //       -1 = backward/prev (new slide enters from left)
  //        0 = auto-detect from index (safe for dot clicks; no wrapping involved)
  _goTo(idx, dir = 0) {
    const n = this._slides.length;
    if (n <= 1) return;
    const next = ((idx % n) + n) % n;
    if (next === this._current) return;

    const slidesEl = document.getElementById('destPanelSlides');
    const slides = slidesEl.querySelectorAll('.dest-panel__slide');
    const dots = document.querySelectorAll('#destPanelDots .dest-panel__dot');

    // When dir is explicit (arrow / swipe), use it directly.
    // When dir is 0 (dot click), fall back to index comparison — wrapping
    // is not a concern since dots jump to a fixed target index.
    const forward = dir !== 0 ? dir > 0 : next > this._current;

    slides[this._current].classList.add(forward ? 'slide-out-left' : 'slide-out-right');
    slides[next].classList.add(forward ? 'slide-in-right' : 'slide-in-left');
    slides[next].classList.add('is-active');
    slides[next].setAttribute('aria-hidden', 'false');

    const leaving = this._current;
    setTimeout(() => {
      slides[leaving].classList.remove('is-active', 'slide-out-left', 'slide-out-right');
      slides[leaving].setAttribute('aria-hidden', 'true');
      slides[next].classList.remove('slide-in-right', 'slide-in-left');
    }, 380);

    dots.forEach((d, i) => d.classList.toggle('is-active', i === next));
    this._current = next;
  },

  open(slug) {
    this._ensurePanel();
    const lang = I18n.get();
    const d = DEST_DATA.find(x => x.slug === slug);
    if (!d) return;

    const name = lang === 'ar' ? d.name_ar : d.name_en;
    const tagline = lang === 'ar' ? d.tagline_ar : d.tagline_en;
    const hero = lang === 'ar' ? d.hero_ar : d.hero_en;
    const luxpath = lang === 'ar' ? d.luxpath_ar : d.luxpath_en;

    // Build image slider
    this._buildSlider(d.images ?? [], name);

    document.getElementById('destPanelName').textContent = name;
    document.getElementById('destPanelTagline').textContent = tagline;
    document.getElementById('destPanelClose').setAttribute('aria-label',
      lang === 'ar' ? 'إغلاق' : 'Close');

    // Attractions
    const attractionsHTML = d.attractions.map(a => `
      <div class="dest-panel__attraction">
        <span class="dest-panel__attraction-icon" aria-hidden="true">${a.icon}</span>
        <span>${lang === 'ar' ? a.name_ar : a.name_en}</span>
      </div>`).join('');

    // Luxpath advantage
    const luxpathHTML = luxpath.map(item => `<li class="dest-panel__luxpath-item">${item}</li>`).join('');

    const secTitle1 = lang === 'ar' ? 'أبرز المعالم السياحية' : 'Top Attractions';
    const secTitle2 = lang === 'ar' ? 'كيف نمنحك أفضل تجربة' : 'The Luxpath Advantage';

    document.getElementById('destPanelBody').innerHTML = `
      <p class="dest-panel__desc">${hero}</p>
      <div>
        <div class="dest-panel__section-title">${secTitle1}</div>
        <div class="dest-panel__attractions">${attractionsHTML}</div>
      </div>
      <div class="dest-panel__luxpath">
        <div class="dest-panel__section-title">${secTitle2}</div>
        <ul class="dest-panel__luxpath-list">${luxpathHTML}</ul>
      </div>`;

    const waText = lang === 'ar'
      ? `مرحباً، أود الاستفسار عن رحلات ${name}`
      : `Hello, I'd like to inquire about trips to ${name}`;
    const waUrl = `https://wa.me/${Config.WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    const btnLabel = lang === 'ar' ? `احجز رحلة ${name} عبر واتساب` : `Book a ${name} Trip via WhatsApp`;

    document.getElementById('destPanelCTA').innerHTML = `
      <a href="${waUrl}" class="btn btn--whatsapp btn--full" target="_blank" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        ${btnLabel}
      </a>`;

    // Scroll to top of panel sheet
    document.getElementById('destPanelSheet').scrollTop = 0;

    // Lock body scroll
    this._scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';

    const panel = document.getElementById('destPanel');
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('dest-panel--open');

    // Focus close button for accessibility
    requestAnimationFrame(() => document.getElementById('destPanelClose').focus());
  },

  close() {
    const panel = document.getElementById('destPanel');
    if (!panel) return;
    panel.classList.remove('dest-panel--open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.scrollTo(0, this._scrollY);
  },
};

/* ── Destinations module ─────────────────────────────────── */
const Destinations = {
  VISIBLE_COUNT: 4, // first 4 always visible; rest revealed by toggle

  render(/* _unused — data is hardcoded in DEST_DATA */) {
    const grid = document.getElementById('destGrid');
    if (!grid) return;

    const lang = I18n.get();
    // data-show-all="true" on the dedicated destinations page → skip toggle
    const showAll = grid.dataset.showAll === 'true';
    const visible = showAll ? DEST_DATA : DEST_DATA.slice(0, this.VISIBLE_COUNT);
    const extra = showAll ? [] : DEST_DATA.slice(this.VISIBLE_COUNT);

    // ── Main grid (always visible) ──────────────────────────
    grid.innerHTML = visible.map(d => this.cardHTML(d, lang)).join('');

    // ── Extras + toggle (index page only — skip on destinations page) ──
    if (!showAll) {
      let extrasEl = document.getElementById('destExtras');
      if (!extrasEl) {
        extrasEl = document.createElement('div');
        extrasEl.id = 'destExtras';
        extrasEl.className = 'dest-extras';
        grid.after(extrasEl);
      }
      extrasEl.innerHTML = extra.map(d => this.cardHTML(d, lang)).join('');

      let btnWrap = document.getElementById('destMoreBtn');
      if (!btnWrap) {
        btnWrap = document.createElement('div');
        btnWrap.className = 'dest-more';
        btnWrap.id = 'destMoreBtn';
        extrasEl.after(btnWrap);

        btnWrap.innerHTML = `
          <button type="button" class="btn btn--outline-navy dest-more-toggle"
                  id="destMoreToggle" aria-expanded="false">
            <span id="destMoreLabel"></span>
            <svg class="dest-toggle-chevron" xmlns="http://www.w3.org/2000/svg"
                 width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>`;

        document.getElementById('destMoreToggle').addEventListener('click', () => {
          const opening = !extrasEl.classList.contains('is-open');
          extrasEl.classList.toggle('is-open', opening);
          if (opening) ScrollReveal.observe(extrasEl);
          Destinations._syncToggleBtn(extrasEl);
        });
      }

      this._syncToggleBtn(extrasEl);
      this.bindCards(extrasEl);
      Packages.lazyLoadImages(extrasEl);
    }

    // ── Bind cards & lazy-load ──────────────────────────────
    this.bindCards(grid);
    Packages.lazyLoadImages(grid);
    ScrollReveal.observe(grid);
  },

  // Updates button text + aria + chevron — called on render & on click
  _syncToggleBtn(extrasEl) {
    const lang = I18n.get();
    const isOpen = extrasEl.classList.contains('is-open');
    const btn = document.getElementById('destMoreToggle');
    const label = document.getElementById('destMoreLabel');
    if (!btn || !label) return;
    label.textContent = isOpen
      ? (lang === 'ar' ? 'عرض أقل' : 'View Less')
      : (lang === 'ar' ? 'عرض المزيد' : 'View More');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.classList.toggle('is-open', isOpen);
  },

  cardHTML(d, lang) {
    const name = lang === 'ar' ? d.name_ar : d.name_en;
    const tagline = lang === 'ar' ? d.tagline_ar : d.tagline_en;
    const imgSrc = d.images?.[0] ?? Config.PLACEHOLDER_IMG;
    const exploreLabel = lang === 'ar' ? 'اكتشف' : 'Explore';

    return `
      <button type="button" class="dest-card reveal" role="listitem"
              aria-label="${name}" data-dest="${d.slug}"
              style="cursor:pointer;background:none;border:none;padding:0;text-align:inherit;width:100%">
        <img
          class="dest-card__image"
          data-src="${imgSrc}"
          src="${Config.PLACEHOLDER_IMG}"
          alt="${name} — ${tagline ?? ''}"
          width="400" height="500"
          loading="lazy">
        <div class="dest-card__overlay" aria-hidden="true"></div>
        <div class="dest-card__content">
          <span class="dest-card__name">${name}</span>
          ${tagline ? `<span class="dest-card__tagline">${tagline}</span>` : ''}
          <span class="dest-card__cta">
            ${exploreLabel}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              ${lang === 'ar'
        ? '<polyline points="15 18 9 12 15 6"/>'
        : '<polyline points="9 18 15 12 9 6"/>'}
            </svg>
          </span>
        </div>
      </button>`;
  },

  bindCards(grid) {
    grid.querySelectorAll('.dest-card[data-dest]').forEach(btn => {
      btn.addEventListener('click', () => DestPanel.open(btn.dataset.dest));
    });
  },
};


/* ============================================================
   12. TESTIMONIALS
   ============================================================ */
const Testimonials = {
  _all: [],
  _replyBound: false,

  render(testimonials) {
    const track = document.getElementById('testimonialsTrack');
    const moreWrap = document.getElementById('testiMoreWrap');
    if (!track) return;

    // Always wipe the track first — removes skeletons AND prevents
    // duplicates when this is called again on a language switch.
    track.innerHTML = '';

    this._all = testimonials ?? [];

    if (!this._all.length) {
      track.innerHTML = `
        <p class="testi-empty">${I18n.t('testimonials.empty')}</p>`;
      if (moreWrap) moreWrap.hidden = true;
      return;
    }

    // Render all cards into the horizontal scroll track at once
    const lang = I18n.get();
    const frag = document.createDocumentFragment();
    this._all.forEach(t => {
      const wrap = document.createElement('div');
      wrap.innerHTML = this.cardHTML(t, lang);
      frag.appendChild(wrap.firstElementChild);
    });
    track.appendChild(frag);

    // Hide load-more button — all cards are reachable by scrolling
    if (moreWrap) moreWrap.hidden = true;

    ScrollReveal.observe(track);

    // Reply toggle — single delegated listener, bound once per page load
    if (!this._replyBound) {
      document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.testimonial-reply-toggle');
        if (!toggle) return;
        const body = toggle.nextElementSibling;
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isOpen));
        body.classList.toggle('is-open', !isOpen);
      });
      this._replyBound = true;
    }
  },

  cardHTML(t, lang) {
    const review = lang === 'ar' ? t.review_ar : (t.review_en ?? t.review_ar);
    const replyTxt = lang === 'ar' ? (t.reply_ar ?? t.reply_en) : (t.reply_en ?? t.reply_ar);
    const hasReply = !!(t.reply_ar || t.reply_en);

    const city = t.reviewer_city ?? '';
    const cityDisp = lang === 'ar' ? (CITY_MAP[city] ?? city) : city;

    const catKey = t.trip_category ? `testimonials.cat.${t.trip_category}` : '';
    const catLabel = catKey ? I18n.t(catKey) : '';

    const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = t.trip_month
      ? (lang === 'ar' ? AR_MONTHS[t.trip_month - 1] : EN_MONTHS[t.trip_month - 1])
      : '';
    const dateStr = [monthStr, t.trip_year].filter(Boolean).join(' ');

    const detail = [cityDisp, catLabel, dateStr].filter(Boolean).join(' · ');
    const initial = (t.reviewer_name_display?.[0] ?? '؟').toUpperCase();
    const stars = '★'.repeat(Math.min(5, t.rating ?? 5));

    const replyHTML = hasReply ? `
      <div class="testimonial-reply">
        <button class="testimonial-reply-toggle" type="button" aria-expanded="false">
          <svg class="trt-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span>${I18n.t('testimonials.reply')} / Reply</span>
        </button>
        <div class="testimonial-reply-body">
          <div>
            <div class="testimonial-reply-brand">
              <img src="luxpath-logo.webp" alt="Luxpath" class="testi-reply-logo">
              ${escHtml(I18n.t('testimonials.replyBy'))}
            </div>
            <p class="testimonial-reply-text" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">${escHtml(replyTxt ?? '')}</p>
          </div>
        </div>
      </div>` : '';

    return `
      <div class="testimonial-card" role="listitem">
        <div class="testimonial-header">
          <div class="testimonial-avatar" aria-hidden="true">${escHtml(initial)}</div>
          <div class="testimonial-header__info">
            <p class="testimonial-name">${escHtml(t.reviewer_name_display ?? '')} <span class="testimonial-flag">${escHtml(t.reviewer_flag ?? '🇸🇦')}</span></p>
            ${detail ? `<p class="testimonial-detail">${escHtml(detail)}</p>` : ''}
          </div>
          <div class="testimonial-brand" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="var(--color-gold)" opacity="0.35">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        </div>

        <div class="testimonial-stars" aria-label="${lang === 'ar' ? 'التقييم:' : 'Rating:'} ${t.rating ?? 5} / 5">
          ${stars}
        </div>

        <p class="testimonial-quote">"${escHtml(review ?? '')}"</p>

        ${replyHTML}
      </div>`;
  },
};


/* ============================================================
   13. FAQ
   ============================================================ */
const FAQ = {
  init() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('is-open');

        // Close all
        document.querySelectorAll('.faq-item.is-open').forEach(i => {
          i.classList.remove('is-open');
          i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked (if it was closed)
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  },
};


/* ============================================================
   14. APP — orchestration layer
   ============================================================ */
const App = {
  whatsappNumber: Config.WHATSAPP_NUMBER,
  cachedPackages: null,
  cachedDestinations: null,
  cachedTestimonials: null,

  async init() {
    // ── 1. Language + currency (sync — no flash) ───────────
    I18n.init();
    Currency.init();

    // ── 2. Static UI components ────────────────────────────
    Navbar.init();
    FAQ.init();
    Stats.init();
    ScrollReveal.init();
    WA.updateAll();
    FloatingWA.init();
    HeroSlider.init();
    Packages.init();

    // ── 3. Destinations render immediately (hardcoded — no DB needed) ──
    Destinations.render();

    // ── 4. Parallel data fetch ─────────────────────────────
    if (!DB.isConfigured()) {
      console.info('[Luxpath] Supabase not configured — running in demo mode.');
      // Clear skeleton loaders gracefully
      this.clearSkeletons();
      return;
    }

    const [settingsRes, packagesRes, destinationsRes, testimonialsRes] =
      await Promise.allSettled([
        DB.getSettings(),
        DB.getFeaturedPackages(),
        DB.getDestinations(),
        DB.getTestimonials(),
      ]);

    // ── 4. Apply site settings ─────────────────────────────
    if (settingsRes.status === 'fulfilled' && settingsRes.value) {
      this.applySettings(settingsRes.value);
    }

    // ── 5. Render sections ─────────────────────────────────
    const packages = packagesRes.status === 'fulfilled' ? packagesRes.value : null;
    const destinations = destinationsRes.status === 'fulfilled' ? destinationsRes.value : null;
    const testimonials = testimonialsRes.status === 'fulfilled' ? testimonialsRes.value : null;

    // Cache for language re-render
    this.cachedPackages = packages;
    this.cachedDestinations = destinations;
    this.cachedTestimonials = testimonials;

    Packages.render(packages);
    Destinations.render(destinations);
    Testimonials.render(testimonials);

    // Re-init WA links after data render
    WA.updateAll();
    FloatingWA.updateHref();
  },

  applySettings(settings) {
    // Update WhatsApp number if set in DB
    const wa = settings['whatsapp_number'];
    if (wa?.value) {
      this.whatsappNumber = wa.value;
      WA.updateAll();
      FloatingWA.updateHref();
    }

    // Update phone link
    const phoneEl = document.getElementById('ctaPhone');
    const phone = settings['company_phone']?.value;
    if (phoneEl && phone) {
      phoneEl.textContent = phone;
      phoneEl.href = `tel:${phone.replace(/\s/g, '')}`;
    }

    // Update hero slideshow images
    const heroSetting = settings['hero_active_images'];
    if (heroSetting?.value) {
      try {
        const activeList = JSON.parse(heroSetting.value);
        if (Array.isArray(activeList) && activeList.length) {
          const container = document.querySelector('.hero__slides');
          if (container) {
            container.innerHTML = activeList.map((img, i) =>
              `<div class="hero__slide${i === 0 ? ' is-active' : ''}" style="background-image:url('hero-images/${escHtml(img)}')"></div>`
            ).join('');
            HeroSlider.reinit();
          }
        }
      } catch (_) { }
    }
  },

  clearSkeletons() {
    // Show empty state for unconnected skeleton areas
    const packagesGrid = document.getElementById('packagesGrid');
    if (packagesGrid) {
      packagesGrid.innerHTML = `
        <div class="packages-empty">
          <p data-i18n="packages.empty">${I18n.t('packages.empty')}</p>
        </div>`;
      packagesGrid.setAttribute('aria-busy', 'false');
    }

    // Destinations are hardcoded — render them even in demo mode
    Destinations.render();

    const testiTrack = document.getElementById('testimonialsTrack');
    if (testiTrack) testiTrack.innerHTML = '';
  },
};

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
