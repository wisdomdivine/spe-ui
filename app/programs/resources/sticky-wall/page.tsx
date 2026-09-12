"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconNote,
  IconPlus,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconX,
  IconSend,
  IconLoader2,
  IconRefresh,
  IconArrowLeft,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  author: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CANVAS_SIZE = 4000;
const COLORS = [
  { id: "yellow", bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-900", dot: "bg-amber-400" },
  { id: "blue", bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-900", dot: "bg-blue-400" },
  { id: "green", bg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-900", dot: "bg-emerald-400" },
  { id: "pink", bg: "bg-pink-100", border: "border-pink-200", text: "text-pink-900", dot: "bg-pink-400" },
  { id: "purple", bg: "bg-violet-100", border: "border-violet-200", text: "text-violet-900", dot: "bg-violet-400" },
  { id: "orange", bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-900", dot: "bg-orange-400" },
];

function getColorClasses(colorId: string) {
  return COLORS.find((c) => c.id === colorId) || COLORS[0];
}

/** Deterministic rotation from note ID so it never changes between renders/refreshes */
function getStableRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return (hash % 700) / 100; // roughly -3.5 to +3.5 degrees, always the same for a given ID
}

/* ------------------------------------------------------------------ */
/*  Sticky Note Component                                              */
/* ------------------------------------------------------------------ */
function StickyNoteCard({ note }: { note: Note }) {
  const c = getColorClasses(note.color);
  const rotation = getStableRotation(note.id);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`absolute w-44 sm:w-48 ${c.bg} ${c.border} border rounded-xl p-4 shadow-md hover:shadow-lg hover:z-50 transition-shadow cursor-default group`}
      style={{ left: note.x, top: note.y, transform: `rotate(${rotation}deg)` }}
    >
      <p className={`text-sm font-medium leading-relaxed ${c.text} break-words`}>
        {note.content}
      </p>
      {note.author && (
        <p className={`mt-3 text-[10px] font-bold ${c.text} opacity-50 uppercase tracking-wider`}>
          - {note.author}
        </p>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Create Note Form                                                   */
/* ------------------------------------------------------------------ */
function CreateNoteForm({
  position,
  onSubmit,
  onCancel,
  loading,
}: {
  position: { x: number; y: number };
  onSubmit: (content: string, color: string, author: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [content, setContent] = useState("");
  const [color, setColor] = useState("yellow");
  const [author, setAuthor] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">New Sticky Note</h3>
            <p className="text-xs font-medium text-gray-400 mt-1">Leave a message for others to see</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Message *</label>
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 200))}
              placeholder="Write something inspiring, funny, or helpful..."
              rows={3}
              className="w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-50 resize-none"
            />
            <p className="text-right text-[10px] font-bold text-gray-300 mt-1">{content.length}/200</p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Name (optional)</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value.slice(0, 30))}
              placeholder="Anonymous"
              className="w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-8 h-8 rounded-lg ${c.dot} transition-all ${
                    color === c.id ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => content.trim() && onSubmit(content.trim(), color, author.trim())}
          disabled={!content.trim() || loading}
          className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <>
              <IconSend size={14} />
              Post Note
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Minimap                                                            */
/* ------------------------------------------------------------------ */
function Minimap({
  notes,
  viewportX,
  viewportY,
  viewportWidth,
  viewportHeight,
  zoom,
  onNavigate,
}: {
  notes: Note[];
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  onNavigate: (x: number, y: number) => void;
}) {
  const MINIMAP_SIZE = 120;
  const scale = MINIMAP_SIZE / CANVAS_SIZE;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const canvasX = mx / scale - viewportWidth / zoom / 2;
    const canvasY = my / scale - viewportHeight / zoom / 2;
    onNavigate(-canvasX * zoom, -canvasY * zoom);
  };

  return (
    <div
      onClick={handleClick}
      className="w-[120px] h-[120px] bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl overflow-hidden cursor-crosshair shadow-lg"
    >
      {/* Notes dots */}
      {notes.map((note) => {
        const c = getColorClasses(note.color);
        return (
          <div
            key={note.id}
            className={`absolute w-1.5 h-1.5 rounded-sm ${c.dot}`}
            style={{ left: note.x * scale, top: note.y * scale }}
          />
        );
      })}
      {/* Viewport indicator */}
      <div
        className="absolute border-2 border-blue-500 rounded bg-blue-500/10"
        style={{
          left: (-viewportX / zoom) * scale,
          top: (-viewportY / zoom) * scale,
          width: (viewportWidth / zoom) * scale,
          height: (viewportHeight / zoom) * scale,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function StickyWallPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const hasInitialCentered = useRef(false);

  const [containerSize, setContainerSize] = useState({ w: 1000, h: 600 });

  /** Center the viewport on a set of notes (or canvas center if none) */
  const centerViewOn = useCallback((noteList: Note[]) => {
    const el = containerRef.current;
    const vw = el ? el.clientWidth : 1000;
    const vh = el ? el.clientHeight : 600;

    let cx: number;
    let cy: number;

    if (noteList.length > 0) {
      cx = noteList.reduce((s, n) => s + n.x, 0) / noteList.length + 96;
      cy = noteList.reduce((s, n) => s + n.y, 0) / noteList.length + 60;
    } else {
      cx = CANVAS_SIZE / 2;
      cy = CANVAS_SIZE / 2;
    }

    setPan({ x: -cx + vw / 2, y: -cy + vh / 2 });
  }, []);

  /* Fetch notes */
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/sticky-notes", { cache: "no-store" });
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes);
        // Auto-center on first load
        if (!hasInitialCentered.current) {
          hasInitialCentered.current = true;
          // Small delay to let container measure
          requestAnimationFrame(() => centerViewOn(data.notes));
        }
      }
    } catch {
      console.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, [centerViewOn]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  /* Track container size */
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  /* Mouse pan */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => setIsPanning(false);

  /* Touch pan */
  const touchRef = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  /* Zoom via wheel */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.min(2, Math.max(0.3, prev + delta)));
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  /* Double click to place note */
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;
    setClickPosition({ x: Math.round(clickX), y: Math.round(clickY) });
    setShowForm(true);
  };

  /* Submit note */
  const handleSubmitNote = async (content: string, color: string, author: string) => {
    setPosting(true);
    try {
      const res = await fetch("/api/sticky-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          x: clickPosition.x,
          y: clickPosition.y,
          color,
          author,
        }),
      });
      const data = await res.json();
      if (data.note) {
        setNotes((prev) => [data.note, ...prev]);
      }
      setShowForm(false);
    } catch {
      console.error("Failed to post note");
    } finally {
      setPosting(false);
    }
  };

  /* Zoom controls */
  const zoomIn = () => setZoom((z) => Math.min(2, z + 0.2));
  const zoomOut = () => setZoom((z) => Math.max(0.3, z - 0.2));
  const resetView = () => { centerViewOn(notes); setZoom(1); };

  /* Place note via button (center of viewport with slight random offset) */
  const placeNoteCenter = () => {
    if (!containerRef.current) return;
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 200;
    const cx = (-pan.x + containerRef.current.clientWidth / 2) / zoom + offsetX;
    const cy = (-pan.y + containerRef.current.clientHeight / 2) / zoom + offsetY;
    setClickPosition({ x: Math.round(cx), y: Math.round(cy) });
    setShowForm(true);
  };

  const navigateToPoint = (x: number, y: number) => {
    setPan({ x, y });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-hidden">
      <Header />

      <main className="flex-grow pt-20 md:pt-24 flex flex-col">
        {/* Top Bar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-24 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/programs/resources"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors mb-2"
              >
                <IconArrowLeft size={14} />
                Back to Resources
              </Link>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <IconNote size={20} />
                </div>
                <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Sticky Wall</p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Leave Your Mark</h1>
              <p className="mt-1 text-sm font-medium text-gray-400">
                Double-click anywhere on the canvas to place a note. Drag to pan, scroll to zoom. {notes.length} {notes.length === 1 ? "note" : "notes"} on the wall.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { fetchNotes(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <IconRefresh size={14} />
                Refresh
              </button>
              <button
                onClick={placeNoteCenter}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <IconPlus size={14} />
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-grow relative bg-gray-50 border-y border-gray-100 overflow-hidden" style={{ minHeight: "60vh" }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconLoader2 size={32} className="text-gray-300 animate-spin" />
            </div>
          ) : (
            <div
              ref={containerRef}
              className={`w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              style={{ minHeight: "60vh" }}
            >
              {/* Transformed canvas */}
              <div
                ref={canvasRef}
                className="relative"
                style={{
                  width: CANVAS_SIZE,
                  height: CANVAS_SIZE,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                }}
              >
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Notes */}
                {notes.map((note) => (
                  <StickyNoteCard key={note.id} note={note} />
                ))}

                {/* Empty state center marker */}
                {notes.length === 0 && (
                  <div
                    className="absolute flex flex-col items-center justify-center text-gray-300"
                    style={{ left: CANVAS_SIZE / 2 - 100, top: CANVAS_SIZE / 2 - 60, width: 200 }}
                  >
                    <IconNote size={40} className="mb-3" />
                    <p className="text-sm font-bold text-center">Double-click to add the first note</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zoom controls (bottom right) */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button onClick={zoomIn} className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
              <IconZoomIn size={16} />
            </button>
            <button onClick={zoomOut} className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
              <IconZoomOut size={16} />
            </button>
            <button onClick={resetView} className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
              <IconMaximize size={16} />
            </button>
            <div className="text-center text-[10px] font-bold text-gray-400 bg-white/80 rounded-lg px-2 py-1 border border-gray-100">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Minimap (bottom left) */}
          <div className="absolute bottom-4 left-4 hidden sm:block">
            <Minimap
              notes={notes}
              viewportX={pan.x}
              viewportY={pan.y}
              viewportWidth={containerSize.w}
              viewportHeight={containerSize.h}
              zoom={zoom}
              onNavigate={navigateToPoint}
            />
          </div>
        </div>
      </main>

      {/* Create Note Modal */}
      <AnimatePresence>
        {showForm && (
          <CreateNoteForm
            position={clickPosition}
            onSubmit={handleSubmitNote}
            onCancel={() => setShowForm(false)}
            loading={posting}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
