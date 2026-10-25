import { useContext, useCallback, useEffect, useRef, useState } from "react";
import AppDataContext from "../context/AppDataContext.jsx";
import courseApi from "../services/courseApi.js";

const EMPTY = [];

/**
 * Hook to access course catalog.
 * Uses shared AppDataContext when mounted inside AppDataProvider,
 * or gracefully falls back to local fetch if used standalone.
 */
export default function useCourses() {
  const context = useContext(AppDataContext);
  const hasContext = Boolean(context?.courses);

  // Standalone fallback
  const [attempt, setAttempt] = useState(0);
  const refetchFallback = useCallback(() => setAttempt((n) => n + 1), []);
  const [result, setResult] = useState({
    key: null,
    courses: EMPTY,
    error: null,
  });
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (hasContext) return undefined;
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    let ignore = false;

    courseApi
      .getAll({ signal: controller.signal })
      .then((list) => {
        if (ignore || requestId !== requestIdRef.current) return;
        setResult({
          key: attempt,
          courses: Array.isArray(list) ? list : EMPTY,
          error: null,
        });
      })
      .catch((err) => {
        if (ignore || err?.isCanceled || requestId !== requestIdRef.current)
          return;
        setResult({ key: attempt, courses: EMPTY, error: err });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [attempt, hasContext]);

  if (hasContext) {
    const { status, data, error, refetch } = context.courses;
    return {
      courses: Array.isArray(data) ? data : EMPTY,
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
    refetch: refetchFallback,
  };
}
