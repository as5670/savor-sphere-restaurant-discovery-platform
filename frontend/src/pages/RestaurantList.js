import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  const filteredRestaurants = restaurants.filter((restaurant) => {
    return filters.distance ? restaurant.distance <= parseFloat(filters.distance) : true;
  });

  return (
    <div style={styles.container} className="animate-fade">
      <h2 style={styles.title}>Curated Fine Dining</h2>
      <p style={styles.subtitle}>Explore exquisite culinary spaces and secure reservations instantly</p>

      {/* Filters */}
      <div style={styles.filterContainer} className="glass-card">
        <input
          type="text"
          name="cuisine"
          value={filters.cuisine}
          onChange={handleFilterChange}
          placeholder="Cuisine (e.g. French, Japanese)"
          style={styles.input}
        />
        <select name="price" value={filters.price} onChange={handleFilterChange} style={styles.select}>
          <option value="">Any Price</option>
          <option value="$">$ (Budget)</option>
          <option value="$$">$$ (Moderate)</option>
          <option value="$$$">$$$ (Fine Dining)</option>
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
          placeholder="Min Rating"
          step="0.1"
          min="1"
          max="5"
          style={styles.input}
        />
      </div>

      {/* 2-Column Dashboard Layout */}
      <div style={styles.mainDashboardGrid}>
        {/* Left Column: Cards List */}
        <div style={styles.listContainer}>
          {loading ? (
            <p style={styles.statusText}>Querying dining establishments...</p>
          ) : filteredRestaurants.length > 0 ? (
            <div style={styles.cardGrid}>
              {filteredRestaurants.map((restaurant, index) => (
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
                      <p style={styles.distanceLabel}>📍 {restaurant.distance} km from your location</p>
                    )}
                    <Link to={`/restaurants/${restaurant.id}`} style={styles.cardActionBtn}>
                      View Details & Reservation →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.statusText}>No restaurants found matching your preferences.</p>
          )}
        </div>

        {/* Right Column: Analytics & Highlights Dashboard Sidebar */}
        <div style={styles.sidebarSection}>
          {/* Stats Widget */}
          <div style={styles.sidebarCard} className="glass-card">
            <h3 style={styles.sidebarCardTitle}>SavorSphere Live Network</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <span style={styles.statVal}>7+</span>
                <span style={styles.statLabel}>Global Cuisines</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statVal}>342</span>
                <span style={styles.statLabel}>Bookings Today</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statVal}>4.8★</span>
                <span style={styles.statLabel}>Average Rating</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statVal}>1.4k</span>
                <span style={styles.statLabel}>Active Foodies</span>
              </div>
            </div>
          </div>

          {/* Highlights Showcase */}
          <div style={styles.sidebarCard} className="glass-card">
            <h3 style={styles.sidebarCardTitle}>Chef's Recommendation</h3>
            <div style={styles.featuredContent}>
              <img 
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=400" 
                alt="Slow Cooked Ribs" 
                style={styles.featuredImg}
              />
              <div style={styles.featuredBody}>
                <h4 style={styles.featuredTitle}>Smoked Rosemary Ribs</h4>
                <p style={styles.featuredDesc}>
                  Slow-cooked for 18 hours in hickory smoke, glazed with rosemary honey. Exclusively at SavorSphere venues.
                </p>
              </div>
            </div>
          </div>
          
          {/* Member Club Widget */}
          <div style={styles.sidebarCard} className="glass-card">
            <h3 style={styles.sidebarCardTitle}>SavorSphere Elite Dining</h3>
            <p style={styles.clubText}>
              Enjoy up to 25% off signature dishes and priority table bookings at top-rated locations.
            </p>
            <button style={styles.clubJoinBtn}>Explore Membership Benefits</button>
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
  mainDashboardGrid: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    maxWidth: '1300px',
    margin: '0 auto',
  },
  listContainer: {
    flex: '1.4',
    minWidth: '320px',
  },
  sidebarSection: {
    flex: '0.7',
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'sticky',
    top: '100px',
    height: 'fit-content',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
    gap: '24px',
  },
  restaurantCard: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '20px',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
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
    transition: 'transform 0.4s ease',
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
  cardActionBtn: {
    display: 'inline-block',
    textAlign: 'center',
    padding: '12px',
    backgroundColor: 'rgba(226,184,85,0.06)',
    color: 'var(--accent-gold)',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid rgba(226,184,85,0.2)',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    marginTop: '8px',
  },
  sidebarCard: {
    padding: '24px',
    borderRadius: '20px',
  },
  sidebarCardTitle: {
    fontSize: '18px',
    fontWeight: '500',
    margin: '0 0 20px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '10px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  statBox: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.02)',
  },
  statVal: {
    fontSize: '22px',
    fontWeight: '600',
    color: 'var(--accent-gold)',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    textAlign: 'center',
  },
  featuredContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featuredImg: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '12px',
  },
  featuredBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  featuredTitle: {
    fontSize: '15px',
    fontWeight: '600',
    margin: 0,
  },
  featuredDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: 0,
  },
  clubText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
  },
  clubJoinBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'var(--accent-gold)',
    color: 'var(--bg-primary)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(226,184,85,0.15)',
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
