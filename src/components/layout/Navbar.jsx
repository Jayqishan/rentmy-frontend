import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { FiLogOut, FiMenu, FiShoppingCart, FiUser, FiX } from "react-icons/fi";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Browse", path: "/browse" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Add Item", path: "/add-item" },
  ];

  const isActive = (path) => (pathname === path ? styles.active : "");

  const closeAndGo = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoEmoji}>🎊</span>
          <span>
            Rent<span className={styles.accent}>My</span>Occasion
          </span>
        </Link>

        <div className={styles.links}>
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`${styles.link} ${isActive(link.path)}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.right}>
          <Link to={user?.role === "customer" ? "/cart" : user ? "/profile" : "/login"} className={styles.cartBtn}>
            <FiShoppingCart />
            {count > 0 && <span className={styles.cartBadge}>{count}</span>}
          </Link>

          {user ? (
            <div className={styles.dropdown} onMouseLeave={() => setDrop(false)}>
              <button className={styles.userBtn} onMouseEnter={() => setDrop(true)} onClick={() => setDrop(!drop)}>
                <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              </button>
              {drop && (
                <div className={styles.menu}>
                  <div className={styles.menuHead}>
                    <strong>{user.name}</strong>
                    <span>{user.role}</span>
                  </div>
                  <button className={styles.menuItem} onClick={() => closeAndGo("/profile")}>
                    <FiUser /> Profile
                  </button>
                  <button
                    className={`${styles.menuItem} ${styles.menuLogout}`}
                    onClick={() => {
                      logout();
                      setDrop(false);
                      closeAndGo("/");
                    }}
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.avatarLink} aria-label="Login">
              <div className={styles.avatar}>U</div>
            </Link>
          )}

          <button className={styles.burger} onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <button key={link.path} className={styles.mLink} onClick={() => closeAndGo(link.path)}>
              {link.label}
            </button>
          ))}
          <button className={styles.mLink} onClick={() => closeAndGo(user?.role === "customer" ? "/cart" : "/login")}>
            Cart
          </button>
          {user ? (
            <button
              className={`${styles.mLink} ${styles.mLogout}`}
              onClick={() => {
                logout();
                closeAndGo("/");
              }}
            >
              Logout
            </button>
          ) : (
            <button className={styles.mLink} onClick={() => closeAndGo("/login")}>
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
