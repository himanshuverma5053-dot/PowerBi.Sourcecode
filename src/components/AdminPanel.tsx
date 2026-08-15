import React, { useState } from 'react';
import { TyreProduct, Order, PaymentRecord, Coupon, VehicleCategory, TerrainType, ProductComponentConfig, CustomerAccount, CustomerPricingType } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  BarChart3, Package, ShoppingBag, CreditCard, Plus, Minus,
  Edit2, CheckCircle2, ShieldCheck, Search, FileText, RefreshCw, AlertCircle,
  Layers, Grid, List, Zap, Users, UserPlus, UserCheck, Copy, Check, Lock, Mail, Phone, Building, MapPin,
  Trash2, Archive, CopyPlus, Tag, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, ArrowUpDown, X, Eye, ShieldAlert,
  RotateCcw, Percent, DollarSign, PackageCheck, Sliders, Sparkles, BadgePercent, Layers3, SlidersHorizontal
} from 'lucide-react';
import { PaymentIntegrationsSpace } from './PaymentIntegrationsSpace';
import { LogoManagementSpace } from './LogoManagementSpace';
import { TyreLoader } from './TyreLoader';
import { supabase } from '../supabaseClient';
import { getCustomerEffectivePrice, DEFAULT_CUSTOMER_ACCOUNTS } from '../utils/customerPricing';
import { safeSetLocalStorage } from '../utils/storage';

