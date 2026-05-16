import { PastCompetition } from "../components/WinnersHall";
import { LedgerEntry } from "../components/DepositVault";

export interface ScoreEntry {
  username: string;
  score: number;
  timestamp: string;
  isUser: boolean;
}

export interface Competition {
  id: string;
  title: string;
  prizeName: string;
  prizeValue: number;
  entryFee: number;
  description: string;
  imageAlt: string;
  endsAt: string;
  status: "active" | "ended";
  leaderboard: ScoreEntry[];
  ticketCost: number;
  timeLeftMs: number;
  winner?: {
    username: string;
    score: number;
  } | null;
}

export interface UserProfile {
  username: string;
  balance: number;
  tickets: Record<string, number>;
  scoresSubmissions: Record<string, number[]>;
}

export interface ActivityLog {
  id: string;
  username: string;
  type: "deposit" | "enter" | "score" | "ended";
  details: string;
  timestamp: string;
}

export const FALLBACK_COMPETITIONS = (): Competition[] => [
  {
    id: "iphone",
    title: "⚡️ Neon Stacker iPhone 16 Challenge",
    prizeName: "iPhone 16 Pro (Black Titanium, 256GB)",
    prizeValue: 999.00,
    entryFee: 5.00,
    description: "Align moving blocks pixel-perfectly to build the massive digital tower. The highest stacker when the countdown slams zero claims the actual brand new iPhone 16 Pro! Match perfect blocks to secure double multiplier and build the ultimate tower of power.",
    imageAlt: "Futuristic neon stacker iPhone 16 prize concept",
    endsAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: "active",
    ticketCost: 5.00,
    timeLeftMs: 15 * 60 * 1000,
    leaderboard: [
      { username: "pixel_master", score: 14, timestamp: new Date(Date.now() - 3600000).toISOString(), isUser: false },
      { username: "neon_wizard", score: 11, timestamp: new Date(Date.now() - 7200000).toISOString(), isUser: false },
      { username: "stack_king", score: 7, timestamp: new Date(Date.now() - 24000000).toISOString(), isUser: false },
      { username: "arcade_boss", score: 6, timestamp: new Date(Date.now() - 30000000).toISOString(), isUser: false },
    ],
  },
  {
    id: "ps5",
    title: "🕹️ PlayStation 5 Pro Arcade Battle",
    prizeName: "Sony PlayStation 5 Pro Console",
    prizeValue: 699.00,
    entryFee: 3.00,
    description: "Battle it out to win a high-performance PlayStation 5 Pro console with advanced ray-tracing and 2TB SSD! Play the pixel-perfect neon timing challenge. Align the blocks and beat retro_rachel's record to take home the crown.",
    imageAlt: "Gaming console neon render",
    endsAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: "active",
    ticketCost: 3.00,
    timeLeftMs: 30 * 60 * 1000,
    leaderboard: [
      { username: "retro_rachel", score: 18, timestamp: new Date(Date.now() - 1800000).toISOString(), isUser: false },
      { username: "synth_wave", score: 15, timestamp: new Date(Date.now() - 5400000).toISOString(), isUser: false },
      { username: "matrix_runner", score: 13, timestamp: new Date(Date.now() - 9000000).toISOString(), isUser: false },
      { username: "glitch_queen", score: 10, timestamp: new Date(Date.now() - 12000000).toISOString(), isUser: false },
      { username: "grid_walker", score: 8, timestamp: new Date(Date.now() - 16000000).toISOString(), isUser: false },
    ],
  },
  {
    id: "airpods",
    title: "🎧 AirPods Max Synth-Beat Showdown",
    prizeName: "Apple AirPods Max (Space Gray)",
    prizeValue: 549.00,
    entryFee: 2.00,
    description: "Immersive acoustics meet high-octane stack timings! Get the beat drop right. Win the Apple AirPods Max space gray edition by scaling the stacks of the grid before the timers blow.",
    imageAlt: "High-end sound headphone audio",
    endsAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    status: "active",
    ticketCost: 2.00,
    timeLeftMs: 45 * 60 * 1000,
    leaderboard: [
      { username: "vibe_collector", score: 22, timestamp: new Date(Date.now() - 500000).toISOString(), isUser: false },
      { username: "sonic_boom", score: 19, timestamp: new Date(Date.now() - 4300000).toISOString(), isUser: false },
      { username: "beat_dropper", score: 16, timestamp: new Date(Date.now() - 8500000).toISOString(), isUser: false },
      { username: "bass_head", score: 12, timestamp: new Date(Date.now() - 11000000).toISOString(), isUser: false },
    ],
  }
];

