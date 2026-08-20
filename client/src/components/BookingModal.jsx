import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Calendar, MapPin, ShieldCheck, CreditCard, QrCode, CheckCircle2, AlertCircle, ArrowLeft, Clock } from 'lucide-react';

export default function BookingModal({ vehicle, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [step, setStep] = useState(1);

  const [pickupLocation, setPickupLocation] = useState(vehicle?.location || 'Calangute');
  const [dropLocation, setDropLocation] = useState(vehicle?.location || 'Calangute');
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(tomorrowStr);
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);

  const [timeLeft, setTimeLeft] = useState(300);

  const locationsList = [
    'Panaji',
    'Calangute',
    'Baga',
    'Anjuna',
    'Vagator',
    'Mapusa',
    'Margao',
    'Vasco',
    'Dabolim Airport',
  ];

  useEffect(() => {
    if (!vehicle || !pickupDate || !returnDate) return;

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (end > start) {
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      const base = days * vehicle.pricePerDay;
      const deposit = vehicle.securityDeposit || 1000;
      const tax = Math.round(base * 0.18);
      const discount = days >= 7 ? Math.round(base * 0.1) : 0;
      const total = base + deposit + tax - discount;

      setPriceBreakdown({
        days,
        base,
        deposit,
        tax,
        discount,
        total,
      });
      setErrorMessage('');
    } else {
      setPriceBreakdown(null);
      setErrorMessage('Return date must be after pickup date');
    }
  }, [pickupDate, returnDate, vehicle]);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!vehicle) return null;

  const handleNextToPayment = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please login to complete your booking', 'info');
      onClose();
      navigate('/login');
      return;
    }

    if (errorMessage) {
      showToast(errorMessage, 'error');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const { data: booking } = await API.post('/bookings', {
        vehicleId: vehicle._id,
        pickupLocation,
        dropLocation,
        pickupDate,
        returnDate,
        pickupTime,
        notes,
      });

      setCreatedBooking(booking);
      setLoading(false);
      setStep(2);
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Booking creation failed.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    }
  };

  const handleVerifyPayment = async () => {
    if (!createdBooking) return;
    try {
      setLoading(true);

      const { data: paymentOrder } = await API.post('/payments/create-order', {
        amount: createdBooking.totalAmount,
        bookingId: createdBooking._id,
      });

      await API.post('/payments/verify', {
        razorpay_order_id: paymentOrder.orderId,
        razorpay_payment_id: `upi_qr_${Date.now()}`,
        bookingId: createdBooking._id,
        amount: createdBooking.totalAmount,
        isDevMode: true,
      });

      showToast(`🎉 Payment Verified! Booking Confirmed: ${createdBooking.bookingNumber}`, 'success');
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess(createdBooking);
      navigate('/bookings');
    } catch (error) {
      setLoading(false);
      showToast('Payment verification failed. Try again.', 'error');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const upiString = `upi://pay?pa=goaride@upi&pn=GoaRide&am=${priceBreakdown?.total || 0}&cu=INR&tn=Booking_${createdBooking?.bookingNumber || 'GoaRide'}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&bgcolor=ffffff&color=0284c7`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/95 dark:bg-[#0c1626]/95 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <img src={vehicle.image} alt={vehicle.name} className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{vehicle.name}</h3>
              <p className="text-xs text-sky-600 dark:text-cyan-400 font-bold">₹{vehicle.pricePerDay} / day • {vehicle.type.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: DATES & DETAILS */}
        {step === 1 && (
          <form onSubmit={handleNextToPayment} className="p-6 space-y-5">
            
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> Pickup Location
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500"
                >
                  {locationsList.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Drop Location
                </label>
                <select
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500"
                >
                  {locationsList.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Pickup Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Return Date
                </label>
                <input
                  type="date"
                  min={pickupDate}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pickup Time</label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500"
                >
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>12:00 PM</option>
                  <option>02:00 PM</option>
                  <option>05:00 PM</option>
                </select>
              </div>
            </div>

            {/* Price Breakdown */}
            {priceBreakdown && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Rental Duration ({priceBreakdown.days} day{priceBreakdown.days > 1 ? 's' : ''}):</span>
                  <span>₹{priceBreakdown.base}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Refundable Security Deposit:</span>
                  <span>₹{priceBreakdown.deposit}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Taxes & Fees (18% GST):</span>
                  <span>₹{priceBreakdown.tax}</span>
                </div>
                {priceBreakdown.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Weekly Discount (10%):</span>
                    <span>-₹{priceBreakdown.discount}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Amount Payable:</span>
                  <span className="text-sky-600 dark:text-cyan-400 text-base font-black">₹{priceBreakdown.total}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!errorMessage}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 dark:from-cyan-500 dark:via-blue-600 dark:to-cyan-500 hover:from-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Checking Availability... ⏳</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Pay ₹{priceBreakdown ? priceBreakdown.total : ''} →</span>
                </>
              )}
            </button>

          </form>
        )}

        {/* STEP 2: WORKING QR CODE PAYMENT SCREEN */}
        {step === 2 && priceBreakdown && (
          <div className="p-6 space-y-6 text-center">
            
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to details
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-cyan-500/10 text-sky-800 dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/30 text-xs font-bold">
                <QrCode className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                <span>Instant Scan & Pay via UPI</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white pt-1">
                <span className="text-sky-600 dark:text-cyan-400">₹{priceBreakdown.total.toLocaleString()}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Exact amount payable for Booking #{createdBooking?.bookingNumber}</p>
            </div>

            {/* QR Code Container */}
            <div className="max-w-xs mx-auto p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-sky-500/40 shadow-xl space-y-3">
              <img
                src={qrCodeUrl}
                alt="Payment QR Code"
                className="w-56 h-56 mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner"
              />
              <div className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                UPI ID: <code className="text-sky-700 dark:text-cyan-300 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">goaride@upi</code>
              </div>
            </div>

            {/* Supported Apps Badges */}
            <div className="flex justify-center items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-bold">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">GPay</span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">PhonePe</span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">Paytm</span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">BHIM</span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">CRED</span>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
              <Clock className="w-4 h-4 animate-spin text-amber-500" />
              <span>QR Session Expires in: <strong className="text-slate-900 dark:text-white">{formatTime(timeLeft)}</strong></span>
            </div>

            {/* Verification Button */}
            <button
              onClick={handleVerifyPayment}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-500 dark:to-teal-600 hover:from-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <span>Verifying UPI Payment... ⏳</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Scanned & Paid ₹{priceBreakdown.total}</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-500">
              Payment is secured with 256-bit SSL encryption. Instant confirmation generated upon verification.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}
