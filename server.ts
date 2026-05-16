import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// DATA SPECIFICATIONS & TYPES
// ==========================================

interface Supercar {
  id: string;
  name: string;
  category: "modern-supercar" | "classic-roadster" | "track-ready";
  hp: number;
  acceleration: string;
  topSpeed: string;
  engine: string;
  gearbox: string;
  color: string;
  dayRate: number;
  hourlyRate: number;
  description: string;
  image: string;
  soundSample: string;
  frequencyHz: number;
  vibe: string;
  reviewsCount: number;
  rating: number;
}

interface DriveRoute {
  id: string;
  name: string;
  distanceKm: number;
  durationText: string;
  difficulty: "Scenic Cruise" | "Challenging Curves" | "High-Speed Closed Circuit";
  description: string;
  highlights: string[];
  basePrice: number;
  location: "Cape Town" | "Franschhoek" | "Johannesburg";
  mapPoints: string[];
}

interface BookingExperience {
  id: string;
  carId: string;
  routeId: string;
  date: string;
  timeSlot: string;
  durationHours: number;
  totalCostZar: number;
  status: "pending_verification" | "confirmed" | "completed";
  extras: string[];
  instructorRequired: boolean;
  insuranceTier: "Standard" | "Elite-Zero-Excess";
  driverLicenseNumber?: string;
  bookingTime?: string;
}

interface UserProfile {
  username: string;
  fullName: string;
  licenseVerified: boolean;
  licenseClass: string;
  walletBalanceZar: number;
  bookedExperiences: BookingExperience[];
  likedCars: string[];
}

interface ActivityLog {
  id: string;
  username: string;
  type: "booking" | "deposit" | "license_verification" | "review" | "concierge_chat";
  details: string;
  timestamp: Date;
}

interface LedgerEntry {
  id: string;
  type: "deposit" | "booking_purchase" | "concierge_refund" | "promo_credit";
  amount: number;
  balanceAfter: number;
  hash: string;
  timestamp: Date;
  details: string;
}

interface GuestReview {
  id: string;
  username: string;
  carName: string;
  routeName: string;
  rating: number;
  quote: string;
  date: string;
  location: string;
}

// ==========================================
// IN-MEMORY DATABASE STATE
// ==========================================

