import { useEffect, useState } from "react";

export default function useLocalStorage(key, initialValue) {
  const readValue = () => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState(readValue);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore localStorage failures
    }
  }, [key, value]);

  return [value, setValue];
}
