import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Mail, ArrowRight } from "lucide-react";
import apiClient from "../../services/apiClient.js";
import { getImageUrl } from "../../utils/imageUtils.js";

const DEFAULT_TEAM_MEMBERS = [
  {
    id: 1,
    name: "Rathinavel Rajagopal",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
    image: "/home/team/Rathinavel.png",
    featured: true,
  },
  {
    id: 2,
    name: "Uma Devi P K",
    role: "CEO",
    email: "uma@lesuccess.in",
    image: "/home/team/UmaDevi.png",
    featured: true,
  },
  {
    id: 3,
    name: "Muralidharan R",
    role: "Vice President",
    email: "murali.r@lesuccess.in",
    image: "/home/team/Muralidharan.png",
    featured: true,
  },
];

const FeaturedTeamCard = ({ member }) => {
  const imgSrc = member.imageUrl
    ? getImageUrl(member.imageUrl)
    : member.image || "/home/team/dummy.png";

  return (
    <div className="group relative flex flex-col items-center transition-all duration-300 hover:-translate-y-2">
      {/* Background Image Container with TeamBg.png */}
      <div
        className="relative aspect-[383/400] w-full overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat shadow-sm border border-gray-100"
        style={{ backgroundImage: "url('/home/TeamBg.png')" }}
      >
        <img
          src={imgSrc}
          alt={member.name}
          className="h-full w-full select-none object-cover object-top transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/home/team/dummy.png";
          }}
        />

        <span className="absolute top-4 right-4 rounded-full bg-[#ef334c] px-3 py-1 text-[11px] font-bold text-white shadow-md">
          Leadership
        </span>
      </div>

      {/* Detail Overlay Card */}
      <div className="relative z-10 -mt-10 w-[calc(100%-24px)] rounded-2xl border border-[#084b66] bg-[#084b66] px-5 py-4 text-center text-white shadow-lg transition-all duration-300 group-hover:bg-[#073c52]">
        <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#ef334c]">
          {member.name}
        </h3>
        <p className="mt-1 text-xs font-medium text-gray-200">
          {member.role || member.designation}
        </p>
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-300 transition-colors hover:text-white"
          >
            <Mail size={12} />
            {member.email}
          </a>
        )}
      </div>
    </div>
  );
};

export default function OurTeam() {
  const [featuredMembers, setFeaturedMembers] = useState(DEFAULT_TEAM_MEMBERS);

  useEffect(() => {
    let isMounted = true;
    async function fetchTeam() {
      try {
        const res = await apiClient.get("/api/team-members");
        if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiFeatured = res.data.data
            .filter((m) => m.featured || m.displayOrder <= 3)
            .slice(0, 3);
          if (isMounted && apiFeatured.length > 0) {
            setFeaturedMembers(apiFeatured);
          }
        }
      } catch (err) {
        // Fall back to default
      }
    }
    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full bg-[#f8fbfe] py-20 px-6 sm:px-10 lg:px-20 overflow-hidden">
      <div className="mx-auto max-w-7xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1.5 text-xs font-bold text-[#074a68]">
          <Users size={14} className="text-[#ef334c]" />
          OUR TEAM
        </span>

        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Meet Our <span className="text-[#ef334c]">Visionary Leaders</span>
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600 sm:text-lg">
          Dedicated leaders and technology mentors shaping modern careers with passion,
          integrity, and industry excellence.
        </p>

        {/* Featured 3-Card Grid */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {featuredMembers.map((member) => (
            <FeaturedTeamCard key={member.name || member.id} member={member} />
          ))}
        </div>

        {/* View All Team Members CTA Button */}
        <div className="mt-14 flex justify-center">
          <Link
            to="/our-team"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-[#074a68] px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#05374e] hover:shadow-xl hover:gap-3.5"
          >
            View All Team Members
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
