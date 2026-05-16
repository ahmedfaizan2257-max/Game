import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Type Definitions
interface ScoreEntry {
  username: string;
  score: number;
  timestamp: Date;
  isUser: boolean;
}

interface Competition {
  id: string;
  title: string;
  prizeName: string;
  prizeValue: number;
  entryFee: number;
  description: string;
  imageAlt: string;
  durationMs: number; // Duration of competition in ms
  endsAt: Date;
  status: "active" | "ended";
  leaderboard: ScoreEntry[];
  ticketCost: number;
  winner?: {
    username: string;
    score: number;
  } | null;
}

interface ActivityLog {
  id: string;
  username: string;
  type: "deposit" | "enter" | "score" | "ended";
  details: string;
  timestamp: Date;
}

// In-Memory Database State
let userProfile = {
  username: "ArcadeRacer_99",
  balance: 15.00, // Starting balance
  tickets: {} as Record<string, number>, // CompID -> amount of plays allowed
  scoresSubmissions: {} as Record<string, number[]>, // CompID -> array of scores
};

const INITIAL_LEADERBOARD_IPHONE: ScoreEntry[] = [
  { username: "pixel_master", score: 14, timestamp: new Date(Date.now() - 3600000), isUser: false },
  { username: "neon_wizard", score: 12, timestamp: new Date(Date.now() - 7200000), isUser: false },
  { username: "crypto_ninja", score: 11, timestamp: new Date(Date.now() - 10000000), isUser: false },
  { username: "joystick_hero", score: 9, timestamp: new Date(Date.now() - 15000000), isUser: false },
  { username: "cyber_junkie", score: 8, timestamp: new Date(Date.now() - 20000000), isUser: false },
  { username: "stack_king", score: 7, timestamp: new Date(Date.now() - 24000000), isUser: false },
  { username: "arcade_boss", score: 6, timestamp: new Date(Date.now() - 30000000), isUser: false },
];

const INITIAL_LEADERBOARD_PS5: ScoreEntry[] = [
  { username: "retro_rachel", score: 18, timestamp: new Date(Date.now() - 1800000), isUser: false },
  { username: "synth_wave", score: 15, timestamp: new Date(Date.now() - 5400000), isUser: false },
  { username: "matrix_runner", score: 13, timestamp: new Date(Date.now() - 9000000), isUser: false },
  { username: "glitch_queen", score: 10, timestamp: new Date(Date.now() - 12000000), isUser: false },
  { username: "grid_walker", score: 8, timestamp: new Date(Date.now() - 16000000), isUser: false },
];

const INITIAL_LEADERBOARD_AIRPODS: ScoreEntry[] = [
  { username: "vibe_collector", score: 22, timestamp: new Date(Date.now() - 500000), isUser: false },
  { username: "sonic_boom", score: 19, timestamp: new Date(Date.now() - 4300000), isUser: false },
  { username: "beat_dropper", score: 16, timestamp: new Date(Date.now() - 8500000), isUser: false },
  { username: "bass_head", score: 12, timestamp: new Date(Date.now() - 11000000), isUser: false },
];

let competitions: Competition[] = [
  {
    id: "iphone",
    title: "⚡️ Neon Stacker iPhone 16 Challenge",
    prizeName: "iPhone 16 Pro (Black Titanium, 256GB)",
    prizeValue: 999.00,
    entryFee: 5.00,
    description: "Align moving blocks pixel-perfectly to build the massive digital tower. The highest stacker when the countdown slams zero claims the actual brand new iPhone 16 Pro! Match perfect blocks to secure double multiplier and build the ultimate tower of power.",
    imageAlt: "Futuristic neon stacker iPhone 16 prize concept",
    durationMs: 15 * 60 * 1000, // 15 Mins
    endsAt: new Date(Date.now() + 15 * 60 * 1000),
    status: "active",
    ticketCost: 5.00,
    leaderboard: INITIAL_LEADERBOARD_IPHONE,
  },
  {
    id: "ps5",
    title: "🕹️ PlayStation 5 Pro Arcade Battle",
    prizeName: "Sony PlayStation 5 Pro Console",
    prizeValue: 699.00,
    entryFee: 3.00,
    description: "Battle it out to win a high-performance PlayStation 5 Pro console with advanced ray-tracing and 2TB SSD! Play the pixel-perfect neon timing challenge. Align the blocks and beat retro_rachel's record to take home the crown.",
    imageAlt: "Gaming console neon render",
    durationMs: 30 * 60 * 1000, // 30 Mins
    endsAt: new Date(Date.now() + 30 * 60 * 1000),
    status: "active",
    ticketCost: 3.00,
    leaderboard: INITIAL_LEADERBOARD_PS5,
  },
  {
    id: "airpods",
    title: "🎧 AirPods Max Synth-Beat Showdown",
    prizeName: "Apple AirPods Max (Space Gray)",
    prizeValue: 549.00,
    entryFee: 2.00,
    description: "Immersive acoustics meet high-octane stack timings! Get the beat drop right. Win the Apple AirPods Max space gray edition by scaling the stacks of the grid before the timers blow.",
    imageAlt: "High-end sound headphone audio",
    durationMs: 45 * 60 * 1000, // 45 Mins
    endsAt: new Date(Date.now() + 45 * 60 * 1000),
    status: "active",
    ticketCost: 2.00,
    leaderboard: INITIAL_LEADERBOARD_AIRPODS,
  }
];

