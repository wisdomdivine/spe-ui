"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconCircleCheck,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import ShowdownCharacter, {
  SHOWDOWN_CHARACTERS,
  CharacterType,
} from "@/components/ShowdownCharacter";
import { PARTYKIT_HOST, CHARACTER_SKINS } from "@/lib/showdown";

interface RoomState {
  pin: string;
  quizTitle: string;
  isInitialized?: boolean;
  status: "LOBBY" | "COUNTDOWN" | "QUESTION" | "REVEAL" | "LEADERBOARD" | "PODIUM";
  players: any[];
}

export default function ShowdownJoinPage() {
  const params = useParams();
  const pin = (params?.id as string) || (params?.pin as string) || "";
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [selectedType, setSelectedType] = useState<CharacterType>("blobby");
  const [selectedColor, setSelectedColor] = useState("#2563EB");
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: pin,
    onMessage(event) {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "SYNC_STATE" || msg.type === "STATE_UPDATE") {
          setRoomState(msg.state);

          if (msg.state && msg.state.isInitialized === false) {
            setHasJoined(false);
            sessionStorage.removeItem(`showdown_nick_${pin}`);
            sessionStorage.removeItem(`showdown_avatar_${pin}`);
            sessionStorage.removeItem(`showdown_color_${pin}`);
            sessionStorage.removeItem(`showdown_playerId_${pin}`);
            setError("Game PIN not found or session has ended.");
            return;
          }

          // If game is in progress and player has joined, route to controller screen
          if (
            hasJoined &&
            (msg.state.status === "COUNTDOWN" ||
              msg.state.status === "QUESTION" ||
              msg.state.status === "REVEAL" ||
              msg.state.status === "LEADERBOARD")
          ) {
            router.push(`/showdown/${pin}/game`);
          }
        } else if (msg.type === "JOIN_CONFIRMED" || msg.type === "JOIN_SUCCESS") {
          setLoading(false);
          setHasJoined(true);
          setError("");
          sessionStorage.setItem(`showdown_nick_${pin}`, nickname);
          sessionStorage.setItem(`showdown_avatar_${pin}`, selectedType);
          sessionStorage.setItem(`showdown_color_${pin}`, selectedColor);
          if (msg.playerId) {
            sessionStorage.setItem(`showdown_playerId_${pin}`, msg.playerId);
          }
        } else if (msg.type === "HOST_DISCONNECTED") {
          setLoading(false);
          setHasJoined(false);
          sessionStorage.removeItem(`showdown_nick_${pin}`);
          sessionStorage.removeItem(`showdown_avatar_${pin}`);
          sessionStorage.removeItem(`showdown_color_${pin}`);
          sessionStorage.removeItem(`showdown_playerId_${pin}`);
          setError(msg.message || "The host has disconnected. Game session ended.");
          setTimeout(() => {
            router.push("/showdown");
          }, 2000);
        } else if (msg.type === "JOIN_ERROR" || msg.type === "ERROR") {
          setLoading(false);
          setHasJoined(false);
          sessionStorage.removeItem(`showdown_nick_${pin}`);
          sessionStorage.removeItem(`showdown_avatar_${pin}`);
          sessionStorage.removeItem(`showdown_color_${pin}`);
          sessionStorage.removeItem(`showdown_playerId_${pin}`);
          setError(msg.message || "Failed to join room.");
        } else if (msg.type === "PLAYER_KICKED") {
          setHasJoined(false);
          sessionStorage.removeItem(`showdown_nick_${pin}`);
          sessionStorage.removeItem(`showdown_avatar_${pin}`);
          sessionStorage.removeItem(`showdown_color_${pin}`);
          sessionStorage.removeItem(`showdown_playerId_${pin}`);
          setError("You were removed by the host.");
        }
      } catch (err) {
        console.error("Socket parse error:", err);
      }
    },
    onError(err) {
      console.error("Socket connection error:", err);
      setLoading(false);
      setError("Unable to connect to live game server. Please try again.");
    },
  });

  // Reconnect check from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNick = sessionStorage.getItem(`showdown_nick_${pin}`);
      const savedAvatar = sessionStorage.getItem(`showdown_avatar_${pin}`) as CharacterType;
      const savedColor = sessionStorage.getItem(`showdown_color_${pin}`);
      if (savedAvatar) setSelectedType(savedAvatar);
      if (savedColor) setSelectedColor(savedColor);

      if (savedNick && !hasJoined && socket.readyState === WebSocket.OPEN && roomState?.isInitialized) {
        setNickname(savedNick);
        socket.send(
          JSON.stringify({
            type: "PLAYER_JOIN",
            nickname: savedNick,
            avatarType: savedAvatar || selectedType,
            avatarColor: savedColor || selectedColor,
          })
        );
      }
    }
  }, [socket.readyState, pin, hasJoined, selectedType, selectedColor, roomState?.isInitialized]);

  // If status changes while in waiting room
  useEffect(() => {
    if (
      hasJoined &&
      roomState &&
      (roomState.status === "COUNTDOWN" ||
        roomState.status === "QUESTION" ||
        roomState.status === "REVEAL" ||
        roomState.status === "LEADERBOARD")
    ) {
      router.push(`/showdown/${pin}/game`);
    }
  }, [roomState?.status, hasJoined, pin, router]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (roomState && roomState.isInitialized === false) {
      setError("Game PIN not found or session has ended. Please check the PIN on the host screen.");
      return;
    }

    const cleanNick = nickname.trim();
    if (!cleanNick) {
      setError("Please enter a nickname.");
      return;
    }
    if (cleanNick.length > 18) {
      setError("Nickname must be 18 characters or less.");
      return;
    }

    setLoading(true);

    // Timeout safety in case PartyKit server is unreachable
    const timer = setTimeout(() => {
      setLoading((curr) => {
        if (curr) {
          setError("Connection timeout. Make sure the host has the game open.");
          return false;
        }
        return curr;
      });
    }, 6000);

    try {
      socket.send(
        JSON.stringify({
          type: "PLAYER_JOIN",
          nickname: cleanNick,
          avatarType: selectedType,
          avatarColor: selectedColor,
        })
      );
    } catch (err) {
      clearTimeout(timer);
      setLoading(false);
      setError("Failed to send join request. Please retry.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-gray-900 flex flex-col p-4 sm:p-6 select-none font-sans">
      {/* Top Header with Back Button */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-4">
        <Link
          href="/showdown"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <IconArrowLeft size={14} />
          <span>Change PIN</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center -mt-2 pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md flex flex-col items-center text-center"
        >
          {!hasJoined ? (
            <>
              {/* Mascot Live Preview */}
              <div className="mb-4">
                <ShowdownCharacter
                  type={selectedType}
                  mood="waving"
                  color={selectedColor}
                  size={110}
                />
              </div>

              {/* Room Info Header */}
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-2">
                PIN: {pin}
              </span>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight mb-1">
                Join Showdown
              </h1>
              <p className="text-xs text-gray-400 font-medium mb-6">
                Choose your character mascot, pick a color skin, and enter nickname
              </p>

              {/* Form */}
              <form
                onSubmit={handleJoin}
                className="w-full bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 text-left"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-600 text-center">
                    {error}
                  </div>
                )}

                {/* 1. Character Roster Selector (6 Characters) */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">
                    1. CHOOSE CHARACTER MASCOT
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {SHOWDOWN_CHARACTERS.map((char) => {
                      const isSelected = char.id === selectedType;
                      return (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => {
                            setSelectedType(char.id);
                          }}
                          className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                              : "border-gray-100 bg-gray-50/70 hover:bg-gray-100/70"
                          }`}
                        >
                          <div className="h-12 flex items-center justify-center pointer-events-none">
                            <ShowdownCharacter
                              type={char.id}
                              mood="neutral"
                              color={isSelected ? selectedColor : char.defaultColor}
                              size={44}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-black tracking-tight ${
                              isSelected ? "text-blue-700" : "text-gray-700"
                            }`}
                          >
                            {char.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Avatar Color Skin Palette */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">
                    2. CHOOSE COLOR SKIN
                  </label>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {CHARACTER_SKINS.map((skin) => {
                      const isSelected = skin.color === selectedColor;
                      return (
                        <button
                          key={skin.id}
                          type="button"
                          onClick={() => setSelectedColor(skin.color)}
                          className={`w-8 h-8 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-gray-950 scale-110"
                              : "hover:scale-105 opacity-80 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: skin.color }}
                          title={skin.name}
                          aria-label={skin.name}
                        >
                          {isSelected && (
                            <IconCheck size={14} className="text-white" strokeWidth={3.5} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Nickname Input */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    3. YOUR NICKNAME
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    placeholder="e.g. PetroMaster"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center text-lg font-bold text-gray-950 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-text"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={!nickname.trim() || loading}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <IconLoader2 size={16} className="animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Game
                      <IconArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Waiting Room State */
            <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-10 flex flex-col items-center text-center">
              <div className="mb-6">
                <ShowdownCharacter
                  type={selectedType}
                  mood="happy"
                  color={selectedColor}
                  size={115}
                />
              </div>

              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full mb-3">
                <IconCircleCheck size={14} /> You Are In
              </span>

              <h2 className="text-2xl font-black text-gray-950 mb-1">{nickname}</h2>
              <p className="text-xs text-gray-400 font-medium mb-6">
                Look at the big screen. The game will start shortly.
              </p>

              <div className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-500 flex items-center justify-between">
                <span>Game PIN</span>
                <span className="font-mono text-gray-950 font-black">{pin}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
