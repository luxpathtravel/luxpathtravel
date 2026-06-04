/* ============================================================
   LUXPATH TRAVEL — SHARED STATIC PAGE MODULE
   Used by: من-نحن · تواصل · الخصوصية
   Self-contained · No Supabase needed · Bilingual AR/EN
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
    'wa.general':   'مرحباً، أود الاستفسار عن باقاتكم السياحية إلى إندونيسيا',

    /* About */
    'about.eyebrow':        'قصتنا',
    'about.title':          'لوكس باث — رحلتك تبدأ هنا',
    'about.subtitle':       'من المملكة العربية السعودية إلى جنة إندونيسيا',
    'about.story.h':        'من نحن؟',
    'about.story.p1':       'لوكس باث للسياحة وكالة سعودية متخصصة في تصميم رحلات فاخرة إلى إندونيسيا. نؤمن بأن السفر تجربة لا مجرد وجهة، لذلك نصمم كل رحلة بعناية لتلائم رغبات عميلنا وتتجاوز توقعاته.',
    'about.story.p2':       'نحن لا ننافس على السعر — ننافس على الجودة. شركاؤنا في إندونيسيا من أرقى الفنادق والمنتجعات، ومرشدونا السياحيون من أفضل المتحدثين بالعربية في بالي وجاكرتا وباندونغ ولومبوك.',
    'about.story.p3':       'ثقة أكثر من 2,000 عائلة سعودية سافرت معنا تقول أكثر مما تقوله الإعلانات. كل رحلة تبدأ بمحادثة على واتساب وتنتهي بذكريات تدوم.',
    'about.val1.title':     'تخصص كامل في إندونيسيا',
    'about.val1.body':      'نحن متخصصون في وجهة واحدة فقط لنقدم لك أعمق خبرة وأفضل شبكة علاقات داخل الوجهة',
    'about.val2.title':     'خدمة واتساب 24/7',
    'about.val2.body':      'فريقنا متاح قبل رحلتك وأثناءها وبعدها. لست وحدك في أي لحظة',
    'about.val3.title':     'أسعار شاملة وشفافة',
    'about.val3.body':      'لا رسوم مخفية ولا مفاجآت. كل شيء محدد من اليوم الأول',
    'about.val4.title':     'مرشدون يتحدثون العربية',
    'about.val4.body':      'جميع مرشدينا في إندونيسيا يتحدثون العربية بطلاقة. رحلتك بلغتك وثقافتك',
    'about.cta.title':      'جاهز لتخطيط رحلة لا تُنسى؟',
    'about.cta.sub':        'تواصل معنا الآن وسنصمم لك رحلة الأحلام في اقل من ساعة',
    'about.cta.btn':        'ابدأ محادثة على واتساب',

    /* Contact */
    'contact.eyebrow':      'تواصل معنا',
    'contact.title':        'نحن هنا لمساعدتك',
    'contact.subtitle':     'لا تتردد في التواصل معنا عبر أي وسيلة تناسبك',
    'contact.wa.label':     'واتساب',
    'contact.wa.value':     '+966 811-1182-6527',
    'contact.wa.note':      'متاح 24/7 — أسرع طريقة للتواصل',
    'contact.phone.label':  'الهاتف',
    'contact.phone.value':  '+966 811-1182-6527',
    'contact.phone.note':   'من الأحد إلى الخميس، 9 ص — 9 م',
    'contact.email.label':  'البريد الإلكتروني',
    'contact.email.value':  'info@luxpathtravel.com',
    'contact.email.note':   'نرد خلال 4 ساعات عمل',
    'contact.hours.label':  'ساعات العمل',
    'contact.hours.value':  'الأحد — الخميس',
    'contact.hours.note':   '9:00 ص — 9:00 م (بتوقيت الرياض)',
    'contact.wa.hero.title':'أسرع طريقة للتواصل',
    'contact.wa.hero.sub':  'أرسل لنا رسالة على واتساب وسنرد خلال دقائق. خبراؤنا جاهزون لتصميم رحلتك المثالية.',
    'contact.wa.hero.btn':  'ابدأ محادثة الآن',

    /* Privacy */
    'privacy.eyebrow':      'قانوني',
    'privacy.title':        'سياسة الخصوصية',
    'privacy.subtitle':     'آخر تحديث: يناير 2025',
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

    /* About */
    'about.eyebrow':        'Our Story',
    'about.title':          'Luxpath — Where Your Journey Begins',
    'about.subtitle':       'From Saudi Arabia to the paradise of Indonesia',
    'about.story.h':        'Who We Are',
    'about.story.p1':       'Luxpath Travel is a Saudi agency specialising in luxury travel to Indonesia. We believe travel is an experience, not just a destination — so we design each trip carefully to match our clients\' wishes and exceed their expectations.',
    'about.story.p2':       'We don\'t compete on price — we compete on quality. Our partners in Indonesia are among the finest hotels and resorts, and our guides are among the best Arabic-speaking professionals in Bali, Jakarta, Bandung, and Lombok.',
    'about.story.p3':       'The trust of over 2,000 Saudi families who have travelled with us speaks louder than any advertisement. Every trip starts with a WhatsApp conversation and ends with memories that last.',
    'about.val1.title':     'Indonesia Specialists',
    'about.val1.body':      'We focus exclusively on one destination to give you the deepest expertise and the best local network',
    'about.val2.title':     '24/7 WhatsApp Support',
    'about.val2.body':      'Our team is with you before, during, and after your trip — always one message away',
    'about.val3.title':     'Fully Inclusive Pricing',
    'about.val3.body':      'No hidden fees, no surprises. Everything is confirmed before you pay a single riyal',
    'about.val4.title':     'Arabic-Speaking Guides',
    'about.val4.body':      'All our guides in Indonesia speak fluent Arabic. Your trip, in your language',
    'about.cta.title':      'Ready to Plan an Unforgettable Trip?',
    'about.cta.sub':        'Contact us now and we\'ll design your dream trip in less than an hour',
    'about.cta.btn':        'Start a WhatsApp conversation',

    /* Contact */
    'contact.eyebrow':      'Get in Touch',
    'contact.title':        'We\'re Here to Help',
    'contact.subtitle':     'Reach us through any channel that works for you',
    'contact.wa.label':     'WhatsApp',
    'contact.wa.value':     '+966 811-1182-6527',
    'contact.wa.note':      'Available 24/7 — fastest way to reach us',
    'contact.phone.label':  'Phone',
    'contact.phone.value':  '+966 811-1182-6527',
    'contact.phone.note':   'Sunday to Thursday, 9 AM — 9 PM',
    'contact.email.label':  'Email',
    'contact.email.value':  'info@luxpathtravel.com',
    'contact.email.note':   'We reply within 4 business hours',
    'contact.hours.label':  'Business Hours',
    'contact.hours.value':  'Sunday — Thursday',
    'contact.hours.note':   '9:00 AM — 9:00 PM (Riyadh time)',
    'contact.wa.hero.title':'Fastest Way to Reach Us',
    'contact.wa.hero.sub':  'Send us a WhatsApp message and we\'ll reply within minutes. Our experts are ready to design your perfect trip.',
    'contact.wa.hero.btn':  'Start a Conversation Now',

    /* Privacy */
    'privacy.eyebrow':      'Legal',
    'privacy.title':        'Privacy Policy',
    'privacy.subtitle':     'Last updated: January 2025',
  },
};

