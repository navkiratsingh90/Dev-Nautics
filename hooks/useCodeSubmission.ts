// hooks/useCodeSubmission.ts
"use client";

import { useState, useRef, useCallback } from "react";
import type { SubmissionStatus, SubmissionResult, Language } from "@/types/challenge";

interface SubmitPayload {
  questionId: string;
  sourceCode: string;
  language:   Language;
}

interface UseCodeSubmissionReturn {
  status:   SubmissionStatus;
  result:   SubmissionResult | null;
  error:    string | null;
  submit:   (payload: SubmitPayload) => Promise<void>;
  reset:    () => void;
}

export function useCodeSubmission(): UseCodeSubmissionReturn {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<boolean>(false);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const reset = useCallback(() => {
    stopPolling();
    abortRef.current = true;
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  const submit = useCallback(async ({ questionId, sourceCode, language }: SubmitPayload) => {
    stopPolling();
    abortRef.current = false;
    setError(null);
    setResult(null);
    setStatus("queued");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    try {
      // ── Step 1: Push to queue ────────────────────────────────────
      const res = await fetch("/api/daily/submit-code", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId, sourceCode, language }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const { submissionId } = await res.json();

      // ── Step 2: Poll for result every 2s ─────────────────────────
      setStatus("running");

      pollRef.current = setInterval(async () => {
        if (abortRef.current) { stopPolling(); return; }

        try {
          const poll = await fetch(`/api/daily/submission/${submissionId}`, {
            headers: { "Authorization": `Bearer ${token}` },
          });

          if (!poll.ok) throw new Error(`Poll HTTP ${poll.status}`);

          const data: SubmissionResult = await poll.json();

          if (data.status === "accepted" || data.status === "rejected") {
            stopPolling();
            setStatus(data.status);
            setResult(data);
          } else if (data.status === "running" || data.status === "pending") {
            // keep polling — update status label in case it changed
            setStatus(data.status as SubmissionStatus);
          }
        } catch (pollErr) {
          stopPolling();
          setStatus("error");
          setError(pollErr instanceof Error ? pollErr.message : "Polling failed");
        }
      }, 2000);

    } catch (submitErr) {
      setStatus("error");
      setError(submitErr instanceof Error ? submitErr.message : "Submission failed");
    }
  }, []);

  return { status, result, error, submit, reset };
}