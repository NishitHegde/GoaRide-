import Vehicle from '../models/Vehicle.js';

export const handleAiChat = async (req, res) => {
  try {
    const { prompt, days, budget, tripType } = req.body;
    if (!prompt && !days) {
      return res.status(400).json({ message: 'Prompt or trip parameters required' });
    }

    const text = (prompt || '').toLowerCase();
    const vehicles = await Vehicle.find({ isAvailable: true }).limit(20);

    let reply = '';
    let recommendedVehicles = [];
    let fuelEstimate = null;

    // 1. FUEL COST CALCULATOR
    if (text.includes('fuel') || text.includes('petrol') || text.includes('cost to drive') || text.includes('mileage') || text.includes('dudhsagar')) {
      reply = `⛽ **AI Goa Road Trip Fuel & Range Estimator:**\n\n` +
        `• **Calangute ➔ Dudhsagar Waterfalls (82 km)**:\n` +
        `  - Scooter (Activa 6G): ~1.8 Liters (₹190)\n` +
        `  - Thar 4x4 / Creta: ~7 Liters (₹735)\n\n` +
        `• **Panaji ➔ Palolem Beach South Goa (70 km)**:\n` +
        `  - Scooter: ~1.5 Liters (₹155)\n` +
        `  - Car / SUV: ~6 Liters (₹630)\n\n` +
        `• **Airport (Dabolim) ➔ Baga Beach (40 km)**:\n` +
        `  - Scooter: ~0.9 Liters (₹95)\n` +
        `  - Car / SUV: ~3.5 Liters (₹365)\n\n` +
        `💡 *Petrol in Goa is priced at ~₹98/liter (cheaper than neighbor states!).*`;
      fuelEstimate = { ratePerLiter: 98, avgScooterKmPerL: 45, avgCarKmPerL: 14 };
    }
    
    // 2. BUDGET TRIP PLANNER
    else if (text.includes('budget') || text.includes('cheap') || text.includes('cost') || budget) {
      reply = `💰 **AI Budget Breakdown for Goa Trip:**\n\n` +
        `• **Vehicle Rental**: ₹450/day (Activa) or ₹1,400/day (Swift)\n` +
        `• **Fuel Budget**: ~₹200/day for riding across North & South Goa\n` +
        `• **Security Deposit**: ₹1,000 (100% Refundable upon vehicle return)\n` +
        `• **Food & Shacks**: ~₹600 - ₹1,200/day per person\n\n` +
        `✨ **AI Cost-Saving Tip**: Book for 7+ days to unlock an instant 10% discount on your rental!`;
      recommendedVehicles = vehicles.filter(v => v.pricePerDay <= 1000).slice(0, 3);
    }

    // 3. EV CHARGING & ECO DRIVING
    else if (text.includes('ev') || text.includes('electric') || text.includes('nexon ev') || text.includes('charge')) {
      reply = `⚡ **Goa EV Rental & Charging Guide:**\n\n` +
        `• **Tata Nexon EV Max** (₹2,200/day) comes fully charged with **400 km range**.\n` +
        `• **Fast Chargers**: Available at Panaji Bus Stand, Mall de Goa (Porvorim), Dabolim Airport, and Margao Railway Station.\n` +
        `• **Charging Cost**: Full charge costs ~₹250 - ₹300 at commercial DC fast chargers.`;
      recommendedVehicles = vehicles.filter(v => v.fuelType === 'EV').slice(0, 2);
    }

    // 4. EMERGENCY & ROAD ASSISTANCE
    else if (text.includes('help') || text.includes('breakdown') || text.includes('puncture') || text.includes('emergency')) {
      reply = `🚨 **24/7 GoaRide Breakdown & Emergency Support:**\n\n` +
        `• **Direct Helpline**: **+91 75884 59115**\n` +
        `• **Free On-Road Services**: Free mechanic dispatch for flat tires, battery jumpstarts, or fuel delivery anywhere in Goa within 30 minutes.\n` +
        `• **GPS Live Tracking**: Enable GPS on your Live Map tab so support vehicles can locate you instantly.`;
    }

    // 5. BIKE & SCOOTER RECOMMENDATIONS
    else if (text.includes('scooter') || text.includes('activa') || text.includes('bike') || text.includes('scooty')) {
      const scooters = vehicles.filter((v) => v.category === 'Scooter' || v.type === 'bike');
      recommendedVehicles = scooters.slice(0, 3);
      reply = `🛵 **Top Recommended Bikes & Scooters for Goa:**\n\n` +
        `1. **Honda Activa 6G** (₹450/day) — Perfect for narrow beach lanes in Calangute, Baga, and Anjuna. Easy automatic drive with helmet included.\n` +
        `2. **Royal Enfield Classic 350** (₹850/day) — Iconic cruiser for coastal highway rides along Chapora and Vagator.\n` +
        `3. **Yamaha R15 V4** (₹1,000/day) — High performance sports bike for highway touring.\n\n` +
        `💡 *Tip: 2 free helmets and 24/7 roadside assistance are included with all bike rentals!*`;
    }

    // 6. CARS & SUVS
    else if (text.includes('car') || text.includes('suv') || text.includes('thar') || text.includes('family')) {
      const cars = vehicles.filter((v) => v.type === 'car');
      recommendedVehicles = cars.slice(0, 3);
      reply = `🚗 **Best Cars & SUVs for Groups & Families:**\n\n` +
        `1. **Mahindra Thar 4x4** (₹3,500/day) — The ultimate Goa open-top SUV experience for beach drives.\n` +
        `2. **Toyota Innova Crysta** (₹3,200/day) — Premium 7-seater for group family trips with captain seats.\n` +
        `3. **Hyundai Creta SX** (₹2,600/day) — Panoramic sunroof compact SUV with smooth automatic gearbox.\n` +
        `4. **Tata Nexon EV Max** (₹2,200/day) — Eco-friendly electric SUV with 400km range per charge.\n\n` +
        `💡 *Tip: Free airport pickup available at Dabolim Airport & Mopa Airport!*`;
    }

    // 7. ITINERARY
    else if (text.includes('itinerary') || text.includes('3-day') || text.includes('5-day') || text.includes('plan')) {
      reply = `🌴 **Ultimate Goa Travel Itinerary:**\n\n` +
        `📍 **Day 1: North Goa Beaches & Nightlife**\n` +
        `- Morning: Pickup your Activa/Thar at Calangute.\n` +
        `- Afternoon: Visit Fort Aguada & Sinquerim Beach.\n` +
        `- Evening: Sunset at Anjuna / Vagator Beach & dinner at Tito’s Lane, Baga.\n\n` +
        `📍 **Day 2: Culture & Heritage Drive**\n` +
        `- Morning: Ride along Panaji’s Fontainhas (Latin Quarter).\n` +
        `- Afternoon: Basilica of Bom Jesus & Se Cathedral in Old Goa.\n` +
        `- Evening: Mandovi River Sunset Cruise in Panaji.\n\n` +
        `📍 **Day 3: Waterfalls & South Goa Haven**\n` +
        `- Morning: Drive to Dudhsagar Waterfalls or Spice Plantation.\n` +
        `- Afternoon: Relax at Palolem or Colva Beach in South Goa.\n` +
        `- Evening: Return vehicle at Dabolim Airport or Calangute.`;
    }

    // DEFAULT
    else {
      reply = `🌴 **GoaRide AI Super Assistant**\n\n` +
        `I can help you plan your entire Goa trip! Try asking:\n` +
        `• "Calculate fuel cost from Calangute to Dudhsagar Waterfalls"\n` +
        `• "Recommend cheap bikes under ₹500/day"\n` +
        `• "EV charging stations in Goa"\n` +
        `• "Emergency roadside assistance hotline"`;
      recommendedVehicles = vehicles.slice(0, 3);
    }

    res.json({
      reply,
      recommendedVehicles,
      fuelEstimate,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
