"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QuizEditorForm, { QuestionDraft } from "@/components/QuizEditorForm";
import { IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";

export default function EditShowdownQuizPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const [quiz, setQuiz] = useState<{
    id: string;
    title: string;
    description: string;
    category: string;
    questions: QuestionDraft[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/showdown/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        setError("Quiz not found or unable to load details.");
      }
    } catch {
      setError("Failed to load quiz details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center min-h-[60vh] bg-[#f8faff]">
        <IconLoader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <h2 className="text-lg font-black text-gray-900 mb-2">Quiz Not Found</h2>
        <p className="text-xs text-gray-400 font-medium mb-6">{error || "Unable to locate this quiz."}</p>
        <Link
          href="/showdown/host"
          className="inline-flex items-center px-6 py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
        >
          Back to Showdown Hub
        </Link>
      </div>
    );
  }

  return <QuizEditorForm initialQuiz={quiz} isEdit={true} />;
}
