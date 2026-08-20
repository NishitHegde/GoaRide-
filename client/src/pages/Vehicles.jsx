import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Search, Filter, SlidersHorizontal, RotateCcw, Sparkles, Car, Bike } from 'lucide-react';

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const initialType = searchParams.get('type') || 'all';
  const initialLocation = searchParams.get('location') || 'all';

  const [type, setType] = useState(initialType);
  const [location, setLocation] = useState(initialLocation);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [transmission, setTransmission] = useState('all');
  const [fuel, setFuel] = useState('all');

  const [vehicles, setVehicles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, [type, location, sort, transmission, fuel]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if (type !== 'all') queryParams.push(`type=${type}`);
      if (location !== 'all') queryParams.push(`location=${encodeURIComponent(location)}`);
      if (sort) queryParams.push(`sort=${sort}`);
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (transmission !== 'all') queryParams.push(`transmission=${transmission}`);
      if (fuel !== 'all') queryParams.push(`fuel=${fuel}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const { data } = await API.get(`/vehicles${queryString}`);
      const vehicleList = Array.isArray(data) ? data : (data?.value || []);
      setVehicles(vehicleList);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const resetFilters = () => {
    setType('all');
    setLocation('all');
    setSearch('');
    setSort('newest');
    setTransmission('all');
    setFuel('all');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-cyan-500/10 text-sky-800 dark:text-cyan-300 text-xs font-extrabold border border-sky-200 dark:border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
            <span>Goa Rental Fleet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Available Vehicles</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Browse verified bikes & cars with server-side collision validation</p>
        </div>

        {/* Quick Type Segmented Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 text-xs font-bold w-fit">
          <button
            onClick={() => setType('all')}
            className={`px-4 py-2 rounded-xl transition-all ${type === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            All Rides
          </button>
          <button
            onClick={() => setType('bike')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${type === 'bike' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-cyan-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Bike className="w-3.5 h-3.5" /> Bikes
          </button>
          <button
            onClick={() => setType('car')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${type === 'car' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Car className="w-3.5 h-3.5" /> Cars
          </button>
        </div>
      </div>

      {/* Filter Glass Toolbar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xl">
        
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by vehicle model (e.g. Activa 6G, Thar 4x4, Creta, Classic 350)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-sm rounded-2xl hover:from-sky-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
          
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">Location Hub</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Locations</option>
              <option value="Panaji">Panaji</option>
              <option value="Calangute">Calangute</option>
              <option value="Baga">Baga</option>
              <option value="Anjuna">Anjuna</option>
              <option value="Vagator">Vagator</option>
              <option value="Margao">Margao</option>
              <option value="Vasco">Vasco</option>
              <option value="Mapusa">Mapusa</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">Transmission</label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">Fuel Type</label>
            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="EV">EV</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

        </div>

      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold">Loading GoaRide fleet...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Vehicles Match Criteria</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Try clearing filters to view all available vehicles.</p>
          <button onClick={resetFilters} className="px-4 py-2 bg-sky-100 dark:bg-cyan-500/20 text-sky-800 dark:text-cyan-300 rounded-xl text-xs font-bold border border-sky-300 dark:border-cyan-500/40">
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
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

      {/* Booking Modal */}
      {selectedVehicle && (
        <BookingModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}

    </div>
  );
}
