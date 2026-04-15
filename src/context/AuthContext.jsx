import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

const getInitialTheme = () => localStorage.getItem("rmo_theme") || "dark";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState(getInitialTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("rmo_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => current === "dark" ? "light" : "dark");
  };

  const fetchWishlist = async () => {
    const { data } = await api.get("/auth/wishlist");
    setWishlist(data.wishlist || []);
    return data.wishlist || [];
  };

  useEffect(() => {
    const token = localStorage.getItem("rmo_token");
    if (token) {
      Promise.all([api.get("/auth/me"), api.get("/auth/wishlist")])
        .then(([userRes, wishlistRes]) => {
          setUser(userRes.data.user);
          setWishlist(wishlistRes.data.wishlist || []);
        })
        .catch(() => {
          localStorage.removeItem("rmo_token");
          setUser(null);
          setWishlist([]);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("rmo_token", data.token);
    setUser(data.user);
    await fetchWishlist();
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("rmo_token", data.token);
    setUser(data.user);
    setWishlist([]);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("rmo_token");
    setUser(null);
    setWishlist([]);
  };

  const updateUser = (u) => setUser(u);

  const isWishlisted = (itemId) =>
    wishlist.some((item) => (item?._id || item)?.toString() === itemId?.toString());

  const toggleWishlist = async (item) => {
    const itemId = item?._id || item;
    const exists = isWishlisted(itemId);
    const previous = wishlist;

    setWishlist((current) =>
      exists
        ? current.filter((entry) => (entry?._id || entry)?.toString() !== itemId.toString())
        : [item, ...current]
    );

    try {
      const { data } = await api.post(`/auth/wishlist/${itemId}`);
      setWishlist(data.wishlist || []);
      return data;
    } catch (err) {
      setWishlist(previous);
      throw err;
    }
  };

  return (
    <Ctx.Provider value={{
      user,
      wishlist,
      theme,
      loading,
      login,
      register,
      logout,
      updateUser,
      fetchWishlist,
      toggleWishlist,
      toggleTheme,
      isWishlisted,
    }}>
      {children}
    </Ctx.Provider>
  );
}
