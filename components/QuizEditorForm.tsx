"use client";

import { useState, useRef, useEffect } from "react";
import { showAlert } from "@/components/CustomDialog";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconLoader2,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconAward,
  IconTag,
  IconPhoto,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import Link from "next/link";
import { OPTION_COLORS } from "@/lib/showdown";
import ExcelQuestionUploadModal from "@/components/ExcelQuestionUploadModal";

export interface QuestionDraft {
  id?: string;
  question_text: string;
  image_url?: string;
  time_limit: number;
  points: number;
  options: {
    id: number;
    text: string;
    is_correct: boolean;
  }[];
}

interface QuizEditorFormProps {
  initialQuiz?: {
    id?: string;
    title: string;
    description: string;
    category: string;
    questions: QuestionDraft[];
  };
  isEdit?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "Petroleum", label: "Petroleum" },
  { value: "General Energy", label: "General Energy" },
  { value: "Chapter Trivia", label: "Chapter Trivia" },
  { value: "Engineering", label: "Engineering" },
  { value: "General", label: "General" },
];

const TIMER_OPTIONS = [
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 20, label: "20s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
];

/** Minimalist Info Tooltip for field explanations */
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="w-4 h-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 text-[9px] font-black flex items-center justify-center cursor-pointer transition-colors"
        aria-label="Info"
      >
        i
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 w-56 p-3 bg-gray-950 text-white text-[11px] font-medium leading-relaxed rounded-2xl border border-gray-800 pointer-events-none"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Custom Reusable Dropdown adhering strictly to SPEUI minimalism */
function CustomDropdown<T extends string | number>({
  value,
  options,
  onChange,
  icon,
  className = "",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((o) => String(o.value) === String(value)) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold text-sm text-gray-900 flex items-center justify-between gap-3 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all hover:bg-gray-100/80 cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          {icon}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <IconChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-none space-y-0.5 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <IconCheck size={14} className="text-blue-600" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const defaultQuestion = (idx: number): QuestionDraft => ({
  question_text: "",
  image_url: "",
  time_limit: 20,
  points: 10,
  options: [
    { id: 1, text: "", is_correct: true },
    { id: 2, text: "", is_correct: false },
    { id: 3, text: "", is_correct: false },
    { id: 4, text: "", is_correct: false },
  ],
});

export default function QuizEditorForm({ initialQuiz, isEdit = false }: QuizEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialQuiz?.title || "");
  const [description, setDescription] = useState(initialQuiz?.description || "");
  const [category, setCategory] = useState(initialQuiz?.category || "Petroleum");
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialQuiz?.questions && initialQuiz.questions.length > 0
      ? initialQuiz.questions
      : [defaultQuestion(1)]
  );

  const [activeQIndex, setActiveQIndex] = useState(0);
  const [customPointsMode, setCustomPointsMode] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showExcelModal, setShowExcelModal] = useState(false);

  const activeQ = questions[activeQIndex] || questions[0];

  const handleExcelImport = (importedQuestions: QuestionDraft[], mode: "replace" | "append") => {
    if (mode === "replace") {
      setQuestions(importedQuestions);
      setActiveQIndex(0);
    } else {
      const nextList = [...questions, ...importedQuestions];
      setQuestions(nextList);
      setActiveQIndex(questions.length);
    }
  };

  const updateActiveQuestion = (patch: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === activeQIndex ? { ...q, ...patch } : q))
    );
  };

  const updateOptionText = (optIndex: number, text: string) => {
    const nextOpts = activeQ.options.map((opt, i) =>
      i === optIndex ? { ...opt, text } : opt
    );
    updateActiveQuestion({ options: nextOpts });
  };

  const setCorrectOption = (optIndex: number) => {
    const nextOpts = activeQ.options.map((opt, i) => ({
      ...opt,
      is_correct: i === optIndex,
    }));
    updateActiveQuestion({ options: nextOpts });
  };

  const addQuestion = () => {
    const nextList = [...questions, defaultQuestion(questions.length + 1)];
    setQuestions(nextList);
    setActiveQIndex(nextList.length - 1);
  };

  const removeQuestion = (indexToRemove: number) => {
    if (questions.length <= 1) {
      showAlert("A quiz must have at least one question.");
      return;
    }
    const nextList = questions.filter((_, i) => i !== indexToRemove);
    setQuestions(nextList);
    setActiveQIndex(Math.max(0, indexToRemove - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a title for the quiz.");
      return;
    }

    // Validate each question has text and at least 2 non-empty options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} has empty text.`);
        setActiveQIndex(i);
        return;
      }
      const filledOptions = q.options.filter((o) => o.text.trim().length > 0);
      if (filledOptions.length < 2) {
        setError(`Question ${i + 1} needs at least 2 answer choices.`);
        setActiveQIndex(i);
        return;
      }
      const hasCorrect = q.options.some((o) => o.is_correct && o.text.trim().length > 0);
      if (!hasCorrect) {
        setError(`Question ${i + 1} must have a marked correct answer.`);
        setActiveQIndex(i);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        questions,
      };

      const url = isEdit ? `/api/showdown/${initialQuiz?.id}` : "/api/showdown";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/showdown/host");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to save quiz");
      }
    } catch {
      setError("Network error while saving quiz.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-12 min-h-screen bg-[#f8faff] text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/showdown/host"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors mb-3"
            >
              <IconArrowLeft size={16} />
              Back to Showdown Hub
            </Link>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              {isEdit ? "Edit Showdown Quiz" : "Create New Showdown Quiz"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowExcelModal(true)}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <IconFileSpreadsheet size={16} className="text-green-600" />
              <span>Import Excel / CSV</span>
            </button>
            <Link
              href="/showdown/host"
              className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-2xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Quiz"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        {/* General Details Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 mb-8 space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Quiz Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Quiz Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Reservoir Engineering Finals 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-300 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Category
              </label>
              <CustomDropdown
                value={category}
                options={CATEGORY_OPTIONS}
                onChange={(val) => setCategory(val)}
                icon={<IconTag size={16} className="text-blue-500" />}
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Description
              </label>
              <input
                type="text"
                placeholder="Brief summary or context for attendees..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-300 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Question Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Questions List / Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Questions ({questions.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExcelModal(true)}
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-green-600 hover:text-green-700 cursor-pointer"
                    title="Import questions from spreadsheet"
                  >
                    <IconFileSpreadsheet size={13} /> Excel
                  </button>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <IconPlus size={14} /> Add
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isActive = idx === activeQIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveQIndex(idx)}
                      className={`group p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isActive
                          ? "border-blue-600 bg-blue-50/50"
                          : "border-gray-100 bg-gray-50/50 hover:bg-gray-100/70"
                      }`}
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            Q{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {q.time_limit}s
                          </span>
                          <span className="text-[10px] font-bold text-gray-300">
                            •
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {q.points !== undefined && q.points !== null ? q.points : 10} pts
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {q.question_text || "Untitled Question"}
                        </p>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(idx);
                          }}
                          className="p-1 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="w-full mt-4 py-3 rounded-2xl border border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <IconPlus size={14} />
                Add Question
              </button>
            </div>
          </div>

          {/* Right Column: Active Question Workspace */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6">
              {/* Question Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white bg-gray-950 px-3 py-1 rounded-xl">
                    Question {activeQIndex + 1}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Custom Timer Selector */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Timer:
                      </span>
                      <InfoTooltip text="The countdown duration for this question. Faster answers earn more speed-bonus points." />
                    </div>
                    <CustomDropdown
                      value={activeQ.time_limit}
                      options={TIMER_OPTIONS}
                      onChange={(val) => updateActiveQuestion({ time_limit: Number(val) })}
                      icon={<IconClock size={14} className="text-blue-500" />}
                      className="min-w-[110px]"
                    />
                  </div>

                  {/* Custom Points Selector */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Points:
                      </span>
                      <InfoTooltip text="Base score for correct answers: Standard (10 pts), Double (20 pts), No Points (0 pts), or set a custom score." />
                    </div>
                    {(() => {
                      const isCustom =
                        Boolean(customPointsMode[activeQIndex]) ||
                        ![10, 20, 0].includes(activeQ.points);
                      const currentVal = isCustom ? "custom" : String(activeQ.points ?? 10);
                      const options = [
                        { value: "10", label: "Standard (10 pts)" },
                        { value: "20", label: "Double (20 pts)" },
                        { value: "0", label: "No Points (0 pts)" },
                        {
                          value: "custom",
                          label: isCustom
                            ? `Custom (${activeQ.points ?? 10} pts)`
                            : "Custom Score...",
                        },
                      ];

                      return (
                        <div className="flex items-center gap-2">
                          <CustomDropdown
                            value={currentVal}
                            options={options}
                            onChange={(val) => {
                              if (val === "custom") {
                                setCustomPointsMode((prev) => ({
                                  ...prev,
                                  [activeQIndex]: true,
                                }));
                              } else {
                                setCustomPointsMode((prev) => ({
                                  ...prev,
                                  [activeQIndex]: false,
                                }));
                                updateActiveQuestion({ points: Number(val) });
                              }
                            }}
                            icon={<IconAward size={14} className="text-amber-500" />}
                            className="min-w-[185px]"
                          />
                          {isCustom && (
                            <div className="flex items-center gap-1.5 bg-gray-50 rounded-2xl px-3.5 py-3 border border-gray-100">
                              <input
                                type="number"
                                min={0}
                                max={10000}
                                step={1}
                                value={activeQ.points ?? 10}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                  updateActiveQuestion({ points: val });
                                }}
                                placeholder="Pts"
                                className="w-16 bg-transparent border-none text-xs font-bold text-gray-900 focus:outline-none text-center cursor-text"
                                autoFocus
                              />
                              <span className="text-[10px] font-black text-gray-400 uppercase">
                                pts
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Question Text Area */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Question Text *
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter your question here (e.g. What parameter does Darcy's Law primarily calculate in porous media?)"
                  value={activeQ.question_text}
                  onChange={(e) => updateActiveQuestion({ question_text: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-300 resize-none outline-none transition-all cursor-text"
                />
              </div>

              {/* Question Image or Diagram */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <IconPhoto size={12} className="text-blue-500" />
                    Question Image or Diagram URL (Optional)
                  </label>
                  {activeQ.image_url && (
                    <button
                      type="button"
                      onClick={() => updateActiveQuestion({ image_url: "" })}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {activeQ.image_url && (
                  <div className="relative group w-full h-44 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={activeQ.image_url}
                      alt="Question Diagram"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                )}

                <input
                  type="url"
                  placeholder="Paste direct image or diagram URL (e.g. https://...)"
                  value={activeQ.image_url || ""}
                  onChange={(e) => updateActiveQuestion({ image_url: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 font-medium text-xs text-gray-900 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-300 outline-none transition-all cursor-text"
                />
              </div>

              {/* 4 Answer Choice Boxes (Brand Palette: Blue, Teal, Amber, Indigo) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Answer Choices (Select the correct option)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeQ.options.map((opt, optIdx) => {
                    const colorSpec = OPTION_COLORS[optIdx] || OPTION_COLORS[0];
                    const isCorrect = opt.is_correct;

                    return (
                      <div
                        key={opt.id || optIdx}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCorrect
                            ? "border-green-600 bg-green-50/30"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white ${colorSpec.bg}`}
                          >
                            {colorSpec.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => setCorrectOption(optIdx)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                              isCorrect
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                          >
                            <IconCheck size={12} strokeWidth={3} />
                            {isCorrect ? "Correct" : "Mark Correct"}
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder={`Option ${colorSpec.label} text...`}
                          value={opt.text}
                          onChange={(e) => updateOptionText(optIdx, e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-300 outline-none transition-all cursor-text"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Excel Bulk Upload Modal */}
      <ExcelQuestionUploadModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onImport={handleExcelImport}
        existingCount={questions.length}
      />
    </div>
  );
}
