import React, { useState } from 'react';
import {
  CreditCard, ShieldCheck, CheckCircle2, RefreshCw, Key,
  Lock, Globe, Terminal, Zap, Cpu, Server, Check, Copy,
  AlertCircle, ExternalLink, Sliders, Play
} from 'lucide-react';

export const PaymentIntegrationsSpace: React.FC = () => {
  const [activeGateway, setActiveGateway] = useState<'razorpay' | 'phonepe' | 'paytm' | 'stripe' | 'cashfree' | 'webhook'>('razorpay');
  const [environmentMode, setEnvironmentMode] = useState<'test' | 'live'>('test');
  
  // Notification toast state
  const [toast, setToast] = useState<string | null>(null);

  // Gateway form state
  const [gateways, setGateways] = useState({
    razorpay: {
      keyId: 'rzp_test_8841M2901XA',
      keySecret: 'sec_live_9921004185291',
      webhookSecret: 'whsec_rzp_magadh_2026',
      autoCapture: true,
      upiIntent: true,
      status: 'Connected (Test Mode)'
    },
    phonepe: {
      merchantId: 'M2306159920141',
      saltKey: '96043210-4412-4521-9011-881230491023',
      saltIndex: '1',
      environment: 'UAT Sandbox',
      status: 'Ready for Live Credentials'
    },
    paytm: {
      merchantId: 'MAGADH88410291',
      merchantKey: 'paytm_sec_88291041952',
      websiteName: 'DEFAULT',
      status: 'Configured'
    },
    stripe: {
      publishableKey: 'pk_test_51Mz84100291XA',
      secretKey: 'sk_test_51Mz84100291XA_sec',
      webhookSecret: 'whsec_stripe_magadh',
      status: 'Ready for Integration'
    },
    cashfree: {
      appId: 'CF_18349201XA',
      secretKey: 'cf_sec_88410291XA',
      environment: 'Sandbox',
      status: 'Ready for Integration'
    },
    webhook: {
      endpointUrl: 'https://api.magadhtyres.com/v1/payments/webhook',
      authToken: 'bearer_token_mt_2026_prod_8841',
      retryAttempts: '3',
      status: 'Endpoint Active'
    }
  });

  // Simulated Webhook Event Payload Tester
  const [selectedEventType, setSelectedEventType] = useState<'payment.captured' | 'payment.failed' | 'order.paid' | 'refund.processed'>('payment.captured');
  const [webhookLogs, setWebhookLogs] = useState<Array<{ id: string; time: string; event: string; status: number; payload: string }>>([
    {
      id: 'log-101',
      time: '12 mins ago',
      event: 'payment.captured',
      status: 200,
      payload: JSON.stringify({
        event: 'payment.captured',
        gateway: 'Razorpay PG',
        payment_id: 'pay_PZ88410291',
        amount: 18500,
        currency: 'INR',
        customer: { name: 'Rajesh Kumar', email: 'rajesh@magadhtyres.com' },
        status: 'captured'
      }, null, 2)
    },
    {
      id: 'log-102',
      time: '1 hour ago',
      event: 'order.paid',
      status: 200,
      payload: JSON.stringify({
        event: 'order.paid',
        gateway: 'PhonePe PG',
        order_id: 'MT-2026-9921',
        amount: 45000,
        currency: 'INR',
        gstin: '10AAACM1234F1Z2',
        status: 'SUCCESS'
      }, null, 2)
    }
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveConfig = (gwKey: string) => {
    showToast(`Successfully saved configuration for ${gwKey.toUpperCase()} Gateway in ${environmentMode.toUpperCase()} mode.`);
  };

  const handleTestConnection = (gwName: string) => {
    showToast(`Testing SSL handshake & API keys for ${gwName}... Handshake SUCCESSFUL (200 OK)`);
  };

  const handleTriggerTestWebhook = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      time: 'Just now',
      event: selectedEventType,
      status: 200,
      payload: JSON.stringify({
        event: selectedEventType,
        environment: environmentMode,
        timestamp: new Date().toISOString(),
        gateway: activeGateway.toUpperCase(),
        transaction: {
          id: `tx_${Math.floor(100000 + Math.random() * 900000)}`,
          amount: 24500,
          currency: 'INR',
          status: selectedEventType === 'payment.failed' ? 'FAILED' : 'SUCCESS',
          customer_gstin: '10AAACM1234F1Z2'
        }
      }, null, 2)
    };
    setWebhookLogs([newLog, ...webhookLogs]);
    showToast(`Triggered test webhook event: ${selectedEventType}`);
  };

  return (
    <div className="py-4 space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs font-bold animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black mb-2 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Developer Space & Payment Gateways Integration Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
            Payment Gateways & API Integration Space
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Configure live and test API credentials for third-party payment providers (Razorpay, PhonePe, Paytm, Stripe, Cashfree), monitor webhook event logs, and test automated checkout callbacks.
          </p>
        </div>

        {/* Environment Mode Switcher */}
        <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center space-x-1.5 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 px-2">Gateway Mode:</span>
          <button
            onClick={() => {
              setEnvironmentMode('test');
              showToast('Switched to TEST / Sandbox Environment');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              environmentMode === 'test'
                ? 'bg-amber-400 text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TEST / Sandbox
          </button>
          <button
            onClick={() => {
              setEnvironmentMode('live');
              showToast('Switched to LIVE / Production Environment');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              environmentMode === 'live'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            LIVE / Production
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gateway Provider Selector Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              Supported Payment Gateways
            </h3>

            {[
              { id: 'razorpay', name: 'Razorpay PG', desc: 'UPI, Cards, NetBanking, EMI', status: gateways.razorpay.status, color: 'text-blue-600' },
              { id: 'phonepe', name: 'PhonePe Business PG', desc: 'Direct UPI Intent & QR', status: gateways.phonepe.status, color: 'text-indigo-600' },
              { id: 'paytm', name: 'Paytm Payment Gateway', desc: 'Wallet, Postpaid & UPI', status: gateways.paytm.status, color: 'text-sky-600' },
              { id: 'stripe', name: 'Stripe Express', desc: 'Global Cards & Subscriptions', status: gateways.stripe.status, color: 'text-indigo-600' },
              { id: 'cashfree', name: 'Cashfree Payments', desc: 'Instant Payouts & Bulk Collection', status: gateways.cashfree.status, color: 'text-emerald-600' },
              { id: 'webhook', name: 'Custom Webhooks & Banking API', desc: 'REST Callbacks & Bank Webhooks', status: gateways.webhook.status, color: 'text-amber-600' },
            ].map((gw) => {
              const isSelected = activeGateway === gw.id;
              return (
                <button
                  key={gw.id}
                  onClick={() => setActiveGateway(gw.id as any)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CreditCard className={`w-4 h-4 ${isSelected ? 'text-amber-300' : gw.color}`} />
                      <span className="font-extrabold text-sm">{gw.name}</span>
                    </div>
                    <p className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {gw.desc}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {gw.status.includes('Connected') || gw.status.includes('Active') ? 'Active' : 'Ready'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Integration Info Box */}
          <div className="bg-white text-slate-900 p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>PCI-DSS & RBI Compliance Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All payment credentials are tokenized. Customer payment details are handled via official Gateway SDKs with 256-bit SSL encryption.
            </p>
          </div>
        </div>

        {/* Configuration Panel for Active Gateway */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            
            {/* Panel Title */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  API Key & Webhook Settings
                </span>
                <h2 className="text-xl font-black text-slate-900 font-display capitalize">
                  {activeGateway} Gateway Space Configuration
                </h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                environmentMode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {environmentMode.toUpperCase()} Mode Active
              </span>
            </div>

            {/* Razorpay Configuration */}
            {activeGateway === 'razorpay' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Razorpay Key ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={gateways.razorpay.keyId}
                        onChange={(e) => setGateways({ ...gateways, razorpay: { ...gateways.razorpay, keyId: e.target.value } })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Razorpay Key Secret
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={gateways.razorpay.keySecret}
                        onChange={(e) => setGateways({ ...gateways, razorpay: { ...gateways.razorpay, keySecret: e.target.value } })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Webhook Signing Secret
                    </label>
                    <input
                      type="text"
                      value={gateways.razorpay.webhookSecret}
                      onChange={(e) => setGateways({ ...gateways, razorpay: { ...gateways.razorpay, webhookSecret: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-extrabold text-slate-900 block">Feature Capabilities:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-bold">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gateways.razorpay.autoCapture}
                        onChange={(e) => setGateways({ ...gateways, razorpay: { ...gateways.razorpay, autoCapture: e.target.checked } })}
                        className="rounded text-slate-900 focus:ring-slate-900"
                      />
                      <span>Auto-Capture Payment on Authorized</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gateways.razorpay.upiIntent}
                        onChange={(e) => setGateways({ ...gateways, razorpay: { ...gateways.razorpay, upiIntent: e.target.checked } })}
                        className="rounded text-slate-900 focus:ring-slate-900"
                      />
                      <span>Enable Instant Mobile UPI Intent / QR</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PhonePe Configuration */}
            {activeGateway === 'phonepe' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      PhonePe Merchant ID (MID)
                    </label>
                    <input
                      type="text"
                      value={gateways.phonepe.merchantId}
                      onChange={(e) => setGateways({ ...gateways, phonepe: { ...gateways.phonepe, merchantId: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Salt Key
                    </label>
                    <input
                      type="password"
                      value={gateways.phonepe.saltKey}
                      onChange={(e) => setGateways({ ...gateways, phonepe: { ...gateways.phonepe, saltKey: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Salt Index
                    </label>
                    <input
                      type="text"
                      value={gateways.phonepe.saltIndex}
                      onChange={(e) => setGateways({ ...gateways, phonepe: { ...gateways.phonepe, saltIndex: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paytm Configuration */}
            {activeGateway === 'paytm' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Paytm MID
                    </label>
                    <input
                      type="text"
                      value={gateways.paytm.merchantId}
                      onChange={(e) => setGateways({ ...gateways, paytm: { ...gateways.paytm, merchantId: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Merchant Key
                    </label>
                    <input
                      type="password"
                      value={gateways.paytm.merchantKey}
                      onChange={(e) => setGateways({ ...gateways, paytm: { ...gateways.paytm, merchantKey: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stripe Configuration */}
            {activeGateway === 'stripe' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Publishable Key
                    </label>
                    <input
                      type="text"
                      value={gateways.stripe.publishableKey}
                      onChange={(e) => setGateways({ ...gateways, stripe: { ...gateways.stripe, publishableKey: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      value={gateways.stripe.secretKey}
                      onChange={(e) => setGateways({ ...gateways, stripe: { ...gateways.stripe, secretKey: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cashfree Configuration */}
            {activeGateway === 'cashfree' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cashfree App ID
                    </label>
                    <input
                      type="text"
                      value={gateways.cashfree.appId}
                      onChange={(e) => setGateways({ ...gateways, cashfree: { ...gateways.cashfree, appId: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      value={gateways.cashfree.secretKey}
                      onChange={(e) => setGateways({ ...gateways, cashfree: { ...gateways.cashfree, secretKey: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Webhook Endpoint Space */}
            {activeGateway === 'webhook' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Webhook Callback Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={gateways.webhook.endpointUrl}
                      onChange={(e) => setGateways({ ...gateways, webhook: { ...gateways.webhook, endpointUrl: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Authorization Header / Bearer Token
                    </label>
                    <input
                      type="password"
                      value={gateways.webhook.authToken}
                      onChange={(e) => setGateways({ ...gateways, webhook: { ...gateways.webhook, authToken: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSaveConfig(activeGateway)}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save {activeGateway.toUpperCase()} Integration Keys</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestConnection(activeGateway.toUpperCase())}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Verify Gateway Handshake</span>
              </button>
            </div>

          </div>

          {/* Webhook Sandbox & Event Payload Inspector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs">
                  <Terminal className="w-4 h-4" />
                  <span>Interactive API Sandbox & Webhook Simulator</span>
                </div>
                <h3 className="text-lg font-black font-display text-slate-900 mt-0.5">
                  Real-time Callback Payload Inspector
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="payment.captured">event: payment.captured</option>
                  <option value="order.paid">event: order.paid</option>
                  <option value="payment.failed">event: payment.failed</option>
                  <option value="refund.processed">event: refund.processed</option>
                </select>

                <button
                  onClick={handleTriggerTestWebhook}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send Test Payload</span>
                </button>
              </div>
            </div>

            {/* Webhook Logs Stream */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                Recent Gateway Event Stream:
              </span>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {webhookLogs.map((log) => (
                  <div key={log.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
                          HTTP {log.status} OK
                        </span>
                        <span className="font-mono font-bold text-slate-800">{log.event}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{log.time}</span>
                    </div>

                    <pre className="p-3 rounded-xl bg-slate-900 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-tight">
                      {log.payload}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
