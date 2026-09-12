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
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  STACKER_COLLAPSE_MOCKS,
  STACKER_QUIT_MOCKS,
  getRandomMock,
} from "@/lib/game-mocks";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */
type GameState = "idle" | "name" | "playing" | "result";

interface Block {
  x: number;
  width: number;
  y: number;
}

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const INITIAL_BLOCK_WIDTH = 120;
const BLOCK_HEIGHT = 20;
const INITIAL_SPEED = 2.5;
const SPEED_INCREMENT = 0.15;
const MAX_SPEED = 8;
const BARREL_COLORS = [
  "#2563EB", "#3B82F6", "#1D4ED8", "#1E40AF",
  "#60A5FA", "#2563EB", "#1E3A8A", "#3B82F6",
  "#1D4ED8", "#2563EB", "#60A5FA", "#1E40AF",
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
        <p className="text-sm font-medium text-gray-300 text-center py-8">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm font-medium text-gray-300 text-center py-8">No scores yet. Be the first.</p>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 20).map((entry, i) => {
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
                <span className={`text-sm font-bold flex-grow ${isMe ? "text-blue-600" : "text-gray-700"}`}>
                  {entry.player_name}
                  {isMe && <span className="ml-1 text-[10px] text-blue-400">(you)</span>}
                </span>
                <span className="text-sm font-black text-gray-900">{entry.score}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function BarrelStackerPage() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [score, setScore] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mock modal
  const [showMock, setShowMock] = useState(false);
  const [mockMessage, setMockMessage] = useState("");
  const [mockType, setMockType] = useState<"collapse" | "quit">("collapse");

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Game state refs (mutable during animation loop)
  const blocksRef = useRef<Block[]>([]);
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

  /* Load name + best from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("spe_player_name");
    if (saved) setPlayerName(saved);
    const best = localStorage.getItem("spe_stacker_best");
    if (best) setBestScore(Number(best));
  }, []);

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

  /* ── Drawing ──────────────────────────────────────── */
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#F8FAFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid lines
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 0.5;
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    const camera = cameraOffsetRef.current;

    // Draw placed blocks
    blocksRef.current.forEach((block, i) => {
      const drawY = block.y - camera;
      if (drawY > CANVAS_HEIGHT + BLOCK_HEIGHT || drawY < -BLOCK_HEIGHT) return;
      const colorIdx = i % BARREL_COLORS.length;
      ctx.fillStyle = BARREL_COLORS[colorIdx];
      ctx.fillRect(block.x, drawY, block.width, BLOCK_HEIGHT);
      // Barrel bands
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(block.x, drawY + 2, block.width, 3);
      ctx.fillRect(block.x, drawY + BLOCK_HEIGHT - 5, block.width, 3);
      // Edge highlight
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(block.x, drawY, block.width, BLOCK_HEIGHT / 2);
      // Border
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      ctx.strokeRect(block.x, drawY, block.width, BLOCK_HEIGHT);
    });

    // Draw moving block
    if (!gameOverRef.current) {
      const mb = movingBlockRef.current;
      const blocks = blocksRef.current;
      const movingY = (blocks.length > 0 ? blocks[blocks.length - 1].y : CANVAS_HEIGHT - BLOCK_HEIGHT) - BLOCK_HEIGHT;
      const drawY = movingY - camera;
      const colorIdx = blocks.length % BARREL_COLORS.length;
      ctx.fillStyle = BARREL_COLORS[colorIdx];
      ctx.fillRect(mb.x, drawY, mb.width, BLOCK_HEIGHT);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(mb.x, drawY + 2, mb.width, 3);
      ctx.fillRect(mb.x, drawY + BLOCK_HEIGHT - 5, mb.width, 3);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(mb.x, drawY, mb.width, BLOCK_HEIGHT / 2);
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      ctx.strokeRect(mb.x, drawY, mb.width, BLOCK_HEIGHT);
    }

    // Score overlay
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.font = "bold 80px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(scoreRef.current), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28);
  }, []);

  /* ── Game Loop ──────────────────────────────────────── */
  const gameLoop = useCallback(() => {
    if (gameOverRef.current) return;

    const mb = movingBlockRef.current;
    mb.x += speedRef.current * mb.direction;

    // Bounce off canvas edges
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

  /* ── Place block ──────────────────────────────────── */
  const placeBlock = useCallback(() => {
    if (gameOverRef.current || gameState !== "playing") return;

    const mb = movingBlockRef.current;
    const blocks = blocksRef.current;
    const blockCount = blocks.length;

    let newX: number;
    let newWidth: number;

    if (blockCount === 0) {
      // First block - just place it
      newX = mb.x;
      newWidth = mb.width;
    } else {
      const prev = blocks[blockCount - 1];
      const overlapStart = Math.max(mb.x, prev.x);
      const overlapEnd = Math.min(mb.x + mb.width, prev.x + prev.width);
      newWidth = overlapEnd - overlapStart;

      if (newWidth <= 0) {
        // Complete miss - game over
        gameOverRef.current = true;
        cancelAnimationFrame(animRef.current);

        const finalScore = scoreRef.current;
        setScore(finalScore);

        // Update best
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          localStorage.setItem("spe_stacker_best", String(finalScore));
        }

        // Show mock then result
        setMockType("collapse");
        setMockMessage(getRandomMock(STACKER_COLLAPSE_MOCKS));
        setShowMock(true);
        return;
      }

      newX = overlapStart;

      // Perfect placement bonus (within 2px tolerance)
      const diff = Math.abs(mb.x - prev.x);
      if (diff <= 2 && Math.abs(mb.width - prev.width) <= 2) {
        // Perfect - snap to previous block exactly and add bonus width
        newX = prev.x;
        newWidth = prev.width;
        perfectRef.current += 1;
        setPerfectCount(perfectRef.current);
      }
    }

    const newY = blockCount > 0
      ? blocks[blockCount - 1].y - BLOCK_HEIGHT
      : CANVAS_HEIGHT - BLOCK_HEIGHT;

    blocks.push({ x: newX, width: newWidth, y: newY });
    scoreRef.current += 1;
    setScore(scoreRef.current);

    // Camera: scroll up once stack gets tall
    const targetCameraOffset = Math.max(0, (CANVAS_HEIGHT - BLOCK_HEIGHT) - newY - CANVAS_HEIGHT * 0.6);
    cameraOffsetRef.current = targetCameraOffset;

    // Speed up
    speedRef.current = Math.min(INITIAL_SPEED + scoreRef.current * SPEED_INCREMENT, MAX_SPEED);

    // Next moving block
    movingBlockRef.current = {
      x: 0,
      width: newWidth,
      direction: scoreRef.current % 2 === 0 ? 1 : -1,
    };
  }, [gameState, bestScore]);

  /* ── Start / Reset ──────────────────────────────────── */
  const startGame = () => {
    if (!playerName) {
      setGameState("name");
      setTimeout(() => nameInputRef.current?.focus(), 100);
      return;
    }
    resetAndPlay();
  };

  const resetAndPlay = () => {
    blocksRef.current = [];
    scoreRef.current = 0;
    perfectRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    gameOverRef.current = false;
    cameraOffsetRef.current = 0;
    movingBlockRef.current = {
      x: 0,
      width: INITIAL_BLOCK_WIDTH,
      direction: 1,
    };
    setScore(0);
    setPerfectCount(0);
    setSubmitted(false);
    setGameState("playing");
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
  };

  /* ── Canvas click/tap ──────────────────────────────── */
  const handleCanvasInteraction = useCallback(() => {
    placeBlock();
  }, [placeBlock]);

  /* ── Keyboard support ──────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameState === "playing" && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        placeBlock();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, placeBlock]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  /* ── Score tier label ──────────────────────────────── */
  const getTier = (s: number) => {
    if (s >= 50) return { label: "Legendary", color: "text-amber-500" };
    if (s >= 35) return { label: "Master Stacker", color: "text-violet-600" };
    if (s >= 25) return { label: "Expert", color: "text-blue-600" };
    if (s >= 15) return { label: "Skilled", color: "text-emerald-600" };
    if (s >= 8) return { label: "Getting There", color: "text-orange-500" };
    if (s >= 3) return { label: "Beginner", color: "text-gray-500" };
    return { label: "Better luck next time", color: "text-gray-400" };
  };

  const tier = getTier(score);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-28 pb-24 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-24">
          {/* Back link */}
          <Link
            href="/programs/resources"
            className="inline-flex items-center gap-1.5 text-xs font-black text-gray-300 uppercase tracking-widest hover:text-blue-600 transition-colors mb-8"
          >
            <IconArrowLeft size={14} /> Resources
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Left column: Game ──────────────────────── */}
            <div className="flex-grow max-w-xl mx-auto lg:mx-0 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-6 sm:p-10"
              >
                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <IconLayersIntersect size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-gray-900">Barrel Stacker</h1>
                    <p className="text-xs font-bold text-gray-400">Tap to stack. Don't miss.</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {/* ── Idle ── */}
                  {gameState === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-10"
                    >
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 mb-4">
                          <IconLayersIntersect size={36} className="text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">
                          Stack the Barrels
                        </h2>
                        <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                          Oil barrels slide across the screen. Tap or press space to drop each one.
                          Misaligned parts get sliced off. One miss and it's over.
                        </p>
                        {bestScore > 0 && (
                          <p className="mt-3 text-xs font-black text-blue-600 uppercase tracking-widest">
                            Personal Best: {bestScore}
                          </p>
                        )}
                      </div>

                      {playerName && (
                        <p className="text-xs font-bold text-gray-400 mb-4">
                          Playing as <span className="text-blue-600">{playerName}</span>
                          <button
                            onClick={() => setGameState("name")}
                            className="ml-2 text-blue-400 hover:text-blue-600 underline"
                          >
                            change
                          </button>
                        </p>
                      )}

                      <button
                        onClick={startGame}
                        className="px-10 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 active:scale-95 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          Start Stacking <IconChevronRight size={16} />
                        </span>
                      </button>
                    </motion.div>
                  )}

                  {/* ── Name Entry ── */}
                  {gameState === "name" && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-10"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
                        <IconUser size={28} className="text-blue-600" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">What's Your Name?</h3>
                      <p className="text-sm font-medium text-gray-400 mb-6">
                        This appears on the leaderboard.
                      </p>
                      <div className="max-w-xs mx-auto">
                        <input
                          ref={nameInputRef}
                          type="text"
                          maxLength={30}
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveName()}
                          placeholder="Enter your name"
                          className="w-full text-center text-lg font-bold rounded-2xl border border-gray-200 px-6 py-4 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                        />
                        <button
                          onClick={saveName}
                          disabled={!nameInput.trim()}
                          className="mt-4 w-full px-6 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40"
                        >
                          Let's Go
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Playing ── */}
                  {gameState === "playing" && (
                    <motion.div
                      key="playing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Score bar */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-gray-900">{score}</span>
                          {perfectCount > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider">
                              {perfectCount} perfect
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleQuit}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-gray-300 uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <IconFlag size={12} /> Quit
                        </button>
                      </div>

                      {/* Canvas */}
                      <div
                        className="relative rounded-2xl overflow-hidden border border-gray-100 cursor-pointer select-none"
                        onClick={handleCanvasInteraction}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handleCanvasInteraction();
                        }}
                      >
                        <canvas
                          ref={canvasRef}
                          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                          className="block mx-auto"
                        />
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            Tap or press Space to drop
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Result ── */}
                  {gameState === "result" && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-8"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 mb-4">
                        <IconLayersIntersect size={36} className="text-blue-600" />
                      </div>

                      <div className="mb-2">
                        <p className={`text-xs font-black uppercase tracking-widest ${tier.color}`}>
                          {tier.label}
                        </p>
                      </div>

                      <p className="text-6xl font-black text-gray-900 mb-1">{score}</p>
                      <p className="text-sm font-bold text-gray-400 mb-6">barrels stacked</p>

                      <div className="flex justify-center gap-6 mb-8">
                        <div className="text-center">
                          <p className="text-lg font-black text-gray-900">{perfectCount}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Perfect</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-gray-900">{bestScore}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Best</p>
                        </div>
                      </div>

                      {submitting && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <IconLoader2 size={14} className="animate-spin text-blue-600" />
                          <span className="text-xs font-bold text-gray-400">Saving score...</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={resetAndPlay}
                          className="px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          <span className="flex items-center gap-2 justify-center">
                            <IconRotate2 size={16} /> Play Again
                          </span>
                        </button>
                        <button
                          onClick={() => setGameState("idle")}
                          className="px-8 py-4 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-gray-200 active:scale-95 transition-all"
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

      {/* ── Mock Modal ──────────────────────────────────── */}
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
