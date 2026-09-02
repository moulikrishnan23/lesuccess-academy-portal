import React from "react";
import { Circle } from "lucide-react";

const galleryImages = [
  "/images/gallery/gallery-1.png",
  "/images/gallery/gallery-2.png",
  "/images/gallery/gallery-3.png",
  "/images/gallery/gallery-6.png",    
  "/images/gallery/gallery-4.png",  
  "/images/gallery/gallery-5.png",  
];

const LifeAtLeSuccess = () => {
  return (
    <section className="relative h-175 w-full overflow-hidden bg-black">
      {/* ================= GALLERY ================= */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        {/* Image 1 - Left Large */}
        <div className="relative col-start-1 row-span-2 overflow-hidden">
          <img
            src={galleryImages[0]}
            alt="LeSuccess Gallery"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Image 2 */}
        <div className="relative overflow-hidden">
          <img
            src={galleryImages[1]}
            alt="LeSuccess Gallery"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Image 3 */}
        <div className="relative overflow-hidden">
          <img
            src={galleryImages[2]}
            alt="LeSuccess Gallery"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Image 4 */}
        <div className="relative overflow-hidden">
          <img
            src={galleryImages[3]}
            alt="LeSuccess Gallery"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Image 5 */}
        <div className="relative overflow-hidden row-span-2">
          <img
            src={galleryImages[4]}
            alt="LeSuccess Gallery"
            className="h-full w-full object-cover  transition-transform duration-700 hover:scale-105"
          />
        </div>

        <div className="relative overflow-hidden col-span-2">
          <img
            src={galleryImages[5]}
            alt="LeSuccess Gallery"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>

      {/* ================= RED OVERLAY ================= */}
      <div
        className="
          absolute inset-0
          bg-linear-to-r
          from-red-600/60
          via-red-500/40
          to-transparent
          pointer-events-none
        "
      />

      {/* Bottom red overlay */}
      <div
        className="
          absolute inset-x-0 bottom-0
          h-[40%]
          bg-linear-to-t
          from-red-600/50
          to-transparent
          pointer-events-none
        "
      />

      {/* ================= CONTENT ================= */}
      <div
        className="
          absolute
          left-[7%]
          top-1/2
          z-10
          max-w-155
          -translate-y-1/2
          text-white
        "
      >
        {/* Label */}
        <div
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white
            px-4
            py-1.5
            text-[13px]
            font-medium
            tracking-wide
          "
        >
          <Circle size={10} strokeWidth={2} fill="white" />
          OUR GALLERY
        </div>

        {/* Heading */}
        <h2
          className="
            mb-3
            text-[48px]
            text-white
            font-medium
            leading-[1.1]
            tracking-[-1px]
          "
        >
          Life at LeSuccess
        </h2>

        {/* Description */}
        <p
          className="
            text-[21px]
            font-normal
            leading-[1.45]
          "
        >
          Build a strong foundation that empowers you to face
          <br />
          real-world challenges and step into your career with
          <br />
          clarity and self-assurance.
        </p>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        className="
          absolute inset-0
          hidden
          bg-linear-to-b
          from-red-500/20
          via-red-500/50
          to-red-600/65
          max-md:block
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          bottom-8
          left-5
          right-5
          z-10
          hidden
          text-white
          max-md:block
        "
      >
        <div
          className="
            mb-4
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white
            px-3
            py-1
            text-[11px]
          "
        >
          <span>○</span>
          OUR GALLERY
        </div>

        <h2
          className="
            mb-2
            text-[30px]
            font-medium
            leading-tight
          "
        >
          Life at LeSuccess
        </h2>

        <p className="text-[15px] leading-normal">
          Build a strong foundation that empowers you to face real-world
          challenges and step into your career with clarity and self-assurance.
        </p>
      </div>
    </section>
  );
};

export default LifeAtLeSuccess;
