"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBolt,
  IconTrophy,
  IconRotate2,
  IconCrown,
  IconClock,
  IconAlertTriangle,
  IconChevronRight,
  IconUser,
  IconFlag,
  IconArrowLeft,
  IconLoader2,
  IconVolume,
  IconVolumeOff,
  IconTarget,
  IconFlame,
  IconSparkles,
  IconGridDots,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { REACTION_QUIT_MOCKS, getRandomMock } from "@/lib/game-mocks";
import {
  playClickSound,
  playGoChime,
  playBuzzer,
  playCorrectChime,
  playFanfare,
} from "@/lib/sound-effects";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */
type GameMode = "classic" | "decoy" | "grid" | "survival";
type GameState = "idle" | "name" | "waiting" | "decoy-flash" | "go" | "grid-play" | "ready" | "too-early" | "result";

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  mode?: string;
  difficulty?: string;
  created_at: string;
}

const CLASSIC_ROUNDS = 5;
const MIN_DELAY = 1400;
const MAX_DELAY = 5200;

const DECOY_COLORS = [
  { bg: "bg-amber-500", text: "text-amber-950", label: "HOLD UP!", sub: "Not green yet" },
  { bg: "bg-blue-600", text: "text-blue-100", label: "STAY STILL!", sub: "Wait for green" },
  { bg: "bg-purple-600", text: "text-purple-100", label: "DON'T TAP!", sub: "False alarm" },
  { bg: "bg-orange-500", text: "text-orange-950", label: "WAIT FOR IT...", sub: "Stay focused" },
  { bg: "bg-rose-700", text: "text-rose-100", label: "NOT YET!", sub: "Watch closely" },
];

