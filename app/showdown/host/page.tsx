"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconDeviceGamepad2,
  IconPlayerPlay,
  IconArrowLeft,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  question_count: number;
  created_at: string;
}

export default function ShowdownHostDashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/showdown");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(Array.isArray(data) ? data : []);
      }
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz? All questions will be removed.")) return;
    try {
      const res = await fetch(`/api/showdown/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
      }
    } catch {
      console.error("Failed to delete quiz");
    }
  };

  const categories = ["All", ...Array.from(new Set(quizzes.map((q) => q.category).filter(Boolean)))];

  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recent";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.question_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-gray-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href="/programs/resources/showdown"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
            >
              <IconArrowLeft size={14} />
              Back to Showdown Overview
            </Link>

            <Link
              href="/showdown"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              <IconDeviceGamepad2 size={14} />
              Join with PIN
            </Link>
          </div>

          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Live Arena
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                Showdown Quizzes & Live Hosting
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Create, edit, and host live multiplayer competitions for chapter sessions.
              </p>
            </div>

            <Link
              href="/showdown/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3.5 rounded-2xl transition-colors shrink-0 cursor-pointer"
            >
              <IconPlus size={16} />
              Create Quiz
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-3xl bg-white border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Total Quizzes
              </p>
              <p className="text-2xl font-black text-gray-950">{quizzes.length}</p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Total Questions
              </p>
              <p className="text-2xl font-black text-gray-950">{totalQuestions}</p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Platform Status
              </p>
              <p className="text-2xl font-black text-blue-600">Active</p>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white rounded-3xl border border-gray-100 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <IconSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search quizzes by title or topic..."
                className="w-full bg-gray-50 border-none rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-gray-950 text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quizzes Table */}
          {loading ? (
            <div className="p-16 flex items-center justify-center bg-white rounded-3xl border border-gray-100 min-h-[300px]">
              <IconLoader2 className="animate-spin text-blue-600" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mx-auto mb-4">
                <IconDeviceGamepad2 size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No quizzes found</h3>
              <p className="text-xs text-gray-400 font-medium mb-6">
                {search ? "No quizzes match your search." : "Get started by creating your first Showdown quiz."}
              </p>
              <Link
                href="/showdown/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <IconPlus size={14} />
                Create Quiz
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-5">Quiz Title</th>
                      <th className="px-6 py-5">Category</th>
                      <th className="px-6 py-5">Questions</th>
                      <th className="px-6 py-5">Created</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-950 text-sm">{quiz.title}</div>
                          {quiz.description && (
                            <div className="text-xs text-gray-400 font-medium line-clamp-1 max-w-md mt-0.5">
                              {quiz.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                            {quiz.category || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-gray-700">
                            {quiz.question_count} {quiz.question_count === 1 ? "question" : "questions"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-400">
                          {formatDate(quiz.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/showdown/${quiz.id}/host`}
                              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                              <IconPlayerPlay size={14} />
                              Host Live
                            </Link>
                            <Link
                              href={`/showdown/${quiz.id}/edit`}
                              className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Edit Quiz"
                            >
                              <IconEdit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(quiz.id)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Quiz"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
