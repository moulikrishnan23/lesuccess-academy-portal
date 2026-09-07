import React from 'react'

/**
 * CourseBadge renders a pill badge matching the reference visual design (media_1788696268608.png).
 *
 * Badges:
 * - High Demand: Green pill (bg-[#d1fae5] text-[#065f46] border-[#86efac])
 * - Offer / 30% Offer: Red/Pink pill (bg-[#ffe4e6] text-[#e11d48] border-[#fca5a5])
 * - Best Seller: Yellow/Amber pill (bg-[#fef08a] text-[#854d0e] border-[#fde047])
 * - Most Enrolled: Blue pill (bg-[#dbeafe] text-[#1e40af] border-[#93c5fd])
 */
export default function CourseBadge({ badge, badgeText, className = '' }) {
  if (!badge && !badgeText) return null

  // Determine display label
  let label = badgeText
  if (!label) {
    switch (badge) {
      case 'HIGH_DEMAND':
        label = 'High-demand'
        break
      case 'OFFER':
        label = '30% Offer'
        break
      case 'BEST_SELLER':
        label = 'Best Seller'
        break
      case 'MOST_ENROLLED':
        label = 'Most Enrolled'
        break
      default:
        label = badge
    }
  }

  // Determine styling based on badge enum or text content
  const badgeKey = (badge || '').toUpperCase()
  const labelLower = (label || '').toLowerCase()

  let colorClasses = 'bg-[#d1fae5] text-[#065f46] border-[#86efac]' // default green / high-demand

  if (badgeKey === 'HIGH_DEMAND' || labelLower.includes('demand')) {
    colorClasses = 'bg-[#d1fae5] text-[#065f46] border-[#86efac]'
  } else if (badgeKey === 'OFFER' || labelLower.includes('offer')) {
    colorClasses = 'bg-[#ffe4e6] text-[#e11d48] border-[#fca5a5]'
  } else if (badgeKey === 'BEST_SELLER' || labelLower.includes('seller') || labelLower.includes('best')) {
    colorClasses = 'bg-[#fef08a] text-[#854d0e] border-[#fde047]'
  } else if (badgeKey === 'MOST_ENROLLED' || labelLower.includes('enrolled') || labelLower.includes('enroll')) {
    colorClasses = 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd]'
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}
    >
      {label}
    </span>
  )
}
