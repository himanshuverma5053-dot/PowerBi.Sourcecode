import { Order } from '../types/index.js';

export const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1786968800000',
    orderNumber: 'MT-2026-8492',
    date: '2026-08-20 14:30',
    customerName: 'SS Roadways Patna',
    customerEmail: 'ssroadways@patna.com',
    phone: '+91 98350 12345',
    companyName: 'SS Roadways Pvt Ltd',
    gstNumber: '10AAACS1429B1Z8',
    items: [
      {
        product: {
          id: 'tyre-endutrax-ma-d',
          name: 'ENDUTRAX MA-D',
          brand: 'Apollo',
          category: 'Truck',
          width: 295,
          aspectRatio: 90,
          rimSize: 20,
          speedRating: 'K',
          loadIndex: 154,
          price: 24324,
          bulkPrice: 24324,
          stock: 46,
          image: '/src/assets/images/apollo_endutrax_ma_exact_1786967778525.jpg',
          terrain: 'All-Terrain',
          warrantyYears: 5,
          fuelEfficiency: 'A',
          wetGrip: 'A',
          noiseDb: 69,
          description: 'Heavy duty commercial steer/all-axle tyre.',
          compatibleVehicles: ['Heavy Duty Truck', 'Commercial Tipper'],
          featured: true,
          evReady: false,
          hsnCode: '40112010',
          sku: 'SKU-APO-29590R20-MA-D',
          tireType: 'Radial'
        },
        quantity: 4
      }
    ],
    subtotal: 97296,
    discount: 0,
    gstAmount: 14841.76,
    totalAmount: 97296,
    paymentMethod: 'NEFT/RTGS',
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    shippingAddress: {
      street: 'NH-30 Transport Nagar, Near Zero Mile',
      city: 'Patna',
      state: 'Bihar',
      pincode: '800007'
    },
    trackingNumber: 'MGT-EXPRESS-983210',
    estimatedDelivery: '2026-08-24',
    timeline: [
      { status: 'Order Placed', time: '14:30', done: true, location: 'Magadh Customer Portal' },
      { status: 'Confirmed', time: '14:32', done: true, location: 'Magadh Billing System' },
      { status: 'Warehouse Processing', time: '15:00', done: true, location: 'Patna Central Warehouse' },
      { status: 'Dispatched', time: 'Pending', done: false },
      { status: 'Out for Delivery', time: 'Pending', done: false },
      { status: 'Delivered', time: 'Pending', done: false }
    ]
  }
];
