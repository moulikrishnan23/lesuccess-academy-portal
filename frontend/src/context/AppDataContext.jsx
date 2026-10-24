import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import courseApi, { normalizeCourseList } from "../services/courseApi.js";
import apiClient from "../services/apiClient.js";
import { listUpcoming, normalizeProgramList } from "../services/upcomingProgramApi.js";
import { AppDataContext } from "./appData.js";

/* =========================================================
   RESPONSE PARSERS
   Shared by the live fetches and the build-time snapshot, so
   both always produce the same shape.
========================================================= */

const DEFAULT_TEAM_CATEGORIES = ["Management Visionaries", "Tech Visionaries"];

/** Maps legacy category names onto the two fixed headings. */
function toTeamCategories(catBody) {
  if (!Array.isArray(catBody?.data)) return DEFAULT_TEAM_CATEGORIES;
  const names = catBody.data.map((c) => {
    const raw = (c.name || '').trim();
    const lower = raw.toLowerCase();
    if (lower === 'management team' || lower === 'management visionaries' || lower === 'management') {
      return 'Management Visionaries';
    }
    if (
      lower === 'technical leadership team' ||
      lower === 'tech visionaries' ||
      lower === 'our mentors' ||
      lower.includes('technical leadership')
    ) {
      return 'Tech Visionaries';
    }
    return raw;
  });
  return Array.from(new Set([...DEFAULT_TEAM_CATEGORIES, ...names]));
}

function toTeamMembers(teamBody) {
  return Array.isArray(teamBody?.data) ? teamBody.data : [];
}

function toGalleryCategories(body) {
  return Array.isArray(body?.data) ? body.data : [];
}

function toSuccessStories(body) {
  const apiData = body?.data || { images: [], reels: [] };
  return {
    images: Array.isArray(apiData.images) ? apiData.images : [],
    reels: Array.isArray(apiData.reels) ? apiData.reels : [],
  };
}

/* =========================================================
   BUILD-TIME SNAPSHOT
   src/data/apiSnapshot.json is refreshed by scripts/snapshot-api.mjs
   on every build. It fills sections that have neither a localStorage
   cache nor a live answer yet — i.e. a first-time visitor waiting on
   a backend that is waking from sleep. Loaded as its own chunk so it
   stays out of the main bundle.
========================================================= */

/**
 * Seeds a section from the snapshot only while it is still waiting or has
 * failed with nothing to show. A live answer (even an empty one) or a
 * localStorage cache always wins.
 */
function seedIfEmpty(setState, data, hasData) {
  if (!hasData) return;
  setState((prev) =>
    prev.status === "loading" || prev.status === "error"
      ? { ...prev, status: "success", data, isCached: true, error: null }
      : prev
  );
}

/* =========================================================
   CACHE PERSISTENCE HELPERS
========================================================= */

function loadCache(key) {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (Array.isArray(parsed.data) || (parsed.data && typeof parsed.data === 'object' && (Array.isArray(parsed.data.images) || Array.isArray(parsed.data.reels))))) {
      return parsed;
    }
  } catch (e) {
    console.warn(`Failed reading cache for ${key}`, e);
  }
  return null;
}

function saveCache(key, data, meta = {}) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        key,
        JSON.stringify({ data, savedAt: Date.now(), ...meta })
      );
    }
  } catch (e) {
    console.warn(`Failed writing cache for ${key}`, e);
  }
}

