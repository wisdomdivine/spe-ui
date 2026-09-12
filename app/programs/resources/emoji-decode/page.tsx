"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMoodSmile,
  IconTrophy,
  IconRotate2,
  IconCrown,
  IconClock,
  IconBulb,
  IconCheck,
  IconX,
  IconChevronRight,
  IconUser,
  IconSparkles,
  IconFlag,
  IconArrowLeft,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  EMOJI_PUZZLES,
  shufflePuzzles,
  checkAnswer,
  getHint,
  type EmojiPuzzle,
} from "@/lib/emoji-data";
import {
  QUIT_MOCKS,
  WRONG_MOCKS,
  TIMEOUT_MOCKS,
  getRandomMock,
} from "@/lib/game-mocks";

/* ── Category prompt mapping ── */
const CATEGORY_PROMPT: Record<string, string> = {
  Movies: "Guess the Movie",
  "TV Shows": "Guess the TV Show",
  Songs: "Guess the Song",
  Countries: "Guess the Country",
  Foods: "Guess the Food",
  Phrases: "Guess the Phrase",
  "Nigerian Culture": "Guess the Nigerian Reference",
  Sports: "Guess the Sport",
  Animals: "Guess the Animal",
  Books: "Guess the Book",
  Occupations: "Guess the Occupation",
  Landmarks: "Guess the Landmark",
};

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */
type GameState = "idle" | "name" | "playing" | "result";
type MockType = "wrong" | "quit" | "timeout" | null;

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

const GAME_DURATION = 60; // seconds

