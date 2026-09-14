import {
  Server,
  routePartykitRequest,
  type Connection,
  type ConnectionContext,
  type WSMessage,
} from "partyserver";

export type GameState =
  | "LOBBY"
  | "COUNTDOWN"
  | "QUESTION"
  | "REVEAL"
  | "LEADERBOARD"
  | "PODIUM";

export interface Option {
  id: number | string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  question_text: string;
  image_url?: string | null;
  time_limit: number;
  points: number;
  options: Option[];
  order_index: number;
}

export interface Player {
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

export type ProgressionMode = "MANUAL" | "AUTO";

export interface RoomState {
  pin: string;
  quizTitle: string;
  status: GameState;
  progressionMode: ProgressionMode;
  isPaused: boolean;
  pausedAt: number;
  currentQuestionIndex: number;
  questions: Question[];
  players: Record<string, Player>;
  questionStartedAt: number;
  answersCount: number;
  choiceDistribution: Record<string | number, number>;
  correctOptionId: string | number | null;
  isInitialized: boolean;
  hostConnectionId: string | null;
}

export class ShowdownRoom extends Server {
  state!: RoomState;

  private initState() {
    if (!this.state) {
      this.state = {
        pin: this.name,
        quizTitle: "SPE Showdown",
        status: "LOBBY",
        progressionMode: "MANUAL",
        isPaused: false,
        pausedAt: 0,
        currentQuestionIndex: 0,
        questions: [],
        players: {},
        questionStartedAt: 0,
        answersCount: 0,
        choiceDistribution: {},
        correctOptionId: null,
        isInitialized: false,
        hostConnectionId: null,
      };
    }
  }

  onStart() {
    this.initState();
  }

  onConnect(conn: Connection, ctx: ConnectionContext) {
    this.initState();
    // Send full current state to newly connected client
    conn.send(
      JSON.stringify({
        type: "SYNC_STATE",
        state: this.getPublicState(),
      })
    );
  }

  onClose(conn: Connection) {
    this.initState();
    // If the disconnected connection was the host, end the active session
    if (this.state.hostConnectionId && conn.id === this.state.hostConnectionId) {
      this.state.isInitialized = false;
      this.state.hostConnectionId = null;
      this.state.status = "LOBBY";
      this.state.questions = [];
      this.state.players = {};
      this.broadcast(
        JSON.stringify({
          type: "HOST_DISCONNECTED",
          message: "The host has disconnected or refreshed. Game session ended.",
        })
      );
      return;
    }

    // Mark disconnected if it's a player
    if (this.state.players[conn.id]) {
      this.state.players[conn.id].connected = false;
      this.broadcastState();
    }
  }

