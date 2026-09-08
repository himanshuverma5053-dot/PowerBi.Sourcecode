import { Request, Response } from 'express';
import { memoryStore } from '../store/memoryStore.js';
import { TyreProduct } from '../types/index.js';

export async function getAllProducts(req: Request, res: Response) {
  const { category, brand, rimSize, search, terrain, evReady, tireType } = req.query;

  let products = memoryStore.getProducts();

  // Query AWS Lambda / API Gateway endpoint server-side if accessible
  try {
    const urls = [
      'https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/Prod/ProductAPI',
      'https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/prod/ProductAPI'
    ];
    let awsRes: any = null;
    for (const u of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const r = await fetch(u, {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (r && r.ok) {
          awsRes = r;
          break;
        }
      } catch {}
    }

    if (awsRes && awsRes.ok) {
      const data: any = await awsRes.json().catch(() => null);
      if (data) {
        const rawList = data.body
          ? (typeof data.body === 'string' ? JSON.parse(data.body).products || JSON.parse(data.body) : data.body.products || data.body)
          : (data.products || data.items || data.data || (Array.isArray(data) ? data : []));
        if (Array.isArray(rawList) && rawList.length > 0) {
          products = rawList.map((item, idx) => ({
            ...item,
            id: item.id || `product-${idx + 1}`
          }));
        }
      }
    }
  } catch {
    // Continue with in-memory store
  }

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (brand && brand !== 'All') {
    products = products.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
  }
  if (rimSize && rimSize !== 'All') {
    products = products.filter(p => p.rimSize === Number(rimSize));
  }
  if (terrain && terrain !== 'All') {
    products = products.filter(p => p.terrain.toLowerCase() === String(terrain).toLowerCase());
  }
  if (evReady === 'true') {
    products = products.filter(p => p.evReady);
  }
  if (tireType && tireType !== 'All') {
    products = products.filter(p => (p.tireType || p.tire_type || 'Radial').toLowerCase() === String(tireType).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.compatibleVehicles.some(v => v.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: products.length,
    data: products
  });
}

export function getProductById(req: Request, res: Response) {
  const { id } = req.params;
  const product = memoryStore.getProductById(id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Tyre product SKU not found' });
  }

  res.json({ success: true, data: product });
}

export function upsertProduct(req: Request, res: Response) {
  const productData: Partial<TyreProduct> = req.body;

  // Validate required Tire Type
  const rawTireType = String(productData.tire_type || productData.tireType || '').trim().toLowerCase();
  const validatedTireType = (rawTireType === 'non-radial' || rawTireType === 'non radial' || rawTireType === 'bias')
    ? 'Non-Radial'
    : 'Radial';

  const productToSave: TyreProduct = {
    id: productData.id || `tyre-${Date.now()}`,
    name: productData.name || 'Magadh Tyre SKU',
    brand: productData.brand || 'Apollo',
    category: productData.category || 'Truck',
    width: Number(productData.width || 295),
    aspectRatio: Number(productData.aspectRatio || 90),
    rimSize: Number(productData.rimSize || 20),
    speedRating: productData.speedRating || 'K',
    loadIndex: Number(productData.loadIndex || 154),
    price: Number(productData.price || 24000),
    bulkPrice: Number(productData.bulkPrice || 24000),
    mrp: Number(productData.mrp || productData.price || 24000),
    dealerPrice: Number(productData.dealerPrice || productData.bulkPrice || 24000),
    stock: Number(productData.stock ?? 20),
    minStockLevel: Number(productData.minStockLevel || 5),
    gstRate: Number(productData.gstRate || 18),
    image: productData.image || '',
    images: productData.images || (productData.image ? [productData.image] : []),
    terrain: productData.terrain || 'All-Terrain',
    warrantyYears: Number(productData.warrantyYears || 5),
    fuelEfficiency: productData.fuelEfficiency || 'A',
    wetGrip: productData.wetGrip || 'A',
    noiseDb: Number(productData.noiseDb || 69),
    description: productData.description || 'Premium commercial heavy-duty tyre.',
    compatibleVehicles: productData.compatibleVehicles || ['Commercial Heavy Vehicle'],
    featured: Boolean(productData.featured),
    evReady: Boolean(productData.evReady),
    hsnCode: productData.hsnCode || '40112010',
    sku: productData.sku || `SKU-APO-${Date.now()}`,
    productCode: productData.productCode || `PRD-APO-${Date.now()}`,
    pattern: productData.pattern || 'Standard Tread',
    status: productData.status || 'Active',
    tags: productData.tags || ['HEAVY DUTY', 'Radial'],
    tireType: validatedTireType,
    tire_type: validatedTireType
  };

  const saved = memoryStore.upsertProduct(productToSave);
  res.json({
    success: true,
    message: productData.id ? 'Product updated successfully' : 'New tyre product created successfully',
    product: saved,
    data: saved
  });
}

export function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = memoryStore.deleteProduct(id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found or already deleted' });
  }

  res.json({ success: true, message: 'Product removed from catalogue successfully' });
}
