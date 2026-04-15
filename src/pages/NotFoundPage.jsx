import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.glowA} />
      <div className={styles.glowB} />
      <div className={styles.content}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Oops! Page not found</h1>
        <p className={styles.message}>This page doesn't exist or has been moved.</p>
        <div className={styles.actions}>
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/browse" className="btn btn-secondary">Browse Items</Link>
        </div>
      </div>
    </div>
  );
}
