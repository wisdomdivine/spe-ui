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
  IconVolume,
  IconVolumeOff,
  IconFlame,
  IconKeyboard,
  IconFilter,
  IconBackspace,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  EMOJI_PUZZLES,
  CATEGORIES,
  shufflePuzzles,
  checkAnswer,
  getHint,
  getScrambledLetters,
  type EmojiPuzzle,
} from "@/lib/emoji-data";
import {
  QUIT_MOCKS,
  WRONG_MOCKS,
  TIMEOUT_MOCKS,
  getRandomMock,
} from "@/lib/game-mocks";
import {
  playClickSound,
  playTickSound,
  playBuzzer,
  playCorrectChime,
  playFanfare,
} from "@/lib/sound-effects";

/* ── Category prompt mapping ── */
const CATEGORY_PROMPT: Record<string, string> = {
  "Petroleum & Energy": "SPE Trivia: Energy & Petro Engineering",
  "Nigerian Culture": "Naija Culture & Slang",
  Movies: "Guess the Movie",
  "TV Shows": "Guess the TV Show",
  Songs: "Guess the Song",
  Countries: "Guess the Country",
  Foods: "Guess the Food",
  Phrases: "Guess the Idiom / Phrase",
  Sports: "Guess the Sport",
  Animals: "Guess the Animal Reference",
  Books: "Guess the Book / Tale",
  Occupations: "Guess the Profession",
  Landmarks: "Guess the Global Landmark",
  "Science & Tech": "Science & Technology",
};

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */
type GameMode = "blitz" | "hardcore" | "domain";
type GameState = "idle" | "name" | "playing" | "result";
type MockType = "wrong" | "quit" | "timeout" | null;

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  mode?: string;
  created_at: string;
}

const BLITZ_DURATION = 60; // seconds
const HARDCORE_START = 15; // seconds per puzzle

