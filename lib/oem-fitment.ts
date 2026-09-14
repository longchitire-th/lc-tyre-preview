import type { Fitment } from './fitment';

export type OemReference = {
  kind: 'oem-observation' | 'size-reference';
  make: string;
  model: string;
  trim: string;
  year: string;
  position?: string;
  rawSize: string;
  sizes: string[];
  oemBrand: string;
  oemBrandRaw: string;
  oemBrandRecognized: boolean;
  tyreModel: string;
  matchMake: string;
  matchModel: string;
  event: string;
  sourceSheet: string;
  sourceRow: number;
};

const key = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export function oemLabelsForFitment(
  fitment: Fitment,
  references: OemReference[],
) {
  const sizes = new Set([fitment.front, fitment.rear]);
  const make = key(fitment.make);
  const model = key(fitment.model);
  const labels = references
    .filter(
      (reference) =>
        reference.oemBrandRecognized &&
        key(reference.matchMake) === make &&
        key(reference.matchModel) === model &&
        (!reference.year || reference.year === fitment.year) &&
        reference.sizes.some((size) => sizes.has(size)),
    )
    .map((reference) =>
      [reference.oemBrand, reference.tyreModel].filter(Boolean).join(' '),
    );
  return [...new Set(labels)];
}