let activities: ActivityLog[] = [
  { id: "1", username: "pixel_master", type: "score", details: "Scored 14 in the iPhone 16 Challenge!", timestamp: new Date(Date.now() - 3600000) },
  { id: "2", username: "neon_wizard", type: "enter", details: "Entried the iPhone 16 challenge and paid $5.00", timestamp: new Date(Date.now() - 7200000) },
  { id: "3", username: "retro_rachel", type: "score", details: "Scored 18 and secured 1st place in the PS5 Pro Battle!", timestamp: new Date(Date.now() - 1800000) },
  { id: "4", username: "arcade_boss", type: "deposit", details: "Deposited $25.00 using Crypto-Secure Pay Gateway", timestamp: new Date(Date.now() - 25000000) },
];

// Helper to simulated active opponent activity
const MOCK_OPPONENT_NAMES = [
  "cyber_edge", "retro_gamer_88", "alpha_stacker", "neon_pulse", "hacker_jack",
  "grid_rider", "dystopian_future", "pixel_perfect", "gravity_rebel", "zero_cool",
  "vector_wave", "laser_hawk", "tokyo_drift", "arcade_wizard", "stack_lord"
];

function triggerMockOpponentPlay() {
  // select a random active competition
  const activeComps = competitions.filter(c => c.status === "active");
  if (activeComps.length === 0) return;

  const comp = activeComps[Math.floor(Math.random() * activeComps.length)];
  const opponent = MOCK_OPPONENT_NAMES[Math.floor(Math.random() * MOCK_OPPONENT_NAMES.length)];
  
  // Decide what they do: either enter the comp, or play and score
  const actionType = Math.random() > 0.45 ? "score" : "enter";

  if (actionType === "enter") {
    activities.unshift({
      id: Math.random().toString(),
      username: opponent,
      type: "enter",
      details: `Paid $${comp.entryFee.toFixed(2)} and acquired entry ticket for ${comp.prizeName}!`,
      timestamp: new Date()
    });
  } else {
    // Score based on competition
    let score = Math.floor(Math.random() * 14) + 2; // typical range 2 to 15
    if (Math.random() > 0.92) score = Math.floor(Math.random() * 8) + 15; // rare champion score! (15 to 22)

    // Add score entries
    const existingEntryIndex = comp.leaderboard.findIndex(e => e.username === opponent);
    if (existingEntryIndex !== -1) {
      if (score > comp.leaderboard[existingEntryIndex].score) {
        comp.leaderboard[existingEntryIndex].score = score;
        comp.leaderboard[existingEntryIndex].timestamp = new Date();
      }
    } else {
      comp.leaderboard.push({
        username: opponent,
        score,
        timestamp: new Date(),
        isUser: false
      });
    }

    // Sort leaderboard in descending order
    comp.leaderboard.sort((a, b) => b.score - a.score || a.timestamp.getTime() - b.timestamp.getTime());

    activities.unshift({
      id: Math.random().toString(),
      username: opponent,
      type: "score",
      details: `Scored ${score} on ${comp.prizeName}! Rank is now #${comp.leaderboard.findIndex(e => e.username === opponent) + 1}`,
      timestamp: new Date()
    });
  }

  // Keep activity logs limited to 50
  if (activities.length > 50) {
    activities = activities.slice(0, 50);
  }
}

