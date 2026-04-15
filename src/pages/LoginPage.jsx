import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./AuthPage.module.css";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email:"", password:"" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const landingPath = (u) => {
    if (u.role === "admin") return "/admin";
    if (u.role === "owner") return "/dashboard";
    return "/browse";
  };

  useEffect(() => {
    if (user) navigate(landingPath(user), { replace: true });
  }, [user, navigate]);

  const submit = async e => {
    e.preventDefault();
    setErr("");
    if (!form.email || !form.password) { setErr("Please fill all fields"); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 🎉`);
      navigate(landingPath(user));
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.orb1}/><div className={styles.orb2}/>
      <div className={`card ${styles.card} fade`}>
        <div className={styles.logo}>🎊 RentMyOccasion</div>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.sub}>Sign in to continue celebrating</p>
        {err && <div className="alert alert-err">{err}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className={styles.inputWrap}>
              <FiMail className={styles.ico}/>
              <input name="email" type="email" className={`input ${styles.padded}`} placeholder="you@example.com" value={form.email} onChange={handle}/>
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className={styles.inputWrap}>
              <FiLock className={styles.ico}/>
              <input name="password" type={show ? "text":"password"} className={`input ${styles.padded}`} placeholder="Your password" value={form.password} onChange={handle}/>
              <button type="button" className={styles.eye} onClick={() => setShow(!show)}>{show ? <FiEyeOff/>:<FiEye/>}</button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>{loading ? "Signing in…":"Sign In"}</button>
        </form>
        <p className={styles.switch}>Don't have an account? <Link to="/register">Create one free</Link></p>
      </div>
    </div>
  );
}
