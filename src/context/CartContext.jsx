import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (user) api.get("/cart").then(r => setItems(r.data.cart.items || [])).catch(() => setItems([]));
    else setItems([]);
  }, [user]);

  const addToCart = async (itemId, startDate, endDate, deliveryOption = false) => {
    const { data } = await api.post("/cart/add", { itemId, startDate, endDate, deliveryOption });
    setItems(data.cart.items || []);
  };

  const removeFromCart = async (itemId) => {
    const { data } = await api.delete(`/cart/remove/${itemId}`);
    setItems(data.cart.items || []);
  };

  const clearCart = async () => {
    await api.delete("/cart/clear");
    setItems([]);
  };

  const total = items.reduce((s, i) => s + (i.totalPrice || 0), 0);

  return (
    <Ctx.Provider value={{ items, count: items.length, total, addToCart, removeFromCart, clearCart }}>
      {children}
    </Ctx.Provider>
  );
}
