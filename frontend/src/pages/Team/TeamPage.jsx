import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Mail,
  ArrowRight,
  X,
  Clock,
  Layers,
  Copy,
  Check,
  Star,
} from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import { useAppData } from "../../context/AppDataContext.jsx";
import { getImageUrl } from "../../utils/imageUtils.js";
import ErrorState, { EmptyState } from "../../components/ui/ErrorState.jsx";

function TeamSkeletonGrid() {
  return (
    <section className="py-16 bg-[#f8fbfe]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="aspect-[3/4] w-full rounded-3xl bg-slate-200 animate-pulse" />
              <div className="-mt-10 w-[calc(100%-24px)] rounded-2xl bg-[#07405C] p-5 shadow-lg border border-slate-100 flex flex-col items-center gap-2">
                <div className="h-5 w-32 bg-white/20 rounded-md animate-pulse" />
                <div className="h-3.5 w-24 bg-white/15 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const isFeaturedMember = (m) => Boolean(m?.featured || m?.isFeatured);

const getMemberCategory = (m) => {
  if (!m) return '';
  const raw = (m.category || m.department || '').trim();
  if (!raw || raw.toLowerCase() === 'none') return '';
  const lower = raw.toLowerCase();
  if (lower === 'management team' || lower === 'management' || lower === 'management visionaries' || lower.includes('executive')) {
    return 'Management Visionaries';
  }
  if (
    lower === 'technical leadership team' ||
    lower === 'tech visionaries' ||
    lower === 'our mentors' ||
    lower.includes('technical leadership') ||
    lower.includes('mentor') ||
    lower.includes('trainer') ||
    lower.includes('instructor')
  ) {
    return 'Tech Visionaries';
  }
  return raw;
};

const TeamMemberCard = ({ member, onSelect, showCategoryBadge = true }) => {
  const [copied, setCopied] = useState(false);
  const imgSrc = member.imageUrl
    ? getImageUrl(member.imageUrl)
    : member.image || "/home/team/dummy.png";

  const handleEmailClick = (e) => {
    e.stopPropagation();
    if (member.email) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(member.email).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      window.location.href = `mailto:${member.email}`;
    }
  };

  const isFeatured = isFeaturedMember(member);
  const category = getMemberCategory(member);
  const showBadge = isFeatured || (showCategoryBadge && Boolean(category));

  return (
    /* Outer wrapper: relative + pt-3.5 creates space for badge perched on top edge */
    <div className={`relative ${showBadge ? 'pt-3.5' : 'pt-0'}`}>
      {/* Badge — positioned perched on the top edge of the card, visible above the card */}
      {showBadge && (
        <div className="absolute top-3.5 -translate-y-1/2 right-6 z-20 pointer-events-none">
          {isFeatured ? (
            /* Featured members: show ONLY the Featured amber badge */
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-950 shadow-xs select-none tracking-wide pointer-events-auto">
              <Star size={11} className="text-amber-950" fill="currentColor" />
              <span>Featured</span>
            </span>
          ) : (
            /* Non-featured members: show ONLY the compact red category badge */
            <span
              className="inline-flex items-center rounded-full bg-[#DF1E26] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-white shadow-xs select-none tracking-wide max-w-[200px] truncate pointer-events-auto"
              title={category}
            >
              {category}
            </span>
          )}
        </div>
      )}

      {/* Actual card — dimensions unchanged */}
      <div
        onClick={() => onSelect(member)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(member);
          }
        }}
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(7,64,92,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-[#07405C]/35 hover:shadow-[0_20px_40px_rgba(7,64,92,0.12)] cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#DF1E26]"
      >
        {/* Background Image Container (TeamBg.png) with portrait aspect ratio so face is never cropped */}
        <div
          className="relative aspect-[383/400] w-full overflow-hidden rounded-3xl bg-cover bg-center border border-slate-200/90 shadow-xs"
          style={{ backgroundImage: `url('/home/TeamBg.png')` }}
        >
          <img
            src={imgSrc}
            alt={member.name}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/home/team/dummy.png";
            }}
          />

          {/* Subtle bottom-only gradient overlay: transparent in middle/face area, dark only behind bottom text */}
          <div className="absolute inset-x-0 bottom-0 pt-16 pb-4 sm:pb-5 px-4 sm:px-5 bg-gradient-to-t from-[#07405C] via-[#07405C]/80 to-transparent text-white">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-[#DF1E26] transition-colors line-clamp-1">
              {member.name}
            </h3>
            {Boolean(member.role || member.designation) && (
              <p className="mt-0.5 text-xs font-medium text-gray-200 line-clamp-1">
                {member.role || member.designation}
              </p>
            )}

            {member.email && (
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={`mailto:${member.email}`}
                  onClick={handleEmailClick}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white hover:underline transition-colors cursor-pointer max-w-[85%]"
                  title={`Send email or copy ${member.email}`}
                >
                  <Mail size={12} className="shrink-0" />
                  <span className="truncate">{member.email}</span>
                </a>
                {copied ? (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    Copied!
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator.clipboard && member.email) {
                        navigator.clipboard.writeText(member.email).catch(() => {});
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    title="Copy email address"
                    className="text-gray-400 hover:text-white transition p-0.5 cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TeamPage() {
  const { team } = useAppData();
  const { status, data: teamMembers, categories, refetch } = team;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalEmailCopied, setModalEmailCopied] = useState(false);

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedMember(null);
    };
    if (selectedMember) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedMember]);

  const sortTeamMembers = (list) => {
    return [...list].sort((a, b) => {
      const aFeatured = isFeaturedMember(a);
      const bFeatured = isFeaturedMember(b);
      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
      const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
      const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
      return orderA - orderB;
    });
  };

  const activeMembers = (teamMembers || []).filter((m) => m.isActive !== false);

  const categoriesWithMembers = Array.from(
    new Set(
      activeMembers
        .map((m) => getMemberCategory(m))
        .filter(Boolean)
    )
  );

  const standardOrder = ['Management Visionaries', 'Tech Visionaries'];
  const activeCategories = [
    ...standardOrder.filter((cat) => categoriesWithMembers.includes(cat)),
    ...categoriesWithMembers.filter((cat) => !standardOrder.includes(cat)),
  ];

  const hasAnyBatch = activeCategories.length > 0;

  useEffect(() => {
    if (selectedCategory !== 'All' && !activeCategories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [activeCategories, selectedCategory]);

  const filteredMembers = sortTeamMembers(
    activeMembers.filter((m) => {
      if (selectedCategory === 'All') return true;
      const memberCat = getMemberCategory(m).toLowerCase();
      const selected = selectedCategory.trim().toLowerCase();
      return memberCat === selected;
    })
  );

  const managementMembers = sortTeamMembers(
    activeMembers.filter((m) => getMemberCategory(m) === 'Management Visionaries')
  );
  const technicalLeadershipMembers = sortTeamMembers(
    activeMembers.filter((m) => getMemberCategory(m) === 'Tech Visionaries')
  );
  const uncategorizedMembers = sortTeamMembers(
    activeMembers.filter((m) => !getMemberCategory(m))
  );

  const otherCategoryNames = activeCategories.filter(
    (c) => c !== 'Management Visionaries' && c !== 'Tech Visionaries'
  );

  return (
    <div className="w-full bg-white">
      {/* Hero / Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            <Link to="/" className="hover:text-[#07405C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#DF1E26]">Our Team</span>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] bg-white px-4 py-1.5 text-xs font-bold text-[#07405C] shadow-xs mb-6">
            <Users size={14} className="text-[#DF1E26]" />
            Meet The Team
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#101010] sm:text-5xl">
            People Make the <span className="text-[#DF1E26]">Difference</span>
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg text-slate-600 leading-relaxed italic">
            At LeSuccess, passionate people turn potential into possibilities. Our dedicated team brings together expertise, experience, and a genuine commitment to student success.
          </p>
        </div>
      </section>

      {/* Top Category Filter Bar — rendered ONLY when at least one active member belongs to a category */}
      {status === 'success' && activeMembers.length > 0 && hasAnyBatch && (
        <section className="border-b border-slate-100 bg-white py-4 shadow-2xs">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter By Category:</span>
              <span className="text-xs font-semibold text-[#07405C] bg-[#07405C]/10 px-2.5 py-0.5 rounded-full">
                {filteredMembers.length} {filteredMembers.length === 1 ? 'Profile' : 'Profiles'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {['All', ...activeCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#07405C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading Skeleton Grid */}
      {status === 'loading' && <TeamSkeletonGrid />}

      {/* Connection / Backend Failure Error State */}
      {status === 'error' && (
        <div className="py-24 max-w-xl mx-auto px-6">
          <ErrorState
            title="Unable to load team members"
            message="We could not connect to the database to retrieve our team members. Please check your network and try again."
            onRetry={refetch}
            retryLabel="Retry Connection"
          />
        </div>
      )}

      {/* Empty State */}
      {status === 'empty' && (
        <div className="py-24 max-w-xl mx-auto px-6">
          <EmptyState
            title="No team members found"
            message="Our team roster is currently being updated. Please check back shortly."
          />
        </div>
      )}

      {/* Success State */}
      {status === 'success' && activeMembers.length > 0 && (
        !hasAnyBatch ? (
          /* SCENARIO B: NO BATCH MODE — Single unified team layout, zero batch UI */
          <section className="py-16 bg-[#f8fbfe]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
                {sortTeamMembers(activeMembers).map((member) => (
                  <TeamMemberCard
                    key={member.id || member.name}
                    member={member}
                    onSelect={setSelectedMember}
                    showCategoryBadge={false}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : selectedCategory === 'All' ? (
          /* SCENARIO A: ALL VIEW WITH CATEGORIES */
          <>
            {/* Management Visionaries Section — ONLY rendered if it has members */}
            {managementMembers.length > 0 && (
              <section className="py-16 bg-[#f8fbfe]">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1 text-xs font-bold text-[#07405C]">
                      Management Visionaries
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900 mt-3">
                      Visionary <span className="text-[#DF1E26]">Guidance</span>
                    </h2>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                    {managementMembers.map((member) => (
                      <TeamMemberCard
                        key={member.id || member.name}
                        member={member}
                        onSelect={setSelectedMember}
                        showCategoryBadge={true}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Tech Visionaries Section — ONLY rendered if it has members */}
            {technicalLeadershipMembers.length > 0 && (
              <section className={`py-20 ${managementMembers.length > 0 ? 'bg-white' : 'bg-[#f8fbfe]'}`}>
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1 text-xs font-bold text-[#07405C]">
                      Tech Visionaries
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900 mt-3">
                      Tech Visionaries & <span className="text-[#DF1E26]">Core Team</span>
                    </h2>
                    <p className="text-gray-600 mt-3">
                      Senior engineering leaders, technical managers, and system architects guiding program excellence and industry readiness.
                    </p>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {technicalLeadershipMembers.map((member) => (
                      <TeamMemberCard
                        key={member.id || member.name}
                        member={member}
                        onSelect={setSelectedMember}
                        showCategoryBadge={true}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Other Categories dynamically rendered */}
            {otherCategoryNames.map((catName, idx) => {
              const catMembers = sortTeamMembers(
                activeMembers.filter((m) => getMemberCategory(m).toLowerCase() === catName.toLowerCase())
              );
              if (catMembers.length === 0) return null;

              const isAltBg = idx % 2 === 0;
              return (
                <section key={catName} className={`py-16 ${isAltBg ? 'bg-[#f8fbfe]' : 'bg-white'}`}>
                  <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1 text-xs font-bold text-[#07405C]">
                        {catName.toUpperCase()}
                      </span>
                      <h2 className="text-3xl font-bold text-slate-900 mt-3">
                        {catName}
                      </h2>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {catMembers.map((member) => (
                        <TeamMemberCard
                          key={member.id || member.name}
                          member={member}
                          onSelect={setSelectedMember}
                          showCategoryBadge={true}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}

            {/* Uncategorized Members in All view — ONLY rendered if any exist */}
            {uncategorizedMembers.length > 0 && (
              <section className="py-16 bg-[#f8fbfe]">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1 text-xs font-bold text-[#07405C]">
                      OUR TEAM
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900 mt-3">
                      Team <span className="text-[#DF1E26]">Members</span>
                    </h2>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {uncategorizedMembers.map((member) => (
                      <TeamMemberCard
                        key={member.id || member.name}
                        member={member}
                        onSelect={setSelectedMember}
                        showCategoryBadge={false}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          /* Filtered Category View */
          <section className="py-16 bg-white min-h-[400px]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1 text-xs font-bold text-[#07405C]">
                  {selectedCategory.toUpperCase()}
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mt-3">
                  {selectedCategory}
                </h2>
              </div>

              {filteredMembers.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p>No team members listed under "{selectedCategory}" yet.</p>
                </div>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredMembers.map((member) => (
                    <TeamMemberCard
                      key={member.id || member.name}
                      member={member}
                      onSelect={setSelectedMember}
                      showCategoryBadge={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      )}

      {/* Join the Academy Banner */}
      <section className="relative overflow-hidden py-18 bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] text-white text-center">
        {/* Decorative ambient subtle glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#DF1E26]/10 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl text-white tracking-tight">
            Learn Directly from <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-red-400">Industry Leaders</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-200">
            Experience our interactive teaching approach with a free 1-on-1 demo session today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/courses"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-98 cursor-pointer"
            >
              <span>Browse Programs</span>
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Member Details Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn pt-[calc(var(--offer-header-h,44px)+1rem)] pb-20 sm:pb-6"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              aria-label="Close profile"
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              {/* Member Photo */}
              <div className="w-full md:w-56 shrink-0">
                <div
                  className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-cover bg-center border border-slate-200 shadow-md"
                  style={{ backgroundImage: `url('/home/TeamBg.png')` }}
                >
                  <img
                    src={
                      selectedMember.imageUrl
                        ? getImageUrl(selectedMember.imageUrl)
                        : selectedMember.image || "/home/team/dummy.png"
                    }
                    alt={selectedMember.name}
                    className="h-full w-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src = "/home/team/dummy.png";
                    }}
                  />
                </div>
              </div>

              {/* Member Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#DF1E26]/10 px-3 py-1 text-xs font-bold text-[#DF1E26]">
                    <Layers size={12} className="text-[#DF1E26]" />
                    {getMemberCategory(selectedMember)}
                  </span>
                  {isFeaturedMember(selectedMember) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-950 px-2.5 py-0.5 text-xs font-bold shadow-xs">
                      <Star size={11} fill="currentColor" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101010] tracking-tight break-words">
                  {selectedMember.name}
                </h3>
                {Boolean(selectedMember.role || selectedMember.designation) && (
                  <p className="text-base font-semibold text-[#DF1E26] mt-1 break-words">
                    {selectedMember.role || selectedMember.designation}
                  </p>
                )}

                {/* Experience */}
                {Boolean(selectedMember.experience && selectedMember.experience.trim()) && (
                  <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <Clock size={16} className="text-[#07405C] shrink-0" />
                    <span>{selectedMember.experience}</span>
                  </div>
                )}

                {/* Bio */}
                {Boolean(selectedMember.bio && selectedMember.bio.trim()) && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      About
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {selectedMember.bio}
                    </p>
                  </div>
                )}

                {/* Skills Tags */}
                {Boolean(selectedMember.skills && selectedMember.skills.trim()) && (
                  <div className="mt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Areas of Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((skill, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1 text-xs font-medium text-[#DF1E26]"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Contact & Social */}
                {Boolean(selectedMember.email || selectedMember.linkedinUrl) && (
                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
                    {selectedMember.email && (
                      <div className="flex flex-wrap items-center gap-2 max-w-full">
                        <a
                          href={`mailto:${selectedMember.email}`}
                          title={`Send email to ${selectedMember.email}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#07405C] px-3.5 sm:px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#024D72] max-w-full"
                        >
                          <Mail size={14} className="shrink-0" />
                          <span className="truncate max-w-[190px] xs:max-w-xs">{selectedMember.email}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(selectedMember.email).catch(() => {});
                              setModalEmailCopied(true);
                              setTimeout(() => setModalEmailCopied(false), 2000);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                          title="Copy email address"
                        >
                          {modalEmailCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{modalEmailCopied ? "Copied!" : "Copy Email"}</span>
                        </button>
                      </div>
                    )}
                    {selectedMember.linkedinUrl && (
                      <a
                        href={selectedMember.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <FaLinkedinIn size={14} className="text-[#0A66C2]" />
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
