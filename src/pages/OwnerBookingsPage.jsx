import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { formatDate, formatPrice, STATUS_BADGE } from "../utils/helpers";
import { FiCalendar, FiPackage, FiUser } from "react-icons/fi";
import styles from "./MyBookingsPage.module.css";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/bookings/owner-bookings")
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const list = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page"><div className="container">
      <div className="page-hd">
        <div><h1>Item <span className="g-text">Bookings</span></h1><p>{bookings.length} bookings on your listings</p></div>
        <Link to="/dashboard" className="btn btn-secondary btn-sm"><FiPackage/> Back to Dashboard</Link>
      </div>

      <div className={styles.tabs}>
        {["all","confirmed","pending","cancelled","completed"].map(f => (
          <button key={f} className={`${styles.tab} ${filter===f ? styles.tabActive : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}{f === "all" && ` (${bookings.length})`}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner"/> : list.length === 0
        ? <div className="empty"><div className="icon">📦</div><h3>No {filter === "all" ? "bookings yet" : `${filter} bookings`}</h3>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop:18 }}>View My Items</Link>
          </div>
        : <div className={styles.list}>
            {list.map(b => (
              <div key={b._id} className={`card ${styles.bCard}`}>
                <div className={styles.info}>
                  <div className={styles.top}>
                    <h3>{b.itemId?.name || b.itemName}</h3>
                    <span className={`badge ${STATUS_BADGE[b.status] || "badge-blue"}`}>{b.status}</span>
                  </div>
                  <p className={styles.owner}><FiUser size={12}/> {b.userId?.name || "Customer"} ({b.userId?.email || "No email"})</p>
                  <p className={styles.dates}><FiCalendar size={12}/> {formatDate(b.startDate)} to {formatDate(b.endDate)} - {b.totalDays} day{b.totalDays !== 1 ? "s" : ""}</p>
                  <div className={styles.badges}>
                    <span className="badge badge-violet">{formatPrice(b.totalPrice)}</span>
                    <span className="badge badge-blue">{b.paymentStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div></div>
  );
}
