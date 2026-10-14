import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, Mail, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useAppData } from "../../context/AppDataContext.jsx";
import { getImageUrl } from "../../utils/imageUtils.js";
import ScrollReveal from "../../animations/ScrollReveal.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import Magnetic from "../ui/Magnetic.jsx";

function TeamCardSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <div className="aspect-[383/400] w-full rounded-3xl bg-slate-200 animate-pulse" />
      <div className="-mt-10 w-[calc(100%-24px)] rounded-2xl bg-[#07405C] p-5 shadow-lg border border-slate-100 flex flex-col items-center gap-2">
        <div className="h-5 w-32 bg-white/20 rounded-md animate-pulse" />
        <div className="h-3.5 w-24 bg-white/15 rounded-md animate-pulse" />
      </div>
    </div>
  );
}

const FeaturedTeamCard = ({ member }) => {
  const imgSrc = member.imageUrl
    ? getImageUrl(member.imageUrl)
    : member.image || "/home/team/dummy.png";

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 35, scale: 0.94 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      className="h-full"
    >
      <SpotlightCard
        tilt={true}
        maxTilt={8}
        spotlightColor="rgba(7, 64, 92, 0.12)"
        className="card-lift-3d group relative flex h-full flex-col items-center cursor-default bg-transparent border-0 shadow-none p-0"
      >
        {/* Background Image Container with TeamBg.png */}
        <div
          className="relative aspect-[383/400] w-full overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat shadow-[0_4px_20px_rgba(7,64,92,0.06)] border border-slate-200/90 transition-all duration-500 group-hover:shadow-[0_24px_50px_rgba(7,64,92,0.16)] group-hover:border-[#07405C]/35"
          style={{ backgroundImage: "url('/home/TeamBg.png')" }}
        >
          <img
            src={imgSrc}
            alt={member.name}
            className="h-full w-full select-none object-cover object-top transition-transform duration-700 group-hover:scale-108"
            onError={(e) => {
              e.currentTarget.src = "/home/team/dummy.png";
            }}
          />

          {/* Yellow Featured badge with Star icon */}
          {Boolean(member.featured || member.isFeatured) && (
            <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-950 shadow-xs z-10 select-none tracking-wide animate-pulse-slow">
              <Star size={11} className="text-amber-950" fill="currentColor" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Detail Overlay Card with 3D elevation */}
        <div className="relative z-10 -mt-10 w-[calc(100%-24px)] rounded-2xl border border-[#07405C] bg-[#07405C] px-5 py-4 text-center text-white shadow-lg transition-all duration-300 group-hover:bg-[#024D72] group-hover:shadow-2xl group-hover:-translate-y-1">
          <h3 className="text-lg font-bold text-white transition-colors group-hover:text-rose-200">
            {member.name}
          </h3>
          {Boolean(member.role || member.designation) && (
            <p className="mt-1 text-xs font-medium text-gray-200">
              {member.role || member.designation}
            </p>
          )}
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
      </SpotlightCard>
    </motion.div>
  );
};

export default function OurTeam() {
  const { team } = useAppData();
  const { status, data: teamMembers, refetch } = team;

  const featuredMembers = useMemo(() => {
    const list = Array.isArray(teamMembers) ? teamMembers : [];
    const featured = list.filter((m) => m.featured || m.isFeatured);
    return featured.length >= 3 ? featured.slice(0, 3) : list.slice(0, 3);
  }, [teamMembers]);

  return (
    <section className="w-full bg-[#f8fbfe] py-20 px-6 sm:px-10 lg:px-20 overflow-hidden transition-colors duration-200">
      <div className="mx-auto max-w-7xl text-center">
        <ScrollReveal preset="hop">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1.5 text-xs font-bold text-[#07405C]">
            <Users size={14} className="text-[#DF1E26]" />
            OUR TEAM
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-[#101010] sm:text-4xl tracking-tight">
            Meet Our <span className="text-[#DF1E26]">Visionary Leaders</span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600 sm:text-lg">
            Dedicated leaders and technical experts shaping modern careers with
            passion, integrity, and industry excellence.
          </p>
        </ScrollReveal>

        {/* Content based on status */}
        {status === "loading" && (
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <TeamCardSkeleton />
            <TeamCardSkeleton />
            <TeamCardSkeleton />
          </div>
        )}

        {status === "error" && (
          <div className="mt-14 max-w-xl mx-auto">
            <ErrorState
              title="Unable to load team members"
              message="We could not connect to the server to load our leadership team. Please check your connection or retry."
              onRetry={refetch}
              retryLabel="Retry"
            />
          </div>
        )}

        {status === "empty" && (
          <div className="mt-14 max-w-md mx-auto p-8 rounded-2xl border border-dashed border-slate-300 bg-white">
            <p className="text-sm font-semibold text-slate-600">
              Team members will be announced shortly.
            </p>
          </div>
        )}

        {status === "success" && featuredMembers.length > 0 && (
          <>
            {/* Featured 3-Card Grid with Spring Hop Reveal */}
            <ScrollReveal
              preset="hop"
              staggerChildren={true}
              staggerDelay={0.12}
              className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
            >
              {featuredMembers.map((member) => (
                <FeaturedTeamCard
                  key={member.name || member.id}
                  member={member}
                />
              ))}
            </ScrollReveal>

            {/* View All Team Members CTA Button */}
            <div className="mt-14 flex justify-center">
              <Magnetic strength={0.25}>
                <Link
                  to="/our-team"
                  className="btn-glow-navy group inline-flex items-center gap-2.5 rounded-xl bg-[#07405C] px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#024D72] hover:shadow-xl hover:gap-3.5"
                >
                  <span>View All Team Members</span>
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </Magnetic>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
