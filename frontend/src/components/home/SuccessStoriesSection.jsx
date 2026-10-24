import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAppData } from "../../context/appData.js";
import { getImageUrl } from "../../utils/imageUtils.js";
import InstagramReelEmbed from "../common/InstagramReelEmbed.jsx";
import ImageLightboxModal from "../common/ImageLightboxModal.jsx";
import SectionHead from "./SectionHead.jsx";
import { Marquee } from "../motion/index.js";

const isItemActive = (item) => Boolean(item?.isActive ?? item?.active ?? false);
const byDisplayOrder = (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0);

/**
 * "Our Students' Success Stories" (spec: docs/mockup/lower-home.html,
 * #stories): story cards drifting in a reverse marquee, each opening the shared
 * lightbox, then the Instagram reels row. Hidden entirely until there is at
 * least one active story or reel.
 */
export default function SuccessStoriesSection() {
  const { successStories } = useAppData();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (successStories.status !== "success") return null;

  const { images = [], reels = [] } = successStories.data;
  const activeImages = images.filter(isItemActive).sort(byDisplayOrder);
  const activeReels = reels.filter(isItemActive).sort(byDisplayOrder);

  if (activeImages.length === 0 && activeReels.length === 0) return null;

  return (
    <section id="stories" className="lh-sec" style={{ paddingBottom: "4rem" }}>
      <div className="lh-wrap">
        <SectionHead
          center
          badge="Success Stories"
          title="Our Students’"
          highlight="Success Stories"
          lead="See what our alumni have achieved after completing their training at LeSuccess Academy."
        />
      </div>

      {activeImages.length > 0 && (
        <Marquee
          reverse
          speed={44}
          gap="1.25rem"
          label="Student success stories"
          items={activeImages.map((image, i) => (
            <button
              key={image.id ?? i}
              type="button"
              className="lh-card lh-story"
              onClick={() => setLightboxIndex(i)}
              aria-label={`View story: ${image.caption || `Student story ${i + 1}`}`}
            >
              <div className="lh-story-img">
                <img
                  src={getImageUrl(image.imageUrl, "", { width: 800 })}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="lh-story-bd">
                <span>{image.caption || "Student story"}</span>
                <span className="lh-story-view">View</span>
              </div>
            </button>
          ))}
        />
      )}

      <div className="lh-wrap">
        {activeReels.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <FaInstagram size={22} className="text-pink-600" aria-hidden="true" />
              Student Reviews & Reels
            </h3>
            <div className="flex snap-x items-stretch gap-6 overflow-x-auto pb-6">
              {activeReels.map((reel) => (
                <div key={reel.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                  <InstagramReelEmbed reelUrl={reel.reelUrl} title={reel.title} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/success-stories" className="lh-btn lh-btn-o">
            View All Success Stories
            <ArrowRight size={18} className="lh-arr" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <ImageLightboxModal
        images={activeImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
