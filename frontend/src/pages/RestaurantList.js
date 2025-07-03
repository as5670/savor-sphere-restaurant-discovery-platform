import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MapComponent from '../components/MapComponent';

const restaurantImages = [
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
  "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D",
];

const mockRestaurants = [
  {
    id: 1,
    name: 'Italian Pizza Place',
    cuisine: 'Italian',
    price_ranges: '₹₹',
    rating: 4.5,
    latitude: 51.505,
    longitude: -0.09,
    distance: 2
  },
  {
    id: 2,
    name: 'Mexican Taco Town',
    cuisine: 'Mexican',
    price_ranges: '₹',
    rating: 4.2,
    latitude: 51.51,
    longitude: -0.1,
    distance: 5
  }
];

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState({ cuisine: '', price: '', distance: '', rating: '' });
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation({ latitude: 51.505, longitude: -0.09 }); // fallback location
      }
    );
  }, []);

  // Fetch from backend (filters except distance)
  const fetchRestaurants = () => {
    const queryParams = new URLSearchParams();
    if (filters.cuisine) queryParams.append("cuisine", filters.cuisine);
    if (filters.price) queryParams.append("price", filters.price);
    if (filters.rating) queryParams.append("rating", filters.rating);

    fetch(`http://localhost:5000/api/restaurants?${queryParams.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        const withDistance = data.map((r) => ({
          ...r,
          distance: userLocation
            ? calculateDistance(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude)
            : null
        }));
        const unique = Array.from(new Map(withDistance.map(item => [item.id, item])).values());
        setRestaurants(unique);
      })
      .catch(err => {
        console.error("Using mock data:", err);
        setRestaurants(mockRestaurants);
      });
  };

  useEffect(() => {
    if (userLocation) {
      fetchRestaurants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);

    if (e.target.name !== 'distance') {
      const queryParams = new URLSearchParams();
      if (updated.cuisine) queryParams.append("cuisine", updated.cuisine);
      if (updated.price) queryParams.append("price", updated.price);
      if (updated.rating) queryParams.append("rating", updated.rating);

      fetch(`http://localhost:5000/api/restaurants?${queryParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          const withDistance = data.map((r) => ({
            ...r,
            distance: userLocation
              ? calculateDistance(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude)
              : null
          }));
          const unique = Array.from(new Map(withDistance.map(item => [item.id, item])).values());
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
    <div style={styles.container}>
      <h2 style={styles.title}>Explore Restaurants</h2>

      {/* Filters */}
      <div style={styles.filterContainer}>
        <input
          type="text"
          name="cuisine"
          value={filters.cuisine}
          onChange={handleFilterChange}
          placeholder="Cuisine"
          style={styles.input}
        />
        <select name="price" value={filters.price} onChange={handleFilterChange} style={styles.input}>
          <option value="">Price</option>
          <option value="₹">₹</option>
          <option value="₹₹">₹₹</option>
          <option value="₹₹₹">₹₹₹</option>
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
          style={styles.input}
        />
      </div>

      {/* Map */}
      <MapComponent restaurants={filteredRestaurants} />

      {/* Restaurant Cards */}
      <div style={styles.cardGrid}>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant, index) => (
            <div key={restaurant.id} style={styles.card}>
              <img
                src={restaurantImages[index % restaurantImages.length]}
                alt={restaurant.name}
                style={styles.image}
              />
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{restaurant.name}</h3>
                <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                <p><strong>Price:</strong> {restaurant.price_ranges}</p>
                <p><strong>Distance:</strong> {restaurant.distance} km</p>
                <p><strong>Rating:</strong> {restaurant.rating}⭐</p>
                <Link to={`/restaurants/${restaurant.id}`} style={styles.link}>
                  View Details →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "30px" }}>No restaurants match your filters.</p>
        )}
      </div>
    </div>
  );
};

// Stylish Dark Theme
const styles = {
  container: {
    padding: '40px',
    backgroundColor: '#121212',
    color: '#fff',
    minHeight: '100vh',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#f4a261'
  },
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#1f1f1f',
    color: '#fff',
    minWidth: '180px'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '25px',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 0 10px rgba(0,0,0,0.4)',
    transition: 'transform 0.3s ease',
  },
  cardContent: {
    padding: '15px',
  },
  cardTitle: {
    fontSize: '22px',
    color: '#ff5f57',
    marginBottom: '10px'
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover'
  },
  link: {
    display: 'inline-block',
    marginTop: '10px',
    color: '#f4a261',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default RestaurantList;
