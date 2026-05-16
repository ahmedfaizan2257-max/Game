export interface Supercar {
  id: string;
  name: string;
  category: "modern-supercar" | "classic-roadster" | "track-ready";
  hp: number;
  acceleration: string; // "0-100 km/h in 3.0s"
  topSpeed: string; // "330 km/h"
  engine: string; // "3.9L Twin-Turbo V8"
  gearbox: string; // "7-Speed Dual-Clutch"
  color: string;
  dayRate: number; // in ZAR Rands
  hourlyRate: number; // in ZAR Rands
  description: string;
  image: string; // beautiful unsplash automotive photography search terms
  soundSample: string; // Description or raw data of sound note
  frequencyHz: number; // custom base synthesizer note for roar!
  vibe: string; // Custom personality tags
  reviewsCount: number;
  rating: number;
}

export interface DriveRoute {
  id: string;
  name: string;
  distanceKm: number;
  durationText: string;
  difficulty: "Scenic Cruise" | "Challenging Curves" | "High-Speed Closed Circuit";
  description: string;
  highlights: string[];
  basePrice: number; // in ZAR
  location: "Cape Town" | "Johannesburg" | "Franschhoek";
  mapPoints: string[]; // for a beautiful SVG path visualizer
}

export interface BookingExperience {
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

export interface DriverProfile {
  username: string;
  fullName: string;
  licenseVerified: boolean;
  licenseClass: string;
  walletBalanceZar: number; // Users can top up credits
  bookedExperiences: BookingExperience[];
  likedCars: string[]; // Supercar IDs
}

export type UserProfile = DriverProfile;

export interface ActivityLog {
  id: string;
  username: string;
  type: "booking" | "deposit" | "license_verification" | "review" | "concierge_chat";
  details: string;
  timestamp: string;
}

export interface LedgerEntry {
  id: string;
  type: "deposit" | "booking_purchase" | "concierge_refund" | "promo_credit";
  amount: number;
  balanceAfter: number;
  hash: string;
  timestamp: string;
  details: string;
}

export interface GuestReview {
  id: string;
  username: string;
  carName: string;
  routeName: string;
  rating: number;
  quote: string;
  date: string;
  location: string;
}

export const FALLBACK_SUPER_CARS = (): Supercar[] => [
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

export const FALLBACK_ROUTES = (): DriveRoute[] => [
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
    mapPoints: ["M 10,80 Q 25,20 45,65 T 75,50 T 95,10"], // beautiful relative coordinate curve
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
    mapPoints: ["M 30,30 L 70,30 C 90,30 90,70 70,70 L 30,70 C 10,70 10,30 30,30 Z"], // oval race track
  }
];

export const FALLBACK_GUEST_REVIEWS = (): GuestReview[] => [
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

export const FALLBACK_LEDGERS = (): LedgerEntry[] => [
  {
    id: "TX-1002",
    type: "booking_purchase",
    amount: 14500,
    balanceAfter: 5500,
    hash: "0x89ad92c8a...33ee",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    details: "Booked Ferrari 488 Spider on Chapman's Peak Coast"
  },
  {
    id: "TX-1001",
    type: "deposit",
    amount: 20000,
    balanceAfter: 20000,
    hash: "0xfa11082bb...aa01",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    details: "Credit Card Mastercard payment authorized"
  },
  {
    id: "TX-1000",
    type: "promo_credit",
    amount: 1500,
    balanceAfter: 1500,
    hash: "0x00beef1a2...99ff",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    details: "Sign-up welcome luxury club voucher bonus"
  }
];

export const FALLBACK_ACTIVITIES = (): ActivityLog[] => [
  { id: "1", username: "devon_kemp", type: "review", details: "Reviewed Shelby Cobra Roadster [5 Stars]: 'Exhaust notes ringing off rock walls!'", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", username: "melissa_pretorius", type: "booking", details: "Booked Ferrari 488 Spider for the Franschhoek Wine Route", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "3", username: "anthony_vdw", type: "license_verification", details: "Driver's license successfully verified by VIP Liaison team (Class EB)", timestamp: new Date(Date.now() - 10800000).toISOString() },
  { id: "4", username: "ArcadeRacer_99", type: "deposit", details: "Deposited R20,000.00 to top up experience credits.", timestamp: new Date(Date.now() - 25000000).toISOString() },
];
