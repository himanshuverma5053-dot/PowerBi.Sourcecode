import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  Phone,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Filter,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';

interface ComplaintItem {
  id: string;
  ticketNumber: string;
  category: 'Tyre Defect' | 'Delivery Delay' | 'Billing / Payment' | 'Transit Damage' | 'Warranty Claim' | 'General Issue';
  tyreSerialOrSize?: string;
  orderNumber?: string;
  vehicleNumber?: string;
  description: string;
  urgency: 'Normal' | 'High' | 'Fleet Grounded';
  status: 'Under Review' | 'Inspection Scheduled' | 'In Progress' | 'Resolved';
  createdAt: string;
  contactPhone: string;
}

const DEFAULT_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'comp-101',
    ticketNumber: 'CMP-2026-8841',
    category: 'Tyre Defect',
    tyreSerialOrSize: '295/90 R20 Radial',
    orderNumber: 'ORD-9921',
    vehicleNumber: 'BR01GB4492',
    description: 'Uneven sidewall bulge noted on rear axle tyre after 2,400 km operation on NH-31 route.',
    urgency: 'High',
    status: 'Inspection Scheduled',
    createdAt: '2026-08-28T14:30:00.000Z',
    contactPhone: '+91 94310 55214'
  },
  {
    id: 'comp-102',
    ticketNumber: 'CMP-2026-7910',
    category: 'Billing / Payment',
    orderNumber: 'ORD-8419',
    description: 'GST input credit mismatch in monthly consolidated tax invoice for Gaya regional dispatch.',
    urgency: 'Normal',
    status: 'Resolved',
    createdAt: '2026-08-15T10:15:00.000Z',
    contactPhone: '+91 98350 12890'
  }
];

export const MyRequestsPage: React.FC<{
  onBackToHome?: () => void;
}> = ({ onBackToHome }) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    const saved = safeGetLocalStorage<ComplaintItem[]>('magadh_complaint_requests', []);
    return saved.length > 0 ? saved : DEFAULT_COMPLAINTS;
  });

  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [category, setCategory] = useState<ComplaintItem['category']>('Tyre Defect');
  const [tyreSerialOrSize, setTyreSerialOrSize] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<ComplaintItem['urgency']>('Normal');
  const [contactPhone, setContactPhone] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  useEffect(() => {
    safeSetLocalStorage('magadh_complaint_requests', complaints);
  }, [complaints]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newTicket: ComplaintItem = {
      id: `comp-${Date.now()}`,
      ticketNumber: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      tyreSerialOrSize: tyreSerialOrSize.trim() || undefined,
      orderNumber: orderNumber.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || undefined,
      description: description.trim(),
      urgency,
      status: 'Under Review',
      createdAt: new Date().toISOString(),
      contactPhone: contactPhone.trim() || '+91 94310 00000'
    };

    setComplaints(prev => [newTicket, ...prev]);
    setSubmittedMessage(newTicket.ticketNumber);
    setDescription('');
    setTyreSerialOrSize('');
    setOrderNumber('');
    setVehicleNumber('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                Complaint & Warranty Service Request
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Submit claim requests, tyre inspection tickets, warranty investigations, and delivery issues directly to Magadh Tyres Technical Support.
            </p>
          </div>

          {/* Quick Toggle between New Request and View Tickets */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => {
                setActiveTab('form');
                setSubmittedMessage(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Request
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Track Tickets</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded-full font-bold">
                {complaints.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form / List Content */}
      {activeTab === 'form' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            {submittedMessage ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex items-center space-x-3 text-emerald-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="text-base font-bold">Complaint Ticket Created Successfully</h3>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your reference ticket is <span className="font-mono font-bold text-emerald-950">{submittedMessage}</span>.
                      Our technical claims engineer will contact you within 2-4 business hours.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittedMessage(null)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 bg-white text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    View All Tickets
                  </button>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Issue Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066c0]"
                  >
                    <option value="Tyre Defect">Tyre Physical Defect / Bulge</option>
                    <option value="Warranty Claim">Warranty Claim / Mileage Wear</option>
                    <option value="Delivery Delay">Consignment / Delivery Delay</option>
                    <option value="Transit Damage">Transit Damage on Arrival</option>
                    <option value="Billing / Payment">Billing or Tax Invoice Discrepancy</option>
                    <option value="General Issue">Other General Concern</option>
                  </select>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Priority / Urgency *
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066c0]"
                  >
                    <option value="Normal">Normal (Standard 24-48h SLA)</option>
                    <option value="High">High (Immediate Dispatch/Exchange Needed)</option>
                    <option value="Fleet Grounded">Fleet Grounded (Critical Commercial Emergency)</option>
                  </select>
                </div>
              </div>

              {/* Tyre Serial / Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tyre Size or Serial No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 295/90 R20 / DOT #4921"
                    value={tyreSerialOrSize}
                    onChange={(e) => setTyreSerialOrSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066c0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Order / Invoice Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-9921 / INV-2026-04"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066c0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Number (if fitted)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BR01GB4492"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066c0]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Direct Contact Number for Claim Updates *
                </label>
                <input
                  type="tel"
                  placeholder="+91 94310 XXXXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066c0]"
                  required
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detailed Description of Issue *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the complaint in detail, including operating route, load conditions, symptoms, or billing issues..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066c0] resize-y"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0066c0] hover:bg-[#005299] text-white text-xs font-black rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Service Ticket</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Info & Helpline */}
          <div className="space-y-4">
            {/* Quick Contacts Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Direct Claim Helpline</h4>
                  <p className="text-[11px] text-slate-400">24x7 Priority Assistance</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1 text-xs">
                <a
                  href="tel:18002334455"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-slate-300">Toll Free:</span>
                  <span className="font-mono font-bold text-blue-300">1800 233 4455</span>
                </a>
                <a
                  href="tel:+919431023456"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-slate-300">Patna Technical Hub:</span>
                  <span className="font-mono font-bold text-blue-300">+91 94310 23456</span>
                </a>
              </div>
            </div>

            {/* SLA Policy Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-2xs text-xs text-slate-600">
              <h4 className="font-black text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Our Resolution SLA</span>
              </h4>
              <ul className="space-y-2 list-disc list-inside text-[11px] text-slate-500">
                <li>Initial triage response within 2 business hours.</li>
                <li>Physical technical inspection in Bihar/Jharkhand within 24 hours.</li>
                <li>Instant on-site replacement for validated casing failures under Apollo Sampark warranty.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* List / Tracking View */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">
              Your Active & Historic Service Requests ({complaints.length})
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className="text-xs font-bold text-[#0066c0] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Raise New Request</span>
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">No complaints or claims recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-slate-200 text-slate-800">
                        {item.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        item.urgency === 'Fleet Grounded'
                          ? 'bg-rose-100 text-rose-700'
                          : item.urgency === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.urgency}
                      </span>

                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        item.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'Inspection Scheduled'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                    {item.tyreSerialOrSize && (
                      <span><strong>Tyre:</strong> {item.tyreSerialOrSize}</span>
                    )}
                    {item.orderNumber && (
                      <span><strong>Order:</strong> {item.orderNumber}</span>
                    )}
                    {item.vehicleNumber && (
                      <span><strong>Vehicle:</strong> {item.vehicleNumber}</span>
                    )}
                    <span><strong>Date:</strong> {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
