/**
 * Shared utilities for course offer calculations, badge normalization,
 * and dynamic sorting across OfferHeader and ChooseYourPath components.
 */

export const BADGE_THEMES = {
  "Special Offer": {
    type: "Special Offer",
    badgeClasses: "bg-white/20 text-white border-white/30 shadow-xs",
    background: "bg-white/20",
    textColor: "text-white",
    borderColor: "border-white/30",
  },
  "Trending Course": {
    type: "Trending Course",
    badgeClasses: "bg-purple-500/30 text-white border-purple-300/40 shadow-xs",
    background: "bg-purple-500/30",
    textColor: "text-white",
    borderColor: "border-purple-300/40",
  },
  "Most Enrolled": {
    type: "Most Enrolled",
    badgeClasses: "bg-blue-500/30 text-white border-blue-300/40 shadow-xs",
    background: "bg-blue-500/30",
    textColor: "text-white",
    borderColor: "border-blue-300/40",
  },
  "High Demand": {
    type: "High Demand",
    badgeClasses: "bg-emerald-500/30 text-white border-emerald-300/40 shadow-xs",
    background: "bg-emerald-500/30",
    textColor: "text-white",
    borderColor: "border-emerald-300/40",
  },
};

export const ORDERED_BADGE_TYPES = [
  "Special Offer",
  "Trending Course",
  "Most Enrolled",
  "High Demand",
];

/**
 * Extracts a numeric offer percentage (0-100) from course fields.
 * Checks explicit percentage fields, badge texts, discount labels,
 * or computes it from price and discountPrice.
 *
 * @param {object} course
 * @returns {number} Integer percentage, e.g. 50, 30, or 0 if none
 */
export function getCourseOfferPercentage(course) {
  if (!course) return 0;

  // 1. Explicit offer percentage field if present
  if (typeof course.offerPercentage === 'number' && !Number.isNaN(course.offerPercentage)) {
    return Math.round(course.offerPercentage);
  }

  // 2. Parse percentage from badgeText, badgeLabel, or discountLabel (e.g. "50% Offer", "30% OFF")
  const textCandidates = [
    course.badgeText,
    course.badgeLabel,
    course.discountLabel,
    course.badge,
  ].filter(Boolean);

  for (const text of textCandidates) {
    const match = String(text).match(/(\d+)\s*%/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 100) {
        return parsed;
      }
    }
  }

  // 3. Compute from price and discountPrice if both are positive numbers
  if (
    typeof course.price === 'number' &&
    typeof course.discountPrice === 'number' &&
    course.price > 0 &&
    course.discountPrice > 0 &&
    course.price > course.discountPrice
  ) {
    const computed = Math.round(((course.price - course.discountPrice) / course.price) * 100);
    if (computed > 0 && computed <= 100) {
      return computed;
    }
  }

  return 0;
}

/**
 * Determines the canonical badge type for the course.
 * Preserves the 4 standard types: "Special Offer", "Trending Course", "Most Enrolled", "High Demand".
 *
 * @param {object} course
 * @param {number} fallbackIndex
 * @returns {string}
 */
export function getCourseBadgeType(course, fallbackIndex = 0) {
  if (!course) return "Special Offer";

  const offerPercent = getCourseOfferPercentage(course);
  const rawBadge = String(course.badge || '').toLowerCase().trim();
  const rawText = String(course.badgeText || course.badgeLabel || '').toLowerCase().trim();

  // If there is a discount/offer percentage or badge is OFFER
  if (offerPercent > 0 || rawBadge === 'offer' || rawText.includes('offer')) {
    return "Special Offer";
  }

  // Trending
  if (rawBadge.includes('trend') || rawText.includes('trend')) {
    return "Trending Course";
  }

  // Most Enrolled
  if (rawBadge.includes('enroll') || rawText.includes('enroll')) {
    return "Most Enrolled";
  }

  // High Demand
  if (rawBadge.includes('demand') || rawText.includes('demand')) {
    return "High Demand";
  }

  // Fallback to cycling through the standard 4 badge types
  return ORDERED_BADGE_TYPES[fallbackIndex % ORDERED_BADGE_TYPES.length];
}

