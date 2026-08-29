import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, MapPin, Calendar, Car, Bike, User, Phone, Mail } from 'lucide-react';

export default function InvoiceModal({ booking, onClose }) {
  const printRef = useRef(null);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `INV-${booking.bookingNumber || 'GR-2026-001'}`;
  const invoiceDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const pickupDateStr = booking.pickupDate
    ? new Date(booking.pickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  const returnDateStr = booking.returnDate
    ? new Date(booking.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  const vehicleName = booking.vehicle?.name || 'GoaRide Vehicle';
  const vehicleType = (booking.vehicle?.type || 'rental').toUpperCase();
  const vehiclePrice = booking.vehicle?.pricePerDay || 0;
  const customerName = booking.user?.name || 'Valued Customer';
  const customerEmail = booking.user?.email || 'customer@example.com';
  const customerPhone = booking.user?.phone || 'N/A';

  const basePrice = booking.basePrice || (booking.duration || 1) * vehiclePrice;
  const deposit = booking.securityDeposit || 1000;
  const taxes = booking.taxes || Math.round(basePrice * 0.18);
  const discount = booking.discount || 0;
  const grandTotal = booking.totalAmount || basePrice + deposit + taxes - discount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container Card */}
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-900 dark:text-white print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Top Control Bar (Hidden during Print) */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Official Tax Invoice & Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div ref={printRef} className="p-8 space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:p-6 print:bg-white">
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 print:border-slate-300">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                  Goa<span className="text-amber-500">Ride</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 print:border-slate-400 print:text-black">
                  TAX INVOICE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium">
                GoaRide Vehicle Rentals Pvt. Ltd.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600">
                Panaji Pickup Hub, DB Road, Panaji, Goa - 403001
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 print:text-slate-500">
                GSTIN: 30AAACG1234F1Z0 • Helpline: +91 75884 59115
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Invoice Reference</span>
              <p className="text-lg font-black text-sky-600 dark:text-cyan-400 print:text-black">{invoiceNo}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 print:text-black">Date: {invoiceDate}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PAYMENT CONFIRMED</span>
              </span>
            </div>
          </div>

          {/* Customer & Booking Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 print:bg-slate-50 print:border-slate-300 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Billed To (Customer)</span>
              <p className="font-bold text-slate-900 dark:text-white print:text-black text-sm">{customerName}</p>
              <p className="text-slate-600 dark:text-slate-300 print:text-slate-700 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" /> {customerEmail}
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-slate-700 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {customerPhone}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Trip Details</span>
              <p className="font-bold text-slate-900 dark:text-white print:text-black">
                Vehicle: {vehicleName} ({vehicleType})
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-slate-700">
                Pickup Location: <strong className="text-slate-900 dark:text-white print:text-black">{booking.pickupLocation || 'Calangute'}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-slate-700">
                Duration: {booking.duration || 1} Days ({pickupDateStr} ➔ {returnDateStr})
              </p>
            </div>
          </div>

          {/* Pricing Breakdown Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Payment & Fare Summary</span>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 print:border-slate-300 bg-slate-100 dark:bg-slate-900 print:bg-slate-100 text-slate-700 dark:text-slate-300 print:text-black font-bold">
                  <th className="p-2.5 rounded-l-xl">Description</th>
                  <th className="p-2.5 text-center">Rate</th>
                  <th className="p-2.5 text-center">Qty / Days</th>
                  <th className="p-2.5 text-right rounded-r-xl">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                <tr>
                  <td className="p-2.5 font-medium">Base Rental ({vehicleName})</td>
                  <td className="p-2.5 text-center">₹{vehiclePrice}/day</td>
                  <td className="p-2.5 text-center">{booking.duration || 1} day(s)</td>
                  <td className="p-2.5 text-right font-bold">₹{basePrice}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Refundable Security Deposit</td>
                  <td className="p-2.5 text-center">—</td>
                  <td className="p-2.5 text-center">1</td>
                  <td className="p-2.5 text-right font-bold text-amber-600 dark:text-amber-400 print:text-black">₹{deposit}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">GST Taxes (18% - CGST 9% + SGST 9%)</td>
                  <td className="p-2.5 text-center">18%</td>
                  <td className="p-2.5 text-center">—</td>
                  <td className="p-2.5 text-right font-bold">₹{taxes}</td>
                </tr>
                {discount > 0 && (
                  <tr className="text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
                    <td className="p-2.5 font-bold">Weekly Duration Discount</td>
                    <td className="p-2.5 text-center">-10%</td>
                    <td className="p-2.5 text-center">—</td>
                    <td className="p-2.5 text-right font-bold">-₹{discount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-emerald-500/10 border border-sky-500/20 print:bg-slate-100 print:border-slate-400 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block">Total Paid & Received</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Payment Method: Online Gateway (Verified)</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-sky-600 dark:text-cyan-400 print:text-black">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Terms & Stamp */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 gap-3">
            <div>
              <p className="font-bold">Terms & Conditions:</p>
              <p>• Complimentary helmets provided upon vehicle pickup.</p>
              <p>• Refundable security deposit returned at rental handover.</p>
            </div>
            <div className="text-center sm:text-right">
              <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">GoaRide Rentals Pvt. Ltd.</span>
              <p className="text-[9px] text-slate-400">Computer Generated Tax Invoice • No signature required</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