// Tick simulation loop every 15 seconds
setInterval(() => {
  triggerMockOpponentPlay();
  
  // Also check if any active competition countdown has reached zero
  const now = new Date();
  competitions.forEach(comp => {
    if (comp.status === "active" && comp.endsAt.getTime() <= now.getTime()) {
      comp.status = "ended";
      // Pick top loader as the winner
      if (comp.leaderboard.length > 0) {
        const top = comp.leaderboard[0];
        comp.winner = {
          username: top.username,
          score: top.score
        };
        activities.unshift({
          id: Math.random().toString(),
          username: top.username,
          type: "ended",
          details: `🏆 Competition for ${comp.prizeName} ended! ${top.username} wins with score ${top.score}!`,
          timestamp: new Date()
        });
      } else {
        comp.winner = null;
      }
    }
  });
}, 12000);


// ==========================================
// REST API ROUTES
// ==========================================

// Get all competitions & status
app.get("/api/competitions", (req, res) => {
  res.json({
    competitions: competitions.map(c => ({
      ...c,
      timeLeftMs: Math.max(0, c.endsAt.getTime() - Date.now())
    })),
    user: userProfile
  });
});

// Post a deposit (mock payment processing validation)
app.post("/api/wallet/deposit", (req, res) => {
  const { amount, cardNumber, cardHolder, expiry, cvv } = req.body;
  const depAmount = parseFloat(amount);

  if (isNaN(depAmount) || depAmount <= 0) {
    return res.status(400).json({ error: "Invalid payment amount specified." });
  }

  if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 15) {
    return res.status(400).json({ error: "Invalid credit card number formatted." });
  }

  if (!cardHolder || cardHolder.trim().length === 0) {
    return res.status(400).json({ error: "Cardholder name is required." });
  }

  if (!expiry || !expiry.includes("/")) {
    return res.status(400).json({ error: "Expiry date is in incorrect format (MM/YY)." });
  }

  if (!cvv || cvv.length < 3) {
    return res.status(400).json({ error: "CVV verification failed." });
  }

  // Add to user balance
  userProfile.balance += depAmount;
  recordLedgerTransaction("deposit", depAmount, `Replenished Vault balance (+ $${depAmount.toFixed(2)})`);

  const log: ActivityLog = {
    id: Math.random().toString(),
    username: userProfile.username,
    type: "deposit",
    details: `Successfully deposited $${depAmount.toFixed(2)} via Secured Gateway! Balance is now $${userProfile.balance.toFixed(2)}`,
    timestamp: new Date()
  };
  activities.unshift(log);

  res.json({
    message: "Deposit successful! Ready to enter competitions.",
    balance: userProfile.balance,
    activity: log
  });
});

// Save/Update Custom Username
app.post("/api/profile/update-username", (req, res) => {
  const { username } = req.body;
  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: "Username cannot be empty." });
  }
  
  const cleanUsername = username.trim().substring(0, 18).replace(/[^a-zA-Z0-9_]/g, "");
  if (!cleanUsername) {
    return res.status(400).json({ error: "Username must have letters or numbers." });
  }

  const oldName = userProfile.username;
  userProfile.username = cleanUsername;

  // Update in user profile details
  res.json({
    message: `Username changed from ${oldName} to ${cleanUsername}!`,
    username: cleanUsername
  });
});

// Pay X amount to enter target competition
app.post("/api/competitions/:id/enter", (req, res) => {
  const { id } = req.params;
  const comp = competitions.find(c => c.id === id);

  if (!comp) {
    return res.status(404).json({ error: "Competition target was not found." });
  }

  if (comp.status !== "active") {
    return res.status(400).json({ error: "This arcade competition has already ended." });
  }

  if (userProfile.balance < comp.entryFee) {
    return res.status(400).json({ error: "Insufficient wallet balance. Please top up your wallet." });
  }

  // Deduct deposit & add ticket play
  userProfile.balance -= comp.entryFee;
  userProfile.tickets[id] = (userProfile.tickets[id] || 0) + 1;
  recordLedgerTransaction("purchase", comp.entryFee, `Acquired 'stacker run ticket' for ${comp.prizeName}`);

  const log: ActivityLog = {
    id: Math.random().toString(),
    username: userProfile.username,
    type: "enter",
    details: `Purchased play-ticket for '${comp.title}' ($${comp.entryFee.toFixed(2)} deducted).`,
    timestamp: new Date()
  };
  activities.unshift(log);

  res.json({
    message: "Competition joined! You have 1 game ticket credit.",
    balance: userProfile.balance,
    tickets: userProfile.tickets[id],
    activity: log
  });
});

