import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, X, CloudLightning } from 'lucide-react';
import { onServerWakeStatus } from '../services/api';

export default function ServerWakeBanner() {
  const [isWaking, setIsWaking] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    // 1. Listen to API interceptor cold-start wake events
    const unsubscribe = onServerWakeStatus(({ isWaking: waking, attempt: att, success }) => {
      if (waking) {
        setIsWaking(true);
        setIsAwake(false);
        setDismissed(false);
        if (att) setAttempt(att);
      } else if (success) {
        setIsWaking(false);
        setIsAwake(true);
        setTimeout(() => setIsAwake(false), 3000);
      }
    });

    // 2. Proactive cold-start health ping on initial application load
    let active = true;
    let timerId = null;
    let pollInterval = null;

    const checkInitialHealth = async () => {
      const startTime = Date.now();
      timerId = setTimeout(() => {
        // If /health has not resolved within 2.5s, server is likely in cold start
        if (active && !isAwake) {
          setIsWaking(true);
        }
      }, 2500);

      try {
        const response = await fetch('/health', { cache: 'no-store' });
        clearTimeout(timerId);
        if (response.ok) {
          if (active) {
            if (isWaking) {
              setIsWaking(false);
              setIsAwake(true);
              setTimeout(() => setIsAwake(false), 3000);
            }
          }
        } else {
          throw new Error('Health check returned non-200');
        }
      } catch (err) {
        clearTimeout(timerId);
        if (active) {
          setIsWaking(true);
          // Poll every 3 seconds until awake
          pollInterval = setInterval(async () => {
            try {
              const res = await fetch('/health', { cache: 'no-store' });
              if (res.ok && active) {
                clearInterval(pollInterval);
                setIsWaking(false);
                setIsAwake(true);
                setTimeout(() => setIsAwake(false), 3000);
              }
            } catch (e) {
              // still waking up
            }
          }, 3000);
        }
      }
    };

    checkInitialHealth();

    return () => {
      active = false;
      unsubscribe();
      clearTimeout(timerId);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Timer tracking seconds while waking
  useEffect(() => {
    let interval = null;
    if (isWaking) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isWaking]);

  if (dismissed || (!isWaking && !isAwake)) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-medium transition-all shadow-md bg-emerald-950 text-emerald-100 border-b border-emerald-800"
    >
      <div className="flex items-center space-x-2.5 max-w-5xl mx-auto flex-1">
        {isWaking ? (
          <>
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
                Server is waking up:
              </span>
              <span className="text-emerald-200">
                Render Free tier sleeps after idle. Waking typically takes 30–60 seconds ({secondsElapsed}s elapsed
                {attempt > 1 ? `, retry ${attempt}/3` : ''}). Retrying automatically...
              </span>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white">
              Connected! The BazarCycle backend server is active and ready.
            </span>
          </>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-emerald-300 hover:text-white hover:bg-emerald-800/60 rounded-md transition-colors ml-2"
        aria-label="Dismiss wake notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
