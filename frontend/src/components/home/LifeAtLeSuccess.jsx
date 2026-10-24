import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Images } from "lucide-react";
import ImageLightboxModal from "../common/ImageLightboxModal.jsx";
import SectionHead from "./SectionHead.jsx";
import { Marquee, Reveal } from "../motion/index.js";

// Masonry heights vary per photo so the columns stagger like the mockup.
const PHOTOS = [
  { imageUrl: "/images/gallery/gallery-3.png", caption: "Signing ceremony", height: 220 },
  { imageUrl: "/images/gallery/gallery-6.png", caption: "LeSuccess team leadership", height: 160 },
  { imageUrl: "/images/gallery/gallery-4.png", caption: "Campus celebration and activities", height: 200 },
  { imageUrl: "/images/gallery/gallery-5.png", caption: "Campus academic building", height: 170 },
  { imageUrl: "/images/gallery/gallery-1.png", caption: "LeSuccess faculty", height: 230 },
  { imageUrl: "/images/gallery/gallery-2.png", caption: "Certification ceremony", height: 150 },
];

/**
 * "Life at LeSuccess" (spec: docs/mockup/lower-home.html, #gallery): a photo
 * strip drifting the other way, then a masonry grid whose tiles open the shared
 * lightbox.
 */
export default function LifeAtLeSuccess() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <section id="gallery" className="lh-sec lh-soft">
      <div className="lh-wrap">
        <SectionHead
          center
          badge="Our Gallery"
          title="Life at"
          highlight="LeSuccess"
          lead="Build a strong foundation that empowers you to face real-world challenges and step into your tech career with clarity, practical confidence, and pride."
        >
          <span className="lh-count">
            <Images size={16} aria-hidden="true" />
            {PHOTOS.length} photos
          </span>
        </SectionHead>
      </div>

      <Marquee
        reverse
        speed={50}
        gap="1rem"
        items={PHOTOS.map((photo) => (
          <div key={photo.imageUrl} className="lh-photo">
            <img src={photo.imageUrl} alt="" loading="lazy" />
          </div>
        ))}
      />

      <div className="lh-wrap">
        <div className="lh-mason">
          {PHOTOS.map((photo, i) => (
            <Reveal key={photo.imageUrl} index={i % 3}>
              <button
                type="button"
                aria-label={`Open photo: ${photo.caption}`}
                style={{ height: photo.height }}
                onClick={() => setLightboxIndex(i)}
              >
                <img src={photo.imageUrl} alt={photo.caption} loading="lazy" />
              </button>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/gallery" className="lh-btn lh-btn-a">
            Explore Full Gallery
            <ArrowRight size={18} className="lh-arr" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <ImageLightboxModal
        images={PHOTOS}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
