import {
  Clock3,
  Monitor,
  BriefcaseBusiness,
  Download,
  Layers3,
} from "lucide-react";



const courses = [
  {
    title: "Python: Full Stack Development",
    duration: "4 Months",
    badge: "High-demand",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvygkXP-NDi1MJ-wTvQVnJokpXQgwPFmZ4yJsz3tq_sA&s=10"
  },
  {
    title: "JAVA: Full Stack Development",
    duration: "4 Months",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQClSrSy94fg7Y6VBv-HfVvCjzl17kfQTea2fOVE5oDAuSUA4wrpvxTEMY&s=10"
  },
  {
    title: "Data Analytics",
    duration: "3 Months",
    badge: "30% Offer",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/New_Power_BI_Logo.svg/960px-New_Power_BI_Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20210102182532"
  },
  {
    title: "AWS with DevOps",
    duration: "3 Months",
    badge: "Best Seller",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/3840px-Amazon_Web_Services_Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"
  },
];

const ChooseYourPath = () => {
  return (
    <section className="w-full bg-[#eef4fa] px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-300 text-center">

        <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1 text-xs font-medium text-[#074a68] transition animate-pulse">
          <Layers3 size={14} />
          CHOOSE YOUR PATH
        </span>

        <h2 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
          Build Your{" "}
          <span className="text-[#ed334d]">High-Paying</span> Tech Career
        </h2>

        <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-gray-600 sm:text-lg">
          Build a strong foundation that empowers you to face real-world
          challenges and step into your career with clarity and self-assurance.
        </p>

        <div className="mt-12 grid gap-7 md:grid-cols-2">

          {courses.map((course) => (
            <div
              key={course.title}
              className="relative rounded-2xl bg-white p-7 shadow-sm"
            >

              {course.badge && (
                <span className="absolute right-7 top-0 -translate-y-1/2 rounded-md border border-green-300 bg-green-100 px-3 py-2 text-xs font-medium text-green-700">
                  {course.badge}
                </span>
              )}

              <div className="flex flex-col items-center">

                <div className="courselogo flex h-16 w-16 items-center justify-center rounded-xl border border-[#36a8dc] text-[#074a68]">
                  <img src={course.logo} width={50}/>
                </div>

                <h3 className="mt-4 text-xl font-bold text-[#353b4f] sm:text-2xl">
                  {course.title}
                </h3>

                <p className="mt-5 max-w-xl text-base leading-7 text-gray-500">
                  Industry-led Full Stack Training with Python to build
                  real-world skills and confidently advance your career.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-5 text-sm text-gray-800">

                  <span className="flex items-center gap-2">
                    <Clock3 size={18} className="text-[#074a68]" />
                    {course.duration}
                  </span>

                  <span className="flex items-center gap-2">
                    <Monitor size={18} className="text-[#074a68]" />
                    Offline/Online
                  </span>

                  <span className="flex items-center gap-2">
                    <BriefcaseBusiness
                      size={18}
                      className="text-[#074a68]"
                    />
                    Placement Assistance
                  </span>

                </div>

                <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-5">

                  <button className="flex items-center justify-center gap-2 rounded-md border border-[#074a68] py-3 text-[#27627d]">
                    <Download size={18} />
                    Syllabus
                  </button>

                  <button className="rounded-md bg-[#074a68] py-3 text-white">
                    Enroll Now
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default ChooseYourPath;