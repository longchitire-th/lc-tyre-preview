export type Fitment = {
  make: string;
  model: string;
  year: string;
  trim: string;
  front: string;
  rear: string;
  source: string;
  oemBrands?: string[];
};
export const widths = Array.from({ length: 16 }, (_, i) =>
  String(165 + i * 10),
);
export function parseSize(value: string) {
  const n = value
    .toUpperCase()
    .replace(/ZR/g, 'R')
    .replace(/[\s/R-]/g, '');
  if (!/^\d{7}$/.test(n)) return null;
  const w = Number(n.slice(0, 3)),
    r = Number(n.slice(3, 5)),
    d = Number(n.slice(5));
  if (
    w < 145 ||
    w > 355 ||
    w % 5 !== 0 ||
    r < 20 ||
    r > 85 ||
    r % 5 !== 0 ||
    d < 12 ||
    d > 26
  )
    return null;
  return `${w}/${r}R${d}`;
}
export function validateFitments(input: unknown): Fitment[] {
  if (!Array.isArray(input) || input.length > 10000)
    throw new Error('Expected an array, maximum 10,000 rows');
  return input.map((row, i) => {
    if (!row || typeof row !== 'object')
      throw new Error(`Row ${i + 1}: invalid record`);
    const record = row as Record<string, unknown>,
      result = {} as Fitment;
    for (const k of [
      'make',
      'model',
      'year',
      'trim',
      'front',
      'rear',
      'source',
    ] as const) {
      if (typeof record[k] !== 'string' || !record[k].trim())
        throw new Error(`Row ${i + 1}: ${k} is required`);
      result[k] = record[k].trim();
    }
    const f = parseSize(result.front),
      r = parseSize(result.rear);
    if (!f || !r) throw new Error(`Row ${i + 1}: invalid tyre size`);
    const rawOem = record.oemBrands ?? record.oemBrand ?? record.oem;
    if (rawOem !== undefined && rawOem !== null && rawOem !== '') {
      const values = Array.isArray(rawOem)
        ? rawOem
        : typeof rawOem === 'string'
          ? rawOem.split(/[,;|]/)
          : null;
      if (
        !values ||
        values.some(
          (v) => typeof v !== 'string' || !v.trim() || v.trim().length > 50,
        )
      )
        throw new Error(
          `Row ${i + 1}: oemBrands must be a brand name or an array of brand names`,
        );
      result.oemBrands = [
        ...new Set(values.map((v) => String(v).trim())),
      ].slice(0, 12);
    }
    return { ...result, front: f, rear: r };
  });
}
export const installationPoints = [
  {
    id: 'main',
    th: 'สาขาเจริญพัฒนา (กีบหมู)',
    en: 'Charoen Phatthana (Kip Mu)',
    url: 'https://share.google/QWSfJzMQSqOKv9VPh',
    free: true,
  },
  {
    id: 'partner1',
    th: 'คู้บอน — อุดมชัย เลียบคลองสอง ซ.1',
    en: 'Khu Bon — Udomchai, Liap Khlong Song Soi 1',
    url: 'https://share.google/u78pULYfACYOCEFyi',
    free: false,
  },
  {
    id: 'partner2',
    th: 'ประเวศ — MPK autoservice',
    en: 'Prawet — MPK Autoservice',
    url: 'https://share.google/ABF0LzTnLmTr19Jee',
    free: false,
  },
  {
    id: 'partner3',
    th: 'แอล.เอช.ที.ไทร์',
    en: 'L.H.T. Tyre',
    url: 'https://share.google/iqSEDG1WQjqY0W8mX',
    free: false,
  },
];

export const mainLocation = {
  latitude: 13.837586119344286,
  longitude: 100.7122766048159,
  defaultView: 'roadmap',
  defaultZoom: 18,
  shareUrl: installationPoints[0].url,
  embedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d270.8160059039472!2d100.71219881525697!3d13.8375649236119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d65b26dac9dff%3A0xd40def789f13ef79!2z4Lij4LmJ4Liy4LiZIOC4q-C4peC4h-C4ieC4t-C5iOC4rSDguILguLbguYnguJnguIrguLfguYjguK3guYDguKPguLfguYjguK3guIfguKLguLLguIcg4Liq4Liy4LiC4Liy4LmA4LiI4Lij4Li04LiN4Lie4Lix4LiS4LiZ4LiyICjguIHguLXguJrguKvguKHguLkpIOC4muC4o-C4tOC4qeC4seC4lyDguKvguKXguIfguInguLfguYjguK0g4LiB4Lij4Li44LmK4LibIOC4iOC4s-C4geC4seC4lA!5e1!3m2!1sth!2sth!4v1788884644029!5m2!1sth!2sth&z=18&t=m',
} as const;
