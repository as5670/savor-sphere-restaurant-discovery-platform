import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom component to handle camera fly-to animations
const MapController = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5 // 1.5 seconds smooth glide
      });
    }
  }, [center, zoom, map]);
  return null;
};

// Custom icons using Leaflet DivIcon for premium styling
const createRestaurantIcon = (isSelected) => L.divIcon({
  className: 'custom-map-icon',
  html: `<div style="
    width: 28px;
    height: 28px;
    background-color: ${isSelected ? '#e2b855' : '#141724'};
    border: 2px solid #e2b855;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 15px ${isSelected ? '#e2b855' : 'rgba(0,0,0,0.5)'};
    color: ${isSelected ? '#090a0f' : '#e2b855'};
    font-size: 11px;
    font-weight: 700;
    transition: all 0.3s ease;
  ">★</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const userLocationIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div style="
    width: 20px;
    height: 20px;
    background-color: #e2b855;
    border: 3px solid #FFF;
    border-radius: 50%;
    box-shadow: 0 0 0 6px rgba(226, 184, 85, 0.4);
    animation: pulse 1.8s infinite;
  "></div>
  <style>
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0px rgba(226, 184, 85, 0.5); }
      100% { box-shadow: 0 0 0 12px rgba(226, 184, 85, 0); }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const MapComponent = ({ restaurants = [], activeCenter = null, userLocation = null }) => {
  // Set default view coordinates
  const defaultCenter = [40.7300, -74.0000]; // NYC Greenwich Village
  const centerPos = activeCenter || (userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter);

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '20px', overflow: 'hidden' }}>
      <MapContainer
        center={centerPos}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Map Controller for Fly-To animations */}
        <MapController center={centerPos} />

        {/* User Location Pin */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>
              <div style={popupStyles.wrapper}>
                <h4 style={popupStyles.title}>Your Location</h4>
                <p style={popupStyles.text}>Searching nearby restaurants...</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Restaurant Pins */}
        {restaurants.map((restaurant) => {
          const isSelected = activeCenter && activeCenter[0] === Number(restaurant.latitude) && activeCenter[1] === Number(restaurant.longitude);
          return (
            <Marker
              key={restaurant.id}
              position={[Number(restaurant.latitude), Number(restaurant.longitude)]}
              icon={createRestaurantIcon(isSelected)}
            >
              <Popup>
                <div style={popupStyles.wrapper}>
                  <h4 style={popupStyles.title}>{restaurant.name}</h4>
                  <p style={popupStyles.cuisine}>{restaurant.cuisine} • {restaurant.price_ranges}</p>
                  <p style={popupStyles.rating}>★ {restaurant.rating}</p>
                  <Link 
                    to={`/restaurants/${restaurant.id}`} 
                    style={popupStyles.link}
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

const popupStyles = {
  wrapper: {
    padding: '4px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333'
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '600'
  },
  cuisine: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    color: '#666'
  },
  rating: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#e2b855'
  },
  text: {
    margin: 0,
    fontSize: '11px',
    color: '#888'
  },
  link: {
    color: '#e2b855',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '12px'
  }
};

export default MapComponent;