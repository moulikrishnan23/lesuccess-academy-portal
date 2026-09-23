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
      case 'TRENDING':
        label = 'Trending'
        break
      case 'POPULAR':
        label = 'Popular'
        break
      case 'NEW':
        label = 'New'
        break
      case 'LIMITED_SEATS':
        label = 'Limited Seats'
        break
      default:
        label = badge
    }
  }

  // Determine styling strictly within the mandatory brand palette
  const badgeKey = (badge || '').toUpperCase()
  const labelLower = (label || '').toLowerCase()

  let colorClasses = 'bg-[#07405C]/10 text-[#07405C] border-[#07405C]/20' // default clean tech pill

  if (badgeKey === 'HIGH_DEMAND' || labelLower.includes('demand')) {
    colorClasses = 'bg-[#DF1E26] text-white border-[#DF1E26] shadow-xs'
  } else if (badgeKey === 'OFFER' || labelLower.includes('offer')) {
    colorClasses = 'bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white border-transparent shadow-xs'
  } else if (badgeKey === 'BEST_SELLER' || labelLower.includes('seller') || labelLower.includes('best')) {
    colorClasses = 'bg-[#07405C] text-white border-[#07405C] shadow-xs'
  } else if (badgeKey === 'MOST_ENROLLED' || labelLower.includes('enrolled') || labelLower.includes('enroll')) {
    colorClasses = 'bg-[#024D72] text-white border-[#024D72] shadow-xs'
  } else if (badgeKey === 'TRENDING' || labelLower.includes('trend')) {
    colorClasses = 'bg-red-50 text-[#DF1E26] border-[#DF1E26]/30'
  } else if (badgeKey === 'POPULAR' || labelLower.includes('popular')) {
    colorClasses = 'bg-slate-100 text-[#07405C] border-slate-300 font-bold'
  } else if (badgeKey === 'NEW' || labelLower === 'new') {
    colorClasses = 'bg-[#101010] text-white border-white/20 shadow-xs'
  } else if (badgeKey === 'LIMITED_SEATS' || labelLower.includes('seat')) {
    colorClasses = 'bg-red-50 text-[#DF1E26] border-[#DF1E26]/40'
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide select-none ${colorClasses} ${className}`}
    >
      {label}
    </span>
  )
}
