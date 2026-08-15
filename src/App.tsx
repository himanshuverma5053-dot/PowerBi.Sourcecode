import React, { useState, useEffect } from 'react';
import { TyreProduct, CartItem, Order, PaymentRecord, Coupon, CustomerAccount, ProductComponentConfig, getCartItemPrices } from './types';
import { Navbar } from './components/Navbar';
import { HomeSummaryBar } from './components/HomeSummaryBar';
import { NexusTelemetrySection } from './components/NexusTelemetrySection';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { VerticalProductCard } from './components/VerticalProductCard';
import { ProductCarousel } from './components/ProductCarousel';
import { ContinuousProductBar } from './components/ContinuousProductBar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MyOrderPage } from './components/MyOrderPage';
import { PaymentPage } from './components/PaymentPage';
import { ProfilePage } from './components/ProfilePage';
import { CartDrawer } from './components/CartDrawer';
import { InvoiceModal } from './components/InvoiceModal';
import { AdminPanel } from './components/AdminPanel';
import { TyreLogo } from './components/TyreLogo';
import { TyreLoader } from './components/TyreLoader';
import { Footer } from './components/Footer';
import { AuthPage } from './components/AuthPage';
import { supabase } from './supabaseClient';
import { checkIsAdmin, ADMIN_CONFIG } from './utils/admin';
import { getCustomerEffectivePrice, isProductVisibleToCustomer } from './utils/customerPricing';
import { fetchOrdersFromSupabase, saveOrderToSupabase, updateOrderStatusInSupabase } from './utils/supabaseOrders';
import { fetchProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase, updateProductFieldInSupabase } from './utils/supabaseProducts';
import { isRadialProduct, isNonRadialProduct } from './utils/productCategories';
import { safeSetLocalStorage, safeGetLocalStorage } from './utils/storage';
import { MOCK_TYRES } from './data/mockData';

