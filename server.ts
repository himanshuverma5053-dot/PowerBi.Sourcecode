import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MOCK_TYRES, MOCK_ORDERS, MOCK_PAYMENTS, MOCK_COUPONS } from "./src/data/mockData.js";

// In-memory data store initialized with mock datasets
let productsStore = [...MOCK_TYRES];
let ordersStore = [...MOCK_ORDERS];
let paymentsStore = [...MOCK_PAYMENTS];
let couponsStore = [...MOCK_COUPONS];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client lazily
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API ROUTES
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "MAGADH TYRES Platform", time: new Date().toISOString() });
  });

  // Get Products catalogue
  app.get("/api/products", (req, res) => {
    let result = [...productsStore];
    const { category, brand, rimSize, search, terrain, evReady } = req.query;

    if (category && category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
    }
    if (brand && brand !== 'All') {
      result = result.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
    }
    if (rimSize && rimSize !== 'All') {
      result = result.filter(p => p.rimSize === Number(rimSize));
    }
    if (terrain && terrain !== 'All') {
      result = result.filter(p => p.terrain.toLowerCase() === String(terrain).toLowerCase());
    }
    if (evReady === 'true') {
      result = result.filter(p => p.evReady);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.compatibleVehicles.some(v => v.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: result.length, data: result });
  });

  // Get single product
  app.get("/api/products/:id", (req, res) => {
    const product = productsStore.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Tyre product not found" });
    }
    res.json({ success: true, data: product });
  });

  // Create new order (Customer portal only)
  app.post("/api/orders", (req, res) => {
    try {
      // Restrict admin console from triggering order creation
      if (
        req.headers['x-admin-console'] === 'true' ||
        req.headers['x-user-role'] === 'admin' ||
        req.body?.fromAdmin === true ||
        req.body?.isAdmin === true
      ) {
        return res.status(403).json({
          success: false,
          message: "Order creation is disabled in the Admin Console. Orders must be placed via the customer portal."
        });
      }

      const {
        customerName, customerEmail, phone, companyName, gstNumber,
        items, couponCode, paymentMethod, shippingAddress
      } = req.body;

      if (!customerName || !phone || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: "Missing required order details" });
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = items.map((item: { productId: string; quantity: number }) => {
        const prod = productsStore.find(p => p.id === item.productId);
        if (!prod) throw new Error(`Product ${item.productId} not found`);
        const itemPrice = item.quantity >= 4 ? prod.bulkPrice : prod.price;
        subtotal += itemPrice * item.quantity;
        
        // Update stock
        prod.stock = Math.max(0, prod.stock - item.quantity);
        return { product: prod, quantity: item.quantity };
      });

      let discount = 0;
      if (couponCode) {
        const coupon = couponsStore.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
        if (coupon && subtotal >= coupon.minOrderValue) {
          discount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
        }
      }

      const discountedSubtotal = subtotal - discount;
      const totalAmount = Math.round(discountedSubtotal * 100) / 100;
      const gstAmount = Math.round((totalAmount - (totalAmount / 1.18)) * 100) / 100; // 18% GST included

      const orderNumber = `MT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const trackingNumber = `MGT-EXPRESS-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        customerName,
        customerEmail: customerEmail || 'customer@magadhtyres.com',
        phone,
        companyName,
        gstNumber,
        items: orderItems,
        subtotal,
        discount,
        gstAmount,
        totalAmount,
        paymentMethod: paymentMethod || 'UPI',
        paymentStatus: 'Paid' as const,
        orderStatus: 'Confirmed' as const,
        shippingAddress: shippingAddress || {
          street: 'Main Road',
          city: 'Patna',
          state: 'Bihar',
          pincode: '800001'
        },
        trackingNumber,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
        timeline: [
          { status: 'Order Placed' as const, time: 'Just Now', done: true, location: 'Magadh Web Portal' },
          { status: 'Confirmed' as const, time: 'Just Now', done: true, location: 'Magadh Payment Gateway' },
          { status: 'Warehouse Processing' as const, time: 'Pending', done: false, location: 'Patna Central Hub' },
          { status: 'Dispatched' as const, time: 'Pending', done: false },
          { status: 'Out for Delivery' as const, time: 'Pending', done: false },
          { status: 'Delivered' as const, time: 'Pending', done: false }
        ]
      };

      ordersStore.unshift(newOrder);

      // Record payment
      paymentsStore.unshift({
        id: `pay-${Date.now()}`,
        paymentId: `PAY-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        orderId: orderNumber,
        customerName,
        amount: totalAmount,
        gstNumber,
        method: paymentMethod,
        status: 'Success',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });

      res.json({ success: true, message: "Order created successfully", order: newOrder });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to place order" });
    }
  });

  // Get orders list
  app.get("/api/orders", (_req, res) => {
    res.json({ success: true, count: ordersStore.length, data: ordersStore });
  });

  // Track order by Order Number or Phone
  app.get("/api/orders/track/:query", (req, res) => {
    const q = req.params.query.trim().toLowerCase();
    const matches = ordersStore.filter(o =>
      o.orderNumber.toLowerCase() === q ||
      o.phone.replaceAll(' ', '').includes(q.replaceAll(' ', '')) ||
      o.trackingNumber.toLowerCase() === q
    );

    if (matches.length === 0) {
      return res.status(404).json({ success: false, message: "No matching order found" });
    }

    res.json({ success: true, data: matches });
  });

  // Quick Payments processing (Customer portal only)
  app.post("/api/payments/process", (req, res) => {
    // Restrict admin console from triggering payment processing
    if (
      req.headers['x-admin-console'] === 'true' ||
      req.headers['x-user-role'] === 'admin' ||
      req.body?.fromAdmin === true ||
      req.body?.isAdmin === true
    ) {
      return res.status(403).json({
        success: false,
        message: "Payment processing is disabled in the Admin Console. Payments must be processed via the customer portal."
      });
    }

    const { orderId, amount, paymentMethod, customerName, gstNumber } = req.body;

    const paymentRecord = {
      id: `pay-${Date.now()}`,
      paymentId: `PAY-${(paymentMethod || 'UPI').toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      orderId: orderId || `MT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || 'Customer',
      amount: Number(amount) || 5000,
      gstNumber,
      method: paymentMethod || 'UPI',
      status: 'Success' as const,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    paymentsStore.unshift(paymentRecord);
    res.json({ success: true, message: "Payment processed successfully", receipt: paymentRecord });
  });

  // Get payment records list
  app.get("/api/payments", (_req, res) => {
    res.json({ success: true, count: paymentsStore.length, data: paymentsStore });
  });

  // Gemini AI Tyre Advisor Endpoint
  app.post("/api/ai/tyre-advisor", async (req, res) => {
    try {
      const { vehicleModel, monthlyKm, roadCondition, budget, drivingStyle } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback intelligent response if key is missing or env not set
        const recommended = productsStore.slice(0, 3);
        return res.json({
          success: true,
          recommendationText: `Based on your ${vehicleModel || 'vehicle'} driving approximately ${monthlyKm || 1000} km/month on ${roadCondition || 'mixed city & highway'} roads, we recommend premium low-rolling-resistance tyres for optimal grip, mileage, and tread life.`,
          recommendedTyres: recommended
        });
      }

      const prompt = `You are Magadh Tyres AI Advisor, a expert automotive tyre specialist for Indian roads.
User Profile:
- Vehicle Model: ${vehicleModel || 'Car / SUV / Bike'}
- Monthly Mileage: ${monthlyKm || 1000} km
- Primary Terrain / Road Conditions: ${roadCondition || 'City potholes and monsoon roads'}
- Budget Range: ${budget || 'Moderate'}
- Driving Style: ${drivingStyle || 'Comfort & Fuel Efficiency'}

Available Catalog:
${JSON.stringify(productsStore.map(p => ({ id: p.id, name: p.name, brand: p.brand, category: p.category, price: p.price, terrain: p.terrain, specs: `${p.width}/${p.aspectRatio} R${p.rimSize}` })), null, 2)}

Instructions:
1. Recommend top 2-3 specific tyres from the catalog above that match the user's vehicle and driving style.
2. Provide concise, clear automotive reasoning highlighting wet grip, tread longevity, sidewall durability, and fuel savings on Indian roads.
3. Return response in valid JSON with fields:
   - "recommendationText": string summary advice
   - "recommendedProductIds": array of matching product string IDs from the catalog above.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let parsed = { recommendationText: "", recommendedProductIds: [] as string[] };
      try {
        if (aiResponse.text) {
          parsed = JSON.parse(aiResponse.text.trim());
        }
      } catch (e) {
        parsed.recommendationText = aiResponse.text || "Recommended top performance tyres for your vehicle.";
      }

      const recommendedTyres = productsStore.filter(p => parsed.recommendedProductIds?.includes(p.id));

      res.json({
        success: true,
        recommendationText: parsed.recommendationText || `Here are the best tyres matched for your ${vehicleModel}:`,
        recommendedTyres: recommendedTyres.length > 0 ? recommendedTyres : productsStore.slice(0, 3)
      });
    } catch (err: any) {
      console.error("AI Tyre Advisor Error:", err);
      res.json({
        success: true,
        recommendationText: "Here are top recommended tyres for Indian road conditions based on our customer ratings:",
        recommendedTyres: productsStore.slice(0, 3)
      });
    }
  });

  // Admin Product Creation / Update Endpoint
  app.post("/api/admin/products", (req, res) => {
    const productData = req.body;

    // Validate required Tire Type field
    const rawTireType = String(productData.tire_type || productData.tireType || '').trim().toLowerCase();
    const validatedTireType = (rawTireType === 'non-radial' || rawTireType === 'non radial' || rawTireType === 'non_radial' || rawTireType === 'bias') ? 'Non-Radial' : 'Radial';

    if (productData.id) {
      const idx = productsStore.findIndex(p => p.id === productData.id);
      if (idx !== -1) {
        productsStore[idx] = {
          ...productsStore[idx],
          ...productData,
          tire_type: validatedTireType,
          tireType: validatedTireType
        };
        return res.json({ success: true, message: "Product updated", product: productsStore[idx] });
      }
    }

    const newProd = {
      ...productData,
      id: `tyre-${Date.now()}`,
      stock: Number(productData.stock) || 20,
      price: Number(productData.price) || 4500,
      bulkPrice: Number(productData.bulkPrice) || 4100,
      image: productData.image || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800',
      hsnCode: productData.hsnCode || '40111010',
      tire_type: validatedTireType,
      tireType: validatedTireType
    };
    productsStore.unshift(newProd);
    res.json({ success: true, message: "New tyre product created", product: newProd });
  });

  // Admin Order Status Update
  app.post("/api/admin/orders/status", (req, res) => {
    const { orderId, newStatus } = req.body;
    const order = ordersStore.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.orderStatus = newStatus;
    // Add timeline update if not present
    const tIdx = order.timeline.findIndex(t => t.status === newStatus);
    if (tIdx !== -1) {
      order.timeline[tIdx].done = true;
      order.timeline[tIdx].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      order.timeline.push({
        status: newStatus,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        done: true,
        location: 'Magadh Admin Console'
      });
    }

    res.json({ success: true, message: `Order status updated to ${newStatus}`, order });
  });

  // Serve static assets from public folder
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Serve Vite in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MAGADH TYRES server running at http://localhost:${PORT}`);
  });
}

startServer();