// Submit a skill score for a target competition (requires a valid game play ticket)
app.post("/api/competitions/:id/submit-score", (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  const comp = competitions.find(c => c.id === id);

  if (!comp) {
    return res.status(404).json({ error: "Competition not found." });
  }

  if (comp.status !== "active") {
    return res.status(400).json({ error: "This competition has already closed." });
  }

  // Enforce validation: must have spent a ticket to submit
  const availableTickets = userProfile.tickets[id] || 0;
  if (availableTickets <= 0) {
    return res.status(400).json({ error: "No entry credits. You must buy an arcade entry ticket first!" });
  }

  // Deduct 1 ticket play
  userProfile.tickets[id] = availableTickets - 1;

  const finalScore = parseInt(score);
  if (isNaN(finalScore) || finalScore < 0) {
    return res.status(400).json({ error: "Invalid submission score format." });
  }

  // Record submission on user profiles
  if (!userProfile.scoresSubmissions[id]) {
    userProfile.scoresSubmissions[id] = [];
  }
  userProfile.scoresSubmissions[id].push(finalScore);

  // Update leaderboard entries
  const existingUserEntry = comp.leaderboard.find(e => e.username === userProfile.username);
  let isNewPersonalBest = false;

  if (existingUserEntry) {
    if (finalScore > existingUserEntry.score) {
      existingUserEntry.score = finalScore;
      existingUserEntry.timestamp = new Date();
      isNewPersonalBest = true;
    }
  } else {
    comp.leaderboard.push({
      username: userProfile.username,
      score: finalScore,
      timestamp: new Date(),
      isUser: true
    });
    isNewPersonalBest = true;
  }

  // Re-sort descending
  comp.leaderboard.sort((a, b) => b.score - a.score || a.timestamp.getTime() - b.timestamp.getTime());

  // Rank position of user profile
  const rank = comp.leaderboard.findIndex(e => e.username === userProfile.username) + 1;

  const log: ActivityLog = {
    id: Math.random().toString(),
    username: userProfile.username,
    type: "score",
    details: `Completed Neon Stacking with a score of ${finalScore}! Secured Leaderboard Rank #${rank}`,
    timestamp: new Date()
  };
  activities.unshift(log);

  res.json({
    message: isNewPersonalBest 
      ? `High score submitted! New personal record: ${finalScore}! Rank #${rank}`
      : `Score submitted! Real-time arcade score processed. Score: ${finalScore}`,
    finalScore,
    userTickets: userProfile.tickets[id],
    rank,
    leaderboard: comp.leaderboard,
    isNewPersonalBest
  });
});

// Admin developer triggers: Simulates opponent actions
app.post("/api/admin/simulate-opponent", (req, res) => {
  triggerMockOpponentPlay();
  res.json({ success: true, activities, competitions });
});

// Admin developer triggers: Instantly fast forwards a competition timer to close/end it
app.post("/api/admin/end-competition/:id", (req, res) => {
  const { id } = req.params;
  const comp = competitions.find(c => c.id === id);

  if (!comp) {
    return res.status(404).json({ error: "Target competition not found!" });
  }

  comp.endsAt = new Date();
  comp.status = "ended";

  if (comp.leaderboard.length > 0) {
    const top = comp.leaderboard[0];
    comp.winner = {
      username: top.username,
      score: top.score
    };
    activities.unshift({
      id: Math.random().toString(),
      username: top.username,
      type: "ended",
      details: `🏆 DEV-OVERRIDE: Competition for ${comp.prizeName} ended! ${top.username} wins with final score ${top.score}!`,
      timestamp: new Date()
    });
  } else {
    comp.winner = null;
  }

  res.json({
    message: `Timer triggered. Competion is sealed at score ${comp.winner ? comp.winner.score : 0}!`,
    competition: comp
  });
});

