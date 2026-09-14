"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCheck,
  IconX,
  IconCircleCheck,
  IconClock,
  IconRefresh,
  IconWifiOff,
} from "@tabler/icons-react";
import Link from "next/link";
import ShowdownCharacter from "@/components/ShowdownCharacter";
import NetworkStatusBadge from "@/components/NetworkStatusBadge";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { PARTYKIT_HOST, OPTION_COLORS } from "@/lib/showdown";

interface Option {
  id: number | string;
  text: string;
  is_correct?: boolean;
}

interface Question {
  id: string;
  question_text: string;
  image_url?: string | null;
  time_limit: number;
  points: number;
  options: Option[];
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
  isInitialized?: boolean;
  status: "LOBBY" | "COUNTDOWN" | "QUESTION" | "REVEAL" | "LEADERBOARD" | "PODIUM";
  progressionMode?: "MANUAL" | "AUTO";
  isPaused?: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: Question | null;
  players: Player[];
  answersCount: number;
  correctOptionId: string | number | null;
}

export default function ShowdownGamePage() {
  const params = useParams();
  const pin = (params?.id as string) || (params?.pin as string) || "";
  const router = useRouter();

  const [nickname, setNickname] = useState<string>("");
  const [avatarType, setAvatarType] = useState<string>("blobby");
  const [avatarColor, setAvatarColor] = useState<string>("#2563EB");
  const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [playerTimeLeft, setPlayerTimeLeft] = useState<number>(20);
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  const { isOnline, quality } = useNetworkStatus();

  // Read saved nickname, avatar, and color from session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNick = sessionStorage.getItem(`showdown_nick_${pin}`);
      const savedAvatar = sessionStorage.getItem(`showdown_avatar_${pin}`);
      const savedColor = sessionStorage.getItem(`showdown_color_${pin}`);
      if (savedAvatar) setAvatarType(savedAvatar);
      if (savedColor) setAvatarColor(savedColor);

      if (savedNick) {
        setNickname(savedNick);
      } else {
        router.push(`/showdown/${pin}`);
      }
    }
  }, [pin, router]);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: pin,
    onMessage(event) {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "SYNC_STATE" || msg.type === "STATE_UPDATE") {
          setRoomState(msg.state);

          if (msg.state && msg.state.isInitialized === false && msg.state.status !== "PODIUM") {
            sessionStorage.removeItem(`showdown_nick_${pin}`);
            sessionStorage.removeItem(`showdown_avatar_${pin}`);
            sessionStorage.removeItem(`showdown_color_${pin}`);
            sessionStorage.removeItem(`showdown_playerId_${pin}`);
            router.push("/showdown");
          }
        } else if (msg.type === "JOIN_CONFIRMED" || msg.type === "JOIN_SUCCESS") {
          if (msg.playerId) {
            sessionStorage.setItem(`showdown_playerId_${pin}`, msg.playerId);
          }
        } else if (msg.type === "HOST_DISCONNECTED" || msg.type === "JOIN_ERROR" || msg.type === "PLAYER_KICKED") {
          sessionStorage.removeItem(`showdown_nick_${pin}`);
          sessionStorage.removeItem(`showdown_avatar_${pin}`);
          sessionStorage.removeItem(`showdown_color_${pin}`);
          sessionStorage.removeItem(`showdown_playerId_${pin}`);
          router.push("/showdown");
        }
      } catch (err) {
        console.error("Socket parse error:", err);
      }
    },
  });

  const sendJoin = useCallback(() => {
    if (nickname && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "PLAYER_JOIN",
          nickname,
          avatarType,
          avatarColor,
        })
      );
    }
  }, [nickname, socket, avatarType, avatarColor]);

  // Re-join if connection is established or when network returns online
  useEffect(() => {
    sendJoin();
  }, [socket.readyState, sendJoin, isOnline]);

  // Reset selected option and initialize player timer on new question
  useEffect(() => {
    if (roomState?.status === "QUESTION" && roomState.currentQuestion) {
      setSelectedOptionId(null);
      setSubmitted(false);
      setPlayerTimeLeft(roomState.currentQuestion.time_limit || 20);
    }
  }, [roomState?.status, roomState?.currentQuestionIndex]);

  // Active question timer for player device
  useEffect(() => {
    if (roomState?.status === "QUESTION" && roomState.currentQuestion) {
      if (roomState.isPaused) return; // Freeze timer if host paused

      const timer = setInterval(() => {
        setPlayerTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [roomState?.status, roomState?.currentQuestionIndex, roomState?.isPaused]);

  // Current player data
  const me = useMemo(() => {
    if (!roomState?.players || !nickname) return null;
    const storedPlayerId =
      typeof window !== "undefined"
        ? sessionStorage.getItem(`showdown_playerId_${pin}`)
        : null;

    return (
      (storedPlayerId
        ? roomState.players.find((p) => p.id === storedPlayerId)
        : null) ||
      roomState.players.find(
        (p) =>
          p.connected &&
          p.nickname.trim().toLowerCase() === nickname.trim().toLowerCase()
      ) ||
      roomState.players.find(
        (p) => p.nickname.trim().toLowerCase() === nickname.trim().toLowerCase()
      ) ||
      null
    );
  }, [roomState?.players, nickname, pin]);

  const handleSelectOption = (optionIndex: number) => {
    if (submitted || roomState?.status !== "QUESTION" || roomState?.isPaused) return;

    const currentQ = roomState?.currentQuestion;
    const targetOption = currentQ?.options?.[optionIndex];
    const optionId = targetOption ? targetOption.id : optionIndex;

    setSelectedOptionId(optionIndex);
    setSubmitted(true);

    socket.send(
      JSON.stringify({
        type: "SUBMIT_ANSWER",
        optionId,
        optionIndex,
      })
    );
  };

  const currentStatus = roomState?.status || "LOBBY";
  const playerAvatarType = me?.avatarType || avatarType || "blobby";
  const playerColor = me?.avatarColor || avatarColor || "#2563EB";
  const timeLimit = roomState?.currentQuestion?.time_limit || 20;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white flex flex-col font-sans select-none touch-manipulation">
      {/* Top Mobile Status Header */}
      <header className="px-4 sm:px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-[#121212] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: playerColor }}
          />
          <span className="text-xs font-black tracking-tight text-white line-clamp-1 max-w-[120px] sm:max-w-none">
            {nickname || "Player"}
          </span>
          <NetworkStatusBadge variant="minimal" className="ml-1" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {me?.streak && me.streak > 1 ? (
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-900 px-2 py-0.5 rounded-md">
              {me.streak} Streak
            </span>
          ) : null}

          <div className="flex items-center gap-1 font-mono text-xs font-black text-white bg-neutral-900 border border-neutral-800 px-2.5 sm:px-3 py-1 rounded-xl">
            <span>{me?.score || 0}</span>
            <span className="text-[10px] text-gray-500 font-bold">pts</span>
          </div>
        </div>
      </header>

      {/* Offline / Reconnect Banner */}
      {!isOnline && (
        <div className="bg-red-950/90 border-b border-red-800 px-4 py-2 text-xs flex items-center justify-between gap-3 text-red-200">
          <div className="flex items-center gap-2">
            <IconWifiOff size={15} className="text-red-400 animate-pulse shrink-0" />
            <span className="font-semibold text-[11px]">Connection weak. Reconnecting...</span>
          </div>
          <button
            type="button"
            onClick={sendJoin}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            <IconRefresh size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main Gamepad Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 relative max-w-md mx-auto w-full">
        {/* Global Session Paused Overlay for Players */}
        {roomState?.isPaused && currentStatus !== "LOBBY" && currentStatus !== "PODIUM" && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="mb-4">
              <ShowdownCharacter
                type={playerAvatarType}
                mood="thinking"
                color={playerColor}
                size={90}
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-full mb-3">
              Session Paused
            </span>
            <h3 className="text-xl font-bold text-white mb-1">Game Paused by Host</h3>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              The host has paused the session. Please stand by, the game and your timer will resume automatically.
            </p>
          </div>
        )}

        {/* 1. LOBBY STATE */}
        {currentStatus === "LOBBY" && (
          <div className="flex flex-col items-center text-center max-w-sm px-4">
            <div className="mb-6">
              <ShowdownCharacter
                type={playerAvatarType}
                mood="waving"
                color={playerColor}
                size={100}
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">
              GAME PIN: {pin}
            </span>
            <h2 className="text-xl font-bold text-white mb-2">Waiting in Lobby</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              The host will start the quiz on the big screen soon. Keep your phone ready.
            </p>
          </div>
        )}

        {/* 2. COUNTDOWN STATE */}
        {currentStatus === "COUNTDOWN" && (
          <div className="flex flex-col items-center text-center px-4">
            <div className="mb-6">
              <ShowdownCharacter
                type={playerAvatarType}
                mood="thinking"
                color={playerColor}
                size={90}
              />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-2">
              QUESTION {(roomState?.currentQuestionIndex || 0) + 1} STARTING
            </p>
            <h3 className="text-sm font-bold text-gray-400">Look at the screen</h3>
          </div>
        )}

        {/* 3. QUESTION STATE (4 BOLD BRAND PADS + BIG TIMER) */}
        {currentStatus === "QUESTION" && (
          <div className="w-full h-full flex flex-col justify-between py-1">
            {/* Prominent Timer Bar for Player */}
            <div className="w-full mb-2 sm:mb-3">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <IconClock size={13} />
                  Time Left
                </span>
                <span
                  className={`font-mono text-xs font-black px-2 py-0.5 rounded-md border ${
                    playerTimeLeft <= 5
                      ? "bg-red-950/80 text-red-400 border-red-800 animate-pulse"
                      : "bg-neutral-900 text-white border-neutral-800"
                  }`}
                >
                  {playerTimeLeft}s
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                    playerTimeLeft <= 5 ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (playerTimeLeft / timeLimit) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {!submitted ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 h-[calc(100dvh-170px)] max-h-[500px] min-h-[280px]">
                {OPTION_COLORS.map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`rounded-[1.75rem] sm:rounded-[2rem] border ${opt.border} ${opt.bg} ${opt.hoverBg} text-white flex flex-col items-center justify-center gap-2 p-3 sm:p-4 transition-transform cursor-pointer touch-manipulation`}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/25 flex items-center justify-center text-xl sm:text-2xl font-black">
                      {opt.label}
                    </span>
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest opacity-80">
                      Option {opt.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            ) : (
              /* Answer Submitted Locked Screen */
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="my-auto flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-[#121212] border border-neutral-800 w-full"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4">
                  <IconCheck size={24} strokeWidth={3} />
                </div>
                <h3 className="text-lg font-black text-white mb-1">Answer Submitted</h3>
                <p className="text-xs text-gray-400 font-medium">
                  Waiting for other attendees and timer to end...
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* 4. REVEAL STATE (ROUND RESULT) */}
        {currentStatus === "REVEAL" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-[#121212] border border-neutral-800 my-auto"
          >
            {me?.lastAnswerCorrect ? (
              <>
                <div className="mb-4">
                  <ShowdownCharacter
                    type={playerAvatarType}
                    mood="happy"
                    color={playerColor}
                    size={100}
                  />
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-950/60 border border-green-800 px-3 py-1 rounded-full mb-3">
                  <IconCircleCheck size={14} /> Correct
                </span>
                <h3 className="text-2xl font-black text-white mb-1">
                  +{me.lastPoints} {me.lastPoints === 1 ? "Point" : "Points"}
                </h3>
                {me.streak > 1 && (
                  <p className="text-xs font-bold text-blue-400 mt-1">
                    {me.streak} answer streak
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <ShowdownCharacter
                    type={playerAvatarType}
                    mood="incorrect"
                    color={playerColor}
                    size={100}
                  />
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/60 border border-red-800 px-3 py-1 rounded-full mb-3">
                  <IconX size={14} /> Incorrect
                </span>
                <h3 className="text-xl font-bold text-white mb-1">Zero Points</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Check the correct answer on the main screen
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* 5. LEADERBOARD STATE */}
        {currentStatus === "LEADERBOARD" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-[#121212] border border-neutral-800 my-auto"
          >
            <div className="mb-4">
              <ShowdownCharacter
                type={playerAvatarType}
                mood="waving"
                color={playerColor}
                size={90}
              />
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">
              CURRENT STANDING
            </p>
            <h3 className="text-3xl font-black text-white mb-2">
              {me?.rank ? `#${me.rank}` : "Ranked"}
            </h3>
            <p className="text-sm font-bold text-gray-300 font-mono mb-6">
              {me?.score || 0} total points
            </p>

            <p className="text-xs text-gray-500 font-medium">
              Next round starting shortly on the main screen...
            </p>
          </motion.div>
        )}

        {/* 6. PODIUM FINALE */}
        {currentStatus === "PODIUM" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-[#121212] border border-neutral-800 my-auto"
          >
            <div className="mb-6">
              <ShowdownCharacter
                type={playerAvatarType}
                mood="celebrating"
                color={playerColor}
                size={120}
              />
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">
              SHOWDOWN COMPLETED
            </p>
            <h3 className="text-2xl font-black text-white mb-2">
              Final Rank: {me?.rank ? `#${me.rank}` : "Participant"}
            </h3>
            <p className="text-sm font-bold text-gray-300 font-mono mb-8">
              Final Score: {me?.score || 0} pts
            </p>

            <Link
              href="/programs/resources"
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-black uppercase tracking-widest text-white transition-colors"
            >
              Back to Resources
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
