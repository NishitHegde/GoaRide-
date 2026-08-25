import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import BookingModal from '../components/BookingModal';
import { Star, MapPin, Fuel, Gauge, Users, ShieldCheck, Heart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/vehicles/${id}`);
      setVehicle(data);

      const { data: revData } = await API.get(`/reviews/vehicle/${id}`);
      setReviews(revData);

      if (user) {
        const { data: favs } = await API.get('/favorites');
        const isFav = Array.isArray(favs) && favs.some((f) => f._id === id);
        setIsFavorite(isFav);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showToast('Please login to save favorites', 'info');
      return;
    }
    try {
      const { data } = await API.post(`/favorites/${id}`);
      setIsFavorite(data.isFavorite);
      showToast(data.message, 'success');
    } catch (error) {
      showToast('Failed to update favorite', 'error');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-stone-600 font-bold">Loading Vehicle Details...</div>;
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20 text-slate-900 font-bold">
        Vehicle not found. <button onClick={() => navigate('/vehicles')} className="text-sky-700 underline">View all vehicles</button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-10 space-y-8">
      
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Fleet
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: Big Image Gallery */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg h-96 bg-white dark:bg-slate-900">
            <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md hover:bg-white transition-all text-slate-700 dark:text-slate-300 hover:text-rose-500"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Column: Specs & Booking Box */}
        <div className="space-y-6">
          
          <div className="space-y-2">
            <span className="text-xs font-black text-sky-600 dark:text-cyan-400 uppercase tracking-wide">{vehicle.brand}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{vehicle.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> {vehicle.rating} ({vehicle.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> {vehicle.location} Pickup
              </span>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            {vehicle.description}
          </p>

          {/* Key Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">Fuel Type</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-sky-600" /> {vehicle.fuelType}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">Transmission</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-sky-600" /> {vehicle.transmission}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">Seating</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-600" /> {vehicle.seats}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">Deposit</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">₹{vehicle.securityDeposit || 1000}</span>
            </div>
          </div>

          {/* Highlights List */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Included Features</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-900 dark:text-slate-200">
                {vehicle.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & Booking Button */}
          <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">₹{vehicle.pricePerDay}</span>
              <span className="text-xs text-slate-500 font-medium"> / 24 hours</span>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-5 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-sky-600/20 transition-all"
            >
              Book Now →
            </button>
          </div>

        </div>

      </div>

      {/* Customer Reviews Section */}
      <div className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Reviews ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 font-medium">No reviews yet for this vehicle. Be the first to rate it!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r._id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{r.user?.name || 'Tourist'}</span>
                  <span className="text-amber-500 text-xs">{'★'.repeat(r.rating)}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{r.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal vehicle={vehicle} onClose={() => setBookingModalOpen(false)} />
      )}

    </div>
  );
}