// Admin developer triggers: Restarts / Resets some competitions
app.post("/api/admin/restart-competition/:id", (req, res) => {
  const { id } = req.params;
  const comp = competitions.find(c => c.id === id);

  if (!comp) {
    return res.status(404).json({ error: "Competition not found." });
  }

  comp.status = "active";
  comp.endsAt = new Date(Date.now() + comp.durationMs);
  comp.winner = undefined;
  
  if (id === "iphone") {
    comp.leaderboard = [...INITIAL_LEADERBOARD_IPHONE];
  } else if (id === "ps5") {
    comp.leaderboard = [...INITIAL_LEADERBOARD_PS5];
  } else {
    comp.leaderboard = [...INITIAL_LEADERBOARD_AIRPODS];
  }

  activities.unshift({
    id: Math.random().toString(),
    username: "DEVOPS_ARCADE",
    type: "enter",
    details: `🕹️ Reset: '${comp.title}' competition restarted with fresh ${comp.durationMs / 60000}m timer!`,
    timestamp: new Date()
  });

  res.json({
    message: "Competition reset successfully!",
    competition: comp
  });
});

// Lazy initialization of GoogleGenAI to prevent crashing if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured or contains placeholder.");
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

// Generate Live Sports AI Arena Commentary
app.post("/api/gemini/commentary", async (req, res) => {
  const { score, username, rank, prizeName, leaderName, leaderScore } = req.body;
  
  try {
    const client = getGeminiClient();
    const prompt = `You are an ecstatic, retro-futuristic synthwave arcade commentator for VaporPrize Arena.
A player named "${username}" just completed a skill challenge on the "${prizeName}" Stacker game!
Stats from the run:
- Score: ${score} points
- Leaderboard Rank: #${rank}
- The reigning champion on this board is "${leaderName}" with a block score of ${leaderScore}.

Generate a 1-to-2 sentence maximum electric commentary on this play. Keep it extremely short, punchy, action-oriented, and vaporwave-inspired (mention laser grids, CRT screens, high-octane stackers, retro beats, or cabinet coins). Keep response under 45 words!`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    res.json({ commentary: response.text?.trim() || "Grid alignment verified. Next level unlocked." });
  } catch (err) {
    console.warn("Gemini Commentary falling back to custom retro-announcements:", err);
    const fallbacks = [
      `Grid rider ${username} stacked to tower level ${score}! The neon grids are heating up!`,
      `Solid effort, ${username}! Rank #${rank} secured. Can you top ${leaderName}'s height of ${leaderScore}?`,
      `Score ${score} logged! Keep riding the neon wave. The iPhone prize is calling!`,
      `Perfect rhythm, ${username}! The crowd goes wild on the retro display as you climb!`
    ];
    res.json({ commentary: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }
});

// Fetch all activity list
app.get("/api/activity", (req, res) => {
  res.json({ activities });
});

// ==========================================
// NEW MULTI-PAGE EXTENSIONS DATA MODEL
// ==========================================

interface PastCompetition {
  id: string;
  title: string;
  prizeName: string;
  prizeValue: number;
  winnerUsername: string;
  winningScore: number;
  dateEnded: Date;
  statusText: string;
  deliveryStatus: "shipped" | "delivered" | "processing";
  courier: string;
  trackingNumber: string;
  reviewQuote: string;
  recipientLocation: string;
}

let pastCompetitions: PastCompetition[] = [
  {
    id: "past_switch",
    title: "⚡ Nintendo Switch OLED Neon Battle",
    prizeName: "Nintendo Switch OLED Edition (Neon Red/Blue)",
    prizeValue: 349.00,
    winnerUsername: "tokyo_drift",
    winningScore: 17,
    dateEnded: new Date(Date.now() - 2 * 24 * 3600 * 1000), // 2 days ago
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
    dateEnded: new Date(Date.now() - 4 * 24 * 3600 * 1000), // 4 days ago
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
    dateEnded: new Date(Date.now() - 7 * 24 * 3600 * 1000), // 7 days ago
    statusText: "DHL Priority transit cleared destination",
    deliveryStatus: "delivered",
    courier: "DHL Priority",
    trackingNumber: "DHL-441-901-NEON",
    reviewQuote: "This monitor is a literal space station! Setting up my custom arcade stack terminal with G9 curves makes the neon glow feel like reality.",
    recipientLocation: "Austin, TX"
  },
  {
    id: "past_vision",
    title: "🕶️ Apple Vision Pro Spatial Ultimate Stacks",
    prizeName: "Apple Vision Pro Spatial Computer (256GB)",
    prizeValue: 3499.00,
    winnerUsername: "pixel_perfect",
    winningScore: 29,
    dateEnded: new Date(Date.now() - 10 * 24 * 3600 * 1000), // 10 days ago
    statusText: "DHL Custom Clearance completed - delivered",
    deliveryStatus: "delivered",
    courier: "DHL Express",
    trackingNumber: "DHL-009-881-SOLID",
    reviewQuote: "Simply pure magic! Playing in spatial space using simulated retro hand alignments. Physical delivery verification took only 3 days.",
    recipientLocation: "London, UK"
  }
];

interface LedgerEntry {
  id: string;
  type: "deposit" | "purchase" | "reward";
  amount: number;
  balanceAfter: number;
  hash: string;
  timestamp: Date;
  details: string;
}

// Initial default ledger entries matching our starting balance ($15.00)
let walletLedger: LedgerEntry[] = [
  {
    id: "TX-9901",
    type: "deposit",
    amount: 10.00,
    balanceAfter: 15.00,
    hash: "0x8fae77c8e...a801",
    timestamp: new Date(Date.now() - 3600000 * 4),
    details: "Credit Card top-up authorized"
  },
  {
    id: "TX-9900",
    type: "deposit",
    amount: 5.00,
    balanceAfter: 5.00,
    hash: "0x00beef1a2...99ff",
    timestamp: new Date(Date.now() - 3600000 * 8),
    details: "New account registration welcome credit reward"
  }
];

// Extend Deposit & Purchase to log to historical ledger
function recordLedgerTransaction(type: "deposit" | "purchase" | "reward", amount: number, details: string) {
  const hashBytes = Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join("");
  const txHash = `0x${hashBytes}...7f00`;

  walletLedger.unshift({
    id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
    type,
    amount,
    balanceAfter: userProfile.balance,
    hash: txHash,
    timestamp: new Date(),
    details
  });
}

// Modify existing endpoints to update ledger
// We can wrap/override them cleanly or implement endpoints
app.get("/api/wallet/ledger", (req, res) => {
  res.json({ ledger: walletLedger });
});

// Get previous competitions
app.get("/api/past-competitions", (req, res) => {
  res.json({ pastCompetitions });
});

// Support Query with retro AI Operator response
app.post("/api/help/support", async (req, res) => {
  const { query, category } = req.body;
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: "Missing support ticket query." });
  }

  try {
    const client = getGeminiClient();
    const prompt = `You are the Virtual Grid AI Assistant for VaporPrize.io - a super high-octane, neon synthwave arcade tournament platform.
A player has submitted a query regarding: "${category}"
Player query: "${query}"

Generate a short, punchy, retro-futuristic arcade customer-service assistant response under 55 words!
Be highly supportive, professional, and slightly retro-themed (refer to grids, cyber channels, physical delivery protocol, ticket validation, or cabinets). Do not ask the user for billing keys or direct private keys.`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({
      answer: response.text?.trim() || "Grid routing verified. Support ticket logs successfully formatted.",
      success: true,
      timestamp: new Date()
    });
  } catch (err) {
    console.warn("Gemini Support desk fallback triggered:", err);
    const mockResponses = [
      "SYSTEM: Signal acquired. Your ticket status regarding shipping has been tagged in Grid Row #9. We ship worldwide via DHL Priority fully insured with CRT inspection certificates. Delivery timeline is 48-72 hours post victory confirmation!",
      "SYSTEM: Arcade cabinet telemetry verifies stack timings align perfectly with standard IEEE quantum checks. To test connections or buy tickets, top up in the Deposit Vault. Our laser processors ensure all runs log live!",
      "SYSTEM: Grid carrier routing stabilized. Support engineers have allocated channel frequencies to review your query. Rest easy, grid runner! Your tickets have been logged on the regional ledgers."
    ];
    res.json({
      answer: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      success: true,
      timestamp: new Date()
    });
  }
});

// Update the other routes dynamically by hooking inside them
const originalDeposit = app._router.stack.find((r: any) => r.route && r.route.path === "/api/wallet/deposit");
// Instead of messing with router stack, let's just make sure we record transactions or handle inside the endpoint.
// Let's modify the deposit & enter endpoint inside server.ts with manual edit to ensure the ledger matches up.



// ==========================================
// VITE DEV SERVER & STATIC MIDDLEWARE SETUP
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
    console.log(`[VaporPrize Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
