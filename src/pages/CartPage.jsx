import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice, formatDate, imgUrl } from "../utils/helpers";
import toast from "react-hot-toast";
import { FiTrash2, FiArrowRight, FiShoppingCart } from "react-icons/fi";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { items, total, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (!items.length) return (
    <div className="page"><div className="container">
      <div className="empty"><div className="icon">🛒</div><h3>Your cart is empty</h3><p>Browse items and add to cart</p>
        <Link to="/browse" className="btn btn-primary" style={{marginTop:20}}>Browse Items</Link>
      </div>
    </div></div>
  );

  return (
    <div className="page"><div className="container">
      <div className="page-hd">
        <div><h1>Your Cart <span className="g-text">({items.length})</span></h1></div>
        <button className="btn btn-danger btn-sm" onClick={async () => { await clearCart(); toast.success("Cart cleared"); }}>
          <FiTrash2/> Clear All
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.list}>
          {items.map(item => (
            <div key={item.itemId} className={`card ${styles.item}`}>
              <img src={imgUrl(item.itemImage)} alt={item.itemName} className={styles.thumb}
                onError={e => { e.target.src = `https://picsum.photos/seed/${item.itemId}/200/150`; }}/>
              <div className={styles.info}>
                <h3>{item.itemName}</h3>
                <span className="badge badge-blue">{item.category}</span>
                <p className={styles.dates}>📅 {formatDate(item.startDate)} → {formatDate(item.endDate)} · {item.totalDays} day{item.totalDays!==1?"s":""}</p>
                {item.deliveryOption && <p className={styles.deliv}>🚚 Delivery included</p>}
              </div>
              <div className={styles.right}>
                <span className={styles.price}>{formatPrice(item.totalPrice)}</span>
                <span className={styles.sub}>{formatPrice(item.pricePerDay)}/day</span>
                <button className="btn btn-danger btn-sm" onClick={async () => { await removeFromCart(item.itemId); toast.success("Removed"); }}>
                  <FiTrash2/>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={`card ${styles.summary}`}>
          <h3>Order Summary</h3>
          <hr className="div"/>
          {items.map(i => (
            <div key={i.itemId} className={styles.sRow}>
              <span className={styles.sName}>{i.itemName}</span>
              <span>{formatPrice(i.totalPrice)}</span>
            </div>
          ))}
          <hr className="div"/>
          <div className={`${styles.sRow} ${styles.sTotal}`}>
            <strong>Total</strong><strong className="g-text">{formatPrice(total)}</strong>
          </div>
          <button className={`btn btn-primary ${styles.checkoutBtn}`} onClick={() => navigate("/checkout")}>
            Checkout <FiArrowRight/>
          </button>
          <Link to="/browse" className={`btn btn-ghost ${styles.contBtn}`}><FiShoppingCart/> Continue Shopping</Link>
        </div>
      </div>
    </div></div>
  );
}
