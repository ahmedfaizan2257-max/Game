import React, { useRef, useEffect, useState } from "react";
import { Play, RotateCcw, Zap, Sparkles, Volume2 } from "lucide-react";
import {
  playSoundStack,
  playSoundPerfect,
  playSoundTrim,
  playSoundGameOver,
  playSoundVictory
} from "../utils/sounds";

interface StackerGameProps {
  onGameOver: (score: number) => void;
  entryFee: number;
  hasTicket: boolean;
  onUseTicket: () => void;
  gameId: string;
}

interface Block {
  y: number; // Row level index
  x: number; // Left start X in pixels
  width: number; // Width of the block
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  alpha: number;
}

export default function StackerGame({
  onGameOver,
  entryFee,
  hasTicket,
  onUseTicket,
  gameId
}: StackerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game flow states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [perfectMessage, setPerfectMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // References for mutable game loop state to prevent stale react closure triggers
  const stateRef = useRef({
    score: 0,
    placedBlocks: [] as Block[],
    currentBlock: { x: 0, y: 0, width: 220, direction: 1 } as Block & { direction: number },
    gameState: "unstarted" as "unstarted" | "playing" | "gameover" | "victory",
    speed: 3.5,
    cameraOffset: 0,
    streak: 0,
    particles: [] as Particle[],
    flashEffect: 0, // Out of 10
  });

  const rowHeight = 28;
  const canvasWidth = 400;
  const canvasHeight = 420;

  // Track personal highscore across instances in localstorage
  useEffect(() => {
    const saved = localStorage.getItem(`vapor_prize_hs_${gameId}`);
    if (saved) {
      setHighScore(parseInt(saved, 10));
    } else {
      setHighScore(0);
    }
  }, [gameId]);

  // Handle game start
  const handleStartGame = () => {
    if (!hasTicket) return;
    onUseTicket();

    // Reset loop ref state
    stateRef.current = {
      score: 0,
      placedBlocks: [],
      currentBlock: {
        y: 0,
        x: 0,
        width: 180,
        color: "#00f0ff",
        direction: 1
      },
      gameState: "playing",
      speed: 3.5 + Math.min(2, currentScore * 0.1),
      cameraOffset: 0,
      streak: 0,
      particles: [],
      flashEffect: 0
    };

    setCurrentScore(0);
    setPerfectStreak(0);
    setPerfectMessage("");
    setIsPlaying(true);

    if (!isMuted) playSoundStack();
  };

  // Safe sound trigger wrappers
  const triggerSoundStack = () => { if (!isMuted) playSoundStack(); };
  const triggerSoundPerfect = (streak: number) => { if (!isMuted) playSoundPerfect(streak); };
  const triggerSoundTrim = () => { if (!isMuted) playSoundTrim(); };
  const triggerSoundGameOver = () => { if (!isMuted) playSoundGameOver(); };
  const triggerSoundVictory = () => { if (!isMuted) playSoundVictory(); };

  // Place current sliding block onto the stack
  const handlePlaceBlock = () => {
    const state = stateRef.current;
    if (state.gameState !== "playing") return;

    const row = state.score;
    const current = state.currentBlock;
    
    // If it's the very first row, place it perfectly with zero slicing
    if (row === 0) {
      state.placedBlocks.push({
        y: 0,
        x: Math.max(10, Math.min(canvasWidth - current.width - 10, current.x)),
        width: current.width,
        color: "#00f0ff"
      });
      state.score += 1;
      setCurrentScore(state.score);
      state.speed = 3.8;
      
      // Target next block position (start sliding from left or right)
      state.currentBlock = {
        y: state.score,
        x: Math.random() > 0.5 ? 0 : canvasWidth - current.width,
        width: current.width,
        color: getNeonColorByRow(state.score),
        direction: Math.random() > 0.5 ? 1 : -1
      };
      
      triggerSoundStack();
      return;
    }

    // Compare with the block immediately beneath
    const baseBlock = state.placedBlocks[state.placedBlocks.length - 1];
    const leftBound = baseBlock.x;
    const rightBound = baseBlock.x + baseBlock.width;

    // Placed bounds
    const dropLeft = current.x;
    const dropRight = current.x + current.width;

    // Case 1: Out of bounds entirely - complete miss!
    if (dropRight <= leftBound || dropLeft >= rightBound) {
      state.gameState = "gameover";
      triggerSoundGameOver();
      finishGame();
      return;
    }

    // Case 2: Overlaps successfully
    const overlapLeft = Math.max(leftBound, dropLeft);
    const overlapRight = Math.min(rightBound, dropRight);
    const overlapWidth = overlapRight - overlapLeft;

    // Detect perfect alignment margin (within 5 pixels coordinate)
    const diff = Math.abs(dropLeft - leftBound);
    const isPerfect = diff < 6;

    let placedWidth = overlapWidth;
    let placedX = overlapLeft;

    if (isPerfect) {
      // Reward perfect execution: match base size exactly, grant double stack streak points
      placedWidth = baseBlock.width;
      placedX = baseBlock.x;
      state.streak += 1;
      setPerfectStreak(state.streak);
      setPerfectMessage(getPerfectQuote(state.streak));
      triggerSoundPerfect(state.streak);
      state.flashEffect = 10; // Trigger flash strobe
      
      // Fast fade-out streak word effect
      setTimeout(() => {
        setPerfectMessage("");
      }, 1500);
    } else {
      // Slice-off trim!
      state.streak = 0;
      setPerfectStreak(0);
      setPerfectMessage("");
      triggerSoundTrim();

      // Spawn nice falling particle details for the trimmed off segment
      const trimSize = current.width - overlapWidth;
      const isTrimRight = dropLeft > leftBound;
      const trimX = isTrimRight ? overlapRight : dropLeft;
      
      spawnTrimParticles(trimX, (canvasHeight - 60) - (state.score - state.cameraOffset) * rowHeight, trimSize, current.color);
    }

    // Push secure block level
    state.placedBlocks.push({
      y: state.score,
      x: placedX,
      width: placedWidth,
      color: isPerfect ? "#ffea00" : current.color
    });

    state.score += 1;
    setCurrentScore(state.score);

    // Dynamic difficulty: Scale speeds as stack climbs
    state.speed = Math.min(7.5, 3.8 + (state.score * 0.15) + (isPerfect ? 0.05 : 0));

    // Camera auto-scrolling: shift offset once blocks go above index 5
    if (state.score > 5) {
      state.cameraOffset = state.score - 5;
    }

    // Set up next row challenge
    state.currentBlock = {
      y: state.score,
      x: Math.random() > 0.5 ? 0 : canvasWidth - placedWidth,
      width: placedWidth,
      color: getNeonColorByRow(state.score),
      direction: Math.random() > 0.5 ? 1 : -1
    };

    if (!isPerfect) {
      triggerSoundStack();
    }
  };

  // End run and compute scoring mechanics
  const finishGame = () => {
    const finalScore = stateRef.current.score;
    setIsPlaying(false);

    // Update personal records
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem(`vapor_prize_hs_${gameId}`, finalScore.toString());
      triggerSoundVictory();
    }

    onGameOver(finalScore);
  };

  // Spawn visual feedback effects for trimmed fragments
  const spawnTrimParticles = (x: number, y: number, width: number, color: string) => {
    const state = stateRef.current;
    const count = Math.min(18, Math.max(5, Math.floor(width / 3)));
    
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x: x + (Math.random() * width),
        y: y + (Math.random() * 10),
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2 - 1, // slight pop up before drop
        width: Math.random() * 4 + 2,
        height: Math.random() * 6 + 3,
        color: color,
        alpha: 1.0
      });
    }
  };

  // Game Loop rendering ticks
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const state = stateRef.current;

      // Ensure crisp high-contrast CRT monitor aesthetic
      ctx.fillStyle = "#06040d";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 1. Draw cyberpunk background tech grids
      ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvasWidth; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasHeight);
        ctx.stroke();
      }
      for (let j = 0; j < canvasHeight; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvasWidth, j);
        ctx.stroke();
      }

      // Draw active horizontal guideline above baseline
      ctx.strokeStyle = "rgba(255, 0, 127, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight - 45);
      ctx.lineTo(canvasWidth, canvasHeight - 45);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Drive Horizontal Block Slider Movement
      if (state.gameState === "playing") {
        const curBlock = state.currentBlock;
        curBlock.x += curBlock.direction * state.speed;

        // Bounce back wall limits cleanly
        if (curBlock.x <= 0) {
          curBlock.x = 0;
          curBlock.direction = 1;
        } else if (curBlock.x + curBlock.width >= canvasWidth) {
          curBlock.x = canvasWidth - curBlock.width;
          curBlock.direction = -1;
        }
      }

      // 3. Render Static Placed Block Tower
      state.placedBlocks.forEach((block) => {
        const drawY = (canvasHeight - 65) - (block.y - state.cameraOffset) * rowHeight;
        if (drawY > -30 && drawY < canvasHeight) {
          // Inner glowing fill gradient
          const gradient = ctx.createLinearGradient(block.x, drawY, block.x, drawY + rowHeight - 4);
          gradient.addColorStop(0, block.color);
          gradient.addColorStop(1, adjustColorBrightness(block.color, -40));
          
          ctx.fillStyle = gradient;
          ctx.fillRect(block.x, drawY, block.width, rowHeight - 4);

          // Draw high-end vector borders
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(block.x, drawY, block.width, rowHeight - 4);
          
          // Outer neon bloom halo effect
          ctx.shadowColor = block.color;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.strokeRect(block.x, drawY, block.width, rowHeight - 4);
          ctx.shadowBlur = 0; // Reset shadow
        }
      });

      // 4. Render Active Floating Slider Block
      if (state.gameState === "playing") {
        const block = state.currentBlock;
        const drawY = (canvasHeight - 65) - (block.y - state.cameraOffset) * rowHeight;
        
        ctx.fillStyle = block.color;
        ctx.shadowColor = block.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(block.x, drawY, block.width, rowHeight - 4);
        
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x, drawY, block.width, rowHeight - 4);
        ctx.shadowBlur = 0; // Reset
      }

      // 5. Update and Draw Physic Trim Particles
      state.particles = state.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // gravity acceleration
        p.alpha -= 0.02; // slow fade

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(p.x, p.y, p.width, p.height);
        return p.alpha > 0;
      });
      ctx.globalAlpha = 1.0; // Reset globalAlpha

      // 6. Draw perfect hit flash strobe effect
      if (state.flashEffect > 0) {
        ctx.fillStyle = `rgba(255, 234, 0, ${state.flashEffect * 0.04})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        state.flashEffect -= 1;
      }

      // 7. Render Retro Arcade CRT Frame Details
      if (state.gameState === "unstarted") {
        // Welcoming Menu Overlay
        ctx.fillStyle = "rgba(6, 4, 13, 0.85)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.font = 'bold 20px "Orbitron", sans-serif';
        ctx.fillStyle = "#ff007f";
        ctx.textAlign = "center";
        ctx.fillText("NEON TOWER STACKER", canvasWidth / 2, canvasHeight / 2 - 45);

        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = "#00f0ff";
        ctx.fillText("ALIGN THE BLOCKS TO BUILD THE MASSIVE PYRAMID", canvasWidth / 2, canvasHeight / 2 - 15);

        ctx.font = '11px "Inter", sans-serif';
        ctx.fillStyle = "#a3a3c2";
        ctx.fillText("ALIGN PERFECTLY FOR BONUS ACCUMULATORS", canvasWidth / 2, canvasHeight / 2 + 15);

        if (hasTicket) {
          ctx.font = 'bold 13px "Orbitron", sans-serif';
          ctx.fillStyle = "#ffea00";
          ctx.fillText("TICKET ACTIVE! TAP START RUN BELOW", canvasWidth / 2, canvasHeight / 2 + 60);
        } else {
          ctx.font = 'bold 12px "Orbitron", sans-serif';
          ctx.fillStyle = "#ef4444";
          ctx.fillText(`ENTRY TICKET COST: $${entryFee.toFixed(2)}`, canvasWidth / 2, canvasHeight / 2 + 60);
          ctx.font = '11px "Inter", sans-serif';
          ctx.fillStyle = "#9e9e9e";
          ctx.fillText("BUY A COMPETITION ENTRY PASS TO INITIATE RUN", canvasWidth / 2, canvasHeight / 2 + 82);
        }
      } else if (state.gameState === "gameover") {
        // Game Over panel
        ctx.fillStyle = "rgba(6, 4, 13, 0.9)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.font = 'bold 32px "Orbitron", sans-serif';
        ctx.fillStyle = "#ef4444";
        ctx.textAlign = "center";
        ctx.fillText("RUN TERMINATED", canvasWidth / 2, canvasHeight / 2 - 50);

        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillStyle = "#00f0ff";
        ctx.fillText(`BLOCK HEIGHT SECURED: ${state.score} LEVELS`, canvasWidth / 2, canvasHeight / 2);

        ctx.font = '11px "Inter", sans-serif';
        ctx.fillStyle = "#a3a3c2";
        ctx.fillText("Your score is synced live. Check the ranking now!", canvasWidth / 2, canvasHeight / 2 + 35);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, hasTicket, entryFee, highScore, currentScore, isMuted]);

  // Handle Space key binding triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isPlaying) {
          handlePlaceBlock();
        } else if (hasTicket) {
          handleStartGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, hasTicket]);

  // Color generator sequence
  const getNeonColorByRow = (row: number): string => {
    const hue = (row * 15) % 360;
    return `hsl(${hue}, 100%, 55%)`;
  };

  // Helper adjustment for beautiful vector border gradient fills 
  const adjustColorBrightness = (hex: string, percent: number): string => {
    if (hex.startsWith("hsl")) return hex; // bypass HSL
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, R + percent));
    G = Math.max(0, Math.min(255, G + percent));
    B = Math.max(0, Math.min(255, B + percent));

    const rHex = R.toString(16).padStart(2, "0");
    const gHex = G.toString(16).padStart(2, "0");
    const bHex = B.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  };

  // Perfect block messages quotes generator
  const getPerfectQuote = (streak: number): string => {
    if (streak === 1) return "⚡ PERFECT ALIGNMENT!";
    if (streak === 2) return "🔥 DOUBLE STREAK!";
    if (streak === 3) return "🚀 MEGA PYRAMID STREAK!";
    return "👑 ULTIMATE STACK LORD!";
  };

  return (
    <div className="w-full flex flex-col items-center bg-neutral-900 border border-neutral-800 p-4 relative" id="stacker-game-frame">
      <div className="w-full flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-none animate-ping"></span>
          <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
            Interactive Cabinet
          </span>
        </div>
        
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-neutral-500 hover:text-white transition-colors p-1"
          title={isMuted ? "Unmute sound synthesized effects" : "Mute arcade audio"}
          id="audio-synth-toggle"
        >
          <Volume2 className={`w-4 h-4 ${isMuted ? "opacity-35 line-through" : "text-blue-500"}`} />
        </button>
      </div>

      {/* Screen Frame Container */}
      <div className="relative border-4 border-neutral-800 bg-[#06040d] overflow-hidden shadow-2xl scanlines">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={() => isPlaying && handlePlaceBlock()}
          className="cursor-pointer max-w-full block"
          id="arcade-stacker-canvas"
        />

        {/* Live Perfect Streak HUD */}
        {perfectMessage && (
          <div className="absolute top-4 left-0 right-0 text-center pointer-events-none animate-bounce" id="perfect-notion-banner">
            <span className="bg-yellow-400 text-black font-black text-xs px-3 py-1 uppercase tracking-widest leading-none shadow-md inline-block">
              {perfectMessage}
            </span>
          </div>
        )}

        {/* Real-time score indicator */}
        {isPlaying && (
          <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 border border-neutral-800 pointer-events-none" id="realtime-blocks-counter">
            <div className="text-[9px] font-bold text-neutral-400 uppercase leading-none mb-0.5">height</div>
            <div className="text-xl font-black text-blue-500 leading-none tabular-nums font-mono">{currentScore}</div>
          </div>
        )}

        {/* Real-time streak multiplier */}
        {isPlaying && perfectStreak > 0 && (
          <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 border border-yellow-500/30 pointer-events-none" id="realtime-combo-indicator">
            <div className="text-[9px] font-bold text-yellow-500 uppercase leading-none mb-0.5">combo</div>
            <div className="text-xl font-black text-yellow-400 leading-none font-mono">x{perfectStreak}</div>
          </div>
        )}
      </div>

      {/* Control Panel Area */}
      <div className="w-full mt-4 flex flex-col gap-2 relative">
        {!isPlaying ? (
          <button
            onClick={handleStartGame}
            disabled={!hasTicket}
            className={`w-full py-4 rounded-none font-black text-lg uppercase tracking-tighter flex items-center justify-center gap-3 transition-colors ${
              hasTicket
                ? "bg-white text-black hover:bg-blue-500 hover:text-white"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
            }`}
            id="start-level-play-btn"
          >
            <Play className="w-5 h-5 fill-current" />
            {hasTicket ? "INITIATE RUN" : `BUY TICKET TO PLAY ($${entryFee.toFixed(2)})`}
          </button>
        ) : (
          <button
            onClick={handlePlaceBlock}
            className="w-full bg-blue-600 text-white hover:bg-blue-500 py-5 rounded-none font-black text-xl uppercase tracking-tighter flex items-center justify-center gap-2 transition-transform active:scale-95"
            id="drop-active-block-btn"
          >
            <Zap className="w-5 h-5 fill-current text-yellow-400 animate-pulse" />
            DROP BLOCK [SPACEBAR]
          </button>
        )}

        {/* Keyboard instructions */}
        <div className="text-center text-[10px] text-neutral-500 font-mono mt-1 uppercase" id="kb-shortcuts-notion">
          Tip: You can press <span className="text-neutral-300 bg-neutral-800 px-1.5 py-0.5 font-bold">SPACEBAR</span> to Drop current sliding segments!
        </div>
      </div>
    </div>
  );
}
