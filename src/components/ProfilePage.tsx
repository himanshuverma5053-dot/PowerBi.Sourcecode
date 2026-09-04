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
  Edit3,
  Loader2,
  Cloud,
  User,
  Mail
} from 'lucide-react';

export const YOUR_API_URL_HERE = 'https://wsl820vpr8.execute-api.us-east-1.amazonaws.com/DataAPI';
export const AWS_PROFILE_INVOKE_URL = YOUR_API_URL_HERE;

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
  const [email, setEmail] = useState<string>(currentUserEmail || '');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  
  // Form and AWS settings state - directly open & editable by default
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);



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
          setEmail(parsed.email || parsed.userId);
        } else if (currentUserEmail) {
          setUserId(currentUserEmail);
          setEmail(currentUserEmail);
        }
        if (parsed.emailAddress) {
          setEmail(parsed.emailAddress);
          setUserId(parsed.emailAddress);
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
      setEmail(currentUserEmail);
    }
    if (currentUser) {
      setName(currentUser.toUpperCase());
    }
  }, [currentUser, currentUserEmail]);

  // Handle Save / Commit Updates with API endpoint
  const handleSave = async () => {
    // 1. Collect values from required input fields
    const firmName = companyName.trim();
    const contactNumber = phone.trim();
    const emailAddress = (email || userId).trim();
    const gstin = gstNumber.trim();
    const logisticsHub = deliveryLocation.trim();
    const billingAddress = address.trim();

    // 2. Validation: none of the fields should be empty
    if (!firmName) {
      showToast('Please enter your User Name.');
      return;
    }

    if (!contactNumber) {
      showToast('Please enter your Contact Number.');
      return;
    }

    // Validation: contact number should be a valid number format
    const cleanPhoneDigits = contactNumber.replace(/[\s\-\(\)]/g, '');
    const isValidPhone = /^\+?[0-9]{7,15}$/.test(cleanPhoneDigits);
    if (!isValidPhone) {
      showToast('Please enter a valid contact number format (e.g. +91 9876543210).');
      return;
    }

    if (!emailAddress) {
      showToast('Please enter your Email Address.');
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
    if (!isValidEmail) {
      showToast('Please enter a valid email address.');
      return;
    }

    if (!gstin) {
      showToast('Please enter your GSTIN.');
      return;
    }

    if (!billingAddress) {
      showToast('Please enter your Workshop Address.');
      return;
    }

    // 3. Show loading state on button
    setIsSubmitting(true);

    // 4. Construct JSON payload with clear key names matching each field
    const payload = {
      userName: firmName,
      firmName,
      contactNumber,
      emailAddress,
      email: emailAddress,
      gstin,
      workshopAddress: billingAddress,
      billingAddress,
      // Complementary aliases for state & storage sync
      companyName: firmName,
      phone: contactNumber,
      gstNumber: gstin,
      address: billingAddress,
      customerName: name.trim() || firmName,
      name: name.trim() || firmName,
      userId: emailAddress,
      role,
      status,
      updatedAt: new Date().toISOString(),
    };

    // Always persist to local storage so user data is instantly preserved
    const userKey = (name.trim() || firmName).toLowerCase();
    safeSetLocalStorage(`user_profile_${userKey}`, payload);
    safeSetLocalStorage('user_profile', payload);

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
          customerName: name.trim() || firmName,
          companyName: firmName,
          phone: contactNumber,
          email: userId,
          gstNumber: gstin,
          deliveryLocation: logisticsHub,
          address: billingAddress,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const username = name.trim() || (userId ? userId.split('@')[0] : 'customer');
        const newAccount: CustomerAccount = {
          id: `cust_${Date.now()}`,
          username,
          customerName: name.trim() || firmName,
          companyName: firmName,
          email: userId,
          phone: contactNumber,
          gstNumber: gstin,
          deliveryLocation: logisticsHub,
          address: billingAddress,
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

    // 5. Invoke API endpoint: YOUR_API_URL_HERE
    let requestSucceeded = false;
    let failureReason = '';
    const targetUrl = YOUR_API_URL_HERE;

    console.group('%c[Commit Updates] API Invocation', 'color: #0284c7; font-weight: bold; font-size: 13px;');
    console.log('%cTarget Endpoint:%c ' + targetUrl, 'color: #0284c7; font-weight: bold;', 'color: #0f172a; font-weight: normal;');
    console.log('%cHTTP Method:%c POST', 'color: #10b981; font-weight: bold;', 'color: #0f172a; font-weight: normal;');
    console.log('%cJSON Body:%c', 'color: #6366f1; font-weight: bold;', '', payload);

    try {
      let response: Response | null = null;
      let rawData: any = null;

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      try {
        console.log('%c[1/2] Attempting direct fetch to API endpoint...', 'color: #0284c7;');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        response = await fetch(targetUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        console.log(`%c[Direct Fetch Result]: HTTP ${response.status} ${response.statusText}`, response.ok ? 'color: #10b981; font-weight: bold;' : 'color: #ea580c; font-weight: bold;');
        try {
          rawData = await response.json();
          console.log('[Direct Fetch Response Data]:', rawData);
        } catch {
          rawData = null;
        }

        if (response.ok) {
          requestSucceeded = true;
        } else {
          failureReason = rawData?.message || rawData?.error || `HTTP ${response.status} ${response.statusText || ''}`.trim();
        }
      } catch (browserFetchErr: any) {
        // Fallback to server-side proxy in case of browser CORS restriction or network block
        console.warn('%c[Direct Fetch Blocked / Error]:%c ' + (browserFetchErr?.message || 'CORS / Preflight failure'), 'color: #ea580c; font-weight: bold;', 'color: #475569;');
        console.log('%c[2/2] Invoking via server-side proxy (/api/profile/sync-aws)...', 'color: #0284c7; font-weight: bold;');

        const proxyResponse = await fetch('/api/profile/sync-aws', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            endpoint: targetUrl,
          }),
        });

        response = proxyResponse;
        try {
          const proxyJson = await proxyResponse.json();
          rawData = proxyJson?.data || proxyJson;
          console.log(`%c[Server Proxy Result]: AWS HTTP ${proxyJson?.awsStatus || proxyResponse.status}`, proxyJson?.success ? 'color: #10b981; font-weight: bold;' : 'color: #ef4444; font-weight: bold;', rawData);
          if (proxyJson && proxyJson.success) {
            requestSucceeded = true;
          } else {
            failureReason = rawData?.message || proxyJson?.message || `HTTP ${proxyJson?.awsStatus || proxyResponse.status}`;
          }
        } catch {
          rawData = null;
          if (proxyResponse.ok) {
            requestSucceeded = true;
          } else {
            failureReason = `HTTP ${proxyResponse.status}`;
          }
        }
      }
    } catch (err: any) {
      requestSucceeded = false;
      failureReason = err?.message || 'Network unreachable';
      console.error('[Commit Updates Error]:', err);
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }

    // 6. User feedback on success or failure
    if (requestSucceeded) {
      setIsSaved(true);
      showToast('Enterprise details and billing profile committed successfully!');
      setTimeout(() => setIsSaved(false), 3500);
    } else {
      showToast(`Failed to commit updates: ${failureReason || 'Endpoint unreachable'}`);
    }
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
    setEmail('');
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
          <h1 id="user-access-management-heading" className="text-2xl sm:text-3xl lg:text-4xl font-normal font-poppins text-[#5f6368] leading-tight tracking-tight">
            User Access<br />Management
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
          <div className="flex items-center justify-end space-x-3 sm:space-x-5 text-slate-800">
            {/* Status reaction pill */}
            {isSaved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Committed</span>
              </span>
            )}
            
            {/* Save Icon */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              title={isSaved ? 'Profile Committed & Synced!' : 'Save & Commit Profile'}
              className={`p-1.5 rounded-xl cursor-pointer ${
                isSaved
                  ? 'text-emerald-700 bg-emerald-100 ring-1 ring-emerald-400'
                  : 'text-slate-700 hover:text-[#54b4e7] hover:bg-slate-100'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 stroke-[2] text-[#54b4e7]" />
              ) : isSaved ? (
                <CheckCircle2 className="w-6 h-6 stroke-[2.2] text-emerald-600" />
              ) : (
                <Save className="w-6 h-6 stroke-[1.8]" />
              )}
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
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 py-3 sm:py-4 border-b border-slate-200">
              <div className="py-0.5">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center space-x-2.5 tracking-tight">
                  <Building2 className="w-5 h-5 text-slate-700" />
                  <span>Billing Details</span>
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isEditMode ? 'Exit Edit Mode' : 'Edit Full Profile'}</span>
                </button>
              </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* User Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>User Name</span>
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

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact Number</span>
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

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email Address</span>
                </label>
                {isEditMode ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setUserId(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 lowercase focus:outline-none focus:border-[#54b4e7]"
                    placeholder=""
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 lowercase min-h-[42px] flex items-center break-all">
                    {email || userId || ''}
                  </div>
                )}
              </div>

              {/* GSTIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>GSTIN</span>
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

              {/* Workshop Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  <span>Workshop Address</span>
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

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <div className="hidden sm:flex items-center text-[10px] text-slate-400 gap-1 font-mono pr-1" title={AWS_PROFILE_INVOKE_URL}>
                  <Cloud className="w-3.5 h-3.5 text-sky-500" />
                  <span>AWS Cloud Sync</span>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-2 select-none cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : isSubmitting
                      ? 'bg-sky-600 text-white opacity-80 cursor-wait'
                      : 'bg-[#54b4e7] hover:bg-[#3ea5dc] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-white" />
                      <span className="tracking-wide">Committing Updates...</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span className="tracking-wide">Updates Committed</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="tracking-wide">Commit Updates</span>
                    </>
                  )}
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
