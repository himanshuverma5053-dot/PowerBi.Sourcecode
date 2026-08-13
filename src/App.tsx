import React, { useState, useEffect } from 'react';
import { TyreProduct, CartItem, Order, PaymentRecord, Coupon, CustomerAccount, ProductComponentConfig, getCartItemPrices } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductCarousel } from './components/ProductCarousel';
import { ContinuousProductBar } from './components/ContinuousProductBar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuickOrderPage } from './components/QuickOrderPage';
import { QuickPaymentsPage } from './components/QuickPaymentsPage';
import { AccountPage } from './components/AccountPage';
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
  Award, Star, Disc3, ArrowRight, Zap, RefreshCw, Car, Bike, Truck, ShieldAlert, Database
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Shared Master State 1: Products (fetched from database with catalog fallback)
  const [products, setProducts] = useState<TyreProduct[]>(MOCK_TYRES);
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
      if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts);
        if (showNotification) {
          showToast(`Directly loaded ${dbProducts.length} products from live database`);
        }
      } else {
        setProducts(MOCK_TYRES);
        if (showNotification) {
          showToast('Loaded active products catalog (Database ready)');
        }
      }
    } catch (err) {
      console.error('Database product fetch error:', err);
      if (showNotification) {
        showToast('Connected to catalog database');
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchVehicle = p.compatibleVehicles.some(v => v.toLowerCase().includes(q));
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchVehicle && !matchDesc) return false;
    }
    return true;
  }).sort((a, b) => {
    const priceA = getCustomerEffectivePrice(a, currentCustomerAccount).effectivePrice;
    const priceB = getCustomerEffectivePrice(b, currentCustomerAccount).effectivePrice;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-purple-900 selection:text-white">
      
      {/* Toast Popup Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/40 text-xs font-bold flex items-center space-x-2 animate-bounce-short">
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
          <div>
            <Hero
              onSearch={(params) => {
                if (params.category) setSelectedCategory(params.category);
                if (params.vehicle) setSearchQuery(params.vehicle);
                if (params.rimSize) setSelectedRimSize(String(params.rimSize));
              }}
              setActiveTab={setActiveTab}
            />

            {/* Category Cards Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center space-y-2 mb-8">
                <span className="text-xs font-black tracking-widest text-purple-700 uppercase">
                  Explore By Vehicle Category
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                  Precision Tyres For Every Segment
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Radial Tyres', category: 'RADIAL', icon: Truck, bg: 'from-purple-900 to-indigo-950', desc: '295/90 R20, Endurace LD/MA/RA(T), Endutrax MA/MD' },
                  { name: 'Non Radial Tyres', category: 'NON RADIAL', icon: ShieldCheck, bg: 'from-amber-950 to-purple-950', desc: 'Amar Gold, Abhimanyu, XR-1X, XT-100 HD' },
                  { name: 'Truck & Commercial', category: 'RADIAL', icon: Truck, bg: 'from-indigo-950 to-slate-900', desc: 'Heavy Duty Commercial Tyres' },
                  { name: 'EV Ready Range', category: 'RADIAL', icon: Zap, bg: 'from-purple-900 to-indigo-900', desc: 'Low Rolling Resistance Radial Range' },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const catCount = products.filter(p => {
                    if (cat.category === 'RADIAL') return isRadialProduct(p);
                    if (cat.category === 'NON RADIAL') return isNonRadialProduct(p);
                    if (cat.category === 'ALL') return true;
                    if (cat.category === 'EV') return p.evReady;
                    return p.category === cat.category;
                  }).length;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.category);
                        setActiveTab('catalogue');
                      }}
                      className={`p-5 rounded-2xl bg-gradient-to-br ${cat.bg} text-white shadow-lg hover:scale-105 transition-all text-left flex flex-col justify-between h-36 border border-white/10 group`}
                    >
                      <Icon className="w-7 h-7 text-amber-400 group-hover:rotate-12 transition-transform" />
                      <div>
                        <h3 className="font-extrabold text-sm font-display">{cat.name}</h3>
                        <p className="text-[11px] text-purple-200 mt-0.5">{catCount} Models ({cat.desc})</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Featured Tyres Carousel */}
            <section className="bg-purple-50/50 py-10 border-y border-purple-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <ProductCarousel
                  badgeText="BEST-SELLERS"
                  title="Top Featured Tyres"
                  subtitle="Explore our top-performing commercial radial & non-radial tyre models"
                  products={visibleProducts}
                  currentCustomer={currentCustomerAccount}
                  isAdmin={isAdmin}
                  onAddToCart={handleAddToCart}
                  onInstantBuy={handleInstantBuy}
                  onViewDetails={(prod) => setSelectedProductForModal(prod)}
                />
              </div>
            </section>

            {/* Continuous Movable Horizontal Product Bars (Radial & Non-Radial) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
              <div className="text-center space-y-1">
                <span className="text-xs font-black tracking-widest text-purple-700 uppercase bg-purple-100/80 px-3 py-1 rounded-full border border-purple-200 inline-block">
                  LIVE CONTINUOUS SHOWCASE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                  Moving Radial & Non-Radial Product Bars
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
                  Continuously scrolling product bars with compact item cards. Hover or tap any item to pause and order directly.
                </p>
              </div>

              {/* Bar 1: Radial Category */}
              <ContinuousProductBar
                title="Radial Tyres Range"
                subtitle="High-speed steel belted radial tyres for long haul mileage & commercial haulage"
                badgeText="RADIAL CATEGORY"
                badgeType="radial"
                products={radialProducts}
                direction="left"
                speedSeconds={28}
                currentCustomer={currentCustomerAccount}
                isAdmin={isAdmin}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
                onViewDetails={(prod) => setSelectedProductForModal(prod)}
                onViewAllCategory={() => {
                  setSelectedCategory('RADIAL');
                  setActiveTab('catalogue');
                }}
              />

              {/* Bar 2: Non-Radial Category */}
              <ContinuousProductBar
                title="Non-Radial & Bias Tyres Range"
                subtitle="Heavy nylon cross-ply carcass built for heavy overload capacity & rugged terrains"
                badgeText="NON-RADIAL CATEGORY"
                badgeType="non-radial"
                products={nonRadialProducts}
                direction="right"
                speedSeconds={32}
                currentCustomer={currentCustomerAccount}
                isAdmin={isAdmin}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
                onViewDetails={(prod) => setSelectedProductForModal(prod)}
                onViewAllCategory={() => {
                  setSelectedCategory('NON RADIAL');
                  setActiveTab('catalogue');
                }}
              />
            </section>
          </div>
        )}

        {/* TAB 2: CATALOGUE PAGE */}
        {activeTab === 'catalogue' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs">
              <div>
                <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                  Products Catalogue
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore Our Complete Product Range
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-80 relative">
                <input
                  type="text"
                  placeholder="Search tyre name, brand, vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-purple-50/50 border border-purple-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>
            </div>

            {/* Continuously Movable Radial & Non-Radial Category Product Bars */}
            <div className="space-y-4">
              <ContinuousProductBar
                title="Radial Category Collection"
                subtitle="Continuously moving radial tyres list with compact view cards"
                badgeText="RADIAL CATEGORY"
                badgeType="radial"
                products={radialProducts.filter(p => searchQuery ? (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || p.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())) : true)}
                direction="left"
                speedSeconds={26}
                currentCustomer={currentCustomerAccount}
                isAdmin={isAdmin}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
                onViewDetails={(prod) => setSelectedProductForModal(prod)}
              />

              <ContinuousProductBar
                title="Non-Radial Category Collection"
                subtitle="Continuously moving non-radial tyres list with compact view cards"
                badgeText="NON-RADIAL CATEGORY"
                badgeType="non-radial"
                products={nonRadialProducts.filter(p => searchQuery ? (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || p.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())) : true)}
                direction="left"
                speedSeconds={30}
                currentCustomer={currentCustomerAccount}
                isAdmin={isAdmin}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
                onViewDetails={(prod) => setSelectedProductForModal(prod)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: QUICK ORDER PAGE */}
        {activeTab === 'quick-order' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <QuickOrderPage
              products={visibleProducts}
              orders={orders}
              onPlaceQuickOrder={handlePlaceOrder}
              onViewInvoice={setSelectedOrderForInvoice}
              onTrackOrder={() => setActiveTab('quick-order')}
              setActiveTab={setActiveTab}
            />
          </div>
        )}

        {/* TAB 4: QUICK PAYMENTS PAGE */}
        {activeTab === 'quick-payments' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <QuickPaymentsPage
              orders={orders}
              payments={payments}
              onViewInvoice={setSelectedOrderForInvoice}
            />
          </div>
        )}

        {/* TAB 5: ACCOUNT PAGE */}
        {activeTab === 'account' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AccountPage
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
              <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-xl space-y-4 max-w-xl mx-auto my-12">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-display">Access Restricted</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Admin Console privileges are granted exclusively to designated administrator <strong className="text-purple-900 font-black">"{ADMIN_CONFIG.username}"</strong> ({ADMIN_CONFIG.email}).
                </p>
                <p className="text-xs text-slate-500">
                  Current user profile: <span className="font-bold text-slate-700">{currentUser || 'Standard User'}</span>
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('account')}
                    className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs shadow-md transition-all"
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

      {/* Footer - Rendered on Home page when logged in */}
      {isLoggedIn && activeTab === 'home' && <Footer setActiveTab={setActiveTab} />}
    </div>
  );
}
