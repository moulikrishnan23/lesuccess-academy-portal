export const OFFICIAL_PHONE = "+91 81898 11000";
export const OFFICIAL_WHATSAPP = "https://wa.me/918189811000";

// Retire only the former official number; preserve other configured contacts.
export function normalizeOfficialContactSettings(raw) {
  const result = { ...raw };
  const oldNumbers = new Set(["8012060000", "918012060000"]);
  if (oldNumbers.has(String(result.phone_primary ?? "").replace(/\D/g, ""))) {
    result.phone_primary = OFFICIAL_PHONE;
  }
  const url = String(result.social_whatsapp ?? "");
  try {
    const parsed = new URL(url);
    const number = parsed.hostname === "wa.me" ? parsed.pathname.slice(1) :
      ["api.whatsapp.com", "web.whatsapp.com"].includes(parsed.hostname) ? parsed.searchParams.get("phone") : "";
    if (oldNumbers.has(String(number ?? "").replace(/\D/g, ""))) {
      result.social_whatsapp = OFFICIAL_WHATSAPP;
    }
  } catch { /* Preserve empty or custom settings. */ }
  return result;
}
