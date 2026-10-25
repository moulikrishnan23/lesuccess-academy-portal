import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAppData } from "../../context/appData.js";
import { getImageUrl } from "../../utils/imageUtils.js";
import ErrorState from "../ui/ErrorState.jsx";
import SectionHead from "./SectionHead.jsx";
import { Reveal, useInView } from "../motion/index.js";

/**
 * One leader: a portrait that sits in grayscale until hovered, with a glass
 * caption whose email slides in on hover or focus (spec:
 * docs/mockup/lower-home.html, .member). The photo zooms out once on entry.
 */
function MemberCard({ member, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const imgSrc = member.imageUrl
    ? getImageUrl(member.imageUrl, "", { width: 800 })
    : member.image || "/home/team/dummy.png";
  const role = member.role || member.designation;

  return (
    <Reveal index={index}>
      <article ref={ref} className={`lh-member${inView ? " is-in" : ""}`} tabIndex={0} data-cursor-text="Mentor">
        <img
          src={imgSrc}
          alt={member.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/home/team/dummy.png";
          }}
        />
        <div className="lh-member-cap">
          <h3>
            <span>{member.name}</span>
          </h3>
          {role && <span className="lh-member-role">{role}</span>}
          {member.email && (
            <a className="lh-member-mail" data-cursor-text="Email" href={`mailto:${member.email}`}>
              {member.email}
            </a>
          )}
        </div>
      </article>
    </Reveal>
  );
}

function MemberSkeleton() {
  return <div className="lh-member animate-pulse" aria-hidden="true" />;
}

/**
 * "Meet Our Visionary Leaders" (spec: docs/mockup/lower-home.html, #team): the
 * three featured members (or the first three when fewer are featured).
 */
export default function OurTeam() {
  const { team } = useAppData();
  const { status, data: teamMembers, refetch } = team;

  const featuredMembers = useMemo(() => {
    const list = Array.isArray(teamMembers) ? teamMembers : [];
    const featured = list.filter((m) => m.featured || m.isFeatured);
    return featured.length >= 3 ? featured.slice(0, 3) : list.slice(0, 3);
  }, [teamMembers]);

  return (
    <section id="team" className="lh-sec">
      <div className="lh-wrap">
        <SectionHead
          center
          badge="Our Team"
          title="Meet Our"
          highlight="Visionary Leaders"
          lead="Dedicated leaders and technical experts shaping modern careers with passion, integrity, and industry excellence."
        />

        {status === "loading" && (
          <div className="lh-team">
            <MemberSkeleton />
            <MemberSkeleton />
            <MemberSkeleton />
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto max-w-xl">
            <ErrorState
              title="Unable to load team members"
              message="We could not connect to the server to load our leadership team. Please check your connection or retry."
              onRetry={refetch}
              retryLabel="Retry"
            />
          </div>
        )}

        {status === "empty" && (
          <p className="lh-ev-empty mx-auto max-w-md">Team members will be announced shortly.</p>
        )}

        {status === "success" && featuredMembers.length > 0 && (
          <>
            <div className="lh-team">
              {featuredMembers.map((member, i) => (
                <MemberCard key={member.id || member.name} member={member} index={i} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/our-team" className="lh-btn lh-btn-o" data-cursor-text="Team">
                View All Team Members
                <ArrowRight size={18} className="lh-arr" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