/* ------------------------------------------------------------------ */
/*  Timer Bar                                                          */
/* ------------------------------------------------------------------ */
function TimerBar({ secondsLeft, total }: { secondsLeft: number; total: number }) {
  const pct = (secondsLeft / total) * 100;
  const urgent = secondsLeft <= 10;
  return (
    <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-colors duration-500 ${
          urgent ? "bg-rose-500" : "bg-blue-600"
        }`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

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
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Top Decoders</h3>
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
                <span className="text-sm font-black text-gray-900">{entry.score} pts</span>
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
export default function EmojiDecodePage() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");

  // Game state
  const [puzzles, setPuzzles] = useState<EmojiPuzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [answer, setAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [skippedOrWrong, setSkippedOrWrong] = useState(0);

  // Mock modal
  const [mockType, setMockType] = useState<MockType>(null);
  const [mockMessage, setMockMessage] = useState("");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Load name from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("spe_player_name");
    if (saved) setPlayerName(saved);
  }, []);

  /* Fetch leaderboard */
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLbLoading(true);
      const res = await fetch("/api/leaderboard?game=emoji", { cache: "no-store" });
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

  /* Timer */
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setMockMessage(getRandomMock(TIMEOUT_MOCKS));
            setMockType("timeout");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, timeLeft]);

  /* ── Game Logic ──────────────────────────────────────── */
  const startGame = () => {
    if (!playerName) {
      setGameState("name");
      setTimeout(() => nameInputRef.current?.focus(), 100);
      return;
    }
    setPuzzles(shufflePuzzles(EMOJI_PUZZLES));
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setAnswer("");
    setHintsUsed(0);
    setStreak(0);
    setMaxStreak(0);
    setShowCorrect(false);
    setShowWrong(false);
    setSkippedOrWrong(0);
    setSubmitted(false);
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const saveName = () => {
    const name = nameInput.trim();
    if (!name) return;
    setPlayerName(name);
    localStorage.setItem("spe_player_name", name);
    setPuzzles(shufflePuzzles(EMOJI_PUZZLES));
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setAnswer("");
    setHintsUsed(0);
    setStreak(0);
    setMaxStreak(0);
    setShowCorrect(false);
    setShowWrong(false);
    setSkippedOrWrong(0);
    setSubmitted(false);
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const currentPuzzle = puzzles[currentIndex] || null;

  const handleSubmitAnswer = () => {
    if (!currentPuzzle || !answer.trim()) return;

    if (checkAnswer(currentPuzzle, answer)) {
      // Correct - points: 10 base + streak bonus (max 5)
      const bonus = Math.min(streak, 5);
      setScore((s) => s + 10 + bonus);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setShowCorrect(true);
      setTimeout(() => {
        setShowCorrect(false);
        setCurrentIndex((i) => i + 1);
        setAnswer("");
        setHintsUsed(0);
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 600);
    } else {
      // Wrong - show mock
      setStreak(0);
      setSkippedOrWrong((s) => s + 1);
      setMockMessage(getRandomMock(WRONG_MOCKS));
      setMockType("wrong");
    }
  };

  const handleSkip = () => {
    setStreak(0);
    setSkippedOrWrong((s) => s + 1);
    setCurrentIndex((i) => i + 1);
    setAnswer("");
    setHintsUsed(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleHint = () => {
    setHintsUsed((h) => h + 1);
  };

  const handleQuit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMockMessage(getRandomMock(QUIT_MOCKS));
    setMockType("quit");
  };

  const closeMockModal = () => {
    const wasQuit = mockType === "quit";
    const wasTimeout = mockType === "timeout";
    setMockType(null);
    setMockMessage("");
    if (wasQuit || wasTimeout) {
      setGameState("result");
    } else {
      // wrong answer - resume play
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const submitScore = async (finalScore: number) => {
    if (submitted || submitting || finalScore === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "emoji", player_name: playerName, score: finalScore }),
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
    if (gameState === "result" && score > 0 && !submitted && !submitting) {
      submitScore(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  /* Check if ran out of puzzles */
  useEffect(() => {
    if (gameState === "playing" && currentIndex >= puzzles.length && puzzles.length > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState("result");
    }
  }, [currentIndex, puzzles.length, gameState]);

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
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                <IconMoodSmile size={20} />
              </div>
              <p className="text-[11px] font-black text-violet-600 uppercase tracking-widest">Emoji Decode</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Crack the Emoji Code
            </h1>
            <p className="mt-3 max-w-xl text-base font-medium text-gray-400">
              {GAME_DURATION} seconds. Decode as many emoji puzzles as you can. Streaks give bonus points.
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
                      <IconMoodSmile size={36} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Guess What the Emojis Mean</h2>
                    <p className="text-sm font-medium text-gray-400 mb-3 max-w-md mx-auto">
                      You have {GAME_DURATION} seconds to decode as many emoji puzzles as you can. Movies, songs, countries, foods, phrases, and more.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                      <span className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-[11px] font-bold border border-violet-100">10 pts per correct</span>
                      <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-[11px] font-bold border border-amber-100">Streak bonuses</span>
                      <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">140 puzzles</span>
                    </div>
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
                    <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-6">
                      <IconUser size={28} className="text-violet-600" />
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
                        className="w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-3.5 text-center text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-violet-200 focus:ring-2 focus:ring-violet-50"
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

                {/* PLAYING */}
                {gameState === "playing" && currentPuzzle && (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-6 sm:p-10 relative overflow-hidden"
                  >
                    {/* Flash overlays */}
                    <AnimatePresence>
                      {showCorrect && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center z-10 rounded-[2rem] sm:rounded-[3rem]"
                        >
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                            <IconCheck size={32} className="text-white" />
                          </motion.div>
                        </motion.div>
                      )}
                      {showWrong && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-rose-500/10 flex items-center justify-center z-10 rounded-[2rem] sm:rounded-[3rem]"
                        >
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center">
                            <IconX size={32} className="text-white" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Timer + Score bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <IconClock size={14} className={`${timeLeft <= 10 ? "text-rose-500" : "text-gray-400"}`} />
                            <span className={`text-xs font-black font-mono ${timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-gray-500"}`}>
                              {timeLeft}s
                            </span>
                          </div>
                          {streak >= 2 && (
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
                              <IconSparkles size={12} className="text-amber-500" />
                              <span className="text-[10px] font-black text-amber-600">{streak}x STREAK</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-gray-400 uppercase">Score</span>
                          <span className="text-sm font-black text-blue-600">{score}</span>
                        </div>
                      </div>
                      <TimerBar secondsLeft={timeLeft} total={GAME_DURATION} />
                    </div>

                    {/* Puzzle */}
                    <div className="text-center mb-6">
                      <span className="inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-violet-50 text-violet-600 border border-violet-100 mb-4">
                        {CATEGORY_PROMPT[currentPuzzle.category] ?? currentPuzzle.category}
                      </span>
                      <motion.div
                        key={currentPuzzle.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl sm:text-7xl py-6 select-none"
                      >
                        {currentPuzzle.emojis}
                      </motion.div>

                      {/* Hint */}
                      {hintsUsed > 0 && (
                        <p className="text-lg font-mono font-bold text-gray-400 tracking-[0.3em] mb-2">
                          {getHint(currentPuzzle.answer, hintsUsed)}
                        </p>
                      )}
                    </div>

                    {/* Input row */}
                    <div className="flex gap-2 mb-4">
                      <input
                        ref={inputRef}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                        placeholder="Type your answer..."
                        className="flex-grow rounded-xl bg-gray-50 border border-gray-100 px-4 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-50"
                        autoComplete="off"
                        autoCapitalize="off"
                      />
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!answer.trim()}
                        className="px-5 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        <IconChevronRight size={18} />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={handleHint}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors"
                      >
                        <IconBulb size={14} />
                        Hint ({hintsUsed}/3)
                      </button>
                      <button
                        onClick={handleSkip}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Skip
                        <IconChevronRight size={14} />
                      </button>
                      <button
                        onClick={handleQuit}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-300 hover:text-rose-500 transition-colors"
                      >
                        <IconFlag size={14} />
                        I Quit
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* RESULT */}
                {gameState === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12"
                  >
                    <div className="text-center mb-8">
                      <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-2">
                        {timeLeft > 0 ? "You Quit" : "Time\u2019s Up"}
                      </p>
                      <h2 className="text-5xl sm:text-6xl font-black text-gray-900 mb-2">
                        {score}<span className="text-xl text-gray-400"> pts</span>
                      </h2>
                      <p className="text-sm font-bold text-gray-400">
                        {score === 0
                          ? "Better luck next time"
                          : score < 30
                            ? "Decent start"
                            : score < 60
                              ? "Not bad at all"
                              : score < 100
                                ? "Sharp mind"
                                : score < 150
                                  ? "Impressive run"
                                  : "Legendary"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 mb-8">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Decoded</p>
                          <p className="text-lg font-black text-emerald-600">{currentIndex - skippedOrWrong}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Best Streak</p>
                          <p className="text-lg font-black text-amber-600">{maxStreak}x</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Skipped</p>
                          <p className="text-lg font-black text-gray-500">{skippedOrWrong}</p>
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
                      ) : score > 0 ? (
                        <button
                          onClick={() => submitScore(score)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                          <IconTrophy size={14} />
                          Retry Submit
                        </button>
                      ) : null}
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

      {/* Mock/Taunt Modal */}
      <AnimatePresence>
        {mockType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={closeMockModal}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">
                {mockType === "wrong" ? "😬" : mockType === "quit" ? "🐔" : "⏰"}
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                {mockType === "wrong" ? "Nope!" : mockType === "quit" ? "Quitter!" : "Time\u2019s Up!"}
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
                {mockMessage}
              </p>
              <button
                onClick={closeMockModal}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  mockType === "wrong"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {mockType === "wrong" ? "Try Again" : "See Results"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