export function AppDataProvider({ children }) {
  // COURSES STATE (Initializes from cache if available)
  const [coursesState, setCoursesState] = useState(() => {
    const cached = loadCache("lesuccess_cache_courses_v1");
    return {
      status: cached && cached.data.length > 0 ? "success" : "loading",
      data: cached ? cached.data : [],
      isCached: Boolean(cached && cached.data.length > 0),
      error: null,
    };
  });
  const coursesAttempt = useRef(0);

  const fetchCourses = useCallback(async () => {
    const currentAttempt = ++coursesAttempt.current;
    setCoursesState((prev) => ({
      ...prev,
      status: prev.data.length > 0 ? "success" : "loading",
      error: null,
    }));
    try {
      const list = await courseApi.getAll();
      if (currentAttempt !== coursesAttempt.current) return;
      const data = Array.isArray(list) ? list : [];
      if (data.length > 0) {
        saveCache("lesuccess_cache_courses_v1", data);
      }
      setCoursesState({
        status: data.length === 0 ? "empty" : "success",
        data,
        isCached: false,
        error: null,
      });
    } catch (err) {
      if (currentAttempt !== coursesAttempt.current) return;
      setCoursesState((prev) => ({
        status: prev.data.length > 0 ? "success" : "error",
        data: prev.data,
        isCached: prev.data.length > 0,
        error: err,
      }));
    }
  }, []);

  // TEAM STATE
  const [teamState, setTeamState] = useState(() => {
    const cached = loadCache("lesuccess_cache_team_v1");
    return {
      status: cached && cached.data.length > 0 ? "success" : "loading",
      data: cached ? cached.data : [],
      categories: cached?.categories || DEFAULT_TEAM_CATEGORIES,
      isCached: Boolean(cached && cached.data.length > 0),
      error: null,
    };
  });
  const teamAttempt = useRef(0);

  const fetchTeam = useCallback(async () => {
    const currentAttempt = ++teamAttempt.current;
    setTeamState((prev) => ({
      ...prev,
      status: prev.data.length > 0 ? "success" : "loading",
      error: null,
    }));
    try {
      const [teamRes, catRes] = await Promise.allSettled([
        apiClient.get("/api/team-members"),
        apiClient.get("/api/team-categories"),
      ]);

      if (currentAttempt !== teamAttempt.current) return;

      if (teamRes.status === "fulfilled" && teamRes.value?.data?.data) {
        const members = toTeamMembers(teamRes.value.data);
        const categories = toTeamCategories(
          catRes.status === "fulfilled" ? catRes.value?.data : null
        );
        if (members.length > 0) {
          saveCache("lesuccess_cache_team_v1", members, { categories });
        }
        setTeamState({
          status: members.length === 0 ? "empty" : "success",
          data: members,
          categories,
          isCached: false,
          error: null,
        });
      } else {
        throw (
          teamRes.reason || new Error("Failed to load team members from server")
        );
      }
    } catch (err) {
      if (currentAttempt !== teamAttempt.current) return;
      setTeamState((prev) => ({
        status: prev.data.length > 0 ? "success" : "error",
        data: prev.data,
        categories: prev.categories,
        isCached: prev.data.length > 0,
        error: err,
      }));
    }
  }, []);

  // UPCOMING PROGRAMS STATE
  const [programsState, setProgramsState] = useState(() => {
    const cached = loadCache("lesuccess_cache_programs_v1");
    return {
      status: cached && cached.data.length > 0 ? "success" : "loading",
      data: cached ? cached.data : [],
      isCached: Boolean(cached && cached.data.length > 0),
      error: null,
    };
  });
  const programsAttempt = useRef(0);

  const fetchPrograms = useCallback(async () => {
    const currentAttempt = ++programsAttempt.current;
    setProgramsState((prev) => ({
      ...prev,
      status: prev.data.length > 0 ? "success" : "loading",
      error: null,
    }));
    try {
      const list = await listUpcoming();
      if (currentAttempt !== programsAttempt.current) return;
      const data = Array.isArray(list) ? list : [];
      if (data.length > 0) {
        saveCache("lesuccess_cache_programs_v1", data);
      }
      setProgramsState({
        status: data.length === 0 ? "empty" : "success",
        data,
        isCached: false,
        error: null,
      });
    } catch (err) {
      if (currentAttempt !== programsAttempt.current) return;
      setProgramsState((prev) => ({
        status: prev.data.length > 0 ? "success" : "error",
        data: prev.data,
        isCached: prev.data.length > 0,
        error: err,
      }));
    }
  }, []);

  // TESTIMONIALS STATE
  const [testimonialsState, setTestimonialsState] = useState(() => {
    const cached = loadCache("lesuccess_cache_testimonials_v1");
    return {
      status: cached && cached.data.length > 0 ? "success" : "loading",
      data: cached ? cached.data : [],
      isCached: Boolean(cached && cached.data.length > 0),
      error: null,
    };
  });
  const testimonialsAttempt = useRef(0);

  const fetchTestimonials = useCallback(async () => {
    const currentAttempt = ++testimonialsAttempt.current;
    setTestimonialsState((prev) => ({
      ...prev,
      status: prev.data.length > 0 ? "success" : "loading",
      error: null,
    }));
    try {
      const res = await apiClient.get("/api/testimonials");
      if (currentAttempt !== testimonialsAttempt.current) return;
      const apiData = Array.isArray(res) ? res : res?.data;
      const data = Array.isArray(apiData) ? apiData : [];
      if (data.length > 0) {
        saveCache("lesuccess_cache_testimonials_v1", data);
      }
      setTestimonialsState({
        status: data.length === 0 ? "empty" : "success",
        data,
        isCached: false,
        error: null,
      });
    } catch (err) {
      if (currentAttempt !== testimonialsAttempt.current) return;
      setTestimonialsState((prev) => ({
        status: prev.data.length > 0 ? "success" : "error",
        data: prev.data,
        isCached: prev.data.length > 0,
        error: err,
      }));
    }
  }, []);

  // GALLERY ROOT CATEGORIES STATE
  const [galleryState, setGalleryState] = useState(() => {
    const cached = loadCache("lesuccess_cache_gallery_v1");
    return {
      status: cached && cached.data.length > 0 ? "success" : "loading",
      data: cached ? cached.data : [],
      isCached: Boolean(cached && cached.data.length > 0),
      error: null,
    };
  });
  const galleryAttempt = useRef(0);

  const fetchGallery = useCallback(async () => {
    const currentAttempt = ++galleryAttempt.current;
    setGalleryState((prev) => ({
      ...prev,
      status: prev.data.length > 0 ? "success" : "loading",
      error: null,
    }));
    try {
      const { data: resData } = await apiClient.get("/api/gallery/categories");
      if (currentAttempt !== galleryAttempt.current) return;
      const data = toGalleryCategories(resData);
      if (data.length > 0) {
        saveCache("lesuccess_cache_gallery_v1", data);
      }
      setGalleryState({
        status: data.length === 0 ? "empty" : "success",
        data,
        isCached: false,
        error: null,
      });
    } catch (err) {
      if (currentAttempt !== galleryAttempt.current) return;
      setGalleryState((prev) => ({
        status: prev.data.length > 0 ? "success" : "error",
        data: prev.data,
        isCached: prev.data.length > 0,
        error: err,
      }));
    }
  }, []);

  // SUCCESS STORIES STATE
  const [successStoriesState, setSuccessStoriesState] = useState(() => {
    const cached = loadCache("lesuccess_cache_successstories_v1");
    const hasData = cached && (cached.data.images?.length > 0 || cached.data.reels?.length > 0);
    return {
      status: hasData ? "success" : "loading",
      data: cached ? cached.data : { images: [], reels: [] },
      isCached: Boolean(hasData),
      error: null,
    };
  });
  const successStoriesAttempt = useRef(0);

  const fetchSuccessStories = useCallback(async () => {
    const currentAttempt = ++successStoriesAttempt.current;
    setSuccessStoriesState((prev) => ({
      ...prev,
      status: prev.data.images?.length > 0 || prev.data.reels?.length > 0 ? "success" : "loading",
      error: null,
    }));
    try {
      const res = await apiClient.get("/api/success-stories");
      if (currentAttempt !== successStoriesAttempt.current) return;
      
      const data = toSuccessStories(res?.data);
      const hasData = data.images.length > 0 || data.reels.length > 0;
      
      if (hasData) {
        saveCache("lesuccess_cache_successstories_v1", data);
      }
      setSuccessStoriesState({
        status: hasData ? "success" : "empty",
        data,
        isCached: false,
        error: null,
      });
    } catch (err) {
      if (currentAttempt !== successStoriesAttempt.current) return;
      setSuccessStoriesState((prev) => ({
        ...prev,
        status: prev.data.images?.length > 0 || prev.data.reels?.length > 0 ? "success" : "error",
        isCached: prev.data.images?.length > 0 || prev.data.reels?.length > 0,
        error: err,
      }));
    }
  }, []);

  // SNAPSHOT FALLBACK (see BUILD-TIME SNAPSHOT above)
  useEffect(() => {
    let cancelled = false;
    import("../data/apiSnapshot.json")
      .then(({ default: snapshot }) => {
        if (cancelled) return;
        const b = snapshot?.bodies || {};

        const courses = normalizeCourseList(b["/api/courses"]?.data);
        seedIfEmpty(setCoursesState, courses, courses.length > 0);

        const members = toTeamMembers(b["/api/team-members"]);
        if (members.length > 0) {
          const categories = toTeamCategories(b["/api/team-categories"]);
          setTeamState((prev) =>
            prev.status === "loading" || prev.status === "error"
              ? { ...prev, status: "success", data: members, categories, isCached: true, error: null }
              : prev
          );
        }

        const programs = normalizeProgramList(b["/api/upcoming-programs"]);
        seedIfEmpty(setProgramsState, programs, programs.length > 0);

        const gallery = toGalleryCategories(b["/api/gallery/categories"]);
        seedIfEmpty(setGalleryState, gallery, gallery.length > 0);

        const stories = toSuccessStories(b["/api/success-stories"]);
        seedIfEmpty(setSuccessStoriesState, stories, stories.images.length > 0 || stories.reels.length > 0);
      })
      .catch(() => {
        // No snapshot is not an error: the live fetches still run.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    fetchCourses();
    fetchTeam();
    fetchPrograms();
    fetchTestimonials();
    fetchGallery();
    fetchSuccessStories();
  }, [fetchCourses, fetchTeam, fetchPrograms, fetchTestimonials, fetchGallery, fetchSuccessStories]);

  const value = useMemo(() => ({
    courses: {
      ...coursesState,
      refetch: fetchCourses,
    },
    team: {
      ...teamState,
      refetch: fetchTeam,
    },
    programs: {
      ...programsState,
      refetch: fetchPrograms,
    },
    testimonials: {
      ...testimonialsState,
      refetch: fetchTestimonials,
    },
    gallery: {
      ...galleryState,
      refetch: fetchGallery,
    },
    successStories: {
      ...successStoriesState,
      refetch: fetchSuccessStories,
    },
  }), [
    coursesState,
    fetchCourses,
    teamState,
    fetchTeam,
    programsState,
    fetchPrograms,
    testimonialsState,
    fetchTestimonials,
    galleryState,
    fetchGallery,
    successStoriesState,
    fetchSuccessStories,
  ]);

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

