import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ItemCard from "../components/common/ItemCard";
import { SkeletonCard } from "../components/common/Skeleton";
import useRecentlyViewed from "../hooks/useRecentlyViewed";
import { formatPrice, formatDate, calcDays, imgUrl, CAT_ICONS } from "../utils/helpers";
import toast from "react-hot-toast";
import { FiMapPin, FiUser, FiTruck, FiShoppingCart, FiCheck, FiStar } from "react-icons/fi";
import styles from "./ItemDetailPage.module.css";

const starRowStyle = { display: "flex", alignItems: "center", gap: 4 };
const reviewCardStyle = { padding: 24, marginTop: 18 };
const reviewHeaderStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 };
const reviewListStyle = { display: "flex", flexDirection: "column", gap: 14 };
const reviewItemStyle = { padding: 16, background: "var(--bg-800)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" };
const reviewTopStyle = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 };
const reviewUserStyle = { display: "flex", alignItems: "center", gap: 12 };
const avatarStyle = { width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--grad)", color: "#fff", fontWeight: 700, flexShrink: 0 };
const reviewFormStyle = { padding: 20, background: "var(--bg-800)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", marginBottom: 16 };
const starButtonRowStyle = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 };
const noteBoxStyle = { padding: 14, background: "rgba(91,143,249,.08)", border: "1px solid rgba(91,143,249,.18)", borderRadius: "var(--r-sm)", color: "var(--text-300)", fontSize: 13, marginBottom: 16 };
const emptyReviewStyle = { textAlign: "center", padding: "28px 16px", color: "var(--text-300)", fontSize: 14 };
const similarSectionStyle = { marginTop: 18, padding: 24 };
const similarRowStyle = { display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(240px, 1fr)", gap: 16, overflowX: "auto", paddingBottom: 6 };

const getAverageRating = (reviews) =>
  reviews.length ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)) : 0;

