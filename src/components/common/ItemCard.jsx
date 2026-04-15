import { Link, useNavigate } from "react-router-dom";
import { FiMapPin, FiTruck, FiHeart } from "react-icons/fi";
import { formatPrice, imgUrl, CAT_ICONS } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./ItemCard.module.css";

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const { user, toggleWishlist, isWishlisted } = useAuth();
  const icon = CAT_ICONS[item.category] || "✨";
  const wished = isWishlisted(item._id);
  const catClass = `cat${item.category.replace(/\s+/g, '')}`; // e.g., catBabyShower

  const onWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await toggleWishlist(item);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Wishlist update failed");
    }
  };

  return (
    <Link to={`/items/${item._id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <img
          src={imgUrl(item.image)}
          alt={item.name}
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${item._id}/400/300`; }}
        />
        <span className={`${styles.catBadge} ${styles[catClass]}`}>{icon} {item.category}</span>
        <button
          type="button"
          onClick={onWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 34,
            height: 34,
            borderRadius: 8,
            border: wished ? "1px solid rgba(239,68,68,.35)" : "1px solid var(--border)",
            background: wished ? "rgba(239,68,68,.12)" : "rgba(7,7,16,.78)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: wished ? "var(--red)" : "var(--text-100)",
            zIndex: 2,
          }}
        >
          <FiHeart size={16} style={{ fill: wished ? "var(--red)" : "transparent" }} />
        </button>
        {item.deliveryAvailable && (
          <span className={styles.delivBadge}><FiTruck size={10} /> Delivery</span>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.desc}>{item.description?.slice(0,75)}{item.description?.length > 75 ? "..." : ""}</p>
        {item.location && (
          <p className={styles.loc}><FiMapPin size={11}/> {item.location}</p>
        )}
        <div className={styles.footer}>
          <div>
            <span className={styles.price}>{formatPrice(item.pricePerDay)}</span>
            <span className={styles.per}>/day</span>
          </div>
          <span className={styles.cta}>View</span>
        </div>
      </div>
    </Link>
  );
}
