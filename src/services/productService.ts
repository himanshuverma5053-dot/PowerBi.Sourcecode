import { TyreProduct } from '../types';
import { MOCK_TYRES } from '../data/mockData';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';

/**
 * Normalizes a product record into a strongly-typed TyreProduct object.
 */
export function normalizeProductRow(row: any): TyreProduct {
  let images = row.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [row.image || row.image_url];
    }
  }
  if (Array.isArray(images)) {
    images = images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
  }
  if (!Array.isArray(images) || images.length === 0) {
    const fallback = (typeof row.image === 'string' && row.image.trim() !== '') 
      ? row.image 
      : (typeof row.image_url === 'string' && row.image_url.trim() !== '') 
      ? row.image_url 
      : 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800';
    images = [fallback];
  }

  let compatibleVehicles = row.compatible_vehicles || row.compatibleVehicles;
  if (typeof compatibleVehicles === 'string') {
    try {
      compatibleVehicles = JSON.parse(compatibleVehicles);
    } catch (e) {
      compatibleVehicles = ['Passenger Vehicle'];
    }
  }

  let tags = row.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch (e) {
      tags = ['Tubeless'];
    }
  }

  let components = row.components;
  if (typeof components === 'string') {
    try {
      components = JSON.parse(components);
    } catch (e) {
      components = [];
    }
  }

  const mrpVal = Number(row.mrp ?? row.price ?? 4500);
  const dealerVal = Number(row.dealer_price ?? row.dealerPrice ?? row.bulk_price ?? row.bulkPrice ?? 4100);

  return {
    id: String(row.id),
    name: row.name || row.title || 'Magadh Tyre SKU',
    brand: row.brand || 'Apollo',
    category: row.category || 'Car',
    width: Number(row.width ?? 195),
    aspectRatio: Number(row.aspect_ratio ?? row.aspectRatio ?? 55),
    rimSize: Number(row.rim_size ?? row.rimSize ?? 16),
    speedRating: row.speed_rating || row.speedRating || 'V',
    loadIndex: Number(row.load_index ?? row.loadIndex ?? 91),
    price: mrpVal,
    bulkPrice: dealerVal,
    mrp: mrpVal,
    dealerPrice: dealerVal,
    stock: Number(row.stock ?? 20),
    minStockLevel: Number(row.min_stock_level ?? row.minStockLevel ?? 5),
    gstRate: Number(row.gst_rate ?? row.gstRate ?? 18),
    image: row.image || row.image_url || images[0],
    images: images,
    terrain: row.terrain || 'Highway',
    warrantyYears: Number(row.warranty_years ?? row.warrantyYears ?? 5),
    fuelEfficiency: row.fuel_efficiency || row.fuelEfficiency || 'B',
    wetGrip: row.wet_grip || row.wetGrip || 'A',
    noiseDb: Number(row.noise_db ?? row.noiseDb ?? 68),
    description: row.description || 'Premium tyre built for high mileage, durability and wet grip on Indian roads.',
    compatibleVehicles: Array.isArray(compatibleVehicles) ? compatibleVehicles : ['Passenger Vehicle'],
    featured: Boolean(row.featured),
    evReady: Boolean(row.ev_ready ?? row.evReady),
    hsnCode: row.hsn_code || row.hsnCode || '40111010',
    sku: row.sku || `SKU-${(row.brand || 'TYRE').substring(0, 3).toUpperCase()}-${row.width || 195}${row.aspect_ratio || row.aspectRatio || 65}R${row.rim_size || row.rimSize || 15}`,
    productCode: row.product_code || row.productCode || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
    pattern: row.pattern || 'Standard Tread',
    status: row.status || 'Active',
    tags: Array.isArray(tags) ? tags : ['Tubeless'],
    components: Array.isArray(components) ? components : [],
    includedComponents: row.included_components || row.includedComponents || 'Tube & Flap',
    tireType: (() => {
      const raw = row.tire_type ?? row.tireType;
      if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
        const cleaned = String(raw).trim().toLowerCase();
        if (cleaned === 'non-radial' || cleaned === 'non radial' || cleaned === 'non_radial' || cleaned === 'bias') return 'Non-Radial';
        if (cleaned === 'radial') return 'Radial';
      }
      const text = `${row.name || ''} ${row.brand || ''} ${row.category || ''} ${row.pattern || ''} ${row.description || ''}`.toUpperCase();
      if (text.includes('NON RADIAL') || text.includes('NON-RADIAL') || text.includes('BIAS') || text.includes('CROSS-PLY') || text.includes('AMAR GOLD') || text.includes('ABHIMANYU') || text.includes('XR-1X') || text.includes('XT-100 HD')) {
        return 'Non-Radial';
      }
      return 'Radial';
    })(),
    tire_type: (() => {
      const raw = row.tire_type ?? row.tireType;
      if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
        const cleaned = String(raw).trim().toLowerCase();
        if (cleaned === 'non-radial' || cleaned === 'non radial' || cleaned === 'non_radial' || cleaned === 'bias') return 'Non-Radial';
        if (cleaned === 'radial') return 'Radial';
      }
      const text = `${row.name || ''} ${row.brand || ''} ${row.category || ''} ${row.pattern || ''} ${row.description || ''}`.toUpperCase();
      if (text.includes('NON RADIAL') || text.includes('NON-RADIAL') || text.includes('BIAS') || text.includes('CROSS-PLY') || text.includes('AMAR GOLD') || text.includes('ABHIMANYU') || text.includes('XR-1X') || text.includes('XT-100 HD')) {
        return 'Non-Radial';
      }
      return 'Radial';
    })(),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

