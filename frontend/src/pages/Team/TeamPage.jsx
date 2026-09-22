import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Mail,
  ArrowRight,
  Sparkles,
  Award,
  X,
  Briefcase,
  ExternalLink,
  GraduationCap,
  Clock,
  Layers,
  Copy,
  Check,
  Star,
} from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import apiClient from "../../services/apiClient.js";
import { getImageUrl } from "../../utils/imageUtils.js";

const DEFAULT_TEAM_MEMBERS = [
  // Management Team
  {
    id: 1,
    name: "Rathinavel Rajagopal",
    role: "Director",
    department: "Management Team",
    category: "Management Team",
    email: "rathinavelrajagopal@lesuccess.in",
    image: "/home/team/Rathinavel.png",
    experience: "25+ Years in IT Leadership & Strategic Consulting",
    bio: "Over 25 years of global executive experience steering high-impact technology initiatives, enterprise solution architecture, and higher-education skill transformation programs. Dedicated to making world-class engineering education accessible.",
    skills: "Enterprise Architecture, Strategic Consulting, Cloud Strategy, Technology Leadership, Business Transformation",
    featured: true,
  },
  {
    id: 2,
    name: "Uma Devi P K",
    role: "CEO",
    department: "Management Team",
    category: "Management Team",
    email: "uma@lesuccess.in",
    image: "/home/team/UmaDevi.png",
    experience: "20+ Years in Education & IT Management",
    bio: "Visionary leader passionate about empowering the next generation of software engineers through outcome-driven curriculum, corporate alignment, and personalized career mentorship.",
    skills: "Educational Leadership, Talent Acceleration, Strategic Management, Corporate Relations, Academic Partnerships",
    featured: true,
  },
  {
    id: 3,
    name: "Muralidharan R",
    role: "Vice President",
    department: "Management Team",
    category: "Management Team",
    email: "murali.r@lesuccess.in",
    image: "/home/team/Muralidharan.png",
    experience: "18+ Years in Software Engineering & Delivery",
    bio: "Steers training operations and academic excellence, ensuring industry-grade software architecture standards, clean coding disciplines, and modern cloud practices in all LeSuccess courses.",
    skills: "Java Architecture, Distributed Systems, Curriculum Engineering, Agile Leadership, Engineering Management",
    featured: true,
  },
  {
    id: 4,
    name: "Felix R",
    role: "Assistant Vice President",
    department: "Management Team",
    category: "Management Team",
    email: "felix@lesuccess.in",
    image: "/home/team/Felix.png",
    experience: "15+ Years in IT Solutions & Learning Delivery",
    bio: "Leads enterprise corporate training delivery, client consulting, and talent readiness programs for Fortune 500 tech partners and fast-growing Indian engineering centers.",
    skills: "Corporate Training, Solution Consulting, Full Stack Engineering, Client Success",
    featured: false,
  },
  {
    id: 5,
    name: "Kennedy R",
    role: "AGM - Corporate Relationship",
    department: "Management Team",
    category: "Management Team",
    email: "kennedy@lesuccess.in",
    image: "/home/team/Kennedy.png",
    experience: "14+ Years in Industry Relations & Placements",
    bio: "Bridges LeSuccess with top MNCs and high-growth startups across India to create exclusive hiring channels, campus drives, and placement opportunities for all graduates.",
    skills: "Campus Placements, Corporate Hiring Partnerships, Industry Alliances, Career Counseling",
    featured: false,
  },

  // Our Mentors
  {
    id: 6,
    name: "Arun Kumar K",
    role: "Technical Lead & Senior Trainer",
    department: "Our Mentors",
    category: "Our Mentors",
    email: "arunkumar@lesuccess.in",
    image: "/home/team/ArunKumar.png",
    experience: "10+ Years in Java Full Stack & Microservices",
    bio: "Hands-on tech lead specializing in scalable Java enterprise applications, Spring Boot microservices, and React frontends. Mentors learners on real-world projects and interview coding rounds.",
    skills: "Java 21, Spring Boot, Microservices, React, Docker, Kubernetes, MySQL",
    featured: false,
  },
  {
    id: 7,
    name: "Kirubakaran M",
    role: "Full Stack Java Mentor",
    department: "Our Mentors",
    category: "Our Mentors",
    email: "kiruba@lesuccess.in",
    image: "/home/team/dummy.png",
    experience: "7+ Years in Full Stack Development",
    bio: "Passionate developer and educator specializing in Core Java, RESTful APIs, and modern frontend frameworks. Known for interactive teaching and practical debugging sessions.",
    skills: "Java, Spring Boot, React, JavaScript, SQL, REST APIs",
    featured: false,
  },
  {
    id: 8,
    name: "Saranya V",
    role: "Data Science & Python Instructor",
    department: "Our Mentors",
    category: "Our Mentors",
    email: "saranya@lesuccess.in",
    image: "/home/team/dummy.png",
    experience: "6+ Years in Data Analytics & Machine Learning",
    bio: "Specializes in Python, Data Analytics, Pandas, and business intelligence tools. Guides students through building real-time dashboards and predictive models.",
    skills: "Python, Pandas, Power BI, SQL, Data Analytics, Machine Learning",
    featured: false,
  },
  {
    id: 9,
    name: "Naveen Raj",
    role: "Cloud & DevOps Specialist",
    department: "Our Mentors",
    category: "Our Mentors",
    email: "naveen@lesuccess.in",
    image: "/home/team/dummy.png",
    experience: "8+ Years in Cloud & Site Reliability",
    bio: "Expert cloud architect specializing in AWS solutions, Docker containerization, Kubernetes clusters, and automated CI/CD pipelines for production deployments.",
    skills: "AWS, Docker, Kubernetes, Jenkins, CI/CD, Linux, Terraform",
    featured: false,
  },
  {
    id: 10,
    name: "Dinesh Kumar",
    role: "Corporate Training Consultant",
    department: "Our Mentors",
    category: "Our Mentors",
    email: "dinesh@lesuccess.in",
    image: "/home/team/dummy.png",
    experience: "9+ Years in Enterprise Learning Delivery",
    bio: "Consults with corporate HR and engineering teams to design bespoke employee upskilling and fresher-onboarding bootcamps.",
    skills: "Corporate Upskilling, Technical Consulting, Talent Development",
    featured: false,
  },
  {
    id: 11,
    name: "Keerthana S",
    role: "Student Placement Officer",
    department: "Our Mentors",
    category: "Our Mentors",
    email: "keerthana@lesuccess.in",
    image: "/home/team/dummy.png",
    experience: "5+ Years in Career Counseling & Placements",
    bio: "Dedicated career coach conducting resume audits, mock interviews, and scheduling corporate interview drives for every batch.",
    skills: "Placement Coordination, Resume Building, Interview Coaching, Student Support",
    featured: false,
  },
];

