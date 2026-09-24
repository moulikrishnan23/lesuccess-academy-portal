import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import courseApi from "../services/courseApi.js";
import apiClient from "../services/apiClient.js";
import { listUpcoming } from "../services/upcomingProgramApi.js";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  // COURSES STATE
  const [coursesState, setCoursesState] = useState({
    status: "loading",
    data: [],
    error: null,
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
      setCoursesState({
        status: data.length === 0 ? "empty" : "success",
        data,
        error: null,
      });
    } catch (err) {
      if (currentAttempt !== coursesAttempt.current) return;
      setCoursesState({
        status: "error",
        data: [],
        error: err,
      });
    }
  }, []);

  // TEAM STATE
  const [teamState, setTeamState] = useState({
    status: "loading",
    data: [],
    categories: ["Management Team", "Our Mentors"],
    error: null,
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
        const members = Array.isArray(teamRes.value.data.data)
          ? teamRes.value.data.data
          : [];
        let categories = ["Management Team", "Our Mentors"];
        if (
          catRes.status === "fulfilled" &&
          catRes.value?.data?.data &&
          Array.isArray(catRes.value.data.data)
        ) {
          const names = catRes.value.data.data.map((c) => c.name);
          categories = Array.from(
            new Set(["Management Team", "Our Mentors", ...names])
          );
        }
        setTeamState({
          status: members.length === 0 ? "empty" : "success",
          data: members,
          categories,
          error: null,
        });
      } else {
        throw (
          teamRes.reason || new Error("Failed to load team members from server")
        );
      }
    } catch (err) {
      if (currentAttempt !== teamAttempt.current) return;
      setTeamState({
        status: "error",
        data: [],
        categories: ["Management Team", "Our Mentors"],
        error: err,
      });
    }
  }, []);

  // UPCOMING PROGRAMS STATE
  const [programsState, setProgramsState] = useState({
    status: "loading",
    data: [],
    error: null,
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
      setProgramsState({
        status: data.length === 0 ? "empty" : "success",
        data,
        error: null,
      });
    } catch (err) {
      if (currentAttempt !== programsAttempt.current) return;
      setProgramsState({
        status: "error",
        data: [],
        error: err,
      });
    }
  }, []);

  // TESTIMONIALS STATE
  const [testimonialsState, setTestimonialsState] = useState({
    status: "loading",
    data: [],
    error: null,
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
      setTestimonialsState({
        status: data.length === 0 ? "empty" : "success",
        data,
        error: null,
      });
    } catch (err) {
      if (currentAttempt !== testimonialsAttempt.current) return;
      setTestimonialsState({
        status: "error",
        data: [],
        error: err,
      });
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    fetchCourses();
    fetchTeam();
    fetchPrograms();
    fetchTestimonials();
  }, [fetchCourses, fetchTeam, fetchPrograms, fetchTestimonials]);

  const value = {
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
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}

export default AppDataContext;
