import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiStar, FiClock, FiMapPin, FiUsers } from "react-icons/fi";
import Loader from "../components/Loader";

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menu, setMenu] = useState([]);
  const [newReview, setNewReview] = useState({ user_name: "", rating: 5, comment: "" });
  const [newReservation, setNewReservation] = useState({ user_name: "", date: "", time: "", guests: 1 });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantRes, reviewsRes, reservationsRes, menuRes] = await Promise.all([
          fetch(`http://localhost:5000/api/restaurants/${id}`),
          fetch(`http://localhost:5000/api/restaurants/${id}/reviews`),
          fetch(`http://localhost:5000/api/restaurants/${id}/reservations`),
          fetch(`http://localhost:5000/api/restaurants/${id}/menu`)
        ]);

        setRestaurant(await restaurantRes.json());
        setReviews(await reviewsRes.json());
        setReservations(await reservationsRes.json());
        setMenu(await menuRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      const data = await response.json();
      setMessage("✅ Review submitted successfully!");
      setReviews([...reviews, data]);
      setNewReview({ user_name: "", rating: 5, comment: "" });
    } catch (error) {
      setMessage("❌ Error submitting review");
    }
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/${id}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReservation),
      });
      const data = await response.json();
      setMessage("✅ Reservation successful!");
      setReservations([...reservations, data]);
      setNewReservation({ user_name: "", date: "", time: "", guests: 1 });
    } catch (error) {
      setMessage("❌ Error making reservation");
    }
  };

  if (loading) return <Loader />;

  // Fallback image if no restaurant.image_url provided
  
  const heroImages = [
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=2089&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D"
  ];
  
  // Pick a random hero image
  const heroImage = heroImages[Math.floor(Math.random() * heroImages.length)] || `https://source.unsplash.com/1600x900/?restaurant,food`;
  

  return (
    <div style={styles.container}>
      {/* Hero Section with background image */}
      <div
        style={{
          ...styles.hero,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div style={styles.heroContent}>
          <h1 style={styles.title}>{restaurant.name}</h1>
          <div style={styles.heroDetails}>
            <span style={styles.rating}><FiStar /> {restaurant.rating}</span>
            <span style={styles.priceRange}>{restaurant.price_ranges}</span>
            <span style={styles.cuisine}>{restaurant.cuisine}</span>
          </div>
        </div>
      </div>

      {/* Main content continues as before... */}
      {/* KEEP THE REST OF YOUR CODE UNCHANGED BELOW THIS LINE */}


      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Menu Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Exquisite Menu</h2>
          <div style={styles.menuGrid}>
            {menu.map((dish) => (
              <article key={dish.id} style={styles.menuCard}>
                <div style={styles.imageContainer}>
                  <img
                    src={dish.image_url || `https://source.unsplash.com/800x600/?${dish.name},food`}
                    alt={dish.name}
                    style={styles.menuImage}
                    onError={(e) => {
                      e.target.src = "https://source.unsplash.com/800x600/?food";
                    }}
                  />
                </div>
                <div style={styles.menuContent}>
                  <h3 style={styles.dishName}>{dish.name}</h3>
                  <p style={styles.dishPrice}>₹{dish.price}</p>
                  {dish.description && <p style={styles.dishDescription}>{dish.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Guest Experiences</h2>
          <div style={styles.reviewsGrid}>
            {reviews.map((review) => (
              <div key={review.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <span style={styles.reviewAuthor}>{review.user_name}</span>
                  <span style={styles.reviewRating}><FiStar /> {review.rating}</span>
                </div>
                <p style={styles.reviewText}>"{review.comment}"</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleReviewSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>Share Your Experience</h3>
            <div style={styles.formGroup}>
              <input
                type="text"
                placeholder="Your Name"
                value={newReview.user_name}
                onChange={(e) => setNewReview({ ...newReview, user_name: e.target.value })}
                style={styles.input}
                required
              />
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                style={styles.select}
                required
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Your review..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              style={styles.textarea}
              required
            />
            <button type="submit" style={styles.button}>Submit Review</button>
          </form>
        </section>

        {/* Reservation Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Reserve Your Table</h2>
          <form onSubmit={handleReservationSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <input
                type="text"
                placeholder="Your Name"
                value={newReservation.user_name}
                onChange={(e) => setNewReservation({ ...newReservation, user_name: e.target.value })}
                style={styles.input}
                required
              />
              <input
                type="date"
                value={newReservation.date}
                onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                style={styles.input}
                required
              />
              <input
                type="time"
                value={newReservation.time}
                onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                style={styles.input}
                required
              />
              <div style={styles.guestInput}>
                <FiUsers style={styles.icon} />
                <select
                  value={newReservation.guests}
                  onChange={(e) => setNewReservation({ ...newReservation, guests: e.target.value })}
                  style={styles.select}
                  required
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" style={styles.button}>Confirm Reservation</button>
          </form>
        </section>

        {message && <div style={styles.message}>{message}</div>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0A0A0A",
    minHeight: "100vh",
    color: "#FFFFFF",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  hero: {
    position: "relative",
    height: "60vh",
    background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))",
    marginBottom: "4rem",
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "3rem",
    background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
  },
  title: {
    fontSize: "3rem",
    fontWeight: 300,
    margin: 0,
    color: "#FFD700",
    letterSpacing: "1px",
  },
  heroDetails: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
    marginTop: "1rem",
    color: "#FFFFFF",
    fontSize: "1.2rem",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#FFD700",
  },
  priceRange: {
    backgroundColor: "rgba(255,215,0,0.1)",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
  },
  cuisine: {
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem 4rem",
  },
  section: {
    marginBottom: "4rem",
    backgroundColor: "#1A1A1A",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: 300,
    borderBottom: "2px solid #FFD700",
    paddingBottom: "1rem",
    marginBottom: "2rem",
    color: "#FFD700",
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  menuCard: {
    backgroundColor: "#252525",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateY(-5px)",
    },
  },
  imageContainer: {
    height: "250px",
    overflow: "hidden",
  },
  menuImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "scale(1.05)",
    },
  },
  menuContent: {
    padding: "1.5rem",
  },
  dishName: {
    fontSize: "1.2rem",
    margin: 0,
    color: "#FFFFFF",
  },
  dishPrice: {
    fontSize: "1.1rem",
    color: "#FFD700",
    margin: "0.5rem 0",
  },
  dishDescription: {
    fontSize: "0.9rem",
    color: "#CCCCCC",
    lineHeight: 1.5,
  },
  reviewsGrid: {
    display: "grid",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  reviewCard: {
    backgroundColor: "#252525",
    borderRadius: "12px",
    padding: "1.5rem",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  reviewAuthor: {
    fontWeight: 500,
    color: "#FFD700",
  },
  reviewRating: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#FFD700",
  },
  reviewText: {
    color: "#CCCCCC",
    lineHeight: 1.6,
  },
  form: {
    display: "grid",
    gap: "1.5rem",
  },
  formTitle: {
    fontSize: "1.2rem",
    color: "#FFFFFF",
    margin: 0,
  },
  formGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  input: {
    padding: "1rem",
    backgroundColor: "#252525",
    border: "1px solid #333333",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
    ":focus": {
      outline: "none",
      borderColor: "#FFD700",
    },
  },
  select: {
    padding: "1rem",
    backgroundColor: "#252525",
    border: "1px solid #333333",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "1rem",
    appearance: "none",
  },
  textarea: {
    padding: "1rem",
    backgroundColor: "#252525",
    border: "1px solid #333333",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "1rem",
    minHeight: "150px",
    resize: "vertical",
    ":focus": {
      outline: "none",
      borderColor: "#FFD700",
    },
  },
  button: {
    padding: "1rem 2rem",
    backgroundColor: "#FFD700",
    color: "#000000",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "scale(1.05)",
    },
  },
  guestInput: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    backgroundColor: "#252525",
    borderRadius: "8px",
    padding: "0 1rem",
  },
  icon: {
    color: "#FFD700",
    fontSize: "1.2rem",
  },
  message: {
    padding: "1rem",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: 500,
    marginTop: "2rem",
    backgroundColor: "rgba(0,255,128,0.1)",
    color: "#00FF80",
  },
};

export default RestaurantDetails;
