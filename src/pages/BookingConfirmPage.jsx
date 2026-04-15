import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { formatPrice, formatDate, imgUrl } from "../utils/helpers";
import { FiCheck, FiCalendar, FiPackage, FiHome } from "react-icons/fi";
import styles from "./BookingConfirmPage.module.css";

export default function BookingConfirmPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${id}`).then(r => setBooking(r.data.booking)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner"/>;
  if (!booking) return <div className="page"><div className="container"><div className="empty"><div className="icon">😕</div><h3>Booking not found</h3><Link to="/my-bookings" className="btn btn-primary" style={{marginTop:20}}>My Bookings</Link></div></div></div>;

  const item = booking.itemId;

  return (
    <div className="page"><div className="container">
      <div className={`${styles.banner} fade`}>
        <div className={styles.checkCircle}><FiCheck/></div>
        <h1>Booking Confirmed! 🎉</h1>
        <p>Your rental is booked. Get ready to celebrate!</p>
      </div>

      <div className={styles.grid}>
        <div className={`card ${styles.details}`}>
          <h3>Booking Details</h3><hr className="div"/>
          <div className={styles.itemRow}>
            <img src={imgUrl(item?.image)} alt={booking.itemName}
              onError={e => { e.target.src = `https://picsum.photos/seed/${booking.itemId}/200/150`; }}
              className={styles.itemImg}/>
            <div>
              <h4>{booking.itemName}</h4>
              <p>{item?.category}</p>
              <p className={styles.owner}>By {booking.ownerName}</p>
            </div>
          </div>
          <hr className="div"/>
          {[
            ["Booking ID",     booking._id.slice(-10).toUpperCase()],
            ["Transaction ID", booking.transactionId],
            ["Start Date",     formatDate(booking.startDate)],
            ["End Date",       formatDate(booking.endDate)],
            ["Duration",       `${booking.totalDays} day${booking.totalDays!==1?"s":""}`],
            ["Price/Day",      formatPrice(booking.pricePerDay)],
            ...(booking.deliveryOption ? [["Delivery", formatPrice(booking.deliveryCharge)]] : []),
          ].map(([k,v]) => (
            <div key={k} className={styles.row}><span>{k}</span><strong>{v}</strong></div>
          ))}
          <hr className="div"/>
          <div className={`${styles.row} ${styles.rowTotal}`}><span>Total Paid</span><strong className="g-text">{formatPrice(booking.totalPrice)}</strong></div>
        </div>

        <div className={styles.right}>
          <div className={`card ${styles.status}`}>
            <h3>Status</h3><hr className="div"/>
            <div className={styles.row}><span>Booking</span><span className="badge badge-green">✓ {booking.status}</span></div>
            <div className={styles.row}><span>Payment</span><span className="badge badge-green">✓ {booking.paymentStatus}</span></div>
            <div className={styles.row}><span>Method</span><span>{booking.paymentMethod}</span></div>
          </div>

          <div className={`card ${styles.nextCard}`}>
            <h3>What's Next?</h3><hr className="div"/>
            {[
              ["1", "Contact Owner", "The owner will confirm pickup/delivery details."],
              ["2", "Pick Up / Delivery", "Collect items on the start date or await delivery."],
              ["3", "Celebrate!", "Enjoy your occasion with quality rental items 🎊"],
              ["4", "Return Items", "Return items by the end date in good condition."],
            ].map(([n,t,d]) => (
              <div key={n} className={styles.step}>
                <div className={styles.stepNum}>{n}</div>
                <div><strong>{t}</strong><p>{d}</p></div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Link to="/my-bookings" className="btn btn-primary" style={{width:"100%",justifyContent:"center"}}><FiCalendar/> My Bookings</Link>
            <Link to="/browse" className="btn btn-ghost" style={{width:"100%",justifyContent:"center",marginTop:8}}><FiPackage/> Browse More</Link>
            <Link to="/" className="btn btn-ghost" style={{width:"100%",justifyContent:"center",marginTop:8}}><FiHome/> Home</Link>
          </div>
        </div>
      </div>
    </div></div>
  );
}
