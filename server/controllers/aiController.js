import Vehicle from '../models/Vehicle.js';

export const handleAiChat = async (req, res) => {
  try {
    const { prompt, days, budget, tripType } = req.body;
    if (!prompt && !days) {
      return res.status(400).json({ message: 'Prompt or trip parameters required' });
    }

    const rawPrompt = (prompt || '').trim();
    const text = rawPrompt.toLowerCase();
    const vehicles = await Vehicle.find({ isAvailable: true }).limit(20);

    let reply = '';
    let recommendedVehicles = [];
    let fuelEstimate = null;

    // Check for Google Gemini API key in environment variables
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 1. SPECIFIC ACTION: FUEL COST CALCULATOR
    if (text.includes('fuel') || text.includes('petrol') || text.includes('cost to drive') || text.includes('mileage') || (text.includes('dudhsagar') && text.includes('cost'))) {
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
        `💡 *Petrol in Goa is currently priced at ~₹98/liter.*`;
      fuelEstimate = { ratePerLiter: 98, avgScooterKmPerL: 45, avgCarKmPerL: 14 };
    }

    // 2. SPECIFIC ACTION: EMERGENCY / BREAKDOWN
    else if (text.includes('breakdown') || text.includes('puncture') || text.includes('emergency') || text.includes('hotline')) {
      reply = `🚨 **24/7 GoaRide Breakdown & Emergency Support:**\n\n` +
        `• **Direct Helpline**: **+91 75884 59115**\n` +
        `• **Free On-Road Services**: Instant mechanic dispatch for flat tires, battery jumpstarts, or towing anywhere in Goa.\n` +
        `• **Live Map Assistance**: Enable GPS on your Live Map tab so roadside support vehicles reach you within 20-30 minutes.`;
    }

    // 3. QUERY GOOGLE GEMINI API FIRST (IF API KEY PRESENT) FOR LIVE REAL-TIME ANSWER TO ANY USER QUESTION
    else if (apiKey && rawPrompt.length > 2) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const systemInstruction = "You are GoaRide AI Neural Assistant, an expert Goa travel guide & rental concierge. Provide helpful, accurate, enthusiastic answers about Goa places, food, beaches, routes, weather, rental advice, or any general question asked by the user. Use clear bullet points and emojis.";
        
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemInstruction}\nUser Question: ${rawPrompt}` }]
            }]
          })
        });

        if (response.ok) {
          const geminiData = await response.json();
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            reply = generatedText;
            if (text.includes('bike') || text.includes('scooter')) {
              recommendedVehicles = vehicles.filter(v => v.type === 'bike').slice(0, 3);
            } else if (text.includes('car') || text.includes('suv')) {
              recommendedVehicles = vehicles.filter(v => v.type === 'car').slice(0, 3);
            }
          }
        }
      } catch (err) {
        console.error('Google Gemini API query error:', err.message);
      }
    }

    // 4. DEEP CONTEXTUAL KNOWLEDGE ENGINE (Comprehensive answer fallback for any user prompt)
    if (!reply) {
      // FOOD / RESTAURANTS / NIGHTLIFE
      if (text.includes('food') || text.includes('restaurant') || text.includes('eat') || text.includes('nightlife') || text.includes('tito') || text.includes('seafood') || text.includes('club') || text.includes('pub') || text.includes('drink')) {
        reply = `🍽️ **Top Goa Food & Nightlife Recommendations:**\n\n` +
          `• **Authentic Goan Seafood & Thali**:\n` +
          `  - *Panaji*: Ritz Classic (Famous Goan Fish Thali) & Viva Panjim (Latin Quarter traditional Goan vindaloo).\n` +
          `  - *South Goa*: Martin's Corner (Betalbatim) & Fisherman's Wharf (Cavelossim).\n\n` +
          `• **Iconic Beach Shacks & Sunset Dining**:\n` +
          `  - *Anjuna / Vagator*: Thalassa (Greek sunset views), Antares & Titlie.\n` +
          `  - *Calangute / Baga*: Souza Lobo & Britto’s at Baga Beach.\n\n` +
          `• **Legendary Nightlife & Party Hubs**:\n` +
          `  - Tito’s Lane (Baga Beach), Cafe Mambo, Hammerzz Nightclub, and Silent Noise Club (Palolem).`;
      }
      
      // BEACHES / SIGHTSEEING / WATERSPORTS
      else if (text.includes('beach') || text.includes('place') || text.includes('visit') || text.includes('water sport') || text.includes('fort') || text.includes('scuba') || text.includes('see') || text.includes('tourist')) {
        reply = `🌴 **Best Goa Beaches & Sightseeing Destinations:**\n\n` +
          `• **Action & Watersports Beaches**:\n` +
          `  - *Calangute & Baga Beach*: Parasailing, jet skis, banana rides & bumper boats.\n` +
          `  - *Grande Island*: Scuba diving & dolphin sighting tours.\n\n` +
          `• **Scenic Forts & Sunset Views**:\n` +
          `  - *Chapora Fort*: Iconic 'Dil Chahta Hai' sunset point over Vagator Beach.\n` +
          `  - *Fort Aguada & Lighthouse*: 17th-century Portuguese fortress overlooking the Arabian Sea.\n` +
          `  - *Cabo de Rama Fort*: Dramatic cliffside views in South Goa.\n\n` +
          `• **Peaceful & Scenic Beaches**:\n` +
          `  - *Morjim & Ashwem*: Clean white sand, turtle nesting site & quiet beach lounges.\n` +
          `  - *Palolem & Agonda (South Goa)*: Crescent bay with kayaking & beach huts.`;
      }

      // WEATHER / SEASONS / BEST TIME
      else if (text.includes('weather') || text.includes('time to visit') || text.includes('monsoon') || text.includes('rain') || text.includes('season') || text.includes('month') || text.includes('temp') || text.includes('climate')) {
        reply = `☀️ **Goa Weather & Travel Seasons Guide:**\n\n` +
          `• **Peak Season (Nov – Feb)**: 22°C to 30°C. Perfect sunny beach weather, water sports open, vibrant nightlife & Sunburn festival.\n` +
          `• **Monsoon Season (June – Sept)**: Lush green landscapes, roaring Dudhsagar waterfalls, romantic drives & discounted vehicle rentals.\n` +
          `• **Summer Season (March – May)**: Warm coastal days (32°C). Great for budget travel, beach sunsets & evening cruises.`;
      }

      // RENTAL LAWS / DOCUMENTS / HELMET / POLICE
      else if (text.includes('document') || text.includes('license') || text.includes('dl') || text.includes('helmet') || text.includes('police') || text.includes('rule') || text.includes('age') || text.includes('law') || text.includes('fine')) {
        reply = `📋 **Goa Vehicle Rental Rules & Legal Guidelines:**\n\n` +
          `• **Mandatory Documents**: Valid Indian Driving License (DL) or International Driving Permit (IDP) + Aadhaar Card / Passport.\n` +
          `• **Helmet Law**: Helmets are **mandatory for both rider and pillion passenger** in Goa. Goa Traffic Police strictly fine non-compliance (~₹1,000).\n` +
          `• **Yellow Plate Registration**: All self-drive rental vehicles in Goa must have commercial yellow-on-black registration plates. All GoaRide fleet vehicles are 100% legally registered & insured.\n` +
          `• **Speed Limits**: Highway speed limit for 2-wheelers is 50 km/h and 70 km/h for cars.`;
      }

      // SCOOTERS & BIKES
      else if (text.includes('scooter') || text.includes('activa') || text.includes('bike') || text.includes('scooty') || text.includes('enfield')) {
        const scooters = vehicles.filter((v) => v.category === 'Scooter' || v.type === 'bike');
        recommendedVehicles = scooters.slice(0, 3);
        reply = `🛵 **Top Recommended Bikes & Scooters for Goa:**\n\n` +
          `1. **Honda Activa 6G** (₹450/day) — Perfect for narrow beach lanes in Calangute, Baga, and Anjuna.\n` +
          `2. **Royal Enfield Classic 350** (₹850/day) — Iconic cruiser for coastal highway rides along Chapora and Vagator.\n` +
          `3. **Yamaha R15 V4** (₹1,000/day) — High performance sports bike for highway touring.\n\n` +
          `💡 *Tip: 2 free helmets and 24/7 roadside assistance are included with all bike rentals!*`;
      }

      // CARS & SUVS
      else if (text.includes('car') || text.includes('suv') || text.includes('thar') || text.includes('family') || text.includes('creta')) {
        const cars = vehicles.filter((v) => v.type === 'car');
        recommendedVehicles = cars.slice(0, 3);
        reply = `🚗 **Best Cars & SUVs for Groups & Families:**\n\n` +
          `1. **Mahindra Thar 4x4** (₹3,500/day) — Open-top SUV experience for Goa beach drives.\n` +
          `2. **Toyota Innova Crysta** (₹3,200/day) — Premium 7-seater for group family trips.\n` +
          `3. **Hyundai Creta SX** (₹2,600/day) — Automatic SUV with panoramic sunroof.\n\n` +
          `💡 *Tip: Free airport pickup available at Dabolim Airport & Mopa Airport!*`;
      }

      // ITINERARY / TRIP PLAN
      else if (text.includes('itinerary') || text.includes('3-day') || text.includes('5-day') || text.includes('plan') || text.includes('schedule')) {
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

      // GENERAL / ANY OTHER USER QUESTION
      else {
        reply = `🤖 **GoaRide AI Neural Travel Intelligence**\n\n` +
          `Regarding **"${rawPrompt}"**:\n\n` +
          `• **Goa Travel Insight**: Goa is best explored on 2-wheelers or open-top vehicles! North Goa offers energetic beaches (Baga, Calangute, Anjuna) and vibrant nightlife, while South Goa features tranquil beaches (Palolem, Agonda) and lush heritage.\n` +
          `• **Fleet Recommendation**: We recommend selecting a scooter (like Honda Activa 6G) for easy parking near beaches or an SUV (like Thar 4x4) for group road trips.\n` +
          `• **Rental Advantage**: Every GoaRide rental includes 24/7 roadside assistance, 2 free helmets, and commercial yellow-plate insurance.\n\n` +
          `💡 *Feel free to ask me about specific beach spots, seafood restaurants, fuel estimates, or rental prices!*`;
        recommendedVehicles = vehicles.slice(0, 3);
      }
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
