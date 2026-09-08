import { TyreProduct } from '../types';
import { MOCK_TYRES } from '../data/mockData';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';

/**
 * Normalizes a product record into a TyreProduct object without adding customizations.
 * Preserves the exact data and images fetched from the backend.
 */
export function normalizeProductRow(row: any): TyreProduct {
  if (!row || typeof row !== 'object') {
    return {
      id: 'product-unknown',
      name: 'Unknown Product',
      price: 0,
      image: '',
      description: '',
    };
  }

  const validId = (row.id !== null && row.id !== undefined && String(row.id) !== 'null' && String(row.id).trim() !== '')
    ? String(row.id)
    : (row.name ? `product-${String(row.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'product-1');

  const imageUrl = (typeof row.image_url === 'string' && row.image_url.trim() !== '' && row.image_url !== 'null')
    ? row.image_url
    : (typeof row.image === 'string' && row.image.trim() !== '' && row.image !== 'null')
    ? row.image
    : '';

  let imagesList: string[] = [];
  if (Array.isArray(row.images)) {
    imagesList = row.images.filter((img: any) => typeof img === 'string' && img.trim() !== '' && img !== 'null');
  } else if (imageUrl) {
    imagesList = [imageUrl];
  }

  const priceVal = Number(row.price ?? row.mrp ?? 0);

  return {
    ...row,
    id: validId,
    name: row.name || 'Product',
    description: row.description || '',
    price: priceVal,
    mrp: row.mrp !== undefined ? Number(row.mrp) : priceVal,
    dealerPrice: row.dealerPrice !== undefined ? Number(row.dealerPrice) : (row.dealer_price !== undefined ? Number(row.dealer_price) : undefined),
    bulkPrice: row.bulkPrice !== undefined ? Number(row.bulkPrice) : (row.bulk_price !== undefined ? Number(row.bulk_price) : undefined),
    image: imageUrl,
    image_url: imageUrl || null,
    images: imagesList,
    brand: row.brand || undefined,
    category: row.category || undefined,
    stock: row.stock !== undefined && row.stock !== null ? Number(row.stock) : undefined,
    width: row.width !== undefined ? Number(row.width) : undefined,
    aspectRatio: (row.aspectRatio ?? row.aspect_ratio) !== undefined ? Number(row.aspectRatio ?? row.aspect_ratio) : undefined,
    rimSize: (row.rimSize ?? row.rim_size) !== undefined ? Number(row.rimSize ?? row.rim_size) : undefined,
    speedRating: row.speedRating || row.speed_rating || undefined,
    loadIndex: (row.loadIndex ?? row.load_index) !== undefined ? Number(row.loadIndex ?? row.load_index) : undefined,
    warrantyYears: (row.warrantyYears ?? row.warranty_years) !== undefined ? Number(row.warrantyYears ?? row.warranty_years) : undefined,
    fuelEfficiency: row.fuelEfficiency || row.fuel_efficiency || undefined,
    wetGrip: row.wetGrip || row.wet_grip || undefined,
    noiseDb: (row.noiseDb ?? row.noise_db) !== undefined ? Number(row.noiseDb ?? row.noise_db) : undefined,
    hsnCode: row.hsnCode || row.hsn_code || undefined,
    sku: row.sku || undefined,
    productCode: row.productCode || row.product_code || undefined,
    pattern: row.pattern || undefined,
    status: row.status || undefined,
    tags: Array.isArray(row.tags) ? row.tags : undefined,
    tireType: row.tireType || row.tire_type || undefined,
    tire_type: row.tire_type || row.tireType || undefined,
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
