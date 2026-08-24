import React, { useState, useEffect } from 'react';
import { TyreProduct, Order, PaymentRecord, Coupon, CustomerAccount, ProductComponentConfig } from './types';
import { Navbar } from './components/Navbar';
import { HomeSummaryBar } from './components/HomeSummaryBar';
import { PaymentProgressBar } from './components/PaymentProgressBar';
import { HomeBannerSection } from './components/HomeBannerSection';
import { NexusTelemetrySection } from './components/NexusTelemetrySection';
import { ForYourKnowledgeSection } from './components/ForYourKnowledgeSection';
import { HomePartnerSection } from './components/HomePartnerSection';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { VerticalProductCard } from './components/VerticalProductCard';
import { ProductCarousel } from './components/ProductCarousel';
import { ContinuousProductBar } from './components/ContinuousProductBar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MyOrderPage } from './components/MyOrderPage';
import { PaymentPage } from './components/PaymentPage';
import { ProfilePage } from './components/ProfilePage';
import { InvoiceModal } from './components/InvoiceModal';
import { OrderDetailsPage } from './components/OrderDetailsPage';
import { AdminPanel } from './components/AdminPanel';
import { TyreLogo } from './components/TyreLogo';
import { TyreLoader } from './components/TyreLoader';
import { Footer } from './components/Footer';
import { checkIsAdmin, ADMIN_CONFIG } from './utils/admin';
import { getCustomerEffectivePrice, isProductVisibleToCustomer } from './utils/customerPricing';
import { fetchOrdersFromBackend, saveOrderToBackend, updateOrderStatusInBackend } from './services/orderService';
import { fetchProductsFromBackend, saveProductToBackend, deleteProductFromBackend, updateProductFieldInBackend } from './services/productService';
import { isRadialProduct, isNonRadialProduct } from './utils/productCategories';
import { safeSetLocalStorage, safeGetLocalStorage } from './utils/storage';
import { calculateCustomerFinancials } from './utils/customerFinancials';
import { MOCK_TYRES } from './data/mockData';
import { apolloEndutraxImg, apolloEndutraxMaDImg, apolloEnduraceLdImg, apolloEnduraceRatDImg, apolloEndutraxTreadImg } from './assets/tyreImages';
import apolloEnduBannerImg from './assets/images/regenerated_image_1787248277167.png';