let userProfile: UserProfile = {
  username: "EliteDriver_ZA",
  fullName: "Adrian van der Merwe",
  licenseVerified: true,
  licenseClass: "Class EB International",
  walletBalanceZar: 25000, // Initial premium balance in ZAR
  bookedExperiences: [
    {
      id: "BKG-9901",
      carId: "ferrari-488",
      routeId: "chapmans-peak",
      date: "2026-05-24",
      timeSlot: "14:00 - 16:30",
      durationHours: 2.5,
      totalCostZar: 14500,
      status: "confirmed",
      extras: ["GoPro HD Onboard footage", "VIP Gourmet Coast Picnic"],
      instructorRequired: false,
      insuranceTier: "Elite-Zero-Excess",
      driverLicenseNumber: "GP-90182-ZA",
      bookingTime: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ],
  likedCars: ["lambo-huracan", "porsche-gt3rs"]
};

let supercars: Supercar[] = [
  {
    id: "ferrari-488",
    name: "Ferrari 488 Spider",
    category: "modern-supercar",
    hp: 670,
    acceleration: "3.0 seconds",
    topSpeed: "330 km/h",
    engine: "3.9L Twin-Turbo V8",
    gearbox: "7-Speed Dual-Clutch F1",
    color: "Rosso Corsa (Ferrari Red)",
    dayRate: 14500,
    hourlyRate: 4500,
    description: "Drop the hardtop and unleash the ferocious twin-turbocharged V8 engine. With 670 horsepower driving the rear wheels, the 488 Spider delivers pure theatrical adrenaline along coastal roads, combined with sharp Formula 1-derived aerodynamics.",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200",
    soundSample: "V8 High-Octane Twin-Turbo Scream",
    frequencyHz: 280,
    vibe: "Dramatic, Screaming, Unleashed Luxury",
    reviewsCount: 142,
    rating: 4.9,
  },
  {
    id: "lambo-huracan",
    name: "Lamborghini Huracán LP610-4",
    category: "modern-supercar",
    hp: 610,
    acceleration: "3.2 seconds",
    topSpeed: "325 km/h",
    engine: "5.2L Naturally Aspirated V10",
    gearbox: "7-Speed Dual-Clutch LDF",
    color: "Giallo Horus (Matte Yellow)",
    dayRate: 16500,
    hourlyRate: 5500,
    description: "The roar of a naturally aspirated 5.2-litre V10 engine is unmatched. Experience the relentless grip of all-wheel-drive combined with the aggressive space-age geometry of Lamborghini's masterpiece. Absolute drama on wheels.",
    image: "https://images.unsplash.com/photo-1627454820516-dc767acc493e?auto=format&fit=crop&q=80&w=1200",
    soundSample: "NA V10 Symphonic Thunder Roar",
    frequencyHz: 310,
    vibe: "Visceral, Extravagant, Mechanical Symphony",
    reviewsCount: 188,
    rating: 5.0,
  },
  {
    id: "shelby-cobra",
    name: "Shelby Cobra Roadster AC (Classics)",
    category: "classic-roadster",
    hp: 450,
    acceleration: "4.2 seconds",
    topSpeed: "260 km/h",
    engine: "7.0L Naturally Aspirated Big-Block V8",
    gearbox: "4-Speed Heavy-Duty Manual",
    color: "Guardsman Blue with White Racing Stripes",
    dayRate: 9500,
    hourlyRate: 3500,
    description: "Step back into the golden age of sports cars. No traction control, no power steering, just raw connection. The iconic rumbling of the American Cobra V8 inside a lightweight British steel-tube roadster body makes for an unmatched historic sensory driving trip.",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200",
    soundSample: "Throaty Deep American V8 Rumble",
    frequencyHz: 110,
    vibe: "Raw, Beastly, Retro Analog Mastery",
    reviewsCount: 94,
    rating: 4.8,
  },
  {
    id: "porsche-gt3rs",
    name: "Porsche 911 GT3 RS (991.2)",
    category: "track-ready",
    hp: 520,
    acceleration: "3.2 seconds",
    topSpeed: "312 km/h",
    engine: "4.0L Naturally Aspirated Flat-6",
    gearbox: "7-Speed PDK Racing Shift",
    color: "Lizard Green with Carbon Aero Trim",
    dayRate: 15500,
    hourlyRate: 5000,
    description: "A literal race car licensed for the open street. With a mathematical 9,000 RPM redline from its legendary naturally aspirated flat-6 engine, carbon fiber body paneling, and a colossal dual-element rear spoiler, it sets the absolute benchmark for handling precision.",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200",
    soundSample: "Flat-Six High-Pitch Laser Redline",
    frequencyHz: 350,
    vibe: "Surgical, Precision-Engineered, Track Aggressor",
    reviewsCount: 115,
    rating: 4.9,
  },
  {
    id: "nissan-gtr",
    name: "Nissan GT-R R35 'Godzilla'",
    category: "track-ready",
    hp: 565,
    acceleration: "2.8 seconds",
    topSpeed: "315 km/h",
    engine: "3.8L Twin-Turbocharged V6",
    gearbox: "6-Speed Dual-Clutch Transaxle",
    color: "Katsura Orange / Super Silver",
    dayRate: 8500,
    hourlyRate: 3000,
    description: "Launch control so powerful, it bends gravity. Godzilla uses a sophisticated dual-clutch transmission, active torque-vectoring AWD, and a legendary handcrafted twin-turbo V6 engine to launch from 0 to 100 in the blink of an eye. Pure mechanical math.",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
    soundSample: "Twin-Turbo Spool & Quad-Exhaust Bass",
    frequencyHz: 160,
    vibe: "High-Tech, Physics-Defying Launch Speed",
    reviewsCount: 160,
    rating: 4.7,
  }
];

let routes: DriveRoute[] = [
  {
    id: "chapmans-peak",
    name: "Chapman's Peak Drive Coastal Cruise",
    distanceKm: 45,
    durationText: "2.5 Hours Experience",
    difficulty: "Scenic Cruise",
    description: "Widely regarded as one of the most spectacularly beautiful marine drives globally. Hug 114 curves chiseled directly into sheer rock faces tower over the roaring Atlantic ocean. Chapman's Peak is the crown jewel of coastal cruising, featuring premium viewpoints and pristine sea air.",
    highlights: ["114 Majestic Cliffside S-Bends", "Hout Bay Marine Harbor Stopover", "Nordhoek Panoramic Roadside Picnic Area", "Chapman's Peak Sunset Viewpoint Profile"],
    basePrice: 2500,
    location: "Cape Town",
    mapPoints: ["M 10,80 Q 25,20 45,65 T 75,50 T 95,10"],
  },
  {
    id: "franschhoek-pass",
    name: "Franschhoek Wine Valley Panoramic Run",
    distanceKm: 110,
    durationText: "Full Day (6 Hours) Scenic Tour",
    difficulty: "Challenging Curves",
    description: "Carve your way from historic Cape Dutch architecture into the dramatic Franschhoek mountain ranges. This pass offers sweeping switchbacks, hairpin climbs, and panoramic lookouts overlooking deep vineyard-covered valleys, concluding with an ultra-exclusive custom lunch reservation.",
    highlights: ["Vignerons Valley Switchbacks", "Elite Haute Cabrière Wine Estate Stop", "Franschhoek Pass Alpine View Point", "Gourmet Michelin-Starred Bistro Lunch"],
    basePrice: 4500,
    location: "Franschhoek",
    mapPoints: ["M 15,20 C 35,90 40,10 65,85 S 85,20 95,90"],
  },
  {
    id: "killarney-raceway",
    name: "Killarney Track Day High-Speed Lap",
    distanceKm: 32,
    durationText: "3 Hours Track Mastery Session",
    difficulty: "High-Speed Closed Circuit",
    description: "The ultimate playground to push supercars to their absolute limit. No speed limits, no cross traffic. Our Killarney Track Day includes direct coaching by veteran South African racing drivers, full access to professional timing systems, and safety helmets.",
    highlights: ["3.2km FIA-Grade Formula Asphalt", "1km Supercar High-Speed Straight", "Professional 1-on-1 Instruction", "Telemetry Review and Mastery Certificate"],
    basePrice: 5500,
    location: "Cape Town",
    mapPoints: ["M 30,30 L 70,30 C 90,30 90,70 70,70 L 30,70 C 10,70 10,30 30,30 Z"],
  }
];

let activities: ActivityLog[] = [
  { id: "ACT-01", username: "devon_kemp", type: "review", details: "Reviewed Shelby Cobra Roadster [5 Stars]: 'Exhaust notes ringing off rock walls!'", timestamp: new Date(Date.now() - 3600000) },
  { id: "ACT-02", username: "melissa_pretorius", type: "booking", details: "Booked Ferrari 488 Spider for the Franschhoek Wine Route", timestamp: new Date(Date.now() - 7200000) },
  { id: "ACT-03", username: "Adrian van der Merwe", type: "license_verification", details: "Driver's license verified for high-performance track specs.", timestamp: new Date(Date.now() - 10800000) },
  { id: "ACT-04", username: "Adrian van der Merwe", type: "deposit", details: "Deposited R25,000.00 using Secured High-Value Gate.", timestamp: new Date(Date.now() - 18000000) },
];

let guestReviews: GuestReview[] = [
  {
    id: "REV-01",
    username: "devon_kemp",
    carName: "Shelby Cobra Roadster",
    routeName: "Chapman's Peak Sunset",
    rating: 5,
    quote: "Accelerating a raw, roaring V8 Shelby Cobra over Chapman's Peak while the sun sinks into the Atlantic is as close to religious as driving gets. The team is unbelievably professional. Handing over the keys was clean, and the exhaust notes ringing off the rock walls gave me goosebumps!",
    date: "2026-04-12",
    location: "Cape Town, ZA"
  },
  {
    id: "REV-02",
    username: "melissa_pretorius",
    carName: "Ferrari 488 Spider",
    routeName: "Franschhoek Valley Pass",
    rating: 5,
    quote: "Unbelievable machinery. The redline of the GT3 RS on the track is purely surgical, but driving the Ferrari 488 Spider on the Franschhoek wine road with the wind in my hair was the experience of a lifetime. Highly recommend the Drone Footage extra!",
    date: "2026-05-02",
    location: "Johannesburg, ZA"
  },
  {
    id: "REV-03",
    username: "anthony_vdw",
    carName: "Porsche 911 GT3 RS",
    routeName: "Killarney High-Speed Session",
    rating: 5,
    quote: "Absolute precision handling. My driving instructor taught me exactly how to apex the curves at Killarney, shaving 2.5 seconds off my lap times. Godzilla (Nissan G-R) launch control is crazy, but this GT3 RS sounds like a screaming spaceship at 9,000 RPM!",
    date: "2026-05-14",
    location: "London, UK"
  }
];

let walletLedger: LedgerEntry[] = [
  {
    id: "TX-1002",
    type: "booking_purchase",
    amount: 14500,
    balanceAfter: 25000,
    hash: "0x89ad92c8a...33ee",
    timestamp: new Date(Date.now() - 3600000 * 5),
    details: "Reserved Ferrari 488 Spider on Chapman's Peak"
  },
  {
    id: "TX-1001",
    type: "deposit",
    amount: 35000,
    balanceAfter: 39500,
    hash: "0xfa11082bb...aa01",
    timestamp: new Date(Date.now() - 3600000 * 6),
    details: "Credit Card Mastercard payment authorized"
  },
  {
    id: "TX-1000",
    type: "promo_credit",
    amount: 5000,
    balanceAfter: 4500,
    hash: "0x00beef1a2...99ff",
    timestamp: new Date(Date.now() - 3600000 * 12),
    details: "Supercar Club pilot invitation bonus"
  }
];

// Helper to record ledger trx
function recordLedgerTransaction(type: "deposit" | "booking_purchase" | "concierge_refund" | "promo_credit", amount: number, details: string) {
  const hashBytes = Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join("");
  const txHash = `0x${hashBytes}...7f00`;

  walletLedger.unshift({
    id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
    type,
    amount,
    balanceAfter: userProfile.walletBalanceZar,
    hash: txHash,
    timestamp: new Date(),
    details
  });
}

// Simulated active competitor simulator (VIP clients booking vehicles)
const MOCK_VIP_NAMES = [
  "greg_duplessis", "ronen_m", "taras_g", "charl_bekker", "nicola_ct", "sarah_k", "hassan_jnb", "gavin_r"
];

function triggerSimulatorActivity() {
  const vips = MOCK_VIP_NAMES;
  const driver = vips[Math.floor(Math.random() * vips.length)];
  const car = supercars[Math.floor(Math.random() * supercars.length)];
  const route = routes[Math.floor(Math.random() * routes.length)];

  const isReview = Math.random() > 0.6;

  if (isReview) {
    const ratings = [5, 5, 4, 5];
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    const quotes = [
      `Speechless! The throttle response of the ${car.name} is incredible. Absolute Dream day!`,
      `Epic adrenaline flow on ${route.name}. Totally worth every single Rand!`,
      `Splendid customer reception. Concierge Enzo prepared custom sparkling waters in the dash!`,
      `Unforgettable speed and handling coordinates, Cape Town skies were clear!`
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    guestReviews.unshift({
      id: `REV-${Math.floor(Math.random() * 800) + 100}`,
      username: driver,
      carName: car.name,
      routeName: route.name,
      rating,
      quote,
      date: new Date().toISOString().substring(0, 10),
      location: route.location + ", ZA"
    });

    if (guestReviews.length > 20) guestReviews.pop();

    activities.unshift({
      id: `ACT-${Math.floor(Math.random() * 9000) + 1000}`,
      username: driver,
      type: "review",
      details: `Left a ${rating}-star VVIP review for the ${car.name}!`,
      timestamp: new Date()
    });
  } else {
    activities.unshift({
      id: `ACT-${Math.floor(Math.random() * 9000) + 1000}`,
      username: driver,
      type: "booking",
      details: `Just placed an option hold on ${car.name} for the ${route.name}!`,
      timestamp: new Date()
    });
  }

  if (activities.length > 50) activities = activities.slice(0, 50);
}

// Clock tick
setInterval(triggerSimulatorActivity, 35000);

// ==========================================
// API REST ENDPOINTS
// ==========================================

// Global state fetch
app.get("/api/state", (req, res) => {
  res.json({
    supercars,
    routes,
    guestReviews,
    activities,
    userProfile,
    ledger: walletLedger
  });
});

// Backward compatibility or legacy support endpoint matching fallback list structures
// We will return mapped structures to prevent client page breakdowns
app.get("/api/competitions", (req, res) => {
  res.json({
    competitions: supercars.map(car => ({
      id: car.id,
      title: `🏁 DreamDrive: ${car.name}`,
      prizeName: car.name,
      prizeValue: car.dayRate,
      entryFee: car.hourlyRate,
      description: car.description,
      imageAlt: car.vibe,
      endsAt: new Date(Date.now() + 24 * 3600 * 1000),
      status: "active",
      ticketCost: car.hourlyRate,
      leaderboard: [
        { username: "devon_kemp", score: car.hp, timestamp: new Date(), isUser: false }
      ]
    })),
    user: {
      username: userProfile.username,
      balance: userProfile.walletBalanceZar,
      tickets: {},
      scoresSubmissions: {}
    }
  });
});

app.get("/api/activity", (req, res) => {
  res.json({ activities });
});

app.get("/api/past-competitions", (req, res) => {
  res.json({ pastCompetitions: [] });
});

app.get("/api/wallet/ledger", (req, res) => {
  res.json({ ledger: walletLedger });
});

// Update profile
app.post("/api/profile/update-username", (req, res) => {
  const { username, fullName, licenseClass, driverLicenseNumber } = req.body;
  
  if (username) userProfile.username = username.trim().substring(0, 18).replace(/[^a-zA-Z0-9_]/g, "");
  if (fullName) userProfile.fullName = fullName.trim();
  if (licenseClass) userProfile.licenseClass = licenseClass.trim();
  if (driverLicenseNumber) {
    userProfile.licenseVerified = true;
    // Add verification activity
    activities.unshift({
      id: `ACT-${Math.floor(Math.random() * 9000) + 1000}`,
      username: userProfile.fullName,
      type: "license_verification",
      details: "Driver License fully verified with South African Road Traffic MC.",
      timestamp: new Date()
    });
  }

  res.json({
    message: "Profile details locked in successfully!",
    userProfile
  });
});

// Deposit endpoint
app.post("/api/wallet/deposit", (req, res) => {
  const { amount } = req.body;
  const depAmount = parseFloat(amount);

  if (isNaN(depAmount) || depAmount <= 0) {
    return res.status(400).json({ error: "Invalid payment deposit amount." });
  }

  userProfile.walletBalanceZar += depAmount;
  recordLedgerTransaction("deposit", depAmount, `Supplied and loaded wallet with (+ R${depAmount.toLocaleString()})`);

  activities.unshift({
    id: `ACT-${Math.floor(Math.random() * 9000) + 1000}`,
    username: userProfile.fullName,
    type: "deposit",
    details: `Deposited R${depAmount.toLocaleString()}.00 to experience wallet.`,
    timestamp: new Date()
  });

  res.json({
    message: "Deposit successful!",
    walletBalanceZar: userProfile.walletBalanceZar,
    ledger: walletLedger
  });
});

// Calculate quote price calculator
app.post("/api/quote/calculate", (req, res) => {
  const { carId, routeId, durationHours, extras, insuranceTier, instructorRequired } = req.body;

  const car = supercars.find(c => c.id === carId);
  const route = routes.find(r => r.id === routeId);

  if (!car || !route) {
    return res.status(400).json({ error: "Invalid car or route selections." });
  }

  const hours = parseFloat(durationHours) || 3;
  let carCost = car.hourlyRate * hours;
  if (hours >= 24) {
    const days = Math.ceil(hours / 24);
    carCost = car.dayRate * days;
  }

  const routeCost = route.basePrice;
  let extrasCost = 0;
  if (extras && Array.isArray(extras)) {
    if (extras.includes("gopro")) extrasCost += 1200;
    if (extras.includes("drone")) extrasCost += 3500;
    if (extras.includes("picnic")) extrasCost += 2500;
  }

  const insuranceCost = insuranceTier === "Elite-Zero-Excess" ? 3800 : 0;
  const instructorCost = instructorRequired ? 2500 : 0;

  const totalCost = carCost + routeCost + extrasCost + insuranceCost + instructorCost;

  res.json({
    carCost,
    routeCost,
    extrasCost,
    insuranceCost,
    instructorCost,
    totalCostZar: totalCost,
    vatZar: totalCost * 0.15,
    grandTotalZar: totalCost * 1.15
  });
});

// Book interactive experience
app.post("/api/bookings/book", (req, res) => {
  const { carId, routeId, date, timeSlot, durationHours, totalCostZar, extras, instructorRequired, insuranceTier, licenseNumber } = req.body;

  const car = supercars.find(c => c.id === carId);
  const route = routes.find(r => r.id === routeId);

  if (!car || !route) {
    return res.status(400).json({ error: "Please select active vehicle & route." });
  }

  const price = parseFloat(totalCostZar) || car.dayRate;

  if (userProfile.walletBalanceZar < price) {
    return res.status(400).json({ error: "Insufficient wallet balance. Please deposit more driving credits." });
  }

  // Deduct
  userProfile.walletBalanceZar -= price;
  
  const booking: BookingExperience = {
    id: `BKG-${Math.floor(Math.random() * 9000) + 1000}`,
    carId,
    routeId,
    date,
    timeSlot,
    durationHours: parseFloat(durationHours),
    totalCostZar: price,
    status: "confirmed",
    extras: extras || [],
    instructorRequired: !!instructorRequired,
    insuranceTier: insuranceTier || "Standard",
    driverLicenseNumber: licenseNumber || "GP-88902-ZA",
    bookingTime: new Date().toISOString()
  };

  userProfile.bookedExperiences.unshift(booking);

  recordLedgerTransaction("booking_purchase", price, `Confirmed VIP run in ${car.name} on ${route.name}`);

  activities.unshift({
    id: `ACT-${Math.floor(Math.random() * 9000) + 1000}`,
    username: userProfile.fullName,
    type: "booking",
    details: `Successfully booked ${car.name} on ${route.name} route for ${date}!`,
    timestamp: new Date()
  });

  res.json({
    message: "Your elite driving experience is fully confirmed! View details in your pilot dashboard.",
    userProfile,
    ledger: walletLedger
  });
});

// Lazy load Gemini
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured or is placeholder.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Advisor for Technical / Route recommendations
app.post("/api/gemini/advisor", async (req, res) => {
  const { preferences, driverAge, trackPreference } = req.body;

  try {
    const client = getGeminiClient();
    const prompt = `You are VIP Concierge Enzo, head executive track coordinator of DreamDrive South Africa.
The user is asking for direct advisory on booking a supercar.
Driver Profile:
- Driving preferences: "${preferences}"
- Age: ${driverAge}
- Track vs scenic roads preference: "${trackPreference}"

We have standard fleet:
1. Ferrari 488 Spider (670 HP Dual-Clutch Rosso red, twin-turbo V8, fast scenic coast champ)
2. Lamborghini Huracán LP610-4 (610 HP Giallo Horus Yellow, V10, brutal power, all-wheel grip)
3. Shelby Cobra AC Roadster (450 HP manual, raw muscle classic V8, retro enthusiast dream)
4. Porsche 911 GT3 RS (520 HP green surgical track rocket, 9000RPM screaming Flat-6)
5. Nissan GT-R Godzilla (565 HP Launch-control tech AWD beast)

We have South Africa routes:
- Chapman's Peak Drive (Cape Town coastal views)
- Franschhoek Pass (Wine hills switchbacks)
- Killarney Track Day (Race tarmac straightways)

Generate a premium, luxury-styled, extremely exciting vehicle and route match. Mention ZAR rates (between R8,500 and R16,500 per day). Keep the structure very professional and clean. Output should be under 140 words and sound incredibly sophisticated, ending with an elite sign-off!`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ advice: response.text?.trim() });
  } catch (err) {
    console.warn("AI advisor fallback triggered:", err);
    res.json({
      advice: `💎 **CONCIERGE EXECUTIVE FEEDBACK** 💎\n\nBased on your absolute appreciation of sensory physics and sweeping corners, we recommend commissioning the **Lamborghini Huracán LP610-4** on our iconic **Chapman's Peak coastal pass** (R16,500/day). The screaming 5.2L naturally aspirated V10 echoing off cliff walls is a life-altering event. Should you desire a high-intensity circuit run, the **Porsche 911 GT3 RS** at **Killarney Track Day** awaits. \n\nLet me prepare your complimentary VIP logistics package.\n\n*Warm regards,*\n**Enzo — Executive Pilot Liaison**`
    });
  }
});

