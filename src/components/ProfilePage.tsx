import React, { useState, useEffect } from 'react';
import { Order, CustomerAccount } from '../types';
import { safeSetLocalStorage } from '../utils/storage';
import { checkIsAdmin } from '../utils/admin';
import {
  Save,
  MinusCircle,
  ChevronDown,
  Building2,
  Phone,
  FileText,
  MapPin,
  Home,
  CheckCircle2,
  RotateCcw,
  Edit3
} from 'lucide-react';

interface ProfilePageProps {
  orders?: Order[];
  showToast: (msg: string) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  setActiveTab?: (tab: string) => void;
  currentUserEmail?: string;
  customerAccounts?: CustomerAccount[];
  onUpdateCustomerAccounts?: (accounts: CustomerAccount[]) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  orders = [],
  showToast,
  currentUser,
  setCurrentUser,
  setActiveTab,
  currentUserEmail,
  customerAccounts = [],
  onUpdateCustomerAccounts,
}) => {
  // Primary user account profile state - blank unless user written
  const [name, setName] = useState<string>(currentUser || '');
  const [userId, setUserId] = useState<string>(currentUserEmail || '');
  const [role, setRole] = useState<'Admin' | 'Partner' | 'Billing Manager' | 'Staff / Operator'>(
    currentUser && checkIsAdmin(currentUser, currentUserEmail || '') ? 'Admin' : 'Partner'
  );
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  // Extended profile details - blank unless written by user
  const [companyName, setCompanyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  
  // Accordion state
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load profile from local storage if previously written/saved
  useEffect(() => {
    const activeUser = currentUser || '';
    const lowerUser = activeUser.toLowerCase();
    const userKey = lowerUser ? `user_profile_${lowerUser}` : null;

    const savedData = userKey ? localStorage.getItem(userKey) : localStorage.getItem('user_profile');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.customerName || parsed.name) {
          setName(parsed.customerName || parsed.name);
        } else if (activeUser) {
          setName(activeUser.toUpperCase());
        }
        if (parsed.email || parsed.userId) {
          setUserId(parsed.email || parsed.userId);
        } else if (currentUserEmail) {
          setUserId(currentUserEmail);
        }
        setCompanyName(parsed.companyName || '');
        setPhone(parsed.phone || '');
        setGstNumber(parsed.gstNumber || '');
        setDeliveryLocation(parsed.deliveryLocation || '');
        setAddress(parsed.address || '');
        if (parsed.role) {
          setRole(parsed.role === 'Dealer / Partner' ? 'Partner' : parsed.role);
        }
        return;
      } catch (e) {
        console.error('Profile load error:', e);
      }
    }

    if (currentUserEmail) {
      setUserId(currentUserEmail);
    }
    if (currentUser) {
      setName(currentUser.toUpperCase());
    }
  }, [currentUser, currentUserEmail]);

  // Handle Save
  const handleSave = () => {
    const profileToSave = {
      customerName: name,
      name,
      companyName,
      phone,
      email: userId,
      userId,
      role,
      status,
      gstNumber,
      deliveryLocation,
      address,
    };

    const userKey = name ? name.toLowerCase() : 'default';
    safeSetLocalStorage(`user_profile_${userKey}`, profileToSave);
    safeSetLocalStorage('user_profile', profileToSave);

    if (customerAccounts && onUpdateCustomerAccounts) {
      const existingIdx = customerAccounts.findIndex(
        (c) =>
          (userId && c.email?.toLowerCase() === userId.toLowerCase()) ||
          (name && c.customerName?.toLowerCase() === name.toLowerCase())
      );

      let updatedList: CustomerAccount[];
      if (existingIdx !== -1) {
        updatedList = [...customerAccounts];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          customerName: name,
          companyName,
          phone,
          email: userId,
          gstNumber,
          deliveryLocation,
          address,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const username = name || (userId ? userId.split('@')[0] : 'customer');
        const newAccount: CustomerAccount = {
          id: `cust_${Date.now()}`,
          username,
          customerName: name,
          companyName,
          email: userId,
          phone,
          gstNumber,
          deliveryLocation,
          address,
          accountStatus: status === 'Active' ? 'Active' : 'Suspended',
          pricingType: 'gst',
          creditEnabled: true,
          creditLimit: 500000,
          usedCredit: 0,
          paymentTermsDays: 30,
          dueDaysGrace: 5,
          createdAt: new Date().toISOString(),
        };
        updatedList = [newAccount, ...customerAccounts];
      }
      onUpdateCustomerAccounts(updatedList);
    }

    if (name) {
      setCurrentUser(name);
    }
    
    // Dispatch custom event so OrderDetailsPage and other listeners update immediately
    window.dispatchEvent(new Event('magadh_profile_updated'));

    setIsSaved(true);
    setIsEditMode(false);
    showToast(`Profile details ${name ? 'for ' + name + ' ' : ''}saved successfully!`);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Toggle status
  const handleToggleStatus = () => {
    const newStatus = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(newStatus);
    showToast(`User status updated to: ${newStatus}`);
  };

  // Reset Profile details to defaults
  const handleResetProfile = () => {
    setName('');
    setUserId('');
    setCompanyName('');
    setPhone('');
    setGstNumber('');
    setDeliveryLocation('');
    setAddress('');
    localStorage.removeItem('user_profile');
    if (currentUser) {
      localStorage.removeItem(`user_profile_${currentUser.toLowerCase()}`);
    }
    setCurrentUser('');
    showToast('Profile form cleared.');
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in font-sans">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-700 leading-snug tracking-tight">
            Company Details
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {isSaved && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        
        {/* ROW 1: Name */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700">
            Name
          </div>
          <div className="flex-1 text-right sm:text-left">
            {isEditMode ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:w-4/5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm sm:text-base font-semibold text-slate-900 uppercase focus:outline-none focus:border-[#54b4e7]"
                placeholder=""
              />
            ) : (
              <span className="text-sm sm:text-base font-medium text-slate-900 uppercase tracking-wide">
                {name || ''}
              </span>
            )}
          </div>
        </div>

        {/* ROW 2: User ID */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700 leading-tight">
            User<br />ID
          </div>
          <div className="flex-1 text-right sm:text-left">
            {isEditMode ? (
              <input
                type="email"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full sm:w-4/5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm sm:text-base font-normal text-slate-900 lowercase focus:outline-none focus:border-[#54b4e7]"
                placeholder=""
              />
            ) : (
              <span className="text-sm sm:text-base font-normal text-slate-900 lowercase break-all">
                {userId || ''}
              </span>
            )}
          </div>
        </div>

        {/* ROW 3: Role */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700">
            Role
          </div>
          <div className="flex-1 text-right sm:text-left flex items-center justify-end sm:justify-start space-x-2">
            {isEditMode ? (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:border-[#54b4e7]"
              >
                <option value="Admin">Admin</option>
                <option value="Partner">Partner</option>
                <option value="Billing Manager">Billing Manager</option>
                <option value="Staff / Operator">Staff / Operator</option>
              </select>
            ) : (
              <span className="text-sm sm:text-base font-bold text-slate-900">
                {role}
              </span>
            )}
            
            {status === 'Inactive' && (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Suspended
              </span>
            )}
          </div>
        </div>

        {/* ROW 4: Action */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700">
            Action
          </div>
          <div className="flex items-center justify-end space-x-5 sm:space-x-6 text-slate-800">
            
            {/* Save Icon */}
            <button
              type="button"
              onClick={handleSave}
              title="Save User Profile"
              className="p-1 text-slate-700 hover:text-[#54b4e7] active:scale-90 transition-all cursor-pointer"
            >
              <Save className="w-6 h-6 stroke-[1.8]" />
            </button>

            {/* Minus Icon */}
            <button
              type="button"
              onClick={handleToggleStatus}
              title={status === 'Active' ? 'Deactivate Access' : 'Reactivate Access'}
              className={`p-1 active:scale-90 transition-all cursor-pointer ${
                status === 'Active' ? 'text-slate-700 hover:text-red-500' : 'text-red-500 hover:text-emerald-600'
              }`}
            >
              <MinusCircle className="w-6 h-6 stroke-[1.8]" />
            </button>

            {/* Expand / Collapse Chevron */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse Details' : 'Expand Details'}
              className="p-1 text-slate-900 hover:text-slate-700 active:scale-90 transition-transform duration-200 cursor-pointer"
            >
              <ChevronDown
                className={`w-7 h-7 stroke-[2.75] transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* EXPANDABLE ACCORDION SECTION */}
        {isExpanded && (
          <div className="bg-slate-50/70 border-t border-slate-200 px-6 sm:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <span>Enterprise Profile & Commercial Billing Details</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure primary GST credentials, shipping destination hub, and contact verification.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isEditMode ? 'Exit Edit Mode' : 'Edit Full Profile'}</span>
                </button>
              </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Company / Firm Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Registered Firm / Trading Name</span>
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7]"
                    placeholder=""
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 min-h-[42px] flex items-center">
                    {companyName || ''}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Verified Contact Number</span>
                </label>
                {isEditMode ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7]"
                    placeholder=""
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 min-h-[42px] flex items-center">
                    {phone || ''}
                  </div>
                )}
              </div>

              {/* GST Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>GSTIN Identification</span>
                  </span>
                  {gstNumber?.trim() ? (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      18% ITC Active
                    </span>
                  ) : null}
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-[#54b4e7]"
                    placeholder=""
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-900 font-mono min-h-[42px] flex items-center">
                    {gstNumber || ''}
                  </div>
                )}
              </div>

              {/* Delivery Hub */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Primary Logistics / Depot Hub</span>
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7]"
                    placeholder=""
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 min-h-[42px] flex items-center">
                    {deliveryLocation || ''}
                  </div>
                )}
              </div>

              {/* Full Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  <span>Registered Billing & Consignment Address</span>
                </label>
                {isEditMode ? (
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7] resize-none"
                    placeholder=""
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed min-h-[42px]">
                    {address || ''}
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Controls inside Accordion */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetProfile}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>Clear Form Details</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Commit Updates</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export const MyProfilePage = ProfilePage;
export const AccountPage = ProfilePage;
