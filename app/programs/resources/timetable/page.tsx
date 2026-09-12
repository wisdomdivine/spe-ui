"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconX,
  IconClock,
  IconBook,
  IconSchool,
  IconMessage,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconArrowLeft,
  IconSend,
  IconCalendar,
  IconDownload,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Note {
  id: string;
  course_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: string;
  timetable_id: string;
  name: string;
  day: string;
  start_time: string;
  end_time: string;
  created_at: string;
  course_notes: Note[];
}

interface Timetable {
  id: string;
  level: number;
  type: string;
  created_at: string;
  courses: Course[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const LEVELS = [100, 200, 300, 400, 500];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Course Card                                                        */
/* ------------------------------------------------------------------ */
function CourseCard({
  course,
  onEdit,
  onDelete,
  onRefresh,
}: {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const notes = course.course_notes?.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) ?? [];

  async function addNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch("/api/timetable/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: course.id, content: newNote }),
      });
      if (res.ok) {
        setNewNote("");
        onRefresh();
      }
    } catch {
      /* ignore */
    }
    setAddingNote(false);
  }

  async function updateNote(noteId: string) {
    if (!editNoteContent.trim()) return;
    try {
      const res = await fetch(`/api/timetable/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editNoteContent }),
      });
      if (res.ok) {
        setEditingNoteId(null);
        onRefresh();
      }
    } catch {
      /* ignore */
    }
  }

  async function deleteNote(noteId: string) {
    setDeletingNoteId(noteId);
    try {
      const res = await fetch(`/api/timetable/notes/${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
    } catch {
      /* ignore */
    }
    setDeletingNoteId(null);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      {/* Course header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{course.name}</h3>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-400">
              <IconClock size={13} />
              <span className="font-medium">
                {formatTime(course.start_time)} - {formatTime(course.end_time)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="p-2 rounded-xl text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit course"
            >
              <IconPencil size={15} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete course"
            >
              <IconTrash size={15} />
            </button>
          </div>
        </div>

        {/* Notes toggle */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1.5 mt-3 text-xs font-bold text-gray-300 hover:text-blue-600 transition-colors"
        >
          <IconMessage size={12} />
          <span>{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
          {showNotes ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
        </button>
      </div>

      {/* Notes section */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-50 px-4 sm:px-5 py-3 bg-gray-50/50 space-y-3">
              {/* Existing notes */}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-xl p-3 border border-gray-100"
                >
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateNote(note.id)}
                          className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-300 font-medium">
                          {timeAgo(note.updated_at || note.created_at)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditNoteContent(note.content);
                            }}
                            className="p-1 text-gray-300 hover:text-blue-600 transition-colors"
                            title="Edit note"
                          >
                            <IconPencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            disabled={deletingNoteId === note.id}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete note"
                          >
                            <IconTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add note */}
              <div className="flex gap-2">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  placeholder="Add a note (e.g. class postponed)..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white placeholder:text-gray-300"
                />
                <button
                  onClick={addNote}
                  disabled={addingNote || !newNote.trim()}
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {addingNote ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    <IconSend size={16} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Course Form Modal                                                  */
/* ------------------------------------------------------------------ */
function CourseFormModal({
  timetableId,
  editingCourse,
  onClose,
  onSaved,
}: {
  timetableId: string;
  editingCourse: Course | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(editingCourse?.name ?? "");
  const [day, setDay] = useState(editingCourse?.day ?? "Mon");
  const [startTime, setStartTime] = useState(editingCourse?.start_time ?? "08:00");
  const [endTime, setEndTime] = useState(editingCourse?.end_time ?? "09:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Course name is required");
      return;
    }
    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingCourse
        ? `/api/timetable/courses/${editingCourse.id}`
        : "/api/timetable/courses";

      const res = await fetch(url, {
        method: editingCourse ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingCourse ? {} : { timetable_id: timetableId }),
          name,
          day,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save");
        setSaving(false);
        return;
      }

      onSaved();
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {editingCourse ? "Edit Course" : "Add Course"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Course name */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Course Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PET 301 - Reservoir Engineering"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-gray-300"
              autoFocus
            />
          </div>

          {/* Day */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Day
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    day === d
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-500">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <IconLoader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : editingCourse ? (
            "Update Course"
          ) : (
            "Add Course"
          )}
        </button>
      </motion.form>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */
function DeleteModal({
  courseName,
  onConfirm,
  onCancel,
  deleting,
}: {
  courseName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <IconTrash size={20} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Delete Course</h3>
        <p className="text-sm text-gray-400 mb-6">
          Remove <span className="font-semibold text-gray-600">{courseName}</span> and
          all its notes? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <IconLoader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function TimetablePage() {
  const [level, setLevel] = useState(100);
  const [type, setType] = useState<"class" | "exam">("class");
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);

  /* Modal state */
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* Export timetable to CSV file */
  const downloadTimetableCSV = () => {
    if (!timetable || !timetable.courses || timetable.courses.length === 0) return;

    const headers = ["Course Name", "Day", "Start Time", "End Time", "Notes"];

    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sortedCourses = [...timetable.courses].sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.start_time.localeCompare(b.start_time);
    });

    const rows = sortedCourses.map((c) => {
      const notesText = (c.course_notes || [])
        .map((n) => n.content.replace(/"/g, '""'))
        .join(" | ");

      return [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${DAY_LABELS[c.day] || c.day}"`,
        `"${formatTime(c.start_time)}"`,
        `"${formatTime(c.end_time)}"`,
        `"${notesText}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${level}L_${type}_timetable.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* Fetch timetable */
  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/timetable?level=${level}&type=${type}`
      );
      const d = await res.json();
      if (res.ok) setTimetable(d.timetable);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [level, type]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  /* Courses for selected day, sorted by time */
  const dayCourses = (timetable?.courses ?? [])
    .filter((c) => c.day === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  /* Total course count for display */
  const totalCourses = timetable?.courses?.length ?? 0;

  /* Delete a course */
  async function handleDelete() {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/timetable/courses/${deletingCourse.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setDeletingCourse(null);
        fetchTimetable();
      }
    } catch {
      /* ignore */
    }
    setIsDeleting(false);
  }

  /* Count courses per day (for badges) */
  const dayCounts: Record<string, number> = {};
  for (const d of DAYS) {
    dayCounts[d] = (timetable?.courses ?? []).filter(
      (c) => c.day === d
    ).length;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-28 pb-24 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-24 max-w-4xl">
          {/* Back link */}
          <Link
            href="/programs/resources"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-300 hover:text-blue-600 transition-colors mb-8"
          >
            <IconArrowLeft size={14} />
            Resources
          </Link>

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">
              Community Tool
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Class Timetable
            </h1>
            <p className="mt-3 text-base font-medium text-gray-400 max-w-xl">
              Community-managed timetable for each level. Anyone can add, edit
              or remove courses and leave notes.
            </p>
          </motion.div>

          {/* Level pills */}
          <div className="flex gap-2 flex-wrap mb-4">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  level === l
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {l} Level
              </button>
            ))}
          </div>

          {/* Type toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setType("class")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === "class"
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                  : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <IconBook size={15} />
              Lecture Schedule
            </button>
            <button
              onClick={() => setType("exam")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === "exam"
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                  : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <IconSchool size={15} />
              Exams
            </button>
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold text-gray-300">
              {level} Level - {type === "class" ? "Class" : "Exam"} Timetable
              {totalCourses > 0 && (
                <span className="ml-2 text-blue-600">
                  ({totalCourses} {totalCourses === 1 ? "course" : "courses"})
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {timetable && (timetable.courses ?? []).length > 0 && (
                <button
                  onClick={downloadTimetableCSV}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 text-xs font-bold transition-all outline-none"
                >
                  <IconDownload size={14} />
                  Download CSV
                </button>
              )}
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setShowForm(true);
                }}
                disabled={loading || !timetable}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                <IconPlus size={14} />
                Add Course
              </button>
            </div>
          </div>

          {/* Day tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDay === d
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {DAY_LABELS[d]}
                {dayCounts[d] > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      selectedDay === d
                        ? "bg-white/20 text-white"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {dayCounts[d]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center py-20">
              <IconLoader2
                size={32}
                className="text-blue-600 animate-spin mb-4"
              />
              <p className="text-sm font-medium text-gray-300">
                Loading timetable...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && dayCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
                <IconCalendar size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-1">
                No courses on {DAY_LABELS[selectedDay]}
              </p>
              <p className="text-xs text-gray-300 mb-5">
                Tap &quot;Add Course&quot; to add one
              </p>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setShowForm(true);
                }}
                disabled={!timetable}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <IconPlus size={14} />
                Add Course
              </button>
            </motion.div>
          )}

          {/* Course list */}
          {!loading && dayCourses.length > 0 && (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {dayCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEdit={() => {
                      setEditingCourse(course);
                      setShowForm(true);
                    }}
                    onDelete={() => setDeletingCourse(course)}
                    onRefresh={fetchTimetable}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Course form modal */}
      <AnimatePresence>
        {showForm && timetable && (
          <CourseFormModal
            timetableId={timetable.id}
            editingCourse={editingCourse}
            onClose={() => {
              setShowForm(false);
              setEditingCourse(null);
            }}
            onSaved={() => {
              setShowForm(false);
              setEditingCourse(null);
              fetchTimetable();
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deletingCourse && (
          <DeleteModal
            courseName={deletingCourse.name}
            onConfirm={handleDelete}
            onCancel={() => setDeletingCourse(null)}
            deleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