function Stars({ value, size = 16 }) {
  return (
    <div style={starRowStyle}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          style={{
            color: star <= value ? "var(--yellow)" : "var(--text-500)",
            fill: star <= value ? "var(--yellow)" : "transparent",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addItem } = useRecentlyViewed();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [dates, setDates] = useState([new Date(), new Date()]);
  const [delivery, setDelivery] = useState(false);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [similarItems, setSimilarItems] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const syncReviewMeta = (nextReviews) => {
    setReviews(nextReviews);
    setItem((current) => current ? { ...current, rating: getAverageRating(nextReviews), reviewCount: nextReviews.length } : current);
  };

  useEffect(() => {
    setLoading(true);
    setReviewsLoading(true);

    Promise.all([api.get(`/items/${id}`), api.get(`/reviews/item/${id}`)])
      .then(([itemRes, reviewRes]) => {
        setItem(itemRes.data.item);
        setReviews(reviewRes.data.reviews || []);
      })
      .catch(() => {
        toast.error("Item not found");
        navigate("/browse");
      })
      .finally(() => {
        setLoading(false);
        setReviewsLoading(false);
      });
  }, [id, navigate]);

  useEffect(() => {
    if (!item?.category) return;
    setSimilarLoading(true);
    api.get(`/items?category=${encodeURIComponent(item.category)}&limit=4`)
      .then((res) => {
        const list = (res.data.items || []).filter((entry) => entry._id !== item._id).slice(0, 4);
        setSimilarItems(list);
      })
      .catch(() => setSimilarItems([]))
      .finally(() => setSimilarLoading(false));
  }, [item]);

  useEffect(() => {
    if (item?._id) addItem(item);
  }, [item, addItem]);

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setCompletedBookings([]);
      return;
    }

    api.get("/bookings/my-bookings")
      .then((res) => {
        const matches = (res.data.bookings || []).filter((booking) => {
          const bookingItemId = booking.itemId?._id || booking.itemId;
          return bookingItemId?.toString() === id && booking.status === "completed";
        });
        setCompletedBookings(matches);
      })
      .catch(() => setCompletedBookings([]));
  }, [id, user]);

  if (loading) return <div className="spinner"/>;
  if (!item) return null;

  const days = calcDays(dates[0], dates[1]);
  const dc = delivery ? (item.deliveryCharge || 0) : 0;
  const total = days * item.pricePerDay + dc;
  const averageRating = item.reviewCount ? Number(item.rating || 0).toFixed(1) : "0.0";
  const alreadyReviewed = !!reviews.find((review) => review.userId?._id === user?._id);
  const canReview = user?.role === "customer" && completedBookings.length > 0 && !alreadyReviewed;

  const tileDisabled = ({ date }) => item.bookedDates?.includes(date.toISOString().split("T")[0]);
  const tileClassName = ({ date }) => item.bookedDates?.includes(date.toISOString().split("T")[0]) ? "booked-tile" : "";

  const handleAdd = async () => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "customer") { toast.error("Only customers can rent items"); return; }
    setAdding(true);
    try {
      await addToCart(item._id, dates[0].toISOString(), dates[1].toISOString(), delivery);
      toast.success("Added to cart!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add to cart");
    } finally { setAdding(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await api.post("/reviews", {
        itemId: id,
        bookingId: completedBookings[0]._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      const nextReviews = [data.review, ...reviews];
      syncReviewMeta(nextReviews);
      setReviewRating(0);
      setReviewComment("");
      toast.success("Review submitted!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={styles.imgBox}>
              <img src={imgUrl(item.image)} alt={item.name} onError={e => { e.target.src = `https://picsum.photos/seed/${item._id}/800/500`; }}/>
              <span className={styles.catPill}>{CAT_ICONS[item.category]} {item.category}</span>
            </div>

            <div className={`card ${styles.infoCard}`}>
              <h1 className={styles.itemName}>{item.name}</h1>
              <div className={styles.meta}>
                {item.location && <span><FiMapPin size={13}/> {item.location}</span>}
                <span><FiUser size={13}/> {item.ownerName || item.ownerId?.name}</span>
                {item.deliveryAvailable && <span className={styles.deliv}><FiTruck size={13}/> Delivery available</span>}
              </div>
              <div className={styles.priceRow}>
                <span className={styles.price}>{formatPrice(item.pricePerDay)}</span>
                <span className={styles.per}> / day</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:14 }}>
                <Stars value={Math.round(item.rating || 0)} />
                <span style={{ color:"var(--text-100)", fontWeight:700, fontSize:14 }}>{averageRating}</span>
                <span style={{ color:"var(--text-500)", fontSize:13 }}>({item.reviewCount || 0} review{item.reviewCount === 1 ? "" : "s"})</span>
              </div>
              <p className={styles.desc}>{item.description}</p>
              {item.tags?.length > 0 && <div className={styles.tags}>{item.tags.map(t => <span key={t} className={styles.tag}>#{t}</span>)}</div>}
            </div>

            <div className="card" style={reviewCardStyle}>
              <div style={reviewHeaderStyle}>
                <div>
                  <h2 style={{ fontFamily:"var(--font-h)", fontSize:24, fontWeight:800, marginBottom:6 }}>Reviews</h2>
                  <p style={{ color:"var(--text-300)", fontSize:14 }}>See what renters said about this item.</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <Stars value={Math.round(item.rating || 0)} size={18} />
                  <span style={{ fontWeight:700, fontSize:18 }}>{averageRating}</span>
                  <span style={{ color:"var(--text-500)", fontSize:13 }}>{item.reviewCount || 0} total</span>
                </div>
              </div>

              {user?.role === "customer" && alreadyReviewed && <div style={noteBoxStyle}>You have already reviewed this item.</div>}
              {user?.role === "customer" && !alreadyReviewed && completedBookings.length === 0 && <div style={noteBoxStyle}>Complete a booking for this item to write a review.</div>}
              {!user && <div style={noteBoxStyle}><Link to="/login" style={{ color:"var(--blue)" }}>Login</Link> to write a review after your completed booking.</div>}

              {canReview && (
                <form onSubmit={submitReview} style={reviewFormStyle}>
                  <h3 style={{ fontFamily:"var(--font-h)", fontSize:18, fontWeight:700, marginBottom:8 }}>Write a Review</h3>
                  <p style={{ color:"var(--text-300)", fontSize:13, marginBottom:14 }}>Share your experience with future renters.</p>
                  <div style={starButtonRowStyle}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)} style={{ width:42, height:42, borderRadius:8, border:`1px solid ${star <= reviewRating ? "rgba(245,158,11,.45)" : "var(--border)"}`, background:star <= reviewRating ? "rgba(245,158,11,.1)" : "var(--bg-700)", color:star <= reviewRating ? "var(--yellow)" : "var(--text-500)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <FiStar size={18} style={{ fill: star <= reviewRating ? "var(--yellow)" : "transparent" }} />
                      </button>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label>Comment</label>
                    <textarea className="input" rows={4} placeholder="Tell others what you liked about this rental..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>{submittingReview ? "Submitting..." : "Submit Review"}</button>
                </form>
              )}

              {reviewsLoading ? <div className="spinner"/> : reviews.length === 0 ? (
                <div style={emptyReviewStyle}>No reviews yet. Be the first to share feedback after your booking.</div>
              ) : (
                <div style={reviewListStyle}>
                  {reviews.map((review) => (
                    <div key={review._id} style={reviewItemStyle}>
                      <div style={reviewTopStyle}>
                        <div style={reviewUserStyle}>
                          <div style={avatarStyle}>{review.userId?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                          <div>
                            <p style={{ fontWeight:700, fontSize:14 }}>{review.userId?.name || "User"}</p>
                            <p style={{ color:"var(--text-500)", fontSize:12 }}>{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <Stars value={review.rating} />
                      </div>
                      <p style={{ color:"var(--text-300)", fontSize:14, lineHeight:1.7 }}>{review.comment || "No written comment provided."}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={similarSectionStyle}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:18, flexWrap:"wrap" }}>
                <div>
                  <h2 style={{ fontFamily:"var(--font-h)", fontSize:24, fontWeight:800, marginBottom:6 }}>More in {item.category}</h2>
                  <p style={{ color:"var(--text-300)", fontSize:14 }}>Similar rentals you might want to check next.</p>
                </div>
                <Link to={`/browse?category=${encodeURIComponent(item.category)}`} className="btn btn-secondary btn-sm">View Category</Link>
              </div>

              {similarLoading ? (
                <div style={similarRowStyle}>
                  {Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : similarItems.length === 0 ? (
                <div style={emptyReviewStyle}>No similar items available right now.</div>
              ) : (
                <div style={similarRowStyle}>
                  {similarItems.map((similar) => <ItemCard key={similar._id} item={similar} />)}
                </div>
              )}
            </div>
          </div>

          <div className={styles.right}>
            <div className={`card ${styles.bookPanel}`}>
              <h3 className={styles.panelTitle}>Select Rental Dates</h3>
              <Calendar selectRange value={dates} onChange={setDates} tileDisabled={tileDisabled} tileClassName={tileClassName} minDate={new Date()}/>

              <div className={styles.legend}>
                <span><span className={`${styles.dot} ${styles.dotAvail}`}/>Available</span>
                <span><span className={`${styles.dot} ${styles.dotBooked}`}/>Booked</span>
                <span><span className={`${styles.dot} ${styles.dotSel}`}/>Selected</span>
              </div>

              <div className={styles.dateSummary}>
                <div className={styles.dRow}><span>From</span><strong>{formatDate(dates[0])}</strong></div>
                <div className={styles.dRow}><span>To</span><strong>{formatDate(dates[1])}</strong></div>
                <div className={styles.dRow}><span>Duration</span><strong>{days} day{days !== 1 ? "s" : ""}</strong></div>
              </div>

              {item.deliveryAvailable && (
                <label className={styles.delivToggle}>
                  <input type="checkbox" checked={delivery} onChange={e => setDelivery(e.target.checked)}/>
                  <span><FiTruck/> Add Delivery <em>+{formatPrice(item.deliveryCharge)}</em></span>
                </label>
              )}

              <div className={styles.breakdown}>
                <div className={styles.bRow}><span>{formatPrice(item.pricePerDay)} x {days} day{days !== 1 ? "s" : ""}</span><span>{formatPrice(item.pricePerDay * days)}</span></div>
                {delivery && <div className={styles.bRow}><span>Delivery</span><span>{formatPrice(dc)}</span></div>}
                <hr className="div"/>
                <div className={`${styles.bRow} ${styles.bTotal}`}><strong>Total</strong><strong className="g-text">{formatPrice(total)}</strong></div>
              </div>

              <button className={`btn btn-primary ${styles.addBtn}`} onClick={handleAdd} disabled={adding || !user || user.role !== "customer"}>
                {adding ? "Adding..." : <><FiShoppingCart/> Add to Cart</>}
              </button>

              {!user && <p className={styles.note}><Link to="/login">Login</Link> as customer to rent</p>}
              {user?.role === "owner" && <p className={styles.note}>Owner accounts cannot rent items</p>}

              <div className={styles.perks}>
                <span><FiCheck/> Instant confirmation</span>
                <span><FiCheck/> Free cancellation</span>
                <span><FiCheck/> Secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
