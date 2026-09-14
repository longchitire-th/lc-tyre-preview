import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import ts from 'typescript';
async function load(path) {
  const code = ts.transpileModule(
    fs.readFileSync(new URL(path, import.meta.url), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  return import(
    'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
  );
}
const {
  parseSize,
  widths,
  validateFitments,
  installationPoints,
  mainLocation,
} = await load('./lib/fitment.ts');
const { locationShareLinks, websiteLocationUrl } = await load(
  './lib/location-share.ts',
);
const { validChannelUrl, SOCIAL_CHANNELS } = await load('./lib/storefront.ts');
const { oemLabelsForFitment } = await load('./lib/oem-fitment.ts');
const { VEHICLE_BRAND_LOGOS } = await load('./lib/vehicle-brands.ts');
const oemReferenceData = JSON.parse(
  fs.readFileSync(
    new URL('./lib/oem-fitment-reference.json', import.meta.url),
    'utf8',
  ),
);
const storefrontSource = fs.readFileSync(
  new URL('./components/storefront-v3.tsx', import.meta.url),
  'utf8',
);
assert.doesNotMatch(storefrontSource, /\{v\.source\}/);
for (const s of ['2055516', '205/55R16', '205 55 16', '205-55-16'])
  assert.equal(parseSize(s), '205/55R16');
assert.equal(parseSize('165/65R14'), '165/65R14');
assert.equal(parseSize('315/35R20'), '315/35R20');
for (const s of ['9999999', '205/00R16', '2055516junk', ''])
  assert.equal(parseSize(s), null);
assert.equal(widths.length, 16);
assert.equal(widths[0], '165');
assert.equal(widths.at(-1), '315');
const fixture = {
  make: 'TEST ONLY',
  model: 'NOT REAL FITMENT',
  year: '2026',
  trim: 'test',
  front: '2055516',
  rear: '1955515',
  source: 'test fixture, never published',
};
assert.equal(validateFitments([fixture])[0].rear, '195/55R15');
assert.deepEqual(
  validateFitments([{ ...fixture, oemBrands: ['MICHELIN', 'CONTINENTAL'] }])[0]
    .oemBrands,
  ['MICHELIN', 'CONTINENTAL'],
);
assert.deepEqual(
  validateFitments([{ ...fixture, oemBrand: 'MICHELIN' }])[0].oemBrands,
  ['MICHELIN'],
);
assert.equal(validateFitments([fixture])[0].oemBrands, undefined);
assert.equal(oemReferenceData.records.length, 371);
assert.equal(
  oemReferenceData.records.filter((row) => row.kind === 'oem-observation')
    .length,
  104,
);
assert.equal(
  oemReferenceData.records.filter((row) => row.oemBrandRecognized).length,
  101,
);
assert.equal(oemReferenceData.meta.preservesBaseFitmentDataset, true);
assert.equal(
  oemReferenceData.meta.sourceSha256,
  'D7F5AB2A9911D1FC447C1C6684CD52A78FBC71CF96B7F8F5FDC3BDF6D4E24567',
);
const civicOem = oemLabelsForFitment(
  {
    ...fixture,
    make: 'HONDA',
    model: 'CIVIC',
    front: '215/50R17',
    rear: '215/50R17',
  },
  oemReferenceData.records,
);
assert.ok(civicOem.some((label) => label.startsWith('YOKOHAMA')));
const baseFitmentBytes = fs.readFileSync(
  new URL('./lib/vehicle-fitments.json', import.meta.url),
);
const baseFitments = JSON.parse(baseFitmentBytes.toString('utf8'));
const vehicleMakes = [...new Set(baseFitments.map((row) => row.make))].sort();
assert.deepEqual(Object.keys(VEHICLE_BRAND_LOGOS).sort(), vehicleMakes);
for (const [make, item] of Object.entries(VEHICLE_BRAND_LOGOS)) {
  assert.match(item.logo, /^\/assets\/car-brand-[a-z0-9-]+\.(png|webp|jpg)$/);
  assert.match(item.source, /^https:\/\//);
  assert.ok(
    fs.existsSync(new URL(`./public${item.logo}`, import.meta.url)),
    `${make} vehicle logo file`,
  );
}
assert.equal(
  createHash('sha256').update(baseFitmentBytes).digest('hex').toUpperCase(),
  'E90160DB83A2BFC694992F67EC9B15C430D7B4D5024F4CC6B64FE21B53D28334',
);
assert.throws(() => validateFitments([{ ...fixture, source: '' }]));
assert.throws(() => validateFitments([{ ...fixture, rear: 'garbage' }]));
assert.throws(() => validateFitments({}));
for (const c of ['shopee', 'lazada', 'tiktok', 'thaimart'])
  assert.equal(validChannelUrl(c, ''), true);
assert.equal(
  validChannelUrl('thaimart', 'https://thaimart.com/products/test-fixture'),
  true,
);
for (const u of [
  'http://thaimart.com',
  'https://thaimart.com.evil.test',
  'javascript:alert(1)',
  'https://user:pass@thaimart.com',
])
  assert.equal(validChannelUrl('thaimart', u), false);
assert.deepEqual(
  SOCIAL_CHANNELS.map((c) => c.key),
  ['facebook', 'instagram', 'tiktok', 'line', 'youtube', 'threads', 'x'],
);
assert.equal(SOCIAL_CHANNELS.filter((c) => c.url).length, 3);
assert.equal(SOCIAL_CHANNELS.filter((c) => !c.url).length, 4);
for (const c of SOCIAL_CHANNELS)
  assert.ok(
    fs.existsSync(
      new URL(
        `./public/assets/platform-${c.key}.${{ facebook: 'ico', instagram: 'png', tiktok: 'png', line: 'png', youtube: 'ico', threads: 'ico', x: 'png' }[c.key]}`,
        import.meta.url,
      ),
    ),
    `${c.label} logo file`,
  );
const { brands } = JSON.parse(
  fs.readFileSync(new URL('./public/brands.json', import.meta.url), 'utf8'),
);
const canonical = (s) =>
  s
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace('TOYOTIRES', 'TOYO');
const requested =
  'Achilles, Alliance, Apollo, Arisun, Atlas, Austone, BFGoodrich, Blackhawk, Bridgestone, Continental, Dayton, Deestone, Double Coin, Dunlop, Falken, Firestone, Fortune, Giti, GT Radial, Goodyear, Goodride, Hankook, Kapsen, Kumho, Landsail, Leao, Linglong, Maxxis, Michelin, Minerva, Nankang, Nexen, Nitto, Otani, Pirelli, RoadX, Sailun, Toyo Tires, Triangle, Westlake, Yokohama'.split(
    ', ',
  );
assert.equal(new Set(brands.map((b) => canonical(b.name))).size, brands.length);
for (const n of requested)
  assert.ok(
    brands.some((b) => canonical(b.name) === canonical(n)),
    n,
  );
assert.equal(brands.length, 43);
assert.equal(brands.filter((b) => !b.logo).length, 0);
for (const b of brands) {
  assert.match(b.logo, /^\/assets\/brand-[a-z0-9.-]+$/);
  assert.ok(
    fs.existsSync(new URL(`./public${b.logo}`, import.meta.url)),
    `${b.name} logo file`,
  );
  assert.ok(b.sourceImage, `${b.name} source image`);
}
assert.equal(installationPoints.length, 4);
assert.match(
  mainLocation.embedUrl,
  /^https:\/\/www\.google\.com\/maps\/embed\?pb=/,
);
assert.equal(mainLocation.latitude, 13.837586119344286);
assert.equal(mainLocation.longitude, 100.7122766048159);
assert.equal(mainLocation.defaultView, 'roadmap');
assert.equal(mainLocation.defaultZoom, 18);
assert.match(mainLocation.embedUrl, /[?&]z=18&(?:amp;)?t=m$/);
const locationLinks = locationShareLinks(mainLocation.shareUrl, 'LC Tyre map');
assert.match(
  locationLinks.line,
  /^https:\/\/social-plugins\.line\.me\/lineit\/share\?/,
);
assert.match(
  locationLinks.facebook,
  /^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?/,
);
assert.match(locationLinks.x, /^https:\/\/twitter\.com\/intent\/tweet\?/);
const websiteMapUrl = websiteLocationUrl('https://www.lctyre.com', 'line');
assert.equal(
  websiteMapUrl,
  'https://www.lctyre.com/?utm_source=line&utm_medium=share&utm_campaign=branch_location#branches',
);
assert.match(storefrontSource, /navigator\.share/);
const { GET } = await load('./app/api/google-reviews/route.ts');
const previous = process.env.GOOGLE_REVIEWS_ENABLED;
process.env.GOOGLE_REVIEWS_ENABLED = 'false';
const response = await GET(new Request('http://localhost/api/google-reviews'));
assert.equal(response.status, 503);
assert.equal((await response.json()).status, 'not_configured');
if (previous === undefined) delete process.env.GOOGLE_REVIEWS_ENABLED;
else process.env.GOOGLE_REVIEWS_ENABLED = previous;
console.log(
  `PASS: sizes, invalid inputs, fitment import, channel URL safety, 43/43 brand logos with sources, 4 locations, disabled Google API. No paid API requests made.`,
);
