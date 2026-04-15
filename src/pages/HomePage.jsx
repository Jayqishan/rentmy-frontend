import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiMapPin,
  FiShield,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import api from "../services/api";
import { formatPrice, imgUrl } from "../utils/helpers";
import styles from "./HomePage.module.css";

const marqueeOccasions = [
  "Wedding",
  "Birthday",
  "Festival",
  "Corporate",
  "Baby Shower",
  "Anniversary",
  "Halloween",
  "Christmas",
];

const categories = [
  { label: "Wedding", emoji: "💍" },
  { label: "Birthday", emoji: "🎂" },
  { label: "Festival", emoji: "🎉" },
  { label: "Corporate", emoji: "💼" },
  { label: "Baby Shower", emoji: "🍼" },
  { label: "Anniversary", emoji: "💖" },
  { label: "Halloween", emoji: "🎃" },
  { label: "Christmas", emoji: "🎄" },
  { label: "Other", emoji: "✨" },
];

const whyUs = [
  {
    icon: <FiStar />,
    title: "Curated Items",
    description: "Statement pieces, festive props and decor collections chosen for memorable Indian celebrations.",
  },
  {
    icon: <FiShield />,
    title: "Safe & Secure",
    description: "Trusted owners, protected bookings and a cleaner rental flow from discovery to doorstep return.",
  },
  {
    icon: <FiTruck />,
    title: "Delivery Option",
    description: "Flexible pickup and delivery support that works for venues, homes, events and last-minute setups.",
  },
];

const fallbackItems = [
  {
    _id: "mock-1",
    name: "Royal Wedding Floral Arch",
    category: "Wedding",
    location: "Mumbai",
    pricePerDay: 4500,
    image: "https://picsum.photos/seed/rmo-wedding/900/700",
    deliveryAvailable: true,
  },
  {
    _id: "mock-2",
    name: "Luxury Balloon Birthday Setup",
    category: "Birthday",
    location: "Bengaluru",
    pricePerDay: 2200,
    image: "https://picsum.photos/seed/rmo-birthday/900/700",
    deliveryAvailable: true,
  },
  {
    _id: "mock-3",
    name: "Festive Lighting Canopy",
    category: "Festival",
    location: "Delhi",
    pricePerDay: 3200,
    image: "https://picsum.photos/seed/rmo-festival/900/700",
    deliveryAvailable: false,
  },
  {
    _id: "mock-4",
    name: "Corporate Stage Backdrop Kit",
    category: "Corporate",
    location: "Hyderabad",
    pricePerDay: 5100,
    image: "https://picsum.photos/seed/rmo-corporate/900/700",
    deliveryAvailable: true,
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/items?limit=4")
      .then((r) => setFeatured(r.data.items || []))
      .catch(() => setFeatured([]));
  }, []);

  const featuredItems = featured.length > 0 ? featured.slice(0, 4) : fallbackItems;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlowBlue} />
        <div className={styles.heroGlowViolet} />
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.liveBadge}>
                <span className={styles.liveDot} />
                India's Premier Occasion Rental Platform
              </div>

              <h1 className={styles.heroTitle}>
                <span>Rent Smart.</span>
                <span>Celebrate</span>
                <span className={styles.heroGradient}>Better.</span>
              </h1>

              <p className={styles.heroSubtitle}>
                Discover decor, props, lights, florals and celebration essentials that bring South Asian festive
                energy to weddings, birthdays, pujas, baby showers and brand events without the buy-once waste.
              </p>

              <div className={styles.heroActions}>
                <Link to="/browse" className={`btn btn-primary ${styles.primaryCta}`}>
                  Browse Collection <FiArrowRight />
                </Link>
                <Link to="/register?role=owner" className={`btn btn-ghost ${styles.secondaryCta}`}>
                  Become an Owner
                </Link>
              </div>

              <div className={styles.statsRow}>
                <div>
                  <strong>500+</strong>
                  <span>Items</span>
                </div>
                <div>
                  <strong>1200+</strong>
                  <span>Customers</span>
                </div>
                <div>
                  <strong>50+</strong>
                  <span>Cities</span>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.visualFrame}>
                <div className={styles.glowRingOne} />
                <div className={styles.glowRingTwo} />
                <div className={styles.celebrationCluster}>
                  <div className={styles.fairyStrand} />
                  <div className={styles.flowerBurst} />
                  <div className={styles.balloonA} />
                  <div className={styles.balloonB} />
                  <div className={styles.balloonC} />
                </div>
                <div className={styles.priceTag}>From ₹999/day</div>
                <div className={styles.categoryTag}>Wedding Decor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.tickerWrap} aria-label="Popular occasions">
        <div className={styles.tickerTrack}>
          {[...marqueeOccasions, ...marqueeOccasions].map((occasion, index) => (
            <span key={`${occasion}-${index}`} className={styles.tickerItem}>
              {occasion}
            </span>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Browse by Occasion</p>
            <h2>Luxury rentals for every celebration mood</h2>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Link
                key={category.label}
                to={`/browse?category=${encodeURIComponent(category.label)}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryEmoji}>{category.emoji}</span>
                <span className={styles.categoryLabel}>{category.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeaderRow}>
            <div>
              <p className={styles.sectionEyebrow}>Featured Collection</p>
              <h2>Trending picks for elevated occasions</h2>
            </div>
            <Link to="/browse" className="btn btn-ghost">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className={styles.featuredGrid}>
            {featuredItems.map((item) => (
              <article key={item._id} className={styles.featuredCard}>
                <div className={styles.featuredImageWrap}>
                  <span className={styles.itemCategory}>{item.category}</span>
                  <span className={styles.itemDelivery}>
                    {item.deliveryAvailable ? "Delivery Available" : "Self Pickup"}
                  </span>
                  <img
                    src={imgUrl(item.image)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${item._id}/900/700`;
                    }}
                  />
                </div>

                <div className={styles.featuredBody}>
                  <h3>{item.name}</h3>
                  <p className={styles.itemMeta}>
                    <FiMapPin />
                    {item.location || "Available across India"}
                  </p>
                  <div className={styles.featuredFooter}>
                    <div className={styles.priceBlock}>
                      <strong>{formatPrice(item.pricePerDay)}</strong>
                      <span>per day</span>
                    </div>
                    <button type="button" className={styles.viewButton} onClick={() => navigate(`/items/${item._id}`)}>
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Why RentMyOccasion</p>
            <h2>Premium experience, celebratory energy, less hassle</h2>
          </div>
          <div className={styles.whyGrid}>
            {whyUs.map((feature) => (
              <article key={feature.title} className={styles.whyCard}>
                <div className={styles.whyIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bottomCtaSection}>
        <div className="container">
          <div className={styles.bottomCta}>
            <div className={styles.bottomGlow} />
            <p className={styles.sectionEyebrow}>Ready to list your items?</p>
            <h2>
              Turn your decor inventory into <span className="g-text">celebration income</span>
            </h2>
            <div className={styles.bottomActions}>
              <Link to="/register?role=owner" className={`btn btn-primary ${styles.primaryCta}`}>
                Become an Owner
              </Link>
              <Link to="/browse" className={`btn btn-ghost ${styles.secondaryCta}`}>
                Browse Items
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
