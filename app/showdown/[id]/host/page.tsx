"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import { QRCodeSVG } from "qrcode.react";
import {
  IconLoader2,
  IconArrowLeft,
  IconPlayerPlay,
  IconPlayerPause,
  IconChevronRight,
  IconMaximize,
  IconMinimize,
  IconCheck,
  IconX,
  IconRefresh,
  IconUsers,
  IconClock,
} from "@tabler/icons-react";
import Link from "next/link";
import ShowdownCharacter from "@/components/ShowdownCharacter";
import { PARTYKIT_HOST, OPTION_COLORS } from "@/lib/showdown";

export type ProgressionMode = "MANUAL" | "AUTO";

interface Option {
  id: number | string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  image_url?: string | null;
  time_limit: number;
  points: number;
  options: Option[];
  order_index: number;
}

interface Player {
  id: string;
  nickname: string;
  avatarType?: string;
  avatarColor?: string;
  score: number;
  streak: number;
  lastPoints: number;
  lastAnswerCorrect: boolean | null;
  hasAnswered: boolean;
  connected: boolean;
  rank?: number;
}

interface RoomState {
  pin: string;
  quizTitle: string;
  status: "LOBBY" | "COUNTDOWN" | "QUESTION" | "REVEAL" | "LEADERBOARD" | "PODIUM";
  progressionMode?: ProgressionMode;
  isPaused?: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: Question | null;
  players: Player[];
  answersCount: number;
  choiceDistribution: Record<string | number, number>;
  correctOptionId: string | number | null;
}

