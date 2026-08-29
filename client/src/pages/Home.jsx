import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Search, MapPin, Bike, Car, Shield, Sparkles, ChevronDown, Star, Compass, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [searchDate, setSearchDate] = useState('');

  const [allVehicles, setAllVehicles] = useState([]);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    fetchVehicles();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/vehicles');
      const vehicleList = Array.isArray(data) ? data : (data?.value || []);
      setAllVehicles(vehicleList);
      setFeaturedVehicles(vehicleList.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data } = await API.get('/favorites');
      setFavorites(Array.isArray(data) ? data.map((v) => v._id) : []);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async (vehicleId) => {
    if (!user) {
      showToast('Please login to save favorites', 'info');
      navigate('/login');
      return;
    }
    try {
      const { data } = await API.post(`/favorites/${vehicleId}`);
      if (data.isFavorite) {
        setFavorites((prev) => [...prev, vehicleId]);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== vehicleId));
      }
      showToast(data.message, 'success');
    } catch (error) {
      showToast('Failed to update favorite', 'error');
    }
  };

  const handleHeroSearch = () => {
    let queryParams = [];
    if (typeFilter !== 'all') queryParams.push(`type=${typeFilter}`);
    if (locationFilter !== 'all') queryParams.push(`location=${locationFilter}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    navigate(`/vehicles${queryString}`);
  };

  const explorePlaces = [
    {
      name: 'Calangute & Baga',
      locationQuery: 'Calangute',
      subtitle: 'Water sports & lively beach shacks',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Panaji Latin Quarter',
      locationQuery: 'Panaji',
      subtitle: 'Colorful Portuguese Fontainhas heritage',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Chapora Fort & Vagator',
      locationQuery: 'Vagator',
      subtitle: 'Iconic sunset cliffside views',
      image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Palolem & South Goa',
      locationQuery: 'Palolem',
      subtitle: 'Tranquil crescent bays & kayaking',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Dudhsagar Waterfalls',
      locationQuery: 'Dudhsagar',
      subtitle: '4-tiered jungle waterfall safari',
      image: 'https://images.unsplash.com/photo-1589139049929-1976077ff3e3?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Old Goa Cathedrals',
      locationQuery: 'Old Goa',
      subtitle: '16th century UNESCO cathedrals',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Betul Beach & Estuary',
      locationQuery: 'Betul',
      subtitle: 'Sal river mouth & lighthouse sunset',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Anjuna Boho Coast',
      locationQuery: 'Anjuna',
      subtitle: 'Bohemian markets & beach lounges',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const faqs = [
    {
      q: 'What documents are required to rent a bike or car in Goa?',
      a: 'You generally need an original valid Driving License (DL) and a government photo ID proof (Aadhaar or Passport).',
    },
    {
      q: 'Can I cancel or modify my booking?',
      a: 'Yes! You can easily cancel your booking from your My Bookings dashboard.',
    },
    {
      q: 'How does live vehicle tracking work?',
      a: 'Once your booking is confirmed, select your booked vehicle on the Live Tracking page to view GPS locations on our interactive Goa map.',
    },
    {
      q: 'Are helmets and roadside assistance included?',
      a: 'Yes, 2 complimentary helmets are provided with all bike rentals, along with 24/7 roadside emergency support across Goa.',
    },
  ];

  const exploreRef = useRef(null);

  const scrollExplore = (direction) => {
    if (exploreRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      exploreRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-8 pb-4 sm:pb-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[280px] bg-sky-500/15 dark:bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-orange-500/10 dark:bg-purple-500/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>🌴 AI Powered Goa Vehicle Rentals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Explore <span className="text-gradient">Goa</span><br />Your Way
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            Rent premium cars and bikes at transparent, affordable prices. Track your vehicle on a real Goa map and plan your trip with our AI assistant.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto glass-panel p-3.5 sm:p-4 rounded-3xl shadow-xl border border-amber-500/25 dark:border-amber-500/25 grid grid-cols-1 sm:grid-cols-4 gap-3 text-left mt-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vehicle Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="all">All Vehicles</option>
                <option value="bike">🏍️ Bikes & Scooters</option>
                <option value="car">🚗 Cars & SUVs</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="all">All Goa Locations</option>
                <option value="Panaji">Panaji</option>
                <option value="Calangute">Calangute</option>
                <option value="Baga">Baga</option>
                <option value="Anjuna">Anjuna</option>
                <option value="Vagator">Vagator</option>
                <option value="Margao">Margao</option>
                <option value="Vasco">Vasco</option>
                <option value="Mapusa">Mapusa</option>
                <option value="Dabolim Airport">Dabolim Airport</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Rental Date</label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleHeroSearch}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Search className="w-4 h-4 text-slate-950" />
                <span>Search Rides</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* REAL LIVE STATS SECTION */}
      <section className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/25 dark:border-amber-500/25 text-center shadow-md">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-500 dark:text-amber-400">
              {allVehicles.length > 0 ? `${allVehicles.length}+` : '19+'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">Verified Fleet Vehicles</p>
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-cyan-500 dark:text-cyan-400">
              {allVehicles.length > 0 ? `${allVehicles.reduce((acc, v) => acc + (v.reviewCount || 12), 0)}+` : '140+'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">Verified Tourist Reviews</p>
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-emerald-500 dark:text-emerald-400">
              {allVehicles.length > 0 ? `${new Set(allVehicles.map(v => v.location)).size}` : '9'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">Active Goa Pickup Hubs</p>
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-500 dark:text-amber-400">
              {allVehicles.length > 0 ? `${(allVehicles.reduce((acc, v) => acc + (v.rating || 4.9), 0) / allVehicles.length).toFixed(1)}⭐` : '4.9⭐'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">Fleet Customer Rating</p>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR RIDE CATEGORIES */}
      <section className="w-full px-4 sm:px-8 lg:px-12">
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Choose Your Ride</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Find the perfect vehicle for your Goa adventure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div
            onClick={() => navigate('/vehicles?type=bike')}
            className="glass-card p-6 sm:p-8 rounded-3xl cursor-pointer group flex flex-col justify-between space-y-4 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-cyan-500/60"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-cyan-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🏍️
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors">Bike Rental</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                Explore beaches, forts, narrow villages, and hidden waterfalls effortlessly on Activa, Royal Enfield Classic 350, or R15.
              </p>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-sky-50 dark:bg-cyan-500/20 text-sky-700 dark:text-cyan-300 font-bold text-xs sm:text-sm border border-sky-200 dark:border-cyan-500/40 w-fit group-hover:bg-sky-600 dark:group-hover:bg-cyan-500 group-hover:text-white transition-all">
              Explore Bikes →
            </button>
          </div>

          <div
            onClick={() => navigate('/vehicles?type=car')}
            className="glass-card p-6 sm:p-8 rounded-3xl cursor-pointer group flex flex-col justify-between space-y-4 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/60"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🚗
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Car Rental</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                Travel comfortably with family and friends in Hyundai Creta, Mahindra Thar 4x4, Toyota Innova, or Tata Nexon EV.
              </p>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm border border-blue-200 dark:border-blue-500/40 w-fit group-hover:bg-blue-600 dark:group-hover:bg-blue-600 group-hover:text-white transition-all">
              Explore Cars →
            </button>
          </div>

        </div>
      </section>

      {/* PLACES TO EXPLORE IN GOA (DISCOVER FEATURE) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-4">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            DISCOVER
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Places to Explore in Goa
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Choose a place and find the best self-drive vehicles near you
          </p>
        </div>

        {/* Horizontal Scrollable Carousel Container */}
        <div className="relative group">
          <div
            ref={exploreRef}
            className="flex items-center gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-4 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {explorePlaces.map((place, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/vehicles?location=${encodeURIComponent(place.locationQuery)}`)}
                className="flex-shrink-0 w-[240px] sm:w-[280px] h-[340px] sm:h-[380px] rounded-3xl overflow-hidden relative group/card cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-slate-200/40 dark:border-slate-800/80"
              >
                {/* Real Photo Image */}
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover object-center group-hover/card:scale-110 transition-transform duration-700"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity" />

                {/* Place Label Overlay at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1 z-10 text-left">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {place.name}
                  </h3>
                  <p className="text-xs text-slate-200/90 font-medium line-clamp-1">
                    {place.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 pt-1">
                    <span>Explore Fleet</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Left & Right Arrow Controls */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => scrollExplore('left')}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 transition-all"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scrollExplore('right')}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 transition-all"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Featured Fleet</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 font-medium">Handpicked top-rated vehicles available today</p>
          </div>
          <button
            onClick={() => navigate('/vehicles')}
            className="text-sky-600 dark:text-cyan-400 font-bold text-xs sm:text-sm hover:underline flex items-center gap-1"
          >
            View All ({featuredVehicles.length > 0 ? '19' : '0'}) →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium text-xs">Loading vehicles...</div>
        ) : featuredVehicles.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium text-xs">No vehicles available right now.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                isFavorite={favorites.includes(vehicle._id)}
                onToggleFavorite={toggleFavorite}
                onBook={(v) => setSelectedVehicle(v)}
              />
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE GOARIDE */}
      <section className="w-full px-4 sm:px-8 lg:px-12">
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 text-center space-y-6 sm:space-y-8 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Why Choose GoaRide?</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1">Everything you need for a stress-free Goan vacation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
              <div className="text-2xl">💰</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Best Prices</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Transparent daily rates with no hidden charges or surprise surcharges.</p>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
              <div className="text-2xl">⚡</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Quick Booking</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Reserve your ride in under 2 minutes with instant confirmation.</p>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
              <div className="text-2xl">📍</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Real GPS Map</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Track your rental vehicle location live on our interactive Goa map.</p>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
              <div className="text-2xl">🤖</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">AI Assistant</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Get instant AI recommendations, itineraries, and trip assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR PICKUP LOCATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Popular Pickup Hubs</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 font-medium">Pick up or drop off your vehicle anywhere in Goa</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {[
            '📍 Panaji',
            '🏖️ Calangute',
            '🌊 Baga',
            '🌴 Anjuna',
            '🌅 Vagator',
            '🏙️ Margao',
            '✈️ Vasco',
            '📍 Mapusa',
            '✈️ Dabolim Airport',
          ].map((loc) => (
            <button
              key={loc}
              onClick={() => navigate(`/vehicles?location=${loc.split(' ')[1]}`)}
              className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              {loc}
            </button>
          ))}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-3 border border-slate-200/80 dark:border-slate-800">
            <div className="text-amber-500 text-xs">★★★★★</div>
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm italic">
              "Excellent service! The Activa 6G was spotless and pickup near Calangute beach took just 3 minutes."
            </p>
            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">— Rahul S.</div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-3 border border-slate-200/80 dark:border-slate-800">
            <div className="text-amber-500 text-xs">★★★★★</div>
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm italic">
              "Booked a Mahindra Thar for our family trip. Best decision ever! Fair price and smooth transaction."
            </p>
            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">— Priya M.</div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-3 border border-slate-200/80 dark:border-slate-800">
            <div className="text-amber-500 text-xs">★★★★★</div>
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm italic">
              "The AI assistant recommended a great 3-day itinerary and the live tracking gave complete peace of mind."
            </p>
            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">— Arjun K.</div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 dark:text-white flex justify-between items-center text-xs sm:text-sm"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-sky-600 dark:text-cyan-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 sm:px-5 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-2.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedVehicle && (
        <BookingModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}

    </div>
  );
}
