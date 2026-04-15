import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name:user?.name||"", phone:user?.phone||"", address:user?.address||"" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [showPassword, setShowPassword] = useState({ currentPassword:false, newPassword:false, confirmPassword:false });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handle = e => setForm(f => ({...f,[e.target.name]:e.target.value}));
  const handlePassword = e => setPasswordForm(f => ({...f,[e.target.name]:e.target.value}));
  const togglePassword = field => setShowPassword(s => ({...s,[field]:!s[field]}));

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setLoading(true);
    try {
      const r = await api.put("/auth/profile", form);
      updateUser(r.data.user);
      toast.success("Profile updated!");
    } catch (e) { toast.error(e.response?.data?.message||"Update failed"); } finally { setLoading(false); }
  };

  const changePassword = async e => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Current password and new password required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
      toast.success("Password changed successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Password change failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleColor = { admin:"badge-red", owner:"badge-violet", customer:"badge-blue" };

  return (
    <div className="page"><div className="container">
      <div className="page-hd"><h1>My <span className="g-text">Profile</span></h1></div>
      <div className={styles.grid}>
        <div className={`card ${styles.avatarCard}`}>
          <div className={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase()}</div>
          <h3 className={styles.uName}>{user?.name}</h3>
          <p className={styles.uEmail}>{user?.email}</p>
          <span className={`badge ${roleColor[user?.role]||"badge-blue"}`} style={{marginTop:10}}>{user?.role}</span>
          <hr className="div" style={{width:"100%",marginTop:18}}/>
          <div className={styles.infoList}>
            <div className={styles.infoItem}><FiMail size={13}/><span>{user?.email}</span></div>
            {user?.phone   && <div className={styles.infoItem}><FiPhone size={13}/><span>{user.phone}</span></div>}
            {user?.address && <div className={styles.infoItem}><FiMapPin size={13}/><span>{user.address}</span></div>}
          </div>
          <div className={styles.meta}>
            <div className={styles.metaRow}><span>Member since</span><span>{new Date(user?.createdAt).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</span></div>
            <div className={styles.metaRow}><span>Account type</span><span style={{textTransform:"capitalize"}}>{user?.role}</span></div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={`card ${styles.formCard}`}>
            <h3>Edit Profile</h3>
            <p className={styles.formSub}>Update your personal details</p>
            <hr className="div"/>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Full Name</label>
                <div className={styles.iWrap}><FiUser className={styles.ico}/><input name="name" type="text" className="input" style={{paddingLeft:38}} value={form.name} onChange={handle}/></div>
              </div>
              <div className="form-group">
                <label>Email (cannot change)</label>
                <div className={styles.iWrap}><FiMail className={styles.ico}/><input type="email" className="input" style={{paddingLeft:38}} value={user?.email} disabled/></div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <div className={styles.iWrap}><FiPhone className={styles.ico}/><input name="phone" type="tel" className="input" style={{paddingLeft:38}} placeholder="+91 98765 43210" value={form.phone} onChange={handle}/></div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <div className={styles.iWrap}><FiMapPin className={styles.ico} style={{top:13}}/><textarea name="address" className="input" style={{paddingLeft:38}} rows={3} placeholder="Delivery address" value={form.address} onChange={handle}/></div>
              </div>
              <button type="submit" className="btn btn-primary" style={{padding:"12px 26px"}} disabled={loading}>
                {loading?"Saving…":<><FiSave/> Save Changes</>}
              </button>
            </form>
          </div>
          <div className={`card ${styles.secCard}`}>
            <h3>Account Security</h3>
            <p>Your password is securely hashed. Keep it updated to protect your account.</p>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <span className="badge badge-green">✓ Email Verified</span>
              <span className="badge badge-green">✓ Account Active</span>
            </div>
          </div>
          <div className={`card ${styles.formCard}`}>
            <h3>Change Password</h3>
            <p className={styles.formSub}>Update your account password</p>
            <hr className="div"/>
            <form onSubmit={changePassword}>
              {[
                { name:"currentPassword", label:"Current Password" },
                { name:"newPassword", label:"New Password" },
                { name:"confirmPassword", label:"Confirm New Password" },
              ].map(field => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}</label>
                  <div className={styles.iWrap}>
                    <FiLock className={styles.ico}/>
                    <input name={field.name} type={showPassword[field.name] ? "text" : "password"} className="input" style={{paddingLeft:38,paddingRight:42}} value={passwordForm[field.name]} onChange={handlePassword}/>
                    <button type="button" onClick={() => togglePassword(field.name)} aria-label={showPassword[field.name] ? `Hide ${field.label}` : `Show ${field.label}`} style={{position:"absolute",right:12,top:12,background:"transparent",border:"none",color:"var(--text-500)",cursor:"pointer",display:"flex",padding:0,fontSize:15}}>
                      {showPassword[field.name] ? <FiEyeOff/> : <FiEye/>}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" className="btn btn-primary" style={{padding:"12px 26px"}} disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : <><FiLock/> Change Password</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div></div>
  );
}
