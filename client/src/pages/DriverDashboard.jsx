import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { socket } from '../services/socket';
import { useToast } from '../context/ToastContext';
import { Car, Navigation, Play, Pause, CheckCircle, AlertTriangle, ShieldCheck, MapPin, Gauge, Radio, Sparkles } from 'lucide-react';

export default function DriverDashboard() {
  const { showToast } = useToast();

  const [activeTripId, setActiveTripId] = useState('demo_trip_01');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const [currentGps, setCurrentGps] = useState({
    lat: 15.5438,
    lng: 73.7554,
    speed: 45,
    heading: 90,
    batteryFuel: 92,
  });

  // Sample OSRM Route Waypoints for Calangute to Dudhsagar Waterfalls
  const sampleRoutePoints = [
    [15.5438, 73.7554],
    [15.5401, 73.7621],
    [15.5350, 73.7710],
    [15.5280, 73.7850],
    [15.5100, 73.8050],
    [15.4989, 73.8278],
    [15.4850, 73.8500],
    [15.4500, 73.9200],
    [15.4000, 73.9800],
    [15.3500, 74.1500],
    [15.3144, 74.3143],
  ];

  const intervalRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join-trip', activeTripId);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      socket.disconnect();
    };
  }, [activeTripId]);

  const toggleSimulation = () => {
    if (isSimulating) {
      clearInterval(intervalRef.current);
      setIsSimulating(false);
      showToast('GPS Telemetry Stream Paused', 'info');
    } else {
      setIsSimulating(true);
      showToast('🚀 Live Driver GPS Telemetry Broadcasting Started!', 'success');

      let idx = currentStepIdx;
      intervalRef.current = setInterval(() => {
        if (idx >= sampleRoutePoints.length - 1) {
          idx = 0;
        } else {
          idx += 1;
        }

        setCurrentStepIdx(idx);
        const point = sampleRoutePoints[idx];
        const speedVal = Math.floor(35 + Math.random() * 25);
        const fuelVal = Math.max(10, 95 - idx * 2);

        const newGps = {
          lat: point[0],
          lng: point[1],
          speed: speedVal,
          heading: Math.floor(Math.random() * 360),
          batteryFuel: fuelVal,
        };

        setCurrentGps(newGps);

        // Emit Socket.IO real-time telemetry update
        socket.emit('driver-location-update', {
          tripId: activeTripId,
          ...newGps,
        });
      }, 3000 / simulationSpeed);
    }
  };

  const handleTriggerSos = () => {
    socket.emit('sos-trigger', { tripId: activeTripId, message: 'Driver Emergency Alert!' });
    showToast('🚨 Driver SOS Alert Broadcasted!', 'error');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Driver Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-extrabold shadow-sm">
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Driver Telemetry Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Driver Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Broadcast live vehicle movement telemetry every 3 seconds via Socket.IO</p>
        </div>

        <button
          onClick={handleTriggerSos}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Driver SOS Alert</span>
        </button>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Simulation Controls */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xl lg:col-span-2">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Trip Telemetry Broadcaster</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Simulates driver route traversal across Goa highways</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Speed Multiplier:</span>
              {[1, 2, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimulationSpeed(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    simulationSpeed === s
                      ? 'bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-900 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={toggleSimulation}
              className={`flex-1 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                isSimulating
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-emerald-600/30 hover:scale-105'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-5 h-5" /> Pause GPS Broadcaster
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> Start Live Route GPS Simulation →
                </>
              )}
            </button>
          </div>

          {/* Real-time Telemetry Monitor Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Latitude</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{currentGps.lat.toFixed(4)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Longitude</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{currentGps.lng.toFixed(4)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Speed</span>
              <span className="text-lg font-black text-sky-600 dark:text-cyan-400">{currentGps.speed} km/h</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fuel / EV</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{currentGps.batteryFuel}%</span>
            </div>
          </div>

        </div>

        {/* Driver Assigned Vehicle Box */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Assigned Fleet Vehicle</span>
            <div className="flex items-center gap-3">
              <img
                src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Mahindra_Thar.jpg?width=1200"
                alt="Assigned Vehicle"
                className="w-16 h-16 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Mahindra Thar 4x4</h3>
                <span className="text-xs font-bold text-sky-600 dark:text-cyan-400">GA-03-X-9988</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Route:</span>
                <span className="font-bold text-slate-900 dark:text-white">Calangute ➔ Dudhsagar</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Passenger:</span>
                <span className="font-bold text-slate-900 dark:text-white">Rahul Sharma</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Broadcast Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {isSimulating ? 'Streaming Active 🟢' : 'Idle ⏸️'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>24/7 Driver Safety Monitoring Connected</span>
          </div>
        </div>

      </div>

    </div>
  );
}