const isFeaturedMember = (m) => Boolean(m?.featured || m?.isFeatured);

const getMemberCategory = (m) => {
  if (!m) return 'Our Mentors';
  const raw = (m.category || m.department || '').trim();
  if (!raw) return 'Our Mentors';
  const lower = raw.toLowerCase();
  if (lower === 'management team' || lower.includes('leadership') || lower.includes('executive')) {
    return 'Management Team';
  }
  if (lower === 'our mentors' || lower.includes('mentor') || lower.includes('trainer') || lower.includes('instructor')) {
    return 'Our Mentors';
  }
  return raw;
};

const TeamMemberCard = ({ member, onSelect }) => {
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

  return (
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
      {/* Background Image Container (TeamBg.png) */}
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

        {/* Top Badge: Featured OR Category badge (Mutually exclusive) */}
        {isFeatured ? (
          <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-950 shadow-xs z-10 select-none tracking-wide">
            <Star size={11} className="text-amber-950" fill="currentColor" />
            <span>Featured</span>
          </span>
        ) : (
          <span className="absolute top-3.5 right-3.5 inline-flex items-center rounded-full bg-[#DF1E26] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-xs z-10 select-none tracking-wide max-w-[70%] truncate" title={getMemberCategory(member)}>
            {getMemberCategory(member)}
          </span>
        )}

        {/* Hover hint */}
        <div className="absolute top-3.5 left-3.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#101010]/70 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
          <span>View Profile</span>
          <ArrowRight size={12} />
        </div>

        {/* Gradient overlay for readability */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07405C]/95 via-[#07405C]/60 to-transparent p-6 text-white">
          <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-[#DF1E26] transition-colors">
            {member.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-gray-200">
            {member.role || member.designation}
          </p>

          {member.email && (
            <div className="mt-3 flex items-center gap-2">
              <a
                href={`mailto:${member.email}`}
                onClick={handleEmailClick}
                className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white hover:underline transition-colors cursor-pointer max-w-[85%]"
                title={`Send email or copy ${member.email}`}
              >
                <Mail size={13} className="shrink-0" />
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
  );
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(DEFAULT_TEAM_MEMBERS);
  const [categories, setCategories] = useState(['Management Team', 'Our Mentors']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalEmailCopied, setModalEmailCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchTeam() {
      try {
        const [teamRes, catRes] = await Promise.allSettled([
          apiClient.get("/api/team-members"),
          apiClient.get("/api/team-categories"),
        ]);

        if (teamRes.status === 'fulfilled' && teamRes.value?.data?.data && Array.isArray(teamRes.value.data.data) && teamRes.value.data.data.length > 0) {
          if (isMounted) setTeamMembers(teamRes.value.data.data);
        }

        if (catRes.status === 'fulfilled' && catRes.value?.data?.data && Array.isArray(catRes.value.data.data)) {
          const names = catRes.value.data.data.map((c) => c.name);
          const combined = Array.from(new Set(['Management Team', 'Our Mentors', ...names]));
          if (isMounted) setCategories(combined);
        }
      } catch (err) {
        // Fall back to default roster
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const filteredMembers = sortTeamMembers(
    teamMembers.filter((m) => {
      if (selectedCategory === 'All') return true;
      const memberCat = getMemberCategory(m).toLowerCase();
      const selected = selectedCategory.trim().toLowerCase();
      return memberCat === selected;
    })
  );

  const managementMembers = sortTeamMembers(
    teamMembers.filter((m) => getMemberCategory(m) === 'Management Team')
  );
  const mentorMembers = sortTeamMembers(
    teamMembers.filter((m) => getMemberCategory(m) === 'Our Mentors')
  );

  // Remaining dynamic categories beyond Management Team and Our Mentors
  const otherCategoryNames = Array.from(
    new Set([
      ...categories.filter((c) => c !== 'All' && c !== 'Management Team' && c !== 'Our Mentors'),
      ...teamMembers
        .map((m) => getMemberCategory(m))
        .filter((c) => c && c !== 'Management Team' && c !== 'Our Mentors'),
    ])
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
            LESUCCESS LEADERSHIP & MENTORS
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#101010] sm:text-5xl">
            Meet the Minds Behind <span className="text-[#DF1E26]">LeSuccess</span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-600">
            Our visionary leaders, seasoned industry architects, and dedicated instructors
            bring decades of real-world software engineering experience to guide your journey.
          </p>
        </div>
      </section>

      {/* Top Category Filter Bar */}
      <section className="border-b border-slate-100 bg-white py-4 shadow-2xs">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter By Category:</span>
            <span className="text-xs font-semibold text-[#07405C] bg-[#07405C]/10 px-2.5 py-0.5 rounded-full">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'Profile' : 'Profiles'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 p-1 bg-slate-100 rounded-2xl">
            {['All', ...categories].map((cat) => (
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

      {selectedCategory === 'All' ? (
        <>
          {/* Management Team Section */}
          <section className="py-16 bg-[#f8fbfe]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1 text-xs font-bold text-[#07405C]">
                  MANAGEMENT TEAM
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
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Our Mentors Section */}
          <section className="py-20 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C] px-4 py-1 text-xs font-bold text-[#07405C]">
                  OUR MENTORS
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mt-3">
                  Core Team & <span className="text-[#DF1E26]">Mentors</span>
                </h2>
                <p className="text-gray-600 mt-3">
                  Passionate trainers and student advisors dedicated to your everyday technical growth.
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mentorMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id || member.name}
                    member={member}
                    onSelect={setSelectedMember}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Other Categories dynamically rendered by their actual category names */}
          {otherCategoryNames.map((catName, idx) => {
            const catMembers = sortTeamMembers(
              teamMembers.filter((m) => getMemberCategory(m).toLowerCase() === catName.toLowerCase())
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
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
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
                  />
                ))}
              </div>
            )}
          </div>
        </section>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              aria-label="Close profile"
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
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
              <div className="flex-1">
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

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101010] tracking-tight">
                  {selectedMember.name}
                </h3>
                <p className="text-base font-semibold text-[#DF1E26] mt-1">
                  {selectedMember.role || selectedMember.designation}
                </p>

                {/* Experience */}
                {selectedMember.experience && (
                  <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <Clock size={16} className="text-[#07405C] shrink-0" />
                    <span>{selectedMember.experience}</span>
                  </div>
                )}

                {/* Bio */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    About
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {selectedMember.bio ||
                      "Dedicated educator and mentor at LeSuccess Academy, empowering students with modern industry capabilities."}
                  </p>
                </div>

                {/* Skills Tags */}
                {selectedMember.skills && (
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
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  {selectedMember.email && (
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${selectedMember.email}`}
                        title={`Send email to ${selectedMember.email}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#07405C] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#024D72]"
                      >
                        <Mail size={14} />
                        <span>{selectedMember.email}</span>
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
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
