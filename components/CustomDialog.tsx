"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface DialogOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface DialogState {
  isOpen: boolean;
  type: "alert" | "confirm";
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  resolve: (value: boolean | void) => void;
}

type DialogListener = (state: DialogState) => void;
let globalListener: DialogListener | null = null;

export function showAlert(
  message: string,
  options?: { title?: string; buttonText?: string }
): Promise<void> {
  if (!globalListener) {
    if (typeof window !== "undefined") {
      window.alert(message);
    }
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    globalListener!({
      isOpen: true,
      type: "alert",
      title: options?.title,
      message,
      confirmText: options?.buttonText || "OK",
      resolve: () => resolve(),
    });
  });
}

export function showConfirm(
  message: string,
  options?: DialogOptions
): Promise<boolean> {
  if (!globalListener) {
    if (typeof window !== "undefined") {
      return Promise.resolve(window.confirm(message));
    }
    return Promise.resolve(false);
  }
  const isDestructive =
    options?.destructive ??
    /delete|remove|reset|unassign|revoke/i.test(message + (options?.title || ""));

  return new Promise<boolean>((resolve) => {
    globalListener!({
      isOpen: true,
      type: "confirm",
      title: options?.title,
      message,
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      destructive: isDestructive,
      resolve: (val) => resolve(Boolean(val)),
    });
  });
}

interface DialogContextValue {
  alert: (message: string, options?: { title?: string; buttonText?: string }) => Promise<void>;
  confirm: (message: string, options?: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextValue>({
  alert: showAlert,
  confirm: showConfirm,
});

export const useDialog = () => useContext(DialogContext);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    globalListener = (state) => setDialog(state);
    return () => {
      globalListener = null;
    };
  }, []);

  const handleClose = useCallback(
    (result: boolean | void) => {
      if (dialog) {
        dialog.resolve(result);
        setDialog(null);
      }
    },
    [dialog]
  );

  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose(dialog.type === "confirm" ? false : undefined);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleClose(dialog.type === "confirm" ? true : undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialog, handleClose]);

  return (
    <DialogContext.Provider value={{ alert: showAlert, confirm: showConfirm }}>
      {children}
      <AnimatePresence>
        {dialog?.isOpen && (
          <div className="fixed inset-0 w-[100vw] h-[100vh] z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => handleClose(dialog.type === "confirm" ? false : undefined)}
              className="absolute inset-0 w-[100vw] h-[100vh] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121222] border border-gray-200 dark:border-white/10 p-6 flex flex-col gap-4 text-left"
            >
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {dialog.title || (dialog.type === "confirm" ? "Confirm Action" : "Notice")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {dialog.message}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {dialog.type === "confirm" && (
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent transition-colors cursor-pointer"
                  >
                    {dialog.cancelText || "Cancel"}
                  </button>
                )}
                <button
                  type="button"
                  autoFocus
                  onClick={() => handleClose(dialog.type === "confirm" ? true : undefined)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition-colors cursor-pointer ${
                    dialog.destructive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {dialog.confirmText || (dialog.type === "confirm" ? "Confirm" : "OK")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}