/**
 * Resolves the styling theme object for a badge type.
 *
 * @param {string|object} itemOrType
 * @param {number} fallbackIndex
 * @returns {object} BADGE_THEMES entry
 */
export function getBadgeTheme(itemOrType, fallbackIndex = 0) {
  if (!itemOrType) return BADGE_THEMES["Special Offer"];

  const typeName =
    typeof itemOrType === 'string'
      ? itemOrType
      : (itemOrType.badgeType || getCourseBadgeType(itemOrType, fallbackIndex));

  if (BADGE_THEMES[typeName]) {
    return BADGE_THEMES[typeName];
  }

  const lower = String(typeName).toLowerCase();
  if (lower.includes('offer')) return BADGE_THEMES["Special Offer"];
  if (lower.includes('trend')) return BADGE_THEMES["Trending Course"];
  if (lower.includes('enroll')) return BADGE_THEMES["Most Enrolled"];
  if (lower.includes('demand')) return BADGE_THEMES["High Demand"];

  const fallbackKey = ORDERED_BADGE_TYPES[fallbackIndex % ORDERED_BADGE_TYPES.length];
  return BADGE_THEMES[fallbackKey] || BADGE_THEMES["Special Offer"];
}

/**
 * Checks whether a course is active and eligible for offer / featured badge display.
 *
 * @param {object} course
 * @returns {boolean}
 */
export function isEligibleCourse(course) {
  if (!course) return false;

  // Active status check
  const isActive = course.isActive !== false && course.status !== 'INACTIVE';
  if (!isActive) return false;

  // Must have an offer percentage or a badge
  const hasOffer = getCourseOfferPercentage(course) > 0;
  const hasBadge = Boolean(course.badge || course.badgeText || course.badgeLabel || course.discountLabel);

  return hasOffer || hasBadge;
}

/**
 * Dynamically sorts courses so that:
 * 1. Courses with highest offer percentage appear first (e.g. 50% -> 30% -> 20%).
 * 2. Courses with equal offer percentages (or no offer percentage) preserve their
 *    displayOrder or fallback ID ordering.
 *
 * @param {Array<object>} courses
 * @returns {Array<object>} Sorted new array
 */
export function sortCoursesByOffer(courses) {
  if (!Array.isArray(courses)) return [];

  return [...courses].sort((a, b) => {
    const offerA = getCourseOfferPercentage(a);
    const offerB = getCourseOfferPercentage(b);

    // Highest offer percentage first
    if (offerB !== offerA) {
      return offerB - offerA;
    }

    // Secondary sort: displayOrder if available
    const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
    const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Tertiary sort: id
    return (a.id ?? 0) - (b.id ?? 0);
  });
}

/**
 * Generates engaging headline text for the OfferHeader banner for a course.
 *
 * @param {object} course
 * @param {number} offerPercentage
 * @param {string} badgeType
 * @returns {string}
 */
export function formatCourseOfferHeadline(course, offerPercentage = 0, badgeType = "Special Offer") {
  if (!course) return "";

  const title = course.title || course.name || "Specialized Program";

  if (offerPercentage > 0) {
    return `${title} - ${offerPercentage}% Offer 10 Days Only - Limited Seats!`;
  }

  if (badgeType === "Trending Course") {
    return `${title} - Industry-Ready Curriculum with 100% Placement Support!`;
  }

  if (badgeType === "Most Enrolled") {
    return `${title} - Enterprise Masterclass with Live Projects & Mentorship!`;
  }

  if (badgeType === "High Demand") {
    return `${title} - Hands-on Cloud, Docker & Kubernetes Training with Placement!`;
  }

  return `${title} - Career-Focused Practical Training with Live Projects!`;
}