/**
 * Fetch all products from Backend REST API (with local cache fallback)
 */
export async function fetchProductsFromBackend(): Promise<TyreProduct[]> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const normalized = json.data.map(normalizeProductRow);
        safeSetLocalStorage('magadh_products_db', normalized);
        return normalized;
      }
    }
  } catch (apiErr) {
    console.warn('Backend API product fetch notice, checking local cache:', apiErr);
  }

  try {
    const cached = safeGetLocalStorage<TyreProduct[]>('magadh_products_db', []);
    if (cached && cached.length > 0) {
      return cached.map(normalizeProductRow);
    }
  } catch (err) {
    console.warn('Cache lookup notice:', err);
  }
  return MOCK_TYRES;
}

/**
 * Insert or Update a product via Backend API
 */
export async function saveProductToBackend(product: TyreProduct): Promise<{ success: boolean; data?: TyreProduct; error?: any }> {
  try {
    const normalized = normalizeProductRow(product);

    // Call backend API
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify(normalized)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.product) {
          const saved = normalizeProductRow(json.product);
          // Sync local storage
          const existing = safeGetLocalStorage<TyreProduct[]>('magadh_products_db', []);
          const idx = existing.findIndex(p => p.id === saved.id || p.sku === saved.sku);
          if (idx !== -1) existing[idx] = saved;
          else existing.unshift(saved);
          safeSetLocalStorage('magadh_products_db', existing);
          return { success: true, data: saved };
        }
      }
    } catch (apiErr) {
      console.warn('API save fallback to local:', apiErr);
    }

    const existing = safeGetLocalStorage<TyreProduct[]>('magadh_products_db', []);
    const idx = existing.findIndex(p => p.id === product.id || p.sku === product.sku);
    
    let updatedList: TyreProduct[];
    if (idx !== -1) {
      updatedList = [...existing];
      updatedList[idx] = normalized;
    } else {
      updatedList = [normalized, ...existing];
    }
    
    safeSetLocalStorage('magadh_products_db', updatedList);
    return { success: true, data: normalized };
  } catch (err) {
    console.error('Exception saving product to backend:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete a product via Backend API
 */
export async function deleteProductFromBackend(productId: string): Promise<{ success: boolean; error?: any }> {
  if (!productId) return { success: true };
  try {
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'admin' }
      });
    } catch (apiErr) {
      console.warn('API delete fallback to local:', apiErr);
    }

    const existing = safeGetLocalStorage<TyreProduct[]>('magadh_products_db', []);
    const filtered = existing.filter(p => p.id !== productId && p.sku !== productId);
    safeSetLocalStorage('magadh_products_db', filtered);
    return { success: true };
  } catch (err) {
    console.warn('Exception deleting product from backend:', err);
    return { success: false, error: err };
  }
}

/**
 * Update stock level or status of a product (AWS Amplify GraphQL Mutation placeholder)
 */
export async function updateProductFieldInBackend(
  productId: string,
  updates: Partial<TyreProduct>
): Promise<{ success: boolean; error?: any }> {
  if (!productId) return { success: true };
  try {
    const existing = safeGetLocalStorage<TyreProduct[]>('magadh_products_db', []);
    const idx = existing.findIndex(p => p.id === productId || p.sku === productId);
    if (idx !== -1) {
      existing[idx] = {
        ...existing[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      safeSetLocalStorage('magadh_products_db', existing);
    }
    return { success: true };
  } catch (err) {
    console.warn('Exception updating product in backend:', err);
    return { success: false, error: err };
  }
}

/**
 * Search products in real-time (AWS Amplify OpenSearch / GraphQL search placeholder)
 */
export async function searchProductsInBackend(queryText: string, productPool?: TyreProduct[]): Promise<TyreProduct[]> {
  const trimmed = queryText.trim();
  if (!trimmed) return [];

  const pool = productPool && productPool.length > 0 
    ? productPool 
    : safeGetLocalStorage<TyreProduct[]>('magadh_products_db', MOCK_TYRES);

  const queryLower = trimmed.toLowerCase();
  const tokens = queryLower.split(/\s+/).filter(Boolean);

  return pool.filter(p => {
    const nameLower = (p.name || '').toLowerCase();
    const brandLower = (p.brand || '').toLowerCase();
    const categoryLower = (p.category || '').toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    const skuLower = (p.sku || '').toLowerCase();
    const patternLower = (p.pattern || '').toLowerCase();
    const tireTypeLower = (p.tireType || p.tire_type || '').toLowerCase();
    const sizeString = `${p.width}/${p.aspectRatio} R${p.rimSize}`.toLowerCase();
    const cleanSizeString = sizeString.replace(/[\/\-\s\.\*]/g, '');
    const cleanName = nameLower.replace(/[\/\-\s\.\*\+\(\)]/g, '');

    const fullSearchableText = `${nameLower} ${brandLower} ${categoryLower} ${descLower} ${skuLower} ${patternLower} ${tireTypeLower} ${sizeString} ${cleanSizeString}`;

    return tokens.every(token => {
      const cleanToken = token.replace(/[\/\-\s\.\*\+\(\)]/g, '');
      if (fullSearchableText.includes(token)) return true;
      if (cleanToken.length > 1 && (cleanSizeString.includes(cleanToken) || cleanName.includes(cleanToken))) return true;
      if (token === String(p.width) || token === String(p.rimSize) || token === `r${p.rimSize}`) return true;
      return false;
    });
  }).slice(0, 12);
}
