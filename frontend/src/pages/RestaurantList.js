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
  const [filters, setFilters] = useState({ cuisine: '', price: '', distance: '25', rating: '' });
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'distance', 'price'
  const [userLocation, setUserLocation] = useState(null);
  const [activeCenter, setActiveCenter] = useState(null);
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

  // Filter restaurants by maximum distance radius slider
  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (filters.distance && restaurant.distance !== null) {
      return restaurant.distance <= parseFloat(filters.distance);
    }
    return true;
  });

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === 'rating') {
      return Number(b.rating) - Number(a.rating);
    }
    if (sortBy === 'distance') {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    }
    if (sortBy === 'price') {
      const priceVal = (p) => p.length; // Length of "$", "$$", "$$$"
      return priceVal(a.price_ranges) - priceVal(b.price_ranges);
    }
    return 0;
  });

  const handleFlyToRestaurant = (lat, lng) => {
    setActiveCenter([Number(lat), Number(lng)]);
  };

  return (
    <div style={styles.container} className="animate-fade">
      <h2 style={styles.title}>Curated Fine Dining</h2>
      <p style={styles.subtitle}>Explore exquisite culinary spaces and secure reservations instantly</p>

      {/* Filters Header Dashboard */}
      <div style={styles.filterContainer} className="glass-card">
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>Cuisine</label>
          <input
            type="text"
            name="cuisine"
            value={filters.cuisine}
            onChange={handleFilterChange}
            placeholder="French, Japanese, Indian..."
            style={styles.input}
          />
        </div>
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>Price Tier</label>
          <select name="price" value={filters.price} onChange={handleFilterChange} style={styles.select}>
            <option value="">Any Price</option>
            <option value="$">$ (Budget)</option>
            <option value="$$">$$ (Moderate)</option>
            <option value="$$$">$$$ (Fine Dining)</option>
          </select>
        </div>
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
            <option value="rating">Highest Rating ★</option>
            <option value="distance">Nearest Distance 📍</option>
            <option value="price">Lowest Price 💰</option>
          </select>
        </div>
        <div style={styles.filterFieldRange}>
          <div style={styles.rangeHeader}>
            <label style={styles.fieldLabel}>Radius</label>
            <span style={styles.rangeVal}>{filters.distance} km</span>
          </div>
          <input
            type="range"
            name="distance"
            value={filters.distance}
            onChange={handleFilterChange}
            min="5"
            max="100"
            step="5"
            style={styles.rangeInput}
          />
        </div>
      </div>

      {/* Split-Screen Dashboard Layout */}
      <div style={styles.mainDashboardGrid}>
        {/* Left Column: Cards List */}
        <div style={styles.listContainer}>
          {loading ? (
            <p style={styles.statusText}>Searching for nearby venues...</p>
          ) : sortedRestaurants.length > 0 ? (
            <div style={styles.cardGrid}>
              {sortedRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} style={styles.restaurantCard} className="glass-card">
                  <div style={styles.cardHeader}>
                    <img
                      src={restaurant.image_url || restaurantImages[index % restaurantImages.length]}
                      alt={restaurant.name}
                      style={styles.cardImage}
                    />
                    <span style={styles.cardBadge}>{restaurant.cuisine}</span>
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{restaurant.name}</h3>
                    <div style={styles.cardMetaGrid}>
                      <span style={styles.metaLabel}>Rating: <strong style={{ color: "var(--accent-gold)" }}>★ {restaurant.rating}</strong></span>
                      <span style={styles.metaLabel}>Price: <strong style={{ color: "var(--text-primary)" }}>{restaurant.price_ranges}</strong></span>
                    </div>
                    {restaurant.distance !== null && (
                      <p style={styles.distanceLabel}>📍 {restaurant.distance} km away</p>
                    )}
                    <div style={styles.cardBtnRow}>
                      <button 
                        onClick={() => handleFlyToRestaurant(restaurant.latitude, restaurant.longitude)} 
                        style={styles.mapBtn}
                      >
                        Locate on Map
                      </button>
                      <Link to={`/restaurants/${restaurant.id}`} style={styles.detailsLinkBtn}>
                        Book Table
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.statusText}>No restaurants found matching your criteria.</p>
          )}
        </div>

        {/* Right Column: Sticky Interactive Leaflet Map */}
        <div style={styles.mapSidebarSection}>
          <div style={styles.mapCard} className="glass-card">
            <MapComponent 
              restaurants={sortedRestaurants} 
              activeCenter={activeCenter} 
              userLocation={userLocation} 
            />
          </div>
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
    gap: '24px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    marginBottom: '40px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterFieldRange: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: '220px',
  },
  rangeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rangeVal: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--accent-gold)',
  },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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
  rangeInput: {
    width: '100%',
    accentColor: 'var(--accent-gold)',
    cursor: 'pointer',
  },
  mainDashboardGrid: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    maxWidth: '1300px',
    margin: '0 auto',
  },
  listContainer: {
    flex: '1.2',
    minWidth: '320px',
  },
  mapSidebarSection: {
    flex: '0.8',
    minWidth: '320px',
    height: '600px',
    position: 'sticky',
    top: '100px',
  },
  mapCard: {
    height: '100%',
    width: '100%',
    padding: '10px',
    borderRadius: '20px',
    overflow: 'hidden',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  restaurantCard: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  cardHeader: {
    position: 'relative',
    height: '180px',
    width: '100%',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(9, 10, 15, 0.8)',
    backdropFilter: 'blur(4px)',
    color: 'var(--accent-gold)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(226, 184, 85, 0.3)',
  },
  cardBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '12px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    margin: 0,
  },
  cardMetaGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    paddingBottom: '12px',
  },
  metaLabel: {
    display: 'flex',
    gap: '4px',
  },
  distanceLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  cardBtnRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  mapBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: 'var(--text-primary)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  detailsLinkBtn: {
    flex: 1,
    textAlign: 'center',
    padding: '12px',
    backgroundColor: 'var(--accent-gold)',
    color: 'var(--bg-primary)',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
  statusText: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '16px',
    marginTop: '40px',
  }
};

export default RestaurantList;
