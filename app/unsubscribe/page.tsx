"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconMailX, IconCircleCheck, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const alreadyDone = params.get("done") === "1";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    alreadyDone ? "success" : "idle"
  );
  const [message, setMessage] = useState(
    alreadyDone ? "You have been unsubscribed from our newsletter." : ""
  );

  useEffect(() => {
    if (alreadyDone) setStatus("success");
  }, [alreadyDone]);

  const handleUnsubscribe = async () => {
    if (!id) {
      setStatus("error");
      setMessage("Invalid unsubscribe link.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      } else {
        setStatus("success");
        setMessage("You have been unsubscribed from our newsletter.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
          {status === "success" ? (
            <IconCircleCheck className="w-8 h-8 text-green-600" />
          ) : status === "error" ? (
            <IconAlertCircle className="w-8 h-8 text-red-500" />
          ) : (
            <IconMailX className="w-8 h-8 text-gray-600" />
          )}
        </div>

        {status === "idle" && (
          <>
            <h1 className="text-xl font-black text-gray-900 mb-2">
              Unsubscribe
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to unsubscribe from SPE-UI newsletter emails?
            </p>
            <button
              onClick={handleUnsubscribe}
              className="w-full bg-gray-900 text-white rounded-xl py-3 font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              Yes, Unsubscribe
            </button>
          </>
        )}

        {status === "loading" && (
          <>
            <h1 className="text-xl font-black text-gray-900 mb-2">
              Unsubscribing...
            </h1>
            <IconLoader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mt-4" />
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-black text-gray-900 mb-2">
              Unsubscribed
            </h1>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <p className="text-xs text-gray-400">
              You will no longer receive newsletter emails from us.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-black text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-red-500 mb-6">{message}</p>
            {id && (
              <button
                onClick={handleUnsubscribe}
                className="w-full bg-gray-900 text-white rounded-xl py-3 font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
              >
                Try Again
              </button>
            )}
          </>
        )}

        <p className="text-[10px] text-gray-300 mt-8">
          SPE University of Ibadan Student Chapter
        </p>
      </motion.div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <IconLoader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
