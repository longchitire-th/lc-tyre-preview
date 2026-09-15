'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  Wrench,
  Settings2,
  MessageCircle,
  Menu,
  X,
  ArrowRight,
  ShoppingCart,
  Car,
  CarFront,
  BusFront,
  Zap,
  Bike,
  Mountain,
  Share2,
  Copy,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CHANNELS,
  SOCIAL_CHANNELS,
  COMPANY,
  SHOP,
  defaultLinks,
  initialSettings,
  modelName,
  money,
  lineMessage,
  validChannelUrl,
  articleSeeds,
  type Product,
  type TireBrand,
  type StoreSettings,
  type ProductLinks,
} from '@/lib/storefront';
import {
  parseSize,
  widths,
  validateFitments,
  installationPoints,
  mainLocation,
  type Fitment,
} from '@/lib/fitment';
import { locationShareLinks, websiteLocationUrl } from '@/lib/location-share';
import baseFitments from '@/lib/vehicle-fitments.json';
import oemReferenceData from '@/lib/oem-fitment-reference.json';
import { oemLabelsForFitment, type OemReference } from '@/lib/oem-fitment';
import { VEHICLE_BRAND_LOGOS } from '@/lib/vehicle-brands';
import RotatingCards from './rotating-cards';
import GoogleReviews from './google-reviews';
import ArticleStudio from './article-studio';
import PlatformLogo from './platform-logo';
type Lang = 'th' | 'en';
type Slide = {
  th: string;
  en: string;
  subTh: string;
  subEn: string;
  image: string;
  href: string;
  enabled: boolean;
};
const defaultSlides: Slide[] = [
  {
    th: 'หลงฉื่อ ขึ้นชื่อเรื่องยาง',
    en: 'Good Tires. Better Journeys.',
    subTh: 'ค้นหายางคุณภาพ ราคาดี พร้อมติดตั้ง',
    subEn: 'Find your tyres. Compare prices. Arrange installation.',
    image: '/assets/suv-sunset.png',
    href: '#finder',
    enabled: true,
  },
  {
    th: 'เปลี่ยนยาง ติดตั้งฟรี*',
    en: 'New tyres. Free installation*',
    subTh: 'ถอด–ใส่และถ่วงล้อ ณ สาขาเจริญพัฒนา สอบถามเงื่อนไขก่อนซื้อ',
    subEn:
      'Fitting and balancing at Charoen Phatthana. Confirm offer conditions before purchase.',
    image: '/assets/tire-3257.png',
    href: '#branches',
    enabled: true,
  },
  {
    th: 'เลือกซื้อผ่านช่องทางที่คุณสะดวก',
    en: 'Shop your way',
    subTh: 'เว็บไซต์ • Shopee • Lazada • TikTok • LINE OA',
    subEn: 'Website • Shopee • Lazada • TikTok • LINE OA',
    image: '/assets/tire-4518.png',
    href: '#channels',
    enabled: true,
  },
];
function Pick({
  value,
  set,
  items,
  label,
}: {
  value: string;
  set: (s: string) => void;
  items: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v !== null && set(v)}>
      <SelectTrigger aria-label={label} className="pick">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function BrandMark({ brand }: { brand: TireBrand }) {
  return brand.logo ? (
    <img src={brand.logo} alt={brand.name} loading="lazy" />
  ) : (
    <strong className="v3-brand-text">{brand.name}</strong>
  );
}
const key = 'lc-tyre-design-settings-v2';
const canonical = (s: string) =>
  s
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace('TOYOTIRES', 'TOYO');
const safeImage = (s: string) =>
  /^\/assets\/[a-zA-Z0-9._-]+$/.test(s) ||
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s);
const safeLink = (s: string) =>
  s.startsWith('#') ||
  (/^https:\/\//.test(s) &&
    (() => {
      try {
        return !new URL(s).username && !new URL(s).password;
      } catch {
        return false;
      }
    })());
