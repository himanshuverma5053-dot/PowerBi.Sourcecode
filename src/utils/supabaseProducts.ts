import { supabase } from '../supabaseClient';
import { TyreProduct } from '../types';

/**
 * Normalizes a row returned from Supabase into a TyreProduct object.
 */
function normalizeProductRow(row: any): TyreProduct {
  let images = row.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [row.image || row.image_url];
    }
  }
  if (!Array.isArray(images) || images.length === 0) {
    images = [row.image || row.image_url || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'];
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
 * Fetch all products from Supabase products table.
 */
export async function fetchProductsFromSupabase(): Promise<TyreProduct[]> {
  try {
    let { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const plainRes = await supabase.from('products').select('*');
      data = plainRes.data;
      error = plainRes.error;
    }

    if (error) {
      console.warn('Supabase fetch products error:', error.message || error);
      return [];
    }

    if (Array.isArray(data)) {
      return data.map(normalizeProductRow);
    }
  } catch (err) {
    console.warn('Error connecting to Supabase products table:', err);
  }
  return [];
}

/**
 * Insert or Update a product in Supabase products table.
 */
export async function saveProductToSupabase(product: TyreProduct): Promise<{ success: boolean; data?: any; error?: any }> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);

  const payload: any = {
    name: product.name,
    brand: product.brand,
    category: product.category,
    sku: product.sku,
    description: product.description,
    price: product.price || product.mrp || 0,
    mrp: product.mrp || product.price || 0,
    dealer_price: product.dealerPrice || product.bulkPrice || 0,
    bulk_price: product.bulkPrice || product.dealerPrice || 0,
    stock: product.stock,
    min_stock_level: product.minStockLevel || 5,
    image: product.image,
    images: product.images || [product.image],
    status: product.status || 'Active',
    width: product.width,
    aspect_ratio: product.aspectRatio,
    rim_size: product.rimSize,
    speed_rating: product.speedRating,
    load_index: product.loadIndex,
    terrain: product.terrain,
    warranty_years: product.warrantyYears,
    fuel_efficiency: product.fuelEfficiency,
    wet_grip: product.wetGrip,
    noise_db: product.noiseDb,
    hsn_code: product.hsnCode,
    product_code: product.productCode,
    pattern: product.pattern,
    gst_rate: product.gstRate,
    compatible_vehicles: product.compatibleVehicles,
    featured: product.featured,
    ev_ready: product.evReady,
    tags: product.tags,
    components: product.components,
    included_components: product.includedComponents || 'Tube & Flap',
    tire_type: product.tireType || product.tire_type || 'Radial',
    updated_at: new Date().toISOString()
  };

  // Only pass id if it's a valid UUID or custom string ID stored in string ID column
  if (product.id && (isUuid || !product.id.startsWith('tyre-'))) {
    payload.id = product.id;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .upsert([payload], { onConflict: 'id' })
      .select('*');

    if (error) {
      console.warn('First upsert product error, retrying without id for insert:', error.message);
      delete payload.id;
      const insertRes = await supabase
        .from('products')
        .insert([payload])
        .select('*');

      if (insertRes.error) {
        console.error('Failed to save product to Supabase:', insertRes.error);
        return { success: false, error: insertRes.error };
      }
      const savedObj = insertRes.data?.[0] ? normalizeProductRow(insertRes.data[0]) : null;
      return { success: true, data: savedObj };
    }

    const savedObj = data?.[0] ? normalizeProductRow(data[0]) : null;
    return { success: true, data: savedObj };
  } catch (err) {
    console.error('Exception saving product to Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete a product from Supabase products table.
 */
export async function deleteProductFromSupabase(productId: string): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product from Supabase:', error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('Exception deleting product from Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Update stock level or status of a product in Supabase.
 */
export async function updateProductFieldInSupabase(
  productId: string,
  updates: Partial<TyreProduct>
): Promise<{ success: boolean; error?: any }> {
  try {
    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.stock !== undefined) payload.stock = updates.stock;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.mrp !== undefined) payload.mrp = updates.mrp;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.dealerPrice !== undefined) payload.dealer_price = updates.dealerPrice;

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId);

    if (error) {
      console.error('Error updating product field in Supabase:', error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('Exception updating product in Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Search products in Supabase database in real-time by keyword matching name, description, category, brand, sku, pattern.
 */
export async function searchProductsInSupabase(queryText: string): Promise<TyreProduct[]> {
  const trimmed = queryText.trim();
  if (!trimmed) return [];

  try {
    const pattern = `%${trimmed}%`;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern},brand.ilike.${pattern},sku.ilike.${pattern},pattern.ilike.${pattern}`)
      .limit(12);

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(normalizeProductRow);
    }
  } catch (err) {
    console.warn('Supabase search exception:', err);
  }
  return [];
}
