import { useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

export default function useRecentlyViewed() {
  const [items, setItems] = useLocalStorage("rmo_recently_viewed", []);

  const addItem = useCallback((item) => {
    if (!item?._id) return;
    setItems((current) => {
      const next = [item, ...(current || []).filter((entry) => entry?._id !== item._id)];
      return next.slice(0, 5);
    });
  }, [setItems]);

  const clearItems = useCallback(() => setItems([]), [setItems]);

  return { items: items || [], addItem, clearItems };
}
