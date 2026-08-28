import React from 'react';
import { Heart, Star, MapPin, Fuel, Gauge, Users, ArrowRight } from 'lucide-react';

export default function VehicleCard({ vehicle, isFavorite, onToggleFavorite, onBook }) {
  if (!vehicle) return null;

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group">
      
      {/* Image & Badge Overlay */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-900 group">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = vehicle.type === 'bike' 
              ? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
              : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800';
          }}
        />

        {/* Dark Gradient Backdrop for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(vehicle._id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/70 backdrop-blur-md shadow-md hover:bg-slate-900 transition-all text-slate-200 hover:text-rose-400 z-10"
          title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Type Pill */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 text-[11px] font-black uppercase tracking-wider border border-amber-500/40 z-10">
          {vehicle.type === 'bike' ? '🏍️ Bike' : '🚗 Car'}
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-100 text-xs font-bold flex items-center gap-1 shadow-sm border border-slate-700/50 z-10">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{vehicle.location}</span>
        </div>
      </div>

      {/* Details Content */}
      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
        
        <div>
          {/* Header & Rating */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-wide">{vehicle.brand}</span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors leading-snug">
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
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">₹{vehicle.pricePerDay}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium"> / day</span>
          </div>

          <button
            onClick={() => onBook(vehicle)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>

      </div>

    </div>
  );
}
