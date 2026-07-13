import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import { API_BASE_URL } from '../config';

const restaurantImages = [
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600",
  "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?w=600",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600",
];

const mockRestaurants = [
  {
    id: 1,
    name: 'Italian Pizza Place',
    cuisine: 'Italian',
    price_ranges: '$$',
    rating: 4.5,
    latitude: 40.7128,
    longitude: -74.0060,
    distance: 2
  },
  {
    id: 2,
    name: 'Mexican Taco Town',
    cuisine: 'Mexican',
    price_ranges: '$',
    rating: 4.2,
    latitude: 40.7250,
    longitude: -74.0100,
    distance: 5
  }
];

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState({ cuisine: '', price: '', distance: '', rating: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch from backend
  const fetchRestaurants = (loc) => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (filters.cuisine) queryParams.append("cuisine", filters.cuisine);
    if (filters.price) queryParams.append("price", filters.price);
    if (filters.rating) queryParams.append("rating", filters.rating);

    const activeLoc = loc !== undefined ? loc : userLocation;

    fetch(`${API_BASE_URL}/api/restaurants?${queryParams.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        const withDistance = data.map((r) => ({
          ...r,
          distance: activeLoc
            ? calculateDistance(activeLoc.latitude, activeLoc.longitude, Number(r.latitude), Number(r.longitude))
            : null
        }));
        const unique = Array.from(withDistance.reduce((map, item) => map.set(item.id, item), new Map()).values());
        setRestaurants(unique);
      })
      .catch(err => {
        console.error("Using mock data:", err);
        setRestaurants(mockRestaurants);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Get user's current location and fetch immediately
  useEffect(() => {
    // Initial fetch on mount
    fetchRestaurants(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(loc);
        fetchRestaurants(loc);
      },
      (err) => {
        console.error("Geolocation error or denied:", err);
        // default fallback location (NYC)
        const fallbackLoc = { latitude: 40.7128, longitude: -74.0060 };
        setUserLocation(fallbackLoc);
        fetchRestaurants(fallbackLoc);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);

    if (e.target.name !== 'distance') {
      const queryParams = new URLSearchParams();
      if (updated.cuisine) queryParams.append("cuisine", updated.cuisine);
      if (updated.price) queryParams.append("price", updated.price);
      if (updated.rating) queryParams.append("rating", updated.rating);

      fetch(`${API_BASE_URL}/api/restaurants?${queryParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          const withDistance = data.map((r) => ({
            ...r,
            distance: userLocation
              ? calculateDistance(userLocation.latitude, userLocation.longitude, Number(r.latitude), Number(r.longitude))
              : null
          }));
          const unique = Array.from(withDistance.reduce((map, item) => map.set(item.id, item), new Map()).values());
          setRestaurants(unique);
        })
        .catch(err => {
          console.error("Using mock data:", err);
          setRestaurants(mockRestaurants);
        });
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    return filters.distance ? restaurant.distance <= parseFloat(filters.distance) : true;
  });

  return (
    <div style={styles.container} className="animate-fade">
      <h2 style={styles.title}>Discover Exceptional Cuisine</h2>
      <p style={styles.subtitle}>Explore curated local dining choices and book tables instantly</p>

      {/* Filters */}
      <div style={styles.filterContainer} className="glass-card">
        <input
          type="text"
          name="cuisine"
          value={filters.cuisine}
          onChange={handleFilterChange}
          placeholder="Cuisine Type (e.g. Italian)"
          style={styles.input}
        />
        <select name="price" value={filters.price} onChange={handleFilterChange} style={styles.select}>
          <option value="">Any Price</option>
          <option value="$">$ (Budget)</option>
          <option value="$$">$$ (Moderate)</option>
          <option value="$$$">$$$ (Upscale)</option>
        </select>
        <input
          type="number"
          name="distance"
          value={filters.distance}
          onChange={handleFilterChange}
          placeholder="Max Distance (km)"
          style={styles.input}
        />
        <input
          type="number"
          name="rating"
          value={filters.rating}
          onChange={handleFilterChange}
          placeholder="Min Rating (1-5)"
          step="0.1"
          min="1"
          max="5"
          style={styles.input}
        />
      </div>

      {/* Main Grid: Card list & Map */}
      <div style={styles.mainGrid}>
        <div style={styles.listSection}>
          {loading ? (
            <p style={styles.statusText}>Searching for restaurants...</p>
          ) : filteredRestaurants.length > 0 ? (
            <div style={styles.cardGrid}>
              {filteredRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} style={styles.card} className="glass-card">
                  <img
                    src={restaurant.image_url || restaurantImages[index % restaurantImages.length]}
                    alt={restaurant.name}
                    style={styles.image}
                  />
                  <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>{restaurant.name}</h3>
                    <div style={styles.cardInfoGrid}>
                      <span style={styles.infoBadge}>{restaurant.cuisine}</span>
                      <span style={styles.infoBadge}>{restaurant.price_ranges}</span>
                      <span style={styles.ratingBadge}>★ {restaurant.rating}</span>
                    </div>
                    {restaurant.distance !== null && (
                      <p style={styles.distanceText}>📍 {restaurant.distance} km away</p>
                    )}
                    <Link to={`/restaurants/${restaurant.id}`} style={styles.detailsLink}>
                      View Details & Reservations →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.statusText}>No restaurants match your filters.</p>
          )}
        </div>
        
        {/* Map Container */}
        <div style={styles.mapSection} className="glass-card">
          <MapComponent restaurants={filteredRestaurants} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 80px',
    backgroundColor: 'var(--bg-primary)',
    minHeight: 'calc(100vh - 80px)',
  },
  title: {
    fontSize: '36px',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: '8px',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '40px',
  },
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    padding: '24px',
    marginBottom: '40px',
    borderRadius: '16px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: 'var(--text-primary)',
    minWidth: '200px',
    outline: 'none',
    fontSize: '14px',
  },
  select: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: 'var(--text-primary)',
    minWidth: '200px',
    outline: 'none',
    fontSize: '14px',
  },
  mainGrid: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap-reverse',
  },
  listSection: {
    flex: '1.2',
    minWidth: '320px',
  },
  mapSection: {
    flex: '0.8',
    minWidth: '320px',
    height: '600px',
    overflow: 'hidden',
    position: 'sticky',
    top: '120px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  cardInfoGrid: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  infoBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  ratingBadge: {
    backgroundColor: 'rgba(226,184,85,0.15)',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    color: 'var(--accent-gold)',
    fontWeight: '600',
  },
  distanceText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  detailsLink: {
    color: 'var(--accent-gold)',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    marginTop: 'auto',
    transition: 'color 0.2s ease',
  },
  statusText: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '16px',
    marginTop: '40px',
  }
};

export default RestaurantList;
