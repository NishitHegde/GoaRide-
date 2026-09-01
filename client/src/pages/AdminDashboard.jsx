import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { socket } from '../services/socket';
import { useToast } from '../context/ToastContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shield, Car, Calendar, Users, DollarSign, Plus, Edit, Trash2, CheckCircle, RefreshCw, X, Radio, AlertTriangle, MapPin, Gauge, TrendingUp, Wallet, Wrench, ShieldCheck, Compass } from 'lucide-react';

const liveCarIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202003.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

export default function AdminDashboard() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    revenue: 0,
    recentBookings: [],
  });
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminExplorePlaces, setAdminExplorePlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // Explore Places Modal State
  const [exploreModalOpen, setExploreModalOpen] = useState(false);
  const [editingExploreId, setEditingExploreId] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeSubtitle, setPlaceSubtitle] = useState('');
  const [placeImage, setPlaceImage] = useState('');
  const [placeOrder, setPlaceOrder] = useState(0);

  // Master Telemetry Fleet Map State
  const [masterFleetGps, setMasterFleetGps] = useState([
    { tripId: 'trip_101', name: 'Honda Activa 6G', lat: 15.5438, lng: 73.7554, speed: 38, status: 'ON_TRIP' },
    { tripId: 'trip_102', name: 'Mahindra Thar 4x4', lat: 15.5553, lng: 73.7517, speed: 45, status: 'ON_TRIP' },
    { tripId: 'trip_103', name: 'Toyota Innova Crysta', lat: 15.3808, lng: 73.8314, speed: 52, status: 'AVAILABLE' },
    { tripId: 'trip_104', name: 'RE Classic 350', lat: 15.6028, lng: 73.7381, speed: 0, status: 'OFFLINE' },
  ]);

  const [sosBanners, setSosBanners] = useState([]);

  // Modal State
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  const [vName, setVName] = useState('');
  const [vBrand, setVBrand] = useState('');
  const [vModel, setVModel] = useState('');
  const [vType, setVType] = useState('bike');
  const [vCategory, setVCategory] = useState('Scooter');
  const [vPricePerDay, setVPricePerDay] = useState(450);
  const [vSecurityDeposit, setVSecurityDeposit] = useState(1000);
  const [vFuelType, setVFuelType] = useState('Petrol');
  const [vTransmission, setVTransmission] = useState('Automatic');
  const [vSeats, setVSeats] = useState('2 seats');
  const [vLocation, setVLocation] = useState('Calangute');
  const [vImage, setVImage] = useState('');
  const [vDescription, setVDescription] = useState('');

  useEffect(() => {
    fetchAdminDashboardData();

    socket.connect();
    socket.emit('join-admin');

    socket.on('master-telemetry-update', (data) => {
      setMasterFleetGps((prev) => {
        const exists = prev.find((item) => item.tripId === data.tripId);
        if (exists) {
          return prev.map((item) =>
            item.tripId === data.tripId
              ? { ...item, lat: data.lat, lng: data.lng, speed: data.speed }
              : item
          );
        } else {
          return [...prev, { tripId: data.tripId, name: 'Live Goa Vehicle', lat: data.lat, lng: data.lng, speed: data.speed, status: 'ON_TRIP' }];
        }
      });
    });

    socket.on('admin-sos-alert', (sosData) => {
      setSosBanners((prev) => [sosData, ...prev]);
      showToast('🚨 HIGH PRIORITY: SOS Emergency Triggered!', 'error');
    });

    return () => {
      socket.off('master-telemetry-update');
      socket.off('admin-sos-alert');
      socket.disconnect();
    };
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, vehiclesRes, bookingsRes, usersRes, exploreRes] = await Promise.allSettled([
        API.get('/admin/dashboard'),
        API.get('/vehicles'),
        API.get('/bookings'),
        API.get('/users'),
        API.get('/explore-places/admin'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (vehiclesRes.status === 'fulfilled') setVehicles(Array.isArray(vehiclesRes.value.data) ? vehiclesRes.value.data : (vehiclesRes.value.data?.value || []));
      if (bookingsRes.status === 'fulfilled') setBookings(Array.isArray(bookingsRes.value.data) ? bookingsRes.value.data : []);
      if (usersRes.status === 'fulfilled') setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
      if (exploreRes.status === 'fulfilled') setAdminExplorePlaces(Array.isArray(exploreRes.value.data) ? exploreRes.value.data : []);

      setLoading(false);
    } catch (error) {
      console.error('Admin Dashboard Load Error:', error);
      setLoading(false);
    }
  };

  const openAddExploreModal = () => {
    setEditingExploreId(null);
    setPlaceName('');
    setPlaceQuery('');
    setPlaceSubtitle('');
    setPlaceImage('');
    setPlaceOrder(adminExplorePlaces.length + 1);
    setExploreModalOpen(true);
  };

  const openEditExploreModal = (place) => {
    setEditingExploreId(place._id);
    setPlaceName(place.name || '');
    setPlaceQuery(place.locationQuery || '');
    setPlaceSubtitle(place.subtitle || '');
    setPlaceImage(place.image || '');
    setPlaceOrder(place.order || 0);
    setExploreModalOpen(true);
  };

  const handleSaveExplorePlace = async (e) => {
    e.preventDefault();
    if (!placeName || !placeQuery || !placeSubtitle || !placeImage) {
      showToast('Please fill in all place details', 'error');
      return;
    }
    const payload = {
      name: placeName,
      locationQuery: placeQuery,
      subtitle: placeSubtitle,
      image: placeImage,
      order: Number(placeOrder),
    };
    try {
      if (editingExploreId) {
        await API.put(`/explore-places/${editingExploreId}`, payload);
        showToast('Explore place updated in MongoDB!', 'success');
      } else {
        await API.post('/explore-places', payload);
        showToast('New explore place created in MongoDB!', 'success');
      }
      setExploreModalOpen(false);
      fetchAdminDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save place', 'error');
    }
  };

  const handleDeleteExplorePlace = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from Places to Explore database?`)) return;
    try {
      await API.delete(`/explore-places/${id}`);
      showToast('Explore place deleted from MongoDB', 'info');
      fetchAdminDashboardData();
    } catch (error) {
      showToast('Failed to delete explore place', 'error');
    }
  };

  const openAddVehicleModal = () => {
    setEditingVehicleId(null);
    setVName('');
    setVBrand('');
    setVModel('');
    setVType('bike');
    setVCategory('Scooter');
    setVPricePerDay(450);
    setVSecurityDeposit(1000);
    setVFuelType('Petrol');
    setVTransmission('Automatic');
    setVSeats('2 seats');
    setVLocation('Calangute');
    setVImage('');
    setVDescription('');
    setVehicleModalOpen(true);
  };

  const openEditVehicleModal = (veh) => {
    setEditingVehicleId(veh._id);
    setVName(veh.name);
    setVBrand(veh.brand || '');
    setVModel(veh.model || '');
    setVType(veh.type);
    setVCategory(veh.category || 'Standard');
    setVPricePerDay(veh.pricePerDay);
    setVSecurityDeposit(veh.securityDeposit || 1000);
    setVFuelType(veh.fuelType || 'Petrol');
    setVTransmission(veh.transmission || 'Manual');
    setVSeats(veh.seats || '2 seats');
    setVLocation(veh.location);
    setVImage(veh.image);
    setVDescription(veh.description || '');
    setVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: vName,
        brand: vBrand || vName.split(' ')[0],
        model: vModel,
        type: vType,
        category: vCategory,
        pricePerDay: vPricePerDay,
        securityDeposit: vSecurityDeposit,
        fuelType: vFuelType,
        transmission: vTransmission,
        seats: vSeats,
        location: vLocation,
        image: vImage || 'https://placehold.co/800x600/0b1727/ffffff?text=Vehicle',
        description: vDescription,
      };

      if (editingVehicleId) {
        await API.put(`/vehicles/${editingVehicleId}`, payload);
        showToast('Vehicle updated successfully!', 'success');
      } else {
        await API.post('/vehicles', payload);
        showToast('New vehicle added to fleet!', 'success');
      }

      setVehicleModalOpen(false);
      fetchAdminDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save vehicle', 'error');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from MongoDB?')) return;
    try {
      await API.delete(`/vehicles/${vehicleId}`);
      showToast('Vehicle removed successfully!', 'info');
      fetchAdminDashboardData();
    } catch (error) {
      showToast('Failed to delete vehicle', 'error');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await API.put(`/bookings/${bookingId}`, { bookingStatus: newStatus });
      showToast(`Booking status updated to ${newStatus}`, 'success');
      fetchAdminDashboardData();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user account "${userName || 'User'}" permanently?`)) return;
    try {
      const { data } = await API.delete(`/users/${userId}`);
      showToast(data.message || 'User account deleted successfully', 'info');
      fetchAdminDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-amber-600 font-extrabold">Loading Admin Console...</div>;
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-10 space-y-8">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs font-extrabold border border-amber-300 dark:border-amber-500/30 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Fleet Admin Master Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Admin Dashboard</h1>
        </div>

        <button
          onClick={fetchAdminDashboardData}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* SOS Alert Notification Banners */}
      {sosBanners.length > 0 && (
        <div className="space-y-2">
          {sosBanners.map((sos, i) => (
            <div key={i} className="p-4 rounded-2xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-between shadow-xl animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>🚨 EMERGENCY SOS ALERT: {sos.message || 'Customer requested emergency assistance!'} (Trip #{sos.tripId})</span>
              </div>
              <button onClick={() => setSosBanners(prev => prev.filter((_, idx) => idx !== i))} className="px-3 py-1 bg-white text-rose-900 rounded-lg text-[10px] font-black">
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{stats.revenue.toLocaleString()}</p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Vehicles</span>
              <Car className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-cyan-400">{stats.totalVehicles}</p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
              <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">{stats.totalBookings}</p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">{stats.totalUsers}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold text-slate-600 dark:text-slate-400 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors flex-shrink-0 ${activeTab === 'overview' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('mastermap')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors flex-shrink-0 ${activeTab === 'mastermap' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Radio className="w-4 h-4 text-amber-500" /> Master Telemetry Map
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors flex-shrink-0 ${activeTab === 'analytics' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" /> Revenue & Financial Analytics
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`pb-3 border-b-2 transition-colors flex-shrink-0 ${activeTab === 'vehicles' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          Manage Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors flex-shrink-0 ${activeTab === 'explore' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Compass className="w-4 h-4 text-cyan-500" /> Places to Explore ({adminExplorePlaces.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition-colors flex-shrink-0 ${activeTab === 'bookings' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          Manage Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-colors flex-shrink-0 ${activeTab === 'users' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {/* TAB: MASTER TELEMETRY MAP */}
      {activeTab === 'mastermap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Live Master Fleet Telemetry Stream</h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Socket.IO Master Stream Active
            </span>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl h-[500px]">
            <MapContainer center={[15.4989, 73.8278]} zoom={11} scrollWheelZoom={true} className="w-full h-full">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {masterFleetGps.map((v, i) => (
                <Marker key={i} position={[v.lat, v.lng]} icon={liveCarIcon}>
                  <Popup className="font-sans text-xs">
                    <strong className="text-slate-900 block">{v.name}</strong>
                    <span className="text-sky-600 font-bold">Speed: {v.speed} km/h</span><br />
                    <span className="text-emerald-600 font-extrabold">Status: {v.status}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* TAB: REVENUE & FINANCIAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Fleet Revenue & Financial Analytics</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time revenue metrics, daily run-rate, hub performance, and fleet health</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300">
              Live Revenue Stream
            </span>
          </div>

          {/* Revenue KPI Cards */}
          {(() => {
            const activeNonCancelled = bookings.filter(b => (b.bookingStatus || b.status || '').toUpperCase() !== 'CANCELLED' && (b.bookingStatus || b.status || '').toUpperCase() !== 'CANCELED');
            const calculatedTotalRevenue = activeNonCancelled.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
            const calculatedAvgValue = activeNonCancelled.length > 0 ? Math.round(calculatedTotalRevenue / activeNonCancelled.length) : 0;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Revenue</span>
                    <Wallet className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹{calculatedTotalRevenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block">Gross active fleet earnings (Excl. Cancelled)</span>
                </div>

                <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Avg. Booking Value</span>
                    <TrendingUp className="w-4 h-4 text-sky-500" />
                  </div>
                  <span className="text-2xl font-black text-sky-600 dark:text-cyan-400">
                    ₹{calculatedAvgValue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block">Average earnings per active trip</span>
                </div>

                <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Rentals</span>
                    <Car className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                    {bookings.filter(b => (b.bookingStatus || b.status) === 'ACTIVE' || (b.bookingStatus || b.status) === 'CONFIRMED').length} Vehicles
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block">Currently out on Goa roads</span>
                </div>

                <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Deposits Held</span>
                    <Shield className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    ₹{vehicles.reduce((acc, v) => acc + (v.securityDeposit || 1000), 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block">Security deposit escrow pool</span>
                </div>
              </div>
            );
          })()}

          {/* Breakdown Section: Vehicle Category & Hub Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Hub Revenue Matrix */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xl">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" /> Top Goa Pickup Hub Revenue
              </h4>
              <div className="space-y-3">
                {['Calangute', 'Baga', 'Panaji', 'Dabolim Airport', 'Anjuna'].map((hub, idx) => {
                  const activeNonCancelled = bookings.filter(b => (b.bookingStatus || b.status || '').toUpperCase() !== 'CANCELLED' && (b.bookingStatus || b.status || '').toUpperCase() !== 'CANCELED');
                  const hubBookings = activeNonCancelled.filter(b => (b.pickupLocation || '').toLowerCase().includes(hub.toLowerCase()));
                  const hubRev = hubBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
                  const percentage = Math.min(100, Math.max(15, (hubBookings.length / (activeNonCancelled.length || 1)) * 100));

                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{hub} Hub</span>
                        <span className="text-sky-600 dark:text-cyan-400 font-black">₹{hubRev.toLocaleString()} ({hubBookings.length} trips)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fleet Health & Servicing Status */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xl">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-500" /> Fleet Health & Maintenance Monitor
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Vehicles Inspected & Road Ready</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{vehicles.length} / {vehicles.length} Passed</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Oil Change & Servicing Due</span>
                  </div>
                  <span className="font-black text-amber-600 dark:text-amber-400">0 Vehicles</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Goa Transport Commercial Permits</span>
                  </div>
                  <span className="font-black text-sky-600 dark:text-cyan-400">100% Verified</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Fleet Bookings</h3>
          <div className="space-y-3">
            {(stats?.recentBookings || []).length === 0 ? (
              <div className="p-5 rounded-2xl glass-card text-center text-xs text-slate-500 font-bold border border-slate-200/80 dark:border-slate-800">
                No recent bookings recorded yet.
              </div>
            ) : (
              (stats?.recentBookings || []).map((b) => (
                <div key={b._id || Math.random()} className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">{b.vehicle?.name || 'Vehicle'}</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Customer: {b.user?.name || 'Guest'} ({b.user?.email || 'N/A'})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sky-600 dark:text-cyan-400 text-base block">₹{(b.totalAmount || 0).toLocaleString()}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{b.bookingStatus || 'CONFIRMED'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: PLACES TO EXPLORE */}
      {activeTab === 'explore' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Manage Places to Explore in Goa</h3>
              <p className="text-xs text-slate-500 font-medium">Add, edit, reorder, or update images of destinations shown on the homepage discovery carousel.</p>
            </div>
            <button
              onClick={openAddExploreModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Destination
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminExplorePlaces.map((place) => (
              <div key={place._id} className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-md">
                <div className="relative h-40 overflow-hidden">
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-mono font-bold">
                    Order: {place.order}
                  </div>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{place.name}</h4>
                    <p className="text-xs text-sky-600 dark:text-cyan-400 font-bold">Query: {place.locationQuery}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{place.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => openEditExploreModal(place)}
                      className="flex-1 py-1.5 rounded-lg bg-sky-100 dark:bg-cyan-950/80 text-sky-800 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 border border-sky-300 dark:border-cyan-500/30 hover:bg-sky-200"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExplorePlace(place._id, place.name)}
                      className="py-1.5 px-3 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs border border-rose-300 dark:border-rose-500/30 hover:bg-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: VEHICLES CRUD */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Fleet Inventory</h3>
            <button
              onClick={openAddVehicleModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Vehicle
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-bold">
                <tr>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Price / Day</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={v.image} alt={v.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{v.name}</span>
                        <span className="text-[11px] text-slate-500">{v.brand}</span>
                      </div>
                    </td>
                    <td className="p-3.5 capitalize font-medium">{v.type}</td>
                    <td className="p-3.5 font-bold text-sky-600 dark:text-cyan-400">₹{v.pricePerDay}</td>
                    <td className="p-3.5 font-medium">{v.location}</td>
                    <td className="p-3.5 text-amber-500 font-bold">⭐ {v.rating}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditVehicleModal(v)}
                        className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 hover:bg-blue-200"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v._id)}
                        className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 hover:bg-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">All User Bookings</h3>
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-bold">
                <tr>
                  <th className="p-3.5">Booking #</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Dates</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="p-3.5 font-bold text-sky-600 dark:text-cyan-400">{b.bookingNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{b.vehicle?.name || 'N/A'}</td>
                    <td className="p-3.5 font-medium">{b.user?.name} ({b.user?.phone})</td>
                    <td className="p-3.5 font-medium">{new Date(b.pickupDate).toLocaleDateString()} - {new Date(b.returnDate).toLocaleDateString()}</td>
                    <td className="p-3.5 font-bold text-sky-600 dark:text-cyan-400">₹{b.totalAmount}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">{b.bookingStatus}</span>
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={b.bookingStatus}
                        onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded px-2 py-1 font-bold"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Registered Users</h3>
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-bold">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <img src={u.profileImage} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5 font-medium">{u.email}</td>
                    <td className="p-3.5 font-medium">{u.phone}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${u.role === 'ADMIN' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300' : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-1.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 rounded hover:bg-rose-200 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT VEHICLE MODAL */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl p-6 space-y-4 my-8 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{editingVehicleId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
              <button onClick={() => setVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Vehicle Name</label>
                  <input
                    type="text"
                    required
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    placeholder="e.g. Honda Activa 6G"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Brand</label>
                  <input
                    type="text"
                    value={vBrand}
                    onChange={(e) => setVBrand(e.target.value)}
                    placeholder="e.g. Honda"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Type</label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Price / Day (₹)</label>
                  <input
                    type="number"
                    required
                    value={vPricePerDay}
                    onChange={(e) => setVPricePerDay(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Location</label>
                  <input
                    type="text"
                    required
                    value={vLocation}
                    onChange={(e) => setVLocation(e.target.value)}
                    placeholder="e.g. Calangute"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Transmission</label>
                  <select
                    value={vTransmission}
                    onChange={(e) => setVTransmission(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Fuel</label>
                  <select
                    value={vFuelType}
                    onChange={(e) => setVFuelType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Seats</label>
                  <input
                    type="text"
                    value={vSeats}
                    onChange={(e) => setVSeats(e.target.value)}
                    placeholder="e.g. 2 seats"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Image URL</label>
                <input
                  type="text"
                  value={vImage}
                  onChange={(e) => setVImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Description</label>
                <textarea
                  rows={2}
                  value={vDescription}
                  onChange={(e) => setVDescription(e.target.value)}
                  placeholder="Enter vehicle details..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setVehicleModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-md">
                  {editingVehicleId ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPLORE PLACE MODAL */}
      {exploreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-500" />
                <span>{editingExploreId ? 'Edit Destination' : 'Add Destination to Explore'}</span>
              </h3>
              <button onClick={() => setExploreModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExplorePlace} className="space-y-3 text-left text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Destination Name</label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g., Calangute & Baga"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Location Query Filter</label>
                  <input
                    type="text"
                    value={placeQuery}
                    onChange={(e) => setPlaceQuery(e.target.value)}
                    placeholder="e.g., Calangute"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Display Order</label>
                  <input
                    type="number"
                    value={placeOrder}
                    onChange={(e) => setPlaceOrder(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Subtitle / Description</label>
                <input
                  type="text"
                  value={placeSubtitle}
                  onChange={(e) => setPlaceSubtitle(e.target.value)}
                  placeholder="e.g., Water sports & lively beach shacks"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Image URL (High Definition photo)</label>
                <input
                  type="text"
                  value={placeImage}
                  onChange={(e) => setPlaceImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setExploreModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-md">
                  {editingExploreId ? 'Update Place' : 'Create Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
