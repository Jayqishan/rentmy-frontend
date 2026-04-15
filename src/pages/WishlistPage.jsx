import { Link } from "react-router-dom";
import ItemCard from "../components/common/ItemCard";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, loading } = useAuth();

  const removeItem = async (item) => {
    try {
      await toggleWishlist(item);
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wishlist");
    }
  };

  return (
    <div className="page"><div className="container">
      <div className="page-hd">
        <div><h1>My <span className="g-text">Wishlist</span></h1><p>{wishlist.length} saved item{wishlist.length === 1 ? "" : "s"}</p></div>
      </div>

      {loading ? <div className="spinner"/> : wishlist.length === 0
        ? <div className="empty"><div className="icon">♡</div><h3>No saved items yet</h3><p>Save your favorite rentals to find them quickly later.</p>
            <Link to="/browse" className="btn btn-primary" style={{ marginTop:18 }}>Browse Items</Link>
          </div>
        : <div className="grid-4">
            {wishlist.map((item) => (
              <div key={item._id} style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <ItemCard item={item} />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeItem(item)}
                  style={{ justifyContent:"center" }}
                >
                  <FiHeart style={{ color:"var(--red)", fill:"var(--red)" }} /> Remove from Wishlist
                </button>
              </div>
            ))}
          </div>
      }
    </div></div>
  );
}
