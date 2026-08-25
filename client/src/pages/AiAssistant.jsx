import React, { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import BookingModal from '../components/BookingModal';
import { Bot, Send, Sparkles, MapPin, Compass, Calendar, User, Copy, Check, ArrowRight, Fuel, Calculator, ShieldCheck, Zap, PhoneCall, Cpu, Flame, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AiAssistant() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'fuel' | 'budget'

  // Fleet Vehicles state for Fuel Matrix
  const [fleetVehicles, setFleetVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Chat State
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your GoaRide AI Travel & Rental Concierge. Ask me anything about vehicle choices, fuel costs, beach itineraries, EV charging, or emergency breakdown help!',
      recommendedVehicles: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Fuel Estimator Interactive Tool State
  const [fuelRoute, setFuelRoute] = useState('dudhsagar');
  const [customDistance, setCustomDistance] = useState(82);

  // Budget Planner State
  const [budgetDays, setBudgetDays] = useState(3);
  const [maxBudget, setMaxBudget] = useState(3000);

  const quickChips = [
    '⛽ Calculate fuel cost for Dudhsagar trip',
    '🛵 Best scooter for North Goa beaches',
    '🚗 Recommend a 7-seater car for family',
    '⚡ EV Charging stations in Goa',
    '🚨 Emergency breakdown assistance hotline',
  ];

  const routesMap = {
    dudhsagar: { name: 'Calangute ➔ Dudhsagar Waterfalls', km: 82 },
    palolem: { name: 'Panaji ➔ Palolem Beach (South Goa)', km: 70 },
    baga: { name: 'Dabolim Airport ➔ Baga Beach', km: 40 },
    custom: { name: 'Custom Driving Distance', km: customDistance },
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data } = await API.get('/vehicles');
      const list = Array.isArray(data) ? data : (data?.value || []);
      setFleetVehicles(list);
      if (list.length > 0) {
        setSelectedVehicleId(list[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Dynamic Fuel & Mileage calculation for ALL vehicles in fleet
  const calculateVehicleFuelDetails = () => {
    const selectedRoute = routesMap[fuelRoute];
    const km = fuelRoute === 'custom' ? Number(customDistance) || 1 : selectedRoute.km;

    const targetVehicle = fleetVehicles.find((v) => v._id === selectedVehicleId) || fleetVehicles[0];

    let mileage = 45; // Default scooter mileage
    let unit = 'Liters';
    let unitPrice = 103; // Petrol ₹103/L in Goa
    let fuelLabel = 'Petrol Price: ₹103/L';

    if (targetVehicle) {
      const vName = targetVehicle.name.toLowerCase();
      const vType = targetVehicle.type?.toLowerCase();
      const vFuel = (targetVehicle.fuelType || '').toLowerCase();

      if (vName.includes('ev') || vName.includes('chetak') || vName.includes('nexon ev')) {
        mileage = 7; // km per kWh
        unit = 'kWh';
        unitPrice = 12; // EV Charging ₹12/kWh
        fuelLabel = 'EV Rate: ₹12/kWh';
      } else if (vFuel === 'diesel' || vName.includes('diesel') || vName.includes('innova') || vName.includes('fortuner')) {
        mileage = 11;
        unit = 'Liters';
        unitPrice = 96; // Diesel ₹96/L in Goa
        fuelLabel = 'Diesel Price: ₹96/L';
      } else {
        unit = 'Liters';
        unitPrice = 103; // Petrol ₹103/L in Goa
        fuelLabel = 'Petrol Price: ₹103/L';

        if (vType === 'bike') {
          if (vName.includes('classic') || vName.includes('enfield') || vName.includes('himalayan')) {
            mileage = 35;
          } else if (vName.includes('r15') || vName.includes('duke')) {
            mileage = 38;
          } else {
            mileage = 45; // Activa, Dio, Jupiter
          }
        } else if (vType === 'car') {
          if (vName.includes('thar')) {
            mileage = 9;
          } else if (vName.includes('creta') || vName.includes('venue') || vName.includes('brezza')) {
            mileage = 13;
          } else {
            mileage = 16; // Swift, Baleno, i20
          }
        }
      }
    }

    const consumption = (km / mileage).toFixed(1);
    const cost = Math.round(consumption * unitPrice);

    return { km, consumption, cost, mileage, unit, unitPrice, fuelLabel, targetVehicle };
  };

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await API.post('/ai/chat', { prompt: textToSend });
      const botMsg = {
        sender: 'bot',
        text: data.reply,
        recommendedVehicles: data.recommendedVehicles || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'For exploring North Goa (Calangute, Baga, Anjuna, Vagator), Honda Activa 6G or RE Classic 350 are top choices! For family group trips across South Goa beaches, Mahindra Thar 4x4 or Innova Crysta provide maximum comfort.',
          recommendedVehicles: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const fuelCalc = calculateVehicleFuelDetails();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-sky-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Futuristic Holographic Header */}
      <div className="text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/15 via-cyan-500/15 to-sky-500/15 border border-teal-400/30 dark:border-cyan-400/30 text-teal-800 dark:text-cyan-300 text-xs font-extrabold shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Cpu className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
          <span>GoaRide Neural AI Assistant v2.0</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Intelligent <span className="text-gradient">Travel Concierge</span>
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed">
          Ask questions, calculate route fuel expenses for all fleet vehicles, and generate custom trip itineraries.
        </p>
      </div>

      {/* Visual Mode Navigation Bar */}
      <div className="flex justify-center p-1.5 rounded-2xl glass-panel max-w-xl mx-auto border border-slate-200/80 dark:border-slate-800 shadow-lg text-xs font-bold gap-1">
        <button
          onClick={() => setActiveMode('chat')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMode === 'chat'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Neural Chat</span>
        </button>

        <button
          onClick={() => setActiveMode('fuel')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMode === 'fuel'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>Fuel Matrix</span>
        </button>

        <button
          onClick={() => setActiveMode('budget')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMode === 'budget'
              ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Budget Meter</span>
        </button>
      </div>

      {/* MODE 1: NEURAL CHAT */}
      {activeMode === 'chat' && (
        <div className="space-y-4">
          
          {/* Quick Action Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm hover:scale-105"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Luxury Glass Chat Console Container */}
          <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col h-[520px] shadow-2xl relative">
            
            {/* Console Header Bar */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#070e1b]/70 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">GoaRide AI Neural Concierge</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry Stream Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px]">Real-Time Fleet API</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow bg-slate-50/40 dark:bg-[#050a14]/50 backdrop-blur-sm">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex items-start gap-3.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Avatar Icon */}
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-tr from-sky-600 to-blue-700 text-white'
                      : 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white'
                  }`}>
                    {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`relative max-w-lg p-4 rounded-3xl text-xs leading-relaxed space-y-3 group shadow-md ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 text-white font-medium rounded-tr-none'
                      : 'bg-white dark:bg-[#0d1726] text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-tl-none font-medium'
                  }`}>
                    
                    {/* Timestamp & Copy header */}
                    <div className="flex items-center justify-between text-[10px] opacity-75 font-semibold pb-1 border-b border-black/5 dark:border-white/5">
                      <span>{m.sender === 'user' ? 'You' : 'GoaRide AI'}</span>
                      <span>{m.timestamp}</span>
                    </div>

                    {/* Content Text */}
                    <div className="whitespace-pre-line leading-relaxed text-slate-800 dark:text-slate-200">{m.text}</div>

                    {/* Embedded Vehicle Recommendation Cards */}
                    {m.recommendedVehicles && m.recommendedVehicles.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-cyan-400 block">
                          🏎️ Recommended Fleet Options:
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {m.recommendedVehicles.map((v) => (
                            <div key={v._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm hover:border-sky-500 transition-colors">
                              <div className="flex items-center gap-3">
                                <img src={v.image} alt={v.name} className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
                                <div>
                                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block">{v.name}</span>
                                  <span className="text-[11px] text-sky-600 dark:text-cyan-400 font-bold">₹{v.pricePerDay} / day • {v.location}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedVehicle(v)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-[11px] shadow-md flex items-center gap-1 hover:scale-105 transition-transform"
                              >
                                <span>Book</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.sender === 'bot' && (
                      <button
                        onClick={() => copyToClipboard(m.text, idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                        title="Copy text"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex items-center gap-3 text-xs text-teal-600 dark:text-teal-400 font-bold p-3 bg-white dark:bg-[#0d1726] rounded-2xl border border-slate-200 dark:border-slate-800 w-fit shadow-sm">
                  <Bot className="w-4 h-4 animate-spin text-teal-500" />
                  <span>AI Neural Engine is processing your query...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#070e1b]/90 backdrop-blur-md flex gap-3">
              <input
                type="text"
                placeholder="Ask AI anything about Goa rentals, routes, fuel, or beach plans..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 font-medium shadow-inner transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 hover:from-teal-500 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-teal-600/25 disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* MODE 2: ALL-VEHICLE DYNAMIC FUEL MATRIX */}
      {activeMode === 'fuel' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-2xl text-slate-900 dark:text-white relative">
          <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Goa Route Fuel Matrix</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Select any vehicle from your fleet to calculate route distance, exact mileage, consumption, and fuel cost telemetry.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-bold">
            <div>
              <label className="block mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Select Route:</label>
              <select
                value={fuelRoute}
                onChange={(e) => setFuelRoute(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none shadow-sm font-bold"
              >
                <option value="dudhsagar">Calangute ➔ Dudhsagar Waterfalls (82 km)</option>
                <option value="palolem">Panaji ➔ Palolem Beach (70 km)</option>
                <option value="baga">Dabolim Airport ➔ Baga Beach (40 km)</option>
                <option value="custom">Custom Distance Drive</option>
              </select>
            </div>

            {fuelRoute === 'custom' && (
              <div>
                <label className="block mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Enter Distance (km):</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={customDistance}
                  onChange={(e) => setCustomDistance(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none shadow-sm font-bold"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Select Fleet Vehicle:</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none shadow-sm font-bold"
              >
                {fleetVehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.type === 'bike' ? '🏍️' : '🚗'} {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Telemetry Metric Cards */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Fuel Telemetry Matrix Result
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                {fuelCalc.fuelLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Distance</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{fuelCalc.km} <span className="text-sm">km</span></span>
              </div>

              <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Consumption</span>
                <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{fuelCalc.consumption} <span className="text-sm">{fuelCalc.unit}</span></span>
              </div>

              <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Est. Trip Expense</span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{fuelCalc.cost}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODE 3: BUDGET METER */}
      {activeMode === 'budget' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-2xl text-slate-900 dark:text-white">
          <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-3.5 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-cyan-400 border border-sky-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black">AI Trip Budget Calculator</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Adjust trip duration and budget limits to view exact rental costs and savings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-bold">
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-slate-700 dark:text-slate-300">Trip Duration:</label>
                <span className="text-sky-600 dark:text-cyan-400 font-black text-sm">{budgetDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={budgetDays}
                onChange={(e) => setBudgetDays(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 Day</span>
                <span>7 Days (10% Discount)</span>
                <span>14 Days</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-slate-700 dark:text-slate-300">Max Budget Target:</label>
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">₹{maxBudget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>₹1,000</span>
                <span>₹12,000</span>
                <span>₹25,000</span>
              </div>
            </div>
          </div>

          {/* Budget Meter Result */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
            <h3 className="font-extrabold text-sm text-sky-600 dark:text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Recommended Vehicle Budget for {budgetDays} Days:
            </h3>
            
            <div className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Suggested Scooter Rental ({budgetDays} days @ ₹450/day):</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{budgetDays * 450}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Fuel Allowance:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{budgetDays * 180}</span>
              </div>
              <div className="flex justify-between">
                <span>Refundable Security Deposit:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">₹1,000</span>
              </div>
              {budgetDays >= 7 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Weekly Rental Savings (10% Off):</span>
                  <span>-₹{Math.round(budgetDays * 450 * 0.1)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between text-sm font-bold">
              <span>Estimated Total Payable Amount:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">
                ₹{Math.round(budgetDays * 450 * (budgetDays >= 7 ? 0.9 : 1) + budgetDays * 180)}
              </span>
            </div>
          </div>

        </div>
      )}

      {selectedVehicle && (
        <BookingModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}

    </div>
  );
}