  onMessage(conn: Connection, message: WSMessage) {
    this.initState();
    try {
      const msgStr = typeof message === "string" ? message : new TextDecoder().decode(message);
      const data = JSON.parse(msgStr);

      switch (data.type) {
        // Host initializes quiz questions
        case "HOST_INIT": {
          this.state.hostConnectionId = conn.id;
          this.state.isInitialized = true;
          this.state.quizTitle = data.quizTitle || "SPE Showdown";
          this.state.questions = data.questions || [];
          this.state.status = "LOBBY";
          this.state.progressionMode = data.progressionMode === "AUTO" || data.mode === "AUTO" ? "AUTO" : "MANUAL";
          this.state.isPaused = false;
          this.state.pausedAt = 0;
          this.state.currentQuestionIndex = 0;
          if (!this.state.players) {
            this.state.players = {};
          }
          this.broadcastState();
          break;
        }

        // Host toggles progression mode in Lobby
        case "SET_PROGRESSION_MODE": {
          this.state.progressionMode = data.mode === "AUTO" ? "AUTO" : "MANUAL";
          this.broadcastState();
          break;
        }

        // Host pauses the active session
        case "PAUSE_GAME": {
          if (this.state.status !== "LOBBY" && this.state.status !== "PODIUM") {
            this.state.isPaused = true;
            this.state.pausedAt = Date.now();
            this.broadcastState();
          }
          break;
        }

        // Host resumes the paused session
        case "RESUME_GAME": {
          if (this.state.isPaused) {
            this.state.isPaused = false;
            if (this.state.pausedAt > 0) {
              const pausedDuration = Date.now() - this.state.pausedAt;
              this.state.questionStartedAt += pausedDuration;
              this.state.pausedAt = 0;
            }
            this.broadcastState();
          }
          break;
        }

        // Player joins lobby with nickname
        case "PLAYER_JOIN": {
          // Reject immediately if room is not hosted or not initialized
          if (
            !this.state.isInitialized ||
            !this.state.hostConnectionId ||
            !this.state.questions ||
            this.state.questions.length === 0
          ) {
            conn.send(
              JSON.stringify({
                type: "JOIN_ERROR",
                message: "Game PIN not found or session has ended. Please check the PIN on the host screen.",
              })
            );
            return;
          }

          const rawNick = (data.nickname || "").trim();
          if (!rawNick) {
            conn.send(JSON.stringify({ type: "JOIN_ERROR", message: "Nickname cannot be empty." }));
            return;
          }

          // Check if nickname is taken by another connected player
          const isTaken = Object.values(this.state.players).some(
            (p) => p.connected && p.nickname.toLowerCase() === rawNick.toLowerCase() && p.id !== conn.id
          );

          if (isTaken) {
            conn.send(
              JSON.stringify({
                type: "JOIN_ERROR",
                message: "Nickname is already taken. Please pick another.",
              })
            );
            return;
          }

          this.state.players[conn.id] = {
            id: conn.id,
            nickname: rawNick,
            avatarType: data.avatarType || "blobby",
            avatarColor: data.avatarColor || "#2563EB",
            score: 0,
            streak: 0,
            lastPoints: 0,
            lastAnswerCorrect: null,
            hasAnswered: false,
            connected: true,
          };

          conn.send(
            JSON.stringify({
              type: "JOIN_CONFIRMED",
              playerId: conn.id,
              nickname: rawNick,
              avatarType: data.avatarType || "blobby",
              avatarColor: data.avatarColor || "#2563EB",
            })
          );
          this.broadcastState();
          break;
        }

        // Host starts the game
        case "START_GAME": {
          if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            this.state.questions = data.questions;
          }
          if (data.progressionMode) {
            this.state.progressionMode = data.progressionMode === "AUTO" ? "AUTO" : "MANUAL";
          }
          if (this.state.questions.length === 0) return;
          this.state.status = "COUNTDOWN";
          this.state.currentQuestionIndex = 0;
          this.resetQuestionRound();
          this.broadcastState();
          break;
        }

        // Countdown finishes, question goes live
        case "QUESTION_GO": {
          this.state.status = "QUESTION";
          this.state.questionStartedAt = Date.now();
          this.resetQuestionRound();
          this.broadcastState();
          break;
        }

        // Player submits answer choice
        case "SUBMIT_ANSWER": {
          if (this.state.status !== "QUESTION" || this.state.isPaused) return;

          const player = this.state.players[conn.id];
          if (!player || player.hasAnswered) return;

          const currentQ = this.state.questions[this.state.currentQuestionIndex];
          if (!currentQ) return;

          const selectedOptionId = data.optionId;
          const selectedOptionIndex =
            typeof data.optionIndex === "number"
              ? data.optionIndex
              : typeof selectedOptionId === "number" && selectedOptionId >= 0 && selectedOptionId < currentQ.options.length
              ? selectedOptionId
              : -1;

          // Resolve chosen option cleanly by index or ID
          let selectedOption = null;
          if (
            typeof selectedOptionIndex === "number" &&
            selectedOptionIndex >= 0 &&
            selectedOptionIndex < currentQ.options.length
          ) {
            selectedOption = currentQ.options[selectedOptionIndex];
          } else if (selectedOptionId !== undefined && selectedOptionId !== null) {
            selectedOption =
              currentQ.options.find((o) => String(o.id) === String(selectedOptionId)) || null;
          }

          const correctOption = currentQ.options.find((o) => o.is_correct);
          const correctOptionIndex = currentQ.options.findIndex((o) => o.is_correct);

          let isCorrect = false;
          if (selectedOption) {
            isCorrect = Boolean(selectedOption.is_correct);
          } else if (correctOption) {
            if (String(correctOption.id) === String(selectedOptionId)) {
              isCorrect = true;
            } else if (correctOptionIndex !== -1 && selectedOptionIndex === correctOptionIndex) {
              isCorrect = true;
            }
          }

          // Calculate score based on response speed
          const elapsedSeconds = (Date.now() - this.state.questionStartedAt) / 1000;
          const totalSeconds = currentQ.time_limit || 20;
          const remainingFactor = Math.max(0, Math.min(1, (totalSeconds - elapsedSeconds) / totalSeconds));
          
          let pointsEarned = 0;
          if (isCorrect) {
            const basePoints = typeof currentQ.points === "number" ? currentQ.points : 10;
            if (basePoints === 0) {
              pointsEarned = 0;
            } else {
              const speedBonus = Math.round(basePoints * 0.5 * remainingFactor);
              const streakBonus = Math.min(
                Math.round(player.streak * 0.1 * basePoints),
                Math.round(basePoints * 0.3)
              );
              pointsEarned = Math.max(1, Math.round(basePoints * 0.5) + speedBonus + streakBonus);
            }

            player.score += pointsEarned;
            player.streak += 1;
            player.lastAnswerCorrect = true;
          } else {
            player.streak = 0;
            player.lastAnswerCorrect = false;
          }

          player.lastPoints = pointsEarned;
          player.hasAnswered = true;

          // Track distribution (by option ID and index)
          const distKey = selectedOption ? selectedOption.id : (selectedOptionId ?? selectedOptionIndex);
          this.state.choiceDistribution[distKey] =
            (this.state.choiceDistribution[distKey] || 0) + 1;
          this.state.answersCount = Object.values(this.state.players).filter((p) => p.hasAnswered).length;

          // Send confirmation back to player WITHOUT revealing isCorrect/points yet
          conn.send(
            JSON.stringify({
              type: "ANSWER_CONFIRMED",
              hasAnswered: true,
            })
          );

          // Broadcast progress
          this.broadcastState();

          // Auto-end question if all players answered
          const totalConnected = Object.values(this.state.players).filter((p) => p.connected).length;
          if (this.state.answersCount >= totalConnected && totalConnected > 0) {
            this.endQuestionRound();
          }
          break;
        }

        // Host ends question timer or triggers reveal
        case "END_QUESTION": {
          this.endQuestionRound();
          break;
        }

        // Host proceeds to Leaderboard
        case "SHOW_LEADERBOARD": {
          this.state.status = "LEADERBOARD";
          this.calculateRanks();
          this.broadcastState();
          break;
        }

        // Host advances to next question
        case "NEXT_QUESTION": {
          const nextIdx = this.state.currentQuestionIndex + 1;
          if (nextIdx >= this.state.questions.length) {
            // End of quiz -> Podium finale
            this.state.status = "PODIUM";
            this.calculateRanks();
          } else {
            this.state.currentQuestionIndex = nextIdx;
            this.state.status = "COUNTDOWN";
            this.resetQuestionRound();
          }
          this.broadcastState();
          break;
        }

        // Host restarts/resets game
        case "RESET_GAME": {
          this.state.status = "LOBBY";
          this.state.currentQuestionIndex = 0;
          this.state.answersCount = 0;
          this.state.choiceDistribution = {};
          this.state.correctOptionId = null;
          Object.values(this.state.players).forEach((p) => {
            p.score = 0;
            p.streak = 0;
            p.lastPoints = 0;
            p.lastAnswerCorrect = null;
            p.hasAnswered = false;
          });
          this.broadcastState();
          break;
        }

        // Host kicks a player
        case "KICK_PLAYER": {
          const targetId = data.playerId;
          if (this.state.players[targetId]) {
            delete this.state.players[targetId];
            this.broadcastState();
          }
          break;
        }
      }
    } catch (err) {
      console.error("[PartyServer] Error handling message:", err);
    }
  }

