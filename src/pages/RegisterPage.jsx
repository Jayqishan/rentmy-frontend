import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./AuthPage.module.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name:"", email:"", password:"", confirmPassword:"", role: params.get("role") || "customer" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.email || !form.password) { setErr("Fill all fields"); return; }
    if (form.password !== form.confirmPassword) { setErr("Passwords do not match"); return; }
    if (form.password.length < 6) { setErr("Password min 6 characters"); return; }
    setLoading(true);
    try {
      const user = await register({ name:form.name, email:form.email, password:form.password, role:form.role });
      toast.success(`Account created! Welcome ${user.name} 🎉`);
      navigate(user.role === "owner" ? "/dashboard" : "/browse");
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.orb1}/><div className={styles.orb2}/>
      <div className={`card ${styles.card} fade`}>
        <div className={styles.logo}>🎊 RentMyOccasion</div>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.sub}>Join and start celebrating smarter</p>
        {err && <div className="alert alert-err">{err}</div>}
        <div className={styles.roleRow}>
          {["customer","owner"].map(r => (
            <button key={r} type="button" className={`${styles.roleBtn} ${form.role === r ? styles.roleBtnActive:""}`} onClick={() => setForm({...form, role:r})}>
              <span>{r === "customer" ? "🛍️":"🏪"}</span>
              <strong>{r === "customer" ? "Customer":"Item Owner"}</strong>
              <small>{r === "customer" ? "Browse & rent":"List & earn"}</small>
            </button>
          ))}
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className={styles.inputWrap}><FiUser className={styles.ico}/><input name="name" type="text" className={`input ${styles.padded}`} placeholder="Your full name" value={form.name} onChange={handle}/></div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <div className={styles.inputWrap}><FiMail className={styles.ico}/><input name="email" type="email" className={`input ${styles.padded}`} placeholder="you@example.com" value={form.email} onChange={handle}/></div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className={styles.inputWrap}><FiLock className={styles.ico}/><input name="password" type={show ? "text":"password"} className={`input ${styles.padded}`} placeholder="Min 6 characters" value={form.password} onChange={handle}/><button type="button" className={styles.eye} onClick={() => setShow(!show)}>{show ? <FiEyeOff/>:<FiEye/>}</button></div>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <div className={styles.inputWrap}><FiLock className={styles.ico}/><input name="confirmPassword" type="password" className={`input ${styles.padded}`} placeholder="Repeat password" value={form.confirmPassword} onChange={handle}/></div>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>{loading ? "Creating…":"Create Account"}</button>
        </form>
        <p className={styles.switch}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
