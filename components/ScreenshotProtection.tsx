"use client";

import { useEffect, useState } from "react";

export default function ScreenshotProtection() {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // 1. Keyboard shortcuts interception
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (_) {}
        flashBlur();
        return false;
      }

      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // macOS screenshot shortcuts: Cmd + Shift + 3, 4, 5
      if (
        e.metaKey &&
        e.shiftKey &&
        ["3", "4", "5", "$", "%", "#"].includes(e.key)
      ) {
        e.preventDefault();
        flashBlur();
        return false;
      }

      // Windows / Chrome Snipping Tool: Win/Cmd + Shift + S or Ctrl + Shift + S
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key.toLowerCase() === "s" || e.code === "KeyS")
      ) {
        e.preventDefault();
        flashBlur();
        return false;
      }

      // Print: Ctrl/Cmd + P
      if (isCmdOrCtrl && (e.key.toLowerCase() === "p" || e.code === "KeyP")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Save page: Ctrl/Cmd + S
      if (
        isCmdOrCtrl &&
        (e.key.toLowerCase() === "s" || e.code === "KeyS") &&
        !e.shiftKey
      ) {
        const target = e.target as HTMLElement | null;
        const isEditable =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable ||
            target.closest(".ProseMirror"));
        if (!isEditable) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (_) {}
      }
    };

    let blurTimeout: NodeJS.Timeout;
    const flashBlur = () => {
      setIsBlurred(true);
      clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        setIsBlurred(false);
      }, 1500);
    };

    // 2. Window Blur & Visibility (anti-snipping tool)
    const handleWindowBlur = () => {
      setIsBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    // 3. Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest(".ProseMirror"));
      if (!isEditable) {
        e.preventDefault();
      }
    };

    // 4. Drag start prevention
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "IMG" ||
          target.tagName === "CANVAS" ||
          target.tagName === "VIDEO")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      clearTimeout(blurTimeout);
    };
  }, []);

  if (!isBlurred) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[999999] pointer-events-none backdrop-blur-2xl bg-white/70 dark:bg-black/70 flex items-center justify-center transition-all duration-75 select-none"
    >
      <div className="bg-black/80 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-md border border-white/10 tracking-wide uppercase">
        Screen Capture Protected
      </div>
    </div>
  );
}