  private resetQuestionRound() {
    this.state.answersCount = 0;
    this.state.choiceDistribution = {};
    this.state.correctOptionId = null;
    Object.values(this.state.players).forEach((p) => {
      p.hasAnswered = false;
      p.lastPoints = 0;
      p.lastAnswerCorrect = null;
    });
  }

  private endQuestionRound() {
    this.state.status = "REVEAL";
    const currentQ = this.state.questions[this.state.currentQuestionIndex];
    if (currentQ) {
      const correctOpt = currentQ.options.find((o) => o.is_correct);
      this.state.correctOptionId = correctOpt ? correctOpt.id : null;
    }
    this.calculateRanks();
    this.broadcastState();
  }

  private calculateRanks() {
    const sorted = Object.values(this.state.players)
      .filter((p) => p.connected)
      .sort((a, b) => b.score - a.score);

    sorted.forEach((p, idx) => {
      if (this.state.players[p.id]) {
        this.state.players[p.id].rank = idx + 1;
      }
    });
  }

  private getPublicState() {
    const currentQ = this.state.questions[this.state.currentQuestionIndex];

    return {
      pin: this.state.pin,
      quizTitle: this.state.quizTitle,
      isInitialized: this.state.isInitialized,
      status: this.state.status,
      progressionMode: this.state.progressionMode,
      isPaused: this.state.isPaused,
      currentQuestionIndex: this.state.currentQuestionIndex,
      totalQuestions: this.state.questions.length,
      currentQuestion: currentQ
        ? {
            id: currentQ.id,
            question_text: currentQ.question_text,
            image_url: currentQ.image_url,
            time_limit: currentQ.time_limit,
            points: currentQ.points,
            order_index: currentQ.order_index,
            options: currentQ.options.map((o) => ({
              id: o.id,
              text: o.text,
              is_correct: this.state.status === "REVEAL" ? o.is_correct : undefined,
            })),
          }
        : null,
      players: Object.values(this.state.players).map((p) => {
        const isRevealOrLater =
          this.state.status === "REVEAL" ||
          this.state.status === "LEADERBOARD" ||
          this.state.status === "PODIUM";

        return {
          id: p.id,
          nickname: p.nickname,
          avatarType: p.avatarType || "blobby",
          avatarColor: p.avatarColor || "#2563EB",
          score: isRevealOrLater ? p.score : p.score - (p.hasAnswered ? p.lastPoints : 0),
          streak: p.streak,
          lastPoints: isRevealOrLater ? p.lastPoints : 0,
          lastAnswerCorrect: isRevealOrLater ? p.lastAnswerCorrect : null,
          hasAnswered: p.hasAnswered,
          connected: p.connected,
          rank: p.rank,
        };
      }),
      answersCount: this.state.answersCount,
      choiceDistribution: this.state.status === "REVEAL" ? this.state.choiceDistribution : {},
      correctOptionId: this.state.status === "REVEAL" ? this.state.correctOptionId : null,
    };
  }

  private broadcastState() {
    this.broadcast(
      JSON.stringify({
        type: "STATE_UPDATE",
        state: this.getPublicState(),
      })
    );
  }
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const res = await routePartykitRequest(request, env, { cors: true });
    if (res) return res;
    return new Response(JSON.stringify({ status: "ok", service: "SPE Showdown Realtime" }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
