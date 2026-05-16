import React, { useState, useEffect } from "react";
import {
  FALLBACK_SUPER_CARS,
  FALLBACK_ROUTES,
  FALLBACK_GUEST_REVIEWS,
  FALLBACK_ACTIVITIES,
  FALLBACK_LEDGERS,
  Supercar,
  DriveRoute,
  GuestReview,
  ActivityLog,
  LedgerEntry,
  UserProfile
} from "./utils/fallbackData";

import {
  Compass,
  Database,
  Eye,
  Flag,
  Flame,
  Gauge,
  HelpCircle,
  Key,
  Layers,
  MapPin,
  MessageSquare,
  Navigation,
  Sparkles,
  Ticket,
  Trophy,
  Volume2,
  Users,
  ShieldAlert,
  Menu,
  X
} from "lucide-react";

import FleetExplorer from "./components/FleetExplorer";
import RouteExplorer from "./components/RouteExplorer";
import BespokeBuilder from "./components/BespokeBuilder";
import PilotDashboard from "./components/PilotDashboard";
import EnzoConcierge from "./components/EnzoConcierge";
import StackerGame from "./components/StackerGame";

export default function App() {
  // Navigation Tabs
  const [currentTab, setCurrentTab] = useState<"fleet" | "routes" | "builder" | "dashboard" | "concierge" | "drift_align">("fleet");

  // State loops
  const [cars, setCars] = useState<Supercar[]>([]);
  const [routes, setRoutes] = useState<DriveRoute[]>([]);
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [userProfile, setUserProfile] = useState<any>({
    username: "EliteDriver_ZA",
    fullName: "Adrian van der Merwe",
    licenseVerified: true,
    licenseClass: "Class EB International",
    walletBalanceZar: 25050,
    bookedExperiences: []
  });

  const [loading, setLoading] = useState(true);

  // Deep linking selections from fleet/routes straight to the calculator
  const [selectedCarId, setSelectedCarId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");

  // Panoramic visual index rotating carousel of hero backgrounds
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1800",
      tag: "THE HIGHEST ENGINE CALIBRES",
      title: "Cape Town Coastline",
      sub: "Hug 114 marine curves overlooking the blue Atlantic in high-power downforce."
    },
    {
      url: "https://images.unsplash.com/photo-1627454820516-dc767acc493e?auto=format&fit=crop&q=80&w=1800",
      tag: "SYNCHRONIZED THUNDER ROARS",
      title: "Franschhoek Pass",
      sub: "Carve vertical switchbacks and alpine lookouts chiseled inside vineyard ranges."
    },
    {
      url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1800",
      tag: "FIA CIRCUIT PERFORMANCE UNLEASHED",
      title: "Killarney Track Day",
      sub: "Uncap redline limits with professional instruction on South Africa's premier tarmac."
    }
  ];

  useEffect(() => {
    const intv = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(intv);
  }, []);

  // Sync state from server API or fall back perfectly
  const syncState = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/state");
      if (res.ok) {
        const data = await res.json();
        setCars(data.supercars || FALLBACK_SUPER_CARS());
        setRoutes(data.routes || FALLBACK_ROUTES());
        setReviews(data.guestReviews || FALLBACK_GUEST_REVIEWS());
        setActivities(data.activities || FALLBACK_ACTIVITIES());
        setLedger(data.ledger || FALLBACK_LEDGERS());
        setUserProfile(data.userProfile || {
          username: "EliteDriver_ZA",
          fullName: "Adrian van der Merwe",
          licenseVerified: true,
          licenseClass: "Class EB International",
          walletBalanceZar: 25050,
          bookedExperiences: []
        });
      } else {
        throw new Error("Local sync mode");
      }
    } catch (err) {
      console.warn("Express server offline or initializing, loading pure offline telemetry structures:", err);
      setCars(FALLBACK_SUPER_CARS());
      setRoutes(FALLBACK_ROUTES());
      setReviews(FALLBACK_GUEST_REVIEWS());
      // Initialize offline state backup
      const localProfile = localStorage.getItem("dream_profile");
      if (localProfile) {
        setUserProfile(JSON.parse(localProfile));
      } else {
        const initialProfile = {
          username: "EliteDriver_ZA",
          fullName: "Adrian van der Merwe",
          licenseVerified: true,
          licenseClass: "Class EB International",
          walletBalanceZar: 25000,
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
          ]
        };
        setUserProfile(initialProfile);
        localStorage.setItem("dream_profile", JSON.stringify(initialProfile));
      }

      const localLedger = localStorage.getItem("dream_ledger");
      setLedger(localLedger ? JSON.parse(localLedger) : FALLBACK_LEDGERS());

      const localActivities = localStorage.getItem("dream_activities");
      setActivities(localActivities ? JSON.parse(localActivities) : FALLBACK_ACTIVITIES());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncState();
  }, []);

  // Deep linking callbacks to direct tabs and sets states
  const handleSelectCarInStable = (carId: string) => {
    setSelectedCarId(carId);
    setCurrentTab("builder");
    // scroll to top smoothly
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleSelectRouteInExplorer = (routeId: string) => {
    setSelectedRouteId(routeId);
    setCurrentTab("builder");
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleLikeCar = (carId: string) => {
    setUserProfile((prev: any) => {
      const liked = prev.likedCars ? [...prev.likedCars] : [];
      let nextLiked = [...liked];
      if (liked.includes(carId)) {
        nextLiked = liked.filter(id => id !== carId);
      } else {
        nextLiked.push(carId);
      }
      const updated = { ...prev, likedCars: nextLiked };
      localStorage.setItem("dream_profile", JSON.stringify(updated));
      return updated;
    });
  };

  // Deposit handler
  const handleDeposit = (amount: number) => {
    setUserProfile((prev: any) => {
      const nextBal = prev.walletBalanceZar + amount;
      const updated = { ...prev, walletBalanceZar: nextBal };
      localStorage.setItem("dream_profile", JSON.stringify(updated));

      // Append ledger and activity locally for absolute resilience
      const tx: LedgerEntry = {
        id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
        type: "deposit",
        amount,
        balanceAfter: nextBal,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...aa01`,
        timestamp: new Date().toISOString(),
        details: `Loaded wallet with credit top-up (+ R ${amount.toLocaleString()})`
      };
      setLedger(prevLedger => [tx, ...prevLedger]);
      setActivities(prevActs => [
        {
          id: Math.random().toString(),
          username: prev.fullName,
          type: "deposit",
          details: `Injected R ${amount.toLocaleString()}.00 to experience vault`,
          timestamp: new Date().toISOString()
        },
        ...prevActs
      ]);

      return updated;
    });
  };

  // Update profile handler
  const handleUpdateProfile = (updated: { fullName: string; licenseClass: string; driverLicenseNumber: string; username: string }) => {
    setUserProfile((prev: any) => {
      const nextProfile = {
        ...prev,
        fullName: updated.fullName,
        licenseClass: updated.licenseClass,
        driverLicenseNumber: updated.driverLicenseNumber,
        username: updated.username,
        licenseVerified: true
      };
      localStorage.setItem("dream_profile", JSON.stringify(nextProfile));

      setActivities(prevActs => [
        {
          id: Math.random().toString(),
          username: updated.fullName,
          type: "license_verification",
          details: "Verified telemetry driving license credentials in registry.",
          timestamp: new Date().toISOString()
        },
        ...prevActs
      ]);

      return nextProfile;
    });
  };

  // Checkout Success handler
  const handleBookingSuccess = (syncedPackage: any) => {
    // If backend returns updated userProfile, use it, else update locally
    if (syncedPackage && syncedPackage.userProfile) {
      setUserProfile(syncedPackage.userProfile);
      setLedger(syncedPackage.ledger || ledger);
    } else {
      // Offline fallback handling
      setUserProfile((prev: any) => {
        const cost = syncedPackage.totalCostZar;
        const nextBal = prev.walletBalanceZar - cost;
        const bkg = {
          id: syncedPackage.id || `BKG-${Math.floor(Math.random() * 9000) + 1000}`,
          carId: syncedPackage.carId,
          routeId: syncedPackage.routeId,
          date: syncedPackage.date,
          timeSlot: syncedPackage.timeSlot,
          durationHours: syncedPackage.durationHours,
          totalCostZar: cost,
          status: "confirmed",
          extras: syncedPackage.extras,
          instructorRequired: syncedPackage.instructorRequired,
          insuranceTier: syncedPackage.insuranceTier,
          driverLicenseNumber: syncedPackage.licenseNumber,
          bookingTime: new Date().toISOString()
        };

        const nextProfile = {
          ...prev,
          walletBalanceZar: nextBal,
          bookedExperiences: [bkg, ...prev.bookedExperiences]
        };

        localStorage.setItem("dream_profile", JSON.stringify(nextProfile));

        // update ledger and activities
        const tx: LedgerEntry = {
          id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
          type: "booking_purchase",
          amount: cost,
          balanceAfter: nextBal,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...77ee`,
          timestamp: new Date().toISOString(),
          details: `Confirmed luxury rental run in ${syncedPackage.carName}`
        };
        setLedger(pre => [tx, ...pre]);
        setActivities(acts => [
          {
            id: Math.random().toString(),
            username: prev.fullName,
            type: "booking",
            details: `Booked ${syncedPackage.carName} for ${syncedPackage.date}!`,
            timestamp: new Date().toISOString()
          },
          ...acts
        ]);

        return nextProfile;
      });
    }

    // Redirect straight to Pilot Dashboard to display their beautiful printable barcode pass!
    setCurrentTab("dashboard");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Interactive Drift Calibration Simulator (Finishing Stacker Game)
  const handleDriftGameFinished = (finalScore: number) => {
    if (finalScore <= 0) return;

    // Award R500.00 for every block aligned inside the drift challenge!
    const rewardRand = finalScore * 500;

    setUserProfile((prev: any) => {
      const nextBal = prev.walletBalanceZar + rewardRand;
      const updated = {
        ...prev,
        walletBalanceZar: nextBal
      };
      
      localStorage.setItem("dream_profile", JSON.stringify(updated));

      // Append ledger and activity locally for responsive credit top-up feedback
      const tx: LedgerEntry = {
        id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
        type: "promo_credit",
        amount: rewardRand,
        balanceAfter: nextBal,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...33ff`,
        timestamp: new Date().toISOString(),
        details: `Calibration reward (${finalScore} perfect apex gates aligned)`
      };
      setLedger(prevLedger => [tx, ...prevLedger]);
      setActivities(prevActs => [
        {
          id: Math.random().toString(),
          username: prev.fullName,
          type: "promo_credit",
          details: `Apex Drift Alignment completed! Gained +R ${rewardRand.toLocaleString()}.00 credits!`,
          timestamp: new Date().toISOString()
        },
        ...prevActs
      ]);

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f5] luxury-grid pb-24 relative select-none">
      {/* VVIP Top notification ribbon */}
      <div className="bg-[#D4AF37] text-zinc-950 px-4 py-2 text-[10px] font-mono font-bold tracking-[2px] text-center uppercase flex justify-center items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>CONCIERGE OPERATIONS ACTIVE • PREFERRED RATES LOADED FOR {userProfile.fullName.toUpperCase()}</span>
      </div>

      {/* Luxury brand header header */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-40 px-6 py-5 flex justify-between items-center max-w-7xl mx-auto">
        {/* Brand log */}
        <div className="flex gap-3 items-center">
          <Navigation className="w-6 h-6 text-[#D4AF37] stroke-2 animate-pulse" />
          <div className="font-serif">
            <h1 className="text-xl tracking-[4px] font-bold text-white uppercase">DreamDrive</h1>
            <span className="block text-[8px] font-mono tracking-[4px] text-zinc-500 uppercase">South Africa Elite</span>
          </div>
        </div>

        {/* Global currency and pilot indicator */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col text-right font-mono">
            <span className="text-[9px] text-zinc-500 uppercase">Available Pilot Balance</span>
            <span className="text-sm font-bold text-[#D4AF37] tracking-wider">
              R {userProfile.walletBalanceZar.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-zinc-850 pl-6">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              {userProfile.username.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero Panoramic Slider Section */}
      <section className="relative h-[480px] w-full overflow-hidden bg-zinc-950 border-b border-zinc-900">
        <div className="absolute inset-0">
          <img
            src={heroImages[heroIndex].url}
            alt="Dynamic Supercar Landscape background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 transition-all duration-1000 transform scale-100 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-90" />
        </div>

        {/* Hero Overlay textual panels */}
        <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-6">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/10 font-mono text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/30 tracking-[3px] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {heroImages[heroIndex].tag}
            </span>

            <h2 className="text-4xl lg:text-6xl font-serif font-light text-white tracking-tight mt-1 leading-tight">
              South Africa's Elite <br />
              <span className="text-[#D4AF37] font-semibold">{heroImages[heroIndex].title}</span> Experience
            </h2>

            <p className="text-zinc-455 text-sm md:text-base leading-relaxed max-w-lg font-sans">
              {heroImages[heroIndex].sub} Rates starting from R 3,500/hr, concluding with zero deductible security holds and bespoke winery retreats.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setCurrentTab("builder");
                  window.scrollTo({ top: 380, behavior: "smooth" });
                }}
                className="bg-[#D4AF37] hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-widest text-xs font-mono px-6 py-4 shadow-xl transition-all cursor-pointer rounded-none"
              >
                Assemble Bespoke Run
              </button>
              <button
                onClick={() => {
                  setCurrentTab("drift_align");
                  window.scrollTo({ top: 380, behavior: "smooth" });
                }}
                className="border border-[#D4AF37]/40 hover:border-[#D4AF37] text-white hover:bg-[#D4AF37]/5 font-bold uppercase tracking-widest text-xs font-mono px-6 py-4 transition-all cursor-pointer rounded-none"
              >
                Apex Drift Simulator (Earn Credits)
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`w-12 h-1 transition-all rounded-none ${heroIndex === idx ? "bg-[#D4AF37]" : "bg-zinc-800"}`}
            />
          ))}
        </div>
      </section>

      {/* Unified Tab Selector Navigation Table */}
      <section className="bg-zinc-950/90 sticky top-[77px] z-30 border-b border-zinc-900 py-3 block backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6 overflow-x-auto">
          <div className="flex gap-1.5 md:gap-3 py-1">
            {(
              [
                { id: "fleet", label: "The Stable", icon: Key },
                { id: "routes", label: "Scenic Routes", icon: Compass },
                { id: "builder", label: "Bespoke Builder", icon: Sparkles },
                { id: "dashboard", label: "Pilot Cabin", icon: Trophy },
                { id: "concierge", label: "Enzo's Lounge", icon: MessageSquare },
                { id: "drift_align", label: "Apex Challenge", icon: Layers }
              ] as const
            ).map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 rounded-none cursor-pointer border ${
                    currentTab === tab.id
                      ? "bg-[#D4AF37]/5 border-[#D4AF37] text-[#D4AF37] font-bold shadow-md"
                      : "border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-950"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="shrink-0 flex items-center gap-1.5 bg-black px-3 py-1 text-[11px] font-mono text-zinc-500 uppercase border border-zinc-900">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Telemetry Link Stable</span>
          </div>
        </div>
      </section>

      {/* Main Core Content Stage */}
      <main className="max-w-7xl mx-auto px-6 min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#D4AF37] animate-spin" />
            <span className="text-xs uppercase font-mono tracking-widest text-zinc-500">
              Synchronizing DreamDrive VIP Systems...
            </span>
          </div>
        ) : (
          <div className="transition-all duration-300">
            {/* VIEW 1: FLEET DISPLAY */}
            {currentTab === "fleet" && (
              <FleetExplorer
                cars={cars}
                onSelectCar={handleSelectCarInStable}
                onLikeCar={handleLikeCar}
                likedCars={userProfile.likedCars || []}
              />
            )}

            {/* VIEW 2: SCENIC ROUTES */}
            {currentTab === "routes" && (
              <RouteExplorer
                routes={routes}
                onSelectRoute={handleSelectRouteInExplorer}
              />
            )}

            {/* VIEW 3: BESPOKE package config checkout */}
            {currentTab === "builder" && (
              <BespokeBuilder
                cars={cars}
                routes={routes}
                userBalanceZar={userProfile.walletBalanceZar}
                onBookingSuccess={handleBookingSuccess}
                selectedCarId={selectedCarId}
                selectedRouteId={selectedRouteId}
              />
            )}

            {/* VIEW 4: PILOT telemetry profile receipt ledgers */}
            {currentTab === "dashboard" && (
              <PilotDashboard
                userProfile={userProfile}
                ledger={ledger}
                onDeposit={handleDeposit}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {/* VIEW 5: ENZO'S LIAISON SUPPORT ROOM */}
            {currentTab === "concierge" && <EnzoConcierge />}

            {/* VIEW 6: APEX ALIGNMENT SIMULATION */}
            {currentTab === "drift_align" && (
              <div id="drift-game-pane" className="space-y-8 py-6 max-w-3xl mx-auto">
                <div className="border-b border-zinc-805 pb-6">
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-1 border border-[#D4AF37]/20 uppercase">
                    <Trophy className="w-3.5 h-3.5" />
                    Pilot Drift Alignment Simulation
                  </span>
                  <h3 className="text-2xl font-light text-white font-sans mt-3">
                    Apex Drift Calibration <span className="text-[#D4AF37]">Challenge</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Test your downforce and apex alignment mechanics in high-speed conditions. Stack physical grip blocks directly on top of each other. **Every block successfully aligned triggers a R500.00 loyalty credit gift** directly into your Experience Wallet!
                  </p>
                </div>

                {/* Simulated cabin chassis layout */}
                <div className="border border-zinc-800 bg-black p-6 rounded-none space-y-4 shadow-2xl relative scanlines">
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-amber-500 uppercase tracking-widest">
                    SYSTEM: SIMULATOR ACTIVATED
                  </div>

                  <StackerGame
                    onGameOver={handleDriftGameFinished}
                    entryFee={0}
                    hasTicket={true}
                    onUseTicket={() => {}}
                    gameId="apex-drift"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Guest Reviews sliders */}
      {currentTab !== "drift_align" && (
        <section className="border-t border-zinc-900 mt-24 pt-16 max-w-7xl mx-auto px-6">
          <div className="border-b border-zinc-900 pb-6 mb-12">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">PILOT REVIEWS</span>
            <h3 className="text-2xl lg:text-3xl font-light text-white mt-1">
              Testimonials from the <span className="text-[#D4AF37]">Tarmac</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 3).map(rev => (
              <div key={rev.id} className="border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-1 text-amber-400 tracking-tight">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans italic font-light">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="border-t border-zinc-900 pt-4 mt-6 flex justify-between items-end font-mono">
                  <div>
                    <span className="block text-xs uppercase text-white font-semibold">@{rev.username}</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">{rev.location}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-zinc-550 uppercase">Rented Option</span>
                    <span className="block text-[10px] text-[#D4AF37] font-semibold">{rev.carName.substring(0, 15)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active system telemetry feed ticker */}
          <div className="mt-16 bg-zinc-950/80 border border-zinc-900/60 p-4 font-mono text-[10.5px] text-zinc-550 flex overflow-hidden whitespace-nowrap gap-8">
            <div className="text-[#D4AF37] font-semibold shrink-0 select-none uppercase tracking-wider">
              ● REALTIME DREAMDRIVE ACTIVITY LOGUS:
            </div>
            <div className="flex gap-12 animate-[marquee_45s_linear_infinite]">
              {activities.slice(0, 6).map((act, id) => (
                <span key={id} className="inline-block">
                  <span className="text-white">[{new Date(act.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span> @{act.username}: {act.details}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer metadata details */}
      <footer className="mt-24 border-t border-zinc-900 pt-8 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between text-[11px] text-zinc-550 gap-6 font-mono">
        <div className="space-y-1">
          <span className="text-white font-bold opacity-80 uppercase">DreamDrive co.za Clone platform build</span>
          <p className="text-zinc-650 leading-relaxed font-sans">
            Designed as a high-fidelity clone of dreamdrive.co.za incorporating bespoke car soundboard engines, animated telemetry trace paths, real South African Rand (ZAR) prices, and Chef de Concierge Enzo consultation chats powered by Gemini API.
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span>PORT INGRESS 3000 STANDARD • SECURE COGNITIVE CHASSIS</span>
          <span className="block text-[9px] text-zinc-600 mt-1">© 2026 DREAMDRIVE SOUTH AFRICA. ALL ENGINE TRADEMARKS HELD REGISTERED.</span>
        </div>
      </footer>
    </div>
  );
}
