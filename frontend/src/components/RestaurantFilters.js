import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MapComponent from "../components/MapComponent";
import { FiStar, FiMapPin, FiDollarSign, FiClock } from "react-icons/fi";
import Loader from "../components/Loader";

// Image URLs
const HERO_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1552566626-52f8b828add9';
const RESTAURANT_IMAGES = {
  french: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734',
  japanese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
  italian: 'https://images.unsplash.com/photo-1592861956120-e524fc739696',
  steakhouse: 'https://images.unsplash.com/photo-1579368056738-6a1b8e5270db'
};

// Color Scheme
const colors = {
  primary: "#FFD700",
  secondary: "#1A1A1A",
  accent: "#8B0000",
  background: "#0A0A0A",
  text: "#F5F5F5"
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const RestaurantFilters = () => {
  const [cuisine, setCuisine] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("");
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data with images
  const mockRestaurants = [
    {
      id: 1,
      name: "La Maison Dorée",
      cuisine: "French",
      price_ranges: "₹₹₹",
      rating: 4.9,
      latitude: 48.8566,
      longitude: 2.3522,
      image: RESTAURANT_IMAGES.french
    },
    {
      id: 2,
      name: "Sakura Teppanyaki",
      cuisine: "Japanese",
      price_ranges: "₹₹₹₹",
      rating: 4.8,
      latitude: 35.6762,
      longitude: 139.6503,
      image: RESTAURANT_IMAGES.japanese
    }
  ];

  useEffect(() => {
    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          console.error("Location error:", error);
          setError("Enable location for personalized results");
        }
      );
    };
    getLocation();
  }, []);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setRestaurants(data);
        setFilteredRestaurants(data);
      })
      .catch((error) => {
        console.error("Using mock data:", error);
        setRestaurants(mockRestaurants);
        setFilteredRestaurants(mockRestaurants);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = [...restaurants];

    filtered = filtered.filter(r => {
      const matchesCuisine = !cuisine || r.cuisine === cuisine;
      const matchesPrice = !price || r.price_ranges === price;
      const matchesRating = !rating || r.rating >= parseFloat(rating);
      
      if (!userLocation) return matchesCuisine && matchesPrice && matchesRating;
      
      const distance = getDistanceFromLatLonInKm(
        userLocation[0],
        userLocation[1],
        r.latitude,
        r.longitude
      );
      
      return matchesCuisine && matchesPrice && matchesRating && distance <= distanceFilter;
    });

    setFilteredRestaurants(filtered);
  }, [cuisine, price, rating, distanceFilter, userLocation, restaurants]);

  if (loading) return <Loader />;
  if (error) return (
    <div style={{ padding: "2rem", textAlign: "center", color: colors.accent }}>
      <h2>⚠️ {error}</h2>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Culinary Excellence Awaits</h1>
          <p style={styles.heroSubtitle}>Discover premium dining experiences near you</p>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterSection}>
        <div style={styles.filterGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}><FiMapPin /> CUISINE</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              style={styles.select}
            >
              <option value="">All Cuisines</option>
              <option value="French">French</option>
              <option value="Japanese">Japanese</option>
              <option value="Italian">Italian</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}><FiDollarSign /> PRICE</label>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={styles.select}
            >
              <option value="">All Prices</option>
              <option value="₹">₹ (Budget)</option>
              <option value="₹₹">₹₹ (Standard)</option>
              <option value="₹₹₹">₹₹₹ (Premium)</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}><FiStar /> RATING</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              style={styles.input}
              placeholder="4.0+"
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}><FiClock /> DISTANCE</label>
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(Number(e.target.value))}
              style={styles.select}
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={styles.mapContainer}>
        <MapComponent restaurants={filteredRestaurants} />
      </div>

      {/* Results */}
      <div style={styles.resultsSection}>
        <h2 style={styles.resultsTitle}>Curated Selections ({filteredRestaurants.length})</h2>
        <div style={styles.resultsGrid}>
          {filteredRestaurants.map(r => (
            <div key={r.id} style={styles.card}>
              <div style={styles.cardImageContainer}>
                <img
                  src={r.image || FALLBACK_IMAGE}
                  alt={r.name}
                  style={styles.cardImage}
                  onError={(e) => e.target.src = FALLBACK_IMAGE}
                />
              </div>
              <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    <Link to={`/restaurants/${r.id}`} style={styles.cardLink}>
                      {r.name}
                    </Link>
                  </h3>
                  <span style={styles.cardRating}><FiStar /> {r.rating}</span>
                </div>
                <div style={styles.cardMeta}>
                  <span style={styles.cuisine}>{r.cuisine}</span>
                  <span style={styles.price}>{r.price_ranges}</span>
                </div>
                <div style={styles.cardFooter}>
                  <FiMapPin /> {userLocation ? 
                    `${getDistanceFromLatLonInKm(
                      userLocation[0],
                      userLocation[1],
                      r.latitude,
                      r.longitude
                    ).toFixed(1)} km` : "Distance unavailable"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    backgroundColor: colors.background,
    minHeight: '100vh',
    color: colors.text
  },
  hero: {
    background: `linear-gradient(rgba(10, 10, 10, 0.7), url(${HERO_IMAGE})`,
    height: '60vh',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroContent: {
    textAlign: 'center',
    padding: '2rem'
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 300,
    letterSpacing: '2px',
    color: colors.primary,
    marginBottom: '1rem'
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    fontWeight: 300
  },
  filterSection: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '-4rem auto 0'
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    backgroundColor: colors.secondary,
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  filterGroup: {
    marginBottom: '1rem'
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    color: colors.primary
  },
  select: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${colors.primary}30`,
    borderRadius: '8px',
    color: colors.text,
    fontSize: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${colors.primary}30`,
    borderRadius: '8px',
    color: colors.text
  },
  mapContainer: {
    height: '500px',
    width: '90%',
    margin: '2rem auto',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  resultsSection: {
    padding: '4rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  resultsTitle: {
    fontSize: '2rem',
    fontWeight: 300,
    marginBottom: '2rem',
    color: colors.primary
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  },
  card: {
    backgroundColor: colors.secondary,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  },
  cardImageContainer: {
    height: '250px',
    position: 'relative',
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  cardContent: {
    padding: '1.5rem'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 500,
    margin: 0
  },
  cardLink: {
    color: colors.text,
    textDecoration: 'none',
    ':hover': {
      color: colors.primary
    }
  },
  cardRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    color: colors.primary
  },
  cardMeta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },
  cuisine: {
    color: colors.primary
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#888'
  }
};

export default RestaurantFilters;

