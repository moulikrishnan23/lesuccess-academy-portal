import { useState } from "react";
import { ChevronDown, GraduationCap, Phone } from "lucide-react";
import apiClient from "../../services/apiClient.js";
import useCourses from "../../hooks/useCourses.js";

// Shown in the dropdown while the API response is loading or empty
const FALLBACK_COURSES = [
  { id: null, title: "Python: Full Stack Development" },
  { id: null, title: "JAVA: Full Stack Development" },
  { id: null, title: "Data Analytics" },
  { id: null, title: "AWS with DevOps" },
];

const DemoClass = () => {
  const { courses } = useCourses();
  const dropdownCourses = courses.length > 0 ? courses : FALLBACK_COURSES;

  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!mobileNumber.trim()) {
      setSubmitStatus("error");
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      await apiClient.post("/api/demo-bookings", {
        mobileNumber: mobileNumber.trim(),
        courseName: selectedCourseName || null,
      });
      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      const fieldMsg = err?.fieldErrors?.mobileNumber
        ?? Object.values(err?.fieldErrors ?? {})[0];
      setErrorMessage(fieldMsg ?? err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitStatus === "success") {
    return (
      <section className="w-full bg-[#084b66] px-6 py-16 text-white sm:px-10 lg:px-20">
        <div className="mx-auto max-w-300 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Thank you! We&apos;ll contact you shortly.
          </h2>
          <p className="mt-5 text-base sm:text-lg">
            Your demo class has been booked. Our team will reach out to confirm.
          </p>
          <button
            onClick={() => {
              setSubmitStatus(null);
              setMobileNumber("");
              setSelectedCourseName("");
            }}
            className="mt-8 rounded-xl border border-white/60 px-8 py-3 text-sm font-medium transition hover:bg-white/10"
          >
            Book Another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#084b66] px-6 py-16 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-300 text-center">

        <h2 className="text-3xl font-bold sm:text-4xl">
          Book Your{" "}
          <span className="text-[#ef334c] transition animate-pulse">
            Demo Class
          </span>{" "}
          Today!
        </h2>

        <p className="mt-5 text-base sm:text-lg">
          Upgrade your decision-making skills with our trial lessons at
          LeSuccess.
        </p>

        <div className="mx-auto mt-12 grid max-w-300 gap-20 md:grid-cols-3">

          {/* Course Select */}
          <div className="relative">
            <GraduationCap
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />

            <select
              value={selectedCourseName}
              onChange={(e) => setSelectedCourseName(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/70 bg-transparent py-5 pl-12 pr-12 text-gray-300 outline-none"
            >
              <option value="" className="text-gray-800">
                Select Course
              </option>

              {dropdownCourses.map((course, i) => (
                <option
                  key={course.id ?? `fallback-${i}`}
                  value={course.title}
                  className="text-gray-800"
                >
                  {course.title}
                </option>
              ))}
            </select>

            <ChevronDown
              size={20}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
          </div>

          {/* Mobile Number */}
          <div className="relative">
            <Phone
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />

            <input
              type="tel"
              placeholder="Enter Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full rounded-xl border border-white/70 bg-transparent py-5 pl-12 pr-5 text-white outline-none placeholder:text-gray-300"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-linear-to-r from-[#ff3b3f] to-[#cc0f4f] px-6 py-5 text-lg font-semibold transition hover:opacity-80 disabled:opacity-60"
          >
            {isSubmitting ? "Booking..." : "Book Demo"}
          </button>

        </div>

        {submitStatus === "error" && (
          <p className="mt-4 text-sm text-red-300">{errorMessage}</p>
        )}

      </div>
    </section>
  );
};

export default DemoClass;
