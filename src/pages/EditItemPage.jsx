import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiUpload, FiX, FiSave } from "react-icons/fi";
import styles from "./ItemForm.module.css";

const CATS = ["Wedding","Birthday","Festival","Corporate","Baby Shower","Anniversary","Halloween","Christmas","Other"];

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", description:"", category:"Wedding", pricePerDay:"", location:"India", tags:"", deliveryAvailable:false, deliveryCharge:"0", availableFrom:"", availableTo:"" });
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    api.get(`/items/${id}`).then(r => {
      const it = r.data.item;
      setForm({ name:it.name, description:it.description, category:it.category, pricePerDay:it.pricePerDay, location:it.location||"India", tags:(it.tags||[]).join(", "), deliveryAvailable:it.deliveryAvailable||false, deliveryCharge:it.deliveryCharge||0, availableFrom:it.availableFrom?it.availableFrom.split("T")[0]:"", availableTo:it.availableTo?it.availableTo.split("T")[0]:"" });
      setPreview(it.image || "");
    }).catch(() => { toast.error("Item not found"); navigate("/dashboard"); }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({...f,[name]:type==="checkbox"?checked:value}));
  };

  const pickImg = e => {
    const f = e.target.files[0];
    if (!f) return;
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
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (img) fd.append("image", img);
      await api.put(`/items/${id}`, fd, { headers:{"Content-Type":"multipart/form-data"} });
      toast.success("Item updated!");
      navigate("/dashboard");
    } catch (e) { toast.error(e.response?.data?.message||"Failed"); } finally { setSaving(false); }
  };

  if (loading) return <div className="spinner"/>;

  return (
    <div className="page"><div className="container">
      <div className="page-hd"><div><h1>Edit <span className="g-text">Listing</span></h1><p>Update your item details</p></div></div>
      <div className={styles.grid}>
        <form className={styles.left} onSubmit={submit}>
          <div className={`card ${styles.section}`}>
            <h3>Basic Info</h3>
            <div className="form-group"><label>Item Name *</label>
              <input name="name" className={`input ${errs.name?styles.err:""}`} value={form.name} onChange={handle}/>
              {errs.name && <span className={styles.fErr}>{errs.name}</span>}
            </div>
            <div className="form-group"><label>Description *</label>
              <textarea name="description" className={`input ${errs.description?styles.err:""}`} rows={4} value={form.description} onChange={handle}/>
              {errs.description && <span className={styles.fErr}>{errs.description}</span>}
            </div>
            <div className={styles.row2}>
              <div className="form-group"><label>Category</label>
                <select name="category" className="input" value={form.category} onChange={handle}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
              </div>
              <div className="form-group"><label>Location</label>
                <input name="location" className="input" value={form.location} onChange={handle}/>
              </div>
            </div>
            <div className="form-group"><label>Tags</label>
              <input name="tags" className="input" value={form.tags} onChange={handle}/>
            </div>
          </div>

          <div className={`card ${styles.section}`}>
            <h3>Pricing & Delivery</h3>
            <div className={styles.row2}>
              <div className="form-group"><label>Price/Day (₹) *</label>
                <input name="pricePerDay" type="number" min="1" className={`input ${errs.pricePerDay?styles.err:""}`} value={form.pricePerDay} onChange={handle}/>
                {errs.pricePerDay && <span className={styles.fErr}>{errs.pricePerDay}</span>}
              </div>
              <div className="form-group"><label>Delivery Charge (₹)</label>
                <input name="deliveryCharge" type="number" min="0" className="input" value={form.deliveryCharge} onChange={handle} disabled={!form.deliveryAvailable}/>
              </div>
            </div>
            <label className={styles.toggle}><input type="checkbox" name="deliveryAvailable" checked={form.deliveryAvailable} onChange={handle}/><span>Offer Delivery</span></label>
          </div>

          <div className={`card ${styles.section}`}>
            <h3>Availability</h3>
            <div className={styles.row2}>
              <div className="form-group"><label>From</label><input name="availableFrom" type="date" className="input" value={form.availableFrom} onChange={handle}/></div>
              <div className="form-group"><label>To</label><input name="availableTo" type="date" className="input" value={form.availableTo} onChange={handle}/></div>
            </div>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={saving}>
            {saving ? "Saving…" : <><FiSave/> Save Changes</>}
          </button>
        </form>

        <div className={styles.sidebar}>
          <div className={`card ${styles.imgCard}`}>
            <h3>Item Photo</h3>
            {preview
              ? <div className={styles.prevWrap}>
                  <img src={preview.startsWith("blob")?preview:preview} alt="preview"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${id}/400/300`; }}/>
                  {img && <button className={styles.removeBtn} onClick={()=>{setImg(null);setPreview("")}}><FiX/></button>}
                </div>
              : <label className={styles.dropzone}><input type="file" accept="image/*" onChange={pickImg} hidden/><FiUpload className={styles.dIco}/><p>Upload Photo</p></label>
            }
            <label className={styles.dropzone} style={{padding:"10px",marginTop:10}}>
              <input type="file" accept="image/*" onChange={pickImg} hidden/>
              <FiUpload style={{marginRight:6}}/> Change Photo
            </label>
          </div>
        </div>
      </div>
    </div></div>
  );
}