/* ------------------------------------------------------------------ */
/*  Timer Bar                                                          */
/* ------------------------------------------------------------------ */
function TimerBar({ secondsLeft, total }: { secondsLeft: number; total: number }) {
  const pct = Math.min(100, (secondsLeft / total) * 100);
  const urgent = secondsLeft <= 10;
  return (
    <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-colors duration-300 ${
          urgent ? "bg-rose-500 animate-pulse" : "bg-violet-600"
        }`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.25 }}
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
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Decoders Board</h3>
        </div>
      </div>

      {/* Mode filters */}
      <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-5 overflow-x-auto">
        {[
          { id: "all", label: "All" },
          { id: "blitz", label: "Blitz 60s" },
          { id: "hardcore", label: "Hardcore" },
          { id: "domain", label: "Category" },
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
          <IconLoader2 size={24} className="text-violet-600 animate-spin mb-2" />
          <p className="text-xs font-medium text-gray-400">Loading rankings...</p>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs font-medium text-gray-400 text-center py-10">No scores recorded yet. Be the first!</p>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {entries.slice(0, 25).map((entry, i) => {
            const isMe = entry.player_name.toLowerCase() === playerName.toLowerCase();
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isMe ? "bg-violet-50 border border-violet-100" : "bg-gray-50"
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
                    <span className={`text-xs font-bold truncate ${isMe ? "text-violet-600" : "text-gray-800"}`}>
                      {entry.player_name}
                    </span>
                    {entry.mode && entry.mode !== "blitz" && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                        {entry.mode}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900 shrink-0">{entry.score} pts</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Emoji Decode Page                                             */
/* ------------------------------------------------------------------ */
export default function EmojiDecodePage() {
  const [selectedMode, setSelectedMode] = useState<GameMode>("blitz");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showLetterTray, setShowLetterTray] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");

  // Game flow
  const [puzzles, setPuzzles] = useState<EmojiPuzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BLITZ_DURATION);
  const [maxTime, setMaxTime] = useState(BLITZ_DURATION);
  const [answer, setAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [strikes, setStrikes] = useState(0); // For hardcore mode (3 strikes out)
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [skippedOrWrong, setSkippedOrWrong] = useState(0);

  // Scrambled letters for active puzzle
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);

  // Mock taunts modal
  const [mockType, setMockType] = useState<MockType>(null);
  const [mockMessage, setMockMessage] = useState("");

  // Leaderboard
  const [lbFilterMode, setLbFilterMode] = useState("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Load preferences */
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
      const url = `/api/leaderboard?game=emoji${modeParam !== "all" ? `&mode=${modeParam}` : ""}`;
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

  /* Timer Tick */
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1 && soundEnabled) {
            playTickSound(true);
          }
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (soundEnabled) playBuzzer();

            if (selectedMode === "hardcore") {
              const newStrikes = strikes + 1;
              setStrikes(newStrikes);
              if (newStrikes >= 3) {
                setMockMessage(getRandomMock(TIMEOUT_MOCKS));
                setMockType("timeout");
                return 0;
              } else {
                // Next puzzle with fresh 15s timer
                handleNextPuzzleAdvance();
                return HARDCORE_START;
              }
            } else {
              setMockMessage(getRandomMock(TIMEOUT_MOCKS));
              setMockType("timeout");
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, timeLeft, selectedMode, strikes, soundEnabled]);

  /* ── Game Start Controllers ───────────────────────────── */
  const startGame = (mode: GameMode = selectedMode) => {
    setSelectedMode(mode);
    if (!playerName) {
      setGameState("name");
      setTimeout(() => nameInputRef.current?.focus(), 100);
      return;
    }

    let puzzleDeck = [...EMOJI_PUZZLES];
    if (mode === "domain" && selectedCategory !== "All") {
      puzzleDeck = puzzleDeck.filter((p) => p.category === selectedCategory);
    }

    const shuffled = shufflePuzzles(puzzleDeck);
    setPuzzles(shuffled);
    setCurrentIndex(0);
    setScore(0);

    const initialTime = mode === "hardcore" ? HARDCORE_START : BLITZ_DURATION;
    setTimeLeft(initialTime);
    setMaxTime(initialTime);

    setAnswer("");
    setHintsUsed(0);
    setStreak(0);
    setMaxStreak(0);
    setStrikes(0);
    setShowCorrect(false);
    setShowWrong(false);
    setSkippedOrWrong(0);
    setSubmitted(false);

    if (shuffled.length > 0) {
      setScrambledLetters(getScrambledLetters(shuffled[0].answer));
    }

    if (soundEnabled) playClickSound();
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const saveName = () => {
    const name = nameInput.trim();
    if (!name) return;
    setPlayerName(name);
    localStorage.setItem("spe_player_name", name);
    startGame(selectedMode);
  };

  const currentPuzzle = puzzles[currentIndex] || null;

  /* ── Answer Validation ────────────────────────────────── */
  const handleSubmitAnswer = () => {
    if (!currentPuzzle || !answer.trim()) return;

    if (checkAnswer(currentPuzzle, answer)) {
      // Correct!
      if (soundEnabled) playCorrectChime();

      // Points calculation: Base 10 + Streak bonus + Category difficulty bonus
      const bonus = Math.min(streak, 6);
      const diffBonus = currentPuzzle.difficulty === "expert" ? 8 : currentPuzzle.difficulty === "hard" ? 5 : 2;
      setScore((s) => s + 10 + bonus + diffBonus);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setShowCorrect(true);

      // Hardcore mode bonus time
      if (selectedMode === "hardcore") {
        setTimeLeft((prev) => Math.min(25, prev + 5));
      }

      setTimeout(() => {
        setShowCorrect(false);
        handleNextPuzzleAdvance();
      }, 550);
    } else {
      // Incorrect!
      if (soundEnabled) playBuzzer();
      setStreak(0);
      setSkippedOrWrong((s) => s + 1);

      if (selectedMode === "hardcore") {
        const nextStrikes = strikes + 1;
        setStrikes(nextStrikes);
        if (nextStrikes >= 3) {
          if (timerRef.current) clearInterval(timerRef.current);
          setMockMessage(getRandomMock(WRONG_MOCKS));
          setMockType("wrong");
          return;
        }
      }

      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 500);
      setMockMessage(getRandomMock(WRONG_MOCKS));
      setMockType("wrong");
    }
  };

  const handleNextPuzzleAdvance = () => {
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setAnswer("");
    setHintsUsed(0);

    if (puzzles[nextIdx]) {
      setScrambledLetters(getScrambledLetters(puzzles[nextIdx].answer));
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSkip = () => {
    if (soundEnabled) playClickSound();
    setStreak(0);
    setSkippedOrWrong((s) => s + 1);

    if (selectedMode === "hardcore") {
      const nextStrikes = strikes + 1;
      setStrikes(nextStrikes);
      if (nextStrikes >= 3) {
        if (timerRef.current) clearInterval(timerRef.current);
        setMockMessage("3 Strikes! Hardcore run terminated.");
        setMockType("quit");
        return;
      }
    }

    handleNextPuzzleAdvance();
  };

  const handleHint = () => {
    if (hintsUsed >= 3) return;
    if (soundEnabled) playClickSound();
    setHintsUsed((h) => h + 1);
    // Slight penalty in blitz
    if (selectedMode === "blitz") {
      setScore((s) => Math.max(0, s - 2));
    }
  };

  const handleLetterPillClick = (letter: string) => {
    if (soundEnabled) playClickSound();
    setAnswer((prev) => prev + letter);
    inputRef.current?.focus();
  };

  const handleBackspaceLetter = () => {
    if (soundEnabled) playClickSound();
    setAnswer((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  const handleQuit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMockMessage(getRandomMock(QUIT_MOCKS));
    setMockType("quit");
  };

  const closeMockModal = () => {
    const wasQuit = mockType === "quit";
    const wasTimeout = mockType === "timeout";
    const wasGameOver = mockType === "wrong" && selectedMode === "hardcore" && strikes >= 3;

    setMockType(null);
    setMockMessage("");

    if (wasQuit || wasTimeout || wasGameOver) {
      setGameState("result");
      if (soundEnabled && score > 0) playFanfare();
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  /* ── Score Submission ────────────────────────────────── */
  const submitScore = async (finalScore: number) => {
    if (submitted || submitting || finalScore === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: "emoji",
          player_name: playerName,
          score: finalScore,
          mode: selectedMode,
          difficulty: selectedMode === "hardcore" ? "hard" : "normal",
          details: {
            decoded: currentIndex - skippedOrWrong,
            maxStreak,
            category: selectedCategory,
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

  /* Auto submit score when game concludes */
  useEffect(() => {
    if (gameState === "result" && score > 0 && !submitted && !submitting) {
      submitScore(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  /* Run out of puzzles */
  useEffect(() => {
    if (gameState === "playing" && currentIndex >= puzzles.length && puzzles.length > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState("result");
      if (soundEnabled && score > 0) playFanfare();
    }
  }, [currentIndex, puzzles.length, gameState, score, soundEnabled]);

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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-violet-600 transition-colors"
              >
                <IconArrowLeft size={14} />
                All Resources
              </Link>
              <button
                onClick={toggleSound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
              >
                {soundEnabled ? <IconVolume size={14} className="text-violet-600" /> : <IconVolumeOff size={14} className="text-gray-400" />}
                <span>{soundEnabled ? "Sound ON" : "Muted"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                <IconMoodSmile size={20} />
              </div>
              <p className="text-[11px] font-black text-violet-600 uppercase tracking-widest">SPE Emoji Decoders</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl mt-1">
              Emoji Decode Arena
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-gray-400">
              360+ curated puzzles across Petroleum engineering, Naija slang, cinema, songs, science, and world trivia.
              {playerName && (
                <span className="ml-2 text-gray-600">
                  Player: <span className="font-bold text-violet-600">{playerName}</span>
                  <button
                    onClick={() => { setGameState("name"); setTimeout(() => nameInputRef.current?.focus(), 100); }}
                    className="ml-1 text-[10px] text-gray-400 hover:text-violet-600 font-bold uppercase"
                  >
                    (edit)
                  </button>
                </span>
              )}
            </p>
          </motion.div>

          {/* Mode Selector */}
          {gameState === "idle" && (
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "blitz" as GameMode, label: "60s Speed Blitz", icon: IconClock, desc: "Fast-paced 60s run with streak multipliers" },
                  { id: "hardcore" as GameMode, label: "Hardcore Survival", icon: IconFlame, desc: "15s countdown per puzzle. 3 strikes out!" },
                  { id: "domain" as GameMode, label: "Category Mastery", icon: IconFilter, desc: "Choose a specific topic like Petroleum or Naija" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMode(m.id); if (soundEnabled) playClickSound(); }}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      selectedMode === m.id
                        ? "bg-white border-violet-600 ring-2 ring-violet-100 shadow-md"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <m.icon size={18} className={selectedMode === m.id ? "text-violet-600 mb-2" : "text-gray-400 mb-2"} />
                    <p className="text-xs font-black text-gray-900">{m.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>

              {/* Category selector if in domain mode */}
              {selectedMode === "domain" && (
                <div className="flex flex-wrap gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-gray-400 w-full mb-1">Pick Category:</span>
                  {["All", ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); if (soundEnabled) playClickSound(); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
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
                    <div className="w-20 h-20 rounded-3xl bg-violet-50 flex items-center justify-center mx-auto mb-6">
                      <IconMoodSmile size={36} className="text-violet-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                      {selectedMode === "blitz" && "60-Second Speed Blitz"}
                      {selectedMode === "hardcore" && "Sudden Death Hardcore"}
                      {selectedMode === "domain" && `Mastery: ${selectedCategory}`}
                    </h2>
                    <p className="text-sm font-medium text-gray-400 mb-6 max-w-md mx-auto">
                      {selectedMode === "blitz" && "Race against the clock to crack as many emoji codes as you can. Chain streaks for massive combo bonuses."}
                      {selectedMode === "hardcore" && "Every puzzle gives you 15 seconds. Right answers add +5s bonus. 3 mistakes and your run is terminated."}
                      {selectedMode === "domain" && `Solve emoji riddles focused specifically on ${selectedCategory}.`}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                      <span className="px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 text-[11px] font-bold border border-violet-100">
                        360+ Puzzles
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-100">
                        Up to 6x Streak Combos
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
                        Smart Fuzzy Match
                      </span>
                    </div>

                    <button
                      onClick={() => startGame(selectedMode)}
                      className="px-8 py-4 rounded-2xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
                    >
                      Start Challenge
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
                    <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-6">
                      <IconUser size={28} className="text-violet-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Player Identification</h2>
                    <p className="text-sm font-medium text-gray-400 mb-6">Enter your name or handle for the leaderboards.</p>
                    <div className="max-w-xs mx-auto space-y-4">
                      <input
                        ref={nameInputRef}
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value.slice(0, 30))}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        placeholder="e.g. EmojiGenius"
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3.5 text-center text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      />
                      <button
                        onClick={saveName}
                        disabled={!nameInput.trim()}
                        className="w-full px-6 py-3.5 rounded-2xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors disabled:opacity-50"
                      >
                        Let&apos;s Play
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* PLAYING */}
                {gameState === "playing" && currentPuzzle && (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-6 sm:p-10 relative overflow-hidden shadow-sm"
                  >
                    {/* Visual Flash overlays */}
                    <AnimatePresence>
                      {showCorrect && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center z-20 rounded-[2rem] sm:rounded-[3rem]"
                        >
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <IconCheck size={32} className="text-white" />
                          </motion.div>
                        </motion.div>
                      )}
                      {showWrong && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-rose-500/10 flex items-center justify-center z-20 rounded-[2rem] sm:rounded-[3rem]"
                        >
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200">
                            <IconX size={32} className="text-white" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Timer + Score Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <IconClock size={16} className={timeLeft <= 10 ? "text-rose-500" : "text-gray-400"} />
                            <span className={`text-xs font-black font-mono ${timeLeft <= 10 ? "text-rose-500 animate-pulse font-bold" : "text-gray-600"}`}>
                              {timeLeft}s
                            </span>
                          </div>

                          {selectedMode === "hardcore" && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-[10px] font-black text-rose-600">
                              Strikes: {strikes}/3
                            </div>
                          )}

                          {streak >= 2 && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100">
                              <IconSparkles size={12} className="text-amber-500" />
                              <span className="text-[10px] font-black text-amber-600">{streak}x STREAK</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-gray-400 uppercase">Score</span>
                          <span className="text-base font-black text-violet-600">{score}</span>
                        </div>
                      </div>
                      <TimerBar secondsLeft={timeLeft} total={maxTime} />
                    </div>

                    {/* Puzzle Presentation */}
                    <div className="text-center mb-6">
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-100 mb-3">
                        {CATEGORY_PROMPT[currentPuzzle.category] ?? currentPuzzle.category}
                      </span>
                      <motion.div
                        key={currentPuzzle.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl sm:text-7xl py-5 select-none"
                      >
                        {currentPuzzle.emojis}
                      </motion.div>

                      {/* Hint Reveal */}
                      {hintsUsed > 0 && (
                        <p className="text-base sm:text-lg font-mono font-bold text-gray-500 tracking-[0.3em] mb-2 bg-gray-50 py-1 px-3 rounded-lg inline-block border border-gray-100">
                          {getHint(currentPuzzle.answer, hintsUsed)}
                        </p>
                      )}
                    </div>

                    {/* Input Field */}
                    <div className="flex gap-2 mb-3">
                      <input
                        ref={inputRef}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                        placeholder="Type your guess here..."
                        className="flex-grow rounded-xl bg-gray-50 border border-gray-200 px-4 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        autoComplete="off"
                        autoCapitalize="off"
                      />
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!answer.trim()}
                        className="px-5 py-3.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors disabled:opacity-50 shrink-0 shadow-sm"
                      >
                        <IconChevronRight size={18} />
                      </button>
                    </div>

                    {/* Scrambled Letter Tray Helper */}
                    {showLetterTray && scrambledLetters.length > 0 && (
                      <div className="mb-4 p-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-center gap-1.5">
                        {scrambledLetters.map((letter, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleLetterPillClick(letter)}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-xs font-black text-gray-800 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 transition-all shadow-xs"
                          >
                            {letter}
                          </button>
                        ))}
                        <button
                          onClick={handleBackspaceLetter}
                          className="px-2 h-8 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center"
                          title="Backspace"
                        >
                          <IconBackspace size={14} />
                        </button>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <button
                        onClick={handleHint}
                        disabled={hintsUsed >= 3}
                        className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 disabled:opacity-40 transition-colors"
                      >
                        <IconBulb size={14} />
                        Hint ({hintsUsed}/3)
                      </button>
                      <button
                        onClick={() => setShowLetterTray(!showLetterTray)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <IconKeyboard size={14} />
                        {showLetterTray ? "Hide Letters" : "Show Letters"}
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
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <IconFlag size={14} />
                        Quit
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* RESULT */}
                {gameState === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-12 shadow-sm"
                  >
                    <div className="text-center mb-8">
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100 mb-2">
                        {selectedMode.toUpperCase()} RESULT
                      </span>
                      <h2 className="text-5xl sm:text-6xl font-black text-gray-900 mb-2">
                        {score}<span className="text-xl text-gray-400"> pts</span>
                      </h2>
                      <p className="text-sm font-bold text-gray-400">
                        {score === 0
                          ? "Warm up round. Try again!"
                          : score < 40
                            ? "Solid effort! Ready to beat it?"
                            : score < 80
                              ? "Super sharp decoding skills!"
                              : score < 140
                                ? "Master Level Decoder!"
                                : "Legendary SPE Codebreaker!"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 mb-8">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Decoded</p>
                          <p className="text-base sm:text-lg font-black text-emerald-600">{Math.max(0, currentIndex - skippedOrWrong)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Best Streak</p>
                          <p className="text-base sm:text-lg font-black text-amber-600">{maxStreak}x</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Skipped</p>
                          <p className="text-base sm:text-lg font-black text-gray-500">{skippedOrWrong}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {submitting ? (
                        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 text-sm font-bold">
                          <IconLoader2 size={14} className="animate-spin" />
                          Submitting...
                        </div>
                      ) : submitted ? (
                        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold">
                          <IconTrophy size={14} />
                          Ranked on Leaderboard
                        </div>
                      ) : score > 0 ? (
                        <button
                          onClick={() => submitScore(score)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
                        >
                          <IconTrophy size={14} />
                          Save Score
                        </button>
                      ) : null}
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
                {mockType === "wrong" ? "Not Quite!" : mockType === "quit" ? "Quitter!" : "Time’s Up!"}
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
                {mockMessage}
              </p>
              <button
                onClick={closeMockModal}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  mockType === "wrong"
                    ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-200"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {mockType === "wrong" ? "Keep Going" : "See Results"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
