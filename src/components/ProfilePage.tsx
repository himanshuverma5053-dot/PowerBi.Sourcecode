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
  Home,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Loader2,
  Cloud,
  User,
  Mail
} from 'lucide-react';

/*
 * AWS API Gateway endpoint
 * API Gateway -> Lambda -> DynamoDB
 */
export const YOUR_API_URL_HERE =
  'https://wsl820vpr8.execute-api.us-east-1.amazonaws.com/DataAPI';

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
  /*
   * These five fields correspond directly to the
   * Lambda / DynamoDB fields.
   */
  const [username, setUsername] = useState<string>(currentUser || '');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>(
    currentUserEmail || ''
  );
  const [gstin, setGstin] = useState<string>('');
  const [workshopAddress, setWorkshopAddress] = useState<string>('');

  /* Existing profile/UI state */
  const [name, setName] = useState<string>(currentUser || '');
  const [userId, setUserId] = useState<string>(currentUserEmail || '');

  const [role, setRole] = useState<
    'Admin' | 'Partner' | 'Billing Manager' | 'Staff / Operator'
  >(
    currentUser &&
      checkIsAdmin(currentUser, currentUserEmail || '')
      ? 'Admin'
      : 'Partner'
  );

  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const [companyName, setCompanyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>(currentUserEmail || '');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /*
   * Keep accordion closed when changing user.
   */
  useEffect(() => {
    setIsExpanded(false);
  }, [currentUser]);

  /*
   * Load locally saved profile.
   */
  useEffect(() => {
    const activeUser = currentUser || '';
    const lowerUser = activeUser.toLowerCase();

    const userKey = lowerUser
      ? `user_profile_${lowerUser}`
      : null;

    const savedData = userKey
      ? localStorage.getItem(userKey)
      : localStorage.getItem('user_profile');

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        const loadedUsername =
          parsed.username ||
          parsed.userName ||
          parsed.companyName ||
          parsed.customerName ||
          parsed.name ||
          activeUser;

        const loadedContact =
          parsed.contact_number ||
          parsed.contactNumber ||
          parsed.phone ||
          '';

        const loadedEmail =
          parsed.email_address ||
          parsed.emailAddress ||
          parsed.email ||
          parsed.userId ||
          currentUserEmail ||
          '';

        const loadedGstin =
          parsed.GSTIN ||
          parsed.gstin ||
          parsed.gstNumber ||
          '';

        const loadedAddress =
          parsed.workshop_address ||
          parsed.workshopAddress ||
          parsed.address ||
          parsed.billingAddress ||
          '';

        if (loadedUsername) {
          setUsername(loadedUsername);
          setName(loadedUsername);
          setCompanyName(loadedUsername);
        } else if (activeUser) {
          const formattedUser = activeUser.toUpperCase();

          setUsername(formattedUser);
          setName(formattedUser);
          setCompanyName(formattedUser);
        }

        if (loadedContact) {
          setContactNumber(loadedContact);
          setPhone(loadedContact);
        }

        if (loadedEmail) {
          setEmailAddress(loadedEmail);
          setEmail(loadedEmail);
          setUserId(loadedEmail);
        }

        if (loadedGstin) {
          setGstin(loadedGstin);
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
          setRole(
            parsed.role === 'Dealer / Partner'
              ? 'Partner'
              : parsed.role
          );
        }

        return;
      } catch (error) {
        console.error('Profile load error:', error);
      }
    }

    if (currentUserEmail) {
      setEmailAddress(currentUserEmail);
      setEmail(currentUserEmail);
      setUserId(currentUserEmail);
    }

    if (currentUser) {
      const formattedUser = currentUser.toUpperCase();

      setUsername(formattedUser);
      setName(formattedUser);
      setCompanyName(formattedUser);
    }
  }, [currentUser, currentUserEmail]);

  /*
   * SAVE PROFILE
   *
   * Frontend
   *    ↓
   * API Gateway
   *    ↓
   * Lambda
   *    ↓
   * DynamoDB
   *
   * Exact DynamoDB/Lambda fields:
   * username
   * contact_number
   * email_address
   * GSTIN
   * workshop_address
   */
  const handleSave = async () => {
    const uName = username.trim();
    const cNumber = contactNumber.trim();
    const eAddress = (
      emailAddress ||
      userId ||
      email
    ).trim();

    const gNum = (
      gstin ||
      gstNumber
    ).trim().toUpperCase();

    const wAddress = (
      workshopAddress ||
      address
    ).trim();

    /*
     * Use email as the customer ID when available.
     * Otherwise generate a stable customer ID from username.
     */
    const customerId =
      (
        userId ||
        currentUserEmail ||
        `cust_${uName
          .toLowerCase()
          .replace(/\s+/g, '_')}`
      ).trim();

    /*
     * Validation
     */
    if (!uName) {
      showToast('Please enter your username.');
      return;
    }

    if (!cNumber) {
      showToast('Please enter your contact number.');
      return;
    }

    const cleanPhoneDigits = cNumber.replace(
      /[\s\-\(\)]/g,
      ''
    );

    const isValidPhone =
      /^\+?[0-9]{7,15}$/.test(cleanPhoneDigits);

    if (!isValidPhone) {
      showToast(
        'Please enter a valid contact number format (e.g. +91 9876543210).'
      );
      return;
    }

    if (!eAddress) {
      showToast('Please enter your email address.');
      return;
    }

    const isValidEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eAddress);

    if (!isValidEmail) {
      showToast('Please enter a valid email address.');
      return;
    }

    if (!gNum) {
      showToast('Please enter your GSTIN.');
      return;
    }

    if (!wAddress) {
      showToast('Please enter your workshop address.');
      return;
    }

    setIsSubmitting(true);

    /*
     * IMPORTANT:
     *
     * This is the payload sent to API Gateway.
     *
     * These names MUST match Lambda/DynamoDB:
     *
     * username
     * contact_number
     * email_address
     * GSTIN
     * workshop_address
     */
    const payload = {
      customer_id: customerId,
      username: uName,
      contact_number: cNumber,
      email_address: eAddress,
      GSTIN: gNum,
      workshop_address: wAddress,
    };

    /*
     * Local application data can still contain the
     * additional information needed by the frontend.
     *
     * This DOES NOT get sent to AWS.
     */
    const localProfileData = {
      ...payload,

      userName: uName,
      firmName: uName,
      companyName: uName,

      contactNumber: cNumber,
      phone: cNumber,

      emailAddress: eAddress,
      email: eAddress,
      userId: eAddress,

      gstNumber: gNum,

      workshopAddress: wAddress,
      billingAddress: wAddress,
      address: wAddress,

      customerName: name.trim() || uName,
      name: name.trim() || uName,

      deliveryLocation:
        deliveryLocation.trim() ||
        'Central Magadh Hub',

      role,
      status,

      updatedAt: new Date().toISOString(),
    };

    /*
     * Save locally immediately.
     */
    const localUserKey = (
      uName ||
      name.trim()
    ).toLowerCase();

    safeSetLocalStorage(
      `user_profile_${localUserKey}`,
      localProfileData
    );

    safeSetLocalStorage(
      'user_profile',
      localProfileData
    );

    /*
     * Update frontend customer account state.
     */
    if (
      customerAccounts &&
      onUpdateCustomerAccounts
    ) {
      const existingIdx =
        customerAccounts.findIndex(
          (c) =>
            (
              eAddress &&
              c.email?.toLowerCase() ===
                eAddress.toLowerCase()
            ) ||
            (
              uName &&
              c.customerName?.toLowerCase() ===
                uName.toLowerCase()
            ) ||
            (
              uName &&
              c.companyName?.toLowerCase() ===
                uName.toLowerCase()
            )
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

          deliveryLocation:
            deliveryLocation.trim() ||
            'Central Magadh Hub',

          address: wAddress,

          updatedAt:
            new Date().toISOString(),
        };
      } else {
        const accountUsername =
          uName ||
          (
            eAddress
              ? eAddress.split('@')[0]
              : 'customer'
          );

        const newAccount: CustomerAccount = {
          id: `cust_${Date.now()}`,

          username: accountUsername,
          customerName: uName,
          companyName: uName,

          email: eAddress,
          phone: cNumber,

          gstNumber: gNum,

          deliveryLocation:
            deliveryLocation.trim() ||
            'Central Magadh Hub',

          address: wAddress,

          accountStatus:
            status === 'Active'
              ? 'Active'
              : 'Suspended',

          pricingType: 'gst',

          creditEnabled: true,
          creditLimit: 500000,
          usedCredit: 0,

          paymentTermsDays: 30,
          dueDaysGrace: 5,

          createdAt:
            new Date().toISOString(),
        };

        updatedList = [
          newAccount,
          ...customerAccounts,
        ];
      }

      onUpdateCustomerAccounts(updatedList);
    }

    /*
     * Update current username.
     */
    if (uName) {
      setCurrentUser(uName);
    }

    /*
     * Notify other frontend components.
     */
    window.dispatchEvent(
      new Event('magadh_profile_updated')
    );

    /*
     * ------------------------------------------------
     * API GATEWAY REQUEST
     * ------------------------------------------------
     */
    let requestSucceeded = false;
    let failureReason = '';

    try {
      console.group(
        '[Magadh Tyres] Profile API Request'
      );

      console.log(
        'API URL:',
        YOUR_API_URL_HERE
      );

      console.log(
        'Method:',
        'POST'
      );

      console.log(
        'Payload:',
        payload
      );

      /*
       * Direct browser request.
       *
       * API Gateway must have CORS configured
       * to allow your frontend origin.
       */
      const controller =
        new AbortController();

      const timeoutId = window.setTimeout(
        () => controller.abort(),
        10000
      );

      const response = await fetch(
        YOUR_API_URL_HERE,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body: JSON.stringify(payload),

          signal:
            controller.signal,
        }
      );

      window.clearTimeout(timeoutId);

      /*
       * Try to read JSON response.
       */
      let responseData: any = null;

      try {
        responseData =
          await response.json();
      } catch {
        responseData = null;
      }

      console.log(
        'API HTTP Status:',
        response.status
      );

      console.log(
        'API Response:',
        responseData
      );

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
          responseData?.error ||
          `HTTP ${response.status}`
        );
      }

      requestSucceeded = true;

      console.log(
        'Profile successfully sent to API Gateway.'
      );

      console.groupEnd();
    } catch (error: any) {
      console.error(
        '[Magadh Tyres] Profile API Error:',
        error
      );

      failureReason =
        error?.name === 'AbortError'
          ? 'API request timed out.'
          : error?.message ||
            'Unable to reach API Gateway.';

      console.groupEnd();
    } finally {
      setIsSubmitting(false);
    }

    /*
     * User feedback.
     */
    if (requestSucceeded) {
      setIsSaved(true);

      showToast(
        'Profile saved successfully and synced with AWS!'
      );

      setTimeout(() => {
        setIsSaved(false);
      }, 3500);
    } else {
      showToast(
        `Profile saved locally, but AWS sync failed: ${
          failureReason ||
          'API Gateway unreachable.'
        }`
      );
    }
  };

  /*
   * Toggle account status.
   */
  const handleToggleStatus = () => {
    const newStatus =
      status === 'Active'
        ? 'Inactive'
        : 'Active';

    setStatus(newStatus);

    showToast(
      `User status updated to: ${newStatus}`
    );
  };

  /*
   * Clear profile.
   */
  const handleResetProfile = () => {
    setUsername('');
    setContactNumber('');
    setEmailAddress('');
    setGstin('');
    setWorkshopAddress('');

    setName('');
    setUserId('');
    setEmail('');

    setCompanyName('');
    setPhone('');
    setGstNumber('');
    setDeliveryLocation('');
    setAddress('');

    localStorage.removeItem(
      'user_profile'
    );

    if (currentUser) {
      localStorage.removeItem(
        `user_profile_${currentUser.toLowerCase()}`
      );
    }

    setCurrentUser('');

    showToast(
      'Profile form cleared.'
    );
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in font-sans">

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            id="user-access-management-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-normal font-poppins text-[#5f6368] leading-tight tracking-tight"
          >
            User Access
            <br />
            Management
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

        {/* Name */}
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
              />
            ) : (
              <span className="text-sm sm:text-base font-medium text-slate-900 uppercase tracking-wide">
                {username || name || ''}
              </span>
            )}
          </div>
        </div>

        {/* User ID */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700 leading-tight">
            User
            <br />
            ID
          </div>

          <div className="flex-1 text-right sm:text-left">
            {isEditMode ? (
              <input
                type="email"
                value={emailAddress || userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setEmail(e.target.value);
                  setEmailAddress(e.target.value);
                }}
                className="w-full sm:w-4/5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm sm:text-base font-normal text-slate-900 lowercase focus:outline-none focus:border-[#54b4e7]"
              />
            ) : (
              <span className="text-sm sm:text-base font-normal text-slate-900 lowercase break-all">
                {emailAddress || userId || ''}
              </span>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700">
            Role
          </div>

          <div className="flex-1 text-right sm:text-left flex items-center justify-end sm:justify-start space-x-2">
            {isEditMode ? (
              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value as
                      | 'Admin'
                      | 'Partner'
                      | 'Billing Manager'
                      | 'Staff / Operator'
                  )
                }
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:border-[#54b4e7]"
              >
                <option value="Admin">
                  Admin
                </option>
                <option value="Partner">
                  Partner
                </option>
                <option value="Billing Manager">
                  Billing Manager
                </option>
                <option value="Staff / Operator">
                  Staff / Operator
                </option>
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

        {/* Action */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6">
          <div className="w-1/3 sm:w-1/4 text-sm sm:text-base font-normal text-slate-700">
            Action
          </div>

          <div className="flex items-center justify-end space-x-3 sm:space-x-5 text-slate-800">

            {isSaved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Committed</span>
              </span>
            )}

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              title={
                isSaved
                  ? 'Profile Committed & Synced!'
                  : 'Save & Commit Profile'
              }
              className={`p-1.5 rounded-xl cursor-pointer ${
                isSaved
                  ? 'text-emerald-700 bg-emerald-100 ring-1 ring-emerald-400'
                  : 'text-slate-700 hover:text-[#54b4e7] hover:bg-slate-100'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 stroke-[2] text-[#54b4e7] animate-spin" />
              ) : isSaved ? (
                <CheckCircle2 className="w-6 h-6 stroke-[2.2] text-emerald-600" />
              ) : (
                <Save className="w-6 h-6 stroke-[1.8]" />
              )}
            </button>

            {/* Status */}
            <button
              type="button"
              onClick={handleToggleStatus}
              title={
                status === 'Active'
                  ? 'Deactivate Access'
                  : 'Reactivate Access'
              }
              className={`p-1 active:scale-90 transition-all cursor-pointer ${
                status === 'Active'
                  ? 'text-slate-700 hover:text-red-500'
                  : 'text-red-500 hover:text-emerald-600'
              }`}
            >
              <MinusCircle className="w-6 h-6 stroke-[1.8]" />
            </button>

            {/* Expand */}
            <button
              type="button"
              onClick={() =>
                setIsExpanded(!isExpanded)
              }
              title={
                isExpanded
                  ? 'Collapse Details'
                  : 'Expand Details'
              }
              className="p-1 text-slate-900 hover:text-slate-700 active:scale-90 transition-transform duration-200 cursor-pointer"
            >
              <ChevronDown
                className={`w-7 h-7 stroke-[2.75] transition-transform duration-200 ${
                  isExpanded
                    ? 'rotate-180'
                    : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <div className="bg-slate-50/70 border-t border-slate-200 px-6 sm:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">

            {/* Billing Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 py-3 sm:py-4 border-b border-slate-200">
              <div className="py-0.5">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center space-x-2.5 tracking-tight">
                  <Building2 className="w-5 h-5 text-slate-700" />
                  <span>
                    Billing Details
                  </span>
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setIsEditMode(
                      !isEditMode
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />

                  <span>
                    {isEditMode
                      ? 'Exit Edit Mode'
                      : 'Edit Full Profile'}
                  </span>
                </button>
              </div>
            </div>

            {/* Backend Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* username */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Username</span>
                </label>

                {isEditMode ? (
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(
                        e.target.value
                      );
                      setName(
                        e.target.value
                      );
                      setCompanyName(
                        e.target.value
                      );
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7]"
                    placeholder="Enter username"
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 min-h-[42px] flex items-center">
                    {username || ''}
                  </div>
                )}
              </div>

              {/* contact_number */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact_number"
                  className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Contact Number
                  </span>
                </label>

                {isEditMode ? (
                  <input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => {
                      setContactNumber(
                        e.target.value
                      );
                      setPhone(
                        e.target.value
                      );
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7]"
                    placeholder="+91 9876543210"
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 min-h-[42px] flex items-center">
                    {contactNumber || ''}
                  </div>
                )}
              </div>

              {/* email_address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email_address"
                  className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Email Address
                  </span>
                </label>

                {isEditMode ? (
                  <input
                    id="email_address"
                    name="email_address"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(
                        e.target.value
                      );
                      setEmail(
                        e.target.value
                      );
                      setUserId(
                        e.target.value
                      );
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 lowercase focus:outline-none focus:border-[#54b4e7]"
                    placeholder="user@example.com"
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 lowercase min-h-[42px] flex items-center break-all">
                    {emailAddress || ''}
                  </div>
                )}
              </div>

              {/* GSTIN */}
              <div className="space-y-1.5">
                <label
                  htmlFor="GSTIN"
                  className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>GSTIN</span>
                </label>

                {isEditMode ? (
                  <input
                    id="GSTIN"
                    name="GSTIN"
                    type="text"
                    value={gstin}
                    onChange={(e) => {
                      const value =
                        e.target.value.toUpperCase();

                      setGstin(value);
                      setGstNumber(value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-[#54b4e7]"
                    placeholder="21AAACM1234F1Z5"
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-900 font-mono min-h-[42px] flex items-center">
                    {gstin || ''}
                  </div>
                )}
              </div>

              {/* workshop_address */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="workshop_address"
                  className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5"
                >
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Workshop Address
                  </span>
                </label>

                {isEditMode ? (
                  <textarea
                    id="workshop_address"
                    name="workshop_address"
                    rows={2}
                    value={workshopAddress}
                    onChange={(e) => {
                      setWorkshopAddress(
                        e.target.value
                      );
                      setAddress(
                        e.target.value
                      );
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#54b4e7] resize-none"
                    placeholder="Workshop / Factory Address, Street, City, State - PIN"
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed min-h-[42px]">
                    {workshopAddress || ''}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">

              <button
                type="button"
                onClick={handleResetProfile}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />

                <span>
                  Clear Form Details
                </span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">

                <div
                  className="hidden sm:flex items-center text-[10px] text-slate-400 gap-1 font-mono pr-1"
                  title={AWS_PROFILE_INVOKE_URL}
                >
                  <Cloud className="w-3.5 h-3.5 text-sky-500" />

                  <span>
                    AWS Cloud Sync
                  </span>
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
                      <Loader2 className="w-4 h-4 text-white animate-spin" />

                      <span className="tracking-wide">
                        Committing Updates...
                      </span>
                    </>
                  ) : isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />

                      <span className="tracking-wide">
                        Updates Committed
                      </span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />

                      <span className="tracking-wide">
                        Commit Updates
                      </span>
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
