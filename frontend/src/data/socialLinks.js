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

export default SOCIAL_LINKS;
