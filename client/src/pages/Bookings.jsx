import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import InvoiceModal from '../components/InvoiceModal';
import { Calendar, Heart, User, Star, MapPin, Camera, Upload, Check, Navigation, ShieldCheck, Radio, Trash2, Printer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Bookings() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const presetAvatars = [
    { name: 'Rider', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' },
    { name: 'Beach Traveler', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { name: 'Cool Driver', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200' },
    { name: 'Goa Cruiser', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { name: 'Executive', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200' },
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  useEffect(() => {
    fetchMyBookings();
    fetchMyFavorites();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/bookings/my');
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchMyFavorites = async () => {
    try {
      const { data } = await API.get('/favorites');
      setFavorites(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await API.delete(`/bookings/${bookingId}`);
      showToast('Booking cancelled successfully', 'info');
      fetchMyBookings();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  const handleDeleteBookingRecord = async (bookingId) => {
    if (!window.confirm('Remove this cancelled booking record permanently from your list?')) return;
    try {
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      await API.delete(`/bookings/${bookingId}?permanent=true`);
      showToast('Cancelled booking record removed permanently', 'info');
    } catch (error) {
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      showToast('Booking record removed from list', 'info');
    }
  };

  const handleTrackBookedVehicle = (b) => {
    const trkId = b.trackingId || 'TRK-8901';
    const vName = b.vehicle?.name || 'Vehicle';
    navigate(`/tracking?trackingId=${trkId}&name=${encodeURIComponent(vName)}`);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview for mobile and desktop photos
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);

    try {
      setUploadingImage(true);
      const updatedUser = await uploadAvatar(file);
      if (updatedUser?.profileImage) {
        setProfileImage(updatedUser.profileImage);
      }
      setUploadingImage(false);
    } catch (error) {
      setUploadingImage(false);
    }
  };

  const handleSelectPresetAvatar = async (url) => {
    try {
      setProfileImage(url);
      await updateProfile({ profileImage: url });
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email, phone, profileImage });
    } catch (error) {
      console.error(error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    try {
      await API.post('/reviews', {
        vehicleId: reviewBooking.vehicle._id,
        bookingId: reviewBooking._id,
        rating,
        comment,
      });
      showToast('Review submitted! Thank you.', 'success');
      setReviewBooking(null);
      setComment('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
      
      {/* Header Profile Badge */}
      <div className="flex items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={user?.name}
              className="w-20 h-20 rounded-full border-2 border-sky-600 dark:border-cyan-500 object-cover shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-900 font-bold shadow-md hover:scale-110 cursor-pointer transition-transform">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <span className="text-xs font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider">Tourist Account</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{user?.email} • {user?.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('profile')}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
        >
          <User className="w-4 h-4 text-sky-600" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'bookings' ? 'border-sky-600 dark:border-cyan-400 text-sky-700 dark:text-cyan-400 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" /> My Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'favorites' ? 'border-sky-600 dark:border-cyan-400 text-sky-700 dark:text-cyan-400 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" /> Saved Favorites ({favorites.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'profile' ? 'border-sky-600 dark:border-cyan-400 text-sky-700 dark:text-cyan-400 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" /> Edit Profile & Photo
        </button>
      </div>

      {/* TAB CONTENT: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-bold">Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-4xl">📅</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Bookings</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Explore our Goa vehicle fleet and book your first ride to enable live tracking!</p>
              <Link to="/vehicles" className="inline-block px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md">
                Browse Fleet →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const currentStatus = (b.bookingStatus || b.status || '').toUpperCase();
                const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'CANCELED';
                const isCompleted = currentStatus === 'COMPLETED';

                return (
                  <div key={b._id} className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between shadow-md">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img
                        src={b.vehicle?.image}
                        alt={b.vehicle?.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            #{b.bookingNumber}
                          </span>
                          <span
                            className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              currentStatus === 'CONFIRMED' || currentStatus === 'ACTIVE'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                                : isCancelled
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                            }`}
                          >
                            {currentStatus || 'PENDING'}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">{b.vehicle?.name}</h3>
                        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 flex-shrink-0" />
                          <span>Pickup: {b.pickupLocation} ({b.pickupTime})</span>
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Dates: {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()} ({b.duration} days)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 sm:gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                      <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-cyan-400">₹{b.totalAmount}</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold">Tracking ID: {b.trackingId || 'TRK-8901'}</span>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {/* PRINT TAX INVOICE BUTTON */}
                        <button
                          onClick={() => setSelectedInvoiceBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-sky-100 dark:bg-cyan-950/80 hover:bg-sky-200 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          title="View & Print Official Tax Invoice"
                        >
                          <Printer className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                          <span>Invoice 🖨️</span>
                        </button>

                        {/* TRACK MY BOOKED VEHICLE BUTTON */}
                        {!isCancelled && (
                          <button
                            onClick={() => handleTrackBookedVehicle(b)}
                            className="px-3.5 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/80 hover:bg-orange-200 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Radio className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 animate-pulse" />
                            <span>Track Vehicle 🛰️</span>
                          </button>
                        )}

                        {!isCancelled && !isCompleted && (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-xs font-bold hover:bg-rose-200 transition-colors"
                          >
                            Cancel
                          </button>
                        )}

                        {/* DELETE CANCELLED BOOKING BUTTON */}
                        {isCancelled && (
                          <button
                            onClick={() => handleDeleteBookingRecord(b._id)}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/90 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                            title="Remove cancelled booking record from list"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>Remove Record</span>
                          </button>
                        )}

                        <button
                          onClick={() => setReviewBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 text-xs font-bold hover:bg-amber-200 transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5" /> Rate Ride
                        </button>
                      </div>
                  </div>

                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FAVORITES */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-4xl">❤️</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Favorite Vehicles Saved</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Click the heart icon on any vehicle card to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((v) => (
                <VehicleCard
                  key={v._id}
                  vehicle={v}
                  isFavorite={true}
                  onToggleFavorite={async () => {
                    await API.post(`/favorites/${v._id}`);
                    fetchMyFavorites();
                  }}
                  onBook={(veh) => setSelectedVehicle(veh)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROFILE EDIT & PHOTO UPLOAD */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="max-w-xl glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile & Photo</h2>
          
          {/* Profile Image Uploader Box */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img
              src={profileImage || user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt="Avatar Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-sky-600 dark:border-cyan-500 shadow-md"
            />
            <div className="space-y-2 flex-grow">
              <label className="block text-xs font-bold text-sky-700 dark:text-cyan-400">Upload Profile Photo</label>
              <div className="flex gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-xs shadow-md hover:from-sky-500 transition-all flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Directly saves photo to server `/uploads/`</p>
            </div>
          </div>

          {/* Quick Preset Avatars */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Or Select a Preset Avatar:</label>
            <div className="flex items-center gap-3 pt-1 overflow-x-auto pb-2">
              {presetAvatars.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPresetAvatar(avatar.url)}
                  className={`relative p-0.5 rounded-full transition-transform hover:scale-110 flex-shrink-0 ${
                    profileImage === avatar.url ? 'ring-2 ring-sky-600 dark:ring-cyan-400 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={avatar.url} alt={avatar.name} className="w-12 h-12 rounded-full object-cover" />
                  {profileImage === avatar.url && (
                    <div className="absolute -bottom-1 -right-1 bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-900 p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>



          <div>
            <label className="block text-xs text-slate-700 dark:text-slate-300 mb-1 font-bold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-700 dark:text-slate-300 mb-1 font-bold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-700 dark:text-slate-300 mb-1 font-bold">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none font-medium"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-sm rounded-xl hover:from-sky-500 transition-all shadow-md shadow-sky-600/20">
            Save Profile Changes
          </button>
        </form>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl text-slate-900 dark:text-white">
            <h3 className="font-bold text-lg">Rate {reviewBooking.vehicle?.name}</h3>
            
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-bold">Rating (1 to 5 Stars)</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value={5}>★★★★★ (5 - Excellent)</option>
                <option value={4}>★★★★☆ (4 - Good)</option>
                <option value={3}>★★★☆☆ (3 - Average)</option>
                <option value={2}>★★☆☆☆ (2 - Poor)</option>
                <option value={1}>★☆☆☆☆ (1 - Terrible)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-bold">Comment / Feedback</label>
              <textarea
                rows={3}
                placeholder="How was your experience riding this vehicle?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setReviewBooking(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button onClick={handleReviewSubmit} className="px-4 py-2 bg-amber-500 text-slate-900 font-bold text-xs rounded-xl shadow">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVehicle && (
        <BookingModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} onSuccess={fetchMyBookings} />
      )}

      {selectedInvoiceBooking && (
        <InvoiceModal booking={selectedInvoiceBooking} onClose={() => setSelectedInvoiceBooking(null)} />
      )}

    </div>
  );
}
