import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { formatPrice, formatDate } from "../utils/helpers";
import toast from "react-hot-toast";
import { FiCreditCard, FiLock, FiCheck, FiTruck } from "react-icons/fi";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ cardName:"", cardNumber:"", expiry:"", cvv:"", address:"" });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);

  if (!items.length) { navigate("/cart"); return null; }

  const handle = e => {
    let { name, value } = e.target;
    if (name==="cardNumber") value = value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
    if (name==="expiry")     value = value.replace(/\D/g,"").slice(0,4).replace(/^(\d{2})(\d)/,"$1/$2");
    if (name==="cvv")        value = value.replace(/\D/g,"").slice(0,3);
    setForm(f => ({...f,[name]:value}));
    setErrs(e => ({...e,[name]:""}));
  };

  const validate = () => {
    const e = {};
    if (!form.cardName.trim()) e.cardName = "Name required";
    if (form.cardNumber.replace(/\s/g,"").length < 16) e.cardNumber = "Enter 16-digit card";
    if (form.expiry.length < 5) e.expiry = "Enter MM/YY";
    if (form.cvv.length < 3) e.cvv = "Enter CVV";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setLoading(true);
    try {
      const ids = [];
      for (const item of items) {
        const { data } = await api.post("/bookings", {
          itemId: item.itemId, startDate: item.startDate, endDate: item.endDate,
          deliveryOption: item.deliveryOption, deliveryAddress: item.deliveryOption ? form.address : "",
        });
        ids.push(data.booking._id);
      }
      await clearCart();
      toast.success("Booking confirmed! 🎉");
      navigate(`/booking-confirm/${ids[0]}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Booking failed");
    } finally { setLoading(false); }
  };

  const hasDelivery = items.some(i => i.deliveryOption);
  const delivTotal = items.reduce((s,i) => s + (i.deliveryCharge||0), 0);

  return (
    <div className="page"><div className="container">
      <div className="page-hd"><div><h1>Checkout <span className="g-text">&amp; Payment</span></h1><p>Confirm your booking securely</p></div></div>

      <div className={styles.grid}>
        <div className={styles.left}>
          {hasDelivery && (
            <div className={`card ${styles.section}`}>
              <h3><FiTruck/> Delivery Address</h3>
              <div className="form-group" style={{marginTop:14,marginBottom:0}}>
                <label>Full Address</label>
                <textarea name="address" className="input" rows={3} placeholder="Your delivery address…" value={form.address} onChange={handle}/>
              </div>
            </div>
          )}

          <div className={`card ${styles.section}`}>
            <div className={styles.secHd}>
              <h3><FiCreditCard/> Card Details</h3>
              <span className={styles.secure}><FiLock size={12}/> Secure</span>
            </div>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input name="cardName" type="text" className={`input ${errs.cardName?styles.err:""}`} placeholder="Name on card" value={form.cardName} onChange={handle}/>
              {errs.cardName && <span className={styles.fieldErr}>{errs.cardName}</span>}
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input name="cardNumber" type="text" className={`input ${errs.cardNumber?styles.err:""}`} placeholder="1234 5678 9012 3456" value={form.cardNumber} onChange={handle}/>
              {errs.cardNumber && <span className={styles.fieldErr}>{errs.cardNumber}</span>}
            </div>
            <div className={styles.row2}>
              <div className="form-group">
                <label>Expiry</label>
                <input name="expiry" type="text" className={`input ${errs.expiry?styles.err:""}`} placeholder="MM/YY" value={form.expiry} onChange={handle}/>
                {errs.expiry && <span className={styles.fieldErr}>{errs.expiry}</span>}
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input name="cvv" type="text" className={`input ${errs.cvv?styles.err:""}`} placeholder="123" value={form.cvv} onChange={handle}/>
                {errs.cvv && <span className={styles.fieldErr}>{errs.cvv}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className={`card ${styles.summary}`}>
          <h3>Order Summary</h3><hr className="div"/>
          {items.map(i => (
            <div key={i.itemId} className={styles.sItem}>
              <p className={styles.sName}>{i.itemName}</p>
              <p className={styles.sDetail}>{formatDate(i.startDate)} → {formatDate(i.endDate)} · {i.totalDays} days</p>
              <p className={styles.sPrice}>{formatPrice(i.totalPrice)}</p>
            </div>
          ))}
          <hr className="div"/>
          <div className={styles.sRow}><span>Subtotal</span><span>{formatPrice(total - delivTotal)}</span></div>
          {delivTotal > 0 && <div className={styles.sRow}><span>Delivery</span><span>{formatPrice(delivTotal)}</span></div>}
          <div className={styles.sRow}><span>Taxes</span><span>Included</span></div>
          <hr className="div"/>
          <div className={`${styles.sRow} ${styles.sTotal}`}><strong>Total</strong><strong className="g-text">{formatPrice(total)}</strong></div>
          <button className={`btn btn-primary ${styles.payBtn}`} onClick={submit} disabled={loading}>
            {loading ? "Processing…" : <><FiCheck/> Pay {formatPrice(total)}</>}
          </button>
          <div className={styles.assurances}>
            <span><FiCheck/> Instant confirmation</span>
            <span><FiLock/> 100% secure</span>
            <span><FiCheck/> Free cancellation</span>
          </div>
        </div>
      </div>
    </div></div>
  );
}
