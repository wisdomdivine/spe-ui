import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/showdown/[id]
 * Fetch single quiz with its questions
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    const { data: quiz, error: quizErr } = await supabase
      .from("showdown_quizzes")
      .select("*, showdown_questions(*)")
      .eq("id", id)
      .maybeSingle();

    if (quizErr) {
      console.error("GET /api/showdown/[id] DB error:", quizErr);
      return NextResponse.json({ error: quizErr.message }, { status: 500 });
    }

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const questions = (quiz.showdown_questions || []).sort(
      (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
    );

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      is_published: quiz.is_published,
      created_at: quiz.created_at,
      questions,
    });
  } catch (err) {
    console.error("GET /api/showdown/[id] uncaught error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/showdown/[id]
 * Update a quiz metadata and replace its questions
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, category, is_published, questions } = body;

    // Update Quiz Metadata
    const { data: updatedQuiz, error: uErr } = await supabase
      .from("showdown_quizzes")
      .update({
        title: title.trim(),
        description: description ? description.trim() : "",
        category: category || "General",
        is_published: is_published ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    // Replace Questions if provided
    if (Array.isArray(questions)) {
      // Delete old questions
      await supabase.from("showdown_questions").delete().eq("quiz_id", id);

      if (questions.length > 0) {
        const qRows = questions.map((q: any, idx: number) => ({
          quiz_id: id,
          question_text: q.question_text || `Question ${idx + 1}`,
          image_url: q.image_url || null,
          time_limit: q.time_limit || 20,
          points: typeof q.points === "number" ? q.points : 10,
          order_index: idx + 1,
          options: q.options || [],
          explanation: q.explanation || null,
        }));

        await supabase.from("showdown_questions").insert(qRows);
      }
    }

    return NextResponse.json(updatedQuiz);
  } catch (err) {
    console.error("PUT /api/showdown/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/showdown/[id]
 * Delete a quiz (cascades questions)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("showdown_quizzes")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/showdown/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
