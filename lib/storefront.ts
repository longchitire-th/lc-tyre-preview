export type Product = {
  id: number;
  name: string;
  url: string;
  brand: string;
  model: string;
  size: string;
  year: string;
  price: number;
  regularPrice: number;
  stock: boolean;
  image: string;
  runflat: boolean;
};
export type TireBrand = {
  name: string;
  logo: string;
  source: string;
  sourceImage?: string;
};
export type ProductLinks = {
  website: boolean;
  line: boolean;
  shopee: string;
  lazada: string;
  tiktok: string;
  thaimart?: string;
};
export type StoreSettings = {
  featuredBrands: string[];
  productLinks: Record<string, ProductLinks>;
};
export const COMPANY = 'บริษัท หลงฉื่อ กรุ๊ป จำกัด';
export const SHOP = 'หลงฉื่อ ขึ้นชื่อเรื่องยาง';
export const CHANNELS = [
  {
    key: 'shopee',
    label: 'Shopee',
    url: 'https://shopee.co.th/long_chi_tires',
    color: '#e64b25',
  },
  {
    key: 'lazada',
    label: 'Lazada',
    url: 'https://www.lazada.co.th/shop/lctire',
    color: '#4527ab',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    url: 'https://www.tiktok.com/@longcigroup',
    color: '#15171b',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61578481134472&locale=th_TH',
    color: '#1265cf',
  },
  {
    key: 'line',
    label: 'LINE OA',
    url: 'https://line.me/R/ti/p/%40lcgroup',
    color: '#087d39',
  },
  {
    key: 'lineshop',
    label: 'LINE SHOPPING',
    url: 'https://shop.line.me/@lcgroup',
    color: '#087d39',
  },
  {
    key: 'thaimart',
    label: 'Thaimart',
    url: 'https://thaimart.com/sellers/หลงฉื่อ-ขึ้นชื่อเรื่องยาง-zts_Hk',
    color: '#df0b0b',
  },
];
export const SOCIAL_CHANNELS = [
  {
    key: 'facebook',
    label: 'Facebook Page',
    url: 'https://www.facebook.com/profile.php?id=61578481134472&locale=th_TH',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/longcigroup/',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    url: 'https://www.tiktok.com/@longcigroup',
  },
  { key: 'line', label: 'LINE OA', url: 'https://line.me/R/ti/p/%40lcgroup' },
  {
    key: 'youtube',
    label: 'YouTube',
    url: 'https://www.youtube.com/@longcigroup',
  },
  { key: 'threads', label: 'Threads', url: '' },
  { key: 'x', label: 'X (Twitter)', url: 'https://x.com/longcigroup' },
];
export const defaultLinks: ProductLinks = {
  website: true,
  line: true,
  shopee: '',
  lazada: '',
  tiktok: '',
  thaimart: '',
};
export const initialSettings: StoreSettings = {
  featuredBrands: [
    'MICHELIN',
    'BRIDGESTONE',
    'CONTINENTAL',
    'GOODYEAR',
    'YOKOHAMA',
    'KUMHO',
    'MAXXIS',
    'TOYO',
  ],
  productLinks: {},
};
export function normalizeSize(input: string) {
  const digits = input.toUpperCase().replace(/[\s/R-]/g, '');
  return /^\d{7}$/.test(digits)
    ? `${digits.slice(0, 3)}/${digits.slice(3, 5)}R${digits.slice(5)}`
    : null;
}
export const money = (n: number) => new Intl.NumberFormat('th-TH').format(n);
export const modelName = (p: Product) =>
  p.model.replace(/^ยาง .*? BRIDGESTONE /, '').split(' ราค')[0];
export function inquiryText(p: Product, quantity: number) {
  return `สวัสดีค่ะ/ครับ สนใจยาง ${p.brand} ${modelName(p)}\nขนาด ${p.size} ปี ${p.year}\nจำนวน ${quantity} เส้น\nรหัสสินค้า LC-${p.id}\n${p.url}\nรบกวนเช็กราคา สต็อก และบริการติดตั้งให้ด้วยค่ะ/ครับ`;
}
export const lineMessage = (text: string) =>
  `https://line.me/R/oaMessage/%40lcgroup/?${encodeURIComponent(text)}`;
