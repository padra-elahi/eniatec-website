/**
 * Persian copy and option lists for the collaboration request form and the
 * admin panel. Option `value`s are stored in the database, so they stay
 * ASCII and must not change; labels can be reworded freely.
 */

export const collabTypes = [
  { value: 'project', label: 'سفارش پروژه نرم‌افزاری', desc: 'سامانهٔ سفارشی، از تحلیل تا استقرار', icon: 'layers' },
  { value: 'product', label: 'استفاده از محصولات انیاتک', desc: 'Persian CRM یا سامانه بازرسی', icon: 'server' },
  { value: 'partnership', label: 'مشارکت تجاری', desc: 'همکاری بلندمدت و پروژه‌های مشترک', icon: 'flow' },
  { value: 'reseller', label: 'نمایندگی و فروش', desc: 'عرضهٔ محصولات انیاتک به مشتریان شما', icon: 'plug' },
  { value: 'consulting', label: 'مشاوره فنی', desc: 'معماری، مدل داده و بازبینی کد', icon: 'compass' },
  { value: 'other', label: 'سایر موارد', desc: 'ایده‌ای که در دسته‌های بالا نمی‌گنجد', icon: 'type' },
] as const;

export const interests = [
  { value: 'crm', label: 'Persian CRM' },
  { value: 'bazrasi', label: 'سامانه بازرسی' },
  { value: 'custom', label: 'نرم‌افزار سفارشی' },
  { value: 'integration', label: 'یکپارچه‌سازی و API' },
  { value: 'devops', label: 'استقرار و دواپس' },
  { value: 'ui', label: 'طراحی رابط کاربری' },
] as const;

export const budgets = [
  { value: 'unknown', label: 'هنوز مشخص نیست' },
  { value: 'lt500m', label: 'زیر ۵۰۰ میلیون تومان' },
  { value: '500m-2b', label: '۵۰۰ میلیون تا ۲ میلیارد' },
  { value: 'gt2b', label: 'بیش از ۲ میلیارد' },
] as const;

export const timelines = [
  { value: 'asap', label: 'هرچه زودتر' },
  { value: '1-3m', label: '۱ تا ۳ ماه آینده' },
  { value: '3-6m', label: '۳ تا ۶ ماه آینده' },
  { value: 'flexible', label: 'انعطاف‌پذیر' },
] as const;

export const contactPrefs = [
  { value: 'email', label: 'ایمیل' },
  { value: 'phone', label: 'تماس تلفنی' },
  { value: 'any', label: 'فرقی نمی‌کند' },
] as const;

export const referrals = [
  { value: '', label: 'انتخاب کنید (اختیاری)' },
  { value: 'search', label: 'جستجو در گوگل' },
  { value: 'github', label: 'گیت‌هاب' },
  { value: 'social', label: 'شبکه‌های اجتماعی' },
  { value: 'referral', label: 'معرفی دوستان یا همکاران' },
  { value: 'event', label: 'رویداد یا نمایشگاه' },
  { value: 'other', label: 'سایر' },
] as const;

export const statuses = [
  { value: 'new', label: 'جدید', tone: 'brand' },
  { value: 'reviewing', label: 'در حال بررسی', tone: 'amber' },
  { value: 'contacted', label: 'تماس گرفته شد', tone: 'cyan' },
  { value: 'accepted', label: 'پذیرفته‌شده', tone: 'emerald' },
  { value: 'rejected', label: 'رد شده', tone: 'rose' },
  { value: 'archived', label: 'بایگانی', tone: 'slate' },
] as const;

export type StatusValue = (typeof statuses)[number]['value'];
export type CollabTypeValue = (typeof collabTypes)[number]['value'];

/** Looks up an option's label by value, falling back to the raw value. */
export function labelOf(list: ReadonlyArray<{ value: string; label: string }>, value: string | null | undefined) {
  if (!value) return '—';
  return list.find((o) => o.value === value)?.label ?? value;
}

