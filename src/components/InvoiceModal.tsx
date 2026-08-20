import React, { useEffect } from 'react';
import { Order } from '../types';
import { numberToWords } from '../utils/formatters';
import { X, Printer, FileText, ArrowLeft, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Clean static UPI string ensuring account name 'MAGADH TYRES' / Arvind Singh is auto-detected by Google Pay, PhonePe, Paytm, etc.
  const upiPaymentUrl = 'upi://pay?pa=arvindsingh73808@icici&pn=MAGADH TYRES';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8">
        
        {/* Modal Action Bar (Screen only) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 text-slate-900 print:hidden border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title="Return to Invoice Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Dashboard</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                GST Tax Invoice / Quotation #{order.orderNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-2xl bg-white hover:bg-purple-50/70 border-2 border-[#9800ff] text-[#9800ff] font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <span>Generate PDF</span>
              <Download className="w-4 h-4 text-[#9800ff] stroke-[2.2]" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer border border-slate-200 shadow-2xs focus:outline-none flex items-center justify-center shrink-0"
              title="Close Invoice & Return to Dashboard"
              aria-label="Close Invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Screen-only Back Button Banner */}
        <div className="px-6 sm:px-8 pt-4 pb-0 print:hidden flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>← Return to Invoice Dashboard</span>
          </button>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Press Esc or click top-right X to close
          </span>
        </div>

        {/* Printable Document Sheet Container */}
        <div className="p-3 sm:p-8 bg-white relative overflow-x-auto" id="tax-invoice-printable">
          
          {/* Top-Right Close "X" Icon Button on Sheet */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 print:hidden p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer border border-slate-200 shadow-2xs focus:outline-none flex items-center justify-center shrink-0 group z-10"
            title="Close Invoice & Return to Dashboard"
            aria-label="Close Invoice"
          >
            <X className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* EXACT B2B GST QUOTATION / TAX INVOICE FORMAT */}
          <div className="border border-black font-sans text-xs text-black bg-white min-w-[680px]">
            
            {/* 1. DOCUMENT TITLE */}
            <div className="text-center font-bold text-sm tracking-wide py-1.5 border-b border-black uppercase bg-slate-50">
              QUOTATION
            </div>

            {/* 2. TOP GRID (SELLER DETAILS | METADATA | QR CODE) */}
            <div className="grid grid-cols-12 border-b border-black divide-x divide-black">
              
              {/* Seller / Shop Info */}
              <div className="col-span-4 p-3 space-y-1 leading-relaxed">
                <div className="font-black text-base tracking-tight text-black uppercase">
                  MAGADH TYRES
                </div>
                <div>DR. SAHOO COMPLEX, VEDVYAS, ROURKELA</div>
                <div>State Name : {order.shippingAddress.state || 'Odisha'}, Code : 21</div>
                <div>E-Mail : arvindsingh73808@gmail.com</div>
                <div>Phone : +91 91234 56789</div>
              </div>

              {/* Metadata Grid */}
              <div className="col-span-5 grid grid-cols-2 divide-x divide-y divide-black text-[11px]">
                <div className="p-1.5">
                  <div className="text-[10px] text-slate-600">Quotation No.</div>
                  <div className="font-bold text-black">{order.orderNumber}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-slate-600">Dated</div>
                  <div className="font-bold text-black">{order.date}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-slate-600">Buyer's Ref./Order No.</div>
                  <div className="font-bold text-black">{order.id}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-slate-600">Mode/Terms of Payment</div>
                  <div className="font-bold text-black">{order.paymentMethod || '----------'}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-slate-600">Dispatched through</div>
                  <div className="font-bold text-black">Road Transport</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-slate-600">Other References</div>
                  <div className="font-bold text-black">AWB-{order.trackingNumber || '----------'}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-slate-600">Destination</div>
                  <div className="font-bold text-black">{order.shippingAddress.city || '----------'}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-slate-600">Terms of Delivery</div>
                  <div className="font-bold text-black">Door Delivery</div>
                </div>
              </div>

              {/* QR Code Column */}
              <div className="col-span-3 p-2 flex flex-col items-center justify-center text-center bg-white min-h-[165px]">
                <div className="bg-white border border-slate-900 p-1.5 rounded shadow-2xs flex items-center justify-center">
                  <QRCodeSVG value={upiPaymentUrl} size={130} level="M" />
                </div>
              </div>

            </div>

            {/* 3. CONSIGNEE & BUYER SECTION */}
            <div className="grid grid-cols-2 border-b border-black divide-x divide-black text-[11px]">
              
              {/* Consignee (Ship to) */}
              <div className="p-3 space-y-1">
                <div className="text-slate-600 text-[10px]">Consignee (Ship to)</div>
                <div className="font-bold uppercase text-black">
                  {order.companyName || order.customerName || 'JALAN AUTOMOBILES PRIVATE LIMITED'}
                </div>
                <div>
                  {order.shippingAddress.street || 'SH-10, SAW MILL CHOWK, VEDVYAS'},
                </div>
                <div>
                  {order.shippingAddress.city || 'SUNDARGARH'}, {order.shippingAddress.state || 'ODISHA'}.
                </div>
                <div>
                  GSTIN/UN : <span className="font-bold">{order.gstNumber || '21AABCJ4050F1Z8'}</span>
                </div>
                <div>
                  State Name : {order.shippingAddress.state || 'Odisha'}, Code : 21
                </div>
              </div>

              {/* Buyer (Bill to) */}
              <div className="p-3 space-y-1">
                <div className="text-slate-600 text-[10px]">Buyer (Bill to)</div>
                <div className="font-bold uppercase text-black">
                  {order.companyName || order.customerName || 'JALAN AUTOMOBILES PRIVATE LIMITED'}
                </div>
                <div>
                  {order.shippingAddress.street || 'SH-10, SAW MILL CHOWK, VEDVYAS'},
                </div>
                <div>
                  {order.shippingAddress.city || 'SUNDARGARH'}, {order.shippingAddress.state || 'ODISHA'}.
                </div>
                <div>
                  GSTIN/UN : <span className="font-bold">{order.gstNumber || '21AABCJ4050F1Z8'}</span>
                </div>
                <div>
                  State Name : {order.shippingAddress.state || 'Odisha'}, Code : 21
                </div>
              </div>

            </div>

            {/* 4. ITEMS TABLE */}
            <div className="overflow-x-auto border-b border-black">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-black font-bold text-center bg-slate-50">
                    <th className="p-1.5 border-r border-black w-10">Sl No.</th>
                    <th className="p-1.5 border-r border-black text-left">Description of Goods</th>
                    <th className="p-1.5 border-r border-black w-24">HSN/SAC</th>
                    <th className="p-1.5 border-r border-black w-20">Due on</th>
                    <th className="p-1.5 border-r border-black w-20">Quantity</th>
                    <th className="p-1.5 border-r border-black w-24 text-right">Rate</th>
                    <th className="p-1.5 border-r border-black w-12 text-center">per</th>
                    <th className="p-1.5 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/30">
                  {order.items.map((item, idx) => {
                    const unitPrice = (item.quantity >= 4 && item.product.bulkPrice) ? item.product.bulkPrice : item.product.price;
                    const itemTaxableRate = Math.round((unitPrice / 1.18) * 100) / 100;
                    const itemAmount = itemTaxableRate * item.quantity;
                    const includedComps = item.product.includedComponents || 'Tube & Flap';

                    return (
                      <tr key={idx} className="align-top">
                        <td className="p-2 border-r border-black text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border-r border-black font-bold uppercase">
                          <div>
                            {item.product.name} {item.product.rimSize ? `(${item.product.width}/${item.product.aspectRatio} R${item.product.rimSize})` : ''}
                          </div>
                          <div className="text-[10px] text-slate-800 font-semibold normal-case mt-0.5">
                            Included Components: {includedComps}
                          </div>
                        </td>
                        <td className="p-2 border-r border-black text-center">{item.product.hsnCode || '40112010'}</td>
                        <td className="p-2 border-r border-black text-center">{order.date}</td>
                        <td className="p-2 border-r border-black text-center font-bold">{item.quantity} PCS</td>
                        <td className="p-2 border-r border-black text-right font-medium">
                          {itemTaxableRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 border-r border-black text-center">PCS</td>
                        <td className="p-2 text-right font-bold">
                          {itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Tax Lines inside table */}
                  <tr className="align-top">
                    <td className="p-2 border-r border-black"></td>
                    <td className="p-2 border-r border-black text-right font-bold" colSpan={6}>
                      <div className="space-y-1.5 pr-2 text-right">
                        <div>Output CGST (9%)</div>
                        <div>Output SGST (9%)</div>
                        <div>Round Off</div>
                      </div>
                    </td>
                    <td className="p-2 text-right font-medium">
                      <div className="space-y-1.5">
                        <div>{(order.gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div>{(order.gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div>0.00</div>
                      </div>
                    </td>
                  </tr>

                  {/* Total Summary Row */}
                  <tr className="border-t border-black font-bold bg-slate-50 text-xs">
                    <td className="p-2 border-r border-black text-right" colSpan={4}>Total</td>
                    <td className="p-2 border-r border-black text-center font-extrabold">
                      {totalQuantity} PCS
                    </td>
                    <td className="p-2 border-r border-black" colSpan={2}></td>
                    <td className="p-2 text-right text-black font-black text-sm">
                      ₹ {order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. AMOUNT CHARGEABLE IN WORDS */}
            <div className="border-b border-black p-2.5 flex flex-row justify-between items-center gap-2">
              <div>
                <div className="text-[10px] text-slate-600">Amount Chargeable (in words)</div>
                <div className="font-extrabold text-xs text-black uppercase mt-0.5">
                  {numberToWords(order.totalAmount)}
                </div>
              </div>
              <div className="font-bold text-xs text-slate-700 shrink-0">
                E. & O.E
              </div>
            </div>

            {/* 6. BANK DETAILS & SIGNATURE SECTION */}
            <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
              
              {/* Bank Details */}
              <div className="p-3 space-y-1">
                <div className="font-bold text-black text-[11px] underline mb-1">Company's Bank Details</div>
                <div className="grid grid-cols-12 gap-1 text-[11px]">
                  <div className="col-span-4 text-slate-600">Bank Name</div>
                  <div className="col-span-8 font-bold">: ICICI BANK</div>
                  <div className="col-span-4 text-slate-600">A/c No.</div>
                  <div className="col-span-8 font-bold">: 793205500173</div>
                  <div className="col-span-4 text-slate-600">Branch & IFS Code</div>
                  <div className="col-span-8 font-bold">: VEDVYAS & ICIC0007932</div>
                </div>
              </div>

              {/* Authorised Signatory */}
              <div className="p-3 flex flex-col justify-between items-end min-h-[110px]">
                <div className="font-bold text-black text-xs">for MAGADH TYRES</div>
                <div className="text-center pt-8">
                  <div className="w-40 border-b border-slate-400 mb-1"></div>
                  <div className="text-[10px] font-bold text-slate-700">Authorised Signatory</div>
                </div>
              </div>

            </div>

            {/* 7. COMPUTER GENERATED FOOTER NOTE */}
            <div className="py-2 text-center text-[10px] text-slate-600 font-medium">
              This is a Computer Generated Document
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
