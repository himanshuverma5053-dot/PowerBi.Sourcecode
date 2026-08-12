import { TyreProduct } from '../types';

export const RADIAL_ITEMS = [
  '295/90 R20 ENDUTRAX MD+',
  'ENDURACE LD',
  'ENDURACE MA',
  'ENDUTRAX MA',
  'ENDURACE RA(T)',
  'ENDURACE RA',
  '11.00 R20 ENDUTRAX MD'
];

export const NON_RADIAL_ITEMS = [
  'AMAR GOLD',
  'ABHIMANYU',
  'XR-1X',
  'XT-100 HD'
];

export function isRadialProduct(p: TyreProduct): boolean {
  const rawType = String(p.tireType || p.tire_type || '').trim().toLowerCase();
  if (rawType === 'radial') return true;
  if (rawType === 'non-radial' || rawType === 'non radial' || rawType === 'non_radial' || rawType === 'bias') return false;

  const text = `${p.name} ${p.brand} ${p.category} ${p.pattern} ${p.sku} ${p.description} ${(p.tags || []).join(' ')}`.toUpperCase();
  
  if (p.category && (p.category.toUpperCase().includes('NON RADIAL') || p.category.toUpperCase().includes('NON-RADIAL') || p.category.toUpperCase().includes('BIAS'))) {
    return false;
  }

  for (const item of NON_RADIAL_ITEMS) {
    if (text.includes(item.toUpperCase())) return false;
  }

  if (text.includes('NON RADIAL') || text.includes('NON-RADIAL') || text.includes('BIAS') || text.includes('CROSS-PLY') || text.includes('NYLON CARCASS')) {
    return false;
  }

  if (p.category && p.category.toUpperCase().includes('RADIAL') && !p.category.toUpperCase().includes('NON')) {
    return true;
  }

  // Check explicit items requested
  for (const item of RADIAL_ITEMS) {
    if (text.includes(item.toUpperCase())) return true;
  }

  // Check generic radial keywords
  if (text.includes('ENDUTRAX') || text.includes('ENDURACE') || text.includes('RADIAL') || text.includes('R20') || text.includes('R22.5')) {
    return true;
  }

  return true;
}

export function isNonRadialProduct(p: TyreProduct): boolean {
  const rawType = String(p.tireType || p.tire_type || '').trim().toLowerCase();
  if (rawType === 'non-radial' || rawType === 'non radial' || rawType === 'non_radial' || rawType === 'bias') return true;
  if (rawType === 'radial') return false;

  const text = `${p.name} ${p.brand} ${p.category} ${p.pattern} ${p.sku} ${p.description} ${(p.tags || []).join(' ')}`.toUpperCase();

  if (p.category && (p.category.toUpperCase().includes('NON RADIAL') || p.category.toUpperCase().includes('NON-RADIAL') || p.category.toUpperCase().includes('BIAS'))) {
    return true;
  }

  // Check explicit items requested
  for (const item of NON_RADIAL_ITEMS) {
    if (text.includes(item.toUpperCase())) return true;
  }

  // Check generic non-radial keywords
  if (text.includes('NON RADIAL') || text.includes('NON-RADIAL') || text.includes('BIAS') || text.includes('CROSS-PLY') || text.includes('NYLON CARCASS') || text.includes('AMAR GOLD') || text.includes('ABHIMANYU') || text.includes('XR-1X') || text.includes('XT-100 HD')) {
    return true;
  }

  return false;
}
