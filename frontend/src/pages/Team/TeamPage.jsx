import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Mail, ArrowRight, Sparkles, Award } from "lucide-react";
import apiClient from "../../services/apiClient.js";
import { getImageUrl } from "../../utils/imageUtils.js";

const DEFAULT_TEAM_MEMBERS = [
  // Leadership / Featured
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

  // Core Team & Mentors
  {
    id: 4,
    name: "Felix R",
    role: "Assistant Vice President",
    email: "felix@lesuccess.in",
    image: "/home/team/Felix.png",
    featured: false,
  },
  {
    id: 5,
    name: "Kennedy R",
    role: "AGM - Corporate Relationship",
    email: "kennedy@lesuccess.in",
    image: "/home/team/Kennedy.png",
    featured: false,
  },
  {
    id: 6,
    name: "Arun Kumar K",
    role: "Technical Lead & Senior Trainer",
    email: "arunkumar@lesuccess.in",
    image: "/home/team/ArunKumar.png",
    featured: false,
  },
  {
    id: 7,
    name: "Kirubakaran M",
    role: "Full Stack Java Mentor",
    email: "kiruba@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    id: 8,
    name: "Saranya V",
    role: "Data Science & Python Instructor",
    email: "saranya@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    id: 9,
    name: "Naveen Raj",
    role: "Cloud & DevOps Specialist",
    email: "naveen@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    id: 10,
    name: "Dinesh Kumar",
    role: "Corporate Training Consultant",
    email: "dinesh@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    id: 11,
    name: "Keerthana S",
    role: "Student Placement Officer",
    email: "keerthana@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
];

const TeamMemberCard = ({ member, isFeatured = false }) => {
  const imgSrc = member.imageUrl
    ? getImageUrl(member.imageUrl)
    : member.image || "/home/team/dummy.png";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {/* Background Image Container (TeamBg.png) */}
      <div
        className="relative aspect-[383/400] w-full overflow-hidden rounded-3xl bg-cover bg-center border border-gray-100 shadow-sm"
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

        {isFeatured && (
          <span className="absolute top-4 right-4 rounded-full bg-[#ef334c] px-3 py-1 text-[11px] font-bold text-white shadow-md">
            Leadership
          </span>
        )}

        {/* Gradient overlay for readability */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#074a68]/95 via-[#074a68]/60 to-transparent p-6 text-white">
          <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-[#ef334c] transition-colors">
            {member.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-gray-200">
            {member.role || member.designation}
          </p>

          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
            >
              <Mail size={13} />
              {member.email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(DEFAULT_TEAM_MEMBERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTeam() {
      try {
        const res = await apiClient.get("/api/team-members");
        if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          if (isMounted) setTeamMembers(res.data.data);
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

  const featured = teamMembers.filter((m) => m.featured || m.displayOrder <= 3).slice(0, 3);
  const others = teamMembers.filter(
    (m) => !featured.some((f) => f.name === m.name || f.id === m.id)
  );

  return (
    <div className="w-full bg-white">
      {/* Hero / Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            <Link to="/" className="hover:text-[#074a68] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#ef334c]">Our Team</span>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] bg-white px-4 py-1.5 text-xs font-bold text-[#074a68] shadow-xs mb-6">
            <Users size={14} className="text-[#ef334c]" />
            LESUCCESS LEADERSHIP & MENTORS
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Meet the Minds Behind <span className="text-[#ef334c]">LeSuccess</span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-600">
            Our visionary leaders, seasoned industry architects, and dedicated instructors
            bring decades of real-world software engineering experience to guide your journey.
          </p>
        </div>
      </section>

      {/* Leadership / Featured Team */}
      <section className="py-16 bg-[#f8fbfe]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1 text-xs font-bold text-[#074a68]">
              LEADERSHIP TEAM
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3">
              Visionary <span className="text-[#ef334c]">Guidance</span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {featured.map((member) => (
              <TeamMemberCard key={member.name} member={member} isFeatured={true} />
            ))}
          </div>
        </div>
      </section>

      {/* Complete Team & Mentors */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1 text-xs font-bold text-[#074a68]">
              OUR EDUCATORS & SPECIALISTS
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3">
              Core Team & <span className="text-[#ef334c]">Mentors</span>
            </h2>
            <p className="text-gray-600 mt-3">
              Passionate trainers and student advisors dedicated to your everyday technical growth.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {others.map((member) => (
              <TeamMemberCard key={member.name} member={member} isFeatured={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Join the Academy Banner */}
      <section className="py-16 bg-[#074a68] text-white text-center">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Learn Directly from Industry Leaders
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-200">
            Experience our interactive teaching approach with a free 1-on-1 demo session today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/courses"
              className="rounded-lg bg-[#ef334c] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#d4273e]"
            >
              Browse Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
