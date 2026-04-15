import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { SkeletonTableRow } from "../components/common/Skeleton";
import { formatPrice, formatDate, imgUrl, STATUS_BADGE } from "../utils/helpers";
import { FiCalendar, FiX, FiPackage } from "react-icons/fi";
import styles from "./MyBookingsPage.module.css";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/bookings/my-bookings").then(r => setBookings(r.data.bookings || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(b => b.map(x => x._id === id ? { ...x, status:"cancelled", paymentStatus:"refunded" } : x));
      toast.success("Booking cancelled");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const list = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page"><div className="container">
      <div className="page-hd">
        <div><h1>My <span className="g-text">Bookings</span></h1><p>{bookings.length} total bookings</p></div>
        <Link to="/browse" className="btn btn-secondary btn-sm"><FiPackage/> Browse More</Link>
      </div>

      <div className={styles.tabs}>
        {["all", "confirmed", "pending", "cancelled", "completed"].map(f => (
          <button key={f} className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}{f === "all" && ` (${bookings.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`card ${styles.list}`} style={{ padding:"6px 0" }}>
          {Array.from({ length: 4 }, (_, i) => <SkeletonTableRow key={i} />)}
        </div>
      ) : list.length === 0 ? (
        <div className="empty"><div className="icon">📦</div><h3>No {filter === "all" ? "bookings yet" : `${filter} bookings`}</h3>
          {filter === "all" && <Link to="/browse" className="btn btn-primary" style={{ marginTop:18 }}>Browse Items</Link>}
        </div>
      ) : (
        <div className={styles.list}>
          {list.map(b => (
            <div key={b._id} className={`card ${styles.bCard}`}>
              <img src={imgUrl(b.itemId?.image || b.itemImage)} alt={b.itemName} className={styles.thumb}
                onError={e => { e.target.src = `https://picsum.photos/seed/${b.itemId}/200/150`; }}/>
              <div className={styles.info}>
                <div className={styles.top}>
                  <h3>{b.itemName}</h3>
                  <span className={`badge ${STATUS_BADGE[b.status] || "badge-blue"}`}>{b.status}</span>
                </div>
                <p className={styles.owner}>By {b.ownerName}</p>
                <p className={styles.dates}><FiCalendar size={12}/> {formatDate(b.startDate)} to {formatDate(b.endDate)} - {b.totalDays} day{b.totalDays !== 1 ? "s" : ""}</p>
                <div className={styles.badges}>
                  <span className="badge badge-violet">{b.paymentStatus === "paid" ? "Paid" : b.paymentStatus}</span>
                  {b.deliveryOption && <span className="badge badge-blue">Delivery</span>}
                </div>
              </div>
              <div className={styles.right}>
                <span className={styles.price}>{formatPrice(b.totalPrice)}</span>
                <span className={styles.sub}>{formatPrice(b.pricePerDay)}/day</span>
                <div className={styles.acts}>
                  <Link to={`/booking-confirm/${b._id}`} className="btn btn-secondary btn-sm">Receipt</Link>
                  {(b.status === "confirmed" || b.status === "pending") &&
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(b._id)}><FiX/> Cancel</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
}
