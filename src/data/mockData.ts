import { TyreProduct } from '../types';

export const MOCK_TYRES: TyreProduct[] = [
  {
    id: 'tyre-endutrax-md-plus-d',
    name: 'ENDUTRAX MD+-D 295/90 R20',
    brand: 'Apollo',
    category: 'Truck',
    width: 295,
    aspectRatio: 90,
    rimSize: 20,
    speedRating: 'K',
    loadIndex: 154,
    price: 27686,
    bulkPrice: 27686,
    mrp: 27686,
    dealerPrice: 27686,
    stock: 50,
    minStockLevel: 10,
    gstRate: 18,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'],
    terrain: 'All-Terrain',
    warrantyYears: 5,
    fuelEfficiency: 'A',
    wetGrip: 'A',
    noiseDb: 69,
    description: 'Heavy duty commercial tyre designed for demanding axle loads and severe road conditions. Complete set includes FLAP-D (HSN: 40129049) and TUBE-D (HSN: 40131020).',
    compatibleVehicles: ['Heavy Duty Truck', 'Commercial Tipper', 'Multi-Axle Vehicle'],
    featured: true,
    evReady: false,
    hsnCode: '40112010',
    sku: 'SKU-APO-29590R20-MD+-D',
    productCode: 'PRD-APO-ENDUTRAX-MD-PLUS-D',
    pattern: 'ENDUTRAX MD+-D',
    status: 'Active',
    tags: ['HEAVY DUTY', 'Radial', 'FLAP-D Included', 'TUBE-D Included', 'Commercial'],
    tireType: 'Radial',
    tire_type: 'Radial',
    includedComponents: 'FLAP-D (HSN: 40129049), TUBE-D (HSN: 40131020)',
    components: [
      {
        id: 'comp-flap-d',
        productId: 'flap-d',
        productName: 'FLAP-D (HSN: 40129049)',
        brand: 'Apollo',
        price: 0,
        quantity: 1,
        isMandatory: true,
        defaultSelected: true
      },
      {
        id: 'comp-tube-d',
        productId: 'tube-d',
        productName: 'TUBE-D (HSN: 40131020)',
        brand: 'Apollo',
        price: 0,
        quantity: 1,
        isMandatory: true,
        defaultSelected: true
      }
    ]
  }
];

export const MOCK_ORDERS: any[] = [];
export const MOCK_PAYMENTS: any[] = [];
export const MOCK_COUPONS: any[] = [];
export const MOCK_REVIEWS: any[] = [];
