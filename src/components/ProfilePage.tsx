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
  Mail,
  AlertCircle,
} from 'lucide-react';

export const YOUR_API_URL_HERE = 'https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/Prod/UserData';
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
  // Exact 5 required state fields bound to React state:
  // 'username', 'contact_number', 'email_address', 'GSTIN', 'workshop_address'
  const [username, setUsername] = useState<string>(currentUser || '');
  const [contact_number, setContactNumber] = useState<string>('');
  const [email_address, setEmailAddress] = useState<string>(currentUserEmail || '');
  const [GSTIN, setGSTIN] = useState<string>('');
  const [workshop_address, setWorkshopAddress] = useState<string>('');

  // Primary user account profile state
  const [name, setName] = useState<string>(currentUser || '');
  const [userId, setUserId] = useState<string>(currentUserEmail || '');
  const [role, setRole] = useState<'Admin' | 'Partner' | 'Billing Manager' | 'Staff / Operator'>(
    currentUser && checkIsAdmin(currentUser, currentUserEmail || '') ? 'Admin' : 'Partner'
  );
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  // Extended & complementary details
  const [companyName, setCompanyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>(currentUserEmail || '');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  
  // Form and AWS settings state - closed by default whenever customer views my profile page
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // Always ensure the profile bar / accordion is closed whenever the customer views the profile page
  useEffect(() => {
    setIsExpanded(false);
  }, [currentUser]);

  // Load profile from local storage if previously written/saved
  useEffect(() => {
    const activeUser = currentUser || '';
    const lowerUser = activeUser.toLowerCase();
    const userKey = lowerUser ? `user_profile_${lowerUser}` : null;

    const savedData = userKey ? localStorage.getItem(userKey) : localStorage.getItem('user_profile');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const loadedUsername = parsed.username || parsed.userName || parsed.companyName || parsed.customerName || parsed.name || activeUser;
        const loadedContact = parsed.contact_number || parsed.contactNumber || parsed.phone || '';
        const loadedEmail = parsed.email_address || parsed.emailAddress || parsed.email || parsed.userId || currentUserEmail || '';
        const loadedGstin = parsed.GSTIN || parsed.gstin || parsed.gstNumber || '';
        const loadedAddress = parsed.workshop_address || parsed.workshopAddress || parsed.address || parsed.billingAddress || '';

        if (loadedUsername) {
          setUsername(loadedUsername);
          setName(loadedUsername);
          setCompanyName(loadedUsername);
        } else if (activeUser) {
          setUsername(activeUser.toUpperCase());
          setName(activeUser.toUpperCase());
          setCompanyName(activeUser.toUpperCase());
        }

        if (loadedContact) {
          setContactNumber(loadedContact);
          setPhone(loadedContact);
        }

        if (loadedEmail) {
          setEmailAddress(loadedEmail);
          setEmail(loadedEmail);
          setUserId(loadedEmail);
        } else if (currentUserEmail) {
          setEmailAddress(currentUserEmail);
          setEmail(currentUserEmail);
          setUserId(currentUserEmail);
        }

        if (loadedGstin) {
          setGSTIN(loadedGstin);
          setGstNumber(loadedGstin);
        }

        if (loadedAddress) {
          setWorkshopAddress(loadedAddress);
          setAddress(loadedAddress);
        }

        if (parsed.deliveryLocation) {
          setDeliveryLocation(parsed.deliveryLocation);
        }

        if (parsed.role) {
          setRole(parsed.role === 'Dealer / Partner' ? 'Partner' : parsed.role);
        }
        return;
      } catch (e) {
        console.error('Profile load error:', e);
      }
    }

    if (currentUserEmail) {
      setEmailAddress(currentUserEmail);
      setEmail(currentUserEmail);
      setUserId(currentUserEmail);
    }
    if (currentUser) {
      setUsername(currentUser.toUpperCase());
      setName(currentUser.toUpperCase());
      setCompanyName(currentUser.toUpperCase());
    }
  }, [currentUser, currentUserEmail]);

  // Recreated handler function for "Commit Updates" button
  const handleSave = async () => {
    setStatusBanner(null);

    // 1. Collect form field values
    const uName = username.trim();
    const cNumber = contact_number.trim();
    const eAddress = (email_address || userId || email).trim();
    const gNum = (GSTIN || gstNumber).trim();
    const wAddress = (workshop_address || address).trim();
    const logisticsHub = deliveryLocation.trim() || 'Central Magadh Hub';
    const customerId = (eAddress || uName.toLowerCase().replace(/\s+/g, '_') || 'customer_primary').trim();

    // 2. Visible Validation
    if (!uName) {
      const msg = 'Please enter username before committing updates.';
      setStatusBanner({ type: 'warning', message: msg });
      showToast(msg);
      return;
    }

    if (!cNumber) {
      const msg = 'Please enter contact number before committing updates.';
      setStatusBanner({ type: 'warning', message: msg });
      showToast(msg);
      setIsExpanded(true);
      return;
    }

    if (!eAddress) {
      const msg = 'Please enter email address before committing updates.';
      setStatusBanner({ type: 'warning', message: msg });
      showToast(msg);
      return;
    }

    if (!gNum) {
      const msg = 'Please enter GSTIN before committing updates.';
      setStatusBanner({ type: 'warning', message: msg });
      showToast(msg);
      setIsExpanded(true);
      return;
    }

    if (!wAddress) {
      const msg = 'Please enter workshop address before committing updates.';
      setStatusBanner({ type: 'warning', message: msg });
      showToast(msg);
      setIsExpanded(true);
      return;
    }

    // 3. Indicate loading state
    setIsSubmitting(true);
    setStatusBanner({ type: 'info', message: 'Sending updates to AWS API Gateway...' });

    // 4. Construct JSON payload with the 5 required fields:
    // username, contact_number, email_address, gstin, workshop_address,
    // plus Lambda body compatibility for event['body'] and spaced keys
    const baseFields = {
      username: uName,
      contact_number: cNumber,
      'contact number': cNumber,
      email_address: eAddress,
      'email address': eAddress,
      gstin: gNum,
      GSTIN: gNum,
      workshop_address: wAddress,
      'workshop address': wAddress,
    };

    const payload = {
      ...baseFields,
      body: {
        ...baseFields,
      },
    };

    // Keep state updated in UI and storage
    const fullProfileData = {
      ...payload,
      GSTIN: gNum,
      customer_id: customerId,
      name: name.trim() || uName,
      companyName: uName,
      deliveryLocation: logisticsHub,
      role,
      status,
      updatedAt: new Date().toISOString(),
    };

    const userKey = (uName || name.trim()).toLowerCase();
    safeSetLocalStorage(`user_profile_${userKey}`, fullProfileData);
    safeSetLocalStorage('user_profile', fullProfileData);

    if (customerAccounts && onUpdateCustomerAccounts) {
      const existingIdx = customerAccounts.findIndex(
        (c) =>
          (eAddress && c.email?.toLowerCase() === eAddress.toLowerCase()) ||
          (uName && c.customerName?.toLowerCase() === uName.toLowerCase()) ||
          (uName && c.companyName?.toLowerCase() === uName.toLowerCase())
      );

      let updatedList: CustomerAccount[];
      if (existingIdx !== -1) {
        updatedList = [...customerAccounts];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          username: uName,
          customerName: uName,
          companyName: uName,
          phone: cNumber,
          email: eAddress,
          gstNumber: gNum,
          deliveryLocation: logisticsHub,
          address: wAddress,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const accountUsername = uName || (eAddress ? eAddress.split('@')[0] : 'customer');
        const newAccount: CustomerAccount = {
          id: `cust_${Date.now()}`,
          username: accountUsername,
          customerName: uName,
          companyName: uName,
          email: eAddress,
          phone: cNumber,
          gstNumber: gNum,
          deliveryLocation: logisticsHub,
          address: wAddress,
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

    if (uName) {
      setCurrentUser(uName);
    }
    window.dispatchEvent(new Event('magadh_profile_updated'));

    // 5. Send POST request to exact invoke URL:
    // https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/Prod/UserData
    // with Content-Type application/json and JSON.stringify payload containing the 5 fields
    const targetUrl = 'https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/Prod/UserData';
    let isSuccess = false;
    let successMessage = 'Profile information committed successfully!';
    let errorMessage = '';

    console.group('%c[AWS API Gateway Invocation]', 'color: #0284c7; font-weight: bold; font-size: 13px;');
    console.log('%cInvoke URL:%c ' + targetUrl, 'color: #0284c7; font-weight: bold;', 'color: #0f172a; font-weight: normal;');
    console.log('%cHTTP Method:%c POST', 'color: #10b981; font-weight: bold;', 'color: #0f172a; font-weight: normal;');
    console.log('%cHeaders:%c { "Content-Type": "application/json" }', 'color: #6366f1; font-weight: bold;', '');
    console.log('%cPayload (5 fields):%c', 'color: #6366f1; font-weight: bold;', '', payload);

    try {
      let statusCode = 0;
      let rawData: any = null;

      try {
        // Direct POST request to AWS API Gateway Invoke URL
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        statusCode = response.status;
        try {
          rawData = await response.json();
        } catch {
          rawData = null;
        }

        console.log(`%c[Direct Fetch Result]: HTTP ${statusCode}`, response.ok ? 'color: #10b981; font-weight: bold;' : 'color: #ea580c; font-weight: bold;', rawData);

        if (statusCode === 200) {
          isSuccess = true;
          let parsedMsg = '';
          if (rawData?.message) {
            parsedMsg = rawData.message;
          } else if (typeof rawData?.body === 'string') {
            try {
              const inner = JSON.parse(rawData.body);
              if (inner?.message) parsedMsg = inner.message;
            } catch {
              // ignore
            }
          }
          if (parsedMsg) {
            successMessage = parsedMsg;
          }
        } else {
          const apiMsg = rawData?.message || rawData?.error || `Request failed with status ${statusCode}`;
          errorMessage = apiMsg;
        }
      } catch (directErr: any) {
        // Fallback to proxy route which forwards to the exact AWS endpoint without browser cross-origin limits
        console.warn('[Direct Fetch Notice] Invoking via server proxy for AWS endpoint:', directErr?.message);

        const proxyResponse = await fetch('/api/profile/sync-aws', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            endpoint: targetUrl,
          }),
        });

        try {
          const proxyJson = await proxyResponse.json();
          statusCode = proxyJson?.awsStatus || (proxyResponse.ok ? 200 : proxyResponse.status);
          rawData = proxyJson?.data || proxyJson;

          console.log(`%c[Proxy Result]: AWS HTTP ${statusCode}`, statusCode === 200 ? 'color: #10b981; font-weight: bold;' : 'color: #ea580c; font-weight: bold;', rawData);

          if (statusCode === 200 || proxyJson?.awsSynced) {
            isSuccess = true;
            let parsedMsg = '';
            if (rawData?.message) {
              parsedMsg = rawData.message;
            } else if (typeof rawData?.body === 'string') {
              try {
                const inner = JSON.parse(rawData.body);
                if (inner?.message) parsedMsg = inner.message;
              } catch {
                // ignore
              }
            }
            if (parsedMsg) {
              successMessage = parsedMsg;
            }
          } else {
            errorMessage = rawData?.message || proxyJson?.diagnostic || `Request failed with status ${statusCode}`;
          }
        } catch {
          if (proxyResponse.ok) {
            isSuccess = true;
          } else {
            errorMessage = `Request failed with status ${proxyResponse.status}`;
          }
        }
      }
    } catch (err: any) {
      isSuccess = false;
      errorMessage = err?.message || 'Failed to connect to AWS API Gateway';
      console.error('[Commit Updates Error]:', err);
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }

    // 6. If response status is two hundred, show a success message; if error, display error message clearly
    if (isSuccess) {
      setIsSaved(true);
      setStatusBanner({
        type: 'success',
        message: successMessage,
      });
      showToast(successMessage);
      setTimeout(() => setIsSaved(false), 4000);
    } else {
      const displayError = errorMessage || 'Endpoint unreachable';
      setStatusBanner({
        type: 'error',
        message: `Failed to commit updates: ${displayError}`,
      });
      showToast(`Failed to commit updates: ${displayError}`);
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
    setUsername('');
    setContactNumber('');
    setEmailAddress('');
    setGSTIN('');
    setWorkshopAddress('');
    setName('');
    setUserId('');
    setEmail('');
    setCompanyName('');
    setPhone('');
    setGstNumber('');
    setDeliveryLocation('');
    setAddress('');
    setStatusBanner(null);
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

      {/* Real-time Status & Feedback Banner */}
      {statusBanner && (
        <div
          id="profile-status-banner"
          className={`px-4 py-3 rounded-2xl border text-sm font-medium flex items-center justify-between shadow-xs transition-all ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusBanner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : statusBanner.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : statusBanner.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : statusBanner.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 text-sky-600 shrink-0 animate-spin" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 ml-3 px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        
        {/* ROW 1: Name / username */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700">
            Name
          </div>
          <div className="flex-1 text-right sm:text-left">
            {isEditMode ? (
              <input
                type="text"
                value={username || name}
                onChange={(e) => {
                  setName(e.target.value);
                  setUsername(e.target.value);
                  setCompanyName(e.target.value);
                }}
                className="w-full sm:w-4/5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm sm:text-base font-semibold text-slate-900 uppercase focus:outline-none focus:border-[#54b4e7]"
                placeholder=""
              />
            ) : (
              <span className="text-sm sm:text-base font-medium text-slate-900 uppercase tracking-wide">
                {username || name || ''}
              </span>
            )}
          </div>
        </div>

        {/* ROW 2: User ID / email_address */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700 leading-tight">
            User<br />ID
          </div>
          <div className="flex-1 text-right sm:text-left">
            {isEditMode ? (
              <input
                type="email"
                value={email_address || userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setEmail(e.target.value);
                  setEmailAddress(e.target.value);
                }}
                className="w-full sm:w-4/5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm sm:text-base font-normal text-slate-900 lowercase focus:outline-none focus:border-[#54b4e7]"
                placeholder=""
              />
            ) : (
              <span className="text-sm sm:text-base font-normal text-slate-900 lowercase break-all">
                {email_address || userId || ''}
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

            {/* Detailed Grid with explicit keys: 'username', 'contact_number', 'email_address', 'GSTIN', 'workshop_address' */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Field 1: username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Username</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setName(e.target.value);
                    setCompanyName(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7] shadow-xs"
                  placeholder="Enter username (e.g. Himanshu Verma)"
                />
              </div>

              {/* Field 2: contact_number */}
              <div className="space-y-1.5">
                <label htmlFor="contact_number" className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact Number</span>
                </label>
                <input
                  id="contact_number"
                  name="contact_number"
                  type="tel"
                  value={contact_number}
                  onChange={(e) => {
                    setContactNumber(e.target.value);
                    setPhone(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7] shadow-xs"
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              {/* Field 3: email_address */}
              <div className="space-y-1.5">
                <label htmlFor="email_address" className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email Address</span>
                </label>
                <input
                  id="email_address"
                  name="email_address"
                  type="email"
                  value={email_address}
                  onChange={(e) => {
                    setEmailAddress(e.target.value);
                    setEmail(e.target.value);
                    setUserId(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 lowercase focus:outline-none focus:border-[#54b4e7] shadow-xs"
                  placeholder="user@example.com"
                />
              </div>

              {/* Field 4: GSTIN */}
              <div className="space-y-1.5">
                <label htmlFor="GSTIN" className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>GSTIN</span>
                </label>
                <input
                  id="GSTIN"
                  name="GSTIN"
                  type="text"
                  value={GSTIN}
                  onChange={(e) => {
                    setGSTIN(e.target.value.toUpperCase());
                    setGstNumber(e.target.value.toUpperCase());
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-[#54b4e7] font-mono shadow-xs"
                  placeholder="e.g. 21AAACM1234F1Z5"
                />
              </div>

              {/* Field 5: workshop_address */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="workshop_address" className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  <span>Workshop Address</span>
                </label>
                <textarea
                  id="workshop_address"
                  name="workshop_address"
                  rows={2}
                  value={workshop_address}
                  onChange={(e) => {
                    setWorkshopAddress(e.target.value);
                    setAddress(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7] resize-none shadow-xs"
                  placeholder="e.g. Workshop / Factory Address, Street, City, State - PIN"
                />
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
