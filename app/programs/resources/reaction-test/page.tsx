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
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { REACTION_QUIT_MOCKS, getRandomMock } from "@/lib/game-mocks";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */
type GameState = "idle" | "name" | "waiting" | "ready" | "go" | "result" | "too-early" | "leaderboard";

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

const ROUNDS = 5;
const MIN_DELAY = 1500;
const MAX_DELAY = 5000;

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
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Fastest Reactions</h3>
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
                <span className="text-sm font-black text-gray-900">{entry.score}ms</span>
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
export default function ReactionTestPage() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mock modal
  const [showQuitMock, setShowQuitMock] = useState(false);
  const [quitMockMessage, setQuitMockMessage] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  /* Load name from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("spe_player_name");
    if (saved) setPlayerName(saved);
  }, []);

  /* Fetch leaderboard */
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLbLoading(true);
      const res = await fetch("/api/leaderboard?game=reaction", { cache: "no-store" });
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

  /* Cleanup timer on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* ── Game Logic ──────────────────────────────────────── */
  const startGame = () => {
    if (!playerName) {
      setGameState("name");
      setTimeout(() => nameInputRef.current?.focus(), 100);
      return;
    }
    setRound(0);
    setTimes([]);
    setCurrentTime(0);
    setBestTime(null);
    setSubmitted(false);
    startRound();
  };

  const saveName = () => {
    const name = nameInput.trim();
    if (!name) return;
    setPlayerName(name);
    localStorage.setItem("spe_player_name", name);
    setRound(0);
    setTimes([]);
    setCurrentTime(0);
    setBestTime(null);
    setSubmitted(false);
    startRound();
  };

  const startRound = () => {
    setGameState("waiting");
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    timerRef.current = setTimeout(() => {
      setGameState("go");
      startRef.current = performance.now();
    }, delay);
  };

  const handleTap = () => {
    if (gameState === "waiting") {
      // Tapped too early
      if (timerRef.current) clearTimeout(timerRef.current);
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

      if (newRound >= ROUNDS) {
        const best = Math.min(...newTimes);
        setBestTime(best);
        setGameState("result");
      } else {
        setGameState("ready");
      }
    }
  };

  const handleNextRound = () => {
    startRound();
  };

  const handleRetryEarly = () => {
    startRound();
  };

  const handleQuit = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setQuitMockMessage(getRandomMock(REACTION_QUIT_MOCKS));
    setShowQuitMock(true);
  };

  const closeQuitModal = () => {
    setShowQuitMock(false);
    setQuitMockMessage("");
    // Go to result with whatever rounds they completed
    if (times.length > 0) {
      setBestTime(Math.min(...times));
      setGameState("result");
    } else {
      setGameState("idle");
    }
  };

  const submitScore = async (finalBest: number) => {
    if (!finalBest || submitted || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "reaction", player_name: playerName, score: finalBest }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
      await fetchLeaderboard();
    } catch {
      console.error("Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  };

  /* Auto-submit score when game ends */
  useEffect(() => {
    if (gameState === "result" && bestTime && !submitted && !submitting) {
      submitScore(bestTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  /* ── Computed ────────────────────────────────────────── */
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  const getReactionMessage = (ms: number) => {
    if (ms < 180) return "Superhuman";
    if (ms < 220) return "Insane reflexes";
    if (ms < 260) return "Lightning fast";
    if (ms < 300) return "Very quick";
    if (ms < 350) return "Above average";
    if (ms < 400) return "Average";
    if (ms < 500) return "Below average";
    return "Room for improvement";
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-24">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <Link
              href="/programs/resources"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors mb-4"
            >
              <IconArrowLeft size={14} />
              All Resources
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200">
                <IconBolt size={20} />
              </div>
              <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Reaction Speed Test</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              How Fast Are You?
            </h1>
            <p className="mt-3 max-w-xl text-base font-medium text-gray-400">
              {ROUNDS} rounds. Wait for green, tap as fast as you can. Your best time goes on the leaderboard.
              {playerName && (
                <span className="ml-2 text-gray-600">
                  Playing as <span className="font-bold text-blue-600">{playerName}</span>
                  <button
                    onClick={() => { setGameState("name"); setTimeout(() => nameInputRef.current?.focus(), 100); }}
                    className="ml-1 text-[10px] text-gray-400 hover:text-blue-600 font-bold uppercase"
                  >
                    (change)
                  </button>
                </span>
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Game Area ── */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* IDLE STATE */}
                {gameState === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12 text-center"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                      <IconBolt size={36} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Ready to Test Your Reflexes?</h2>
                    <p className="text-sm font-medium text-gray-400 mb-8 max-w-md mx-auto">
                      When the screen turns green, tap or click as fast as you can. You get {ROUNDS} rounds - your best time counts.
                    </p>
                    <button
                      onClick={startGame}
                      className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                      Start Game
                    </button>
                  </motion.div>
                )}

                {/* NAME INPUT */}
                {gameState === "name" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                      <IconUser size={28} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">What Should We Call You?</h2>
                    <p className="text-sm font-medium text-gray-400 mb-6">This name will appear on the leaderboard.</p>
                    <div className="max-w-xs mx-auto space-y-4">
                      <input
                        ref={nameInputRef}
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value.slice(0, 30))}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        placeholder="Enter your name"
                        className="w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-3.5 text-center text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-50"
                      />
                      <button
                        onClick={saveName}
                        disabled={!nameInput.trim()}
                        className="w-full px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Let&apos;s Go
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
                    className="relative bg-rose-600 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center cursor-pointer select-none overflow-hidden"
                    style={{ minHeight: 320 }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">Round {round + 1} / {ROUNDS}</p>
                      <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">Wait for Green...</h2>
                      <p className="text-sm font-bold text-white/50">Do not tap yet</p>
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

                {/* GO (Green) */}
                {gameState === "go" && (
                  <motion.div
                    key="go"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleTap}
                    className="relative bg-emerald-500 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center cursor-pointer select-none overflow-hidden"
                    style={{ minHeight: 320 }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">Round {round + 1} / {ROUNDS}</p>
                      <h2 className="text-4xl sm:text-6xl font-black text-white mb-2">TAP NOW!</h2>
                      <p className="text-sm font-bold text-white/60">As fast as you can</p>
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

                {/* TOO EARLY */}
                {gameState === "too-early" && (
                  <motion.div
                    key="too-early"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-amber-500 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center"
                    style={{ minHeight: 320 }}
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[240px]">
                      <IconAlertTriangle size={40} className="text-white mb-4" />
                      <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Too Early!</h2>
                      <p className="text-sm font-bold text-white/70 mb-6">Wait for the screen to turn green before tapping.</p>
                      <button
                        onClick={handleRetryEarly}
                        className="px-6 py-3 rounded-2xl bg-white text-amber-600 text-sm font-bold hover:bg-amber-50 transition-colors"
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12 text-center"
                    style={{ minHeight: 320 }}
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[240px]">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Round {round} / {ROUNDS}</p>
                      <h2 className="text-5xl sm:text-7xl font-black text-gray-900 mb-2">{currentTime}<span className="text-2xl text-gray-400">ms</span></h2>
                      <p className="text-sm font-bold text-gray-400 mb-6">{getReactionMessage(currentTime)}</p>

                      {/* Mini history */}
                      <div className="flex gap-2 mb-6">
                        {times.map((t, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-bold text-gray-500">
                            {t}ms
                          </span>
                        ))}
                        {Array.from({ length: ROUNDS - times.length }).map((_, i) => (
                          <span key={`empty-${i}`} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-bold text-gray-200">
                            ---
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleNextRound}
                          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12"
                  >
                    <div className="text-center mb-8">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Your Results</p>
                      <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-1">
                        {bestTime}<span className="text-xl text-gray-400">ms</span>
                      </h2>
                      <p className="text-sm font-bold text-gray-400">Best of {ROUNDS} - {getReactionMessage(bestTime!)}</p>
                    </div>

                    {/* All rounds */}
                    <div className="grid grid-cols-5 gap-2 mb-8">
                      {times.map((t, i) => {
                        const isBest = t === bestTime;
                        return (
                          <div
                            key={i}
                            className={`text-center py-3 rounded-xl ${
                              isBest ? "bg-blue-600 text-white" : "bg-gray-50"
                            }`}
                          >
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isBest ? "text-blue-200" : "text-gray-300"}`}>
                              R{i + 1}
                            </p>
                            <p className={`text-sm font-black ${isBest ? "text-white" : "text-gray-700"}`}>{t}ms</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Best</p>
                          <p className="text-lg font-black text-emerald-600">{bestTime}ms</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Average</p>
                          <p className="text-lg font-black text-gray-700">{avgTime}ms</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Worst</p>
                          <p className="text-lg font-black text-rose-500">{Math.max(...times)}ms</p>
                        </div>
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
                          Score Submitted
                        </div>
                      ) : (
                        <button
                          onClick={() => submitScore(bestTime!)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                          <IconTrophy size={14} />
                          Retry Submit
                        </button>
                      )}
                      <button
                        onClick={startGame}
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
              <Leaderboard entries={leaderboard} loading={lbLoading} playerName={playerName} />
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
              <h3 className="text-lg font-black text-gray-900 mb-2">Quitter!</h3>
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
