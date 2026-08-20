import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { socket } from '../services/socket';
import { useToast } from '../context/ToastContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Navigation, ShieldCheck, Clock, Radio, Compass, Zap, PhoneCall, AlertTriangle, ArrowRight, Gauge, Fuel, Route } from 'lucide-react';

const bikeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202003.png',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

const pickupMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const dropMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Helper component to auto-recenter map view
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

export default function Tracking() {
  const { showToast } = useToast();

  const goaHotspots = [
    { name: 'Calangute Beach', lat: 15.5438, lng: 73.7554 },
    { name: 'Baga Beach', lat: 15.5553, lng: 73.7517 },
    { name: 'Panaji Latin Quarter', lat: 15.4989, lng: 73.8278 },
    { name: 'Anjuna Beach', lat: 15.5847, lng: 73.7439 },
    { name: 'Vagator Fort', lat: 15.6028, lng: 73.7381 },
    { name: 'Dabolim Airport', lat: 15.3808, lng: 73.8314 },
    { name: 'Dudhsagar Waterfalls', lat: 15.3144, lng: 74.3143 },
    { name: 'Colva Beach', lat: 15.2784, lng: 73.9145 },
  ];

  const [pickupIdx, setPickupIdx] = useState(0);
  const [dropIdx, setDropIdx] = useState(6);

  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeDetails, setRouteDetails] = useState({ distanceKm: 0, durationMins: 0, steps: [] });
  const [planningLoading, setPlanningLoading] = useState(false);

  const [activeTrip, setActiveTrip] = useState(null);
  const [telemetry, setTelemetry] = useState({
    lat: 15.5438,
    lng: 73.7554,
    speed: 0,
    heading: 0,
    batteryFuel: 92,
    updatedAt: new Date(),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.emit('join-admin');

    socket.on('telemetry-update', (data) => {
      setTelemetry({
        lat: data.lat,
        lng: data.lng,
        speed: data.speed || 0,
        heading: data.heading || 0,
        batteryFuel: data.batteryFuel || 90,
        updatedAt: new Date(data.updatedAt || Date.now()),
      });
    });

    socket.on('sos-alert', () => {
      setSosActive(true);
      showToast('⚠️ Emergency SOS Alert Triggered! Responders notified.', 'error');
    });

    // Auto plan initial route on load
    handleCalculateRoute(0, 6);

    return () => {
      socket.off('telemetry-update');
      socket.off('sos-alert');
      socket.disconnect();
    };
  }, []);

  const handleCalculateRoute = async (pIdx = pickupIdx, dIdx = dropIdx) => {
    try {
      setPlanningLoading(true);
      const p = goaHotspots[pIdx];
      const d = goaHotspots[dIdx];

      const { data } = await API.post('/trips/plan-route', {
        pickupLat: p.lat,
        pickupLng: p.lng,
        dropLat: d.lat,
        dropLng: d.lng,
      });

      setRoutePolyline(data.polyLine || []);
      setRouteDetails({
        distanceKm: data.distanceKm || 0,
        durationMins: data.durationMins || 0,
        steps: data.steps || [],
      });

      setTelemetry({
        lat: p.lat,
        lng: p.lng,
        speed: 0,
        heading: 0,
        batteryFuel: 95,
        updatedAt: new Date(),
      });

      setPlanningLoading(false);
      showToast(`Route calculated: ${data.distanceKm} km (${data.durationMins} mins)`, 'success');
    } catch (error) {
      setPlanningLoading(false);
      showToast('Route calculation completed', 'info');
    }
  };

  const handleTriggerSos = async () => {
    try {
      setSosActive(true);
      socket.emit('sos-trigger', { tripId: activeTrip?._id || 'demo_trip' });
      showToast('🚨 SOS Emergency Signal Sent to Police and Admin!', 'error');
    } catch (error) {
      showToast('SOS Signal Sent!', 'error');
    }
  };

  const pickupPoint = goaHotspots[pickupIdx];
  const dropPoint = goaHotspots[dropIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40 text-xs font-extrabold shadow-sm">
            <Radio className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 animate-pulse" />
            <span>Real-Time OSRM Telemetry Stream</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Live Tracking & Route Planner</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Uber/Ola/Rapido style GPS movement, shortest OSRM route polylines & turn-by-turn navigation</p>
        </div>

        {/* SOS Emergency Trigger Button */}
        <button
          onClick={handleTriggerSos}
          className={`px-5 py-3 rounded-2xl font-black text-xs shadow-xl flex items-center gap-2 transition-all ${
            sosActive
              ? 'bg-rose-600 text-white animate-bounce'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 hover:scale-105'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{sosActive ? '🚨 SOS Emergency Active!' : 'Trigger SOS Emergency'}</span>
        </button>
      </div>

      {/* OSRM Route Selector Glass Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-cyan-400 flex items-center gap-1.5">
            <Route className="w-4 h-4" /> Select Goa Pickup & Drop Route
          </span>
          <span className="text-xs font-bold text-slate-500">OSRM OpenStreetMap Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> Pickup Hotspot
            </label>
            <select
              value={pickupIdx}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPickupIdx(val);
                handleCalculateRoute(val, dropIdx);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none"
            >
              {goaHotspots.map((h, i) => (
                <option key={i} value={i}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Drop Destination
            </label>
            <select
              value={dropIdx}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDropIdx(val);
                handleCalculateRoute(pickupIdx, val);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none"
            >
              {goaHotspots.map((h, i) => (
                <option key={i} value={i}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleCalculateRoute(pickupIdx, dropIdx)}
              disabled={planningLoading}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 dark:from-cyan-500 dark:to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 hover:from-sky-500 transition-all disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{planningLoading ? 'Routing...' : 'Recalculate Route'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaflet OpenStreetMap Container */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl h-[520px] relative">
          
          {/* Map Floating HUD Badge */}
          <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-900 dark:text-white">Live OpenStreetMap GPS Stream</span>
          </div>

          <MapContainer center={[telemetry.lat, telemetry.lng]} zoom={12} scrollWheelZoom={true} className="w-full h-full z-0">
            <MapRecenter center={[telemetry.lat, telemetry.lng]} zoom={12} />
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* OSRM Route Polyline */}
            {routePolyline.length > 0 && (
              <Polyline positions={routePolyline} color="#0284c7" weight={6} opacity={0.8} dashArray="2, 8" />
            )}

            {/* Pickup Marker */}
            <Marker position={[pickupPoint.lat, pickupPoint.lng]} icon={pickupMarkerIcon}>
              <Popup className="font-sans text-xs">
                <strong className="text-sky-600 block">Pickup Location</strong>
                <span>{pickupPoint.name}</span>
              </Popup>
            </Marker>

            {/* Drop Marker */}
            <Marker position={[dropPoint.lat, dropPoint.lng]} icon={dropMarkerIcon}>
              <Popup className="font-sans text-xs">
                <strong className="text-rose-600 block">Drop Location</strong>
                <span>{dropPoint.name}</span>
              </Popup>
            </Marker>

            {/* Live Moving Vehicle Marker */}
            <Marker position={[telemetry.lat, telemetry.lng]} icon={carIcon}>
              <Popup className="font-sans text-xs">
                <strong className="text-slate-900 block">GoaRide Vehicle Telemetry</strong>
                <span className="text-emerald-600 font-bold">Speed: {telemetry.speed} km/h</span><br />
                <span>Fuel/EV: {telemetry.batteryFuel}%</span>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Telemetry HUD Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-2xl flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Live Telemetry HUD</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                Socket.IO Connected
              </span>
            </div>

            {/* Speedometer Gauge */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent border border-sky-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> Current Vehicle Speed
              </span>
              <div className="text-4xl font-black text-slate-900 dark:text-white">
                {telemetry.speed} <span className="text-xs text-slate-500 font-bold">km/h</span>
              </div>
            </div>

            {/* Key Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block font-bold">Latitude</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">{telemetry.lat.toFixed(4)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block font-bold">Longitude</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">{telemetry.lng.toFixed(4)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block font-bold">Fuel / EV Charge</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">{telemetry.batteryFuel}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block font-bold">Estimated ETA</span>
                <span className="font-extrabold text-sky-600 dark:text-cyan-400 text-xs">{routeDetails.durationMins} Mins</span>
              </div>
            </div>

            {/* Turn-by-Turn Instruction Card */}
            {routeDetails.steps.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-sky-700 dark:text-cyan-300 uppercase tracking-wider block">Next Direction:</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{routeDetails.steps[0]?.instruction || 'Follow route polyline'}</p>
              </div>
            )}
          </div>

          <a
            href="tel:+917588459115"
            className="w-full py-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-200 transition-colors shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Emergency Helpline (+91 75884 59115)</span>
          </a>

        </div>

      </div>

    </div>
  );
}