/* ============================================================
   3. I18n
   ============================================================ */
const I18n = (() => {
  let lang = Config.DEFAULT_LANG;

  const detect = () => {
    const stored = localStorage.getItem(Config.LANG_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
    if (window.location.pathname.startsWith('/en/')) return 'en';
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
        applyDOM(); WA.updateAll();
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
   4. WA
   ============================================================ */
const WA = {
  _number: Config.WHATSAPP_NUMBER,
  url(msg) { return `https://wa.me/${this._number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`; },
  generalUrl() { return this.url(I18n.t('wa.general')); },
  updateAll() {
    const url = this.generalUrl();
    document.querySelectorAll('[data-wa="general"]').forEach(el => { el.href = url; });
  },
};

/* ============================================================
   5. NAVBAR
   ============================================================ */
const Navbar = {
  init() {
    const navbar   = document.getElementById('navbar');
    const menuBtn  = document.getElementById('menuToggle');
    const closeBtn = document.getElementById('mobileMenuClose');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    const menu     = document.getElementById('mobileMenu');
    if (!navbar) return;

    // Inner pages: always solid (no transparent-to-solid scroll transition)
    navbar.classList.add('navbar--scrolled');

    menuBtn?.addEventListener('click', () => this.openMenu());
    closeBtn?.addEventListener('click', () => this.closeMenu());
    backdrop?.addEventListener('click', () => this.closeMenu());
    menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => this.closeMenu()));
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

/* ============================================================
   6. SCROLL REVEAL
   ============================================================ */
const ScrollReveal = {
  init() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  },
};

/* ============================================================
   7. FLOATING WHATSAPP
   ============================================================ */
const FloatingWA = {
  init() {
    const btn = document.getElementById('waFloat');
    if (!btn) return;
    btn.href = WA.generalUrl();
    // On inner pages there is no hero, so show immediately
    btn.classList.add('is-visible');
  },
};

/* ============================================================
   8. APP
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  Navbar.init();
  ScrollReveal.init();
  WA.updateAll();
  FloatingWA.init();
});
