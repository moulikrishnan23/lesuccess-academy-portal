import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Mail, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, motionSafe, ONCE_IN_VIEW } from "../../animations/variants.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
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
      {/* Background Image Container with TeamBg.png — designed normal state */}
      <div
        className="relative aspect-[383/400] w-full overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat shadow-[0_4px_20px_rgba(7,64,92,0.06)] border border-slate-200/90 transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(7,64,92,0.12)] group-hover:border-[#07405C]/35"
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

        {/* Yellow Featured badge with Star icon — matching Admin Team UI */}
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-950 shadow-xs z-10 select-none tracking-wide">
          <Star size={11} className="text-amber-950" fill="currentColor" />
          <span>Featured</span>
        </span>
      </div>

      {/* Detail Overlay Card */}
      <div className="relative z-10 -mt-10 w-[calc(100%-24px)] rounded-2xl border border-[#07405C] bg-[#07405C] px-5 py-4 text-center text-white shadow-lg transition-all duration-300 group-hover:bg-[#024D72] group-hover:shadow-xl">
        <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#DF1E26]">
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
  const reduced = useReducedMotion();
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
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1.5 text-xs font-bold text-[#07405C]">
            <Users size={14} className="text-[#DF1E26]" />
            OUR TEAM
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-[#101010] sm:text-4xl">
            Meet Our <span className="text-[#DF1E26]">Visionary Leaders</span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600 sm:text-lg">
            Dedicated leaders and technology mentors shaping modern careers with passion,
            integrity, and industry excellence.
          </p>
        </motion.div>

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
            className="group inline-flex items-center gap-2.5 rounded-xl bg-[#07405C] px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#024D72] hover:shadow-xl hover:gap-3.5"
          >
            View All Team Members
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
