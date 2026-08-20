import { Users } from "lucide-react";

const teamMembers = [
  {
    name: "Rathinavel Rajagopal",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
    image: "",
    featured: true,
  },
  {
    name: "Uma Devi P K",
    role: "CEO",
    email: "uma@lesuccess.in",
    image: "",
    featured: true,
  },
  {
    name: "Muralidharan",
    role: "Vice President",
    email: "murali.r@lesuccess.in",
    image: "",
    featured: true,
  },

  {
    name: "Rathinavel",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
  },
  {
    name: "Rathinavel",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
  },
  {
    name: "Rathinavel",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
  },
  {
    name: "Rathinavel",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
  },
  {
    name: "Rathinavel",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
  },
  {
    name: "Rathinavel",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
  },
  {
    name: "Rathinavel",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
  },
  {
    name: "Rathinavel",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
  },
];

const TeamCard = ({ member, featured = false }) => {
  return (
    <div
      className={`relative ${
        featured ? "w-full" : "w-full"
      }`}
    >
      {/* Image / Placeholder */}
      <div
        className={`relative overflow-hidden rounded-3xl border border-[#d9dfe5] bg-[#e9eff5] ${
          featured
            ? "h-78.75 sm:h-82.5"
            : "h-72.5 sm:h-75"
        }`}
      >
        {member.image && (
          <img
            src={member.image}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Details Card */}
      <div
        className={`relative z-10 mx-auto -mt-12 rounded-[22px] border border-[#d1d8df] bg-[#e8eef4] text-center ${
          featured
            ? "min-h-34.25 px-4 py-5"
            : "min-h-24.5 px-3 py-4"
        } ${
          featured && member.name === "Rathinavel Rajagopal"
            ? "border-[#074a68] bg-[#07506f] text-white"
            : ""
        }`}
      >
        <h3
          className={`font-bold ${
            featured
              ? "text-[20px] sm:text-[22px]"
              : "text-[18px]"
          } ${
            featured && member.name === "Rathinavel Rajagopal"
              ? "text-white"
              : "text-[#084b68]"
          }`}
        >
          {member.name}
        </h3>

        <p
          className={`mt-1 ${
            featured ? "text-[18px]" : "text-[16px]"
          } ${
            featured && member.name === "Rathinavel Rajagopal"
              ? "text-white/80"
              : "text-gray-600"
          }`}
        >
          {member.role}
        </p>

        <p
          className={`mt-4 truncate ${
            featured ? "text-[14px]" : "text-[12px]"
          } ${
            featured && member.name === "Rathinavel Rajagopal"
              ? "text-white"
              : "text-gray-500"
          }`}
        >
          {member.email}
        </p>
      </div>
    </div>
  );
};

const OurTeam = () => {
  const featuredMembers = teamMembers.filter(
    (member) => member.featured
  );

  const otherMembers = teamMembers.filter(
    (member) => !member.featured
  );

  return (
    <section className="w-full bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-20">
      <div className="mx-auto max-w-310">
        {/* Section Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1.5 text-[12px] font-medium tracking-wide text-[#074a68]">
            <span className="h-2 w-2 rounded-full bg-[#074a68]" />
            OUR TEAM
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight text-[#161616] sm:text-4xl lg:text-[40px]">
            Meet the minds behind{" "}
            <span className="text-[#ed334d]">
              your success
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-250 text-base leading-7 text-gray-600 sm:text-lg">
            Our team consists of experienced professionals who bring
            industry insights, practical training, and continuous
            support to help you stay ahead in your career journey.
          </p>
        </div>

        {/* Featured Team Members */}
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {featuredMembers.map((member, index) => (
            <TeamCard
              key={index}
              member={member}
              featured
            />
          ))}
        </div>

        {/* Other Team Members */}
        <div className="mt-10 grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {otherMembers.map((member, index) => (
            <TeamCard
              key={index}
              member={member}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;