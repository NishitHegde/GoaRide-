import React from 'react';
import { Heart, Star, MapPin, Fuel, Gauge, Users, ArrowRight } from 'lucide-react';

export default function VehicleCard({ vehicle, isFavorite, onToggleFavorite, onBook }) {
  if (!vehicle) return null;

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group">
      
      {/* Image & Badge Overlay */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(vehicle._id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md hover:bg-white dark:hover:bg-slate-900 transition-all text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400"
          title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Type Pill */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 dark:bg-sky-950/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/10">
          {vehicle.type === 'bike' ? '🏍️ Bike' : '🚗 Car'}
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
          <span>{vehicle.location}</span>
        </div>
      </div>

      {/* Details Content */}
      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
        
        <div>
          {/* Header & Rating */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold text-sky-600 dark:text-cyan-400 uppercase tracking-wide">{vehicle.brand}</span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                {vehicle.name}
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{vehicle.rating}</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400">({vehicle.reviewCount})</span>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {vehicle.description}
          </p>

          {/* Specs Chips */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
            <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60">
              <Fuel className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{vehicle.fuelType}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60">
              <Gauge className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{vehicle.transmission}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60">
              <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{vehicle.seats}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Booking Button */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{vehicle.pricePerDay}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium"> / day</span>
          </div>

          <button
            onClick={() => onBook(vehicle)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