export function validChannelUrl(channel: string, value: string) {
  if (!value.trim()) return true;
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password) return false;
    const hosts: Record<string, string[]> = {
      shopee: ['shopee.co.th', 'shopee.in.th', 'shopee.com'],
      lazada: ['lazada.co.th'],
      tiktok: ['tiktok.com'],
      thaimart: ['thaimart.com'],
    };
    return (hosts[channel] || []).some(
      (h) => u.hostname === h || u.hostname.endsWith('.' + h),
    );
  } catch {
    return false;
  }
}
export const articleSeeds = [
  {
    slug: 'read-tire-size',
    category: 'BUYING GUIDE',
    title: '205/55R16 อ่านอย่างไร ก่อนเลือกยางชุดใหม่',
    description:
      'รู้จักหน้ากว้าง ซีรีส์ และขอบล้อ พร้อมเช็กรุ่นรถและสเปกที่ต้องตรวจเพิ่มเติมก่อนเลือกซื้อ',
    image: '/assets/tire-4518.png',
    productIds: [4519, 3638],
    body: '205/55R16 เป็นรหัสขนาดยาง: 205 คือหน้ากว้างยางในหน่วยมิลลิเมตร 55 คืออัตราส่วนความสูงแก้มยางต่อหน้ากว้างเป็นเปอร์เซ็นต์ R คือโครงสร้างเรเดียล และ 16 คือเส้นผ่านศูนย์กลางขอบล้อในหน่วยนิ้ว\n\nขนาดเท่ากันไม่ได้แปลว่าใส่แทนกันได้ทุกกรณี ต้องตรวจดัชนีรับน้ำหนัก พิกัดความเร็ว และข้อกำหนดของผู้ผลิตรถร่วมด้วย โดยยึดคู่มือรถหรือป้ายแนะนำยางประจำรถ\n\nก่อนซื้อ เตรียมยี่ห้อ รุ่น ปี รุ่นย่อย และภาพขนาดยางเดิมให้เจ้าหน้าที่ตรวจสอบ จากนั้นเปรียบเทียบราคา ปีผลิต และค่าติดตั้งของรายการที่ตรงสเปก',
    source:
      'https://www.michelin.co.th/auto/advice/tyre-basics/tyre-markings-explained',
  },
  {
    slug: 'ev-tire-checklist',
    category: 'EV GUIDE',
    title: 'เลือกยางให้รถ EV เริ่มจากข้อมูลอะไรบ้าง',
    description:
      'เช็กรุ่นย่อย ขนาดยาง ดัชนีรับน้ำหนัก และข้อมูลผู้ผลิต ก่อนเปรียบเทียบยางสำหรับรถไฟฟ้า',
    image: '/assets/tire-3237.png',
    productIds: [],
    body: 'เริ่มต้นจากยี่ห้อรถ รุ่น ปี และรุ่นย่อย แล้วตรวจขนาดยางและข้อกำหนดในคู่มือรถก่อนหาสินค้า ชื่อรุ่นรถเพียงอย่างเดียวอาจไม่เพียงพอในการระบุขนาดยาง\n\nเมื่อตรวจสเปกได้แล้ว ค่อยพิจารณาข้อมูลสมรรถนะที่ผู้ผลิตยางรับรอง เช่น การใช้งานที่รองรับ และดัชนีรับน้ำหนัก หลีกเลี่ยงการสรุปจากคำว่า EV บนชื่อสินค้าเพียงอย่างเดียว\n\nหากข้อมูลยังไม่ครบ ให้เจ้าหน้าที่ช่วยตรวจสอบ ไม่ควรให้ AI เดาขนาดยางหรือแนะนำสเปกทดแทนโดยไม่มีแหล่งข้อมูล',
    source: '',
  },
  {
    slug: 'installation-planning',
    category: 'TIRE SERVICE',
    title: 'ซื้อยางออนไลน์ นัดติดตั้งอย่างไรให้ครบในครั้งเดียว',
    description: 'เตรียมข้อมูลยาง จำนวนเส้น จุดติดตั้ง และค่าบริการก่อนยืนยันนัดกับเจ้าหน้าที่',
    image: '/assets/tire-3251.png',
    productIds: [3588],
    body: 'แจ้งรุ่นยาง ขนาด และจำนวนเส้นที่ต้องการ พร้อมวันและจุดติดตั้งที่สะดวก จากนั้นให้เจ้าหน้าที่ยืนยันราคาและสต็อกก่อนชำระเงิน\n\nสอบถามว่าราคาที่เสนอรวมบริการใดบ้าง เช่น ถอด–ใส่ ถ่วงล้อ และตั้งศูนย์ เพราะเงื่อนไขอาจแตกต่างกันระหว่างสาขากับพาร์ตเนอร์\n\nตัวอย่างตามบรีฟ LC TYRE: สาขาเจริญพัฒนามีบริการถอด–ใส่และถ่วงล้อฟรี ส่วนจุดพาร์ตเนอร์มีค่าบริการที่ต้องยืนยันก่อนจองจริง',
    source: '',
  },
];
