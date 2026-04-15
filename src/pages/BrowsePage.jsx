import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ItemCard from "../components/common/ItemCard";
import { SkeletonCard } from "../components/common/Skeleton";
import useDebounce from "../hooks/useDebounce";
import { CATEGORIES } from "../utils/helpers";
import { FiSearch, FiX, FiMapPin, FiTruck } from "react-icons/fi";
import styles from "./BrowsePage.module.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price Low-High" },
  { value: "price_desc", label: "Price High-Low" },
  { value: "rating", label: "Most Popular" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4★+" },
  { value: "3", label: "3★+" },
];

export default function BrowsePage() {
  const [sp, setSp] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(sp.get("page")) || 1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState(sp.get("search") || "");
  const [cat, setCat] = useState(sp.get("category") || "All");
  const [sortBy, setSortBy] = useState(sp.get("sortBy") || "newest");
  const [input, setInput] = useState(sp.get("search") || "");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") || "");
  const [delivery, setDelivery] = useState(sp.get("delivery") === "true");
  const [rating, setRating] = useState(sp.get("rating") || "");
  const [location, setLocation] = useState(sp.get("location") || "");
  const debouncedInput = useDebounce(input, 500);

  const syncParams = useCallback((next) => {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.category && next.category !== "All") params.set("category", next.category);
    if (next.minPrice) params.set("minPrice", next.minPrice);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    if (next.sortBy && next.sortBy !== "newest") params.set("sortBy", next.sortBy);
    if (next.delivery) params.set("delivery", "true");
    if (next.rating) params.set("rating", next.rating);
    if (next.location) params.set("location", next.location);
    if (next.page && next.page !== 1) params.set("page", String(next.page));
    setSp(params);
  }, [setSp]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 12, sortBy });
      if (search) q.set("search", search);
      if (cat !== "All") q.set("category", cat);
      if (minPrice) q.set("minPrice", minPrice);
      if (maxPrice) q.set("maxPrice", maxPrice);
      if (delivery) q.set("delivery", "true");
      if (rating) q.set("rating", rating);
      if (location) q.set("location", location);
      const { data } = await api.get(`/items?${q}`);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, cat, minPrice, maxPrice, sortBy, delivery, rating, location, page]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (debouncedInput === search) return;
    setSearch(debouncedInput);
    setPage(1);
    syncParams({ search: debouncedInput, category: cat, minPrice, maxPrice, sortBy, delivery, rating, location, page: 1 });
  }, [debouncedInput, search, cat, minPrice, maxPrice, sortBy, delivery, rating, location, syncParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      syncParams({ search, category: cat, minPrice, maxPrice, sortBy, delivery, rating, location, page: 1 });
    }, 500);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice, search, cat, sortBy, delivery, rating, location, syncParams]);

  const doSearch = (e) => {
    e.preventDefault();
    setSearch(input);
    setPage(1);
    syncParams({ search: input, category: cat, minPrice, maxPrice, sortBy, delivery, rating, location, page: 1 });
  };

  const pickCat = (c) => {
    setCat(c);
    setPage(1);
    syncParams({ search, category: c, minPrice, maxPrice, sortBy, delivery, rating, location, page: 1 });
  };

  const changeSort = (value) => {
    setSortBy(value);
    setPage(1);
    syncParams({ search, category: cat, minPrice, maxPrice, sortBy: value, delivery, rating, location, page: 1 });
  };

  const changeDelivery = (checked) => {
    setDelivery(checked);
    setPage(1);
    syncParams({ search, category: cat, minPrice, maxPrice, sortBy, delivery: checked, rating, location, page: 1 });
  };

  const changeRating = (value) => {
    setRating(value);
    setPage(1);
    syncParams({ search, category: cat, minPrice, maxPrice, sortBy, delivery, rating: value, location, page: 1 });
  };

  const changeLocation = (value) => {
    setLocation(value);
    setPage(1);
    syncParams({ search, category: cat, minPrice, maxPrice, sortBy, delivery, rating, location: value, page: 1 });
  };

  const clearPrices = () => {
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
    syncParams({ search, category: cat, minPrice: "", maxPrice: "", sortBy, delivery, rating, location, page: 1 });
  };

  const clear = () => {
    setSearch("");
    setInput("");
    setCat("All");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setDelivery(false);
    setRating("");
    setLocation("");
    setPage(1);
    setSp({});
  };

  const setPageAndSync = (nextPage) => {
    setPage(nextPage);
    syncParams({ search, category: cat, minPrice, maxPrice, sortBy, delivery, rating, location, page: nextPage });
  };

  const clearBadge = (type) => {
    if (type === "price") {
      clearPrices();
      return;
    }
    if (type === "sort") {
      changeSort("newest");
      return;
    }
    if (type === "search") {
      setSearch("");
      setInput("");
      setPage(1);
      syncParams({ search: "", category: cat, minPrice, maxPrice, sortBy, delivery, rating, location, page: 1 });
      return;
    }
    if (type === "category") {
      pickCat("All");
    }
    if (type === "delivery") {
      changeDelivery(false);
    }
    if (type === "rating") {
      changeRating("");
    }
    if (type === "location") {
      changeLocation("");
    }
  };

  const activeBadges = [
    search ? { key: "search", label: `Search: ${search}` } : null,
    cat !== "All" ? { key: "category", label: cat } : null,
    (minPrice || maxPrice) ? { key: "price", label: `₹${minPrice || "0"}-₹${maxPrice || "Any"}` } : null,
    sortBy !== "newest" ? { key: "sort", label: `Sort: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label || sortBy}` } : null,
    delivery ? { key: "delivery", label: "Delivery Available" } : null,
    rating ? { key: "rating", label: `${rating}★+` } : null,
    location ? { key: "location", label: `Location: ${location}` } : null,
  ].filter(Boolean);

  return (
    <div className="page">
      <div className={styles.container}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.heading}>Browse <span className="g-text">Rentals</span></h1>
            <p className={styles.total}>{total} items available</p>
          </div>
          {activeBadges.length > 0 && (
            <div className={styles.badges}>
              {activeBadges.map((badge) => (
                <button
                  key={badge.key}
                  type="button"
                  onClick={() => clearBadge(badge.key)}
                  className={styles.badge}
                >
                  {badge.label} <FiX size={12} />
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={clear}>
                <FiX /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form className={styles.searchBar} onSubmit={doSearch}>
          <FiSearch className={styles.sIco} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search decorations, lights, props…"
            className={styles.searchInput}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        {/* Category Pills */}
        <div className={styles.pills}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`${styles.pill} ${cat === c ? styles.pillActive : ""}`}
              onClick={() => pickCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className={styles.main}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.filterCard}>
              {/* Price Range */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>PRICE RANGE</label>
                <div className={styles.priceInputs}>
                  <div className={styles.priceInput}>
                    <span>₹</span>
                    <input
                      type="number"
                      className="input"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className={styles.priceInput}>
                    <span>₹</span>
                    <input
                      type="number"
                      className="input"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="5000"
                      min="0"
                    />
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearPrices}>
                  Clear
                </button>
              </div>

              {/* Delivery Available */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>DELIVERY AVAILABLE</label>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={delivery}
                    onChange={(e) => changeDelivery(e.target.checked)}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              {/* Rating Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>RATING</label>
                <select
                  className="input"
                  value={rating}
                  onChange={(e) => changeRating(e.target.value)}
                >
                  {RATING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>LOCATION</label>
                <input
                  type="text"
                  className="input"
                  value={location}
                  onChange={(e) => changeLocation(e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              {/* Sort By */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>SORT BY</label>
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) => changeSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className={styles.gridContainer}>
            {loading ? (
              <div className="grid-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>No items found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-primary" onClick={clear}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid-4 fade">
                  {items.map((i) => (
                    <ItemCard key={i._id} item={i} />
                  ))}
                </div>
                {pages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={page === 1}
                      onClick={() => setPageAndSync(page - 1)}
                    >
                      Prev
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles.pageNum} ${p === page ? styles.pageActive : ""}`}
                        onClick={() => setPageAndSync(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={page === pages}
                      onClick={() => setPageAndSync(page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