export default function ShowdownHostLivePage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  // Generate or read deterministic 6-digit session pin for this host instance
  const [pin] = useState(() => {
    return String(Math.floor(100000 + Math.random() * 900000));
  });

  const [quiz, setQuiz] = useState<{
    id: string;
    title: string;
    description: string;
    category?: string;
    questions: Question[];
  } | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [quizError, setQuizError] = useState("");

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [autoAdvanceTime, setAutoAdvanceTime] = useState<number>(5);
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Connect to PartyKit room
  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: pin,
    onMessage(event) {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "SYNC_STATE" || msg.type === "STATE_UPDATE") {
          setRoomState(msg.state);
        }
      } catch (err) {
        console.error("PartySocket parse error:", err);
      }
    },
  });

  // Track fullscreen changes (Esc key, F11, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Fetch Quiz Data from Supabase and initialize PartyKit
  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const fetchQuiz = async () => {
    try {
      setLoadingQuiz(true);
      setQuizError("");
      const res = await fetch(`/api/showdown/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setQuizError(errData.error || "Unable to load quiz details.");
      }
    } catch {
      setQuizError("Network error while loading quiz.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // When quiz loads and socket opens, send HOST_INIT
  useEffect(() => {
    if (quiz && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "HOST_INIT",
          quizTitle: quiz.title,
          questions: quiz.questions,
          progressionMode: roomState?.progressionMode || "MANUAL",
        })
      );
    }
  }, [quiz, socket]);

  // Handle countdown animation (3... 2... 1...)
  useEffect(() => {
    if (roomState?.status === "COUNTDOWN") {
      setCountdownNum(3);
      const timer = setInterval(() => {
        if (roomState?.isPaused) return;
        setCountdownNum((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            socket?.send(JSON.stringify({ type: "QUESTION_GO" }));
            return 1;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [roomState?.status, roomState?.currentQuestionIndex, roomState?.isPaused]);

  // Handle active Question timer
  useEffect(() => {
    if (roomState?.status === "QUESTION" && roomState.currentQuestion) {
      const limit = roomState.currentQuestion.time_limit || 20;
      setTimeLeft(limit);

      const timer = setInterval(() => {
        if (roomState.isPaused) return; // Freeze timer if host paused the session
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            socket?.send(JSON.stringify({ type: "END_QUESTION" }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [roomState?.status, roomState?.currentQuestionIndex, roomState?.isPaused]);

  // Auto-Progress timer for REVEAL stage
  useEffect(() => {
    if (roomState?.status === "REVEAL" && roomState.progressionMode === "AUTO") {
      setAutoAdvanceTime(5);
      const timer = setInterval(() => {
        if (roomState.isPaused) return;
        setAutoAdvanceTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            socket?.send(JSON.stringify({ type: "SHOW_LEADERBOARD" }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [roomState?.status, roomState?.currentQuestionIndex, roomState?.progressionMode, roomState?.isPaused]);

  // Auto-Progress timer for LEADERBOARD stage
  useEffect(() => {
    if (roomState?.status === "LEADERBOARD" && roomState.progressionMode === "AUTO") {
      setAutoAdvanceTime(5);
      const timer = setInterval(() => {
        if (roomState.isPaused) return;
        setAutoAdvanceTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            socket?.send(JSON.stringify({ type: "NEXT_QUESTION" }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [roomState?.status, roomState?.currentQuestionIndex, roomState?.progressionMode, roomState?.isPaused]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleStartGame = () => {
    socket?.send(JSON.stringify({ type: "START_GAME" }));
  };

  const handleSetProgressionMode = (mode: ProgressionMode) => {
    socket?.send(JSON.stringify({ type: "SET_PROGRESSION_MODE", mode }));
  };

  const handleTogglePause = () => {
    if (roomState?.isPaused) {
      socket?.send(JSON.stringify({ type: "RESUME_GAME" }));
    } else {
      socket?.send(JSON.stringify({ type: "PAUSE_GAME" }));
    }
  };

  const handleEndQuestionEarly = () => {
    socket?.send(JSON.stringify({ type: "END_QUESTION" }));
  };

  const handleShowLeaderboard = () => {
    socket?.send(JSON.stringify({ type: "SHOW_LEADERBOARD" }));
  };

  const handleNextQuestion = () => {
    socket?.send(JSON.stringify({ type: "NEXT_QUESTION" }));
  };

  const handleRestartGame = () => {
    socket?.send(JSON.stringify({ type: "RESET_GAME" }));
  };

  const handleKickPlayer = (playerId: string) => {
    socket?.send(JSON.stringify({ type: "KICK_PLAYER", playerId }));
  };

  // Connected players list
  const connectedPlayers = useMemo(() => {
    return (roomState?.players || []).filter((p) => p.connected);
  }, [roomState?.players]);

  // Top players for leaderboard and podium
  const sortedPlayers = useMemo(() => {
    return [...connectedPlayers].sort((a, b) => b.score - a.score);
  }, [connectedPlayers]);

  if (loadingQuiz) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-gray-500 bg-[#f8faff]">
        <IconLoader2 className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Loading Showdown Room...</p>
      </div>
    );
  }

  if (quizError || !quiz) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-gray-100 rounded-3xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold">
          !
        </div>
        <h2 className="text-lg font-black text-gray-900 mb-1">Quiz Load Error</h2>
        <p className="text-xs text-gray-500 mb-6">{quizError || "Quiz not found"}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchQuiz}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
          >
            <IconRefresh size={14} />
            Retry
          </button>
          <Link
            href="/showdown/host"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Return to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const joinHost =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_SITE_URL || "https://speui.org";

  const joinUrl = `${joinHost}/showdown?pin=${pin}`;
  const currentStatus = roomState?.status || "LOBBY";
  const isGameActive = currentStatus !== "LOBBY" && currentStatus !== "PODIUM";

  return (
    <div className="min-h-screen bg-[#f8faff] text-gray-900 flex flex-col font-sans select-none pb-12">
      {/* Top Presentation Bar */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white/95 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/showdown/host"
            className="p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Return to Quizzes"
          >
            <IconArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                Live Host
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                {roomState?.progressionMode === "AUTO" ? "Auto-Progress" : "Host Paced"}
              </span>
              {quiz.category && (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
                  {quiz.category}
                </span>
              )}
            </div>
            <h1 className="text-sm font-black text-gray-900 tracking-tight">{quiz.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Pause / Resume Button during Active Game */}
          {isGameActive && (
            <button
              onClick={handleTogglePause}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                roomState?.isPaused
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {roomState?.isPaused ? <IconPlayerPlay size={14} /> : <IconPlayerPause size={14} />}
              <span>{roomState?.isPaused ? "Resume Session" : "Pause"}</span>
            </button>
          )}

          {/* Game PIN Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Game PIN</span>
            <span className="font-mono text-xs font-black text-gray-900 tracking-widest">{pin}</span>
          </div>

          {/* Open Full Screen Button */}
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {isFullscreen ? <IconMinimize size={14} /> : <IconMaximize size={14} />}
            <span>{isFullscreen ? "Exit Full Screen" : "Open Full Screen"}</span>
          </button>
        </div>
      </header>

      {/* Global Session Paused Notice Banner */}
      {roomState?.isPaused && isGameActive && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 sticky top-[73px] z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <p className="text-xs font-bold">
                Session Paused by Host. All question timers and player answer pads are on hold.
              </p>
            </div>
            <button
              onClick={handleTogglePause}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              <IconPlayerPlay size={14} />
              Resume Session
            </button>
          </div>
        </div>
      )}

      {/* Presentation Stages */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {/* STAGE 1: LOBBY */}
        {currentStatus === "LOBBY" && (
          <div className="w-full space-y-8">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                <ShowdownCharacter mood="waving" size={120} />
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                SPE Showdown Arena
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 tracking-tight">
                Join the Live Game
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-xl mx-auto mb-8">
                {/* QR Code Box */}
                <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center">
                  <div className="p-3 bg-white border border-gray-200 rounded-xl">
                    <QRCodeSVG value={joinUrl} size={130} level="M" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3">
                    Scan to Join
                  </span>
                </div>

                {/* PIN Code Box */}
                <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Or Enter Game PIN
                  </span>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-gray-900 tracking-widest my-2">
                    {pin}
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Visit <span className="font-bold text-gray-700">speui.org/showdown</span>
                  </p>
                </div>
              </div>

              {/* Progression Mode Choice */}
              <div className="mb-8 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left max-w-xl mx-auto">
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Progression Setting (Chosen at Start)
                  </span>
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    Select how rounds advance. This setting is locked once the game starts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Host Paced */}
                  <button
                    type="button"
                    onClick={() => handleSetProgressionMode("MANUAL")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      (roomState?.progressionMode || "MANUAL") === "MANUAL"
                        ? "bg-white border-blue-600 ring-2 ring-blue-600/10"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-gray-900">Host Paced</span>
                      {(roomState?.progressionMode || "MANUAL") === "MANUAL" && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Manual host clicks to show leaderboard and next question.
                    </p>
                  </button>

                  {/* Option B: Auto-Progress */}
                  <button
                    type="button"
                    onClick={() => handleSetProgressionMode("AUTO")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      roomState?.progressionMode === "AUTO"
                        ? "bg-white border-blue-600 ring-2 ring-blue-600/10"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-gray-900">Auto-Progress</span>
                      {roomState?.progressionMode === "AUTO" && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Hands-free 5s timers on reveal & scoreboard before next question.
                    </p>
                  </button>
                </div>
              </div>

              {/* Start Game Action */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleStartGame}
                  disabled={connectedPlayers.length === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <IconPlayerPlay size={16} />
                  Start Game ({connectedPlayers.length} Joined)
                </button>
              </div>
            </div>

            {/* Joined Players Section */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconUsers size={16} className="text-gray-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Players in Lobby ({connectedPlayers.length})
                  </h3>
                </div>
              </div>

              {connectedPlayers.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 font-medium">
                  Waiting for players to join with PIN: <span className="font-mono font-bold text-gray-700">{pin}</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {connectedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="group inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800"
                    >
                      <div className="w-5 h-5 flex items-center justify-center pointer-events-none shrink-0">
                        <ShowdownCharacter
                          type={player.avatarType || "blobby"}
                          mood="neutral"
                          color={player.avatarColor || "#2563EB"}
                          size={20}
                        />
                      </div>
                      <span>{player.nickname}</span>
                      <button
                        onClick={() => handleKickPlayer(player.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                        title="Remove player"
                      >
                        <IconX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: COUNTDOWN */}
        {currentStatus === "COUNTDOWN" && (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-lg mx-auto w-full">
            <div className="flex justify-center mb-6">
              <ShowdownCharacter mood="thinking" size={100} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Question {(roomState?.currentQuestionIndex || 0) + 1} of {roomState?.totalQuestions || quiz.questions.length}
            </p>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
              Get Ready
            </h2>
            <div className="font-mono text-7xl font-black text-gray-900 tracking-tighter">
              {countdownNum}
            </div>
          </div>
        )}

        {/* STAGE 3: QUESTION ACTIVE */}
        {currentStatus === "QUESTION" && roomState?.currentQuestion && (
          <div className="w-full space-y-6">
            {/* Question Header Status + Big Prominent Timer */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-0.5">
                  Question {(roomState.currentQuestionIndex || 0) + 1} of {roomState.totalQuestions}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {roomState.currentQuestion.points === 0
                    ? "Practice Round (0 pts)"
                    : `Scoring: ${roomState.currentQuestion.points ?? 10} pts standard`}
                </span>
              </div>

              {/* Big Prominent Countdown Timer */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2.5 px-6 py-2 rounded-2xl border-2 transition-all ${
                    timeLeft <= 5
                      ? "bg-red-50 border-red-500 text-red-600 animate-pulse"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <IconClock size={20} className={timeLeft <= 5 ? "text-red-600" : "text-gray-400"} />
                  <span className="font-mono text-3xl font-black tracking-tight">
                    {timeLeft}s
                  </span>
                </div>

                <button
                  onClick={handleEndQuestionEarly}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
                >
                  Skip Timer
                </button>
              </div>
            </div>

            {/* Linear Progress Bar for Question Timer */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timeLeft <= 5 ? "bg-red-500" : "bg-blue-600"
                }`}
                style={{
                  width: `${Math.max(0, Math.min(100, (timeLeft / (roomState.currentQuestion?.time_limit || 20)) * 100))}%`,
                }}
              />
            </div>

            {/* Big Question Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                {roomState.currentQuestion.question_text}
              </h2>
            </div>

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomState.currentQuestion.options.map((opt, idx) => {
                const color = OPTION_COLORS[idx % OPTION_COLORS.length];
                const labels = ["A", "B", "C", "D"];
                return (
                  <div
                    key={opt.id}
                    className={`p-6 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${color.lightBg} ${color.border}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center shrink-0 ${color.bg}`}
                    >
                      {labels[idx]}
                    </div>
                    <span className="text-base font-bold text-gray-900 leading-tight">
                      {opt.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Answers Tracker Bar */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium px-2">
              <span>
                {roomState.answersCount} of {connectedPlayers.length} players answered
              </span>
              <span>
                {roomState.progressionMode === "AUTO" ? "Mode: Auto-Progress" : "Mode: Host Paced"}
              </span>
            </div>
          </div>
        )}

        {/* STAGE 4: RESULT / REVEAL */}
        {currentStatus === "REVEAL" && roomState?.currentQuestion && (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Question {(roomState.currentQuestionIndex || 0) + 1} Result
              </span>

              <div className="flex items-center gap-3">
                {/* Auto Advance Indicator if active */}
                {roomState.progressionMode === "AUTO" && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                    <span className="font-mono">Auto Leaderboard in {autoAdvanceTime}s</span>
                  </div>
                )}

                <button
                  onClick={handleShowLeaderboard}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>View Leaderboard</span>
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Auto Advance Linear Bar */}
            {roomState.progressionMode === "AUTO" && (
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(autoAdvanceTime / 5) * 100}%` }}
                />
              </div>
            )}

            {/* Question Text */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-3">
                <ShowdownCharacter mood="happy" size={70} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {roomState.currentQuestion.question_text}
              </h2>
            </div>

            {/* Option Response Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomState.currentQuestion.options.map((opt, idx) => {
                const isCorrect = String(opt.id) === String(roomState.correctOptionId);
                const count = roomState.choiceDistribution?.[opt.id] || 0;
                const totalAnswers = roomState.answersCount || 1;
                const percentage = Math.round((count / totalAnswers) * 100);
                const labels = ["A", "B", "C", "D"];
                const color = OPTION_COLORS[idx % OPTION_COLORS.length];

                return (
                  <div
                    key={opt.id}
                    className={`p-5 rounded-2xl border-2 text-left flex flex-col gap-3 relative overflow-hidden transition-all ${
                      isCorrect
                        ? "bg-white border-blue-600 ring-2 ring-blue-600/10"
                        : "bg-white border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${color.bg}`}
                        >
                          {labels[idx]}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{opt.text}</span>
                      </div>
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                          <IconCheck size={12} /> Correct
                        </span>
                      )}
                    </div>

                    {/* Distribution Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                        <span>{count} Answers</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isCorrect ? "bg-blue-600" : "bg-gray-400"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE 5: LEADERBOARD */}
        {currentStatus === "LEADERBOARD" && (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 text-center">
              <div className="flex justify-center mb-4">
                <ShowdownCharacter mood="celebrating" size={80} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
                Scoreboard
              </p>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">
                Top Performers
              </h2>

              <div className="space-y-3 text-left">
                {sortedPlayers.slice(0, 5).map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl text-white font-mono font-bold text-xs flex items-center justify-center shrink-0"
                        style={{ backgroundColor: player.avatarColor || "#2563EB" }}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-900">{player.nickname}</span>
                        {player.streak > 1 && (
                          <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {player.streak} streak
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-black text-gray-900">
                        {player.score.toLocaleString()} pts
                      </div>
                      {player.lastPoints > 0 && (
                        <span className="text-[10px] font-bold text-blue-600">
                          +{player.lastPoints}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto Advance Indicator on Leaderboard */}
              {roomState?.progressionMode === "AUTO" && (
                <div className="mt-6 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-between">
                  <span>Auto-advancing in {autoAdvanceTime}s...</span>
                  <div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${(autoAdvanceTime / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>
                    {(roomState?.currentQuestionIndex || 0) + 1 >= (roomState?.totalQuestions || quiz.questions.length)
                      ? "View Final Results"
                      : "Next Question"}
                  </span>
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 6: FINAL PODIUM */}
        {currentStatus === "PODIUM" && (
          <div className="w-full max-w-3xl mx-auto text-center space-y-8">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12">
              <div className="flex justify-center mb-6">
                <ShowdownCharacter mood="celebrating" size={120} />
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
                Showdown Completed
              </p>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-10">
                Podium Winners
              </h2>

              {/* 3-Column Podium */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end max-w-xl mx-auto mb-10">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  {sortedPlayers[1] && (
                    <ShowdownCharacter
                      type={sortedPlayers[1]?.avatarType || "droplet"}
                      mood="celebrating"
                      color={sortedPlayers[1]?.avatarColor || "#0D9488"}
                      size={65}
                      className="mb-2"
                    />
                  )}
                  <span className="text-xs font-bold text-gray-900 mb-1 truncate max-w-full">
                    {sortedPlayers[1]?.nickname || "-"}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 mb-2">
                    {sortedPlayers[1]?.score.toLocaleString() || 0} pts
                  </span>
                  <div className="w-full h-24 bg-gray-100 border border-gray-200 rounded-t-2xl flex items-center justify-center font-mono font-black text-base text-gray-600">
                    2nd
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  {sortedPlayers[0] && (
                    <ShowdownCharacter
                      type={sortedPlayers[0]?.avatarType || "blobby"}
                      mood="celebrating"
                      color={sortedPlayers[0]?.avatarColor || "#2563EB"}
                      size={85}
                      className="mb-2"
                    />
                  )}
                  <span className="text-sm font-black text-blue-700 mb-1 truncate max-w-full">
                    {sortedPlayers[0]?.nickname || "-"}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 mb-2">
                    {sortedPlayers[0]?.score.toLocaleString() || 0} pts
                  </span>
                  <div className="w-full h-36 bg-blue-50 border-2 border-blue-600 rounded-t-2xl flex items-center justify-center font-mono font-black text-xl text-blue-700">
                    1st
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  {sortedPlayers[2] && (
                    <ShowdownCharacter
                      type={sortedPlayers[2]?.avatarType || "starlet"}
                      mood="celebrating"
                      color={sortedPlayers[2]?.avatarColor || "#D97706"}
                      size={55}
                      className="mb-2"
                    />
                  )}
                  <span className="text-xs font-bold text-gray-900 mb-1 truncate max-w-full">
                    {sortedPlayers[2]?.nickname || "-"}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 mb-2">
                    {sortedPlayers[2]?.score.toLocaleString() || 0} pts
                  </span>
                  <div className="w-full h-16 bg-gray-100 border border-gray-200 rounded-t-2xl flex items-center justify-center font-mono font-black text-sm text-gray-600">
                    3rd
                  </div>
                </div>
              </div>

              {/* Final Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleRestartGame}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors cursor-pointer"
                >
                  <IconRefresh size={14} />
                  Play Again
                </button>
                <Link
                  href="/showdown/host"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Finish Showdown
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
