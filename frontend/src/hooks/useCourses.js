import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppDataContext } from "../context/appData.js";
import courseApi from "../services/courseApi.js";

const EMPTY = [];

/**
 * Hook to access course catalog.
 * Uses shared AppDataContext when mounted inside AppDataProvider,
 * or gracefully falls back to local fetch if used standalone.
 *
 * Every hook below runs on every render, whichever source wins: React requires
 * the same hooks in the same order each time. The standalone fetch simply does
 * nothing when the context already provides the courses.
 */
export default function useCourses() {
  const context = useContext(AppDataContext);
  const shared = context?.courses ?? null;

  // Standalone fallback
  const [attempt, setAttempt] = useState(0);
  const localRefetch = useCallback(() => setAttempt((n) => n + 1), []);
  const [result, setResult] = useState({ key: null, courses: EMPTY, error: null });
  const requestIdRef = useRef(0);
  const hasShared = shared !== null;

  useEffect(() => {
    if (hasShared) return undefined;

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    let ignore = false;

    courseApi
      .getAll({ signal: controller.signal })
      .then((list) => {
        if (ignore || requestId !== requestIdRef.current) return;
        setResult({ key: attempt, courses: list, error: null });
      })
      .catch((err) => {
        if (ignore || err?.isCanceled || requestId !== requestIdRef.current) return;
        setResult({ key: attempt, courses: EMPTY, error: err });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [attempt, hasShared]);

  if (shared) {
    const { status, data, error, refetch } = shared;
    return {
      courses: data || EMPTY,
      isLoading: status === "loading",
      status,
      error,
      refetch,
    };
  }

  const isSettled = result.key === attempt;

  return {
    courses: isSettled ? result.courses : EMPTY,
    isLoading: !isSettled,
    status: isSettled ? (result.error ? "error" : "success") : "loading",
    error: isSettled ? result.error : null,
    refetch: localRefetch,
  };
}
