import Vehicle from '../models/Vehicle.js';

// Helper function to call Google Gemini API with fallback models
async function callGoogleGeminiApi(apiKey, userPrompt) {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are GoaRide AI Neural Assistant, an expert travel guide & rental concierge. Provide a direct, accurate, enthusiastic, and comprehensive answer specifically addressing the user's question. Use clear formatting, bullet points, and emojis where appropriate.\n\nUser Question: ${userPrompt}`
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (e) {
      console.error(`Gemini API error on ${model}:`, e.message);
    }
  }
  return null;
}

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

    // 1. PRIORITIZE GOOGLE GEMINI API FIRST TO ANSWER THE USER'S EXACT QUESTION
    if (apiKey && rawPrompt.length > 1) {
      const geminiReply = await callGoogleGeminiApi(apiKey, rawPrompt);
      if (geminiReply) {
        reply = geminiReply;
        if (text.includes('bike') || text.includes('scooter') || text.includes('activa') || text.includes('enfield')) {
          recommendedVehicles = vehicles.filter(v => v.type === 'bike').slice(0, 3);
        } else if (text.includes('car') || text.includes('suv') || text.includes('thar') || text.includes('creta')) {
          recommendedVehicles = vehicles.filter(v => v.type === 'car').slice(0, 3);
        }
      }
    }

    // 2. SPECIFIC ACTION: FUEL COST CALCULATOR (Fallback if Gemini API not used)
    if (!reply && (text.includes('fuel') || text.includes('petrol') || text.includes('cost to drive') || text.includes('mileage') || (text.includes('dudhsagar') && text.includes('cost')))) {
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

    // 3. DEEP CONTEXTUAL KNOWLEDGE ENGINE (Comprehensive answer fallback for any user prompt)
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

      // 5. SECRET & HIDDEN GEMS OF GOA
      else if (text.includes('hidden') || text.includes('secret') || text.includes('offbeat') || text.includes('waterfall') || text.includes('kakolem') || text.includes('netravali') || text.includes('chorla')) {
        reply = `💎 **Secret & Offbeat Hidden Gems of Goa:**\n\n` +
          `• **Kakolem Beach (Tiger Beach)**: A secluded private cove surrounded by lush green cliffs and a small freshwater stream emptying into the sea.\n` +
          `• **Netravali Bubble Lake & Wildlife Sanctuary**: A serene temple tank in South Goa where bubbles continuously rise naturally from the lake bed.\n` +
          `• **Salaulim Dam & Spillway**: A massive engineering marvel with a unique semi-circular 'duckbill' spillway (best visited July–Oct).\n` +
          `• **Harvalem Waterfalls & Caves**: Ancient 6th-century rock-cut Buddhist caves near Sanquelim.\n` +
          `• **Chorla Ghats Viewpoints**: Misty Western Ghats mountain pass on the Goa-Karnataka border with panoramic jungle canopy views.`;
      }

      // 6. CASINO & FLOATING GAMING GUIDE
      else if (text.includes('casino') || text.includes('gambling') || text.includes('deltin') || text.includes('big daddy') || text.includes('poker') || text.includes('mandovi')) {
        reply = `🎰 **Goa Floating Casino & Gaming Guide:**\n\n` +
          `• **Deltin Royale**: Asia’s largest offshore gaming casino ship anchored on Mandovi River, Panaji. Features multi-level gaming floors, live performances & gourmet buffets.\n` +
          `• **Big Daddy Casino**: Luxury offshore vessel with roulette, blackjack, andar bahar, and VIP lounge gaming.\n` +
          `• **Majestic Pride & Casino Pride**: Popular floating casinos offering family entertainment, live dance shows & gaming packages.\n\n` +
          `💡 *Dress Code: Smart casuals required (no shorts/flip-flops for male guests). Entry packages usually include chips, food & drinks.*`;
      }

      // 7. MARKETS, SHOPPING & SOUVENIRS
      else if (text.includes('market') || text.includes('shopping') || text.includes('flea') || text.includes('cashew') || text.includes('feni') || text.includes('souvenir') || text.includes('spices')) {
        reply = `🛍️ **Goa Flea Markets & Shopping Guide:**\n\n` +
          `• **Anjuna Wednesday Flea Market**: Legendary beachside open market for bohemian clothes, handmade jewelry & souvenirs.\n` +
          `• **Arpora Saturday Night Market**: Live music, global food stalls, designer clothes & vibrant neon night vibes.\n` +
          `• **Mapusa Friday Produce Market**: Local market for authentic Goan spices, homemade sausages (Chorizo), dried fish & fresh fruits.\n` +
          `• **Goan Souvenir Must-Buys**: Premium Goan Roasted Cashews, authentic Feni (Cashew/Coconut spirit), and hand-painted Portuguese Azulejo tiles.`;
      }

      // 8. CABS VS SELF-DRIVE RENTAL COMPARISON
      else if (text.includes('cab') || text.includes('taxi') || text.includes('bus') || text.includes('transport') || text.includes('uber') || text.includes('ola') || text.includes('auto')) {
        reply = `🚖 **Goa Transport Comparison — Why Renting Self-Drive Wins:**\n\n` +
          `• **Uber / Ola Availability**: Uber & Ola do **NOT** operate in Goa.\n` +
          `• **Local Taxis**: Local cabs charge ~₹1,500 – ₹2,500 for a single one-way airport transfer.\n` +
          `• **GoaRide Self-Drive Scooter**: Just **₹450/day** for total freedom to explore all beaches, forts, and hidden cafes at your own pace!\n` +
          `• **GoaRide Self-Drive Car**: Just **₹1,400/day** for AC comfort for group & family trips.\n\n` +
          `💡 *All GoaRide vehicles come with 24/7 roadside assistance, 2 free helmets, and commercial yellow-plate insurance!*`;
      }

      // 9. SPICE PLANTATIONS & HERITAGE
      else if (text.includes('spice') || text.includes('farm') || text.includes('heritage') || text.includes('fontainhas') || text.includes('church') || text.includes('cathedral')) {
        reply = `🌿 **Spice Plantations & Cultural Heritage:**\n\n` +
          `• **Sahakari & Tropical Spice Plantations (Ponda)**: Guided walks through cardamom, vanilla, and pepper plantations, elephant baths & traditional Goan buffet served on banana leaves.\n` +
          `• **Fontainhas (Latin Quarter, Panaji)**: Brightly painted 19th-century Portuguese houses, narrow cobblestone alleys & cozy art cafes.\n` +
          `• **UNESCO Heritage Churches (Old Goa)**: Basilica of Bom Jesus (relics of St. Francis Xavier) and Se Cathedral (largest church in Asia).`;
      }

      // 10. FESTIVALS & CELEBRATIONS
      else if (text.includes('festival') || text.includes('carnival') || text.includes('shigmo') || text.includes('sunburn') || text.includes('sao joao') || text.includes('christmas')) {
        reply = `🎉 **Goa Festivals & Cultural Celebrations:**\n\n` +
          `• **Goa Carnival (Feb)**: 4-day colorful street parade led by King Momo with music, floats & street dances.\n` +
          `• **Shigmo Festival (March)**: Traditional Goan Hindu spring festival with grand mythological float parades.\n` +
          `• **Sao Joao (June 24)**: Unique monsoon festival where locals jump into wells wearing colorful flower crowns (Kopel).\n` +
          `• **Sunburn EDM Festival & New Year (Dec)**: World-famous electronic music festival & beach fireworks!`;
      }

      // 11. SCOOTERS & BIKES
      else if (text.includes('scooter') || text.includes('activa') || text.includes('bike') || text.includes('scooty') || text.includes('enfield')) {
        const scooters = vehicles.filter((v) => v.category === 'Scooter' || v.type === 'bike');
        recommendedVehicles = scooters.slice(0, 3);
        reply = `🛵 **Top Recommended Bikes & Scooters for Goa:**\n\n` +
          `1. **Honda Activa 6G** (₹450/day) — Perfect for narrow beach lanes in Calangute, Baga, and Anjuna.\n` +
          `2. **Royal Enfield Classic 350** (₹850/day) — Iconic cruiser for coastal highway rides along Chapora and Vagator.\n` +
          `3. **Yamaha R15 V4** (₹1,000/day) — High performance sports bike for highway touring.\n\n` +
          `💡 *Tip: 2 free helmets and 24/7 roadside assistance are included with all bike rentals!*`;
      }

      // 12. CARS & SUVS
      else if (text.includes('car') || text.includes('suv') || text.includes('thar') || text.includes('family') || text.includes('creta')) {
        const cars = vehicles.filter((v) => v.type === 'car');
        recommendedVehicles = cars.slice(0, 3);
        reply = `🚗 **Best Cars & SUVs for Groups & Families:**\n\n` +
          `1. **Mahindra Thar 4x4** (₹3,500/day) — Open-top SUV experience for Goa beach drives.\n` +
          `2. **Toyota Innova Crysta** (₹3,200/day) — Premium 7-seater for group family trips.\n` +
          `3. **Hyundai Creta SX** (₹2,600/day) — Automatic SUV with panoramic sunroof.\n\n` +
          `💡 *Tip: Free airport pickup available at Dabolim Airport & Mopa Airport!*`;
      }

      // 13. ITINERARY / TRIP PLAN
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
