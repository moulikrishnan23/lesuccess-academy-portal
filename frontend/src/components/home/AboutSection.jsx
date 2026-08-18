import aboutImage from "../../assets/home/about.png"

import {Award, UserStar, CalendarCheck} from "lucide-react"

const AboutSection = () => {
  return (
    <section className="w-full bg-[#eef4fa] px-6 py-16 lg:px-10">
      <div className="mx-auto grid max-w-300 items-center gap-10 lg:grid-cols-2 lg:gap-14">

        {/* Image */}
        <div className="overflow-hidden rounded-2xl">
          <img
            src={aboutImage}
            alt="LeSuccess Team"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div>
          {/* Label */}
          <div className=" mb-5 inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1.5 transition 
          animate-pulse">
            <span className="h-2 w-2 rounded-full bg-[#074a68] "></span>

            <span className="text-xs font-semibold text-[#074a68] transition hover:text-red-500">
              ABOUT US
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-[#df3447]">No.1 IT Training</span>{" "}
            Institute
            <br />
            in <span className="text-black">Coimbatore</span>
          </h2>

          {/* Description */}
          <p className="mt-6 max-w-xl text-base leading-7 text-gray-600">
            LeSuccess is a talent development and placement firm that
            connects academic talent with industry through strategic
            collaborations and innovative hiring solutions.
          </p>

          {/* Features */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#df3447] text-white">
                <Award/>
              </div>

              <span className="text-sm font-medium text-gray-700">
                High Quality
                <br />
                Courses
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#df3447] text-white">
                <UserStar />
              </div>

              <span className="text-sm font-medium text-gray-700">
                Expert
                <br />
                Instructors
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#df3447] text-white">
                <CalendarCheck />
              </div>

              <span className="text-sm font-medium text-gray-700">
                365 Days
                <br />
                Support
              </span>
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-md bg-[#074a68] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#063c55]">
              See Gallery
            </button>

            <button className="rounded-md border-2 border-[#074a68] px-7 py-3 text-sm font-semibold text-[#074a68] transition hover:bg-[#074a68] hover:text-white">
              Know More
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;