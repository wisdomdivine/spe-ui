"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconTrophy,
  IconRotate2,
  IconCrown,
  IconChevronRight,
  IconUser,
  IconFlag,
  IconArrowLeft,
  IconLoader2,
  IconLayersIntersect,
  IconVolume,
  IconVolumeOff,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  STACKER_COLLAPSE_MOCKS,
  STACKER_QUIT_MOCKS,
  getRandomMock,
} from "@/lib/game-mocks";
import {
  playClickSound,
  playCorrectChime,
  playBuzzer,
  playFanfare,
} from "@/lib/sound-effects";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */
type GameState = "idle" | "name" | "playing" | "result";

interface Block {
  x: number;
  width: number;
  y: number;
  colorIdx: number;
}

interface FallingPiece {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  opacity: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  scale: number;
}

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 520;
const PLATFORM_HEIGHT = 50;
const INITIAL_BLOCK_WIDTH = 150;
const BLOCK_HEIGHT = 24;
const INITIAL_SPEED = 2.4;
const SPEED_INCREMENT = 0.12;
const MAX_SPEED = 7.5;

const BARREL_PALETTES = [
  { main: "#2563EB", top: "#3B82F6", dark: "#1D4ED8", band: "rgba(255,255,255,0.25)" },
  { main: "#0284C7", top: "#38BDF8", dark: "#0369A1", band: "rgba(255,255,255,0.25)" },
  { main: "#0D9488", top: "#2DD4BF", dark: "#0F766E", band: "rgba(255,255,255,0.25)" },
  { main: "#4F46E5", top: "#818CF8", dark: "#3730A3", band: "rgba(255,255,255,0.25)" },
  { main: "#7C3AED", top: "#A78BFA", dark: "#5B21B6", band: "rgba(255,255,255,0.25)" },
  { main: "#EA580C", top: "#FB923C", dark: "#C2410C", band: "rgba(255,255,255,0.25)" },
  { main: "#D97706", top: "#FBBF24", dark: "#B45309", band: "rgba(255,255,255,0.25)" },
  { main: "#16A34A", top: "#4ADE80", dark: "#15803D", band: "rgba(255,255,255,0.25)" },
];

/* ------------------------------------------------------------------ */
/*  Leaderboard Component                                              */
/* ------------------------------------------------------------------ */
function Leaderboard({
  entries,
  loading,
  playerName,
}: {
  entries: LeaderboardEntry[];
  loading: boolean;
  playerName: string;
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <IconTrophy size={16} className="text-amber-500" />
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Top Stackers</h3>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <IconLoader2 size={24} className="text-blue-600 animate-spin mb-2" />
          <p className="text-xs font-medium text-gray-400">Loading scores...</p>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm font-medium text-gray-300 text-center py-8">No scores yet. Be the first.</p>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {entries.slice(0, 25).map((entry, i) => {
            const isMe = entry.player_name.toLowerCase() === playerName.toLowerCase();
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isMe ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
                }`}
              >
                <span
                  className={`text-xs font-black w-6 text-center ${
                    i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"
                  }`}
                >
                  {i === 0 ? <IconCrown size={14} className="mx-auto" /> : i + 1}
                </span>
                <span className={`text-sm font-bold flex-grow truncate ${isMe ? "text-blue-600" : "text-gray-700"}`}>
                  {entry.player_name}
                  {isMe && <span className="ml-1 text-[10px] text-blue-400">(you)</span>}
                </span>
                <span className="text-sm font-black text-gray-900 shrink-0">{entry.score}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Barrel Stacker Page                                           */
/* ------------------------------------------------------------------ */
export default function BarrelStackerPage() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [score, setScore] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mock taunt modal
  const [showMock, setShowMock] = useState(false);
  const [mockMessage, setMockMessage] = useState("");
  const [mockType, setMockType] = useState<"collapse" | "quit">("collapse");

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const lastDropTimeRef = useRef<number>(0);

  // Game state refs (mutable inside requestAnimationFrame loop)
  const blocksRef = useRef<Block[]>([]);
  const fallingPiecesRef = useRef<FallingPiece[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const movingBlockRef = useRef<{ x: number; width: number; direction: number }>({
    x: 0,
    width: INITIAL_BLOCK_WIDTH,
    direction: 1,
  });
  const speedRef = useRef(INITIAL_SPEED);
  const scoreRef = useRef(0);
  const perfectRef = useRef(0);
  const gameOverRef = useRef(false);
  const cameraOffsetRef = useRef(0);
  const targetCameraOffsetRef = useRef(0);

  /* Load name, best score, sound preferences */
  useEffect(() => {
    const saved = localStorage.getItem("spe_player_name");
    if (saved) setPlayerName(saved);
    const best = localStorage.getItem("spe_stacker_best");
    if (best) setBestScore(Number(best));
    const savedSound = localStorage.getItem("spe_game_sound");
    if (savedSound !== null) setSoundEnabled(savedSound === "true");
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("spe_game_sound", String(next));
      if (next) playClickSound();
      return next;
    });
  };

  /* Fetch leaderboard */
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLbLoading(true);
      const res = await fetch("/api/leaderboard?game=stacker", { cache: "no-store" });
      const data = await res.json();
      if (data.entries) setLeaderboard(data.entries);
    } catch {
      console.error("Failed to fetch leaderboard");
    } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  /* Submit score to leaderboard */
  const submitScore = useCallback(
    async (finalScore: number) => {
      if (submitted || submitting || finalScore < 1) return;
      setSubmitting(true);
      try {
        await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            game: "stacker",
            player_name: playerName,
            score: finalScore,
          }),
        });
        setSubmitted(true);
        fetchLeaderboard();
      } catch {
        console.error("Failed to submit score");
      } finally {
        setSubmitting(false);
      }
    },
    [playerName, submitted, submitting, fetchLeaderboard]
  );

  /* ── Canvas Rendering ──────────────────────────────── */
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    // Smooth camera lerp
    cameraOffsetRef.current += (targetCameraOffsetRef.current - cameraOffsetRef.current) * 0.12;
    const camera = cameraOffsetRef.current;

    // Sky / Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, "#F1F5F9");
    bgGrad.addColorStop(1, "#E2E8F0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Faint grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 0.5;
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // ── 1. Draw Offshore Deck Base Platform ──
    const platformY = CANVAS_HEIGHT - PLATFORM_HEIGHT - camera;
    if (platformY < CANVAS_HEIGHT) {
      // Steel deck body
      const deckGrad = ctx.createLinearGradient(0, platformY, 0, platformY + PLATFORM_HEIGHT);
      deckGrad.addColorStop(0, "#334155");
      deckGrad.addColorStop(1, "#1E293B");
      ctx.fillStyle = deckGrad;
      ctx.fillRect(0, platformY, CANVAS_WIDTH, PLATFORM_HEIGHT + 100);

      // Warning hazard stripes across deck top rim
      const stripeWidth = 16;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, platformY, CANVAS_WIDTH, 8);
      ctx.clip();
      for (let sx = -30; sx < CANVAS_WIDTH + 30; sx += stripeWidth * 2) {
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.moveTo(sx, platformY);
        ctx.lineTo(sx + stripeWidth, platformY);
        ctx.lineTo(sx, platformY + 8);
        ctx.lineTo(sx - stripeWidth, platformY + 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Platform text label
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SPE OFFSHORE RIG DECK", CANVAS_WIDTH / 2, platformY + 28);
    }

    // ── 2. Draw Placed Barrels ──
    blocksRef.current.forEach((block) => {
      const drawY = block.y - camera;
      if (drawY > CANVAS_HEIGHT + BLOCK_HEIGHT || drawY < -BLOCK_HEIGHT) return;

      const pal = BARREL_PALETTES[block.colorIdx % BARREL_PALETTES.length];

      // Barrel Body
      const barrelGrad = ctx.createLinearGradient(block.x, drawY, block.x + block.width, drawY);
      barrelGrad.addColorStop(0, pal.dark);
      barrelGrad.addColorStop(0.3, pal.top);
      barrelGrad.addColorStop(0.7, pal.main);
      barrelGrad.addColorStop(1, pal.dark);
      ctx.fillStyle = barrelGrad;

      // Rounded rectangle for smooth barrel edges
      ctx.beginPath();
      ctx.roundRect(block.x, drawY, block.width, BLOCK_HEIGHT, 4);
      ctx.fill();

      // Barrel Metallic Ribs (3 bands)
      ctx.fillStyle = pal.band;
      ctx.fillRect(block.x, drawY + 3, block.width, 2.5);
      ctx.fillRect(block.x, drawY + BLOCK_HEIGHT / 2 - 1, block.width, 2.5);
      ctx.fillRect(block.x, drawY + BLOCK_HEIGHT - 5.5, block.width, 2.5);

      // Top sheen highlight
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(block.x + 2, drawY + 1, block.width - 4, BLOCK_HEIGHT / 3);

      // Subtle stroke
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // ── 3. Draw Falling Debris Pieces ──
    const remainingPieces: FallingPiece[] = [];
    fallingPiecesRef.current.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.55; // gravity
      piece.rotation += piece.vRot;
      piece.opacity = Math.max(0, piece.opacity - 0.015);

      const drawY = piece.y - camera;
      if (drawY < CANVAS_HEIGHT + 100 && piece.opacity > 0) {
        remainingPieces.push(piece);

        ctx.save();
        ctx.translate(piece.x + piece.width / 2, drawY + piece.height / 2);
        ctx.rotate(piece.rotation);
        ctx.globalAlpha = piece.opacity;
        ctx.fillStyle = piece.color;
        ctx.beginPath();
        ctx.roundRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height, 3);
        ctx.fill();
        ctx.restore();
      }
    });
    fallingPiecesRef.current = remainingPieces;

    // ── 4. Draw Moving Barrel ──
    if (!gameOverRef.current) {
      const mb = movingBlockRef.current;
      const blocks = blocksRef.current;
      const topBlock = blocks[blocks.length - 1];
      const movingY = topBlock ? topBlock.y - BLOCK_HEIGHT : CANVAS_HEIGHT - PLATFORM_HEIGHT - BLOCK_HEIGHT * 2;
      const drawY = movingY - camera;

      const pal = BARREL_PALETTES[blocks.length % BARREL_PALETTES.length];

      const barrelGrad = ctx.createLinearGradient(mb.x, drawY, mb.x + mb.width, drawY);
      barrelGrad.addColorStop(0, pal.dark);
      barrelGrad.addColorStop(0.3, pal.top);
      barrelGrad.addColorStop(0.7, pal.main);
      barrelGrad.addColorStop(1, pal.dark);
      ctx.fillStyle = barrelGrad;

      ctx.beginPath();
      ctx.roundRect(mb.x, drawY, mb.width, BLOCK_HEIGHT, 4);
      ctx.fill();

      // Ribs
      ctx.fillStyle = pal.band;
      ctx.fillRect(mb.x, drawY + 3, mb.width, 2.5);
      ctx.fillRect(mb.x, drawY + BLOCK_HEIGHT / 2 - 1, mb.width, 2.5);
      ctx.fillRect(mb.x, drawY + BLOCK_HEIGHT - 5.5, mb.width, 2.5);

      // Top sheen
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(mb.x + 2, drawY + 1, mb.width - 4, BLOCK_HEIGHT / 3);

      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── 5. Draw Floating Text Particles ──
    const remainingTexts: FloatingText[] = [];
    floatingTextsRef.current.forEach((ft) => {
      ft.y -= 1.2;
      ft.opacity -= 0.02;
      if (ft.opacity > 0) {
        remainingTexts.push(ft);
        ctx.save();
        ctx.globalAlpha = ft.opacity;
        ctx.fillStyle = ft.color;
        ctx.font = "bold 16px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y - camera);
        ctx.restore();
      }
    });
    floatingTextsRef.current = remainingTexts;

    // ── 6. Large Background Score Counter ──
    ctx.fillStyle = "rgba(15, 23, 42, 0.07)";
    ctx.font = "bold 96px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(scoreRef.current), CANVAS_WIDTH / 2, 120);
  }, []);

  /* ── Animation Loop ────────────────────────────────── */
  const gameLoop = useCallback(() => {
    if (gameOverRef.current) return;

    const mb = movingBlockRef.current;
    mb.x += speedRef.current * mb.direction;

    // Bounce off canvas walls
    if (mb.x + mb.width >= CANVAS_WIDTH) {
      mb.x = CANVAS_WIDTH - mb.width;
      mb.direction = -1;
    } else if (mb.x <= 0) {
      mb.x = 0;
      mb.direction = 1;
    }

    drawGame();
    animRef.current = requestAnimationFrame(gameLoop);
  }, [drawGame]);

  /* ── Place Block (Drop Action) ─────────────────────── */
  const placeBlock = useCallback(() => {
    if (gameOverRef.current || gameState !== "playing") return;

    // Prevent micro-spam double drops
    const now = performance.now();
    if (now - lastDropTimeRef.current < 90) return;
    lastDropTimeRef.current = now;

    const mb = movingBlockRef.current;
    const blocks = blocksRef.current;
    if (blocks.length === 0) return;

    const prev = blocks[blocks.length - 1];

    // Compute overlap with previous placed barrel
    const overlapStart = Math.max(mb.x, prev.x);
    const overlapEnd = Math.min(mb.x + mb.width, prev.x + prev.width);
    let overlapWidth = overlapEnd - overlapStart;

    const colorIdx = blocks.length % BARREL_PALETTES.length;
    const pal = BARREL_PALETTES[colorIdx];

    if (overlapWidth <= 0) {
      // Complete Miss -> Collapse!
      gameOverRef.current = true;
      cancelAnimationFrame(animRef.current);

      if (soundEnabled) playBuzzer();

      // Create a falling debris piece of the entire missed moving block
      fallingPiecesRef.current.push({
        x: mb.x,
        y: prev.y - BLOCK_HEIGHT,
        width: mb.width,
        height: BLOCK_HEIGHT,
        color: pal.main,
        vx: mb.direction * 3,
        vy: 2,
        rotation: 0,
        vRot: mb.direction * 0.08,
        opacity: 1,
      });

      drawGame();

      const finalScore = scoreRef.current;
      setScore(finalScore);

      if (finalScore > bestScore) {
        setBestScore(finalScore);
        localStorage.setItem("spe_stacker_best", String(finalScore));
      }

      setMockType("collapse");
      setMockMessage(getRandomMock(STACKER_COLLAPSE_MOCKS));
      setTimeout(() => setShowMock(true), 400);
      return;
    }

    // Check Perfect Placement (within 3.5px tolerance)
    let placedX = overlapStart;
    const diff = Math.abs(mb.x - prev.x);
    const isPerfect = diff <= 3.5 && Math.abs(mb.width - prev.width) <= 4;

    if (isPerfect) {
      // Perfect alignment! Snap to previous width and reward player
      placedX = prev.x;
      overlapWidth = prev.width;
      perfectRef.current += 1;
      setPerfectCount(perfectRef.current);

      if (soundEnabled) playCorrectChime();

      floatingTextsRef.current.push({
        id: Date.now() + Math.random(),
        text: `PERFECT! +${perfectRef.current > 1 ? `${perfectRef.current}x` : "1"}`,
        x: placedX + overlapWidth / 2,
        y: prev.y - BLOCK_HEIGHT - 5,
        color: "#F59E0B",
        opacity: 1,
        scale: 1,
      });
    } else {
      perfectRef.current = 0;
      setPerfectCount(0);
      if (soundEnabled) playClickSound();

      // Spawn falling slice piece for the trimmed overhang
      if (mb.x < prev.x) {
        // Left overhang sliced off
        const sliceWidth = prev.x - mb.x;
        fallingPiecesRef.current.push({
          x: mb.x,
          y: prev.y - BLOCK_HEIGHT,
          width: sliceWidth,
          height: BLOCK_HEIGHT,
          color: pal.main,
          vx: -1.5,
          vy: 1,
          rotation: 0,
          vRot: -0.06,
          opacity: 1,
        });
      } else if (mb.x + mb.width > prev.x + prev.width) {
        // Right overhang sliced off
        const sliceWidth = mb.x + mb.width - (prev.x + prev.width);
        fallingPiecesRef.current.push({
          x: prev.x + prev.width,
          y: prev.y - BLOCK_HEIGHT,
          width: sliceWidth,
          height: BLOCK_HEIGHT,
          color: pal.main,
          vx: 1.5,
          vy: 1,
          rotation: 0,
          vRot: 0.06,
          opacity: 1,
        });
      }
    }

    const newY = prev.y - BLOCK_HEIGHT;
    blocks.push({
      x: placedX,
      width: overlapWidth,
      y: newY,
      colorIdx,
    });

    scoreRef.current += 1;
    setScore(scoreRef.current);

    // Camera follow: glide up once stack passes 40% height of screen
    const targetCamera = Math.max(0, (CANVAS_HEIGHT - PLATFORM_HEIGHT - 220) - newY);
    targetCameraOffsetRef.current = targetCamera;

    // Progressive speed scaling
    speedRef.current = Math.min(INITIAL_SPEED + scoreRef.current * SPEED_INCREMENT, MAX_SPEED);

    // Spawn next moving block from opposite side
    const nextDir = scoreRef.current % 2 === 0 ? 1 : -1;
    movingBlockRef.current = {
      x: nextDir === 1 ? 0 : CANVAS_WIDTH - overlapWidth,
      width: overlapWidth,
      direction: nextDir,
    };
  }, [gameState, bestScore, drawGame, soundEnabled]);

  /* ── Start / Reset Game State ──────────────────────── */
  const startGame = () => {
    if (!playerName) {
      setGameState("name");
      setTimeout(() => nameInputRef.current?.focus(), 100);
      return;
    }
    resetAndPlay();
  };

  const resetAndPlay = () => {
    // Initialize base platform barrel (Block 0)
    const baseBarrelX = (CANVAS_WIDTH - INITIAL_BLOCK_WIDTH) / 2;
    const baseBarrelY = CANVAS_HEIGHT - PLATFORM_HEIGHT - BLOCK_HEIGHT;

    blocksRef.current = [
      {
        x: baseBarrelX,
        width: INITIAL_BLOCK_WIDTH,
        y: baseBarrelY,
        colorIdx: 0,
      },
    ];

    fallingPiecesRef.current = [];
    floatingTextsRef.current = [];
    scoreRef.current = 0;
    perfectRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    gameOverRef.current = false;
    cameraOffsetRef.current = 0;
    targetCameraOffsetRef.current = 0;

    // Moving block starts above Block 0
    movingBlockRef.current = {
      x: 0,
      width: INITIAL_BLOCK_WIDTH,
      direction: 1,
    };

    setScore(0);
    setPerfectCount(0);
    setSubmitted(false);
    setGameState("playing");

    if (soundEnabled) playClickSound();

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(gameLoop);
  };

  const saveName = () => {
    const name = nameInput.trim();
    if (!name) return;
    setPlayerName(name);
    localStorage.setItem("spe_player_name", name);
    resetAndPlay();
  };

  const handleQuit = () => {
    gameOverRef.current = true;
    cancelAnimationFrame(animRef.current);
    const finalScore = scoreRef.current;
    setScore(finalScore);

    if (finalScore > bestScore) {
      setBestScore(finalScore);
      localStorage.setItem("spe_stacker_best", String(finalScore));
    }

    if (finalScore > 0) {
      setMockType("quit");
      setMockMessage(getRandomMock(STACKER_QUIT_MOCKS));
      setShowMock(true);
    } else {
      setGameState("idle");
    }
  };

  const dismissMock = () => {
    setShowMock(false);
    const finalScore = scoreRef.current;
    setGameState("result");
    if (finalScore >= 1 && playerName) {
      submitScore(finalScore);
    }
    if (soundEnabled && finalScore >= 5) {
      playFanfare();
    }
  };

  /* ── Keyboard Support (<Space>, <Enter>, <ArrowDown>) ─ */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameState === "playing" && (e.code === "Space" || e.code === "Enter" || e.code === "ArrowDown")) {
        e.preventDefault();
        placeBlock();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, placeBlock]);

  /* Cleanup animation on unmount */
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  /* ── Tier Grading ─────────────────────────────────── */
  const getTier = (s: number) => {
    if (s >= 50) return { label: "⚡ Legendary Stacker", color: "text-amber-500" };
    if (s >= 35) return { label: "🏆 Master Engineer", color: "text-violet-600" };
    if (s >= 25) return { label: "🎯 Precision Pro", color: "text-blue-600" };
    if (s >= 15) return { label: "🛢️ Skilled Rig Hand", color: "text-emerald-600" };
    if (s >= 8) return { label: "🔧 Getting Warmed Up", color: "text-orange-500" };
    if (s >= 3) return { label: "Apprentice", color: "text-gray-500" };
    return { label: "Better luck next time", color: "text-gray-400" };
  };

  const tier = getTier(score);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-28 pb-24 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-24">
          {/* Header controls */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/programs/resources"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
            >
              <IconArrowLeft size={14} />
              All Resources
            </Link>
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            >
              {soundEnabled ? <IconVolume size={14} className="text-blue-600" /> : <IconVolumeOff size={14} className="text-gray-400" />}
              <span>{soundEnabled ? "Sound ON" : "Muted"}</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Left column: Game Screen ───────────────── */}
            <div className="flex-grow max-w-xl mx-auto lg:mx-0 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-6 sm:p-10 shadow-sm"
              >
                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <IconLayersIntersect size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-gray-900">Barrel Stacker</h1>
                    <p className="text-xs font-bold text-gray-400">Offshore Rig Stacking Challenge</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {/* ── 1. Idle Screen ── */}
                  {gameState === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="text-center py-8"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 mb-4">
                        <IconLayersIntersect size={36} className="text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">
                        Stack Oil Barrels to the Sky
                      </h2>
                      <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed mb-6">
                        Oil barrels slide across the rig deck. Tap or press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono font-bold text-gray-700">Space</kbd> to drop each one.
                        Misaligned overhangs get sliced off.
                      </p>

                      {bestScore > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-black text-blue-600 mb-6">
                          <IconCrown size={14} className="text-amber-500" />
                          Personal Best: {bestScore} Barrels
                        </div>
                      )}

                      {playerName && (
                        <p className="text-xs font-bold text-gray-400 mb-6">
                          Player: <span className="text-blue-600 font-bold">{playerName}</span>
                          <button
                            onClick={() => setGameState("name")}
                            className="ml-2 text-blue-400 hover:text-blue-600 underline font-bold"
                          >
                            change
                          </button>
                        </p>
                      )}

                      <div>
                        <button
                          onClick={startGame}
                          className="px-10 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            Start Stacking <IconChevronRight size={16} />
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── 2. Name Entry ── */}
                  {gameState === "name" && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="text-center py-8"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
                        <IconUser size={28} className="text-blue-600" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">What&apos;s Your Name?</h3>
                      <p className="text-sm font-medium text-gray-400 mb-6">
                        Your highest barrel tower will be recorded on the leaderboard.
                      </p>
                      <div className="max-w-xs mx-auto">
                        <input
                          ref={nameInputRef}
                          type="text"
                          maxLength={30}
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveName()}
                          placeholder="e.g. MasterDriller"
                          className="w-full text-center text-base font-bold rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"
                        />
                        <button
                          onClick={saveName}
                          disabled={!nameInput.trim()}
                          className="mt-4 w-full px-6 py-3.5 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40"
                        >
                          Enter Rig
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── 3. Active Gameplay ── */}
                  {gameState === "playing" && (
                    <motion.div
                      key="playing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Live Score Bar */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-gray-400 uppercase">Height:</span>
                            <span className="text-2xl font-black text-gray-900">{score}</span>
                          </div>
                          {perfectCount > 0 && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-wider">
                              <IconSparkles size={12} />
                              {perfectCount}x combo
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleQuit}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                          <IconFlag size={14} /> Quit
                        </button>
                      </div>

                      {/* Interactive Canvas Container */}
                      <div
                        className="relative rounded-2xl overflow-hidden border border-gray-200 cursor-pointer select-none shadow-sm"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          placeBlock();
                        }}
                      >
                        <canvas
                          ref={canvasRef}
                          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                          className="block mx-auto max-w-full"
                        />
                        <div className="absolute top-3 left-0 right-0 text-center pointer-events-none">
                          <span className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest">
                            Tap anywhere to drop
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── 4. Result Screen ── */}
                  {gameState === "result" && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="text-center py-6"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 mb-3">
                        <IconLayersIntersect size={36} className="text-blue-600" />
                      </div>

                      <div className="mb-2">
                        <p className={`text-xs font-black uppercase tracking-widest ${tier.color}`}>
                          {tier.label}
                        </p>
                      </div>

                      <p className="text-5xl sm:text-6xl font-black text-gray-900 mb-1">{score}</p>
                      <p className="text-sm font-bold text-gray-400 mb-6">Barrels Successfully Stacked</p>

                      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto bg-gray-50 rounded-2xl p-4 mb-6">
                        <div className="text-center">
                          <p className="text-lg font-black text-amber-500">{perfectCount}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Perfect Snaps</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-blue-600">{bestScore}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Personal Best</p>
                        </div>
                      </div>

                      {submitting && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <IconLoader2 size={14} className="animate-spin text-blue-600" />
                          <span className="text-xs font-bold text-gray-400">Saving score to leaderboard...</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={resetAndPlay}
                          className="px-8 py-3.5 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          <span className="flex items-center gap-2 justify-center">
                            <IconRotate2 size={16} /> Play Again
                          </span>
                        </button>
                        <button
                          onClick={() => setGameState("idle")}
                          className="px-8 py-3.5 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-200 active:scale-95 transition-all"
                        >
                          Menu
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ── Right column: Leaderboard ──────────────── */}
            <div className="w-full lg:w-80 shrink-0">
              <Leaderboard entries={leaderboard} loading={lbLoading} playerName={playerName} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Collapse Taunt Modal ──────────────────────────── */}
      <AnimatePresence>
        {showMock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl"
            >
              <p className="text-5xl mb-4">
                {mockType === "collapse" ? "💥" : "🏳️"}
              </p>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                {mockType === "collapse" ? "Stack Collapsed!" : "Gave Up?"}
              </h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
                {mockMessage}
              </p>
              <button
                onClick={dismissMock}
                className="px-8 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
              >
                See Results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
