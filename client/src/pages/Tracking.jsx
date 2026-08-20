import React, { useState } from 'react';
import API from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Navigation, ShieldCheck, Clock, Radio, Compass, Zap, PhoneCall } from 'lucide-react';

const bikeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202003.png',
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

export default function Tracking() {
  const [query, setQuery] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultCenter = [15.4989, 73.8278];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(11);

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      const { data } = await API.get(`/bookings/track/${query.trim()}`);
      setTrackingData(data);
      if (data.gpsLocation) {
        setMapCenter([data.gpsLocation.latitude, data.gpsLocation.longitude]);
        setMapZoom(14);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setTrackingData(null);
      setError(err.response?.data?.message || 'No active booking found for this ID/Number');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40 text-xs font-extrabold shadow-sm">
          <Radio className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 animate-pulse" /> Live Telemetry GPS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Real-Time Vehicle Tracker</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Enter your Booking Number or Tracking ID to stream live location coordinates</p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="max-w-xl mx-auto glass-panel p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex gap-2 shadow-xl">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Enter Booking # (e.g. GOA-1001) or Tracking ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-sky-600/20 flex items-center gap-1.5"
        >
          {loading ? 'Connecting...' : 'Track GPS'}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs text-center font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Interactive Leaflet Map & HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map View Container */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl h-[480px] relative">
          
          {/* HUD Overlay Badge */}
          <div className="absolute top-4 left-4 z-10 glass-panel px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-900 dark:text-white">Goa Fleet Map Stream</span>
          </div>

          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="w-full h-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {trackingData?.gpsLocation && (
              <Marker
                position={[trackingData.gpsLocation.latitude, trackingData.gpsLocation.longitude]}
                icon={trackingData.vehicleType === 'car' ? carIcon : bikeIcon}
              >
                <Popup className="font-sans text-xs">
                  <strong className="text-slate-900 block">{trackingData.vehicleName}</strong>
                  <span className="text-slate-600">Status: {trackingData.bookingStatus}</span><br />
                  <span className="text-sky-600 font-bold">Speed: {trackingData.speed || '25 km/h'}</span>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Status Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          {trackingData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <img
                  src={trackingData.vehicleImage}
                  alt={trackingData.vehicleName}
                  className="w-16 h-16 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                />
                <div>
                  <span className="text-[11px] font-extrabold text-sky-600 dark:text-cyan-400 uppercase tracking-wider">Active Telemetry</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{trackingData.vehicleName}</h3>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">#{trackingData.bookingNumber}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Pickup Hub:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{trackingData.pickupLocation}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Current Speed:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{trackingData.speed || '25 km/h'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Fuel Level:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">85% Full</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Rental Status:</span>
                  <span className="font-bold text-sky-600 dark:text-cyan-400">{trackingData.bookingStatus}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <span>GPS telemetry is active. 24/7 Roadside Assistance enabled across all Goa routes.</span>
              </div>

              <a
                href="tel:+917588459115"
                className="w-full py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-200 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Emergency Helpline (+91 75884 59115)</span>
              </a>
            </div>
          ) : (
            <div className="text-center py-20 space-y-4 text-slate-500 dark:text-slate-400">
              <Compass className="w-14 h-14 text-sky-600 dark:text-cyan-400 mx-auto animate-spin" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Awaiting Tracking Query</h3>
              <p className="text-xs font-medium max-w-xs mx-auto">Enter your Booking Number or Tracking ID above to initialize real-time telemetry stream.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
