import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/showdown/history
 * Fetch past Showdown game sessions
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quiz_id");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let query = supabase
      .from("showdown_history")
      .select("*")
      .order("hosted_at", { ascending: false })
      .limit(limit);

    if (quizId) {
      query = query.eq("quiz_id", quizId);
    }

    const { data: history, error: hErr } = await query;

    if (hErr) {
      console.error("GET /api/showdown/history DB error:", hErr);
      return NextResponse.json({ error: hErr.message }, { status: 500 });
    }

    return NextResponse.json(history || []);
  } catch (err) {
    console.error("GET /api/showdown/history error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/showdown/history
 * Save a completed Showdown game session result
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      quiz_id,
      quiz_title,
      pin,
      total_players,
      top_three,
      players_leaderboard,
    } = body;

    if (!pin || !quiz_title) {
      return NextResponse.json(
        { error: "PIN and quiz_title are required to record history" },
        { status: 400 }
      );
    }

    const { data: record, error: insertErr } = await supabase
      .from("showdown_history")
      .insert({
        quiz_id: quiz_id || null,
        quiz_title: quiz_title || "SPE Showdown",
        pin: String(pin),
        total_players: typeof total_players === "number" ? total_players : 0,
        top_three: Array.isArray(top_three) ? top_three : [],
        players_leaderboard: Array.isArray(players_leaderboard) ? players_leaderboard : [],
        hosted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      console.error("POST /api/showdown/history DB error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error("POST /api/showdown/history error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