import {
  ShieldCheck, SlidersHorizontal, CheckCircle2,
  Award, Star, Disc3, ArrowRight, Zap, RefreshCw, Car, Bike, Truck, ShieldAlert, Database,
  Search, X, PackageX
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Helper to ensure mock tyres always have the high resolution product and tread images
  const initializeProducts = (rawList: TyreProduct[]): TyreProduct[] => {
    const list = [...rawList];
    // Ensure all MOCK_TYRES exist in list
    for (const mock of MOCK_TYRES) {
      const existingIdx = list.findIndex(p => p.id === mock.id);
      if (existingIdx === -1) {
        list.unshift(mock);
      } else {
        list[existingIdx] = { ...mock, ...list[existingIdx], price: mock.price, image: mock.image, images: mock.images, components: mock.components };
      }
    }

    return list.map(p => {
      if (p.id === 'tyre-endutrax-ma-d' || p.name.includes('ENDUTRAX MA')) {
        return {
          ...p,
          image: apolloEndutraxMaDImg || p.image,
          images: [apolloEndutraxMaDImg || p.image, apolloEndutraxTreadImg]
        };
      }
      if (p.id === 'tyre-endutrax-md-plus-d' || p.name.includes('ENDUTRAX MD')) {
        return {
          ...p,
          image: apolloEndutraxImg,
          images: [apolloEndutraxImg, apolloEndutraxTreadImg]
        };
      }
      if (p.id === 'tyre-endurace-ld-d' || p.name.includes('ENDURACE LD')) {
        return {
          ...p,
          image: apolloEnduraceLdImg || p.image,
          images: [apolloEnduraceLdImg || p.image, apolloEndutraxTreadImg]
        };
      }
      if (p.id === 'tyre-endurace-rat-d' || p.name.includes('ENDURACE RA')) {
        return {
          ...p,
          image: apolloEnduraceRatDImg || p.image,
          images: [apolloEnduraceRatDImg || p.image, apolloEndutraxTreadImg]
        };
      }
      return {
        ...p,
        image: p.image || '',
        images: p.images || []
      };
    });
  };

  // Shared Master State 1: Products (fetched live from backend or fallback)
  const [products, setProducts] = useState<TyreProduct[]>(() => {
    const cached = safeGetLocalStorage<TyreProduct[]>('magadh_products', []);
    if (cached && cached.length > 0) {
      return initializeProducts(cached);
    }
    return initializeProducts(MOCK_TYRES);
  });
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(false);

  useEffect(() => {
    safeSetLocalStorage('magadh_products', products);
  }, [products]);

  // Shared Master State 2: Registered Customer Accounts
  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccount[]>(() => {
    return safeGetLocalStorage<CustomerAccount[]>('magadh_customer_accounts', []);
  });

  useEffect(() => {
    safeSetLocalStorage('magadh_customer_accounts', customerAccounts);
  }, [customerAccounts]);

  // Shared Master State 3: Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    return safeGetLocalStorage<Order[]>('magadh_orders', []);
  });

  useEffect(() => {
    safeSetLocalStorage('magadh_orders', orders);
  }, [orders]);

  // Shared Master State 4: Payments
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    return safeGetLocalStorage<PaymentRecord[]>('magadh_payments', []);
  });

  useEffect(() => {
    safeSetLocalStorage('magadh_payments', payments);
  }, [payments]);

  // Shared Master State 5: Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    return safeGetLocalStorage<Coupon[]>('magadh_coupons', []);
  });

  useEffect(() => {
    safeSetLocalStorage('magadh_coupons', coupons);
  }, [coupons]);

  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.customerName) return parsed.customerName;
      } catch (e) {
        console.error(e);
      }
    }
    return '';
  });

  // Current Active Customer Account derived from shared customerAccounts
  const currentCustomerAccount = customerAccounts.find(c => {
    if (currentUserEmail && c.email?.toLowerCase() === currentUserEmail.toLowerCase()) return true;
    if (currentUser && (
      c.username?.toLowerCase() === currentUser.toLowerCase() ||
      c.customerName?.toLowerCase() === currentUser.toLowerCase()
    )) return true;
    return false;
  }) || null;

  const loadProductsFromDb = async (showNotification = false) => {
    setIsProductsLoading(true);
    try {
      const dbProducts = await fetchProductsFromBackend();
      if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts);
        if (showNotification) {
          showToast(`Loaded ${dbProducts.length} live products from catalogue`);
        }
      } else {
        setProducts(MOCK_TYRES);
        if (showNotification) {
          showToast('Loaded standard product catalogue');
        }
      }
    } catch (err) {
      console.error('Database product fetch error:', err);
      setProducts(MOCK_TYRES);
      if (showNotification) {
        showToast('Connected to product catalogue');
      }
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    // Clear legacy cached demo products and all previous order and payment history
    localStorage.removeItem('magadh_products');
    localStorage.removeItem('magadh_orders');
    localStorage.removeItem('magadh_orders_db');
    localStorage.removeItem('magadh_payments');
    localStorage.removeItem('magadh_payments_db');
    safeSetLocalStorage('magadh_orders', []);
    safeSetLocalStorage('magadh_orders_db', []);
    safeSetLocalStorage('magadh_payments', []);
    setOrders([]);
    setPayments([]);
    
    // Sync products from backend database (with local catalog fallback)
    loadProductsFromDb();

    // Sync orders from backend database
    fetchOrdersFromBackend().then(dbOrders => {
      if (dbOrders && Array.isArray(dbOrders)) {
        setOrders(dbOrders);
      }
    });
  }, []);

  const isAdmin = checkIsAdmin(currentUser, currentUserEmail);
  const isLoggedIn = Boolean(currentUser || currentUserEmail);

  const [selectedProductForModal, setSelectedProductForModal] = useState<TyreProduct | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [checkoutOrderProduct, setCheckoutOrderProduct] = useState<{ product: TyreProduct; quantity: number } | null>(null);
  const [orderToPay, setOrderToPay] = useState<Order | null>(null);

  // Filters State for Catalogue
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('RADIAL');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedRimSize, setSelectedRimSize] = useState<string>('All');
  const [selectedTerrain, setSelectedTerrain] = useState<string>('All');
  const [evOnlyFilter, setEvOnlyFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Track Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Order Details Page on Buy Now Click
  const handleInstantBuy = (product: TyreProduct, quantity: number = 1) => {
    if (activeTab === 'admin' || isAdmin) {
      showToast('Order creation is disabled in the Admin Console.');
      return;
    }

    setCheckoutOrderProduct({ product, quantity });
    setSelectedProductForModal(null);
    setActiveTab('order-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Proceed & Confirm Order from Order Details Page
  const handleProceedConfirmedOrder = (orderData: {
    customerName: string;
    customerEmail: string;
    phone: string;
    companyName?: string;
    gstNumber?: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'EMI' | 'Pay on Delivery';
    quantity: number;
    couponCode?: string;
    discount: number;
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
  }) => {
    if (!checkoutOrderProduct) return;
    const { product } = checkoutOrderProduct;
    const quantity = orderData.quantity;

    const orderNumber = `MT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `MGT-EXPRESS-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: orderData.customerName || currentCustomerAccount?.customerName || currentUser || 'Valued Customer',
      customerEmail: orderData.customerEmail || currentCustomerAccount?.email || currentUserEmail || 'customer@magadhtyres.com',
      phone: orderData.phone || currentCustomerAccount?.phone || '+91 98351 22345',
      companyName: orderData.companyName || currentCustomerAccount?.companyName,
      gstNumber: orderData.gstNumber || currentCustomerAccount?.gstNumber,
      items: [{ product, quantity }],
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      gstAmount: orderData.gstAmount,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      shippingAddress: orderData.shippingAddress,
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      timeline: [
        { status: 'Order Placed', time: 'Just Now', done: true, location: 'Magadh Direct Checkout' },
        { status: 'Confirmed', time: 'Just Now', done: true, location: 'Magadh Payment Gateway' },
        { status: 'Warehouse Processing', time: 'Pending', done: false, location: 'Patna Central Hub' },
        { status: 'Dispatched', time: 'Pending', done: false },
        { status: 'Out for Delivery', time: 'Pending', done: false },
        { status: 'Delivered', time: 'Pending', done: false }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);

    // Persist order to backend database
    saveOrderToBackend(newOrder).catch(err => {
      console.warn('Background backend order save exception:', err);
    });

    // Update product inventory locally and sync to backend
    const newStock = Math.max(0, (product.stock || 0) - quantity);
    updateProductFieldInBackend(product.id, { stock: newStock }).catch(err => console.warn(err));
    setProducts(prevProducts =>
      prevProducts.map(p => p.id === product.id ? { ...p, stock: newStock } : p)
    );

    setCheckoutOrderProduct(null);
    setOrderToPay(newOrder);
    setActiveTab('quick-payments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Order #${newOrder.orderNumber} initiated! Please select payment method to complete payment.`);
  };

  // Admin Add/Update Product
  const handleAddOrUpdateProduct = (productData: Partial<TyreProduct>) => {
    const isEdit = !!productData.id;
    const existing = isEdit ? products.find(p => p.id === productData.id) : undefined;
    const merged = existing ? { ...existing, ...productData } : productData;
    const now = new Date().toISOString();

    const mrpValue = Number(merged.mrp) || Number(merged.price) || 0;
    const dealerPriceValue = Number(merged.dealerPrice) || Number(merged.bulkPrice) || 0;

    const productToSave: TyreProduct = {
      id: merged.id || `tyre-${Date.now()}`,
      name: merged.name || 'Commercial Tyre',
      brand: merged.brand || 'Apollo',
      category: merged.category || 'RADIAL',
      width: Number(merged.width) || 295,
      aspectRatio: Number(merged.aspectRatio) || 90,
      rimSize: Number(merged.rimSize) || 20,
      speedRating: merged.speedRating || 'K',
      loadIndex: Number(merged.loadIndex) || 154,
      price: mrpValue,
      bulkPrice: dealerPriceValue,
      mrp: mrpValue,
      dealerPrice: dealerPriceValue,
      stock: merged.stock !== undefined ? Number(merged.stock) : 0,
      minStockLevel: merged.minStockLevel !== undefined ? Number(merged.minStockLevel) : 5,
      gstRate: Number(merged.gstRate) ?? 18,
      image: merged.image || (merged.images && merged.images[0]) || '',
      images: merged.images && merged.images.length > 0 ? merged.images : (merged.image ? [merged.image] : []),
      terrain: merged.terrain || 'Highway',
      warrantyYears: Number(merged.warrantyYears) || 3,
      fuelEfficiency: merged.fuelEfficiency || 'B',
      wetGrip: merged.wetGrip || 'A',
      noiseDb: Number(merged.noiseDb) || 68,
      description: merged.description || 'Commercial grade tyre for high load endurance.',
      compatibleVehicles: merged.compatibleVehicles || ['Commercial Truck'],
      featured: merged.featured || false,
      evReady: merged.evReady || false,
      hsnCode: merged.hsnCode || '40111010',
      sku: merged.sku || `SKU-${(merged.brand || 'TYRE').substring(0, 3).toUpperCase()}-${merged.width || 295}${merged.aspectRatio || 90}R${merged.rimSize || 20}`,
      productCode: merged.productCode || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      pattern: merged.pattern || 'Standard Tread',
      status: merged.status || 'In Stock',
      tags: merged.tags || ['Tubeless'],
      components: merged.components || [],
      tireType: merged.tireType || merged.tire_type || 'Radial',
      tire_type: merged.tireType || merged.tire_type || 'Radial',
      createdAt: merged.createdAt || now,
      updatedAt: now
    };

    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === productToSave.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = productToSave;
        return updated;
      }
      return [productToSave, ...prev];
    });

    saveProductToBackend(productToSave).then(res => {
      if (res.success && res.data && res.data.id && res.data.id !== productToSave.id) {
        // Sync generated backend ID to local state
        setProducts(prev => prev.map(p => p.id === productToSave.id ? res.data : p));
      }
    }).catch(err => {
      console.warn('Background product save exception:', err);
    });

    showToast(isEdit ? `Product "${productToSave.name}" updated!` : `New Product "${productToSave.name}" created!`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    deleteProductFromBackend(productId).catch(err => {
      console.warn('Background product delete exception:', err);
    });
    showToast("Product deleted from catalogue!");
  };

  const handleArchiveProduct = (productId: string, newStatus?: 'Active' | 'Inactive' | 'Archived') => {
    let targetStatus: 'Active' | 'Inactive' | 'Archived' = 'Archived';
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        targetStatus = newStatus || (p.status === 'Archived' ? 'Active' : 'Archived');
        return { ...p, status: targetStatus, updatedAt: new Date().toISOString() };
      }
      return p;
    }));
    updateProductFieldInBackend(productId, { status: targetStatus }).catch(err => {
      console.warn('Background product status update exception:', err);
    });
    showToast("Product status updated!");
  };

  const handleUpdateProductImage = (productId: string, imageUrl: string) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === productId) {
          return { ...p, image: imageUrl, images: [imageUrl, ...(p.images || [])] };
        }
        return p;
      });
      safeSetLocalStorage('magadh_products', updated);
      return updated;
    });
    if (selectedProductForModal && selectedProductForModal.id === productId) {
      setSelectedProductForModal(prev => prev ? { ...prev, image: imageUrl, images: [imageUrl, ...(prev.images || [])] } : null);
    }
    showToast('Product photo updated successfully!');
  };

  // Customer-visible products (excluding inactive/archived products and restricted products)
  const visibleProducts = products.filter(p => {
    if (p.status === 'Inactive' || p.status === 'Archived') return false;
    return isProductVisibleToCustomer(p, currentCustomerAccount);
  });

  const radialProducts = visibleProducts.filter(p => isRadialProduct(p));
  const nonRadialProducts = visibleProducts.filter(p => isNonRadialProduct(p));

  // Admin Order Status Update
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['orderStatus']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId || o.orderNumber === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    updateOrderStatusInBackend(orderId, newStatus).catch(err => {
      console.warn('Background order status update exception:', err);
    });
    showToast(`Order status updated to ${newStatus}`);
  };

  // Comprehensive Search Matching Helper
  const matchesSearchQuery = (p: TyreProduct, query: string): boolean => {
    if (!query || !query.trim()) return true;
    const q = query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);

    const nameLower = (p.name || '').toLowerCase();
    const brandLower = (p.brand || '').toLowerCase();
    const categoryLower = (p.category || '').toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    const skuLower = (p.sku || '').toLowerCase();
    const patternLower = (p.pattern || '').toLowerCase();
    const tireTypeLower = (p.tireType || p.tire_type || '').toLowerCase();
    const tyreSizeLower = ((p as any).tyreSize || '').toLowerCase();
    const sizeString = `${p.width || ''}/${p.aspectRatio || ''} r${p.rimSize || ''}`.toLowerCase();
    const cleanSizeString = sizeString.replace(/[\/\-\s]/g, '');
    const vehicleString = Array.isArray(p.compatibleVehicles) ? p.compatibleVehicles.join(' ').toLowerCase() : '';
    const vehicleTypeLower = ((p as any).vehicleType || '').toLowerCase();
    const tagString = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';

    const fullSearchableText = `${nameLower} ${brandLower} ${categoryLower} ${descLower} ${skuLower} ${patternLower} ${tireTypeLower} ${tyreSizeLower} ${sizeString} ${cleanSizeString} ${vehicleString} ${vehicleTypeLower} ${tagString}`;

    return tokens.every((token) => {
      const cleanToken = token.replace(/[\/\-\s]/g, '');
      if (fullSearchableText.includes(token)) return true;
      if (cleanToken.length > 1 && cleanSizeString.includes(cleanToken)) return true;
      if (token === String(p.width) || token === String(p.rimSize) || token === `r${p.rimSize}`) return true;
      return false;
    });
  };

  // Filter catalogue
  const filteredCatalogue = visibleProducts.filter(p => {
    if (selectedCategory === 'RADIAL') {
      if (!isRadialProduct(p)) return false;
    } else if (selectedCategory === 'NON RADIAL' || selectedCategory === 'NON-RADIAL' || selectedCategory === 'NON_RADIAL') {
      if (!isNonRadialProduct(p)) return false;
    } else if (selectedCategory !== 'All' && selectedCategory !== 'ALL' && selectedCategory !== '') {
      if (p.category !== selectedCategory) return false;
    }
    if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
    if (selectedRimSize !== 'All' && p.rimSize !== Number(selectedRimSize)) return false;
    if (selectedTerrain !== 'All' && p.terrain !== selectedTerrain) return false;
    if (evOnlyFilter && !p.evReady) return false;
    return matchesSearchQuery(p, searchQuery);
  }).sort((a, b) => {
    const priceA = getCustomerEffectivePrice(a, currentCustomerAccount).effectivePrice;
    const priceB = getCustomerEffectivePrice(b, currentCustomerAccount).effectivePrice;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white overflow-x-hidden w-full max-w-full">
      
      {/* Toast Popup Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center space-x-2 animate-bounce-short">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        allProducts={visibleProducts}
        onSelectProduct={(product) => setSelectedProductForModal(product)}
        onSelectCategory={(category) => setSelectedCategory(category)}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* TAB 1: HOMEPAGE */}
        {activeTab === 'home' && (
          <div className="animate-fade-in py-4 space-y-2 sm:space-y-3">
            {/* Section 1: Static Overview 2x2 Summary Bar */}
            <HomeSummaryBar
              orders={orders}
              payments={payments}
              currentCustomerAccount={currentCustomerAccount}
              currentUser={currentUser}
              currentUserEmail={currentUserEmail}
              isAdmin={isAdmin}
              setActiveTab={setActiveTab}
              onRefreshData={() => {
                loadProductsFromDb(false);
                fetchOrdersFromBackend().then(dbOrders => {
                  if (dbOrders && dbOrders.length > 0) {
                    setOrders(prev => {
                      const existingIds = new Set(dbOrders.map(o => o.id));
                      const localOnly = prev.filter(o => !existingIds.has(o.id));
                      return [...localOnly, ...dbOrders];
                    });
                  }
                  showToast('Live trade metrics synced with database');
                });
              }}
            />

            {/* Horizontal Water Wave Payment Progress Bar */}
            <PaymentProgressBar
              orders={orders}
              payments={payments}
              currentCustomerAccount={currentCustomerAccount}
              currentUser={currentUser}
              currentUserEmail={currentUserEmail}
              isAdmin={isAdmin}
              onPayNow={() => {
                setActiveTab('quick-payments');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Featured Showcase Banner Carousel with Zero Horizontal Space */}
            <HomeBannerSection />

            {/* Section 3: For Popular Choices & Knowledge */}
            <ForYourKnowledgeSection
              products={visibleProducts}
              currentCustomerAccount={currentCustomerAccount}
              isAdmin={isAdmin}
              onInstantBuy={handleInstantBuy}
              onViewDetails={(product) => setSelectedProductForModal(product)}
              onExploreCatalogue={(category) => {
                if (category) setSelectedCategory(category);
                setActiveTab('catalogue');
              }}
            />

            {/* Section 4: Apollo Sampark Business Partner Connect & Copyright */}
            <HomePartnerSection />
          </div>
        )}

        {/* TAB 2: PRODUCTS PAGE (Vertical Style as requested) */}
        {activeTab === 'catalogue' && (() => {
          const displayProducts = visibleProducts;
          const searchedProducts = displayProducts.filter(p => matchesSearchQuery(p, searchQuery));

          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              {/* Products Header Card */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                      Products
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {searchedProducts.length > 0
                        ? `Explore Our Complete Tyre Range (${searchedProducts.length} Available)`
                        : 'No products available currently'}
                    </p>
                  </div>

                  {/* Search Bar Input */}
                  <div className="w-full md:w-96 relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search tyre name, size e.g. 140/70-17, brand..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0972D3] transition-all shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Clear search query"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Vertical Products Grid / Empty State */}
              {searchedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {searchedProducts.map((product) => (
                    <VerticalProductCard
                      key={product.id}
                      product={product}
                      currentCustomer={currentCustomerAccount}
                      isAdmin={isAdmin}
                      onInstantBuy={handleInstantBuy}
                      onViewDetails={(prod) => setSelectedProductForModal(prod)}
                      onUpdateImage={handleUpdateProductImage}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200 shadow-2xs space-y-4">
                  <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto text-[#0972D3]">
                    <PackageX className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {searchQuery ? `No products found matching "${searchQuery}"` : 'No Products Available'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5">
                      {searchQuery
                        ? "We couldn't find any tyres matching your search query. Try searching for a different keyword or size."
                        : 'There are currently no products in the catalog. Please check back later or contact the administrator.'}
                    </p>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 px-5 py-2.5 bg-[#0972D3] hover:bg-[#075ea8] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Search</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB: ORDER DETAILS & VERIFICATION PAGE */}
        {activeTab === 'order-details' && checkoutOrderProduct && (
          <OrderDetailsPage
            product={checkoutOrderProduct.product}
            initialQuantity={checkoutOrderProduct.quantity}
            currentCustomer={currentCustomerAccount}
            currentUser={currentUser}
            currentUserEmail={currentUserEmail}
            coupons={coupons}
            onProceedOrder={handleProceedConfirmedOrder}
            onBack={() => {
              setActiveTab('catalogue');
            }}
          />
        )}

        {/* TAB 3: QUICK ORDER / MY ORDERS PAGE */}
        {activeTab === 'quick-order' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MyOrderPage
              products={visibleProducts}
              orders={orders}
              onViewInvoice={setSelectedOrderForInvoice}
              onTrackOrder={() => setActiveTab('quick-order')}
              setActiveTab={setActiveTab}
            />
          </div>
        )}

        {/* TAB 4: PAYMENT PAGE */}
        {activeTab === 'quick-payments' && (
          <PaymentPage
            payments={payments}
            orders={orders}
            incomingOrderToPay={orderToPay}
            onProcessPayment={(newPayment) => {
              setPayments(prev => [newPayment, ...prev]);
              setOrders(prev => prev.map(o => {
                if (o.orderNumber === newPayment.orderId || o.id === newPayment.orderId) {
                  const updatedOrder: Order = {
                    ...o,
                    paymentStatus: 'Paid',
                    timeline: o.timeline.map(t =>
                      t.status === 'Confirmed' || t.status === 'Order Placed' ? { ...t, done: true } : t
                    )
                  };
                  saveOrderToBackend(updatedOrder).catch(err => console.warn(err));
                  return updatedOrder;
                }
                return o;
              }));
              showToast(`Payment for #${newPayment.orderId} recorded successfully!`);
            }}
            onPaymentSuccess={(paidOrder) => {
              setOrderToPay(null);
              setActiveTab('quick-order');
              showToast(`Payment successful! Order #${paidOrder.orderNumber} confirmed.`);
            }}
            onCancelPayment={(cancelledOrder) => {
              const targetOrder = cancelledOrder || orderToPay;
              if (targetOrder && targetOrder.items && targetOrder.items.length > 0) {
                setCheckoutOrderProduct({
                  product: targetOrder.items[0].product,
                  quantity: targetOrder.items[0].quantity
                });
                // Remove the unconfirmed pending order
                setOrders(prev => prev.filter(o => o.id !== targetOrder.id && o.orderNumber !== targetOrder.orderNumber));
              } else if (!checkoutOrderProduct && visibleProducts.length > 0) {
                setCheckoutOrderProduct({
                  product: visibleProducts[0],
                  quantity: 1
                });
              }
              setOrderToPay(null);
              setActiveTab('order-details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              showToast('Payment cancelled. Returned to order details.');
            }}
            onViewInvoice={setSelectedOrderForInvoice}
          />
        )}

        {/* TAB 5: MY PROFILE PAGE */}
        {activeTab === 'account' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProfilePage
              orders={orders}
              showToast={showToast}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              setActiveTab={setActiveTab}
              currentUserEmail={currentUserEmail}
              customerAccounts={customerAccounts}
              onUpdateCustomerAccounts={setCustomerAccounts}
            />
          </div>
        )}

        {/* TAB 6: ADMIN CONSOLE */}
        {activeTab === 'admin' && null}
      </main>

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProductForModal}
        products={products}
        currentCustomer={currentCustomerAccount}
        isAdmin={isAdmin}
        onClose={() => setSelectedProductForModal(null)}
        onInstantBuy={handleInstantBuy}
        onUpdateImage={handleUpdateProductImage}
      />

      <InvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => {
          setSelectedOrderForInvoice(null);
          if (activeTab !== 'admin') {
            setActiveTab('quick-order');
          }
        }}
      />
    </div>
  );
}
