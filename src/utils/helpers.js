export const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const calcDays = (s, e) => {
  if (!s || !e) return 1;
  return Math.max(1, Math.ceil((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24)) + 1);
};

const BACKEND_URL = "https://blog-backend-nu-indol.vercel.app";

export const imgUrl = (path) => {
  if (!path) return `https://picsum.photos/seed/default/400/300`;
  if (path.startsWith("http")) return path;
  // Prepend backend URL so /uploads/filename resolves correctly in production
  return `${BACKEND_URL}${path}`;
};

export const CATEGORIES = ["All","Wedding","Birthday","Festival","Corporate","Baby Shower","Anniversary","Halloween","Christmas","Other"];

export const CAT_ICONS = {
  Wedding:"💍", Birthday:"🎂", Festival:"🎉", Corporate:"💼",
  "Baby Shower":"🍼", Anniversary:"❤️", Halloween:"🎃", Christmas:"🎄", Other:"✨"
};

export const STATUS_BADGE = {
  confirmed: "badge-green", pending: "badge-yellow", cancelled: "badge-red", completed: "badge-blue"
};