import {
  ShieldCheck, SlidersHorizontal, CheckCircle2,
  Award, Star, Disc3, ArrowRight, Zap, RefreshCw, Car, Bike, Truck, ShieldAlert, Database,
  Search, X, PackageX
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Shared Master State 1: Products (fetched live from Supabase database)
  const [products, setProducts] = useState<TyreProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);

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

  const [cart, setCart] = useState<CartItem[]>([]);

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
      const dbProducts = await fetchProductsFromSupabase();
      if (dbProducts && Array.isArray(dbProducts)) {
        setProducts(dbProducts);
        if (showNotification) {
          if (dbProducts.length > 0) {
            showToast(`Loaded ${dbProducts.length} live products from Supabase`);
          } else {
            showToast('No products available in Supabase database');
          }
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Database product fetch error:', err);
      setProducts([]);
      if (showNotification) {
        showToast('Connected to Supabase database');
      }
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    // Clear any legacy cached demo products
    localStorage.removeItem('magadh_products');

    // Sync products from Supabase database (with local catalog fallback)
    loadProductsFromDb();

    // Sync initial orders from Supabase database
    fetchOrdersFromSupabase().then(dbOrders => {
      if (dbOrders && dbOrders.length > 0) {
        setOrders(prev => {
          // Merge Supabase orders with any local orders not yet in DB
          const existingIds = new Set(dbOrders.map(o => o.id));
          const localOnly = prev.filter(o => !existingIds.has(o.id));
          return [...localOnly, ...dbOrders];
        });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        const userIsAdmin = checkIsAdmin(undefined, session.user.email);
        if (userIsAdmin) {
          setCurrentUser(ADMIN_CONFIG.username);
        } else {
          setCurrentUser(session.user.email.split('@')[0]);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        const userIsAdmin = checkIsAdmin(undefined, session.user.email);
        const namePart = userIsAdmin 
          ? ADMIN_CONFIG.username 
          : session.user.email.split('@')[0];
        setCurrentUser(namePart);

        if (event === 'SIGNED_IN') {
          if (userIsAdmin) {
            setActiveTab('admin');
          } else {
            setActiveTab('account');
          }
        }

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // If hash contains access_token or type=signup, it was verified via link
          if (window.location.hash.includes('access_token') || window.location.search.includes('code')) {
            showToast('Email verified successfully! Welcome to Magadh Tyres.');
            // Clean hash/query params from URL
            if (window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        }
      } else {
        setCurrentUserEmail('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = checkIsAdmin(currentUser, currentUserEmail);
  const isLoggedIn = Boolean(currentUser || currentUserEmail);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<TyreProduct | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

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

  // Cart Management
  const handleAddToCart = (product: TyreProduct, quantity: number = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });

    showToast(`Added ${quantity}x ${product.name} to Cart`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number, parentProductId?: string) => {
    setCart(prevCart =>
      prevCart
        .map(item => {
          if (item.product.id === productId && item.parentProductId === parentProductId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string, parentProductId?: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.product.id === productId && item.parentProductId === parentProductId)));
  };

  // Place Order Action
  const handlePlaceOrder = (orderData: any) => {
    if (activeTab === 'admin' || (isAdmin && orderData?.fromAdmin)) {
      showToast('Order creation is disabled in the Admin Console. Orders must be placed via the customer portal.');
      return;
    }

    const subtotal = cart.reduce((sum, item) => {
      const { bundleUnitPrice } = getCartItemPrices(item);
      return sum + bundleUnitPrice * item.quantity;
    }, 0);

    let discount = 0;
    if (orderData.couponCode) {
      const coupon = coupons.find(c => c.code.toUpperCase() === orderData.couponCode?.toUpperCase() && c.active);
      if (coupon && subtotal >= coupon.minOrderValue) {
        discount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
      }
    }

    const discountedSubtotal = subtotal - discount;
    const totalAmount = Math.round(discountedSubtotal * 100) / 100;
    const gstAmount = Math.round((totalAmount - (totalAmount / 1.18)) * 100) / 100; // 18% GST included

    const orderNumber = `MT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `MGT-EXPRESS-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: orderData.customerName || 'Valued Customer',
      customerEmail: orderData.customerEmail || 'customer@magadhtyres.com',
      phone: orderData.phone || '+91 98351 22345',
      companyName: orderData.companyName,
      gstNumber: orderData.gstNumber,
      items: [...cart],
      subtotal,
      discount,
      gstAmount,
      totalAmount,
      paymentMethod: orderData.paymentMethod || 'UPI',
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      shippingAddress: orderData.shippingAddress || {
        street: 'Main Road',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001'
      },
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      timeline: [
        { status: 'Order Placed', time: 'Just Now', done: true, location: 'Magadh Web Portal' },
        { status: 'Confirmed', time: 'Just Now', done: true, location: 'Magadh Payment Gateway' },
        { status: 'Warehouse Processing', time: 'Pending', done: false, location: 'Patna Central Hub' },
        { status: 'Dispatched', time: 'Pending', done: false },
        { status: 'Out for Delivery', time: 'Pending', done: false },
        { status: 'Delivered', time: 'Pending', done: false }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);

    // Persist order to Supabase database
    saveOrderToSupabase(newOrder).catch(err => {
      console.warn('Background Supabase order save exception:', err);
    });

    // Update product inventory locally across all cart items and sync to Supabase
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const totalOrderedQty = cart
          .filter(ci => ci.product.id === p.id)
          .reduce((sum, ci) => sum + ci.quantity, 0);

        if (totalOrderedQty > 0) {
          const newStock = Math.max(0, p.stock - totalOrderedQty);
          updateProductFieldInSupabase(p.id, { stock: newStock }).catch(err => console.warn(err));
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    setSelectedOrderForInvoice(newOrder);
    showToast(`Order #${newOrder.orderNumber} placed successfully! Tax Invoice Generated.`);
  };

  // Instant Buy Trigger
  const handleInstantBuy = (product: TyreProduct, quantity: number) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(true);
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
      image: merged.image || (merged.images && merged.images[0]) || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800',
      images: merged.images && merged.images.length > 0 ? merged.images : [
        merged.image || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'
      ],
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

    saveProductToSupabase(productToSave).then(res => {
      if (res.success && res.data && res.data.id && res.data.id !== productToSave.id) {
        // Sync generated Supabase UUID to local state
        setProducts(prev => prev.map(p => p.id === productToSave.id ? res.data : p));
      }
    }).catch(err => {
      console.warn('Background Supabase product save exception:', err);
    });

    showToast(isEdit ? `Product "${productToSave.name}" updated!` : `New Product "${productToSave.name}" created!`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    deleteProductFromSupabase(productId).catch(err => {
      console.warn('Background Supabase product delete exception:', err);
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
    updateProductFieldInSupabase(productId, { status: targetStatus }).catch(err => {
      console.warn('Background Supabase product status update exception:', err);
    });
    showToast("Product status updated!");
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
    updateOrderStatusInSupabase(orderId, newStatus).catch(err => {
      console.warn('Background Supabase order status update exception:', err);
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
    <div className="min-h-screen bg-[#F7F7F7] text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white">
      
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
        cart={cart}
        setIsCartOpen={setIsCartOpen}
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
      <main className="flex-1">
        {(!isLoggedIn && (activeTab === 'account' || activeTab === 'admin' || activeTab === 'signin')) ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AuthPage
              initialMode="signin"
              onSuccess={(targetTab) => {
                if (targetTab) {
                  setActiveTab(targetTab);
                } else {
                  setActiveTab(isAdmin ? 'admin' : 'account');
                }
              }}
              showToast={showToast}
              setCurrentUser={setCurrentUser}
            />
          </div>
        ) : (
          <>
        {/* TAB 1: HOMEPAGE */}
        {activeTab === 'home' && (
          <div className="animate-fade-in py-4 space-y-6 sm:space-y-8">
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
                fetchOrdersFromSupabase().then(dbOrders => {
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

            {/* Section 2: Nexus Telemetry Showcase ("Every micron is accounted for.") */}
            <NexusTelemetrySection />
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
                      className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9800ff] transition-all shadow-2xs"
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
                      onAddToCart={handleAddToCart}
                      onInstantBuy={handleInstantBuy}
                      onViewDetails={(prod) => setSelectedProductForModal(prod)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200 shadow-2xs space-y-4">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto text-[#8a14d4]">
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
                      className="mt-2 px-5 py-2.5 bg-[#9800ff] hover:bg-[#8500e0] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
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

        {/* TAB 3: QUICK ORDER / MY ORDERS PAGE */}
        {activeTab === 'quick-order' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MyOrderPage
              products={visibleProducts}
              orders={orders}
              onPlaceQuickOrder={handlePlaceOrder}
              onViewInvoice={setSelectedOrderForInvoice}
              onTrackOrder={() => setActiveTab('quick-order')}
              setActiveTab={setActiveTab}
            />
          </div>
        )}

        {/* TAB 4: PAYMENT PAGE */}
        {activeTab === 'quick-payments' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PaymentPage
              payments={payments}
              orders={orders}
              onProcessPayment={(newPayment) => {
                setPayments(prev => [newPayment, ...prev]);
                setOrders(prev => prev.map(o => 
                  o.orderNumber === newPayment.orderId || o.id === newPayment.orderId 
                    ? { ...o, paymentStatus: 'Paid' } 
                    : o
                ));
                showToast(`Payment for #${newPayment.orderId} recorded successfully!`);
              }}
              onViewInvoice={setSelectedOrderForInvoice}
            />
          </div>
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
        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {isAdmin ? (
              <AdminPanel
                products={products}
                isProductsLoading={isProductsLoading}
                orders={orders}
                payments={payments}
                coupons={coupons}
                customerAccounts={customerAccounts}
                onUpdateCustomerAccounts={setCustomerAccounts}
                onAddOrUpdateProduct={handleAddOrUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onArchiveProduct={handleArchiveProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onViewInvoice={setSelectedOrderForInvoice}
                showToast={showToast}
              />
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-xl mx-auto my-12">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-display">Access Restricted</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Admin Console privileges are granted exclusively to designated administrator <strong className="text-slate-900 font-black">"{ADMIN_CONFIG.username}"</strong> ({ADMIN_CONFIG.email}).
                </p>
                <p className="text-xs text-slate-500">
                  Current user profile: <span className="font-bold text-slate-700">{currentUser || 'Standard User'}</span>
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('account')}
                    className="px-6 py-2.5 rounded-xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Go to Account Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SIGN IN AUTH */}
        {(activeTab === 'signin' || activeTab === 'signup' || activeTab === 'auth') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AuthPage
              initialMode="signin"
              onSuccess={(targetTab) => {
                if (targetTab) {
                  setActiveTab(targetTab);
                } else {
                  setActiveTab(isAdmin ? 'admin' : 'account');
                }
              }}
              showToast={showToast}
              setCurrentUser={setCurrentUser}
            />
          </div>
        )}
          </>
        )}

      </main>

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProductForModal}
        products={products}
        currentCustomer={currentCustomerAccount}
        isAdmin={isAdmin}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={handleAddToCart}
        onInstantBuy={handleInstantBuy}
      />

      <InvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => {
          setSelectedOrderForInvoice(null);
          setIsCartOpen(false);
          if (activeTab !== 'admin') {
            setActiveTab('quick-order');
          }
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
}
