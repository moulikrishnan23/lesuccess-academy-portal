import { useRef, useState } from "react";
import { Users } from "lucide-react";

const teamMembers = [
  // ==========================================================
  // FEATURED MEMBERS
  // ==========================================================

  {
    name: "Rathinavel Rajagopal",
    role: "Director",
    email: "rathinavelrajagopal@lesuccess.in",
    image: "/home/team/Rathinavel.png",
    featured: true,
  },
  {
    name: "Uma Devi P K",
    role: "CEO",
    email: "uma@lesuccess.in",
    image: "/home/team/UmaDevi.png",
    featured: true,
  },
  {
    name: "Muralidharan R",
    role: "Vice President",
    email: "murali.r@lesuccess.in",
    image: "/home/team/Muralidharan.png",
    featured: true,
  },

  // ==========================================================
  // OTHER TEAM MEMBERS
  // ==========================================================

  {
    name: "Kennedy R",
    role: "AGM - Corporate Relationship",
    email: "email@lesuccess.in",
    image: "/home/team/Kennedy.png",
    featured: false,
  },
  {
    name: "Arun Kumar K",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/ArunKumar.png",
    featured: false,
  },
  {
    name: "Felix R",
    role: "Assistant Vice President",
    email: "email@lesuccess.in",
    image: "/home/team/Felix.png",
    featured: false,
  },
  {
    name: "Kirubakaran",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Saranya",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Naveen",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Dinesh",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Keerthana",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Employee Name",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Employee Name",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Employee Name",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Employee Name",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
  {
    name: "Employee Name",
    role: "Role",
    email: "email@lesuccess.in",
    image: "/home/team/dummy.png",
    featured: false,
  },
];


// ==========================================================
// TEAM CARD
// ==========================================================

const TeamCard = ({ member, featured = false, index }) => {
  const isFirstFeatured = featured && index === 0;

  return (
    <div className="relative w-full">

      {/* ================= IMAGE ================= */}

      <div
        className="
          relative
          w-full
          aspect-383/400
          overflow-hidden
          rounded-3xl
          bg-[#e8edf2]
        "
      >
        <img
          src={member.image}
          alt={member.name}
          draggable="false"
          className={`
            h-full
            w-full
            select-none
            ${
              isFirstFeatured
                ? "object-cover"
                : "object-contain"
            }
          `}
        />
      </div>


      {/* ================= DETAILS CARD ================= */}

      <div
        className={`
          relative
          z-10
          mx-auto
          -mt-11.25
          w-[calc(100%-14px)]
          rounded-[20px]
          border
          text-center
          ${
            featured
              ? "min-h-33.75 px-4 py-5"
              : "min-h-24 px-3 py-4"
          }
          border-[#084b68]
          bg-[#084b68]
        `}
      >

        {/* NAME */}

        <h3
          className={`
            font-bold
            leading-tight
            ${
              featured
                ? "text-[17px] sm:text-[18px]"
                : "text-[15px] sm:text-[16px]"
            }
            text-white
          `}
        >
          {member.name}
        </h3>


        {/* ROLE */}

        <p
          className={`
            mt-1
            ${
              featured
                ? "text-[15px] sm:text-[16px]"
                : "text-[13px] sm:text-[14px]"
            }
            text-[#d1d8df]
          `}
        >
          {member.role}
        </p>


        {/* EMAIL */}

        <p
          className={`
            mt-4
            truncate
            ${
              featured
                ? "text-[11px] sm:text-[12px]"
                : "text-[10px] sm:text-[11px]"
            }
            text-white
          `}
        >
          {member.email}
        </p>

      </div>
    </div>
  );
};


// ==========================================================
// OUR TEAM
// ==========================================================

const OurTeam = () => {

  // ========================================================
  // SLIDE STATE
  // ========================================================

  const [currentSlide, setCurrentSlide] = useState(0);

  // ========================================================
  // DRAG STATES
  // ========================================================

  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);


  // ========================================================
  // GET FEATURED MEMBERS
  // ========================================================

  const featuredMembers = teamMembers.filter(
    (member) => member.featured
  );


  // ========================================================
  // GET OTHER MEMBERS
  // ========================================================

  const otherMembers = teamMembers.filter(
    (member) => !member.featured
  );


  // ========================================================
  // CREATE SLIDES
  // 8 MEMBERS PER SLIDE
  // ========================================================

  const membersPerSlide = 8;

  const slides = [];

  for (
    let i = 0;
    i < otherMembers.length;
    i += membersPerSlide
  ) {
    slides.push(
      otherMembers.slice(i, i + membersPerSlide)
    );
  }


  // ========================================================
  // DRAG START
  // ========================================================

  const handleDragStart = (clientX) => {
    setIsDragging(true);

    dragStartX.current = clientX;
    dragCurrentX.current = clientX;
  };


  // ========================================================
  // DRAG MOVE
  // ========================================================

  const handleDragMove = (clientX) => {

    if (!isDragging) return;

    dragCurrentX.current = clientX;
  };


  // ========================================================
  // DRAG END
  // ========================================================

  const handleDragEnd = () => {

    if (!isDragging) return;

    const distance =
      dragCurrentX.current - dragStartX.current;

    const threshold = 80;


    // ------------------------------------------------------
    // DRAG LEFT → NEXT SLIDE
    // ------------------------------------------------------

    if (
      distance < -threshold &&
      currentSlide < slides.length - 1
    ) {
      setCurrentSlide((prev) => prev + 1);
    }


    // ------------------------------------------------------
    // DRAG RIGHT → PREVIOUS SLIDE
    // ------------------------------------------------------

    else if (
      distance > threshold &&
      currentSlide > 0
    ) {
      setCurrentSlide((prev) => prev - 1);
    }


    // Reset drag
    setIsDragging(false);

    dragStartX.current = 0;
    dragCurrentX.current = 0;
  };


  // ========================================================
  // DOT CLICK
  // ========================================================

  const handleDotClick = (index) => {

    // First dot
    if (index === 0) {
      setCurrentSlide(0);
      return;
    }


    // Second dot
    if (index === 1) {
      setCurrentSlide(
        Math.min(1, slides.length - 1)
      );
      return;
    }


    // Third dot
    if (index === 2) {
      setCurrentSlide(
        Math.min(2, slides.length - 1)
      );
    }
  };


  return (
    <section
      className="
        w-full
        bg-white
        px-5
        py-14
        sm:px-8
        sm:py-16
        lg:px-12
        xl:px-16
      "
    >

      <div className="mx-auto max-w-312.5">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="text-center">

          {/* BADGE */}

          <span
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#074a68]
              px-4
              py-1.5
              text-[11px]
              font-medium
              tracking-wide
              text-[#074a68]
              sm:text-[12px]
            "
          >

            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[#074a68]
              "
            />

            <Users size={13} />

            OUR TEAM

          </span>


          {/* HEADING */}

          <h2
            className="
              mt-5
              text-3xl
              font-bold
              leading-tight
              text-[#161616]
              sm:text-4xl
              lg:text-[40px]
            "
          >
            Meet the minds behind{" "}
            <span className="text-[#ed334d]">
              your success
            </span>
          </h2>


          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-5
              max-w-250
              text-base
              leading-7
              text-gray-600
              sm:text-lg
            "
          >
            Our team consists of experienced professionals
            who bring industry insights, practical training,
            and continuous support to help you stay ahead in
            your career journey.
          </p>

        </div>


        {/* ==================================================
            FEATURED MEMBERS
            3 MEMBERS
        ================================================== */}

        <div
          className="
            mx-auto
            mt-11
            grid
            max-w-287.5
            grid-cols-1
            gap-8
            sm:grid-cols-2
            lg:grid-cols-3
            lg:gap-7
          "
        >

          {featuredMembers.map((member, index) => (

            <TeamCard
              key={index}
              member={member}
              featured={true}
              index={index}
            />

          ))}

        </div>


        {/* ==================================================
            OTHER TEAM CAROUSEL
        ================================================== */}

        <div
          className="
            mx-auto
            mt-12
            max-w-287.5
          "
        >

          {/* ==================================================
              DRAG AREA
          ================================================== */}

          <div
            className={`
              overflow-hidden
              select-none
              ${
                isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
              }
            `}
            onMouseDown={(e) => {
              e.preventDefault();
              handleDragStart(e.clientX);
            }}
            onMouseMove={(e) => {
              handleDragMove(e.clientX);
            }}
            onMouseUp={handleDragEnd}
            onMouseLeave={() => {
              if (isDragging) {
                handleDragEnd();
              }
            }}
            onTouchStart={(e) => {
              handleDragStart(
                e.touches[0].clientX
              );
            }}
            onTouchMove={(e) => {
              handleDragMove(
                e.touches[0].clientX
              );
            }}
            onTouchEnd={handleDragEnd}
          >

            {/* ==================================================
                SLIDES
            ================================================== */}

            <div
              className={`
                flex
                ${
                  isDragging
                    ? ""
                    : "transition-transform duration-500 ease-in-out"
                }
              `}
              style={{
                transform: `translateX(-${
                  currentSlide * 100
                }%)`,
              }}
            >

              {slides.map(
                (slide, slideIndex) => (

                  <div
                    key={slideIndex}
                    className="
                      min-w-full
                      grid
                      grid-cols-1
                      gap-x-7
                      gap-y-12
                      sm:grid-cols-2
                      lg:grid-cols-4
                    "
                  >

                    {slide.map(
                      (member, index) => (

                        <TeamCard
                          key={index}
                          member={member}
                          featured={false}
                          index={index}
                        />

                      )
                    )}

                  </div>

                )
              )}

            </div>

          </div>


          {/* ==================================================
              CAROUSEL DOTS
          ================================================== */}

          <div
            className="
              mt-9
              flex
              items-center
              justify-center
              gap-3
            "
          >

            {[0, 1, 2].map((dot) => {

              const isActive =
                currentSlide === dot;

              return (
                <button
                  key={dot}
                  type="button"
                  aria-label={`Go to team slide ${
                    dot + 1
                  }`}
                  onClick={() =>
                    handleDotClick(dot)
                  }
                  className={`
                    h-2.5
                    w-2.5
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      isActive
                        ? "scale-125 bg-[#084b68]"
                        : "bg-[#cbd5dc] hover:bg-[#084b68]"
                    }
                  `}
                />
              );

            })}

          </div>

        </div>

      </div>

    </section>
  );
};

export default OurTeam;