export const collab = {
  meta: {
    title: 'درخواست همکاری',
    description: 'فرم درخواست همکاری با انیاتک: سفارش پروژه، مشارکت تجاری، نمایندگی یا مشاوره فنی.',
  },
  back: 'بازگشت به سایت',
  eyebrow: 'درخواست همکاری',
  title: 'بیایید چیزی',
  titleAccent: 'ماندگار بسازیم',
  subtitle:
    'چند دقیقه وقت بگذارید و دربارهٔ خودتان و همکاری مدنظرتان بگویید. هر درخواست را یک نفر از تیم فنی می‌خواند و حداکثر ظرف دو روز کاری پاسخ می‌دهد.',
  steps: [
    { title: 'درباره شما', desc: 'اطلاعات تماس' },
    { title: 'نوع همکاری', desc: 'زمینه، بودجه و زمان' },
    { title: 'جزئیات', desc: 'شرح درخواست و ارسال' },
  ],
  fields: {
    fullName: 'نام و نام خانوادگی',
    email: 'ایمیل',
    phone: 'شماره تماس',
    company: 'شرکت یا سازمان',
    role: 'سمت شما',
    website: 'وب‌سایت',
    type: 'چه نوع همکاری‌ای مدنظر شماست؟',
    interests: 'به کدام حوزه‌ها علاقه دارید؟',
    budget: 'بودجه تقریبی',
    timeline: 'زمان شروع',
    subject: 'عنوان درخواست',
    message: 'شرح درخواست',
    referral: 'از کجا با ما آشنا شدید؟',
    contactPref: 'ترجیح می‌دهید چطور با شما تماس بگیریم؟',
    consent: 'موافقم انیاتک برای پیگیری این درخواست با من تماس بگیرد و اطلاعاتم فقط برای همین منظور نگهداری شود.',
  },
  placeholders: {
    fullName: 'مثلاً سارا محمدی',
    email: 'you@company.com',
    phone: '0912 345 6789',
    company: 'اختیاری',
    role: 'مثلاً مدیر فناوری اطلاعات',
    website: 'https://',
    subject: 'مثلاً پیاده‌سازی CRM برای تیم فروش',
    message: 'فرآیند فعلی، مشکلی که می‌خواهید حل شود، تعداد کاربران و هر جزئیاتی که فکر می‌کنید مهم است…',
  },
  optional: 'اختیاری',
  duration: 'تکمیل فرم حدود ۳ دقیقه زمان می‌برد',
  next: 'مرحله بعد',
  prev: 'مرحله قبل',
  submit: 'ارسال درخواست',
  submitting: 'در حال ارسال…',
  stepOf: (n: number, total: number) => `مرحله ${n} از ${total}`,
  chars: (n: number, max: number) => `${n} / ${max}`,
  summary: 'خلاصهٔ درخواست شما',
  errors: {
    required: 'این فیلد الزامی است.',
    email: 'ایمیل معتبر وارد کنید.',
    phone: 'شماره تماس معتبر وارد کنید.',
    url: 'آدرس وب‌سایت معتبر نیست.',
    type: 'یکی از گزینه‌ها را انتخاب کنید.',
    messageShort: 'لطفاً کمی بیشتر توضیح دهید (حداقل ۲۰ نویسه).',
    tooLong: 'متن طولانی‌تر از حد مجاز است.',
    consent: 'برای ارسال، تایید این گزینه لازم است.',
    rateLimited: 'تعداد درخواست‌ها از این دستگاه زیاد بوده است. لطفاً کمی بعد دوباره تلاش کنید.',
    server: 'ارسال ناموفق بود. لطفاً دوباره تلاش کنید یا به info@eniatec.tech ایمیل بزنید.',
    fixBelow: 'چند فیلد نیاز به اصلاح دارد.',
  },
  success: {
    title: 'درخواست شما ثبت شد',
    desc: 'ممنون که به انیاتک اعتماد کردید. درخواستتان به دست تیم رسید و حداکثر ظرف دو روز کاری با شما تماس می‌گیریم.',
    codeLabel: 'کد پیگیری',
    copy: 'کپی',
    copied: 'کپی شد',
    next: [
      'یک نفر از تیم فنی درخواست شما را بررسی می‌کند.',
      'برای یک جلسهٔ کوتاه آشنایی با شما هماهنگ می‌کنیم.',
      'برآورد اولیه از دامنه، زمان و هزینه را برایتان می‌فرستیم.',
    ],
    nextTitle: 'قدم‌های بعدی',
    home: 'بازگشت به سایت',
    another: 'ثبت درخواست دیگر',
  },
  aside: {
    title: 'چرا انیاتک؟',
    points: [
      'پاسخ اولیه در کمتر از دو روز کاری',
      'جلسهٔ رایگان تحلیل فرآیند',
      'برآورد شفاف دامنه، زمان و هزینه',
      'کد و مستندات، متعلق به شماست',
    ],
    direct: 'ترجیح می‌دهید مستقیم بنویسید؟',
    privacy: 'اطلاعات شما فقط برای پاسخ به همین درخواست استفاده می‌شود و با هیچ شخص ثالثی به اشتراک گذاشته نمی‌شود.',
  },
} as const;

