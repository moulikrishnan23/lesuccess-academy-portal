import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Images, Maximize2 } from "lucide-react";
import ImageLightboxModal from "../common/ImageLightboxModal.jsx";
import SectionHead from "./SectionHead.jsx";
import { Reveal } from "../motion/index.js";

const PHOTOS = [
  { imageUrl: "/images/gallery/gallery-3.png", caption: "Signing ceremony" },
  { imageUrl: "/images/gallery/gallery-6.png", caption: "LeSuccess team leadership" },
  { imageUrl: "/images/gallery/gallery-4.png", caption: "Campus celebration and activities" },
  { imageUrl: "/images/gallery/gallery-5.png", caption: "Campus academic building" },
  { imageUrl: "/images/gallery/gallery-1.png", caption: "LeSuccess faculty" },
  { imageUrl: "/images/gallery/gallery-2.png", caption: "Certification ceremony" },
];

/**
 * "Life at LeSuccess": an even grid of campus photos inside the page column
 * (3 across on desktop, 2 on tablets and phones), each opening the shared
 * lightbox. One set of photos, all tiles the same shape, so every edge lines up.
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

        <div className="lh-gal">
          {PHOTOS.map((photo, i) => (
            <Reveal key={photo.imageUrl} index={i % 3}>
              <button
                type="button"
                className="lh-gal-tile"
                data-cursor-text="Open"
                aria-label={`Open photo: ${photo.caption}`}
                onClick={() => setLightboxIndex(i)}
              >
                <img src={photo.imageUrl} alt={photo.caption} loading="lazy" />
                <span className="lh-gal-cap" aria-hidden="true">
                  {photo.caption}
                  <Maximize2 size={14} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/gallery" className="lh-btn lh-btn-a btn-flow" data-cursor-text="Gallery">
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
