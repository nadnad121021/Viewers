export type DentalNumberingSystem = 'FDI' | 'Universal';

const FDI_TEETH = [
  '18',
  '17',
  '16',
  '15',
  '14',
  '13',
  '12',
  '11',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '38',
  '37',
  '36',
  '35',
  '34',
  '33',
  '32',
  '31',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
];

const UNIVERSAL_TEETH = Array.from({ length: 32 }, (_, index) => String(index + 1));

export const DENTAL_NUMBERING_SYSTEMS: DentalNumberingSystem[] = ['FDI', 'Universal'];

export function getToothOptions(system: DentalNumberingSystem) {
  return system === 'FDI' ? FDI_TEETH : UNIVERSAL_TEETH;
}

export function getDefaultTooth(system: DentalNumberingSystem) {
  return getToothOptions(system)[0];
}
