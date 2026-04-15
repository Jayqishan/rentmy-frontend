import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { formatPrice, formatDate } from "../utils/helpers";
import { FiUsers, FiPackage, FiCalendar, FiDollarSign, FiCheck, FiX, FiTrash2, FiRefreshCw } from "react-icons/fi";
import styles from "./AdminPanel.module.css";

const TABS = ["overview","users","items","bookings"];

export default function AdminPanel() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [tab]); // eslint-disable-line

  const load = async () => {
    setLoading(true);
    try {
      if (tab==="overview") { const r = await api.get("/admin/stats"); setStats(r.data.stats); }
      else if (tab==="users") { const r = await api.get("/admin/users"); setUsers(r.data.users); }
      else if (tab==="items") { const r = await api.get("/admin/items"); setItems(r.data.items); }
      else { const r = await api.get("/admin/bookings"); setBookings(r.data.bookings); }
    } catch { toast.error("Load failed"); } finally { setLoading(false); }
  };

  const toggleUser = async (id, cur) => {
    try { await api.put(`/admin/users/${id}/toggle`); setUsers(u => u.map(x => x._id===id?{...x,isActive:!cur}:x)); toast.success(cur?"Deactivated":"Activated"); } catch { toast.error("Failed"); }
  };
  const changeRole = async (id, role) => {
    try { await api.put(`/admin/users/${id}/role`,{role}); setUsers(u=>u.map(x=>x._id===id?{...x,role}:x)); toast.success("Role updated"); } catch { toast.error("Failed"); }
  };
  const approveItem = async (id, val) => {
    try { await api.put(`/admin/items/${id}/approve`,{isApproved:val}); setItems(i=>i.map(x=>x._id===id?{...x,isApproved:val}:x)); toast.success(val?"Approved":"Rejected"); } catch { toast.error("Failed"); }
  };
  const delItem = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await api.delete(`/admin/items/${id}`); setItems(i=>i.filter(x=>x._id!==id)); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };
  const setBookingStatus = async (id, status) => {
    try { await api.put(`/admin/bookings/${id}/status`,{status}); setBookings(b=>b.map(x=>x._id===id?{...x,status}:x)); toast.success("Updated"); } catch { toast.error("Failed"); }
  };

  return (
    <div className="page"><div className="container">
      <div className="page-hd">
        <div><h1>Admin <span className="g-text">Panel</span></h1><p>Manage the RentMyOccasion platform</p></div>
        <button className="btn btn-ghost btn-sm" onClick={load}><FiRefreshCw/> Refresh</button>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:""}`} onClick={() => setTab(t)}>
            {t==="overview"&&<FiDollarSign/>}{t==="users"&&<FiUsers/>}{t==="items"&&<FiPackage/>}{t==="bookings"&&<FiCalendar/>}
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner"/> : <div className="fade">

        {tab==="overview" && (
          <div>
            <div className={styles.statsGrid}>
              {[
                {icon:<FiUsers/>, label:"Users", val:stats.users||0, c:"blue"},
                {icon:<FiPackage/>, label:"Items", val:stats.items||0, c:"violet"},
                {icon:<FiCalendar/>, label:"Bookings", val:stats.bookings||0, c:"yellow"},
                {icon:<FiDollarSign/>, label:"Revenue", val:formatPrice(stats.revenue||0), c:"green"},
              ].map((s,i) => (
                <div key={i} className={`card ${styles.sStat}`}>
                  <div className={`${styles.sIco} ${styles["c_"+s.c]}`}>{s.icon}</div>
                  <p className={styles.sLabel}>{s.label}</p>
                  <p className={styles.sVal}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className={`card ${styles.healthCard}`}>
              <h3>Platform Health</h3>
              <p>All systems operational. Use tabs above to manage users, items, and bookings.</p>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <span className="badge badge-green">✓ API Online</span>
                <span className="badge badge-green">✓ DB Connected</span>
                <span className="badge badge-green">✓ Payments Simulated</span>
              </div>
            </div>
          </div>
        )}

        {tab==="users" && (
          <div className={`card ${styles.tCard}`}>
            <div className={styles.tHd}><h3>All Users ({users.length})</h3></div>
            <div style={{overflowX:"auto"}}>
              <table className="tbl">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><div style={{display:"flex",alignItems:"center",gap:9}}><div className={styles.miniAvatar}>{u.name.charAt(0)}</div><strong>{u.name}</strong></div></td>
                      <td>{u.email}</td>
                      <td><select className={styles.roleSelect} value={u.role} onChange={e=>changeRole(u._id,e.target.value)}><option value="customer">Customer</option><option value="owner">Owner</option><option value="admin">Admin</option></select></td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td><span className={`badge ${u.isActive?"badge-green":"badge-red"}`}>{u.isActive?"Active":"Inactive"}</span></td>
                      <td><button className={`btn btn-sm ${u.isActive?"btn-danger":"btn-secondary"}`} onClick={()=>toggleUser(u._id,u.isActive)}>{u.isActive?<><FiX/> Deactivate</>:<><FiCheck/> Activate</>}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="items" && (
          <div className={`card ${styles.tCard}`}>
            <div className={styles.tHd}><h3>All Listings ({items.length})</h3></div>
            <div style={{overflowX:"auto"}}>
              <table className="tbl">
                <thead><tr><th>Name</th><th>Owner</th><th>Category</th><th>Price/Day</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it._id}>
                      <td><strong>{it.name}</strong><br/><span style={{fontSize:11,color:"var(--text-500)"}}>{it.description?.slice(0,40)}…</span></td>
                      <td>{it.ownerId?.name||it.ownerName}</td>
                      <td>{it.category}</td>
                      <td style={{color:"var(--blue)",fontWeight:700}}>{formatPrice(it.pricePerDay)}</td>
                      <td><span className={`badge ${it.isApproved?"badge-green":"badge-yellow"}`}>{it.isApproved?"Approved":"Pending"}</span></td>
                      <td><div style={{display:"flex",gap:6}}>
                        {it.isApproved
                          ?<button className="btn btn-danger btn-sm" onClick={()=>approveItem(it._id,false)}><FiX/> Reject</button>
                          :<button className="btn btn-secondary btn-sm" onClick={()=>approveItem(it._id,true)}><FiCheck/> Approve</button>}
                        <button className="btn btn-danger btn-sm" onClick={()=>delItem(it._id)}><FiTrash2/></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="bookings" && (
          <div className={`card ${styles.tCard}`}>
            <div className={styles.tHd}><h3>All Bookings ({bookings.length})</h3></div>
            <div style={{overflowX:"auto"}}>
              <table className="tbl">
                <thead><tr><th>Item</th><th>Customer</th><th>Dates</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td><strong>{b.itemName}</strong></td>
                      <td>{b.userId?.name}<br/><span style={{fontSize:11,color:"var(--text-500)"}}>{b.userId?.email}</span></td>
                      <td>{formatDate(b.startDate)} →<br/>{formatDate(b.endDate)}<br/><span style={{fontSize:11,color:"var(--text-500)"}}>{b.totalDays} days</span></td>
                      <td style={{color:"var(--blue)",fontWeight:700}}>{formatPrice(b.totalPrice)}</td>
                      <td><span className={`badge ${b.paymentStatus==="paid"?"badge-green":b.paymentStatus==="refunded"?"badge-yellow":"badge-red"}`}>{b.paymentStatus}</span></td>
                      <td><select className={styles.roleSelect} value={b.status} onChange={e=>setBookingStatus(b._id,e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>}
    </div></div>
  );
}