interface AdminPanelProps {
  products: TyreProduct[];
  isProductsLoading?: boolean;
  orders: Order[];
  payments: PaymentRecord[];
  coupons: Coupon[];
  customerAccounts?: CustomerAccount[];
  onUpdateCustomerAccounts?: (accounts: CustomerAccount[]) => void;
  onAddOrUpdateProduct: (product: Partial<TyreProduct>) => void;
  onDeleteProduct?: (productId: string) => void;
  onArchiveProduct?: (productId: string, newStatus?: 'Active' | 'Inactive' | 'Archived') => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['orderStatus']) => void;
  onViewInvoice: (order: Order) => void;
  showToast?: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  isProductsLoading,
  orders,
  payments,
  coupons,
  customerAccounts: propsCustomerAccounts,
  onUpdateCustomerAccounts,
  onAddOrUpdateProduct,
  onDeleteProduct,
  onArchiveProduct,
  onUpdateOrderStatus,
  onViewInvoice,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'payments' | 'coupons' | 'gateways' | 'users' | 'logo'>('products');

  // Dedicated Product Management State
  const [pSearch, setPSearch] = useState('');
  const [pCategoryFilter, setPCategoryFilter] = useState<string>('all');
  const [pBrandFilter, setPBrandFilter] = useState<string>('all');
  const [pStatusFilter, setPStatusFilter] = useState<string>('all');
  const [pStockFilter, setPStockFilter] = useState<string>('all');
  const [pSortBy, setPSortBy] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc' | 'newest'>('newest');
  const [pViewMode, setPViewMode] = useState<'table' | 'grid'>('table');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<TyreProduct> | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'general' | 'specs' | 'pricing' | 'inventory' | 'media'>('general');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState<string>('MRF');
  const [formCategory, setFormCategory] = useState<VehicleCategory>('Car');
  const [formVehicleType, setFormVehicleType] = useState('Sedan / Hatchback');
  const [formTyreSize, setFormTyreSize] = useState('195/65 R15');
  const [formWidth, setFormWidth] = useState(195);
  const [formAspectRatio, setFormAspectRatio] = useState(65);
  const [formRimSize, setFormRimSize] = useState(15);
  const [formSpeedRating, setFormSpeedRating] = useState('H');
  const [formLoadIndex, setFormLoadIndex] = useState(91);
  const [formMrp, setFormMrp] = useState(4850);
  const [formDealerPrice, setFormDealerPrice] = useState(4350);
  const [formGstRate, setFormGstRate] = useState(18); // Default 18% as requested
  const [formStock, setFormStock] = useState(25);
  const [formMinStockLevel, setFormMinStockLevel] = useState(10);
  const [formSku, setFormSku] = useState('');
  const [formProductCode, setFormProductCode] = useState('');
  const [formHsnCode, setFormHsnCode] = useState('40111010');
  const [formPattern, setFormPattern] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Archived'>('Active');
  const [formDescription, setFormDescription] = useState('');
  const [formTerrain, setFormTerrain] = useState<TerrainType>('Highway');
  const [formWarrantyYears, setFormWarrantyYears] = useState(5);
  const [formFuelEfficiency, setFormFuelEfficiency] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [formWetGrip, setFormWetGrip] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formNoiseDb, setFormNoiseDb] = useState(68);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formEvReady, setFormEvReady] = useState(false);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formNewImageUrl, setFormNewImageUrl] = useState('');
  const [formTags, setFormTags] = useState<string[]>(['Tubeless']);
  const [formNewTagInput, setFormNewTagInput] = useState('');
  const [formComponents, setFormComponents] = useState<ProductComponentConfig[]>([]);
  const [formIncludedComponents, setFormIncludedComponents] = useState<string>('Tube & Flap');
  const [formTireType, setFormTireType] = useState<'Radial' | 'Non-Radial'>('Radial');
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion Confirm State
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<TyreProduct | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // Customer Account Management State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [cUsername, setCUsername] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('Magadh@123');
  const [cCompanyName, setCCompanyName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cGstNumber, setCGstNumber] = useState('');
  const [cDeliveryLocation, setCDeliveryLocation] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cPricingType, setCPricingType] = useState<CustomerPricingType>('gst');
  const [cCreditEnabled, setCCreditEnabled] = useState(false);
  const [cCreditLimit, setCCreditLimit] = useState(250000);
  const [cLoading, setCLoading] = useState(false);
  const [cError, setCError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Customer Search & Filtering Filters
  const [cPricingFilter, setCPricingFilter] = useState<'all' | 'gst' | 'credit' | 'custom'>('all');
  const [cStatusFilter, setCStatusFilter] = useState<'all' | 'Active' | 'VIP' | 'Suspended' | 'Pending'>('all');
  const [cCreditFilter, setCCreditFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Dedicated Customer Profile Editor State
  const [editingCustomer, setEditingCustomer] = useState<CustomerAccount | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'info' | 'pricing' | 'products' | 'credit'>('info');
  const [editorProductSearch, setEditorProductSearch] = useState('');

  // Registered Customer Accounts List
  const [internalCustomerAccounts, setInternalCustomerAccounts] = useState<CustomerAccount[]>(() => {
    try {
      const saved = localStorage.getItem('magadh_customer_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const customerAccounts = propsCustomerAccounts || internalCustomerAccounts;

  const setCustomerAccounts = (updatedList: CustomerAccount[]) => {
    if (onUpdateCustomerAccounts) {
      onUpdateCustomerAccounts(updatedList);
    } else {
      setInternalCustomerAccounts(updatedList);
    }
    safeSetLocalStorage('magadh_customer_accounts', updatedList);
  };

  // Open Customer Profile Editor Handler
  const handleOpenCustomerEditor = (cust: CustomerAccount) => {
    const clone: CustomerAccount = {
      id: cust.id,
      username: cust.username || '',
      customerName: cust.customerName || cust.username || '',
      companyName: cust.companyName || '',
      email: cust.email || '',
      phone: cust.phone || '',
      gstNumber: cust.gstNumber || '',
      gstType: cust.gstType || (cust.gstNumber ? 'Regular' : 'Unregistered'),
      billingState: cust.billingState || 'Bihar (10)',
      deliveryLocation: cust.deliveryLocation || '',
      address: cust.address || '',
      accountStatus: cust.accountStatus || 'Active',
      pricingType: cust.pricingType || 'gst',
      overallDiscountPercent: cust.overallDiscountPercent || 0,
      productVisibilityMode: cust.productVisibilityMode || 'all',
      allowedProductIds: cust.allowedProductIds || products.map(p => p.id),
      productOverrides: { ...(cust.productOverrides || {}) },
      creditEnabled: cust.creditEnabled ?? false,
      creditLimit: cust.creditLimit || 0,
      usedCredit: cust.usedCredit || 0,
      paymentTermsDays: cust.paymentTermsDays || 30,
      dueDaysGrace: cust.dueDaysGrace || 5,
      createdAt: cust.createdAt || new Date().toISOString()
    };
    setEditingCustomer(clone);
    setProfileActiveTab('info');
    setEditorProductSearch('');
  };

  // Save Customer Profile Handler
  const handleSaveCustomerProfile = () => {
    if (!editingCustomer) return;
    const updatedCustomer: CustomerAccount = {
      ...editingCustomer,
      updatedAt: new Date().toISOString()
    };

    const updatedList = customerAccounts.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
    setCustomerAccounts(updatedList);

    safeSetLocalStorage('magadh_customer_accounts', updatedList);
    const userKey1 = `user_profile_${updatedCustomer.username.toLowerCase()}`;
    const userKey2 = `user_profile_${updatedCustomer.email.toLowerCase().split('@')[0]}`;
    safeSetLocalStorage(userKey1, updatedCustomer);
    safeSetLocalStorage(userKey2, updatedCustomer);

    if (showToast) {
      showToast(`Updated customer profile & pricing controls for "${updatedCustomer.companyName || updatedCustomer.username}"!`);
    }
    setEditingCustomer(null);
  };

  // Reset Pricing for Customer to Standard Default
  const handleResetCustomerPricingToDefault = () => {
    if (!editingCustomer) return;
    setEditingCustomer(prev => {
      if (!prev) return null;
      return {
        ...prev,
        pricingType: 'gst',
        overallDiscountPercent: 0,
        productOverrides: {}
      };
    });
    if (showToast) {
      showToast(`Pricing controls reset to standard defaults for "${editingCustomer.username}".`);
    }
  };

  // Reset Single Product Override
  const handleResetSingleProductOverride = (productId: string) => {
    if (!editingCustomer) return;
    setEditingCustomer(prev => {
      if (!prev) return null;
      const newOverrides = { ...prev.productOverrides };
      delete newOverrides[productId];
      return {
        ...prev,
        productOverrides: newOverrides
      };
    });
  };

  // Update Specific Product Override Field
  const handleUpdateProductOverrideField = (productId: string, field: 'customPrice' | 'discountPercent' | 'isExcluded', value: any) => {
    if (!editingCustomer) return;
    setEditingCustomer(prev => {
      if (!prev) return null;
      const currentOverrides = prev.productOverrides || {};
      const existing = currentOverrides[productId] || { productId };
      const updated = {
        ...existing,
        [field]: value
      };
      return {
        ...prev,
        productOverrides: {
          ...currentOverrides,
          [productId]: updated
        }
      };
    });
  };

  const handleCreateCustomerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCError(null);

    if (!cUsername || !cEmail || !cPassword) {
      setCError('Username, Email, and Password are required.');
      return;
    }

    setCLoading(true);

    try {
      // 1. Register with Supabase Auth
      const { error: signUpErr } = await supabase.auth.signUp({
        email: cEmail,
        password: cPassword,
        options: {
          data: {
            username: cUsername,
            role: 'customer'
          }
        }
      });

      if (signUpErr && !signUpErr.message.includes('already registered')) {
        setCError(signUpErr.message);
        setCLoading(false);
        return;
      }

      // 2. Add to Customer Accounts List
      const newCustRecord: CustomerAccount = {
        id: 'cust_' + Date.now(),
        username: cUsername,
        customerName: cUsername,
        companyName: cCompanyName || 'Standard Customer',
        email: cEmail,
        phone: cPhone || 'N/A',
        gstNumber: cGstNumber || 'N/A',
        gstType: cGstNumber ? 'Regular' : 'Unregistered',
        billingState: 'Bihar (10)',
        deliveryLocation: cDeliveryLocation || 'N/A',
        address: cAddress || 'N/A',
        accountStatus: 'Active',
        pricingType: cPricingType,
        overallDiscountPercent: 0,
        productVisibilityMode: 'all',
        allowedProductIds: products.map(p => p.id),
        productOverrides: {},
        creditEnabled: cCreditEnabled,
        creditLimit: cCreditEnabled ? cCreditLimit : 0,
        usedCredit: 0,
        paymentTermsDays: 30,
        dueDaysGrace: 5,
        createdAt: new Date().toISOString()
      };

      const userKey1 = `user_profile_${cUsername.toLowerCase()}`;
      const userKey2 = `user_profile_${cEmail.toLowerCase().split('@')[0]}`;
      safeSetLocalStorage(userKey1, newCustRecord);
      safeSetLocalStorage(userKey2, newCustRecord);

      const updatedList = [newCustRecord, ...customerAccounts];
      setCustomerAccounts(updatedList);
      safeSetLocalStorage('magadh_customer_accounts', updatedList);

      if (showToast) {
        showToast(`Customer account "${cUsername}" created successfully with ${cPricingType.toUpperCase()} Pricing!`);
      }

      setIsCustomerModalOpen(false);
      setCUsername('');
      setCEmail('');
      setCPassword('Magadh@123');
      setCCompanyName('');
      setCPhone('');
      setCGstNumber('');
      setCDeliveryLocation('');
      setCAddress('');
      setCPricingType('gst');
      setCCreditEnabled(false);
      setCCreditLimit(250000);
    } catch (err: any) {
      setCError(err?.message || 'Failed to create customer account');
    } finally {
      setCLoading(false);
    }
  };

  // Analytics & Inventory Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalTyresSold = orders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
  const totalProductsCount = products.length;
  const activeProductsCount = products.filter(p => (p.status || 'Active') === 'Active').length;
  const lowStockCount = products.filter(p => p.stock <= (p.minStockLevel ?? 5) && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const archivedProductsCount = products.filter(p => p.status === 'Archived').length;
  const totalInventoryQuantity = products.reduce((sum, p) => sum + p.stock, 0);

  // Quick Quantity Adjustment Handlers
  const handleAdjustQuantity = (prod: TyreProduct, delta: number) => {
    const newQuantity = Math.max(0, prod.stock + delta);
    onAddOrUpdateProduct({ ...prod, stock: newQuantity });
  };

  const handleSetQuantity = (prod: TyreProduct, newQuantity: number) => {
    const safeQty = isNaN(newQuantity) ? 0 : Math.max(0, newQuantity);
    onAddOrUpdateProduct({ ...prod, stock: safeQty });
  };

  // Filtered and Sorted Product List
  const filteredProducts = products.filter(prod => {
    const q = pSearch.toLowerCase().trim();
    const matchesSearch = !q || (
      prod.name.toLowerCase().includes(q) ||
      prod.brand.toLowerCase().includes(q) ||
      (prod.sku && prod.sku.toLowerCase().includes(q)) ||
      (prod.productCode && prod.productCode.toLowerCase().includes(q)) ||
      (prod.pattern && prod.pattern.toLowerCase().includes(q)) ||
      (prod.tags && prod.tags.some(t => t.toLowerCase().includes(q))) ||
      `${prod.width}/${prod.aspectRatio} R${prod.rimSize}`.toLowerCase().includes(q)
    );

    const matchesCategory = pCategoryFilter === 'all' || prod.category === pCategoryFilter;
    const matchesBrand = pBrandFilter === 'all' || prod.brand === pBrandFilter;
    const prodStatus = prod.status || 'Active';
    const matchesStatus = pStatusFilter === 'all' || prodStatus === pStatusFilter;

    const minStock = prod.minStockLevel ?? 5;
    const matchesStock = pStockFilter === 'all' ||
      (pStockFilter === 'in' && prod.stock > minStock) ||
      (pStockFilter === 'low' && prod.stock <= minStock && prod.stock > 0) ||
      (pStockFilter === 'out' && prod.stock === 0);

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus && matchesStock;
  }).sort((a, b) => {
    if (pSortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (pSortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (pSortBy === 'price-asc') return (a.mrp || a.price) - (b.mrp || b.price);
    if (pSortBy === 'price-desc') return (b.mrp || b.price) - (a.mrp || a.price);
    if (pSortBy === 'stock-asc') return a.stock - b.stock;
    if (pSortBy === 'stock-desc') return b.stock - a.stock;
    if (pSortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
    return 0;
  });

  // Pagination Math
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  // Modal Opener & Form Handlers
  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('MRF');
    setFormCategory('Car');
    setFormWidth(195);
    setFormAspectRatio(65);
    setFormRimSize(15);
    setFormSpeedRating('H');
    setFormLoadIndex(91);
    setFormMrp(4850);
    setFormDealerPrice(4350);
    setFormGstRate(18); // Default 18% as requested
    setFormStock(25);
    setFormMinStockLevel(10);
    setFormSku(`SKU-MRF-${Math.floor(100 + Math.random() * 900)}`);
    setFormProductCode(`PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormHsnCode('40111010');
    setFormPattern('ZTX Super');
    setFormStatus('Active');
    setFormDescription('High-performance radial tyre designed for superior grip, noise reduction, and high fuel savings on Indian roads.');
    setFormTerrain('Highway');
    setFormWarrantyYears(5);
    setFormFuelEfficiency('B');
    setFormWetGrip('A');
    setFormNoiseDb(68);
    setFormFeatured(true);
    setFormEvReady(false);
    setFormImages(['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800']);
    setFormTags(['Tubeless', 'Bestseller', 'Radial']);
    setFormComponents([]);
    setFormIncludedComponents('Tube & Flap');
    setFormTireType('Radial');
    setFormError(null);
    setActiveModalTab('general');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: TyreProduct) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormBrand(prod.brand);
    setFormCategory(prod.category);
    setFormWidth(prod.width);
    setFormAspectRatio(prod.aspectRatio);
    setFormRimSize(prod.rimSize);
    setFormSpeedRating(prod.speedRating || 'H');
    setFormLoadIndex(prod.loadIndex || 91);
    setFormMrp(prod.mrp || prod.price || 4850);
    setFormDealerPrice(prod.dealerPrice || prod.bulkPrice || 4350);
    setFormGstRate(prod.gstRate ?? 18);
    setFormStock(prod.stock);
    setFormMinStockLevel(prod.minStockLevel ?? 5);
    setFormSku(prod.sku || `SKU-${prod.brand.substring(0,3).toUpperCase()}-${prod.width}${prod.aspectRatio}R${prod.rimSize}`);
    setFormProductCode(prod.productCode || `PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormHsnCode(prod.hsnCode || '40111010');
    setFormPattern(prod.pattern || '');
    setFormStatus(prod.status || 'Active');
    setFormDescription(prod.description || '');
    setFormTerrain(prod.terrain || 'Highway');
    setFormWarrantyYears(prod.warrantyYears || 5);
    setFormFuelEfficiency(prod.fuelEfficiency || 'B');
    setFormWetGrip(prod.wetGrip || 'A');
    setFormNoiseDb(prod.noiseDb || 68);
    setFormFeatured(prod.featured || false);
    setFormEvReady(prod.evReady || false);
    setFormImages(prod.images && prod.images.length > 0 ? prod.images : [prod.image]);
    setFormTags(prod.tags || ['Tubeless']);
    setFormComponents(prod.components ? [...prod.components] : []);
    setFormIncludedComponents(prod.includedComponents || 'Tube & Flap');
    const rawT = String(prod.tireType || prod.tire_type || '').trim().toLowerCase();
    const resolvedType = (rawT === 'non-radial' || rawT === 'non radial' || rawT === 'non_radial' || rawT === 'bias') ? 'Non-Radial' : 'Radial';
    setFormTireType(resolvedType);
    setFormError(null);
    setActiveModalTab('general');
    setIsProductModalOpen(true);
  };

  const handleAddComponentRow = () => {
    const available = products.filter(p => p.id !== (editingProduct?.id || ''));
    const targetProd = available[0];

    const newRule: ProductComponentConfig = {
      id: `comp-rule-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: targetProd ? targetProd.id : `custom-${Date.now()}`,
      productName: targetProd ? targetProd.name : 'Heavy Duty Inner Tube / Valve / Flap',
      brand: targetProd ? targetProd.brand : (formBrand || 'MRF'),
      price: targetProd ? targetProd.price : 350,
      quantity: 1,
      isMandatory: false,
      defaultSelected: true
    };
    setFormComponents(prev => [...prev, newRule]);
  };

  const handleUpdateComponentRow = (id: string, field: keyof ProductComponentConfig, value: any) => {
    setFormComponents(prev => prev.map(comp => {
      if (comp.id === id) {
        const updated = { ...comp, [field]: value };
        if (field === 'productId') {
          if (value === 'custom') {
            updated.productId = `custom-${Date.now()}`;
            updated.productName = updated.productName || 'Custom Attached Accessory';
          } else {
            const selectedProd = products.find(p => p.id === value);
            if (selectedProd) {
              updated.productName = selectedProd.name;
              updated.brand = selectedProd.brand;
              updated.price = selectedProd.price;
            }
          }
        }
        return updated;
      }
      return comp;
    }));
  };

  const handleRemoveComponentRow = (id: string) => {
    setFormComponents(prev => prev.filter(c => c.id !== id));
  };

  const handleDuplicateProduct = (prod: TyreProduct) => {
    const duplicated: Partial<TyreProduct> = {
      ...prod,
      id: `tyre-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku || 'SKU'}-COPY`,
      productCode: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onAddOrUpdateProduct(duplicated);
    showToast?.(`Cloned SKU for "${prod.name}"`);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast?.('Please upload valid image files (JPG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setFormImages(prev => [...prev, evt.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast?.('Image uploaded successfully!');
  };

  const handleAddImageUrl = () => {
    if (!formNewImageUrl.trim()) return;
    setFormImages(prev => [...prev, formNewImageUrl.trim()]);
    setFormNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetMainImage = (index: number) => {
    setFormImages(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleAddTag = () => {
    if (!formNewTagInput.trim()) return;
    const tag = formNewTagInput.trim();
    if (!formTags.includes(tag)) {
      setFormTags(prev => [...prev, tag]);
    }
    setFormNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (formMrp <= 0 || formDealerPrice <= 0) {
      setFormError('MRP and Dealer Price must be greater than 0.');
      return;
    }
    if (formStock < 0) {
      setFormError('Stock Quantity cannot be negative.');
      return;
    }
    if (!formTireType || (formTireType !== 'Radial' && formTireType !== 'Non-Radial')) {
      setFormError('Tire Type is required. Please select Radial or Non-Radial.');
      return;
    }

    const mainImg = formImages.length > 0 ? formImages[0] : 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800';

    const productPayload: Partial<TyreProduct> = {
      id: editingProduct ? editingProduct.id : undefined,
      name: formName.trim(),
      brand: formBrand as any,
      category: formCategory,
      width: Number(formWidth),
      aspectRatio: Number(formAspectRatio),
      rimSize: Number(formRimSize),
      speedRating: formSpeedRating,
      loadIndex: Number(formLoadIndex),
      price: Number(formMrp),
      bulkPrice: Number(formDealerPrice),
      mrp: Number(formMrp),
      dealerPrice: Number(formDealerPrice),
      gstRate: Number(formGstRate),
      stock: Number(formStock),
      minStockLevel: Number(formMinStockLevel),
      image: mainImg,
      images: formImages.length > 0 ? formImages : [mainImg],
      terrain: formTerrain,
      warrantyYears: Number(formWarrantyYears),
      fuelEfficiency: formFuelEfficiency,
      wetGrip: formWetGrip,
      noiseDb: Number(formNoiseDb),
      description: formDescription,
      compatibleVehicles: editingProduct?.compatibleVehicles || ['Passenger Vehicles'],
      featured: formFeatured,
      evReady: formEvReady,
      hsnCode: formHsnCode || '40111010',
      sku: formSku || `SKU-${formBrand.substring(0,3).toUpperCase()}-${formWidth}${formAspectRatio}R${formRimSize}`,
      productCode: formProductCode || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      pattern: formPattern,
      status: formStatus,
      tags: formTags,
      components: formComponents,
      includedComponents: formIncludedComponents.trim() || 'Tube & Flap',
      tireType: formTireType,
      tire_type: formTireType,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddOrUpdateProduct(productPayload);
    setIsProductModalOpen(false);
    showToast?.(editingProduct ? `Updated "${formName}" successfully!` : `Added new product "${formName}" to catalog!`);
  };

  // Bulk Selection Helpers
  const toggleSelectAll = () => {
    if (selectedProductIds.length === paginatedProducts.length && paginatedProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(paginatedProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: 'Active' | 'Inactive' | 'Archived') => {
    selectedProductIds.forEach(id => {
      onArchiveProduct?.(id, status);
    });
    showToast?.(`Updated status to ${status} for ${selectedProductIds.length} products.`);
    setSelectedProductIds([]);
  };

  const handleBulkAddStock = (amount: number) => {
    selectedProductIds.forEach(id => {
      const prod = products.find(p => p.id === id);
      if (prod) {
        onAddOrUpdateProduct({ ...prod, stock: prod.stock + amount });
      }
    });
    showToast?.(`Added +${amount} stock to ${selectedProductIds.length} products.`);
    setSelectedProductIds([]);
  };

  const handleBulkDelete = () => {
    selectedProductIds.forEach(id => {
      onDeleteProduct?.(id);
    });
    showToast?.(`Deleted ${selectedProductIds.length} products.`);
    setSelectedProductIds([]);
    setIsBulkDeleteConfirmOpen(false);
  };

  const confirmDeleteProduct = () => {
    if (deleteConfirmProduct) {
      onDeleteProduct?.(deleteConfirmProduct.id);
      showToast?.(`Deleted product "${deleteConfirmProduct.name}".`);
      setDeleteConfirmProduct(null);
    }
  };

  return (
    <div className="py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
            <span>Magadh Enterprise Control Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-slate-900">
            Magadh Admin Management Panel
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time management for product stock, pricing, customer orders, GST invoices, payment logs, and store analytics.
          </p>
        </div>

        {/* Admin Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1.5 sm:p-2 rounded-2xl border border-slate-200 text-xs font-bold gap-1.5 w-full xl:w-auto shadow-inner">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics' ? 'bg-slate-900 text-white font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'products' ? 'bg-slate-900 text-white font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Inventory ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders' ? 'bg-slate-900 text-white font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'payments' ? 'bg-slate-900 text-white font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Payments ({payments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'gateways' ? 'bg-slate-900 text-white font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Payment Gateways</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'users' ? 'bg-slate-900 text-white font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Accounts ({customerAccounts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'logo' ? 'bg-slate-900 text-white font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Logo Management</span>
          </button>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-2xl font-black text-slate-900 font-display block">
                {formatCurrency(totalRevenue)}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                +18.4% vs last month
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Inventory Quantity
              </span>
              <span className="text-2xl font-black text-slate-900 font-display block">
                {totalInventoryQuantity} Units
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block">
                {products.length} Active Tyre SKUs
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Orders Processed
              </span>
              <span className="text-2xl font-black text-slate-900 font-display block">
                {orders.length}
              </span>
              <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">
                100% On-Time Dispatch
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Tyres Sold
              </span>
              <span className="text-2xl font-black text-indigo-950 font-display block">
                {totalTyresSold} Units
              </span>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                Avg 4.8 Tyres / Order
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Low Stock Alerts
              </span>
              <span className="text-2xl font-black text-amber-600 font-display block">
                {lowStockCount} Items
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block">
                Replenishment Needed
              </span>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 font-display">
              Recent Sales & Dispatch Overview
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase">
                    <th className="p-3 rounded-l-xl">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total (₹)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                  {orders.slice(0, 5).map((ord, idx) => (
                    <tr key={`${ord.id}-${ord.orderNumber}-${idx}`} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="p-3 font-bold">{ord.customerName}</td>
                      <td className="p-3 text-slate-500">{ord.date}</td>
                      <td className="p-3 font-black">{formatCurrency(ord.totalAmount)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-900 text-white">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => onViewInvoice(ord)}
                          className="text-slate-800 hover:underline font-bold"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Management Module */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Header & Main Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 font-display">
                  Product Management & Catalog
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  Admin Console Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, edit, archive, search, and manage products, stock quantities, dealer prices, and GST rates.
              </p>
            </div>

            <button
              onClick={openNewProductModal}
              className="px-5 py-2.5 rounded-xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white text-xs font-bold shadow-lg flex items-center space-x-2 transition-transform active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Quick Summary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-center">
              <span className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider">Total SKUs</span>
              <span className="text-xl font-black text-slate-950">{totalProductsCount} Products</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <span className="text-[10px] font-extrabold text-emerald-800 block uppercase tracking-wider">Active Catalog</span>
              <span className="text-xl font-black text-emerald-950">{activeProductsCount} Active</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
              <span className="text-[10px] font-extrabold text-amber-800 block uppercase tracking-wider">Low Stock (&le; Min)</span>
              <span className="text-xl font-black text-amber-900">{lowStockCount} SKUs</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-center">
              <span className="text-[10px] font-extrabold text-rose-800 block uppercase tracking-wider">Out of Stock</span>
              <span className="text-xl font-black text-rose-900">{outOfStockCount} SKUs</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-extrabold text-slate-600 block uppercase tracking-wider">Archived SKUs</span>
              <span className="text-xl font-black text-slate-800">{archivedProductsCount} Archived</span>
            </div>
          </div>

          {/* Search, Filter & Sort Controls Bar */}
          <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Live Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by SKU, Name, Brand, Code..."
                  value={pSearch}
                  onChange={(e) => { setPSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {pSearch && (
                  <button onClick={() => setPSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={pCategoryFilter}
                  onChange={(e) => { setPCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="all">All Vehicle Categories</option>
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Bike">Bike / Two-Wheeler</option>
                  <option value="Truck">Truck / Commercial</option>
                  <option value="EV">EV / Electric</option>
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <select
                  value={pBrandFilter}
                  onChange={(e) => { setPBrandFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="all">All Brands</option>
                  {['MRF', 'Apollo', 'CEAT', 'Michelin', 'Bridgestone', 'Goodyear', 'JK Tyre', 'Pirelli'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={pStatusFilter}
                  onChange={(e) => { setPStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="all">All Statuses (Active & Archived)</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                  <option value="Archived">Archived Only</option>
                </select>
              </div>
            </div>

            {/* Secondary Row: Stock Filter, Sort, View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                {/* Stock Quick Filters */}
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock:</span>
                <div className="flex bg-white p-1 rounded-xl border border-slate-300 text-xs font-bold space-x-1">
                  <button
                    onClick={() => { setPStockFilter('all'); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      pStockFilter === 'all' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    onClick={() => { setPStockFilter('in'); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      pStockFilter === 'in' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-emerald-900'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => { setPStockFilter('low'); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      pStockFilter === 'low' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 hover:text-amber-900'
                    }`}
                  >
                    Low Stock ({lowStockCount})
                  </button>
                  <button
                    onClick={() => { setPStockFilter('out'); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      pStockFilter === 'out' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:text-rose-900'
                    }`}
                  >
                    Out of Stock ({outOfStockCount})
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Sorting */}
                <div className="flex items-center space-x-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                  <select
                    value={pSortBy}
                    onChange={(e) => setPSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700"
                  >
                    <option value="newest">Newest First</option>
                    <option value="name-asc">Name (A &rarr; Z)</option>
                    <option value="name-desc">Name (Z &rarr; A)</option>
                    <option value="price-asc">Price (Low &rarr; High)</option>
                    <option value="price-desc">Price (High &rarr; Low)</option>
                    <option value="stock-asc">Stock (Low &rarr; High)</option>
                    <option value="stock-desc">Stock (High &rarr; Low)</option>
                  </select>
                </div>

                {/* View Mode Switcher */}
                <div className="flex bg-white p-1 rounded-xl border border-slate-300 space-x-1">
                  <button
                    onClick={() => setPViewMode('table')}
                    title="Table View"
                    className={`p-1.5 rounded-lg transition-all ${
                      pViewMode === 'table' ? 'bg-slate-900 text-white shadow' : 'text-slate-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPViewMode('grid')}
                    title="Grid View"
                    className={`p-1.5 rounded-lg transition-all ${
                      pViewMode === 'grid' ? 'bg-slate-900 text-white shadow' : 'text-slate-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedProductIds.length > 0 && (
            <div className="p-3 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                  {selectedProductIds.length} Selected
                </span>
                <span className="text-xs font-bold">Bulk Operations:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => handleBulkStatusChange('Active')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Set Active
                </button>
                <button
                  onClick={() => handleBulkStatusChange('Inactive')}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white"
                >
                  Set Inactive
                </button>
                <button
                  onClick={() => handleBulkStatusChange('Archived')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Archive Selected
                </button>
                <button
                  onClick={() => handleBulkAddStock(10)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                >
                  +10 Stock All
                </button>
                <button
                  onClick={() => setIsBulkDeleteConfirmOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected</span>
                </button>
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* TABLE VIEW */}
          {pViewMode === 'table' && (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase tracking-wider">
                    <th className="p-3.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-400 text-slate-900 focus:ring-slate-500 h-4 w-4"
                      />
                    </th>
                    <th className="p-3.5">Product & Identifiers</th>
                    <th className="p-3.5">Brand & Category</th>
                    <th className="p-3.5">MRP & Dealer Price</th>
                    <th className="p-3.5">GST Rate</th>
                    <th className="p-3.5 text-center min-w-[170px]">Stock Quantity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                  {isProductsLoading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center">
                        <TyreLoader text="Loading Products" subtext="Fetching inventory from database..." />
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 font-bold space-y-2">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm">
                          {products.length === 0
                            ? 'No products exist in the database. Click "+ Add New Product" above to add one.'
                            : 'No products found matching your active filter criteria.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((prod) => {
                      const isSelected = selectedProductIds.includes(prod.id);
                      const isLowStock = prod.stock <= (prod.minStockLevel ?? 5) && prod.stock > 0;
                      const isOutOfStock = prod.stock === 0;

                      return (
                        <tr
                          key={prod.id}
                          className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-slate-100' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectProduct(prod.id)}
                              className="rounded border-slate-400 text-slate-900 focus:ring-slate-500 h-4 w-4"
                            />
                          </td>

                          {/* Product Info */}
                          <td className="p-3.5">
                            <div className="flex items-center space-x-3">
                              <img
                                src={prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'}
                                alt={prod.name}
                                className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white shadow-sm shrink-0"
                              />
                              <div>
                                <span className="font-black text-slate-900 text-sm block line-clamp-1">{prod.name}</span>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px]">
                                  <span className="text-slate-900 font-bold font-mono">SKU: {prod.sku || 'N/A'}</span>
                                  <span className="text-slate-400">|</span>
                                  <span className="text-slate-500 font-bold">Size: {prod.width}/{prod.aspectRatio} R{prod.rimSize}</span>
                                  {prod.pattern && (
                                    <>
                                      <span className="text-slate-400">|</span>
                                      <span className="text-slate-700 font-semibold">{prod.pattern}</span>
                                    </>
                                  )}
                                </div>
                                {prod.components && prod.components.length > 0 && (
                                  <div className="mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-200 inline-flex items-center gap-1">
                                      <Layers className="w-3 h-3 text-indigo-700" />
                                      <span>{prod.components.length} Component{prod.components.length > 1 ? 's' : ''} Attached</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Brand & Category */}
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-950 font-black text-[10px] uppercase block w-fit mb-1">
                              {prod.brand}
                            </span>
                            <span className="text-xs font-bold text-slate-600 block">{prod.category}</span>
                          </td>

                          {/* Price */}
                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <div className="text-slate-900 font-black">
                                MRP: {formatCurrency(prod.mrp || prod.price)}
                              </div>
                              <div className="text-emerald-700 font-extrabold text-[11px]">
                                Dealer: {formatCurrency(prod.dealerPrice || prod.bulkPrice)}
                              </div>
                            </div>
                          </td>

                          {/* GST Rate */}
                          <td className="p-3.5">
                            <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-[11px]">
                              {prod.gstRate ?? 18}% GST
                            </span>
                          </td>

                          {/* Stock Control */}
                          <td className="p-3.5">
                            <div className="flex items-center justify-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <button
                                onClick={() => handleAdjustQuantity(prod, -1)}
                                title="Decrease Stock"
                                className="p-1 rounded-lg bg-white text-slate-900 hover:bg-slate-200 font-black border border-slate-300 shadow-sm"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={prod.stock}
                                onChange={(e) => handleSetQuantity(prod, parseInt(e.target.value))}
                                className="w-14 px-1 py-1 rounded-lg bg-white text-center font-black text-slate-900 border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                              />

                              <button
                                onClick={() => handleAdjustQuantity(prod, 1)}
                                title="Increase Stock"
                                className="p-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-black shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleAdjustQuantity(prod, 10)}
                                className="px-1.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-950 font-extrabold text-[10px]"
                              >
                                +10
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            {prod.status === 'Archived' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-800 border border-slate-300 inline-flex items-center space-x-1">
                                <Archive className="w-3 h-3 text-slate-600" />
                                <span>Archived</span>
                              </span>
                            ) : isOutOfStock ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-200 inline-flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                <span>Out of Stock</span>
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Low ({prod.stock})</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 inline-flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Active ({prod.stock})</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => openEditProductModal(prod)}
                                title="Edit Product"
                                className="p-1.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDuplicateProduct(prod)}
                                title="Clone Product SKU"
                                className="p-1.5 rounded-xl bg-indigo-100 text-indigo-900 hover:bg-indigo-200 font-bold"
                              >
                                <CopyPlus className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => onArchiveProduct?.(prod.id, prod.status === 'Archived' ? 'Active' : 'Archived')}
                                title={prod.status === 'Archived' ? 'Activate Product' : 'Archive Product'}
                                className="p-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmProduct(prod)}
                                title="Delete Product"
                                className="p-1.5 rounded-xl bg-rose-100 text-rose-900 hover:bg-rose-200 font-bold"
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
          )}

          {/* GRID VIEW */}
          {pViewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.length === 0 ? (
                <div className="col-span-full p-12 text-center text-slate-400 font-bold bg-slate-50/50 rounded-2xl">
                  No products found matching your filters.
                </div>
              ) : (
                paginatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-white uppercase">
                          {prod.brand}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          prod.status === 'Archived' ? 'bg-slate-200 text-slate-800' :
                          prod.stock === 0 ? 'bg-rose-100 text-rose-900' :
                          prod.stock <= (prod.minStockLevel ?? 5) ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          Stock: {prod.stock} units
                        </span>
                      </div>

                      <div className="flex space-x-3 items-center mb-3">
                        <img
                          src={prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'}
                          alt={prod.name}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white"
                        />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 font-display line-clamp-2">
                            {prod.name}
                          </h4>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">
                            {prod.width}/{prod.aspectRatio} R{prod.rimSize} | {prod.category}
                          </p>
                          <span className="text-[10px] font-mono font-semibold text-slate-500">
                            SKU: {prod.sku || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">MRP / Dealer</span>
                        <span className="font-black text-slate-900">
                          {formatCurrency(prod.mrp || prod.price)} / <span className="text-emerald-700">{formatCurrency(prod.dealerPrice || prod.bulkPrice)}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleAdjustQuantity(prod, -1)}
                          className="p-1 rounded-lg bg-white hover:bg-slate-200 text-slate-900 font-black border border-slate-300 text-xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={prod.stock}
                          onChange={(e) => handleSetQuantity(prod, parseInt(e.target.value))}
                          className="w-full px-2 py-1 rounded-lg bg-white text-center font-black text-slate-900 border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                        />

                        <button
                          onClick={() => handleAdjustQuantity(prod, 1)}
                          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1">
                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 text-xs font-bold flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit SKU</span>
                      </button>

                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDuplicateProduct(prod)}
                          title="Clone"
                          className="p-1.5 rounded-xl bg-indigo-100 text-indigo-900 hover:bg-indigo-200 text-xs font-bold"
                        >
                          <CopyPlus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmProduct(prod)}
                          title="Delete"
                          className="p-1.5 rounded-xl bg-rose-100 text-rose-900 hover:bg-rose-200 text-xs font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200 text-xs font-bold">
            <div className="flex items-center space-x-3 text-slate-600">
              <span>Showing {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} of {totalItems} items</span>
              <span className="text-slate-300">|</span>
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-900 disabled:opacity-40 hover:bg-slate-200"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-900 disabled:opacity-40 hover:bg-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-slate-900 text-white rounded-lg">
                Page {validPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-900 disabled:opacity-40 hover:bg-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-900 disabled:opacity-40 hover:bg-slate-200"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Customer Order Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                View customer orders, update dispatch status, and generate tax invoices.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 font-semibold">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Admin Policy:</strong> Direct order creation and payment triggers are restricted in the Admin Console. Admins can manage existing customer orders below. All new orders must be placed via the customer portal.
            </span>
          </div>

          <div className="space-y-4">
            {orders.map((ord, idx) => (
              <div
                key={`${ord.id}-${ord.orderNumber}-${idx}`}
                className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-black text-slate-900 font-display">{ord.orderNumber}</span>
                    <span className="text-xs text-slate-500">| {ord.date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {ord.customerName} ({ord.phone}) {ord.companyName && `- ${ord.companyName}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    Items: {ord.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                  <select
                    value={ord.orderStatus}
                    onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Warehouse Processing">Warehouse Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  <button
                    onClick={() => onViewInvoice(ord)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 text-xs font-bold"
                  >
                    View Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Audit Log (Read-Only)</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Customer Payment Audit & Transaction Records
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit history of customer transactions, bank gateway receipts, and GST settlements.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold block uppercase">Total Processed</span>
              <span className="text-xl font-black text-slate-900 font-display">
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 font-semibold">
            <ShieldCheck className="w-5 h-5 text-slate-600 shrink-0" />
            <span>
              <strong>Read-Only Notice:</strong> Admin payment processing is disabled. Payment execution is handled exclusively through customer-facing checkout channels.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase">
                  <th className="p-3 rounded-l-xl">Payment ID</th>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Gateway / Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {payments.map((p, idx) => (
                  <tr key={`${p.id}-${p.paymentId}-${idx}`} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{p.paymentId}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{p.orderId}</td>
                    <td className="p-3 font-bold">{p.customerName}</td>
                    <td className="p-3 font-black text-slate-950">{formatCurrency(p.amount)}</td>
                    <td className="p-3 font-bold text-slate-700">{p.method}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{p.date}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gateways Tab */}
      {activeTab === 'gateways' && <PaymentIntegrationsSpace />}

      {/* Upgraded Customer Accounts Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Restricted Portal & Pricing Engine</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Customer Account & Portal Control Center
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage customer-specific pricing tiers (GST, Credit, Custom), product catalog visibility, credit limits, and custom prices. Click any account to configure details.
              </p>
            </div>

            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 shadow-lg hover:shadow-amber-400/20 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>Create New Customer Account</span>
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider block">Total Accounts</span>
              <span className="text-xl font-black text-slate-950">{customerAccounts.length}</span>
              <span className="text-[10px] text-slate-500 block">Registered Dealers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">GST Pricing</span>
              <span className="text-xl font-black text-emerald-950">
                {customerAccounts.filter(c => (c.pricingType || 'gst') === 'gst').length}
              </span>
              <span className="text-[10px] text-emerald-700 block">Standard Dealer Rate</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider block">Credit Pricing</span>
              <span className="text-xl font-black text-indigo-950">
                {customerAccounts.filter(c => c.pricingType === 'credit').length}
              </span>
              <span className="text-[10px] text-indigo-700 block">Fleet & Bulk Terms</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">Custom Prices</span>
              <span className="text-xl font-black text-amber-950">
                {customerAccounts.filter(c => c.pricingType === 'custom' || (c.productOverrides && Object.keys(c.productOverrides).length > 0)).length}
              </span>
              <span className="text-[10px] text-amber-800 block">Itemized Overrides</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider block">Total Credit Line</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {formatCurrency(customerAccounts.reduce((sum, c) => sum + (c.creditLimit || 0), 0))}
              </span>
              <span className="text-[10px] text-slate-500 block">Allocated Credit Limit</span>
            </div>
          </div>

          {/* Search & Multi-Filter Controls */}
          <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by customer name, company, email, phone, or GSTIN..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {customerSearch && (
                  <button
                    onClick={() => setCustomerSearch('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filters Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
                {/* Pricing Type Filter */}
                <div>
                  <select
                    value={cPricingFilter}
                    onChange={(e) => setCPricingFilter(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="all">All Pricing Types</option>
                    <option value="gst">🏷️ GST Pricing</option>
                    <option value="credit">💳 Credit Pricing</option>
                    <option value="custom">⚡ Custom Pricing</option>
                  </select>
                </div>

                {/* Account Status Filter */}
                <div>
                  <select
                    value={cStatusFilter}
                    onChange={(e) => setCStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="VIP">VIP Customer</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending">Pending Approval</option>
                  </select>
                </div>

                {/* Credit Facility Filter */}
                <div>
                  <select
                    value={cCreditFilter}
                    onChange={(e) => setCCreditFilter(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="all">All Credit Statuses</option>
                    <option value="enabled">Credit Facility Enabled</option>
                    <option value="disabled">Credit Facility Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reset Filters trigger if any filter active */}
            {(customerSearch || cPricingFilter !== 'all' || cStatusFilter !== 'all' || cCreditFilter !== 'all') && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                <span className="text-slate-900 font-bold">
                  Showing filtered results ({customerAccounts.filter(c => {
                    if (customerSearch.trim()) {
                      const q = customerSearch.toLowerCase().trim();
                      const match = (
                        (c.username && c.username.toLowerCase().includes(q)) ||
                        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
                        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
                        (c.email && c.email.toLowerCase().includes(q)) ||
                        (c.phone && c.phone.toLowerCase().includes(q)) ||
                        (c.gstNumber && c.gstNumber.toLowerCase().includes(q))
                      );
                      if (!match) return false;
                    }
                    if (cPricingFilter !== 'all' && (c.pricingType || 'gst') !== cPricingFilter) return false;
                    if (cStatusFilter !== 'all' && (c.accountStatus || 'Active') !== cStatusFilter) return false;
                    if (cCreditFilter !== 'all') {
                      if (cCreditFilter === 'enabled' && !c.creditEnabled) return false;
                      if (cCreditFilter === 'disabled' && c.creditEnabled) return false;
                    }
                    return true;
                  }).length} / {customerAccounts.length})
                </span>
                <button
                  onClick={() => {
                    setCustomerSearch('');
                    setCPricingFilter('all');
                    setCStatusFilter('all');
                    setCCreditFilter('all');
                  }}
                  className="text-slate-700 hover:text-slate-950 font-black flex items-center space-x-1 underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Customer Accounts Data Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-wider">
                  <th className="p-3.5">Customer / Company</th>
                  <th className="p-3.5">GSTIN & Contact</th>
                  <th className="p-3.5">Active Pricing Type</th>
                  <th className="p-3.5">Credit Line & Terms</th>
                  <th className="p-3.5">Portal Access</th>
                  <th className="p-3.5 text-right">Profile Editor & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-medium">
                {customerAccounts
                  .filter(c => {
                    if (customerSearch.trim()) {
                      const q = customerSearch.toLowerCase().trim();
                      const match = (
                        (c.username && c.username.toLowerCase().includes(q)) ||
                        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
                        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
                        (c.email && c.email.toLowerCase().includes(q)) ||
                        (c.phone && c.phone.toLowerCase().includes(q)) ||
                        (c.gstNumber && c.gstNumber.toLowerCase().includes(q))
                      );
                      if (!match) return false;
                    }
                    if (cPricingFilter !== 'all' && (c.pricingType || 'gst') !== cPricingFilter) return false;
                    if (cStatusFilter !== 'all' && (c.accountStatus || 'Active') !== cStatusFilter) return false;
                    if (cCreditFilter !== 'all') {
                      if (cCreditFilter === 'enabled' && !c.creditEnabled) return false;
                      if (cCreditFilter === 'disabled' && c.creditEnabled) return false;
                    }
                    return true;
                  })
                  .map((cust) => {
                    const customOverridesCount = cust.productOverrides ? Object.keys(cust.productOverrides).length : 0;
                    const pType = cust.pricingType || 'gst';

                    return (
                      <tr 
                        key={cust.id} 
                        className="hover:bg-slate-50 transition-all group cursor-pointer"
                        onClick={(e) => {
                          // Prevent triggering row click if clicking action button
                          if ((e.target as HTMLElement).closest('button')) return;
                          handleOpenCustomerEditor(cust);
                        }}
                      >
                        <td className="p-3.5">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                              {cust.username.slice(0, 2)}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="font-black text-slate-900 text-sm group-hover:text-slate-700 transition-colors">
                                  {cust.companyName || cust.username}
                                </span>
                                {cust.accountStatus === 'VIP' && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                                    ★ VIP
                                  </span>
                                )}
                                {cust.accountStatus === 'Suspended' && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                                    Suspended
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                                <span>User: @{cust.username}</span>
                                {cust.customerName && <span className="text-slate-400">({cust.customerName})</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 space-y-1">
                          <div className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-900 font-bold text-[11px] inline-block border border-slate-200">
                            GSTIN: {cust.gstNumber || 'N/A'}
                          </div>
                          <div className="text-slate-700 font-bold">{cust.email}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{cust.phone}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-1">
                            {pType === 'gst' && (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-950 font-black text-xs inline-flex items-center space-x-1.5 border border-emerald-200 shadow-xs">
                                <span>🏷️ GST Pricing</span>
                              </span>
                            )}
                            {pType === 'credit' && (
                              <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-950 font-black text-xs inline-flex items-center space-x-1.5 border border-indigo-200 shadow-xs">
                                <span>💳 Credit Pricing</span>
                              </span>
                            )}
                            {pType === 'custom' && (
                              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 font-black text-xs inline-flex items-center space-x-1.5 shadow-xs">
                                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                <span>Custom Pricing</span>
                              </span>
                            )}

                            {customOverridesCount > 0 && (
                              <div className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 inline-block">
                                {customOverridesCount} Custom Product {customOverridesCount === 1 ? 'Override' : 'Overrides'} Active
                              </div>
                            )}

                            {cust.overallDiscountPercent ? cust.overallDiscountPercent > 0 ? (
                              <div className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 inline-block">
                                +{cust.overallDiscountPercent}% Customer Discount
                              </div>
                            ) : null : null}
                          </div>
                        </td>

                        <td className="p-3.5 space-y-1">
                          {cust.creditEnabled ? (
                            <div>
                              <span className="font-black text-slate-900 font-mono text-xs block">
                                Limit: {formatCurrency(cust.creditLimit || 0)}
                              </span>
                              <span className="text-[11px] font-bold text-indigo-800 block">
                                Terms: Net {cust.paymentTermsDays || 30} Days
                              </span>
                              {cust.usedCredit ? cust.usedCredit > 0 ? (
                                <span className="text-[10px] text-rose-600 font-bold block">
                                  Used: {formatCurrency(cust.usedCredit)}
                                </span>
                              ) : null : null}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold text-xs italic">
                              Cash / Pay-on-Delivery Only
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {cust.productVisibilityMode === 'selected' ? (
                            <span className="px-2 py-1 rounded bg-slate-200 text-slate-900 font-bold text-[11px]">
                              {cust.allowedProductIds?.length || 0} Selected Products
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                              All Catalog Products
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenCustomerEditor(cust)}
                            className="px-3 py-2 rounded-xl bg-[#54b4e7] text-white hover:bg-[#3ea5dc] font-black text-xs inline-flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
                            title="Open Customer Profile Editor"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-white" />
                            <span>Manage Profile & Pricing</span>
                          </button>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`Username: ${cust.username}\nEmail: ${cust.email}\nPricing: ${cust.pricingType}`);
                              setCopiedAccount(cust.id);
                              if (showToast) showToast(`Credentials for @${cust.username} copied!`);
                              setTimeout(() => setCopiedAccount(null), 2000);
                            }}
                            className="px-2.5 py-2 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold text-[11px] inline-flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedAccount === cust.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedAccount === cust.id ? 'Copied' : 'Info'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEDICATED CUSTOMER PROFILE EDITOR MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-5xl bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    Customer Profile & Pricing Engine
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                    ID: {editingCustomer.id}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 font-display flex items-center space-x-2">
                  <span>{editingCustomer.companyName || editingCustomer.username}</span>
                  <span className="text-sm font-bold text-slate-600">(@{editingCustomer.username})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configure customer credentials, GST registration details, active pricing rules (GST/Credit/Custom), product catalog visibility, custom product prices, and credit line limits.
                </p>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Currently Active Pricing Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Active Customer Pricing Type</div>
                  <div className="text-sm font-black text-white flex items-center space-x-2">
                    <span className="capitalize">{editingCustomer.pricingType} Pricing Mode</span>
                    {editingCustomer.pricingType === 'custom' && (
                      <span className="text-xs text-amber-300 font-bold">(Custom Prices Priority)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-slate-300">Account Status:</span>
                <select
                  value={editingCustomer.accountStatus || 'Active'}
                  onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, accountStatus: e.target.value as any }) : null)}
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-950 font-black text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="VIP">VIP Customer</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Editor Tabs Navigation */}
            <div className="flex border-b border-slate-200 overflow-x-auto space-x-1">
              <button
                type="button"
                onClick={() => setProfileActiveTab('info')}
                className={`px-4 py-2.5 font-black text-xs border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                  profileActiveTab === 'info'
                    ? 'border-slate-900 text-slate-900 bg-slate-100 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>1. Customer & GST Info</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileActiveTab('pricing')}
                className={`px-4 py-2.5 font-black text-xs border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                  profileActiveTab === 'pricing'
                    ? 'border-slate-900 text-slate-900 bg-slate-100 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>2. Pricing Tier & Discounts</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileActiveTab('products')}
                className={`px-4 py-2.5 font-black text-xs border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                  profileActiveTab === 'products'
                    ? 'border-slate-900 text-slate-900 bg-slate-100 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>3. Product Access & Custom Prices</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileActiveTab('credit')}
                className={`px-4 py-2.5 font-black text-xs border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                  profileActiveTab === 'credit'
                    ? 'border-slate-900 text-slate-900 bg-slate-100 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>4. Credit Settings & Terms</span>
              </button>
            </div>

            {/* TAB 1: CUSTOMER & GST INFORMATION */}
            {profileActiveTab === 'info' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-3">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Primary Identity & Contact Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Username *</label>
                      <input
                        type="text"
                        required
                        value={editingCustomer.username}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, username: e.target.value }) : null)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                      <input
                        type="text"
                        value={editingCustomer.customerName || ''}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, customerName: e.target.value }) : null)}
                        placeholder="e.g. Sunil Singh"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company / Business / Fleet Name</label>
                      <input
                        type="text"
                        value={editingCustomer.companyName}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, companyName: e.target.value }) : null)}
                        placeholder="e.g. SS Roadways Logistics"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={editingCustomer.email}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                    <input
                      type="text"
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                      placeholder="+91 98350 78910"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-3">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">GST Details & Location</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={editingCustomer.gstNumber}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, gstNumber: e.target.value.toUpperCase() }) : null)}
                        placeholder="10AAACS7890R1Z4"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">GST Registration Type</label>
                      <select
                        value={editingCustomer.gstType || 'Regular'}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, gstType: e.target.value as any }) : null)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                      >
                        <option value="Regular">Regular Taxpayer</option>
                        <option value="Composition">Composition Scheme</option>
                        <option value="Unregistered">Unregistered Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Billing State / Code</label>
                      <input
                        type="text"
                        value={editingCustomer.billingState || 'Bihar (10)'}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, billingState: e.target.value }) : null)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Delivery Location / Transport Yard</label>
                    <input
                      type="text"
                      value={editingCustomer.deliveryLocation}
                      onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, deliveryLocation: e.target.value }) : null)}
                      placeholder="e.g. Transport Nagar, Patna"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Registered Address</label>
                    <textarea
                      rows={2}
                      value={editingCustomer.address}
                      onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, address: e.target.value }) : null)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING TIER & DISCOUNTS */}
            {profileActiveTab === 'pricing' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-3">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Select Active Pricing Rule Strategy</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* GST PRICING CARD */}
                    <div
                      onClick={() => setEditingCustomer(prev => prev ? ({ ...prev, pricingType: 'gst' }) : null)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        editingCustomer.pricingType === 'gst'
                          ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">🏷️</span>
                        {editingCustomer.pricingType === 'gst' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <h5 className="font-black text-slate-900 text-sm">GST Pricing</h5>
                      <p className="text-slate-600 text-[11px] mt-1 leading-snug">
                        Customer buys at configured Dealer GST Price with standard tax invoice breakdown.
                      </p>
                    </div>

                    {/* CREDIT PRICING CARD */}
                    <div
                      onClick={() => setEditingCustomer(prev => prev ? ({ ...prev, pricingType: 'credit' }) : null)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        editingCustomer.pricingType === 'credit'
                          ? 'bg-indigo-50 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">💳</span>
                        {editingCustomer.pricingType === 'credit' && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <h5 className="font-black text-slate-900 text-sm">Credit Pricing</h5>
                      <p className="text-slate-600 text-[11px] mt-1 leading-snug">
                        Customer receives credit bulk rate pricing configured for credit/fleet purchases.
                      </p>
                    </div>

                    {/* CUSTOM PRICING CARD */}
                    <div
                      onClick={() => setEditingCustomer(prev => prev ? ({ ...prev, pricingType: 'custom' }) : null)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        editingCustomer.pricingType === 'custom'
                          ? 'bg-slate-900 text-white border-slate-950 shadow-lg ring-2 ring-slate-600/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Zap className={`w-5 h-5 ${editingCustomer.pricingType === 'custom' ? 'text-amber-300 fill-amber-300' : 'text-slate-700'}`} />
                        {editingCustomer.pricingType === 'custom' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <h5 className={`font-black text-sm ${editingCustomer.pricingType === 'custom' ? 'text-white' : 'text-slate-900'}`}>
                        Custom Pricing
                      </h5>
                      <p className={`text-[11px] mt-1 leading-snug ${editingCustomer.pricingType === 'custom' ? 'text-slate-300' : 'text-slate-600'}`}>
                        Uses customer-specific tailored prices set in Product Access tab. Highest priority override.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CUSTOMER-LEVEL OVERALL DISCOUNT */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-amber-950 text-xs flex items-center space-x-1.5">
                      <BadgePercent className="w-4 h-4 text-amber-700" />
                      <span>Customer-Level Additional Overall Discount (%)</span>
                    </h4>
                    <span className="text-[11px] text-amber-800 font-bold">Applies on top of base pricing rule</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={editingCustomer.overallDiscountPercent || 0}
                      onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, overallDiscountPercent: Math.max(0, Math.min(50, Number(e.target.value))) }) : null)}
                      className="w-32 px-3 py-2 rounded-xl bg-white border border-amber-300 font-black text-amber-950 text-center text-sm"
                    />
                    <span className="text-xs font-bold text-slate-700">% extra discount on all tyres for this customer account</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCT ACCESS & CUSTOM PRICES */}
            {profileActiveTab === 'products' && (
              <div className="space-y-4 text-xs">
                {/* Portal Mode & Global Controls */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-xs">Customer Portal Product Access Mode</h4>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="productVisibilityMode"
                          checked={editingCustomer.productVisibilityMode !== 'selected'}
                          onChange={() => setEditingCustomer(prev => prev ? ({ ...prev, productVisibilityMode: 'all' }) : null)}
                          className="text-slate-900 focus:ring-slate-900"
                        />
                        <span>Show All Catalog Products</span>
                      </label>

                      <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="productVisibilityMode"
                          checked={editingCustomer.productVisibilityMode === 'selected'}
                          onChange={() => setEditingCustomer(prev => prev ? ({ ...prev, productVisibilityMode: 'selected' }) : null)}
                          className="text-slate-900 focus:ring-slate-900"
                        />
                        <span>Show Only Selected Products</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetCustomerPricingToDefault}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-xs inline-flex items-center space-x-1.5 border border-rose-200 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reset All Prices to Default</span>
                  </button>
                </div>

                {/* Filter Product Search inside Editor */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search tyres by brand, name, or SKU to adjust prices..."
                    value={editorProductSearch}
                    onChange={(e) => setEditorProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>

                {/* Product Catalog Pricing Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-80 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-900 text-white font-black text-[11px] z-10">
                      <tr>
                        <th className="p-3">Portal Access</th>
                        <th className="p-3">Product Info</th>
                        <th className="p-3 text-right">Standard Dealer Price</th>
                        <th className="p-3 text-right">Credit Price</th>
                        <th className="p-3 text-center">Customer Custom Price (₹)</th>
                        <th className="p-3 text-center">Item Discount (%)</th>
                        <th className="p-3 text-right">Customer Effective Price</th>
                        <th className="p-3 text-center">Reset</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-medium">
                      {products
                        .filter(p => {
                          if (!editorProductSearch.trim()) return true;
                          const q = editorProductSearch.toLowerCase();
                          return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
                        })
                        .map((prod) => {
                          const override = editingCustomer.productOverrides?.[prod.id];
                          const customPriceVal = override?.customPrice ?? '';
                          const discountVal = override?.discountPercent ?? '';
                          const isExcluded = override?.isExcluded ?? false;
                          const isAllowedInSelected = editingCustomer.productVisibilityMode === 'selected' 
                            ? (editingCustomer.allowedProductIds || []).includes(prod.id)
                            : true;
                          const isVisible = isAllowedInSelected && !isExcluded;

                          // Compute preview effective price for this customer
                          const computed = getCustomerEffectivePrice(prod, editingCustomer);

                          return (
                            <tr key={prod.id} className={`hover:bg-slate-50 transition-colors ${!isVisible ? 'bg-slate-50 opacity-60' : ''}`}>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingCustomer.productVisibilityMode === 'selected') {
                                      const currentList = editingCustomer.allowedProductIds || [];
                                      const updatedList = currentList.includes(prod.id)
                                        ? currentList.filter(id => id !== prod.id)
                                        : [...currentList, prod.id];
                                      setEditingCustomer(prev => prev ? ({ ...prev, allowedProductIds: updatedList }) : null);
                                    } else {
                                      handleUpdateProductOverrideField(prod.id, 'isExcluded', !isExcluded);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
                                    isVisible
                                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                                  }`}
                                >
                                  {isVisible ? '✓ Visible' : '✕ Hidden'}
                                </button>
                              </td>

                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                                  <div>
                                    <span className="font-bold text-slate-900 block truncate max-w-xs">{prod.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{prod.brand} • SKU: {prod.sku || prod.id}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 text-right font-mono font-bold text-slate-700">
                                {formatCurrency(prod.dealerPrice || prod.price)}
                              </td>

                              <td className="p-3 text-right font-mono font-bold text-indigo-900">
                                {formatCurrency(prod.bulkPrice || prod.dealerPrice || prod.price)}
                              </td>

                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  placeholder={`e.g. ${prod.dealerPrice}`}
                                  value={customPriceVal}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                                    handleUpdateProductOverrideField(prod.id, 'customPrice', val);
                                  }}
                                  className={`w-28 px-2 py-1 rounded-lg border text-xs font-black text-center ${
                                    override?.customPrice
                                      ? 'bg-slate-100 border-slate-900 text-slate-950 font-bold'
                                      : 'bg-slate-50 border-slate-300 text-slate-900'
                                  }`}
                                />
                              </td>

                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  placeholder="0%"
                                  value={discountVal}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                                    handleUpdateProductOverrideField(prod.id, 'discountPercent', val);
                                  }}
                                  className="w-16 px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 text-center"
                                />
                              </td>

                              <td className="p-3 text-right">
                                <span className={`font-mono font-black text-xs px-2 py-1 rounded-lg ${
                                  computed.hasCustomOverride
                                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                    : 'bg-slate-100 text-slate-950'
                                }`}>
                                  {formatCurrency(computed.effectivePrice)}
                                </span>
                              </td>

                              <td className="p-3 text-center">
                                {(override?.customPrice || override?.discountPercent || override?.isExcluded) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleResetSingleProductOverride(prod.id)}
                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer"
                                    title="Reset to Default Price"
                                  >
                                    Reset
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-300 italic">Default</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: CREDIT SETTINGS & PAYMENT TERMS */}
            {profileActiveTab === 'credit' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Credit Facility Authorization</h4>
                      <p className="text-slate-500 text-xs">Enable or disable buy-now-pay-later credit terms for this customer account.</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCustomer.creditEnabled}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, creditEnabled: e.target.checked }) : null)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>

                  {editingCustomer.creditEnabled ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Approved Credit Limit (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="25000"
                            value={editingCustomer.creditLimit || 0}
                            onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, creditLimit: Number(e.target.value) }) : null)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-black text-slate-900 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Current Outstanding Credit Usage (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={editingCustomer.usedCredit || 0}
                            onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, usedCredit: Number(e.target.value) }) : null)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Credit Payment Terms (Days)</label>
                          <select
                            value={editingCustomer.paymentTermsDays || 30}
                            onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, paymentTermsDays: Number(e.target.value) }) : null)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                          >
                            <option value={7}>Net 7 Days</option>
                            <option value={15}>Net 15 Days</option>
                            <option value={30}>Net 30 Days (Standard Fleet Term)</option>
                            <option value={45}>Net 45 Days</option>
                            <option value={60}>Net 60 Days</option>
                            <option value={90}>Net 90 Days</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Grace Period / Due Days (Days)</label>
                          <input
                            type="number"
                            min="0"
                            value={editingCustomer.dueDaysGrace || 5}
                            onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, dueDaysGrace: Number(e.target.value) }) : null)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center text-xs font-bold text-indigo-950">
                        <span>Available Credit Line Remaining:</span>
                        <span className="font-mono text-sm font-black text-indigo-900">
                          {formatCurrency(Math.max(0, (editingCustomer.creditLimit || 0) - (editingCustomer.usedCredit || 0)))}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 font-medium">
                      Credit facility is currently disabled for this customer. Orders will require immediate online payment or pay-on-delivery.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Controls Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetCustomerPricingToDefault}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Price</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveCustomerProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-black text-xs shadow-lg flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Save Customer Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Create Customer Account Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Admin Customer Provisioning</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-display">
                  Create Customer Account
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in customer account credentials and default business profile details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {cError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{cError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomerAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Customer Username *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ssroadways"
                      value={cUsername}
                      onChange={(e) => setCUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. ssroadways@gmail.com"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Default Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Magadh@123"
                      value={cPassword}
                      onChange={(e) => setCPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Company / Fleet Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. SS Roadways Logistics"
                      value={cCompanyName}
                      onChange={(e) => setCCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="+91 98350 78910"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    placeholder="10AAACS7890R1Z4"
                    value={cGstNumber}
                    onChange={(e) => setCGstNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Delivery Location / Primary Hub
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Transport Nagar, Patna"
                    value={cDeliveryLocation}
                    onChange={(e) => setCDeliveryLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Registered Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Plot 45, Transport Nagar, Bypass Road, Patna, Bihar - 800026"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={cLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#54b4e7] text-white font-bold hover:bg-[#3ea5dc] shadow-md flex items-center space-x-2 disabled:opacity-50"
                >
                  {cLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-white" />
                  )}
                  <span>{cLoading ? 'Registering...' : 'Create Customer Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Edit / Add Comprehensive Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-black mb-1">
                  <Package className="w-3.5 h-3.5" />
                  <span>{editingProduct ? 'Inventory Product Specification Editor' : 'Catalog Product Provisioning'}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-display">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Tyre SKU to Catalog'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure essential fields including SKU, pricing, stock alerts, GST rate, and multi-angle product media.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Validation Error Message */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              {/* Section 1: Basic Identifiers */}
              <div className="space-y-3 p-4 bg-slate-50/60 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">1. Core Identification & Taxonomy</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MRF ZTX Super 195/65 R15 91H All-Season Tyre"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Brand *
                    </label>
                    <select
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      {['MRF', 'Apollo', 'CEAT', 'Michelin', 'Bridgestone', 'Goodyear', 'JK Tyre', 'Pirelli'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      SKU (Stock Keeping Unit)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MRF-ZTX-19565R15"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Product Code / HSN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HSN-401110"
                      value={formProductCode}
                      onChange={(e) => setFormProductCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      {['Car', 'SUV', 'Bike', 'Truck', 'EV'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Vehicle Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sedan / Hatchback / SUV"
                      value={formVehicleType}
                      onChange={(e) => setFormVehicleType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Tyre Specs */}
              <div className="space-y-3 p-4 bg-slate-50/60 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">2. Technical Tyre Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Width (mm)</label>
                    <input
                      type="number"
                      required
                      value={formWidth}
                      onChange={(e) => setFormWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Aspect Ratio</label>
                    <input
                      type="number"
                      required
                      value={formAspectRatio}
                      onChange={(e) => setFormAspectRatio(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Rim Size (&quot;)</label>
                    <input
                      type="number"
                      required
                      value={formRimSize}
                      onChange={(e) => setFormRimSize(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Tyre Size String</label>
                    <input
                      type="text"
                      placeholder="195/65 R15"
                      value={formTyreSize}
                      onChange={(e) => setFormTyreSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Load Index</label>
                    <input
                      type="text"
                      placeholder="e.g. 91"
                      value={formLoadIndex}
                      onChange={(e) => setFormLoadIndex(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Speed Rating</label>
                    <input
                      type="text"
                      placeholder="e.g. H / V / W"
                      value={formSpeedRating}
                      onChange={(e) => setFormSpeedRating(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-center uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Tire Type *</label>
                    <div className="flex items-center space-x-2 pt-0.5">
                      <label className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                        formTireType === 'Radial'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}>
                        <input
                          type="radio"
                          name="tireTypeRadio"
                          value="Radial"
                          required
                          checked={formTireType === 'Radial'}
                          onChange={() => setFormTireType('Radial')}
                          className="w-3.5 h-3.5 accent-slate-900"
                        />
                        <span>Radial</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                        formTireType === 'Non-Radial'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}>
                        <input
                          type="radio"
                          name="tireTypeRadio"
                          value="Non-Radial"
                          required
                          checked={formTireType === 'Non-Radial'}
                          onChange={() => setFormTireType('Non-Radial')}
                          className="w-3.5 h-3.5 accent-slate-900"
                        />
                        <span>Non-Radial</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Tread Pattern / Design</label>
                    <input
                      type="text"
                      placeholder="e.g. Asymmetric All-Season Compound Tread"
                      value={formPattern}
                      onChange={(e) => setFormPattern(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Included Components (Metadata Field)</label>
                    <input
                      type="text"
                      placeholder="e.g. Tube & Flap"
                      value={formIncludedComponents}
                      onChange={(e) => setFormIncludedComponents(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-amber-900 bg-amber-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pricing, Tax & Inventory */}
              <div className="space-y-3 p-4 bg-slate-50/60 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">3. Commercial Pricing, Tax & Stock Levels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">MRP / Retail Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formMrp}
                      onChange={(e) => setFormMrp(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-black text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Dealer Price 4+ (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formDealerPrice}
                      onChange={(e) => setFormDealerPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-black text-emerald-800 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">GST Rate (%) *</label>
                    <select
                      value={formGstRate}
                      onChange={(e) => setFormGstRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST (Standard Default)</option>
                      <option value={28}>28% GST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Status *</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value="Active">Active (Visible in Catalog)</option>
                      <option value="Inactive">Inactive (Hidden)</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Current Stock Quantity (In-Stock Units)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setFormStock(prev => Math.max(0, prev - 1))}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-900 font-black hover:bg-slate-200"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={formStock}
                        onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-black text-slate-900 text-center text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setFormStock(prev => prev + 1)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Minimum Stock Alert Level (Units)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formMinStockLevel}
                      onChange={(e) => setFormMinStockLevel(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Triggers low-stock warnings when inventory drops below this number.</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Product Images & Multi-Angle Media */}
              <div className="space-y-3 p-4 bg-slate-50/60 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">4. Product Images & Gallery</h4>
                  <label className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold cursor-pointer inline-flex items-center space-x-1 shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={formNewImageUrl}
                    onChange={(e) => setFormNewImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold shrink-0"
                  >
                    Add URL
                  </button>
                </div>

                {/* Images Preview Grid */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                    {formImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-sm">
                        <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-white text-[9px] font-black text-center py-0.5 uppercase">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 5: Description & Search Tags */}
              <div className="space-y-3 p-4 bg-slate-50/60 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">5. Description & Search Tags</h4>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a comprehensive product description detailing tread life, wet grip handling, low-noise technology, and warranty information..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Search & Categorization Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Type a tag (e.g. All-Season, Tubeless, High-Mileage) and press Add"
                      value={formNewTagInput}
                      onChange={(e) => setFormNewTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold shrink-0"
                    >
                      Add Tag
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {formTags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-bold text-xs flex items-center space-x-1 border border-slate-200">
                        <span>#{tag}</span>
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-rose-600 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section 6: Dynamic Product Components & Accessories */}
                <div className="space-y-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-200 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-slate-700" />
                        <span>6. Dynamic Product Components & Accessories</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Attach related products (Tube, Flap, Rim, Valve, Accessories) from your catalog. Customers can select optional ones or get mandatory ones automatically.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddComponentRow}
                      className="px-3.5 py-2 rounded-xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-extrabold text-xs inline-flex items-center space-x-1.5 shadow-md shrink-0 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>+ Add Component</span>
                    </button>
                  </div>

                  {formComponents.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white text-center text-xs text-slate-500 space-y-1">
                      <p className="font-bold text-slate-700">No components attached to this product yet.</p>
                      <p className="text-[11px]">Click <span className="font-bold text-slate-900">+ Add Component</span> above to link an existing tube, flap, rim, valve, or accessory.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formComponents.map((comp, idx) => {
                        const isCustom = comp.productId.startsWith('custom-') || !products.some(p => p.id === comp.productId);

                        return (
                          <div
                            key={comp.id || idx}
                            className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              {/* Catalog Source Selection */}
                              <div className="sm:col-span-5">
                                <label className="block text-[10px] font-black uppercase text-slate-800 mb-1">
                                  Catalog Link / Source *
                                </label>
                                <select
                                  value={isCustom ? 'custom' : comp.productId}
                                  onChange={(e) => handleUpdateComponentRow(comp.id, 'productId', e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                >
                                  <option value="custom">✏️ Custom Accessory / Manual Entry</option>
                                  {products
                                    .filter(p => p.id !== (editingProduct?.id || ''))
                                    .map(p => (
                                      <option key={p.id} value={p.id}>
                                        [{p.brand}] {p.name} — ₹{p.price} ({p.sku || p.id})
                                      </option>
                                    ))}
                                </select>
                              </div>

                              {/* Component Name */}
                              <div className="sm:col-span-4">
                                <label className="block text-[10px] font-black uppercase text-slate-800 mb-1">
                                  Component Name *
                                </label>
                                <input
                                  type="text"
                                  value={comp.productName || ''}
                                  onChange={(e) => handleUpdateComponentRow(comp.id, 'productName', e.target.value)}
                                  placeholder="e.g. Heavy Duty Butyl Tube 195/65 R15"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                />
                              </div>

                              {/* Brand */}
                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-black uppercase text-slate-800 mb-1">
                                  Brand
                                </label>
                                <input
                                  type="text"
                                  value={comp.brand || ''}
                                  onChange={(e) => handleUpdateComponentRow(comp.id, 'brand', e.target.value)}
                                  placeholder="e.g. MRF"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-200">
                              {/* Price */}
                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-black uppercase text-slate-800 mb-1">
                                  Price per Unit (₹)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={comp.price || 0}
                                  onChange={(e) => handleUpdateComponentRow(comp.id, 'price', Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-black text-slate-900 text-center"
                                />
                              </div>

                              {/* Quantity per unit */}
                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-black uppercase text-slate-800 mb-1">
                                  Qty per Tyre Unit
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={comp.quantity}
                                  onChange={(e) => handleUpdateComponentRow(comp.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 text-center"
                                />
                              </div>

                              {/* Requirement Rule */}
                              <div className="sm:col-span-5">
                                <label className="block text-[10px] font-black uppercase text-slate-800 mb-1">
                                  Requirement Rule
                                </label>
                                <select
                                  value={comp.isMandatory ? 'mandatory' : 'optional'}
                                  onChange={(e) => handleUpdateComponentRow(comp.id, 'isMandatory', e.target.value === 'mandatory')}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                                >
                                  <option value="optional">Optional (Customer Can Select/Deselect)</option>
                                  <option value="mandatory">Mandatory (Required & Pre-Selected)</option>
                                </select>
                              </div>

                              {/* Remove Button */}
                              <div className="sm:col-span-1 flex justify-end items-end pt-3 sm:pt-0">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveComponentRow(comp.id)}
                                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-colors cursor-pointer"
                                  title="Remove Component"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#54b4e7] text-white font-bold hover:bg-[#3ea5dc] shadow-lg flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{editingProduct ? 'Update Product Details' : 'Save & Publish Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Single Product */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Confirm Product Deletion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-900">{deleteConfirmProduct.name}</strong> (SKU: {deleteConfirmProduct.sku || deleteConfirmProduct.id})? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Bulk Delete Confirmation</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-rose-700">{selectedProductIds.length} selected products</strong> from the catalog? This operation cannot be reversed.
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo Management Tab */}
      {activeTab === 'logo' && <LogoManagementSpace showToast={showToast} />}

    </div>
  );
};