/* ------------------------------------------------------------------ */
/*  Leaderboard Component                                              */
/* ------------------------------------------------------------------ */
function Leaderboard({
  entries,
  loading,
  playerName,
  activeMode,
  onSelectMode,
}: {
  entries: LeaderboardEntry[];
  loading: boolean;
  playerName: string;
  activeMode: string;
  onSelectMode: (mode: string) => void;
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconTrophy size={16} className="text-amber-500" />
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Leaderboard</h3>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-5 overflow-x-auto">
        {[
          { id: "all", label: "All" },
          { id: "classic", label: "Classic" },
          { id: "decoy", label: "Decoy" },
          { id: "grid", label: "Grid" },
          { id: "survival", label: "Survival" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectMode(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
              activeMode === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <IconLoader2 size={24} className="text-blue-600 animate-spin mb-2" />
          <p className="text-xs font-medium text-gray-400">Loading scores...</p>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs font-medium text-gray-400 text-center py-10">No scores yet in this category. Be first!</p>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {entries.slice(0, 25).map((entry, i) => {
            const isMe = entry.player_name.toLowerCase() === playerName.toLowerCase();
            const isSurvival = entry.mode === "survival";
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isMe ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
                }`}
              >
                <span
                  className={`text-xs font-black w-5 text-center ${
                    i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"
                  }`}
                >
                  {i === 0 ? <IconCrown size={14} className="mx-auto" /> : i + 1}
                </span>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`text-xs font-bold truncate ${isMe ? "text-blue-600" : "text-gray-800"}`}>
                      {entry.player_name}
                    </span>
                    {entry.mode && entry.mode !== "classic" && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                        {entry.mode}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900 shrink-0">
                  {entry.score}{isSurvival ? " rounds" : "ms"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Reaction Speed Test Page                                      */
/* ------------------------------------------------------------------ */
export default function ReactionTestPage() {
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Round progression
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [falseStarts, setFalseStarts] = useState(0);

  // Decoy mode state
  const [activeDecoy, setActiveDecoy] = useState<(typeof DECOY_COLORS)[0] | null>(null);

  // Grid mode state (3x3)
  const [activeGridTarget, setActiveGridTarget] = useState<number | null>(null);
  const [gridScore, setGridScore] = useState(0);
  const [gridRound, setGridRound] = useState(0);
  const [gridTargetSpawnTime, setGridTargetSpawnTime] = useState(0);

  // Survival mode state
  const [survivalStreak, setSurvivalStreak] = useState(0);
  const [survivalThreshold, setSurvivalThreshold] = useState(380);

  // Leaderboard
  const [lbFilterMode, setLbFilterMode] = useState("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quit Taunt Modal
  const [showQuitMock, setShowQuitMock] = useState(false);
  const [quitMockMessage, setQuitMockMessage] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decoyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  /* Load sound & player preferences */
  useEffect(() => {
    const savedName = localStorage.getItem("spe_player_name");
    if (savedName) setPlayerName(savedName);
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
  const fetchLeaderboard = useCallback(async (modeParam = "all") => {
    try {
      setLbLoading(true);
      const url = `/api/leaderboard?game=reaction${modeParam !== "all" ? `&mode=${modeParam}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.entries) setLeaderboard(data.entries);
    } catch {
      console.error("Failed to fetch leaderboard");
    } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(lbFilterMode);
  }, [fetchLeaderboard, lbFilterMode]);

  /* Cleanup all active timers */
  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (decoyTimerRef.current) clearTimeout(decoyTimerRef.current);
    if (gridTimeoutRef.current) clearTimeout(gridTimeoutRef.current);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  /* ── Game Start Controllers ───────────────────────────── */
  const startGame = (mode: GameMode = selectedMode) => {
    setSelectedMode(mode);
    if (!playerName) {
      setGameState("name");
      setTimeout(() => nameInputRef.current?.focus(), 100);
      return;
    }
    clearAllTimers();
    setRound(0);
    setTimes([]);
    setCurrentTime(0);
    setBestTime(null);
    setFalseStarts(0);
    setSurvivalStreak(0);
    setSurvivalThreshold(380);
    setGridScore(0);
    setGridRound(0);
    setSubmitted(false);

    if (soundEnabled) playClickSound();

    if (mode === "grid") {
      startGridRound(1, 0, []);
    } else {
      startRound(mode, 0, []);
    }
  };

  const saveName = () => {
    const name = nameInput.trim();
    if (!name) return;
    setPlayerName(name);
    localStorage.setItem("spe_player_name", name);
    startGame(selectedMode);
  };

  /* ── Round Launchers ──────────────────────────────────── */
  const startRound = (mode: GameMode, currentRoundNum: number, currentTimes: number[]) => {
    clearAllTimers();
    setGameState("waiting");
    setActiveDecoy(null);

    const baseDelay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);

    if (mode === "decoy") {
      // Trigger 1-3 decoy flashes before real green
      const numDecoys = Math.floor(Math.random() * 3) + 1;
      let delayAccumulator = 600;

      for (let i = 0; i < numDecoys; i++) {
        const decoy = DECOY_COLORS[Math.floor(Math.random() * DECOY_COLORS.length)];
        const flashTime = delayAccumulator + 700 + Math.random() * 800;
        delayAccumulator = flashTime;

        decoyTimerRef.current = setTimeout(() => {
          setGameState("decoy-flash");
          setActiveDecoy(decoy);
          if (soundEnabled) playClickSound();

          setTimeout(() => {
            setGameState("waiting");
            setActiveDecoy(null);
          }, 450);
        }, flashTime);
      }

      timerRef.current = setTimeout(() => {
        setGameState("go");
        if (soundEnabled) playGoChime();
        startRef.current = performance.now();
      }, delayAccumulator + 1000 + Math.random() * 1200);
    } else {
      // Classic / Survival
      timerRef.current = setTimeout(() => {
        setGameState("go");
        if (soundEnabled) playGoChime();
        startRef.current = performance.now();
      }, baseDelay);
    }
  };

  /* ── Grid Mode Handlers ───────────────────────────────── */
  const startGridRound = (roundNum: number, currentGridScore: number, gridTimes: number[]) => {
    clearAllTimers();
    setGameState("grid-play");
    const targetIdx = Math.floor(Math.random() * 9);
    setActiveGridTarget(targetIdx);

    // Timeout shrinks per round
    const timeLimit = Math.max(280, 750 - roundNum * 50);
    setGridTargetSpawnTime(performance.now());

    if (soundEnabled) playGoChime();

    gridTimeoutRef.current = setTimeout(() => {
      // Missed target window
      if (soundEnabled) playBuzzer();
      handleGridEnd(currentGridScore, gridTimes);
    }, timeLimit);
  };

  const handleGridCellClick = (cellIdx: number) => {
    if (gameState !== "grid-play" || activeGridTarget === null) return;

    if (cellIdx === activeGridTarget) {
      // Hit!
      clearAllTimers();
      const elapsed = Math.round(performance.now() - gridTargetSpawnTime);
      const nextScore = gridScore + 1;
      const nextRound = gridRound + 1;
      const nextTimes = [...times, elapsed];

      setGridScore(nextScore);
      setGridRound(nextRound);
      setTimes(nextTimes);

      if (soundEnabled) playCorrectChime();

      if (nextRound >= 10) {
        // Complete 10 grid hits
        handleGridEnd(nextScore, nextTimes);
      } else {
        setTimeout(() => {
          startGridRound(nextRound + 1, nextScore, nextTimes);
        }, 200);
      }
    } else {
      // Misclick / False target
      clearAllTimers();
      if (soundEnabled) playBuzzer();
      handleGridEnd(gridScore, times);
    }
  };

  const handleGridEnd = (finalScore: number, finalTimes: number[]) => {
    clearAllTimers();
    const best = finalTimes.length > 0 ? Math.min(...finalTimes) : 999;
    setBestTime(best);
    setGameState("result");
    if (soundEnabled) playFanfare();
  };

  /* ── Tap Handler (Classic / Decoy / Survival) ─────────── */
  const handleTap = () => {
    if (gameState === "waiting" || gameState === "decoy-flash") {
      // Tapped prematurely!
      clearAllTimers();
      setFalseStarts((prev) => prev + 1);
      if (soundEnabled) playBuzzer();

      if (selectedMode === "survival") {
        // Survival ends on false start
        setGameState("result");
        return;
      }

      setGameState("too-early");
      return;
    }

    if (gameState === "go") {
      const elapsed = Math.round(performance.now() - startRef.current);
      setCurrentTime(elapsed);
      const newTimes = [...times, elapsed];
      setTimes(newTimes);
      const newRound = round + 1;
      setRound(newRound);

      if (soundEnabled) playCorrectChime();

      if (selectedMode === "survival") {
        if (elapsed <= survivalThreshold) {
          // Passed threshold
          const nextStreak = survivalStreak + 1;
          setSurvivalStreak(nextStreak);
          setSurvivalThreshold((prev) => Math.max(190, prev - 15));
          setGameState("ready");
        } else {
          // Failed threshold
          if (soundEnabled) playBuzzer();
          setBestTime(Math.min(...newTimes));
          setGameState("result");
        }
      } else if (newRound >= CLASSIC_ROUNDS) {
        const best = Math.min(...newTimes);
        setBestTime(best);
        setGameState("result");
        if (soundEnabled) playFanfare();
      } else {
        setGameState("ready");
      }
    }
  };

  const handleNextRound = () => {
    if (selectedMode === "grid") {
      startGridRound(gridRound + 1, gridScore, times);
    } else {
      startRound(selectedMode, round, times);
    }
  };

  const handleRetryEarly = () => {
    startRound(selectedMode, round, times);
  };

  const handleQuit = () => {
    clearAllTimers();
    setQuitMockMessage(getRandomMock(REACTION_QUIT_MOCKS));
    setShowQuitMock(true);
  };

  const closeQuitModal = () => {
    setShowQuitMock(false);
    setQuitMockMessage("");
    if (times.length > 0) {
      setBestTime(Math.min(...times));
      setGameState("result");
    } else {
      setGameState("idle");
    }
  };

  /* ── Submit Score ────────────────────────────────────── */
  const submitScore = async (finalScore: number) => {
    if (!finalScore || submitted || submitting) return;
    setSubmitting(true);
    try {
      const payloadScore = selectedMode === "survival" ? survivalStreak : finalScore;
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: "reaction",
          player_name: playerName,
          score: payloadScore,
          mode: selectedMode,
          difficulty: selectedMode === "decoy" ? "hard" : selectedMode === "grid" ? "expert" : "normal",
          details: {
            times,
            avg: Math.round(times.reduce((a, b) => a + b, 0) / (times.length || 1)),
            falseStarts,
          },
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
      await fetchLeaderboard(lbFilterMode);
    } catch {
      console.error("Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  };

  /* Auto submit on finish */
  useEffect(() => {
    if (gameState === "result" && bestTime && !submitted && !submitting) {
      submitScore(bestTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  /* ── Analytics & Rating ──────────────────────────────── */
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const consistencyStdDev =
    times.length > 1
      ? Math.round(
          Math.sqrt(
            times.reduce((sq, n) => sq + Math.pow(n - avgTime, 2), 0) / (times.length - 1)
          )
        )
      : 0;

  const getReflexTier = (ms: number) => {
    if (ms < 190) return { title: "⚡ F1 Driver Reflex", color: "text-amber-500", desc: "Top 0.1% superhuman speed." };
    if (ms < 230) return { title: "🥋 Ninja Reflex", color: "text-emerald-500", desc: "Top 2% elite human reaction." };
    if (ms < 270) return { title: "🏎️ Pro Racer", color: "text-blue-500", desc: "Top 10% exceptional twitch speed." };
    if (ms < 320) return { title: "🏃 Athlete", color: "text-indigo-500", desc: "Above average human baseline." };
    if (ms < 380) return { title: "🎮 Gamer", color: "text-gray-700", desc: "Average human benchmark." };
    if (ms < 450) return { title: "☕ Casual", color: "text-amber-700", desc: "Room to sharpen your focus." };
    return { title: "🐢 Sleeping Sloth", color: "text-rose-500", desc: "Did you blink?" };
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-24">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between mb-4">
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

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200">
                <IconBolt size={20} />
              </div>
              <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">SPE Arena Reflex Lab</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl mt-1">
              Reaction Speed Test
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-gray-400">
              Multiple reflex modes with distraction decoys, precision target grid, and sudden death survival.
              {playerName && (
                <span className="ml-2 text-gray-600">
                  Player: <span className="font-bold text-blue-600">{playerName}</span>
                  <button
                    onClick={() => { setGameState("name"); setTimeout(() => nameInputRef.current?.focus(), 100); }}
                    className="ml-1 text-[10px] text-gray-400 hover:text-blue-600 font-bold uppercase"
                  >
                    (edit)
                  </button>
                </span>
              )}
            </p>
          </motion.div>

          {/* Mode Selection Pills */}
          {gameState === "idle" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { id: "classic" as GameMode, label: "Classic 5R", icon: IconBolt, desc: "Standard 5 round reaction test" },
                { id: "decoy" as GameMode, label: "Decoy Chaos", icon: IconSparkles, desc: "False color flashes & bait alarms" },
                { id: "grid" as GameMode, label: "Target Grid", icon: IconGridDots, desc: "3x3 spatial reflex precision test" },
                { id: "survival" as GameMode, label: "Sudden Death", icon: IconFlame, desc: "Faster each round. 1 strike out!" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMode(m.id); if (soundEnabled) playClickSound(); }}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    selectedMode === m.id
                      ? "bg-white border-blue-600 ring-2 ring-blue-100 shadow-md"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <m.icon size={18} className={selectedMode === m.id ? "text-blue-600 mb-2" : "text-gray-400 mb-2"} />
                  <p className="text-xs font-black text-gray-900">{m.label}</p>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Game Area ── */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* IDLE STATE */}
                {gameState === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12 text-center shadow-sm"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-6">
                      <IconBolt size={36} className="text-rose-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                      {selectedMode === "classic" && "Classic Reflex Test"}
                      {selectedMode === "decoy" && "Decoy Color Chaos"}
                      {selectedMode === "grid" && "Precision Target Grid"}
                      {selectedMode === "survival" && "Sudden Death Survival"}
                    </h2>
                    <p className="text-sm font-medium text-gray-400 mb-8 max-w-md mx-auto">
                      {selectedMode === "classic" && "Wait for the screen to turn emerald green and tap immediately. 5 rounds to benchmark your reflexes."}
                      {selectedMode === "decoy" && "Beware of fake flashing colors! ONLY tap when the screen turns TRUE GREEN. Tapping on decoys counts as a strike."}
                      {selectedMode === "grid" && "Hit the green target as fast as possible across the 3x3 grid. The countdown shrinks every round."}
                      {selectedMode === "survival" && "The cutoff threshold drops every round. One reaction over the limit or one false start ends your run!"}
                    </p>
                    <button
                      onClick={() => startGame(selectedMode)}
                      className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                    >
                      Start Game ({selectedMode.toUpperCase()})
                    </button>
                  </motion.div>
                )}

                {/* NAME INPUT */}
                {gameState === "name" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                      <IconUser size={28} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Enter Your Player Name</h2>
                    <p className="text-sm font-medium text-gray-400 mb-6">Your best scores and reflex grade will be saved to the leaderboard.</p>
                    <div className="max-w-xs mx-auto space-y-4">
                      <input
                        ref={nameInputRef}
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value.slice(0, 30))}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        placeholder="e.g. SpeedDemon_UI"
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3.5 text-center text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        onClick={saveName}
                        disabled={!nameInput.trim()}
                        className="w-full px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Enter Arena
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* WAITING (Red) */}
                {gameState === "waiting" && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleTap}
                    className="relative bg-rose-600 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center cursor-pointer select-none overflow-hidden shadow-inner"
                    style={{ minHeight: 360 }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">
                        {selectedMode === "survival" ? `Streak: ${survivalStreak}` : `Round ${round + 1} / ${CLASSIC_ROUNDS}`}
                      </p>
                      <h2 className="text-3xl sm:text-5xl font-black text-white mb-2">Wait for Green...</h2>
                      <p className="text-sm font-bold text-white/60">Do not tap yet</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuit(); }}
                      className="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-xs font-bold text-white/80 hover:bg-white/30 transition-colors z-10"
                    >
                      <IconFlag size={12} />
                      I Quit
                    </button>
                  </motion.div>
                )}

                {/* DECOY FLASH (Chaos Distraction) */}
                {gameState === "decoy-flash" && activeDecoy && (
                  <motion.div
                    key="decoy"
                    initial={{ scale: 0.98, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleTap}
                    className={`relative ${activeDecoy.bg} rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center cursor-pointer select-none overflow-hidden`}
                    style={{ minHeight: 360 }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-2">DECOY ALERT</p>
                      <h2 className="text-4xl sm:text-6xl font-black text-white mb-2">{activeDecoy.label}</h2>
                      <p className={`text-sm font-black ${activeDecoy.text}`}>{activeDecoy.sub}</p>
                    </div>
                  </motion.div>
                )}

                {/* GO (Emerald Green) */}
                {gameState === "go" && (
                  <motion.div
                    key="go"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleTap}
                    className="relative bg-emerald-500 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center cursor-pointer select-none overflow-hidden shadow-lg"
                    style={{ minHeight: 360 }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-2">
                        {selectedMode === "survival" ? `Streak: ${survivalStreak}` : `Round ${round + 1} / ${CLASSIC_ROUNDS}`}
                      </p>
                      <h2 className="text-5xl sm:text-7xl font-black text-white mb-2 tracking-tight">TAP NOW!</h2>
                      <p className="text-sm font-bold text-white/70">As fast as you can</p>
                    </div>
                  </motion.div>
                )}

                {/* GRID MODE PLAY */}
                {gameState === "grid-play" && (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-6 sm:p-10"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <IconTarget size={18} className="text-blue-600" />
                        <span className="text-xs font-black text-gray-900 uppercase">Target {gridRound + 1} / 10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400">Score</span>
                        <span className="text-sm font-black text-blue-600">{gridScore} hits</span>
                      </div>
                    </div>

                    {/* 3x3 Grid */}
                    <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto aspect-square mb-4">
                      {Array.from({ length: 9 }).map((_, idx) => {
                        const isTarget = idx === activeGridTarget;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleGridCellClick(idx)}
                            className={`rounded-2xl transition-all flex items-center justify-center ${
                              isTarget
                                ? "bg-emerald-500 shadow-lg shadow-emerald-200 scale-105"
                                : "bg-gray-50 hover:bg-gray-100 border border-gray-100"
                            }`}
                          >
                            {isTarget ? (
                              <IconTarget size={36} className="text-white animate-pulse" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-gray-200" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* TOO EARLY */}
                {gameState === "too-early" && (
                  <motion.div
                    key="too-early"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-amber-500 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center text-white"
                    style={{ minHeight: 360 }}
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[260px]">
                      <IconAlertTriangle size={44} className="mb-4" />
                      <h2 className="text-3xl sm:text-4xl font-black mb-2">Too Early!</h2>
                      <p className="text-sm font-bold text-white/80 mb-6 max-w-xs">
                        False start recorded ({falseStarts} strike{falseStarts === 1 ? "" : "s"}). Wait for the green signal.
                      </p>
                      <button
                        onClick={handleRetryEarly}
                        className="px-6 py-3 rounded-2xl bg-white text-amber-600 text-sm font-bold hover:bg-amber-50 transition-colors shadow-md"
                      >
                        Try Again
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ROUND RESULT (between rounds) */}
                {gameState === "ready" && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12 text-center"
                    style={{ minHeight: 360 }}
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[260px]">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        {selectedMode === "survival" ? `Streak: ${survivalStreak} 🔥` : `Round ${round} / ${CLASSIC_ROUNDS}`}
                      </p>
                      <h2 className="text-5xl sm:text-7xl font-black text-gray-900 mb-2">
                        {currentTime}<span className="text-2xl text-gray-400">ms</span>
                      </h2>
                      <p className="text-sm font-bold text-gray-400 mb-6">{getReflexTier(currentTime).title}</p>

                      {/* History split */}
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {times.map((t, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600">
                            {t}ms
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleNextRound}
                          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                        >
                          Next Round
                          <IconChevronRight size={14} />
                        </button>
                        <button
                          onClick={handleQuit}
                          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-sm font-bold text-rose-500 hover:bg-rose-100 transition-colors"
                        >
                          <IconFlag size={14} />
                          I Quit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* FINAL RESULT */}
                {gameState === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12 shadow-sm"
                  >
                    <div className="text-center mb-8">
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mb-3">
                        {selectedMode.toUpperCase()} PERFORMANCE REPORT
                      </span>
                      <h2 className="text-4xl sm:text-6xl font-black text-gray-900 mb-2">
                        {bestTime || Math.min(...times, 999)}<span className="text-xl text-gray-400">ms</span>
                      </h2>
                      <div className="flex items-center justify-center gap-1.5 text-sm font-bold">
                        <span className={getReflexTier(bestTime || 300).color}>
                          {getReflexTier(bestTime || 300).title}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400">{getReflexTier(bestTime || 300).desc}</span>
                      </div>
                    </div>

                    {/* Breakdown Matrix */}
                    <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-4 sm:p-6 mb-8 text-center">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Best</p>
                        <p className="text-base sm:text-lg font-black text-emerald-600">{bestTime}ms</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Average</p>
                        <p className="text-base sm:text-lg font-black text-gray-700">{avgTime}ms</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Consistency</p>
                        <p className="text-base sm:text-lg font-black text-blue-600">±{consistencyStdDev}ms</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {submitting ? (
                        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold">
                          <IconLoader2 size={14} className="animate-spin" />
                          Submitting...
                        </div>
                      ) : submitted ? (
                        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold">
                          <IconTrophy size={14} />
                          Score Saved to Board
                        </div>
                      ) : (
                        <button
                          onClick={() => submitScore(bestTime!)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                        >
                          <IconTrophy size={14} />
                          Save Score
                        </button>
                      )}
                      <button
                        onClick={() => startGame(selectedMode)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                      >
                        <IconRotate2 size={14} />
                        Play Again
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Leaderboard Sidebar ── */}
            <div className="lg:col-span-1">
              <Leaderboard
                entries={leaderboard}
                loading={lbLoading}
                playerName={playerName}
                activeMode={lbFilterMode}
                onSelectMode={(m) => setLbFilterMode(m)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Quit Mock Modal */}
      <AnimatePresence>
        {showQuitMock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={closeQuitModal}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">🐔</div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Reflex Retreat?</h3>
              <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
                {quitMockMessage}
              </p>
              <button
                onClick={closeQuitModal}
                className="px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                {times.length > 0 ? "See Results" : "Back to Start"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
