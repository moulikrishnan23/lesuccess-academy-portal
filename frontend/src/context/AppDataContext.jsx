import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import courseApi from "../services/courseApi.js";
import apiClient from "../services/apiClient.js";
import { listUpcoming } from "../services/upcomingProgramApi.js";

const AppDataContext = createContext(null);
const CoursesDataContext = createContext(null);
const TeamDataContext = createContext(null);
const ProgramsDataContext = createContext(null);
const TestimonialsDataContext = createContext(null);
const GalleryDataContext = createContext(null);
const SuccessStoriesDataContext = createContext(null);

/* =========================================================
   CACHE PERSISTENCE HELPERS
========================================================= */

function loadCache(key) {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Public content only. Revalidate on mount; never revive indefinitely old records.
    if (!Number.isFinite(parsed?.savedAt) || Date.now() - parsed.savedAt > 5 * 60 * 1000) return null;
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
      saveCache("lesuccess_cache_courses_v1", data);
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
      categories: cached?.categories || ["Management Visionaries", "Tech Visionaries"],
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
      const teamRes = await apiClient.get("/api/team-members");
      if (currentAttempt !== teamAttempt.current) return;
      if (Array.isArray(teamRes?.data?.data)) {
        const members = teamRes.data.data;
        // Public pages derive category filters from members, not category administration.
        const categories = ["Management Visionaries", "Tech Visionaries"];
        saveCache("lesuccess_cache_team_v1", members, { categories });
        setTeamState({
          status: members.length === 0 ? "empty" : "success",
          data: members,
          categories,
          isCached: false,
          error: null,
        });
      } else {
        throw (
          new Error("Failed to load team members from server")
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
      saveCache("lesuccess_cache_programs_v1", data);
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
      saveCache("lesuccess_cache_testimonials_v1", data);
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
      const data = Array.isArray(resData?.data) ? resData.data : [];
      saveCache("lesuccess_cache_gallery_v1", data);
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
      
      const apiData = res?.data?.data || { images: [], reels: [] };
      const images = Array.isArray(apiData.images) ? apiData.images : [];
      const reels = Array.isArray(apiData.reels) ? apiData.reels : [];
      
      const data = { images, reels };
      const hasData = images.length > 0 || reels.length > 0;
      
      saveCache("lesuccess_cache_successstories_v1", data);
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

  // INITIAL LOAD
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      fetchCourses();
      fetchTeam();
      fetchPrograms();
      fetchTestimonials();
      fetchGallery();
      fetchSuccessStories();
    });
    return () => { active = false; };
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

  const coursesData = useMemo(() => ({ ...coursesState, refetch: fetchCourses }), [coursesState, fetchCourses]);
  const teamData = useMemo(() => ({ ...teamState, refetch: fetchTeam }), [teamState, fetchTeam]);
  const programsData = useMemo(() => ({ ...programsState, refetch: fetchPrograms }), [programsState, fetchPrograms]);
  const testimonialsData = useMemo(() => ({ ...testimonialsState, refetch: fetchTestimonials }), [testimonialsState, fetchTestimonials]);
  const galleryData = useMemo(() => ({ ...galleryState, refetch: fetchGallery }), [galleryState, fetchGallery]);
  const successStoriesData = useMemo(() => ({ ...successStoriesState, refetch: fetchSuccessStories }), [successStoriesState, fetchSuccessStories]);

  return (
    <AppDataContext.Provider value={value}>
      <CoursesDataContext.Provider value={coursesData}>
        <TeamDataContext.Provider value={teamData}>
          <ProgramsDataContext.Provider value={programsData}>
            <TestimonialsDataContext.Provider value={testimonialsData}>
              <GalleryDataContext.Provider value={galleryData}>
                <SuccessStoriesDataContext.Provider value={successStoriesData}>
                  {children}
                </SuccessStoriesDataContext.Provider>
              </GalleryDataContext.Provider>
            </TestimonialsDataContext.Provider>
          </ProgramsDataContext.Provider>
        </TeamDataContext.Provider>
      </CoursesDataContext.Provider>
    </AppDataContext.Provider>
  );
}

// These hooks intentionally live beside the provider contexts they consume.
// eslint-disable-next-line react-refresh/only-export-components
export const useCoursesData = () => useContext(CoursesDataContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useTeamData = () => useContext(TeamDataContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useProgramsData = () => useContext(ProgramsDataContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useTestimonialsData = () => useContext(TestimonialsDataContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useGalleryData = () => useContext(GalleryDataContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useSuccessStoriesData = () => useContext(SuccessStoriesDataContext);

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}

export default AppDataContext;