export const FALLBACK_PAST_COMPETITIONS = (): PastCompetition[] => [
  {
    id: "past_switch",
    title: "⚡ Nintendo Switch OLED Neon Battle",
    prizeName: "Nintendo Switch OLED Edition (Neon Red/Blue)",
    prizeValue: 349.00,
    winnerUsername: "tokyo_drift",
    winningScore: 17,
    dateEnded: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    statusText: "Safely delivered to winner on May 14th",
    deliveryStatus: "delivered",
    courier: "DHL Express",
    trackingNumber: "DHL-982-108-VAPOR",
    reviewQuote: "Laser alignment paid off! The Switch OLED sounds incredible and physical box arrived pristine here in Kyoto within 48 hours! 🎮",
    recipientLocation: "Kyoto, JP"
  },
  {
    id: "past_deck",
    title: "🚀 Steam Deck OLED 1TB High-Octane Sweep",
    prizeName: "Valve Steam Deck OLED (1TB Storage)",
    prizeValue: 649.00,
    winnerUsername: "laser_hawk",
    winningScore: 21,
    dateEnded: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    statusText: "Delivered & verified by claimant",
    deliveryStatus: "delivered",
    courier: "FedEx Priority",
    trackingNumber: "FDX-776-302-GRID",
    reviewQuote: "Absolute peak retro performance! My block tower height was 21 - thought someone would top me but I held! Best platform online bar none.",
    recipientLocation: "Berlin, DE"
  },
  {
    id: "past_monitor",
    title: "🖥️ Samsung Odyssey G9 Neon Grid Arena",
    prizeName: "Samsung Odyssey Neo G9 49\" Gaming Monitor",
    prizeValue: 1299.00,
    winnerUsername: "cyber_edge",
    winningScore: 25,
    dateEnded: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    statusText: "DHL Priority transit cleared destination",
    deliveryStatus: "delivered",
    courier: "DHL Priority",
    trackingNumber: "DHL-441-901-NEON",
    reviewQuote: "This monitor is a literal space station! Setting up my custom arcade stack terminal with G9 curves makes the neon glow feel like reality.",
    recipientLocation: "Austin, TX"
  }
];

export const FALLBACK_LEDGERS = (): LedgerEntry[] => [
  {
    id: "TX-9901",
    type: "deposit",
    amount: 10.00,
    balanceAfter: 15.00,
    hash: "0x8fae77c8e...a801",
    timestamp: new Date(Date.now() - 3605000).toISOString(),
    details: "Credit Card top-up authorized"
  },
  {
    id: "TX-9900",
    type: "deposit",
    amount: 5.00,
    balanceAfter: 5.00,
    hash: "0x00beef1a2...99ff",
    timestamp: new Date(Date.now() - 7205000).toISOString(),
    details: "New account registration welcome credit reward"
  }
];

export const FALLBACK_ACTIVITIES = (): ActivityLog[] => [
  { id: "1", username: "pixel_master", type: "score", details: "Scored 14 in the iPhone 16 Challenge!", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", username: "neon_wizard", type: "enter", details: "Entried the iPhone 16 challenge and paid $5.00", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "3", username: "retro_rachel", type: "score", details: "Scored 18 and secured 1st place in the PS5 Pro Battle!", timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: "4", username: "arcade_boss", type: "deposit", details: "Deposited $25.00 using Crypto-Secure Pay Gateway", timestamp: new Date(Date.now() - 25000000).toISOString() },
];
