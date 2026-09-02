import React, { useState, useMemo } from 'react';
import { TyreProduct, Order, PaymentRecord, CustomerAccount, Coupon } from '../types';
import { MagadhSparshLogo } from './MagadhSparshLogo';
import { CustomSearchIcon } from './SearchIcon';
import { AdminSummaryBar } from './AdminSummaryBar';
import {
  Package, ShoppingCart, Users, CreditCard, BarChart3, Plus,
  Filter, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, TrendingUp,
  Truck, ShieldCheck, RefreshCw, Eye, Edit3, Trash2, Archive, ArrowRight,
  DollarSign, FileText, Check, X, SlidersHorizontal, ChevronRight,
  Building2, Phone, Mail, MapPin, Percent, Layers, Store, ExternalLink
} from 'lucide-react';

interface AdminPanelProps {
  products: TyreProduct[];
  isProductsLoading?: boolean;
  orders: Order[];
  payments: PaymentRecord[];
  coupons?: Coupon[];
  customerAccounts: CustomerAccount[];
  onUpdateCustomerAccounts: (accounts: CustomerAccount[]) => void;
  onAddOrUpdateProduct: (product: Partial<TyreProduct>) => void;
  onDeleteProduct: (productId: string) => void;
  onArchiveProduct: (productId: string, newStatus?: 'Active' | 'Inactive' | 'Archived') => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['orderStatus']) => void;
  onViewInvoice: (order: Order) => void;
  onSwitchToCustomer?: () => void;
  showToast: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  isProductsLoading = false,
  orders,
  payments,
  coupons = [],
  customerAccounts,
  onUpdateCustomerAccounts,
  onAddOrUpdateProduct,
  onDeleteProduct,
  onArchiveProduct,
  onUpdateOrderStatus,
  onViewInvoice,
  onSwitchToCustomer,
  showToast
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'payments'>('overview');

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStatusFilter, setProductStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [customerSearch, setCustomerSearch] = useState('');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<TyreProduct> | null>(null);

  // Customer Account Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<CustomerAccount> | null>(null);

  // Delete Confirmation Dialog
  const [productToDelete, setProductToDelete] = useState<TyreProduct | null>(null);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'Paid' ? sum + o.totalAmount : sum), 0);
    const pendingRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'Pending' ? sum + o.totalAmount : sum), 0);
    const totalUnitsSold = orders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) <= (p.minStockLevel || 5)).length;
    const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
    const inventoryValuation = products.reduce((sum, p) => sum + (p.dealerPrice || p.price || 0) * (p.stock || 0), 0);

    return {
      totalRevenue,
      pendingRevenue,
      totalUnitsSold,
      totalOrders: orders.length,
      totalProducts: products.length,
      lowStockCount,
      outOfStockCount,
      inventoryValuation,
      totalCustomers: customerAccounts.length
    };
  }, [orders, products, customerAccounts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.productCode && p.productCode.toLowerCase().includes(productSearch.toLowerCase()));
      
      const matchesCat = productCategoryFilter === 'All' || p.category === productCategoryFilter || (p.tireType && p.tireType === productCategoryFilter);
      const matchesStatus =
        productStatusFilter === 'All' ||
        (productStatusFilter === 'Low Stock' && (p.stock || 0) <= (p.minStockLevel || 5)) ||
        (productStatusFilter === 'Out of Stock' && (p.stock || 0) === 0) ||
        (productStatusFilter === 'Active' && p.status !== 'Archived' && p.status !== 'Inactive') ||
        (productStatusFilter === 'Archived' && p.status === 'Archived');

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, productSearch, productCategoryFilter, productStatusFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.phone && o.phone.includes(orderSearch)) ||
        (o.gstNumber && o.gstNumber.toLowerCase().includes(orderSearch.toLowerCase()));
      const matchesStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customerAccounts.filter(c => {
      return (
        c.companyName.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.customerName && c.customerName.toLowerCase().includes(customerSearch.toLowerCase())) ||
        c.phone.includes(customerSearch) ||
        c.gstNumber.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase())
      );
    });
  }, [customerAccounts, customerSearch]);

  // Handle Save Product
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.brand) {
      showToast('Please fill all required product fields');
      return;
    }

    onAddOrUpdateProduct(editingProduct);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Handle Save Customer Account
  const handleSaveCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.companyName || !editingCustomer.phone) {
      showToast('Please fill all required dealer details');
      return;
    }

    const now = new Date().toISOString();
    const customerToSave: CustomerAccount = {
      id: editingCustomer.id || `cust-${Date.now()}`,
      username: editingCustomer.username || editingCustomer.phone || `dealer_${Date.now()}`,
      customerName: editingCustomer.customerName || editingCustomer.companyName,
      companyName: editingCustomer.companyName,
      email: editingCustomer.email || '',
      phone: editingCustomer.phone,
      gstNumber: editingCustomer.gstNumber || 'UNREGISTERED',
      gstType: editingCustomer.gstType || 'Regular',
      deliveryLocation: editingCustomer.deliveryLocation || 'Patna, Bihar',
      address: editingCustomer.address || '',
      accountStatus: editingCustomer.accountStatus || 'Active',
      pricingType: editingCustomer.pricingType || 'gst',
      overallDiscountPercent: Number(editingCustomer.overallDiscountPercent) || 0,
      creditEnabled: editingCustomer.creditEnabled ?? true,
      creditLimit: Number(editingCustomer.creditLimit) || 500000,
      usedCredit: Number(editingCustomer.usedCredit) || 0,
      paymentTermsDays: Number(editingCustomer.paymentTermsDays) || 30,
      dueDaysGrace: Number(editingCustomer.dueDaysGrace) || 7,
      createdAt: editingCustomer.createdAt || now,
      updatedAt: now
    };

    const existingIdx = customerAccounts.findIndex(c => c.id === customerToSave.id);
    let updatedAccounts: CustomerAccount[];
    if (existingIdx !== -1) {
      updatedAccounts = [...customerAccounts];
      updatedAccounts[existingIdx] = customerToSave;
    } else {
      updatedAccounts = [customerToSave, ...customerAccounts];
    }

    onUpdateCustomerAccounts(updatedAccounts);
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
    showToast(`Dealer account "${customerToSave.companyName}" saved!`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Top Admin Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & System Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MagadhSparshLogo size="sm" showSubtitle={false} isDark={true} />
              <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-900/80 text-purple-200 border border-purple-700/60 text-[10px] font-black tracking-wider uppercase">
                    Admin Console
                  </span>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    Wholesale Dealership Management
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="flex items-center space-x-3 justify-between md:justify-end">
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">Super Admin</span>
              <span className="text-slate-600">•</span>
              <span>Himanshu Verma</span>
            </div>
          </div>
        </div>

        {/* Primary Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/80 flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setAdminTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
              adminTab === 'overview'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setAdminTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
              adminTab === 'products'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Inventory ({products.length})</span>
            {metrics.lowStockCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/40 font-black">
                {metrics.lowStockCount} low
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
              adminTab === 'orders'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Live Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('customers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
              adminTab === 'customers'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Dealer Accounts ({customerAccounts.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('payments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
              adminTab === 'payments'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments & Ledger ({payments.length})</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Prominent Admin Static Overview Heading Section with White Icons & Black Background */}
        <div className="w-full flex justify-center py-1">
          <AdminSummaryBar
            orders={orders}
            payments={payments}
            customerAccounts={customerAccounts}
            onSelectTab={(tab) => setAdminTab(tab)}
            onRefreshData={() => showToast('Admin financial overview metrics refreshed')}
          />
        </div>

        {/* 1. OVERVIEW & ANALYTICS TAB */}
        {adminTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top KPI Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Revenue */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-16 h-16 text-emerald-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Paid Revenue</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
                  ₹{metrics.totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center text-xs text-slate-400 mt-2 space-x-1.5">
                  <span className="text-amber-400 font-bold">₹{metrics.pendingRevenue.toLocaleString('en-IN')}</span>
                  <span>pending settlement</span>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShoppingCart className="w-16 h-16 text-purple-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders Processed</span>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-2">
                  {metrics.totalOrders}
                </div>
                <div className="flex items-center text-xs text-slate-400 mt-2 space-x-1.5">
                  <span className="text-purple-300 font-bold">{metrics.totalUnitsSold}</span>
                  <span>tyres booked in total</span>
                </div>
              </div>

              {/* Inventory Valuation */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Package className="w-16 h-16 text-blue-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Valuation</span>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">
                  ₹{metrics.inventoryValuation.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center text-xs text-slate-400 mt-2 space-x-1.5">
                  <span className="text-blue-300 font-bold">{metrics.totalProducts}</span>
                  <span>active tyre SKUs in warehouse</span>
                </div>
              </div>

              {/* Stock Alerts */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <AlertTriangle className="w-16 h-16 text-amber-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Health</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
                  {metrics.lowStockCount} Low
                </div>
                <div className="flex items-center text-xs text-slate-400 mt-2 space-x-1.5">
                  <span className="text-red-400 font-bold">{metrics.outOfStockCount}</span>
                  <span>SKUs currently out of stock</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Actions Panel */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  <span>Administrative Operations</span>
                </h3>
                
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setEditingProduct({
                        brand: 'Apollo',
                        category: 'Truck',
                        tireType: 'Radial',
                        width: 295,
                        aspectRatio: 90,
                        rimSize: 20,
                        speedRating: 'K',
                        loadIndex: 154,
                        gstRate: 18,
                        minStockLevel: 5,
                        stock: 20,
                        warrantyYears: 3,
                        terrain: 'Highway',
                        status: 'Active'
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="w-full p-3.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <Plus className="w-4 h-4 text-purple-400" />
                      <span>Add New Tyre to Catalogue</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingCustomer({
                        accountStatus: 'Active',
                        pricingType: 'gst',
                        creditEnabled: true,
                        creditLimit: 500000,
                        paymentTermsDays: 30,
                        gstType: 'Regular'
                      });
                      setIsCustomerModalOpen(true);
                    }}
                    className="w-full p-3.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 font-bold text-xs flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span>Register New Dealer Account</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setAdminTab('orders')}
                    className="w-full p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span>Manage Dispatches & Delivery Status</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-purple-400" />
                    <span>Recent Customer Orders</span>
                  </h3>
                  <button
                    onClick={() => setAdminTab('orders')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1"
                  >
                    <span>View all ({orders.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No orders placed yet. Place an order from the Customer Interface to see it live here.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {orders.slice(0, 4).map(o => (
                      <div
                        key={o.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-white">#{o.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              o.paymentStatus === 'Paid'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {o.paymentStatus}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                              {o.orderStatus}
                            </span>
                          </div>
                          <div className="text-slate-400 mt-1">
                            {o.customerName} {o.companyName ? `• ${o.companyName}` : ''} • {o.items.length} items
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 self-end sm:self-center">
                          <span className="font-black text-sm text-slate-200">
                            ₹{o.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => onViewInvoice(o)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-1 border border-slate-700 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCT & INVENTORY MANAGEMENT TAB */}
        {adminTab === 'products' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Action Bar: Search, Category Filters, Add Button */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Search Input */}
                <div className="relative flex-1">
                  <CustomSearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name, brand, SKU or size..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-hidden"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs outline-hidden"
                >
                  <option value="All">All Categories</option>
                  <option value="Truck">Commercial & Truck</option>
                  <option value="Car">Car & SUV</option>
                  <option value="Bike">Two-Wheeler</option>
                  <option value="Radial">Radial</option>
                  <option value="Non-Radial">Non-Radial</option>
                </select>

                {/* Stock Status Filter */}
                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs outline-hidden"
                >
                  <option value="All">All Stock Status</option>
                  <option value="Active">Active In-Stock</option>
                  <option value="Low Stock">Low Stock (≤5)</option>
                  <option value="Out of Stock">Out of Stock (0)</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Add New Product Button */}
              <button
                onClick={() => {
                  setEditingProduct({
                    brand: 'Apollo',
                    category: 'Truck',
                    tireType: 'Radial',
                    width: 295,
                    aspectRatio: 90,
                    rimSize: 20,
                    speedRating: 'K',
                    loadIndex: 154,
                    gstRate: 18,
                    minStockLevel: 5,
                    stock: 20,
                    warrantyYears: 3,
                    terrain: 'Highway',
                    status: 'Active'
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Tyre</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Product / Brand</th>
                      <th className="px-4 py-3.5">Size / Type</th>
                      <th className="px-4 py-3.5">Dealer Price</th>
                      <th className="px-4 py-3.5">MRP</th>
                      <th className="px-4 py-3.5">Stock Level</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          No products found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(p => {
                        const isLow = (p.stock || 0) <= (p.minStockLevel || 5);
                        const isOut = (p.stock || 0) === 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-3">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1 border border-slate-800 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0">
                                    TYRE
                                  </div>
                                )}
                                <div>
                                  <div className="font-extrabold text-white">{p.name}</div>
                                  <div className="text-slate-400 text-[11px]">
                                    {p.brand} • {p.sku || p.productCode || 'Standard'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="font-bold text-slate-200">
                                {p.width}/{p.aspectRatio} R{p.rimSize}
                              </div>
                              <div className="text-slate-400 text-[10px]">
                                {p.tireType || 'Radial'} • {p.speedRating || 'K'} {p.loadIndex || 154}
                              </div>
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="font-extrabold text-emerald-400">
                                ₹{(p.dealerPrice || p.bulkPrice || p.price).toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] text-slate-400">+{p.gstRate || 18}% GST</div>
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="font-bold text-slate-400 line-through">
                                ₹{(p.mrp || p.price).toLocaleString('en-IN')}
                              </div>
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className={`font-black ${
                                  isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-slate-200'
                                }`}>
                                  {p.stock || 0} Units
                                </span>
                                {/* Quick stock adjusters */}
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => onAddOrUpdateProduct({ ...p, stock: Math.max(0, (p.stock || 0) - 1) })}
                                    className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs"
                                    title="Decrease stock"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => onAddOrUpdateProduct({ ...p, stock: (p.stock || 0) + 1 })}
                                    className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs"
                                    title="Increase stock"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                p.status === 'Archived'
                                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                  : isOut
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : isLow
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}>
                                {p.status === 'Archived' ? 'Archived' : isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Active'}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 transition-colors"
                                  title="Edit tyre"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => onArchiveProduct(p.id)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 transition-colors"
                                  title={p.status === 'Archived' ? 'Unarchive' : 'Archive tyre'}
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setProductToDelete(p)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 transition-colors"
                                  title="Delete tyre"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. ORDERS MANAGEMENT TAB */}
        {adminTab === 'orders' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Orders Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <CustomSearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order #, customer, phone, GSTIN..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs outline-hidden"
              >
                <option value="All">All Order Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Warehouse Processing">Warehouse Processing</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Order # / Date</th>
                      <th className="px-4 py-3.5">Customer / Dealership</th>
                      <th className="px-4 py-3.5">Items Ordered</th>
                      <th className="px-4 py-3.5">Amount</th>
                      <th className="px-4 py-3.5">Payment</th>
                      <th className="px-4 py-3.5">Dispatch / Status</th>
                      <th className="px-4 py-3.5 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          No orders found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-extrabold text-white">#{o.orderNumber}</div>
                            <div className="text-[10px] text-slate-400">{o.date}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-200">{o.customerName}</div>
                            <div className="text-[11px] text-slate-400">
                              {o.companyName || o.phone || o.customerEmail}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              {o.items.map((item, idx) => (
                                <div key={idx} className="text-[11px] text-slate-300 flex items-center space-x-1">
                                  <span className="font-black text-purple-400">{item.quantity}x</span>
                                  <span className="truncate max-w-[180px]">{item.product.name}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-black text-emerald-400 text-sm">
                              ₹{o.totalAmount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400">{o.paymentMethod}</div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              o.paymentStatus === 'Paid'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <select
                              value={o.orderStatus}
                              onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as Order['orderStatus'])}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-purple-300 outline-hidden cursor-pointer"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Warehouse Processing">Warehouse Processing</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => onViewInvoice(o)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 ml-auto border border-slate-700 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-purple-400" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. DEALER & CUSTOMER ACCOUNTS TAB */}
        {adminTab === 'customers' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <CustomSearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search dealer by name, company, GSTIN, phone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
              </div>

              <button
                onClick={() => {
                  setEditingCustomer({
                    accountStatus: 'Active',
                    pricingType: 'gst',
                    creditEnabled: true,
                    creditLimit: 500000,
                    paymentTermsDays: 30,
                    gstType: 'Regular'
                  });
                  setIsCustomerModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Register Dealer</span>
              </button>
            </div>

            {/* Customers Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Dealership / Contact</th>
                      <th className="px-4 py-3.5">GSTIN</th>
                      <th className="px-4 py-3.5">Location</th>
                      <th className="px-4 py-3.5">Credit Limit</th>
                      <th className="px-4 py-3.5">Terms</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          No dealer accounts found. Click "Register Dealer" to add one.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(c => (
                        <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-extrabold text-white">{c.companyName}</div>
                            <div className="text-[11px] text-slate-400">
                              {c.customerName || c.username} • {c.phone}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-mono text-purple-300 font-bold">{c.gstNumber}</span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                            {c.deliveryLocation || 'Bihar'}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-bold text-emerald-400">
                              ₹{(c.creditLimit || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Used: ₹{(c.usedCredit || 0).toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                            {c.paymentTermsDays || 30} Days Net
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              c.accountStatus === 'Active' || c.accountStatus === 'VIP'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}>
                              {c.accountStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setEditingCustomer(c);
                                setIsCustomerModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-colors"
                              title="Edit Dealer Account"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. PAYMENTS & AUDIT LEDGER TAB */}
        {adminTab === 'payments' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Payments Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Payments Recorded</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{payments.reduce((s, p) => (p.status === 'Success' ? s + p.amount : s), 0).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-1">{payments.length} transactions in ledger</div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Invoices</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  ₹{orders.filter(o => o.paymentStatus === 'Pending').reduce((s, o) => s + o.totalAmount, 0).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {orders.filter(o => o.paymentStatus === 'Pending').length} unpaid orders
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total GST Liability</span>
                <div className="text-2xl font-black text-blue-400 mt-1">
                  ₹{orders.reduce((s, o) => s + (o.gstAmount || 0), 0).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-1">18% standard tyre rate</div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Payment Ref / Date</th>
                      <th className="px-4 py-3.5">Order #</th>
                      <th className="px-4 py-3.5">Customer Name</th>
                      <th className="px-4 py-3.5">Payment Method</th>
                      <th className="px-4 py-3.5">Amount</th>
                      <th className="px-4 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">
                          No payment transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map(p => (
                        <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-extrabold text-white font-mono">{p.paymentId}</div>
                            <div className="text-[10px] text-slate-400">{p.date}</div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap font-bold text-purple-300">
                            #{p.orderId}
                          </td>

                          <td className="px-4 py-3.5 text-slate-200">
                            {p.customerName}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                            {p.method}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap font-black text-emerald-400 text-sm">
                            ₹{p.amount.toLocaleString('en-IN')}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              p.status === 'Success'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {editingProduct.id ? 'Edit Tyre Product' : 'Add New Tyre to Catalogue'}
              </h3>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. 295/90 R20 Radial Commercial"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Brand *</label>
                  <select
                    value={editingProduct.brand || 'Apollo'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  >
                    <option value="Apollo">Apollo</option>
                    <option value="MRF">MRF</option>
                    <option value="CEAT">CEAT</option>
                    <option value="JK Tyre">JK Tyre</option>
                    <option value="Bridgestone">Bridgestone</option>
                    <option value="Michelin">Michelin</option>
                    <option value="Goodyear">Goodyear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={editingProduct.width || 295}
                    onChange={(e) => setEditingProduct({ ...editingProduct, width: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Aspect Ratio</label>
                  <input
                    type="number"
                    value={editingProduct.aspectRatio || 90}
                    onChange={(e) => setEditingProduct({ ...editingProduct, aspectRatio: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Rim Size (Inches)</label>
                  <input
                    type="number"
                    value={editingProduct.rimSize || 20}
                    onChange={(e) => setEditingProduct({ ...editingProduct, rimSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Dealer Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.dealerPrice || editingProduct.bulkPrice || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      dealerPrice: Number(e.target.value),
                      bulkPrice: Number(e.target.value)
                    })}
                    placeholder="26500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.mrp || editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      mrp: Number(e.target.value),
                      price: Number(e.target.value)
                    })}
                    placeholder="31500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={editingProduct.stock !== undefined ? editingProduct.stock : 20}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Type</label>
                  <select
                    value={editingProduct.tireType || 'Radial'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tireType: e.target.value as 'Radial' | 'Non-Radial' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  >
                    <option value="Radial">Radial</option>
                    <option value="Non-Radial">Non-Radial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'Truck'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Car">Car / SUV</option>
                    <option value="Bike">Two-Wheeler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status</label>
                  <select
                    value={editingProduct.status || 'Active'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={editingProduct.minStockLevel || 5}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStockLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description / Application</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="e.g. Premium heavy duty steer/drive tyre with reinforced casing..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-lg shadow-purple-900/40"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT DEALER MODAL */}
      {isCustomerModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {editingCustomer.id ? 'Edit Dealer Account' : 'Register New Dealer'}
              </h3>
              <button
                onClick={() => {
                  setIsCustomerModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Company / Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.companyName || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                    placeholder="e.g. Patna Roadways Logistics"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={editingCustomer.customerName || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    placeholder="+91 98351 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    placeholder="dealer@logistics.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={editingCustomer.gstNumber || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="10AAAAA0000A1Z5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-purple-300 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Delivery Location</label>
                  <input
                    type="text"
                    value={editingCustomer.deliveryLocation || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, deliveryLocation: e.target.value })}
                    placeholder="Patna, Bihar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={editingCustomer.creditLimit || 500000}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Payment Days</label>
                  <input
                    type="number"
                    value={editingCustomer.paymentTermsDays || 30}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, paymentTermsDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status</label>
                  <select
                    value={editingCustomer.accountStatus || 'Active'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, accountStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="VIP">VIP</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomerModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-lg shadow-blue-900/40"
                >
                  Save Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Delete Product?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <span className="text-white font-bold">{productToDelete.name}</span> from the tyre catalogue?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-900/40"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
