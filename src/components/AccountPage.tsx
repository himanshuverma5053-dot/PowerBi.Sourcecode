import React, { useState, useEffect } from 'react';
import { Order, CustomerAccount } from '../types';
import { safeSetLocalStorage } from '../utils/storage';
import { checkIsAdmin, ADMIN_CONFIG } from '../utils/admin';
import { supabase } from '../supabaseClient';
import {
  User, Building2, Phone, Mail, FileText, MapPin, Home,
  Save, CheckCircle2, ShieldCheck, Crown, ShieldAlert, ShoppingBag, LogOut
} from 'lucide-react';

interface AccountPageProps {
  orders: Order[];
  showToast: (msg: string) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  setActiveTab?: (tab: string) => void;
  currentUserEmail?: string;
  customerAccounts?: CustomerAccount[];
  onUpdateCustomerAccounts?: (accounts: CustomerAccount[]) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  orders,
  showToast,
  currentUser,
  setCurrentUser,
  setActiveTab,
  currentUserEmail,
  customerAccounts,
  onUpdateCustomerAccounts,
}) => {
  // Initial profile state
  const [customerName, setCustomerName] = useState(currentUser || '');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(currentUserEmail || '');
  const [gstNumber, setGstNumber] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [address, setAddress] = useState('');

  const [isSaved, setIsSaved] = useState(false);

  const isAdminUser = checkIsAdmin(customerName, email);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    const userKey = currentUser ? currentUser.toLowerCase() : 'default';
    localStorage.removeItem(`user_profile_${userKey}`);
    localStorage.removeItem('user_profile');
    setCurrentUser('');
    setCustomerName('');
    setEmail('');
    showToast('Logged out successfully.');
    if (setActiveTab) {
      setActiveTab('signin');
    }
  };

  // Load profile based on logged-in customer details
  useEffect(() => {
    const activeUser = currentUser || '';
    const lowerUser = activeUser.toLowerCase();
    const userKey = lowerUser ? `user_profile_${lowerUser}` : null;

    const savedData = userKey ? localStorage.getItem(userKey) : localStorage.getItem('user_profile');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCustomerName(parsed.customerName || activeUser || (currentUserEmail ? currentUserEmail.split('@')[0] : ''));
        setCompanyName(parsed.companyName || '');
        setPhone(parsed.phone || '');
        setEmail(parsed.email || currentUserEmail || '');
        setGstNumber(parsed.gstNumber || '');
        setDeliveryLocation(parsed.deliveryLocation || '');
        setAddress(parsed.address || '');
        return;
      } catch (e) {
        console.error('Profile load error:', e);
      }
    }

    // Customer specific defaults for admin or new sign-ups
    if (
      lowerUser === ADMIN_CONFIG.username.toLowerCase() ||
      lowerUser === ADMIN_CONFIG.email.toLowerCase() ||
      currentUserEmail === ADMIN_CONFIG.email ||
      lowerUser === 'himanshu verma'
    ) {
      setCustomerName(ADMIN_CONFIG.username);
      setCompanyName('Magadh Tyres Corporate');
      setPhone('+91 63712 31522');
      setEmail(ADMIN_CONFIG.email);
      setGstNumber('10AAACM1234F1Z2');
      setDeliveryLocation('Patna Central Hub');
      setAddress('Exhibition Road, Patna, Bihar - 800001');
    } else {
      // For all other sign-ups / logins: treat as clean customer account with details blank
      setCustomerName(activeUser || (currentUserEmail ? currentUserEmail.split('@')[0] : ''));
      setCompanyName('');
      setPhone('');
      setEmail(currentUserEmail || (activeUser.includes('@') ? activeUser : ''));
      setGstNumber('');
      setDeliveryLocation('');
      setAddress('');
    }
  }, [currentUser, currentUserEmail]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profileToSave = {
      customerName,
      companyName,
      phone,
      email,
      gstNumber,
      deliveryLocation,
      address,
    };

    const userKey = customerName ? customerName.toLowerCase() : 'default';
    safeSetLocalStorage(`user_profile_${userKey}`, profileToSave);
    safeSetLocalStorage('user_profile', profileToSave);

    if (customerAccounts && onUpdateCustomerAccounts) {
      const existingIdx = customerAccounts.findIndex(c => 
        (email && c.email?.toLowerCase() === email.toLowerCase()) ||
        (customerName && (c.username?.toLowerCase() === customerName.toLowerCase() || c.customerName?.toLowerCase() === customerName.toLowerCase()))
      );

      let updatedList: CustomerAccount[];
      if (existingIdx !== -1) {
        updatedList = [...customerAccounts];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          customerName,
          companyName,
          phone,
          email,
          gstNumber,
          deliveryLocation,
          address,
          updatedAt: new Date().toISOString()
        };
      } else {
        const username = customerName || (email ? email.split('@')[0] : 'customer');
        const newAccount: CustomerAccount = {
          id: `cust_${Date.now()}`,
          username,
          customerName,
          companyName,
          email,
          phone,
          gstNumber,
          deliveryLocation,
          address,
          accountStatus: 'Active',
          pricingType: 'gst',
          creditEnabled: false,
          creditLimit: 0,
          usedCredit: 0,
          paymentTermsDays: 30,
          dueDaysGrace: 5,
          createdAt: new Date().toISOString()
        };
        updatedList = [newAccount, ...customerAccounts];
      }
      onUpdateCustomerAccounts(updatedList);
    }

    setCurrentUser(customerName);
    setIsSaved(true);
    showToast(
      `Account profile updated for ${customerName}! ${
        checkIsAdmin(customerName, email) ? 'Admin Access Active.' : 'Standard Customer Mode.'
      }`
    );
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Filter orders related to this customer
  const userOrders = orders.filter(
    (o) =>
      (email && o.customerEmail?.toLowerCase() === email.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(customerName.toLowerCase())
  );

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4 sm:space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-2xs shrink-0">
            {(customerName || 'M').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col justify-center space-y-1">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
              isAdminUser 
                ? 'bg-amber-100 border border-amber-300 text-amber-900'
                : 'bg-slate-100 border border-slate-200 text-slate-700'
            }`}>
              {isAdminUser ? <Crown className="w-3.5 h-3.5 text-amber-700" /> : <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isAdminUser ? 'Super Admin Account' : 'Standard Customer Account'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-tight">
              {customerName || 'My Profile'}
            </h1>
            <p className="text-slate-600 text-xs">
              {companyName ? `${companyName} | ` : ''}{email || 'No email provided'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Account Security Role</span>
            {isAdminUser ? (
              <span className="text-xs font-black text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300 inline-flex items-center space-x-1 mt-1">
                <Crown className="w-3 h-3 text-amber-700" />
                <span>ADMIN ({customerName})</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 inline-block mt-1">
                Customer User
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Form: Account Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center space-x-2">
              <User className="w-5 h-5 text-slate-700" />
              <span>Account Information & Business Details</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Update your contact info, GSTIN tax credit details, and primary delivery addresses for fast invoice checkout.
            </p>
          </div>

          {isSaved && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saved!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Customer Name *</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name (e.g. Rajesh Kumar)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Business / Transport Firm Name"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Phone Number *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-Digit Mobile Number (e.g. 9876543210)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>Email ID *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

            {/* GST Number (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>GST Number (Optional)</span>
                </span>
                <span className="text-[10px] text-amber-700 font-extrabold uppercase">18% Input Tax Credit</span>
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 10AAACM1234F1Z2"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

            {/* Delivery Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>Delivery Location / Preferred Hub</span>
              </label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="e.g. Patna Central Hub / Muzaffarpur Branch"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

          </div>

          {/* Complete Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Home className="w-3.5 h-3.5 text-slate-600" />
              <span>Full Shipping / Warehouse Address</span>
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter street, building, city, state, and pin code..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit & Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs active:scale-95 transition-all flex items-center space-x-2 shadow-2xs cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Log Out</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-300" />
              <span>Save Account Details</span>
            </button>
          </div>
        </form>
      </div>

      {/* Orders Summary Card for Account */}
      {userOrders.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            <span>Recent Orders Linked to Your Account ({userOrders.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userOrders.slice(0, 4).map((o, idx) => (
              <div key={`${o.id}-${o.orderNumber}-${idx}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{o.orderNumber}</span>
                  <span className="text-slate-700">{o.paymentStatus}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>{o.date}</span>
                  <span className="font-extrabold text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
