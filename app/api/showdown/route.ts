import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/showdown
 * List all Showdown quizzes with question counts
 */
export async function GET() {
  try {
    const { data: quizzes, error: qErr } = await supabase
      .from("showdown_quizzes")
      .select("*, showdown_questions(count)")
      .order("created_at", { ascending: false });

    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    const formatted = (quizzes || []).map((q: any) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      is_published: q.is_published,
      created_at: q.created_at,
      question_count: q.showdown_questions?.[0]?.count || 0,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/showdown error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/showdown
 * Create a new quiz with questions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, questions } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Quiz title is required" }, { status: 400 });
    }

    // Insert Quiz
    const { data: quiz, error: quizErr } = await supabase
      .from("showdown_quizzes")
      .insert({
        title: title.trim(),
        description: description ? description.trim() : "",
        category: category || "General",
        created_by: "Host",
      })
      .select()
      .single();

    if (quizErr || !quiz) {
      return NextResponse.json({ error: quizErr?.message || "Failed to create quiz" }, { status: 500 });
    }

    // Insert Questions if provided
    if (Array.isArray(questions) && questions.length > 0) {
      const qRows = questions.map((q: any, idx: number) => ({
        quiz_id: quiz.id,
        question_text: q.question_text || `Question ${idx + 1}`,
        image_url: q.image_url || null,
        time_limit: q.time_limit || 20,
        points: typeof q.points === "number" ? q.points : 10,
        order_index: idx + 1,
        options: q.options || [],
        explanation: q.explanation || null,
      }));

      const { error: insErr } = await supabase.from("showdown_questions").insert(qRows);
      if (insErr) {
        console.error("Error inserting questions:", insErr);
      }
    }

    return NextResponse.json(quiz, { status: 201 });
  } catch (err) {
    console.error("POST /api/showdown error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
