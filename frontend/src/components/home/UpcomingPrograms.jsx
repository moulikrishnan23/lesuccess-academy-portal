

import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Video,
  Award,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";

const programs = {
  webinar: {
    title: "Communication Masterclass",
    topic: "Topic: common interview mistakes that cost you your dream job.",
    date: "Saturday",
    timing: "5:00PM - 6:30PM",
    platform: "Google Meet",
    image: "/home/webinar.png",
    badge: "Free Webinar",
  },

  internship: {
    title: "Full Stack Internship Program",
    topic: "Build real-world projects and gain practical industry experience.",
    date: "Monday",
    timing: "10:00AM - 4:00PM",
    platform: "LeSuccess Campus",
    image: "/home/webinarHost.jpg",
    badge: "Limited Seats",
  },
};

const UpcomingPrograms = () => {
  const [activeProgram, setActiveProgram] = useState("webinar");

  const program = programs[activeProgram];

  return (
    <section className="w-full bg-linear-to-r from-[#ff3b3f] to-[#cc0f4f] px-6 py-14 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-300 text-center">

        <h2 className="text-3xl font-bold sm:text-4xl">
          Upcoming Program Details:
        </h2>

        <p className="mt-4 text-base sm:text-lg">
          Get the basics right and enter the industry with confidence.
        </p>

        {/* Program Switch */}
        <div className="mx-auto mt-7 flex w-fit rounded-lg bg-white p-1">
          <button
            onClick={() => setActiveProgram("webinar")}
            className={`rounded-md px-7 py-2 text-sm font-medium transition sm:text-base ${
              activeProgram === "webinar"
                ? "bg-[#d91b4d] text-white"
                : "text-gray-800"
            }`}
          >
            Webinar
          </button>

          <button
            onClick={() => setActiveProgram("internship")}
            className={`rounded-md px-7 py-2 text-sm font-medium transition sm:text-base ${
              activeProgram === "internship"
                ? "bg-[#d91b4d] text-white"
                : "text-gray-800"
            }`}
          >
            Internship
          </button>
        </div>

        {/* Program Card */}
        <div className="mx-auto mt-10 max-w-250 rounded-[28px] border border-white/60 bg-white/10 p-5 sm:p-7">
          <div className="grid items-center justify-items-center gap-7 md:grid-cols-[200px_1fr]">

            {/* Image */}
            <div className="overflow-hidden rounded-[28px]">
              <img
                src={program.image}
                alt={program.title}
                className="h-64 w-52 object-cover"
              />
            </div>

            {/* Content */}
            <div className="w-full text-center">

              <div className="flex justify-center">
                <span className="rounded-lg bg-green-300 px-4 py-2 text-xs font-semibold text-green-800">
                  {program.badge}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
                {program.title}
              </h3>

              <p className="mt-3 text-base sm:text-lg">
                {program.topic}
              </p>

              {/* Details */}
              <div className="mt-6 grid gap-5 sm:grid-cols-3">

                <div className="flex flex-col items-center">
                  <CalendarDays size={22} />
                  <span className="mt-2 text-sm">Date</span>
                  <strong>{program.date}</strong>
                </div>

                <div className="flex flex-col items-center">
                  <Clock3 size={22} />
                  <span className="mt-2 text-sm">Timing</span>
                  <strong>{program.timing}</strong>
                </div>

                <div className="flex flex-col items-center">
                  {activeProgram === "webinar" ? (
                    <Video size={22} />
                  ) : (
                    <BriefcaseBusiness size={22} />
                  )}

                  <span className="mt-2 text-sm">Platform</span>
                  <strong>{program.platform}</strong>
                </div>

              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-5">

                <button className="rounded-md bg-[#074a68] px-10 py-3 text-sm font-medium text-white">
                  {activeProgram === "webinar"
                    ? "Register Now"
                    : "Apply Now"}
                </button>

                <div className="flex items-center gap-2 text-yellow-300">
                  <Award size={22} />
                  <span>Certificate Included</span>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingPrograms;