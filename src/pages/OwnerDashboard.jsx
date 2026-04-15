import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { SkeletonStatCard, SkeletonTableRow } from "../components/common/Skeleton";
import { formatPrice, imgUrl, CAT_ICONS } from "../utils/helpers";
import { FiPlusCircle, FiEdit2, FiTrash2, FiPackage, FiCalendar, FiDollarSign, FiEye } from "react-icons/fi";
import styles from "./OwnerDashboard.module.css";

export default function OwnerDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/items/my-items").then(r => setItems(r.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(p => p.filter(i => i._id !== id));
      toast.success("Item deleted");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const totalDays = items.reduce((s, i) => s + (i.bookedDates?.length || 0), 0);
  const totalEarned = items.reduce((s, i) => s + (i.bookedDates?.length || 0) * i.pricePerDay, 0);
  const active = items.filter(i => i.isActive && i.isApproved).length;

  return (
    <div className="page"><div className="container">
      <div className="page-hd">
        <div><h1>Owner <span className="g-text">Dashboard</span></h1><p>Manage your listings</p></div>
        <Link to="/add-item" className="btn btn-primary"><FiPlusCircle/> Add New Item</Link>
      </div>

      <div className={styles.stats}>
        {loading
          ? Array.from({ length: 4 }, (_, i) => <SkeletonStatCard key={i} />)
          : [
              { icon:<FiPackage/>, label:"Total Listings", val:items.length, c:"blue" },
              { icon:<FiEye/>, label:"Active", val:active, c:"green" },
              { icon:<FiCalendar/>, label:"Days Rented", val:totalDays, c:"yellow" },
              { icon:<FiDollarSign/>, label:"Est. Earnings", val:formatPrice(totalEarned), c:"violet" },
            ].map((s, i) => (
              <div key={i} className={`card ${styles.statCard}`}>
                <div className={`${styles.statIco} ${styles["ico_" + s.c]}`}>{s.icon}</div>
                <div><p className={styles.statLabel}>{s.label}</p><p className={styles.statVal}>{s.val}</p></div>
              </div>
            ))}
      </div>

      {loading ? (
        <div className={`card ${styles.tableCard}`}>
          <div className={styles.tableHd}><h3>Your Listings</h3></div>
          <div>{Array.from({ length: 5 }, (_, i) => <SkeletonTableRow key={i} />)}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="empty"><div className="icon">🏪</div><h3>No listings yet</h3><Link to="/add-item" className="btn btn-primary" style={{ marginTop:18 }}><FiPlusCircle/> Add First Item</Link></div>
      ) : (
        <div className={`card ${styles.tableCard}`}>
          <div className={styles.tableHd}><h3>Your Listings ({items.length})</h3></div>
          <div style={{ overflowX:"auto" }}>
            <table className="tbl">
              <thead><tr>
                <th>Item</th><th>Category</th><th>Price/Day</th><th>Days Booked</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div className={styles.itemCell}>
                        <img src={imgUrl(item.image)} alt={item.name} className={styles.tImg}
                          onError={e => { e.target.src = `https://picsum.photos/seed/${item._id}/60/50`; }}/>
                        <div>
                          <p className={styles.tName}>{item.name}</p>
                          <p className={styles.tDesc}>{item.description?.slice(0, 45)}...</p>
                        </div>
                      </div>
                    </td>
                    <td>{CAT_ICONS[item.category]} {item.category}</td>
                    <td style={{ color:"var(--blue)", fontWeight:700 }}>{formatPrice(item.pricePerDay)}</td>
                    <td><span className={styles.daysBadge}>{item.bookedDates?.length || 0} days</span></td>
                    <td>
                      {item.isApproved && item.isActive
                        ? <span className="badge badge-green">Active</span>
                        : !item.isApproved ? <span className="badge badge-yellow">Pending</span>
                        : <span className="badge badge-red">Inactive</span>}
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        <Link to={`/items/${item._id}`} className="btn btn-ghost btn-sm"><FiEye/></Link>
                        <Link to={`/edit-item/${item._id}`} className="btn btn-secondary btn-sm"><FiEdit2/></Link>
                        <button className="btn btn-danger btn-sm" onClick={() => del(item._id)}><FiTrash2/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div></div>
  );
}
