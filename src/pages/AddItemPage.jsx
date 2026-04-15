import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiUpload, FiX, FiPlusCircle } from "react-icons/fi";
import styles from "./ItemForm.module.css";

const CATS = ["Wedding","Birthday","Festival","Corporate","Baby Shower","Anniversary","Halloween","Christmas","Other"];

export default function AddItemPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", description:"", category:"Wedding", pricePerDay:"", location:"India", tags:"", deliveryAvailable:false, deliveryCharge:"0", availableFrom:"", availableTo:"" });
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState("");
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({...f, [name]: type==="checkbox" ? checked : value }));
    setErrs(e => ({...e,[name]:""}));
  };

  const pickImg = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5*1024*1024) { toast.error("Max 5MB"); return; }
    setImg(f); setPreview(URL.createObjectURL(f));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.description.trim()) e.description = "Description required";
    if (!form.pricePerDay || parseFloat(form.pricePerDay)<=0) e.pricePerDay = "Valid price required";
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrs(e2); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (img) fd.append("image", img);
      await api.post("/items", fd, { headers:{"Content-Type":"multipart/form-data"} });
      toast.success("Item listed! 🎉");
      navigate("/dashboard");
    } catch (e) { toast.error(e.response?.data?.message||"Failed"); } finally { setLoading(false); }
  };

  return (
    <div className="page"><div className="container">
      <div className="page-hd"><div><h1>Add <span className="g-text">New Listing</span></h1><p>List your item for rent</p></div></div>
      <div className={styles.grid}>
        <form className={styles.left} onSubmit={submit}>
          <div className={`card ${styles.section}`}>
            <h3>Basic Info</h3>
            <div className="form-group">
              <label>Item Name *</label>
              <input name="name" className={`input ${errs.name?styles.err:""}`} placeholder="e.g. LED Fairy Lights 50m" value={form.name} onChange={handle}/>
              {errs.name && <span className={styles.fErr}>{errs.name}</span>}
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" className={`input ${errs.description?styles.err:""}`} rows={4} placeholder="Describe condition, quantity, accessories…" value={form.description} onChange={handle}/>
              {errs.description && <span className={styles.fErr}>{errs.description}</span>}
            </div>
            <div className={styles.row2}>
              <div className="form-group"><label>Category *</label>
                <select name="category" className="input" value={form.category} onChange={handle}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Location</label>
                <input name="location" className="input" placeholder="City, State" value={form.location} onChange={handle}/>
              </div>
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input name="tags" className="input" placeholder="lights, outdoor, premium" value={form.tags} onChange={handle}/>
            </div>
          </div>

          <div className={`card ${styles.section}`}>
            <h3>Pricing & Delivery</h3>
            <div className={styles.row2}>
              <div className="form-group"><label>Price per Day (₹) *</label>
                <input name="pricePerDay" type="number" min="1" className={`input ${errs.pricePerDay?styles.err:""}`} placeholder="500" value={form.pricePerDay} onChange={handle}/>
                {errs.pricePerDay && <span className={styles.fErr}>{errs.pricePerDay}</span>}
              </div>
              <div className="form-group"><label>Delivery Charge (₹)</label>
                <input name="deliveryCharge" type="number" min="0" className="input" placeholder="0" value={form.deliveryCharge} onChange={handle} disabled={!form.deliveryAvailable}/>
              </div>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" name="deliveryAvailable" checked={form.deliveryAvailable} onChange={handle}/>
              <span>Offer Delivery Service</span>
            </label>
          </div>

          <div className={`card ${styles.section}`}>
            <h3>Availability</h3>
            <div className={styles.row2}>
              <div className="form-group"><label>From</label><input name="availableFrom" type="date" className="input" value={form.availableFrom} onChange={handle}/></div>
              <div className="form-group"><label>To</label><input name="availableTo" type="date" className="input" value={form.availableTo} onChange={handle}/></div>
            </div>
            <p className={styles.hint}>Leave blank to default to 1 year from today</p>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Listing…" : <><FiPlusCircle/> List Item</>}
          </button>
        </form>

        <div className={styles.sidebar}>
          <div className={`card ${styles.imgCard}`}>
            <h3>Item Photo</h3>
            {preview
              ? <div className={styles.prevWrap}><img src={preview} alt="preview"/><button className={styles.removeBtn} onClick={() => {setImg(null);setPreview("")}}><FiX/></button></div>
              : <label className={styles.dropzone}><input type="file" accept="image/*" onChange={pickImg} hidden/><FiUpload className={styles.dIco}/><p>Click to upload</p><small>JPG, PNG, WebP — Max 5MB</small></label>
            }
            <div className={styles.tips}>
              <p className={styles.tipsTitle}>Tips</p>
              <ul><li>Good lighting</li><li>Show all accessories</li><li>Landscape orientation</li><li>High resolution</li></ul>
            </div>
          </div>
        </div>
      </div>
    </div></div>
  );
}