// Legacy support operator
app.post("/api/help/support", async (req, res) => {
  const { query, category } = req.body;

  try {
    const client = getGeminiClient();
    const prompt = `You are Enzo, the head executive concierge and track operations leader at DreamDrive South Africa.
A client has submitted an inquiry in the category: "${category}"
Client message: "${query}"

Our rules:
- Drivers must be 23+ with valid license (Class B or International counterpart) for modern supercars, or 25+ for the manual Shelby Cobra.
- Rands (ZAR) is the default currency. Rates include standard safety briefings and supercars telemetry setups.
- Upfront security holds are fully managed during dashboard keys handover.
- Extra additions like GoPro onboard and gourmet hampers can be integrated.

Reply in a refined, elegant, elite South African luxury concierge tone. Professional but exciting. Under 70 words total! No placeholders.`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({
      answer: response.text?.trim() || "Operations cabin verified. Your luxury run reservation details have been updated on our VIP manifest.",
      success: true,
      timestamp: new Date()
    });
  } catch (err) {
    console.warn("Gemini support fallback Enzo chat:", err);
    const replies: Record<string, string> = {
      default: "📟 CONCIERGE CHANNELS SECURED: Your query has been logged of our operations room. For immediate keys verification, confirm you have loaded a valid license in your Pilot Profile tab. Lead the peak curves! Enzo.",
      booking: "📟 BOOKING PROTOCOL HIGH: Driving credentials validated. All runs are fully insured under a minimal deductible, expandable to Zero-Excess Elite protection. A boutique gourmet hamper and helmet awaits your arrival! Enzo.",
      technical: "📟 MECHANICAL APEX SECURED: Lower downforces and standard telemetry sweeps confirm our fleet runs on optimum performance. Top up your pilot credits in the Vault to coordinate direct tracking holds! Enzo."
    };
    const key = category && category.toLowerCase().includes("book") ? "booking" : (category && category.toLowerCase().includes("technical") ? "technical" : "default");
    res.json({
      answer: replies[key],
      success: true,
      timestamp: new Date()
    });
  }
});

// ==========================================
// STATIC INTERFACE AND DEV SERVERS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DreamDrive Server] running efficiently on http://0.0.0.0:${PORT}`);
  });
}

startServer();
