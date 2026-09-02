import { useState } from "react";
import { ChevronDown, GraduationCap, Phone } from "lucide-react";

const courses = [
  "Python: Full Stack Development",
  "JAVA: Full Stack Development",
  "Data Analytics",
  "AWS with DevOps",
];

const DemoClass = () => {
  const [selectedCourse, setSelectedCourse] = useState("");

  return (
    <section className="w-full bg-[#084b66] px-6 py-16 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-300 text-center">

        <h2 className="text-3xl font-bold sm:text-4xl text-white">
          Book Your{" "}
          <span className="text-[#ef334c] transition animate-pulse">Demo Class</span> Today!
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
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/70 bg-transparent py-5 pl-12 pr-12 text-gray-300 outline-none"
            >
              <option value="" className="text-gray-800">
                Select Course
              </option>

              {courses.map((course) => (
                <option
                  key={course}
                  value={course}
                  className="text-gray-800"
                >
                  {course}
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
              className="w-full rounded-xl border border-white/70 bg-transparent py-5 pl-12 pr-5 text-white outline-none placeholder:text-gray-300"
            />
          </div>

          {/* Button */}
          <button className="rounded-xl bg-linear-to-r from-[#ff3b3f] to-[#cc0f4f] px-6 py-5 text-lg font-semibold transition hover:opacity-80">
            Book Demo
          </button>

        </div>
      </div>
    </section>
  );
};

export default DemoClass;