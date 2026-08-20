import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { Shield, Car, Calendar, Users, DollarSign, Plus, Edit, Trash2, CheckCircle, RefreshCw, X, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, vehiclesRes, bookingsRes, usersRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/vehicles'),
        API.get('/bookings'),
        API.get('/users'),
      ]);

      setStats(statsRes.data);
      setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : (vehiclesRes.data?.value || []));
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      showToast('Failed to fetch admin data', 'error');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs font-extrabold border border-amber-300 dark:border-amber-500/30 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Fleet Admin Console
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
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 ${activeTab === 'overview' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`pb-3 border-b-2 ${activeTab === 'vehicles' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          Manage Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 ${activeTab === 'bookings' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          Manage Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 ${activeTab === 'users' ? 'border-amber-600 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-black' : 'border-transparent hover:text-slate-900 dark:hover:text-white'}`}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Fleet Bookings</h3>
          <div className="space-y-3">
            {stats.recentBookings.map((b) => (
              <div key={b._id} className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{b.vehicle?.name || 'Vehicle'}</span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Customer: {b.user?.name} ({b.user?.email})</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sky-600 dark:text-cyan-400 text-base block">₹{b.totalAmount}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{b.bookingStatus}</span>
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

    </div>
  );
}
