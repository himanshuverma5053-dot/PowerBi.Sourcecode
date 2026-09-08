import { TyreProduct } from '../types';
import { MOCK_TYRES } from '../data/mockData';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';
import apolloEndutraxMdImg from '../assets/images/endutrax_md_plus_d_1786864260538.jpg';

/**
 * Normalizes a product record into a strongly-typed TyreProduct object.
 */
export function normalizeProductRow(row: any): TyreProduct {
  const isEndutrax = /endu|295\/90|md\+/i.test(String(row.name || ''));
  const defaultTyreImg = isEndutrax
    ? apolloEndutraxMdImg
    : 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800';

  let images = row.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [row.image || row.image_url];
    }
  }
  if (Array.isArray(images)) {
    images = images.filter((img: any) => typeof img === 'string' && img.trim() !== '' && img !== 'null');
  }

  const validImageUrl = (typeof row.image_url === 'string' && row.image_url.trim() !== '' && row.image_url !== 'null') ? row.image_url : null;
  const validImage = (typeof row.image === 'string' && row.image.trim() !== '' && row.image !== 'null') ? row.image : null;
  const chosenImg = validImageUrl || validImage || (images && images.length > 0 ? images[0] : defaultTyreImg);
  images = [chosenImg];

  // Parse width, aspect ratio, rim size from name if available (e.g. 295/90 R20)
  let parsedWidth = 295;
  let parsedAspectRatio = 90;
  let parsedRimSize = 20;
  const sizeMatch = String(row.name || '').match(/(\d{2,3})\s*[\/\-]\s*(\d{2,3})\s*R?\s*(\d{2})/i);
  if (sizeMatch) {
    parsedWidth = Number(sizeMatch[1]);
    parsedAspectRatio = Number(sizeMatch[2]);
    parsedRimSize = Number(sizeMatch[3]);
  } else {
    parsedWidth = 195;
    parsedAspectRatio = 55;
    parsedRimSize = 16;
  }

  const isCommercial = /truck|commercial|endu|tipper|trailer|haul|multi-axle|295\/90/i.test(
    `${row.name || ''} ${row.description || ''} ${row.category || ''}`
  );
  const categoryVal = row.category || (isCommercial ? 'Truck' : 'Car');
  const brandVal = row.brand || (String(row.name || '').toLowerCase().includes('endu') ? 'Apollo' : 'Apollo');

  let compatibleVehicles = row.compatible_vehicles || row.compatibleVehicles;
  if (typeof compatibleVehicles === 'string') {
    try {
      compatibleVehicles = JSON.parse(compatibleVehicles);
    } catch (e) {
      compatibleVehicles = isCommercial ? ['Commercial Truck', 'Multi-Axle Tipper', 'Heavy Haulage'] : ['Passenger Vehicle'];
    }
  }

  let tags = row.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch (e) {
      tags = isCommercial ? ['Commercial Radial', 'High Load'] : ['Tubeless'];
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

  const mrpVal = Number(row.mrp ?? row.price ?? (isCommercial ? 25500 : 4500));
  const dealerVal = Number(row.dealer_price ?? row.dealerPrice ?? row.bulk_price ?? row.bulkPrice ?? Math.round(mrpVal * 0.95));

  const validId = (row.id !== null && row.id !== undefined && String(row.id) !== 'null' && String(row.id).trim() !== '')
    ? String(row.id)
    : `dynamo-${(row.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return {
    id: validId,
    name: row.name || row.title || 'Apollo Tyre SKU',
    brand: brandVal,
    category: categoryVal,
    width: Number(row.width ?? parsedWidth),
    aspectRatio: Number(row.aspect_ratio ?? row.aspectRatio ?? parsedAspectRatio),
    rimSize: Number(row.rim_size ?? row.rimSize ?? parsedRimSize),
    speedRating: row.speed_rating || row.speedRating || (isCommercial ? 'K' : 'V'),
    loadIndex: Number(row.load_index ?? row.loadIndex ?? (isCommercial ? 154 : 91)),
    price: mrpVal,
    bulkPrice: dealerVal,
    mrp: mrpVal,
    dealerPrice: dealerVal,
    stock: Number(row.stock ?? 25),
    minStockLevel: Number(row.min_stock_level ?? row.minStockLevel ?? 5),
    gstRate: Number(row.gst_rate ?? row.gstRate ?? 18),
    image: chosenImg,
    image_url: chosenImg,
    images: images,
    terrain: row.terrain || (isCommercial ? 'All-Terrain' : 'Highway'),
    warrantyYears: Number(row.warranty_years ?? row.warrantyYears ?? 5),
    fuelEfficiency: row.fuel_efficiency || row.fuelEfficiency || 'B',
    wetGrip: row.wet_grip || row.wetGrip || 'A',
    noiseDb: Number(row.noise_db ?? row.noiseDb ?? 68),
    description: row.description || 'Premium tyre built for high mileage, durability and wet grip on Indian roads.',
    compatibleVehicles: Array.isArray(compatibleVehicles) ? compatibleVehicles : (isCommercial ? ['Commercial Truck', 'Multi-Axle Tipper', 'Heavy Haulage'] : ['Passenger Vehicle']),
    featured: Boolean(row.featured ?? isCommercial),
    evReady: Boolean(row.ev_ready ?? row.evReady),
    hsnCode: row.hsn_code || row.hsnCode || '40111010',
    sku: row.sku || `SKU-${brandVal.substring(0, 3).toUpperCase()}-${parsedWidth}${parsedAspectRatio}R${parsedRimSize}`,
    productCode: row.product_code || row.productCode || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
    pattern: row.pattern || (isEndutrax ? 'ENDUTRAX MD+' : 'Standard Tread'),
    status: row.status || 'Active',
    tags: Array.isArray(tags) ? tags : ['Radial'],
    components: Array.isArray(components) ? components : [],
    includedComponents: row.included_components || row.includedComponents || 'Tube & Flap',
    tireType: (() => {
      const raw = row.tire_type ?? row.tireType;
      if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
        const cleaned = String(raw).trim().toLowerCase();
        if (cleaned === 'non-radial' || cleaned === 'non radial' || cleaned === 'non_radial' || cleaned === 'bias') return 'Non-Radial';
        if (cleaned === 'radial') return 'Radial';
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
      return 'Radial';
    })(),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

/**
 * AWS API Gateway Invoke URL to fetch products directly from DynamoDB and S3 bucket via Lambda
 */
export const AWS_PRODUCT_INVOKE_URL = 'https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/Prod/ProductAPI';

// Fetch products from Lambda function via API Gateway
export async function fetchProducts(): Promise<TyreProduct[]> {
  const invokeUrl = 'https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/Prod/ProductAPI'; // Your invoke URL
  const stageUrl = 'https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/prod/ProductAPI'; // Deployed AWS API Gateway stage

  try {
    let response: Response | null = null;

    // Try primary invokeUrl
    try {
      response = await fetch(invokeUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch {
      response = null;
    }

    // If primary invokeUrl returns non-ok (e.g. AWS API Gateway stage case mismatch), try stageUrl
    if (!response || !response.ok) {
      response = await fetch(stageUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();

    // If Lambda returns API Gateway proxy format (body is a JSON string)
    const rawProducts = data.body
      ? (typeof data.body === 'string' ? JSON.parse(data.body).products : data.body.products)
      : data.products;

    if (Array.isArray(rawProducts) && rawProducts.length > 0) {
      const products = rawProducts.map(normalizeProductRow);
      safeSetLocalStorage('magadh_products_db', products);
      safeSetLocalStorage('magadh_products', products);
      return products;
    }
  } catch (error) {
    console.error('Error:', error);
    const container = document.getElementById('products-container');
    if (container && (!container.children || container.children.length === 0)) {
      container.innerHTML = '<p>Error loading products</p>';
    }
  }

  // Fallback to local catalog or mock data
  try {
    const cached = safeGetLocalStorage<TyreProduct[]>('magadh_products', [])
      || safeGetLocalStorage<TyreProduct[]>('magadh_products_db', []);
    if (cached && cached.length > 0) {
      return cached.map(normalizeProductRow);
    }
  } catch {
    // Continue with mock tyres
  }

  return MOCK_TYRES;
}

// Alias to maintain compatibility with existing callers
export const fetchProductsFromBackend = fetchProducts;

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