export const admin = {
  brand: 'پنل مدیریت',
  nav: {
    dashboard: 'داشبورد',
    requests: 'درخواست‌ها',
    site: 'مشاهده سایت',
    logout: 'خروج',
  },
  login: {
    title: 'ورود به پنل مدیریت',
    desc: 'برای مشاهده و مدیریت درخواست‌های همکاری وارد شوید.',
    password: 'رمز عبور',
    submit: 'ورود',
    submitting: 'در حال ورود…',
    wrong: 'رمز عبور نادرست است.',
    locked: 'تلاش‌های ناموفق زیادی ثبت شد. چند دقیقه دیگر دوباره امتحان کنید.',
    notConfigured: 'پنل مدیریت هنوز پیکربندی نشده است. متغیر محیطی ADMIN_PASSWORD را روی سرور تنظیم کنید.',
    show: 'نمایش رمز',
    hide: 'پنهان کردن رمز',
  },
  dashboard: {
    title: 'داشبورد',
    subtitle: 'نمای کلی درخواست‌های همکاری',
    total: 'کل درخواست‌ها',
    unread: 'خوانده‌نشده',
    open: 'در جریان',
    accepted: 'پذیرفته‌شده',
    week: (n: string) => `${n} درخواست در ۷ روز اخیر`,
    chart: 'درخواست‌ها در ۳۰ روز اخیر',
    byType: 'بر اساس نوع همکاری',
    byStatus: 'بر اساس وضعیت',
    recent: 'آخرین درخواست‌ها',
    viewAll: 'مشاهده همه',
    empty: 'هنوز درخواستی ثبت نشده است.',
    emptyHint: 'وقتی کسی فرم همکاری را پر کند، اینجا نمایش داده می‌شود.',
    openForm: 'مشاهده فرم همکاری',
  },
  list: {
    title: 'درخواست‌ها',
    search: 'جستجو در نام، ایمیل، شرکت، کد…',
    all: 'همه',
    starred: 'ستاره‌دار',
    unread: 'خوانده‌نشده',
    anyType: 'همه انواع',
    sort: { newest: 'جدیدترین', oldest: 'قدیمی‌ترین', updated: 'آخرین تغییر' },
    columns: { person: 'متقاضی', type: 'نوع همکاری', status: 'وضعیت', date: 'تاریخ' },
    selected: (n: string) => `${n} مورد انتخاب شد`,
    setStatus: 'تغییر وضعیت',
    markRead: 'خوانده شد',
    markUnread: 'خوانده نشد',
    delete: 'حذف',
    confirmDelete: (n: string) => `${n} درخواست برای همیشه حذف شود؟`,
    export: 'خروجی CSV',
    empty: 'درخواستی با این فیلترها پیدا نشد.',
    clear: 'پاک کردن فیلترها',
    page: (a: string, b: string, total: string) => `${a}–${b} از ${total}`,
    prev: 'قبلی',
    next: 'بعدی',
  },
  detail: {
    back: 'بازگشت به فهرست',
    received: 'دریافت‌شده',
    contact: 'اطلاعات تماس',
    request: 'درخواست',
    status: 'وضعیت',
    star: 'ستاره‌دار کردن',
    unstar: 'برداشتن ستاره',
    reply: 'پاسخ با ایمیل',
    call: 'تماس',
    copy: 'کپی',
    copied: 'کپی شد',
    markUnread: 'علامت خوانده‌نشده',
    delete: 'حذف درخواست',
    confirmDelete: 'این درخواست و تمام یادداشت‌هایش برای همیشه حذف شود؟',
    cancel: 'انصراف',
    activity: 'فعالیت‌ها و یادداشت‌ها',
    notePlaceholder: 'یادداشت داخلی بنویسید… (فقط مدیران می‌بینند)',
    addNote: 'افزودن یادداشت',
    deleteNote: 'حذف یادداشت',
    technical: 'اطلاعات فنی',
    ip: 'آی‌پی',
    agent: 'مرورگر',
    prevItem: 'درخواست قبلی',
    nextItem: 'درخواست بعدی',
    events: {
      created: 'درخواست از طریق فرم سایت ثبت شد',
      status: (from: string, to: string) => `وضعیت از «${from}» به «${to}» تغییر کرد`,
      starred: 'ستاره‌دار شد',
      unstarred: 'ستاره برداشته شد',
    },
  },
  toast: {
    saved: 'ذخیره شد',
    deleted: 'حذف شد',
    error: 'خطایی رخ داد. دوباره تلاش کنید.',
  },
} as const;
