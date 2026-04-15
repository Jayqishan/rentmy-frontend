import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <p className={styles.logo}>🎊 RentMyOccasion</p>
            <p>Rent Smart. Celebrate Better.<br />India's premier occasion rental platform.</p>
          </div>
          <div className={styles.col}>
            <h4>Platform</h4>
            <Link to="/browse">Browse Items</Link>
            <Link to="/register">Become an Owner</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div className={styles.col}>
            <h4>Categories</h4>
            <Link to="/browse?category=Wedding">Wedding</Link>
            <Link to="/browse?category=Birthday">Birthday</Link>
            <Link to="/browse?category=Festival">Festival</Link>
            <Link to="/browse?category=Corporate">Corporate</Link>
          </div>
          <div className={styles.col}>
            <h4>Contact</h4>
            <span>support@rentmyoccasion.com</span>
            <span>+91 98765 43210</span>
            <span>Mon–Sat 9am–6pm IST</span>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>© 2024 RentMyOccasion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
