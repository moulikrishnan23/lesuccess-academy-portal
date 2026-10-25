import {
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa6";

export const OFFICIAL_SOCIAL_URLS = {
  instagram: "https://www.instagram.com/lesuccess_official?stkn=cDR6YWRqdzU1aTVo",
  linkedin: "https://www.linkedin.com/company/lesuccess-in/",
  youtube: "https://youtube.com/@lesuccessacademy?si=8KpugpC3B5ULIXmh",
  facebook: "https://www.facebook.com/LeSuccess.in",
  whatsapp: "https://wa.me/918012060000",
};

export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: OFFICIAL_SOCIAL_URLS.instagram,
    icon: FaInstagram,
    hoverClass: "hover:text-pink-300",
    bgClass: "hover:bg-[#E1306C]",
    color: "#E1306C",
  },
  {
    name: "LinkedIn",
    href: OFFICIAL_SOCIAL_URLS.linkedin,
    icon: FaLinkedinIn,
    hoverClass: "hover:text-sky-300",
    bgClass: "hover:bg-[#0077B5]",
    color: "#0077B5",
  },
  {
    name: "YouTube",
    href: OFFICIAL_SOCIAL_URLS.youtube,
    icon: FaYoutube,
    hoverClass: "hover:text-red-300",
    bgClass: "hover:bg-[#FF0000]",
    color: "#FF0000",
  },
  {
    name: "Facebook",
    href: OFFICIAL_SOCIAL_URLS.facebook,
    icon: FaFacebookF,
    hoverClass: "hover:text-blue-300",
    bgClass: "hover:bg-[#1877F2]",
    color: "#1877F2",
  },
  {
    name: "WhatsApp",
    href: OFFICIAL_SOCIAL_URLS.whatsapp,
    icon: FaWhatsapp,
    hoverClass: "hover:text-emerald-300",
    bgClass: "hover:bg-[#25D366]",
    color: "#25D366",
  },
];

const SETTING_KEYS = {
  Instagram: "social_instagram",
  LinkedIn: "social_linkedin",
  YouTube: "social_youtube",
  Facebook: "social_facebook",
  WhatsApp: "social_whatsapp",
};

export function getSocialLinks(settings = {}) {
  return SOCIAL_LINKS.map((item) => ({
    ...item,
    href: settings[SETTING_KEYS[item.name]]?.trim() || item.href,
  }));
}

export function getWhatsAppUrl(settings = {}, message = "") {
  const configured = settings.social_whatsapp?.trim();
  const phone = settings.phone_primary?.replace(/\D/g, "");
  const href = configured || (phone ? `https://wa.me/${phone}` : OFFICIAL_SOCIAL_URLS.whatsapp);
  if (!message) return href;
  return `${href}${href.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;
}

export function formatPhone(value = "") {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  return value;
}

export default SOCIAL_LINKS;