export default function StorefrontV3({
  products: initialProducts,
  brands,
}: {
  products: Product[];
  brands: TireBrand[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [lang, setLang] = useState<Lang>('th');
  const t = (th: string, en: string) => (lang === 'th' ? th : en);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings),
    [slides, setSlides] = useState(defaultSlides),
    [fitments, setFitments] = useState<Fitment[]>(baseFitments),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState('');
  const [tab, setTab] = useState('size'),
    [w, setW] = useState('205'),
    [r, setR] = useState('55'),
    [d, setD] = useState('16'),
    [raw, setRaw] = useState(''),
    [staggered, setStaggered] = useState(false),
    [rearRaw, setRearRaw] = useState(''),
    [front, setFront] = useState('205/55R16'),
    [rear, setRear] = useState(''),
    [brand, setBrand] = useState('all'),
    [sort, setSort] = useState('recommended'),
    [runflat, setRunflat] = useState(false),
    [error, setError] = useState(''),
    [limit, setLimit] = useState(6),
    [selectedFront, setSelectedFront] = useState<number | null>(null),
    [selectedRear, setSelectedRear] = useState<number | null>(null);
  const [vehicleMake, setVehicleMake] = useState(''),
    [vehicleModel, setVehicleModel] = useState(''),
    [vehicleYear, setVehicleYear] = useState(''),
    [vehicleTrim, setVehicleTrim] = useState(''),
    [dialog, setDialog] = useState(''),
    [detail, setDetail] = useState<Product | null>(null),
    [quantity, setQuantity] = useState(4),
    [message, setMessage] = useState(''),
    [menu, setMenu] = useState(false),
    [brandQuery, setBrandQuery] = useState(''),
    [adminTab, setAdminTab] = useState('brands'),
    [editId, setEditId] = useState(String(products[0]?.id)),
    [links, setLinks] = useState<ProductLinks>(defaultLinks),
    [fitmentText, setFitmentText] = useState(''),
    [point, setPoint] = useState('main'),
    [date, setDate] = useState(''),
    [chatText, setChatText] = useState(''),
    [chatReply, setChatReply] = useState(''),
    [contactOpen, setContactOpen] = useState(false),
    [locationShareStatus, setLocationShareStatus] = useState('');
  useEffect(() => {
    try {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      const savedLang = localStorage.getItem('lc-language');
      if (urlLang === 'th' || urlLang === 'en') setLang(urlLang);
      else if (savedLang === 'th' || savedLang === 'en') setLang(savedLang);

      // Load latest updated products from API or admin cache
      fetch('/api/catalog')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && Array.isArray(d.products) && d.products.length > 0) {
            setProducts(d.products);
          }
        })
        .catch(() => {
          const cached = localStorage.getItem('lc-admin-products');
          if (cached) {
            try {
              const list = JSON.parse(cached);
              if (Array.isArray(list) && list.length > 0) setProducts(list);
            } catch {}
          }
        });
      const rawSettings = localStorage.getItem(key);
      if (rawSettings) {
        const x = JSON.parse(rawSettings);
        const safe: Record<string, ProductLinks> = {};
        for (const [id, v] of Object.entries(x.productLinks || {})) {
          const l = v as ProductLinks;
          if (!l || typeof l !== 'object') continue;
          safe[id] = {
            website: l.website !== false,
            line: l.line !== false,
            shopee:
              typeof l.shopee === 'string' &&
              validChannelUrl('shopee', l.shopee)
                ? l.shopee
                : '',
            lazada:
              typeof l.lazada === 'string' &&
              validChannelUrl('lazada', l.lazada)
                ? l.lazada
                : '',
            tiktok:
              typeof l.tiktok === 'string' &&
              validChannelUrl('tiktok', l.tiktok)
                ? l.tiktok
                : '',
            thaimart:
              typeof l.thaimart === 'string' &&
              validChannelUrl('thaimart', l.thaimart)
                ? l.thaimart
                : '',
          };
        }
        setSettings({
          featuredBrands: Array.isArray(x.featuredBrands)
            ? x.featuredBrands.filter(
                (b: unknown) =>
                  typeof b === 'string' && brands.some((v) => v.name === b),
              )
            : initialSettings.featuredBrands,
          productLinks: safe,
        });
      }
      const savedSlides = localStorage.getItem('lc-slides-v3');
      if (savedSlides) {
        const x = JSON.parse(savedSlides);
        if (
          Array.isArray(x) &&
          x.length <= 10 &&
          x.every(
            (s) =>
              ['th', 'en', 'subTh', 'subEn', 'image', 'href'].every(
                (k) => typeof s[k] === 'string',
              ) &&
              safeImage(s.image) &&
              safeLink(s.href),
          )
        )
          setSlides(x);
      }
      const savedFits = localStorage.getItem('lc-fitments-v3');
      if (savedFits) {
        const sf = validateFitments(JSON.parse(savedFits));
        if (sf.length) setFitments(sf);
      }
    } catch {
      setNotice(
        'Some saved settings could not be loaded. / อ่านการตั้งค่าบางส่วนไม่ได้',
      );
    }
    setReady(true);
  }, [brands]);
  useEffect(() => {
    document.documentElement.lang = lang;
    if (ready) {
      try {
        localStorage.setItem('lc-language', lang);
      } catch {}
      const url = new URL(window.location.href);
      if (lang === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [lang, ready]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(settings));
      localStorage.setItem('lc-slides-v3', JSON.stringify(slides));
      localStorage.setItem('lc-fitments-v3', JSON.stringify(fitments));
    } catch {
      setNotice(
        'Storage full: export your settings. / พื้นที่เต็ม โปรดส่งออกการตั้งค่า',
      );
    }
  }, [settings, slides, fitments, ready]);
  useEffect(() => {
    setLinks(settings.productLinks[editId] || { ...defaultLinks });
  }, [editId, settings.productLinks]);
  const activeSlides = slides.filter((s) => s.enabled);
  const match = (p: Product, size: string) =>
    (!size || p.size === size) &&
    (brand === 'all' || canonical(p.brand) === canonical(brand)) &&
    (!runflat || p.runflat);
  const sorted = (items: Product[]) =>
    items.sort((a, b) =>
      sort === 'low'
        ? a.price - b.price
        : sort === 'high'
          ? b.price - a.price
          : Number(b.year) - Number(a.year) || a.price - b.price,
    );
  const frontProducts = sorted(products.filter((p) => match(p, front))),
    rearProducts = rear ? sorted(products.filter((p) => match(p, rear))) : [];
  const vehicleMakes = useMemo(
    () => [...new Set(fitments.map((v) => v.make))].sort(),
    [fitments],
  );
  const vehicleModels = useMemo(
    () =>
      [
        ...new Set(
          fitments.filter((v) => v.make === vehicleMake).map((v) => v.model),
        ),
      ].sort(),
    [fitments, vehicleMake],
  );
  const vehicleYears = useMemo(
    () =>
      [
        ...new Set(
          fitments
            .filter((v) => v.make === vehicleMake && v.model === vehicleModel)
            .map((v) => v.year),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [fitments, vehicleMake, vehicleModel],
  );
  const vehicleTrims = useMemo(
    () =>
      [
        ...new Set(
          fitments
            .filter(
              (v) =>
                v.make === vehicleMake &&
                v.model === vehicleModel &&
                v.year === vehicleYear,
            )
            .map((v) => v.trim),
        ),
      ].sort(),
    [fitments, vehicleMake, vehicleModel, vehicleYear],
  );
  const vehicleMatches = useMemo(
    () =>
      fitments
        .filter(
          (v) =>
            (!vehicleMake || v.make === vehicleMake) &&
            (!vehicleModel || v.model === vehicleModel) &&
            (!vehicleYear || v.year === vehicleYear) &&
            (!vehicleTrim || v.trim === vehicleTrim),
        )
        .slice(0, 50),
    [fitments, vehicleMake, vehicleModel, vehicleYear, vehicleTrim],
  );
  function chooseFitment(v: Fitment) {
    setFront(v.front);
    setRear(v.rear !== v.front ? v.rear : '');
    setRaw(v.front);
    setStaggered(v.rear !== v.front);
    setRearRaw(v.rear);
    setBrand('all');
    setSelectedFront(null);
    setSelectedRear(null);
    setLimit(6);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }
  function chooseVehicleMake(make: string) {
    setVehicleMake(make);
    setVehicleModel('');
    setVehicleYear('');
    setVehicleTrim('');
  }
  function search(e?: React.FormEvent) {
    e?.preventDefault();
    const f = parseSize(raw || `${w}/${r}R${d}`),
      b = staggered ? parseSize(rearRaw) : '';
    if (!f || (staggered && !b)) {
      setError(
        t(
          'ตรวจขนาดยาง หน้า 165–315 ซีรีส์ 20–85 ขอบ 12–26 เช่น 2055516',
          'Check tyre size: width 165–315, profile 20–85, rim 12–26. Example: 2055516',
        ),
      );
      return;
    }
    setError('');
    setFront(f);
    setRear(b || '');
    setSelectedFront(null);
    setSelectedRear(null);
    setLimit(6);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }
  function selectBrand(name: string) {
    setBrand(name);
    setFront('');
    setRear('');
    setSelectedFront(null);
    setSelectedRear(null);
    setLimit(6);
    setDialog('');
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }
  function inquiry(p: Product, n: number) {
    return t(
      `สนใจ ${p.brand} ${modelName(p)}\nขนาด ${p.size} ปี ${p.year}\nจำนวน ${n} เส้น\nรหัส LC-${p.id}\n${p.url}\nกรุณายืนยันราคา สต็อก และสเปกรถก่อนสั่งซื้อค่ะ`,
      `Interested in ${p.brand} ${modelName(p)}\nSize ${p.size}, year ${p.year}\nQuantity: ${n} tyres\nSKU LC-${p.id}\n${p.url}\nPlease confirm price, availability and vehicle specifications.`,
    );
  }
  function toLine(text: string) {
    setDetail(null);
    setMessage(text);
    setNotice('');
    setDialog('line');
  }
  function channels(p: Product) {
    const l = settings.productLinks[String(p.id)] || defaultLinks;
    return (
      <div className="channel-buttons compact">
        {l.website && (
          <a
            className="channel-button web"
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('เว็บไซต์', 'Website')}
          </a>
        )}
        {(['shopee', 'lazada', 'tiktok', 'thaimart'] as const).map((k) =>
          l[k] ? (
            <a
              className={'channel-button ' + k}
              key={k}
              href={l[k]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PlatformLogo name={k} />
              {k === 'thaimart'
                ? 'Thaimart'
                : k === 'tiktok'
                  ? 'TikTok'
                  : k === 'lazada'
                    ? 'Lazada'
                    : 'Shopee'}
            </a>
          ) : null,
        )}
        {l.line && (
          <button
            className="channel-button line"
            onClick={() => toLine(inquiry(p, detail ? quantity : 4))}
          >
            LINE
          </button>
        )}
      </div>
    );
  }
  function card(p: Product, axle: 'front' | 'rear') {
    const selected = axle === 'front' ? selectedFront : selectedRear;
    return (
      <article className="tire-card" key={p.id}>
        <div className="tire-photo">
          <img
            src={p.image}
            alt={`${p.brand} ${modelName(p)} ${p.size}`}
            loading="lazy"
          />
        </div>
        <div className="tire-card-body">
          <strong className="tire-brand">{p.brand}</strong>
          <h3>{modelName(p)}</h3>
          <p>
            {p.size} · {t('ปี', 'Year')} {p.year}
          </p>
          <div className="tire-price">
            ฿{money(p.price)} <small>/{t('เส้น', 'tyre')}</small>
          </div>
          <button
            className="btn orange details-btn"
            onClick={() => {
              setDetail(p);
              setQuantity(rear ? 2 : 4);
            }}
          >
            {t('ดูรายละเอียด', 'View details')}
          </button>
          {channels(p)}
          {rear && (
            <button
              className={'btn ' + (selected === p.id ? 'orange' : 'light')}
              aria-pressed={selected === p.id}
              onClick={() =>
                axle === 'front'
                  ? setSelectedFront(p.id)
                  : setSelectedRear(p.id)
              }
            >
              {selected === p.id ? '✓ ' : ''}
              {axle === 'front'
                ? t('เลือกคู่หน้า (2 เส้น)', 'Select front pair (2)')
                : t('เลือกคู่หลัง (2 เส้น)', 'Select rear pair (2)')}
            </button>
          )}
        </div>
      </article>
    );
  }
  function exportData() {
    const blob = new Blob(
        [JSON.stringify({ settings, slides, fitments }, null, 2)],
        { type: 'application/json' },
      ),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'lc-tyre-settings-v3.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setNotice(t('คัดลอกแล้ว', 'Copied'));
    } catch {
      setNotice(
        t('เลือกข้อความและคัดลอกเองได้เลย', 'Select and copy the message manually'),
      );
    }
  }
  const locationShareText = t(
    'แผนที่และข้อมูลร้าน หลงฉื่อ ขึ้นชื่อเรื่องยาง — สาขาเจริญพัฒนา (กีบหมู)',
    'Long Ci Tyre — Charoen Phatthana (Kip Mu) map and branch details',
  );
  function sharedLocationPage(source: string) {
    return websiteLocationUrl(window.location.origin, source);
  }
  function openLocationShare(channel: 'line' | 'facebook' | 'x') {
    const links = locationShareLinks(
      sharedLocationPage(channel),
      locationShareText,
    );
    window.open(links[channel], '_blank', 'noopener,noreferrer');
  }
  async function copyLocation() {
    try {
      await navigator.clipboard.writeText(
        `${locationShareText}\n${sharedLocationPage('copy_link')}`,
      );
      setLocationShareStatus(t('คัดลอกลิงก์แล้ว', 'Location link copied'));
    } catch {
      setLocationShareStatus(
        t('กรุณากดเปิดแผนที่แล้วคัดลอกลิงก์', 'Please open the map and copy its link'),
      );
    }
  }
  async function shareLocation() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: locationShareText,
          text: locationShareText,
          url: sharedLocationPage('native_share'),
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
      }
    }
    await copyLocation();
  }
  const frontChoice = products.find((p) => p.id === selectedFront),
    rearChoice = products.find((p) => p.id === selectedRear);
  return (
    <div className="storefront v3">
      <a className="skip" href="#finder">
        {t('ข้ามไปค้นหายาง', 'Skip to tyre finder')}
      </a>

      <div className="store-top">
        <a className="brand-lockup" href="#">
          <img src="/assets/long-ci-logo.png" alt="LONG CI GROUP" />
          <div>
            <strong>LC TYRE</strong>
            <b>{t(SHOP, 'Long Ci Tyre')}</b>
            <small>Good Tires, Better Journeys</small>
          </div>
        </a>
        <div className="top-trust">
          <span>
            <Truck />
            <b>{t('จัดส่งทั่วไทย', 'Nationwide delivery')}</b>
          </span>
          <span>
            <ShieldCheck />
            <b>{t('เลือกยางอย่างมั่นใจ', 'Tyres for your journey')}</b>
          </span>
          <span>
            <Wrench />
            <b>{t('บริการติดตั้ง', 'Installation service')}</b>
          </span>
        </div>
        <div className="v3-header-actions">
          <div className="v3-language" aria-label="Language">
            <button aria-pressed={lang === 'th'} onClick={() => setLang('th')}>
              ไทย
            </button>
            <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
          <a className="phone-top" href="tel:0985795449">
            <Phone size={17} />
            098-579-5449
          </a>
        </div>
      </div>
      <header className="store-nav">
        <nav aria-label={t('เมนูหลัก', 'Main menu')}>
          {[
            ['หน้าแรก', 'Home', '#'],
            ['ค้นหายาง', 'Tyre finder', '#finder'],
            ['สินค้า', 'Products', '#products'],
            ['โปรโมชั่น', 'Promotions', '#promotions'],
            ['จุดติดตั้ง', 'Installation', '#branches'],
            [
              'ค่าบริการ',
              'Services',
              lang === 'en' ? '/services?lang=en' : '/services',
            ],
            ['รีวิว', 'Reviews', '#reviews'],
            ['บทความ', 'Articles', '#articles'],
            ['ติดต่อเรา', 'Contact', '#channels'],
          ].map(([th, en, url]) => (
            <a key={url} href={url}>
              {t(th, en)}
            </a>
          ))}
        </nav>
        <div className="nav-tools">
          <button
            onClick={() => setDialog('account')}
            aria-label={t('ตะกร้าและบัญชี', 'Cart and account')}
          >
            <ShoppingCart size={20} />
          </button>
          <button
            className="hamburger"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label={t('เปิดเมนู', 'Open menu')}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {menu && (
        <nav className="mobile-nav">
          {[
            ['ค้นหายาง', 'Find tyres', '#finder'],
            ['โปรโมชั่น', 'Promotions', '#promotions'],
            ['จุดติดตั้ง', 'Installation', '#branches'],
            [
              'ค่าบริการ',
              'Services',
              lang === 'en' ? '/services?lang=en' : '/services',
            ],
            ['รีวิว', 'Reviews', '#reviews'],
            ['บทความ', 'Articles', '#articles'],
          ].map(([th, en, url]) => (
            <a key={url} href={url} onClick={() => setMenu(false)}>
              {t(th, en)}
            </a>
          ))}
        </nav>
      )}
      <main>
        <section id="promotions">
          <RotatingCards
            lang={lang}
            label={t('โปรโมชั่นร้าน', 'Store promotions')}
            hero
          >
            {(activeSlides.length
              ? activeSlides
              : defaultSlides.slice(0, 1)
            ).map((s, i) => (
              <div
                className={
                  'v3-hero ' +
                  (s.image.includes('suv') ? 'scene' : 'product-slide')
                }
                key={i}
              >
                <img
                  src={s.image}
                  alt=""
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                />
                <div className="v3-hero-copy">
                  <p>
                    LONG <em>CI</em> TYRE
                  </p>
                  {i === 0 ? (
                    <h1>{t(s.th, s.en)}</h1>
                  ) : (
                    <h2>{t(s.th, s.en)}</h2>
                  )}
                  <p>{t(s.subTh, s.subEn)}</p>
                  <a className="btn orange" href={s.href}>
                    {t('ดูเพิ่มเติม', 'Explore')} <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            ))}
          </RotatingCards>
        </section>
        <section
          className="v3-vehicle-types"
          aria-label={t('เลือกประเภทรถ', 'Choose vehicle type')}
        >
          {[
            ['รถเก๋ง', 'Sedan', Car],
            ['SUV / 4x4', 'SUV & 4WD', CarFront],
            ['กระบะ', 'Pickup', Truck],
            ['รถตู้ / MPV', 'Van / MPV', BusFront],
            ['ยาง EV', 'EV tyres', Zap],
            ['มอเตอร์ไซค์', 'Motorcycle', Bike],
            ['สายลุย AT / MT', 'Off-road', Mountain],
            ['รถบรรทุก', 'Commercial', Truck],
          ].map(([th, en, Icon]) => (
            <button
              key={String(th)}
              type="button"
              onClick={() => {
                setTab('vehicle');
                document
                  .getElementById('finder')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Icon aria-hidden="true" />
              <span>
                {t(String(th), String(en))}
                <small>{lang === 'th' ? String(en) : String(th)}</small>
              </span>
            </button>
          ))}
        </section>
        <section id="finder" className="v3-finder">
          <div className="section-title">
            <h2>{t('ค้นหายางที่ใช่สำหรับคุณ', 'Find the right tyres')}</h2>
            <small>
              {t(
                'ค้นหาเร็วด้วยชุดตัวเลข เช่น 2055516',
                'Quick search: enter a size such as 2055516',
              )}
            </small>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
            <TabsList>
              <TabsTrigger value="size">
                {t('ขนาดยาง / หน้า–หลัง', 'Size / front & rear')}
              </TabsTrigger>
              <TabsTrigger value="vehicle">{t('รุ่นรถ', 'Vehicle')}</TabsTrigger>
              <TabsTrigger value="brand">
                {t('แบรนด์ยาง', 'Tyre brand')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="size">
              <form onSubmit={search}>
                <div className="v3-size-row">
                  <label>
                    {t('หน้ากว้าง', 'Width')}
                    <Pick
                      value={w}
                      set={(v) => {
                        setW(v);
                        setRaw('');
                      }}
                      items={widths}
                      label={t('หน้ากว้างยาง', 'Tyre width')}
                    />
                  </label>
                  <label>
                    {t('ซีรีส์', 'Profile')}
                    <Pick
                      value={r}
                      set={(v) => {
                        setR(v);
                        setRaw('');
                      }}
                      items={Array.from({ length: 14 }, (_, i) =>
                        String(20 + i * 5),
                      )}
                      label={t('ซีรีส์ยาง', 'Tyre profile')}
                    />
                  </label>
                  <label>
                    {t('ขอบล้อ', 'Rim')}
                    <Pick
                      value={d}
                      set={(v) => {
                        setD(v);
                        setRaw('');
                      }}
                      items={Array.from({ length: 15 }, (_, i) =>
                        String(12 + i),
                      )}
                      label={t('ขอบล้อ', 'Rim diameter')}
                    />
                  </label>
                  <label className="v3-quick">
                    {staggered
                      ? t('พิมพ์ขนาดคู่หน้า', 'Front size')
                      : t('พิมพ์ชุดตัวเลข', 'Quick size entry')}
                    <input
                      aria-label={t('ชุดตัวเลขขนาดยาง', 'Quick tyre size')}
                      placeholder="2055516 / 205/55R16"
                      value={raw}
                      onChange={(e) => setRaw(e.target.value)}
                      autoCapitalize="characters"
                    />
                  </label>
                  <button className="btn orange">
                    <Search size={19} />
                    {t('ค้นหายาง', 'Find tyres')}
                  </button>
                </div>
                <label className="check-line">
                  <Checkbox
                    checked={staggered}
                    onCheckedChange={(v) => setStaggered(v === true)}
                  />
                  {t('ยางหน้า–หลังต่างขนาด', 'Different front and rear sizes')}
                </label>
                {staggered && (
                  <label className="v3-rear-field">
                    {t('ขนาดคู่หลัง', 'Rear size')}
                    <input
                      required
                      aria-label={t('ขนาดยางหลัง', 'Rear tyre size')}
                      placeholder="2254517 / 225/45R17"
                      value={rearRaw}
                      onChange={(e) => setRearRaw(e.target.value)}
                    />
                    <small>
                      {t(
                        'เลือกสินค้า 2 เส้นต่อเพลาได้หลังค้นหา ต้องตรวจสเปกรถก่อนสั่งซื้อ',
                        'Choose 2 tyres per axle after searching. Confirm vehicle specifications before ordering.',
                      )}
                    </small>
                  </label>
                )}
                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}
              </form>
            </TabsContent>
            <TabsContent value="vehicle">
              <div className="vehicle-brand-picker">
                <span>{t('เลือกยี่ห้อรถจากโลโก้', 'Choose a vehicle make')}</span>
                <div className="vehicle-brand-logo-grid">
                  {vehicleMakes.map((make) => {
                    const item = VEHICLE_BRAND_LOGOS[make];
                    return (
                      <button
                        type="button"
                        key={make}
                        aria-pressed={vehicleMake === make}
                        onClick={() => chooseVehicleMake(make)}
                      >
                        {item && <img src={item.logo} alt="" loading="lazy" />}
                        <span>{make === 'AVATAR' ? 'AVATR' : make}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="vehicle-picker">
                <label>
                  {t('ยี่ห้อรถ', 'Make')}
                  <select
                    value={vehicleMake}
                    onChange={(e) => chooseVehicleMake(e.target.value)}
                  >
                    <option value="">{t('เลือกยี่ห้อ', 'Select make')}</option>
                    {vehicleMakes.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('รุ่นรถ', 'Model')}
                  <select
                    value={vehicleModel}
                    disabled={!vehicleMake}
                    onChange={(e) => {
                      setVehicleModel(e.target.value);
                      setVehicleYear('');
                      setVehicleTrim('');
                    }}
                  >
                    <option value="">{t('เลือกรุ่น', 'Select model')}</option>
                    {vehicleModels.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('ปีรถ', 'Year')}
                  <select
                    value={vehicleYear}
                    disabled={!vehicleModel}
                    onChange={(e) => {
                      setVehicleYear(e.target.value);
                      setVehicleTrim('');
                    }}
                  >
                    <option value="">{t('เลือกปี', 'Select year')}</option>
                    {vehicleYears.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('รุ่นย่อย', 'Variant / trim')}
                  <select
                    value={vehicleTrim}
                    disabled={!vehicleYear}
                    onChange={(e) => setVehicleTrim(e.target.value)}
                  >
                    <option value="">{t('ทุกรุ่นย่อย', 'All variants')}</option>
                    {vehicleTrims.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {vehicleMake && (
                <p className="vehicle-data-note">
                  {t(
                    `ฐานข้อมูลรถ ${fitments.length.toLocaleString()} รายการ · เลือกให้ครบเพื่อดูขนาดยาง`,
                    `Vehicle database: ${fitments.length.toLocaleString()} records · complete the selections to view tyre sizes`,
                  )}
                </p>
              )}
              {vehicleMake && vehicleModel && vehicleYear ? (
                <div className="v3-fitment-results">
                  {vehicleMatches.map((v, i) => {
                    const oemLabels = [
                      ...(v.oemBrands || []),
                      ...oemLabelsForFitment(
                        v,
                        oemReferenceData.records as OemReference[],
                      ),
                    ].filter(
                      (value, index, list) => list.indexOf(value) === index,
                    );
                    return (
                      <button
                        key={`${v.make}-${v.model}-${v.year}-${v.trim}-${v.front}-${i}`}
                        onClick={() => chooseFitment(v)}
                      >
                        <strong>
                          {v.make} {v.model} {v.year}
                        </strong>
                        <span>{v.trim}</span>
                        <span>
                          {t('หน้า', 'Front')} {v.front} · {t('หลัง', 'Rear')}{' '}
                          {v.rear}
                        </span>
                        {!!oemLabels.length && (
                          <span className="v3-oem-brands">
                            <b>
                              {t(
                                'แบรนด์ยางติดรถเดิม (OEM)',
                                'Original equipment (OEM)',
                              )}
                            </b>
                            {oemLabels.join(', ')}
                          </span>
                        )}
                        <small>
                          {
                            products.filter(
                              (p) => p.size === v.front || p.size === v.rear,
                            ).length
                          }{' '}
                          {t(
                            'รายการสินค้าในเว็บที่ขนาดตรงกัน',
                            'matching products in this preview',
                          )}
                        </small>
                      </button>
                    );
                  })}
                  {!vehicleMatches.length && (
                    <p>
                      {t(
                        'ไม่พบข้อมูลรุ่นย่อยนี้',
                        'No fitment found for this selection.',
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <div className="v3-empty">
                  {t(
                    'เลือกยี่ห้อ รุ่น และปีรถ ระบบจะแสดงรุ่นย่อยและขนาดยางให้เลือก',
                    'Choose make, model and year to see variants and tyre sizes.',
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="brand">
              <input
                className="v3-wide-input"
                aria-label={t('ค้นหาแบรนด์', 'Search brands')}
                placeholder={t('พิมพ์ชื่อแบรนด์', 'Enter brand name')}
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
              />
              <div className="brand-library">
                {brands
                  .filter((b) =>
                    b.name.toLowerCase().includes(brandQuery.toLowerCase()),
                  )
                  .map((b) => (
                    <button key={b.name} onClick={() => selectBrand(b.name)}>
                      <BrandMark brand={b} />
                      <span>{b.name}</span>
                    </button>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
        <section
          id="brands"
          className="brand-wall-section"
          aria-labelledby="all-brands-title"
        >
          <div className="section-title">
            <div>
              <h2 id="all-brands-title">
                {t('เลือกแบรนด์ยาง', 'Shop by tyre brand')}
              </h2>
              <p>
                {t(
                  'รวมแบรนด์ยางทั้งหมดที่ร้านรองรับ กดแบรนด์เพื่อดูสินค้าที่มีในระบบ',
                  'Browse all supported tyre brands and select one to view matching products.',
                )}
              </p>
            </div>
            <span className="brand-count">
              {brands.length} {t('แบรนด์', 'brands')}
            </span>
          </div>
          <div className="brand-wall">
            {brands.map((b) => {
              const count = products.filter(
                (p) => canonical(p.brand) === canonical(b.name),
              ).length;
              return (
                <button
                  key={b.name}
                  id={`brand-${canonical(b.name).toLowerCase()}`}
                  className="brand-wall-card"
                  onClick={() => selectBrand(b.name)}
                  aria-label={`${b.name} · ${count} ${t('สินค้า', 'products')}`}
                >
                  <BrandMark brand={b} />
                  <small>{b.name}</small>
                  {count > 0 && (
                    <em>
                      {count} {t('สินค้า', 'products')}
                    </em>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <section className="catalog-section" id="products">
          <div className="section-title">
            <div>
              <h2>
                {rear
                  ? t('เลือกคู่ยางหน้า–หลัง', 'Choose front and rear pairs')
                  : t('ค้นหายาง ', 'Tyres ')}
                {!rear && front}
              </h2>
              <p>
                {t(
                  'ราคาและสินค้า ณ 7 ก.ย. 2026 โปรดยืนยันราคาและสต็อกก่อนซื้อ',
                  'Product snapshot: 7 Sep 2026. Confirm prices and stock before purchase.',
                )}
              </p>
            </div>
            <Pick
              value={sort}
              set={setSort}
              items={['recommended', 'low', 'high']}
              label={t(
                'เรียงราคา: low ต่ำไปสูง / high สูงไปต่ำ',
                'Sort: low to high / high to low',
              )}
            />
          </div>
          <div className="filter-strip">
            <Pick
              value={brand}
              set={(v) => {
                setBrand(v);
                setLimit(6);
              }}
              items={['all', ...brands.map((b) => b.name)]}
              label={t('แบรนด์ (all = ทั้งหมด)', 'Brand (all = all brands)')}
            />
            <label className="check-line">
              <Checkbox
                checked={runflat}
                onCheckedChange={(v) => setRunflat(v === true)}
              />
              Run Flat
            </label>
            <button
              className="text-button"
              onClick={() => {
                setFront('');
                setRear('');
                setBrand('all');
                setRunflat(false);
                setLimit(6);
              }}
            >
              {t('แสดงสินค้าทั้งหมด', 'Show all products')}
            </button>
          </div>
          {rear && (
            <h3>
              {t('คู่หน้า', 'Front pair')} · {front} · {frontProducts.length}{' '}
              {t('รายการ', 'products')}
            </h3>
          )}
          <div className="tire-grid">
            {frontProducts.slice(0, limit).map((p) => card(p, 'front'))}
          </div>
          {!frontProducts.length && (
            <div className="v3-empty">
              {t(
                'ไม่พบสินค้าขนาดนี้ในชุดตัวอย่าง สอบถามสต็อกเพิ่มเติมได้ที่ LINE',
                'No matching product in this sample. Ask LINE for more stock options.',
              )}
              <button
                className="btn light"
                onClick={() =>
                  toLine(`${t('สอบถามยาง', 'Tyre enquiry')} ${front}`)
                }
              >
                LINE
              </button>
            </div>
          )}
          {rear && (
            <>
              <h3 className="v3-rear-title">
                {t('คู่หลัง', 'Rear pair')} · {rear} · {rearProducts.length}{' '}
                {t('รายการ', 'products')}
              </h3>
              <div className="tire-grid">
                {rearProducts.slice(0, limit).map((p) => card(p, 'rear'))}
              </div>
              {!rearProducts.length && (
                <p>
                  {t(
                    'ไม่พบคู่หลังในชุดตัวอย่าง สอบถามร้านเพิ่มเติมก่อนสั่งซื้อ',
                    'No rear tyres in the sample. Contact the store before ordering.',
                  )}
                </p>
              )}
              <div className="v3-pair-summary">
                <h3>{t('ชุดยางที่เลือก', 'Your tyre set')}</h3>
                <p>
                  {t('หน้า', 'Front')}:{' '}
                  {frontChoice
                    ? `${frontChoice.brand} ${modelName(frontChoice)} ${frontChoice.size} × 2`
                    : t('ยังไม่ได้เลือก', 'Not selected')}
                </p>
                <p>
                  {t('หลัง', 'Rear')}:{' '}
                  {rearChoice
                    ? `${rearChoice.brand} ${modelName(rearChoice)} ${rearChoice.size} × 2`
                    : t('ยังไม่ได้เลือก', 'Not selected')}
                </p>
                {frontChoice && rearChoice && (
                  <strong>
                    ฿{money((frontChoice.price + rearChoice.price) * 2)} / 4{' '}
                    {t('เส้น (ราคาในชุดตัวอย่าง)', 'tyres (sample price)')}
                  </strong>
                )}
                <p>
                  {t(
                    'รายการนี้ไม่ใช่การรับรองความเข้ากันได้ ต้องตรวจดัชนีรับน้ำหนัก พิกัดความเร็ว และข้อกำหนดผู้ผลิตรถ',
                    'Selection is not a fitment approval. Verify load/speed ratings and vehicle manufacturer requirements.',
                  )}
                </p>
                <button
                  className="btn orange"
                  disabled={!frontChoice || !rearChoice}
                  onClick={() =>
                    frontChoice &&
                    rearChoice &&
                    toLine(
                      `${t('ชุดยางหน้า–หลัง', 'Front/rear set')}\n${inquiry(frontChoice, 2)}\n\n${inquiry(rearChoice, 2)}`,
                    )
                  }
                >
                  {t('สอบถามชุดนี้ผ่าน LINE', 'Enquire about this set on LINE')}
                </button>
              </div>
            </>
          )}
          {(frontProducts.length > limit || rearProducts.length > limit) && (
            <button
              className="btn light v3-load"
              onClick={() => setLimit((n) => n + 6)}
            >
              {t('ดูสินค้าเพิ่มเติม', 'Load more')}
            </button>
          )}
        </section>
        <section className="v3-section" id="branches">
          <h2>{t('จุดรับติดตั้งของเรา', 'Our installation locations')}</h2>
          <div className="branch-main-only">
            <article>
              <div className="branch-symbol">
                <MapPin size={30} />
              </div>
              <div>
                <small>
                  {t('สาขาหลัก · ติดตั้งฟรี', 'Main branch · Free fitting')}
                </small>
                <h3>{t(installationPoints[0].th, installationPoints[0].en)}</h3>
                <p>
                  {t(
                    'ถอด–ใส่และถ่วงล้อฟรีที่สาขาเจริญพัฒนา',
                    'Free fitting and balancing at Charoen Phatthana.',
                  )}
                </p>
                <a
                  className="btn light"
                  href={installationPoints[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('แผนที่ / Google', 'Map / Google')} ↗
                </a>
                <button
                  className="btn orange"
                  onClick={() => {
                    setPoint('main');
                    setDialog('booking');
                  }}
                >
                  {t('สอบถามคิวติดตั้ง', 'Enquire about a slot')}
                </button>
              </div>
            </article>
            <aside className="partner-install-note">
              <strong>
                {t(
                  'มีจุดติดตั้งอื่นให้บริการ',
                  'Other installation points are available',
                )}
              </strong>
              <p>
                {t(
                  'สอบถามจุดที่สะดวกใกล้คุณกับเจ้าหน้าที่',
                  'Ask our staff for the most convenient location near you.',
                )}
              </p>
              <div className="partner-fees">
                <span>
                  {t('ถอด–ใส่–ถ่วง', 'Fit & balance')}{' '}
                  <b>{t('2,000 บาท/ชุด', 'THB 2,000/set')}</b>
                </span>
                <span>
                  {t('ตั้งศูนย์', 'Wheel alignment')}{' '}
                  <b>{t('1,200 บาท/ครั้ง', 'THB 1,200/service')}</b>
                </span>
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setPoint('partner1');
                  setDialog('booking');
                }}
              >
                {t('สอบถามจุดติดตั้งอื่น', 'Ask about other locations')} →
              </button>
            </aside>
          </div>
          <div className="main-location-map">
            <div className="main-location-map-frame">
              <iframe
                src={mainLocation.embedUrl}
                title={t(
                  'แผนที่สาขาเจริญพัฒนา หลงฉื่อ ขึ้นชื่อเรื่องยาง',
                  'Map of Long Ci Tyre Charoen Phatthana branch',
                )}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="main-location-share">
              <div>
                <small>{t('ส่งพิกัดให้ลูกค้า', 'Share with a customer')}</small>
                <h3>{t('แชร์แผนที่สาขาหลัก', 'Share the main branch map')}</h3>
                <p>
                  {t(
                    'บนมือถือกด “แชร์” แล้วเลือก LINE, Messenger, Instagram, TikTok หรือแอปที่ติดตั้งไว้ได้ทันที',
                    'On mobile, tap Share and choose LINE, Messenger, Instagram, TikTok, or another installed app.',
                  )}
                </p>
              </div>
              <div className="location-share-actions">
                <button
                  className="btn orange"
                  type="button"
                  onClick={shareLocation}
                >
                  <Share2 size={18} /> {t('แชร์ผ่านมือถือ', 'Share')}
                </button>
                <button
                  className="btn light"
                  type="button"
                  onClick={() => openLocationShare('line')}
                  aria-label={t('แชร์พิกัดผ่าน LINE', 'Share location via LINE')}
                >
                  <PlatformLogo name="line" /> LINE
                </button>
                <button
                  className="btn light"
                  type="button"
                  onClick={() => openLocationShare('facebook')}
                  aria-label={t(
                    'แชร์พิกัดผ่าน Facebook',
                    'Share location via Facebook',
                  )}
                >
                  <PlatformLogo name="facebook" /> Facebook
                </button>
                <button
                  className="btn light"
                  type="button"
                  onClick={() => openLocationShare('x')}
                  aria-label={t('แชร์พิกัดผ่าน X', 'Share location via X')}
                >
                  <PlatformLogo name="x" /> X
                </button>
                <button
                  className="btn light"
                  type="button"
                  onClick={copyLocation}
                >
                  <Copy size={18} /> {t('คัดลอกลิงก์', 'Copy link')}
                </button>
              </div>
              {locationShareStatus && (
                <output className="location-share-status">
                  {locationShareStatus}
                </output>
              )}
            </div>
          </div>
        </section>
        <GoogleReviews lang={lang} />
        <section className="v3-section" id="channels">
          <h2>
            {t('เลือกซื้อช่องทางที่สะดวก', 'Shop through your favourite channel')}
          </h2>
          <div className="channel-hub">
            {CHANNELS.map((c) => (
              <a
                key={c.key}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderColor: c.color }}
              >
                <PlatformLogo name={c.key} />
                <span>{c.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
        <section className="v3-section" id="articles">
          <div className="section-title">
            <h2>
              {t('รู้เรื่องยางก่อนตัดสินใจ', 'Tyre guides for better decisions')}
            </h2>
            <button
              className="text-button"
              onClick={() => {
                setAdminTab('articles');
                setDialog('admin');
              }}
            >
              {t('เตรียมบทความด้วย AI', 'Prepare an AI article brief')}
            </button>
          </div>
          <div className="journal-grid">
            {articleSeeds.map((a, i) => (
              <a
                className="journal-card"
                key={a.slug}
                href={`/articles/${a.slug}${lang === 'en' ? '?lang=en' : ''}`}
              >
                <div className="journal-photo">
                  <img src={a.image} alt="" loading="lazy" />
                </div>
                <small>{a.category}</small>
                <h3>
                  {t(
                    a.title,
                    [
                      'How to read 205/55R16 tyre markings',
                      'Choosing tyres for an EV',
                      'Planning your tyre installation',
                    ][i],
                  )}
                </h3>
                <p>
                  {t(
                    'บทความตัวอย่าง · รอตรวจทานก่อนเผยแพร่',
                    'Draft guide · Pending editorial review',
                  )}
                </p>
              </a>
            ))}
          </div>
        </section>
        <section className="v3-section v3-future">
          <h2>
            {t('เตรียมพบหมวดสินค้าเพิ่มเติม', 'More product categories are coming')}
          </h2>
          <div>
            {[
              ['ล้อแม็ก', 'Alloy wheels'],
              ['น้ำมันเครื่อง', 'Engine oil'],
              ['โช๊คอัพ', 'Shock absorbers'],
              ['แบตเตอรี่', 'Batteries'],
            ].map(([th, en]) => (
              <span key={en}>
                {t(th, en)} <small>{t('เร็ว ๆ นี้', 'Coming soon')}</small>
              </span>
            ))}
          </div>
        </section>
      </main>
      <footer className="store-footer" id="footer-social">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>LC TYRE</h2>
            <p>{t(COMPANY, 'Long Ci Group Co., Ltd.')}</p>
            <p>{t(SHOP, 'Good Tires, Better Journeys')}</p>
          </div>
          <div className="footer-contact">
            <b>{t('ติดต่อเรา', 'Contact us')}</b>
            <a href="tel:0985795449">098-579-5449</a>
            <a
              href={CHANNELS.find((c) => c.key === 'line')!.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              LINE @lcgroup ↗
            </a>
          </div>
          <div className="footer-social-column">
            <b>{t('โซเชียลมีเดีย', 'Social Media')}</b>
            <nav
              className="footer-socials"
              aria-label={t('ช่องทางโซเชียลมีเดีย', 'Social media channels')}
            >
              {SOCIAL_CHANNELS.map((c) =>
                c.url ? (
                  <a
                    key={c.key}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${c.label} ↗`}
                  >
                    <PlatformLogo name={c.key} />
                    <span>{c.label}</span>
                  </a>
                ) : (
                  <span
                    className="footer-social-pending"
                    key={c.key}
                    aria-label={`${c.label} · ${t('รอใส่ลิงก์', 'Link pending')}`}
                  >
                    <PlatformLogo name={c.key} />
                    <span>
                      {c.label}
                      <small>{t('รอใส่ลิงก์', 'Link pending')}</small>
                    </span>
                  </span>
                ),
              )}
            </nav>
          </div>
        </div>
        <p>
          {t(
            'ตัวอย่างเว็บไซต์ ไม่รับชำระเงิน ไม่ยืนยันคิว และยังไม่เปลี่ยนเว็บไซต์จริง',
            'Website preview. No payments or booking confirmations. Live website unchanged.',
          )}
        </p>
      </footer>
      <aside
        className={'contact-dock ' + (contactOpen ? 'is-open' : '')}
        aria-label={t('ติดต่อเจ้าหน้าที่', 'Contact our team')}
      >
        <div className="contact-dock-actions" aria-hidden={!contactOpen}>
          <a
            href="https://www.facebook.com/profile.php?id=61578481134472&locale=th_TH"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-action contact-facebook"
          >
            <span>{t('แชทผ่าน Facebook', 'Chat on Facebook')}</span>
            <i><PlatformLogo name="facebook" /></i>
          </a>
          <a
            href="https://lin.ee/VS8gwUM"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-action contact-line"
          >
            <span>{t('แชทผ่าน LINE', 'Chat on LINE')}</span>
            <i><PlatformLogo name="line" /></i>
          </a>
          <a href="tel:0985795449" className="contact-action contact-phone">
            <span>{t('โทรหาเรา', 'Call us')}</span>
            <i><Phone /></i>
          </a>
          <button
            type="button"
            className="contact-action contact-webchat"
            onClick={() => {
              setContactOpen(false);
              setChatReply('');
              setDialog('chat');
            }}
          >
            <span>{t('แชทผ่านเว็บ', 'Web chat')}</span>
            <i><MessageCircle /></i>
          </button>
        </div>
        <button
          type="button"
          className="contact-dock-toggle"
          aria-expanded={contactOpen}
          aria-label={
            contactOpen
              ? t('ปิดช่องทางติดต่อ', 'Close contact options')
              : t('เปิดช่องทางติดต่อ', 'Open contact options')
          }
          onClick={() => setContactOpen((value) => !value)}
        >
          {contactOpen ? <X /> : <MessageCircle />}
          <span>{t('คุยกับเรา', 'Contact us')}</span>
        </button>
      </aside>
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="lc-dialog">
          <DialogTitle>
            {detail ? `${detail.brand} ${modelName(detail)}` : ''}
          </DialogTitle>
          <DialogDescription>
            {t(
              'ข้อมูลตัวอย่างจากเว็บไซต์เดิม ไม่ใช่สต็อกสด',
              'Snapshot from the existing store, not live inventory.',
            )}
          </DialogDescription>
          {detail && (
            <div className="product-detail">
              <img src={detail.image} alt={detail.name} />
              <div>
                <h2>{detail.size}</h2>
                <p>
                  {t('ปี', 'Year')} {detail.year} · LC-{detail.id}
                </p>
                <p className="detail-price">฿{money(detail.price)}</p>
                <label>
                  {t('จำนวนเส้น', 'Quantity')}
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                      )
                    }
                  />
                </label>
                <p>
                  {t(
                    'ราคานี้ต้องยืนยันกับร้านอีกครั้ง',
                    'Confirm this price with the store.',
                  )}
                </p>
                {channels(detail)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!dialog}
        onOpenChange={(open) => {
          if (!open) {
            setDialog('');
            setNotice('');
          }
        }}
      >
        <DialogContent
          className={'lc-dialog ' + (dialog === 'admin' ? 'admin-dialog' : '')}
        >
          <DialogTitle>
            {dialog === 'admin'
              ? t('จัดการตัวอย่าง', 'Manage preview')
              : dialog === 'line'
                ? 'LINE @lcgroup'
                : dialog === 'booking'
                  ? t('สอบถามคิวติดตั้ง', 'Installation enquiry')
                  : dialog === 'chat'
                    ? t('ผู้ช่วยค้นหายาง', 'Tyre assistant')
                    : t('ระบบเว็บไซต์เดิม', 'Existing website')}
          </DialogTitle>
          <DialogDescription>
            {dialog === 'admin'
              ? t(
                  'บันทึกเฉพาะเบราว์เซอร์นี้ ไม่เขียนเข้า WordPress',
                  'Saved in this browser only. No WordPress changes.',
                )
              : t(
                  'ตัวอย่างนี้ไม่ส่งข้อความหรือยืนยันรายการอัตโนมัติ',
                  'This preview does not send messages or confirm transactions automatically.',
                )}
          </DialogDescription>
          {dialog === 'line' && (
            <>
              <textarea
                className="line-preview"
                aria-label={t('ข้อความสอบถาม', 'Enquiry message')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p>
                {t(
                  'ลูกค้าต้องกดส่งเอง การเพิ่มเพื่อนไม่ส่งข้อมูลสินค้าอัตโนมัติ หากใช้คอมพิวเตอร์ให้คัดลอกข้อความไปวาง',
                  'You must press Send in LINE. Adding the account does not send product details. On desktop, copy and paste the message.',
                )}
              </p>
              <a
                className="btn line-green"
                href={lineMessage(message)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('เปิด LINE พร้อมข้อความ', 'Open LINE with message')}
              </a>
              <button className="btn light" onClick={copyMessage}>
                {t('คัดลอกข้อความ', 'Copy message')}
              </button>
              <a
                href="https://line.me/R/ti/p/%40lcgroup"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('เพิ่มเพื่อน LINE OA', 'Add LINE OA')}
              </a>
            </>
          )}
          {dialog === 'booking' && (
            <form
              className="v3-form"
              onSubmit={(e) => {
                e.preventDefault();
                const p = installationPoints.find((x) => x.id === point)!;
                toLine(
                  t(
                    `สนใจติดตั้งที่ ${p.th}\nวันที่ ${date}\n${p.url}\nกรุณายืนยันเวลาว่าง ค่าใช้จ่าย และเงื่อนไขก่อนจองค่ะ`,
                    `Installation enquiry: ${p.en}\nDate: ${date}\n${p.url}\nPlease confirm availability, charges and conditions before booking.`,
                  ),
                );
              }}
            >
              <label>
                {t('จุดติดตั้ง', 'Location')}
                <Pick
                  value={point}
                  set={setPoint}
                  items={installationPoints.map((p) => p.id)}
                  label={t('จุดติดตั้ง', 'Location')}
                />
              </label>
              <p>
                {t(
                  installationPoints.find((p) => p.id === point)!.th,
                  installationPoints.find((p) => p.id === point)!.en,
                )}
              </p>
              <label>
                {t('วันที่สะดวก', 'Preferred date')}
                <input
                  type="date"
                  required
                  min={new Date().toLocaleDateString('en-CA')}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <button className="btn orange">
                {t('เตรียมข้อความสอบถาม', 'Prepare enquiry')}
              </button>
            </form>
          )}
          {dialog === 'chat' && (
            <form
              className="v3-form"
              onSubmit={(e) => {
                e.preventDefault();
                const size = parseSize(chatText);
                const found = size
                  ? products.filter((p) => p.size === size).slice(0, 3)
                  : [];
                setChatReply(
                  found.length
                    ? found
                        .map(
                          (p) =>
                            `${p.brand} ${modelName(p)} ${p.size} ฿${money(p.price)}`,
                        )
                        .join('\n')
                    : t(
                        'ไม่พบข้อมูลที่ยืนยันได้ กรุณาสอบถามเจ้าหน้าที่ ไม่เดาสเปกรถ',
                        'No verified match. Please contact staff; vehicle specifications are not guessed.',
                      ),
                );
              }}
            >
              <p>
                {t(
                  'แชตสาธิตจากชุดสินค้า ยังไม่เชื่อม AI หรือสต็อกสด',
                  'Product-data demo, not connected to AI or live stock.',
                )}
              </p>
              <input
                aria-label={t('ถามขนาดยาง', 'Ask about a tyre size')}
                placeholder="2055516"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
              />
              <button className="btn orange">{t('ค้นหา', 'Search')}</button>
              <p style={{ whiteSpace: 'pre-line' }}>{chatReply}</p>
              <button
                type="button"
                className="btn light"
                onClick={() => toLine(chatText)}
              >
                {t('คุยกับเจ้าหน้าที่ผ่าน LINE', 'Ask staff on LINE')}
              </button>
            </form>
          )}
          {dialog === 'account' && (
            <a
              className="btn orange"
              href="https://lctyre.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(
                'ไปตะกร้าและบัญชีบนเว็บไซต์เดิม',
                'Open the existing store for cart and account',
              )}{' '}
              ↗
            </a>
          )}
          {dialog === 'admin' && (
            <Tabs
              value={adminTab}
              onValueChange={(v) => {
                setAdminTab(String(v));
                setNotice('');
              }}
              className="admin-tabs"
            >
              <TabsList>
                {[
                  ['brands', 'แบรนด์', 'Brands'],
                  ['products', 'ช่องทางซื้อ', 'Purchase links'],
                  ['slides', 'สไลด์', 'Slides'],
                  ['vehicles', 'รุ่นรถ', 'Vehicles'],
                  ['articles', 'บทความ', 'Articles'],
                ].map(([id, th, en]) => (
                  <TabsTrigger key={id} value={id}>
                    {t(th, en)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="brands">
                <p>
                  {t(
                    'มีโลโก้อ้างอิงครบ 43 แบรนด์ เลือกเปิด–ปิดแบรนด์เด่นได้ และควรยืนยันสิทธิ์การใช้เครื่องหมายการค้าก่อนขึ้นเว็บจริง',
                    'Reference logos are available for all 43 brands. Choose featured brands here and confirm trademark usage rights before production.',
                  )}
                </p>
                <div className="brand-settings">
                  {brands.map((b) => (
                    <label key={b.name}>
                      <Checkbox
                        checked={settings.featuredBrands.includes(b.name)}
                        onCheckedChange={(v) =>
                          setSettings((s) => ({
                            ...s,
                            featuredBrands: v
                              ? [...s.featuredBrands, b.name]
                              : s.featuredBrands.filter((n) => n !== b.name),
                          }))
                        }
                      />
                      <BrandMark brand={b} />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="products">
                <div className="v3-form">
                  <label>
                    {t('เลือกสินค้า', 'Choose product')}
                    <Pick
                      value={editId}
                      set={setEditId}
                      items={products.map((p) => String(p.id))}
                      label={t('รหัสสินค้า', 'Product ID')}
                    />
                  </label>
                  <p>{products.find((p) => String(p.id) === editId)?.name}</p>
                  {(['website', 'line'] as const).map((k) => (
                    <label className="check-line" key={k}>
                      <Checkbox
                        checked={links[k]}
                        onCheckedChange={(v) =>
                          setLinks((l) => ({ ...l, [k]: v === true }))
                        }
                      />
                      {k}
                    </label>
                  ))}
                  {(['shopee', 'lazada', 'tiktok', 'thaimart'] as const).map(
                    (k) => (
                      <label key={k}>
                        {k}
                        <input
                          type="url"
                          placeholder="https://…"
                          value={links[k] || ''}
                          onChange={(e) =>
                            setLinks((l) => ({ ...l, [k]: e.target.value }))
                          }
                        />
                      </label>
                    ),
                  )}
                  <button
                    className="btn orange"
                    onClick={() => {
                      if (
                        (
                          ['shopee', 'lazada', 'tiktok', 'thaimart'] as const
                        ).some((k) => !validChannelUrl(k, links[k] || ''))
                      ) {
                        setNotice(
                          t(
                            'ลิงก์ต้องเป็น HTTPS ของช่องทางนั้น',
                            'Use an HTTPS URL belonging to that channel',
                          ),
                        );
                        return;
                      }
                      setSettings((s) => ({
                        ...s,
                        productLinks: {
                          ...s.productLinks,
                          [editId]: { ...links },
                        },
                      }));
                      setNotice(t('บันทึกแล้ว', 'Saved'));
                    }}
                  >
                    {t('บันทึกช่องทาง', 'Save purchase links')}
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="slides">
                <p>
                  {t(
                    'แก้หัวข้อสองภาษาและอัปโหลดภาพโปรโมชั่นจริง (ไม่เกิน 1 MB ต่อภาพ) บันทึกเฉพาะเครื่องนี้',
                    'Edit both languages and upload real promotional images (max 1 MB each). Saved on this device only.',
                  )}
                </p>
                {slides.map((s, i) => (
                  <fieldset className="v3-slide-editor" key={i}>
                    <legend>
                      {t('สไลด์', 'Slide')} {i + 1}
                    </legend>
                    <label className="check-line">
                      <Checkbox
                        checked={s.enabled}
                        onCheckedChange={(v) =>
                          setSlides((old) =>
                            old.map((x, n) =>
                              n === i ? { ...x, enabled: v === true } : x,
                            ),
                          )
                        }
                      />
                      {t('แสดง', 'Visible')}
                    </label>
                    {(['th', 'en', 'subTh', 'subEn', 'href'] as const).map(
                      (k) => (
                        <label key={k}>
                          {
                            {
                              th: 'หัวข้อ TH',
                              en: 'Title EN',
                              subTh: 'คำอธิบาย TH',
                              subEn: 'Description EN',
                              href: 'CTA URL',
                            }[k]
                          }
                          <input
                            value={s[k]}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (k === 'href' && !safeLink(value)) {
                                setNotice('Use #section or https:// URL');
                                return;
                              }
                              setSlides((old) =>
                                old.map((x, n) =>
                                  n === i ? { ...x, [k]: value } : x,
                                ),
                              );
                            }}
                          />
                        </label>
                      ),
                    )}
                    <label>
                      {t('ภาพโปรโมชั่น', 'Promotion image')}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (
                            file.size > 1000000 ||
                            !['image/png', 'image/jpeg', 'image/webp'].includes(
                              file.type,
                            )
                          ) {
                            setNotice('PNG/JPEG/WebP, max 1 MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            const src = String(reader.result);
                            if (safeImage(src))
                              setSlides((old) =>
                                old.map((x, n) =>
                                  n === i ? { ...x, image: src } : x,
                                ),
                              );
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </fieldset>
                ))}
              </TabsContent>
              <TabsContent value="vehicles">
                <p>
                  {t(
                    'วาง JSON ที่ตรวจสอบแล้ว รองรับหลายรายการต่อรุ่น ขนาดหน้า–หลัง และแบรนด์ OEM จำนวนสูงสุด 10,000 แถว',
                    'Paste verified JSON. Supports multiple fitments per vehicle, different front/rear sizes, and OEM brands, up to 10,000 rows.',
                  )}
                </p>
                <code>
                  {
                    '{"make":"…","model":"…","year":"…","trim":"…","front":"205/55R16","rear":"205/55R16","oemBrands":["MICHELIN"],"source":"…"}'
                  }
                </code>
                <textarea
                  className="v3-json"
                  aria-label="Vehicle fitment JSON"
                  placeholder="[]"
                  value={fitmentText}
                  onChange={(e) => setFitmentText(e.target.value)}
                />
                <button
                  className="btn orange"
                  onClick={() => {
                    try {
                      const next = validateFitments(JSON.parse(fitmentText));
                      setFitments(next);
                      setNotice(
                        t(
                          `นำเข้า ${next.length} รายการแล้ว`,
                          `Imported ${next.length} records`,
                        ),
                      );
                    } catch (e) {
                      setNotice(
                        e instanceof Error ? e.message : 'Invalid JSON',
                      );
                    }
                  }}
                >
                  {t('ตรวจสอบและนำเข้าแทนชุดเดิม', 'Validate and replace dataset')}
                </button>
                <p>
                  {fitments.length}{' '}
                  {t('รายการในเครื่องนี้', 'records on this device')}
                </p>
                <p>
                  {t(
                    `ฐานอ้างอิง OEM แยก ${oemReferenceData.records.length.toLocaleString()} รายการ ไม่เขียนทับฐานข้อมูลรถเดิม`,
                    `Separate OEM reference dataset: ${oemReferenceData.records.length.toLocaleString()} records. The original vehicle dataset is not overwritten.`,
                  )}
                </p>
              </TabsContent>
              <TabsContent value="articles">
                <p>
                  {t(
                    'เครื่องมือบรรณาธิการภาษาไทย ส่งออกต้นฉบับก่อนเผยแพร่ ไม่เชื่อม AI อัตโนมัติ',
                    'Thai editorial workspace. Export drafts for review; no automatic AI connection.',
                  )}
                </p>
                <ArticleStudio products={products} />
              </TabsContent>
              <button className="btn light" onClick={exportData}>
                {t(
                  'ส่งออกการตั้งค่า / สำรองตัวอย่าง',
                  'Export settings / back up preview',
                )}
              </button>
            </Tabs>
          )}
          {notice && <p role="status">{notice}</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
