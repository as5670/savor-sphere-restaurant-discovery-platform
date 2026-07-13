import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiStar, FiUsers } from "react-icons/fi";
import Loader from "../components/Loader";
import { API_BASE_URL } from "../config";

const RestaurantDetails = ({ user }) => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menu, setMenu] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [newReservation, setNewReservation] = useState({ date: "", time: "", guests: 1 });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants/${id}/reviews`);
      setReviews(await res.json());
    } catch (e) {
      console.error("Error fetching reviews", e);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants/${id}/reservations`);
      setReservations(await res.json());
    } catch (e) {
      console.error("Error fetching reservations", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantRes, menuRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/restaurants/${id}`),
          fetch(`${API_BASE_URL}/api/restaurants/${id}/menu`)
        ]);

        setRestaurant(await restaurantRes.json());
        setMenu(await menuRes.json());
        await Promise.all([fetchReviews(), fetchReservations()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in to submit a review.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}/reviews`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Review submitted successfully!");
        setNewReview({ rating: 5, comment: "" });
        await fetchReviews();
      } else {
        setMessage(`❌ ${data.error || "Failed to submit review."}`);
      }
    } catch (error) {
      setMessage("❌ Error submitting review");
    }
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in to make a reservation.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}/reservations`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReservation),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Reservation successful!");
        setNewReservation({ date: "", time: "", guests: 1 });
        await fetchReservations();
      } else {
        setMessage(`❌ ${data.error || "Failed to make reservation."}`);
      }
    } catch (error) {
      setMessage("❌ Error making reservation");
    }
  };

  if (loading) return <Loader />;
  if (!restaurant) return <p style={styles.statusText}>Restaurant not found.</p>;

  // Fallback image if no restaurant.image_url provided
  const heroImages = [
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200",
    "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?w=1200",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200",
  ];
  const heroImage = restaurant.image_url || heroImages[restaurant.id % heroImages.length];

  // Filter menu items by search query
  const filteredMenu = menu.filter((dish) => 
    dish.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
    (dish.description && dish.description.toLowerCase().includes(menuSearch.toLowerCase()))
  );

  return (
    <div style={styles.container} className="animate-fade">
      {/* Hero Section */}
      <div
        style={{
          ...styles.hero,
          backgroundImage: `linear-gradient(rgba(9,10,15,0.7), rgba(9,10,15,0.85)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={styles.heroContent}>
          <span style={styles.cuisineBadge}>{restaurant.cuisine}</span>
          <h1 style={styles.title}>{restaurant.name}</h1>
          <div style={styles.heroDetails}>
            <span style={styles.rating}><FiStar style={{ fill: "var(--accent-gold)" }} /> {restaurant.rating}</span>
            <span style={styles.priceRange}>{restaurant.price_ranges}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Menu Section */}
        <section style={styles.section} className="glass-card">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Signature Dishes</h2>
            <input
              type="text"
              placeholder="Search dishes..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          {filteredMenu.length > 0 ? (
            <div style={styles.menuGrid}>
              {filteredMenu.map((dish) => (
                <article key={dish.id} style={styles.menuCard}>
                  <div style={styles.menuContent}>
                    <div style={styles.menuHeaderRow}>
                      <h3 style={styles.dishName}>{dish.name}</h3>
                      <p style={styles.dishPrice}>₹{dish.price}</p>
                    </div>
                    {dish.description && <p style={styles.dishDescription}>{dish.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>No dishes match your search.</p>
          )}
        </section>

        {/* Side-by-Side: Reservations & Reviews */}
        <div style={styles.doubleGrid}>
          {/* Reservation Card */}
          <section style={styles.sideSection} className="glass-card">
            <h2 style={styles.sectionTitle}>Reserve a Table</h2>
            {user ? (
              <form onSubmit={handleReservationSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={newReservation.date}
                    onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Time</label>
                  <input
                    type="time"
                    value={newReservation.time}
                    onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Number of Guests</label>
                  <div style={styles.selectWrapper}>
                    <FiUsers style={styles.selectIcon} />
                    <select
                      value={newReservation.guests}
                      onChange={(e) => setNewReservation({ ...newReservation, guests: e.target.value })}
                      style={styles.select}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" style={styles.button}>Confirm Booking</button>
              </form>
            ) : (
              <div style={styles.loginPrompt}>
                <p style={styles.promptText}>Sign in to book a reservation at this restaurant.</p>
                <Link to="/login" style={styles.loginLinkBtn}>Sign In to Book</Link>
              </div>
            )}

            {/* Active Bookings list */}
            {reservations.length > 0 && (
              <div style={styles.bookingsListContainer}>
                <h4 style={styles.subheading}>Upcoming Reservations ({reservations.length})</h4>
                <div style={styles.bookingCardsStack}>
                  {reservations.map((res) => (
                    <div key={res.id} style={styles.bookingRowCard}>
                      <span>📅 {res.date} at {res.time.substring(0, 5)}</span>
                      <span>👥 {res.guests} guests</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Reviews Card */}
          <section style={styles.sideSection} className="glass-card">
            <h2 style={styles.sectionTitle}>Guest Experiences</h2>
            
            <div style={styles.reviewsList}>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <span style={styles.reviewAuthor}>{review.user_name}</span>
                      <span style={styles.reviewRating}><FiStar style={{ fill: "var(--accent-gold)", color: "var(--accent-gold)" }} /> {review.rating}</span>
                    </div>
                    <p style={styles.reviewText}>"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <p style={styles.emptyText}>No reviews posted yet. Be the first!</p>
              )}
            </div>

            {user ? (
              <form onSubmit={handleReviewSubmit} style={styles.form}>
                <h3 style={styles.subheading}>Write a Review</h3>
                <div style={styles.formRow}>
                  <label style={styles.label}>Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                    style={styles.selectSmall}
                    required
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>{num} Stars</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Share your dining experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  style={styles.textarea}
                  required
                />
                <button type="submit" style={styles.button}>Submit Experience</button>
              </form>
            ) : (
              <div style={styles.loginPrompt}>
                <p style={styles.promptText}>Sign in to share your dining experience.</p>
                <Link to="/login" style={styles.loginLinkBtn}>Sign In to Review</Link>
              </div>
            )}
          </section>
        </div>

        {message && <div style={styles.messageBanner}>{message}</div>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--bg-primary)",
    minHeight: "calc(100vh - 80px)",
    color: "var(--text-primary)",
  },
  hero: {
    height: "45vh",
    display: "flex",
    alignItems: "flex-end",
    paddingBottom: "40px",
  },
  heroContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    padding: "0 40px",
  },
  cuisineBadge: {
    color: "var(--accent-gold)",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    backgroundColor: "rgba(226,184,85,0.15)",
    padding: "4px 12px",
    borderRadius: "20px",
    display: "inline-block",
    marginBottom: "12px",
  },
  title: {
    fontSize: "44px",
    fontWeight: "400",
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px",
  },
  heroDetails: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--accent-gold)",
    fontWeight: "600",
    fontSize: "16px",
  },
  priceRange: {
    color: "var(--text-secondary)",
    fontSize: "15px",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "2px 10px",
    borderRadius: "6px",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  section: {
    padding: "30px",
    borderRadius: "16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "30px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    paddingBottom: "16px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "400",
    color: "var(--text-primary)",
    margin: 0,
  },
  searchInput: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "var(--text-primary)",
    outline: "none",
    width: "250px",
    fontSize: "14px",
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  menuCard: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255,255,255,0.03)",
    borderRadius: "12px",
    padding: "20px",
  },
  menuContent: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  menuHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "10px",
  },
  dishName: {
    fontSize: "17px",
    fontWeight: "500",
    color: "var(--text-primary)",
    margin: 0,
  },
  dishPrice: {
    fontSize: "16px",
    color: "var(--accent-gold)",
    fontWeight: "600",
  },
  dishDescription: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
  },
  doubleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
  },
  sideSection: {
    padding: "30px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
  },
  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  selectIcon: {
    position: "absolute",
    left: "16px",
    color: "var(--text-secondary)",
  },
  select: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
  },
  selectSmall: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "14px",
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    minHeight: "100px",
    resize: "vertical",
  },
  button: {
    padding: "14px",
    backgroundColor: "var(--accent-gold)",
    color: "var(--bg-primary)",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    boxShadow: "0 4px 15px rgba(226,184,85,0.15)",
  },
  loginPrompt: {
    textAlign: "center",
    padding: "30px 20px",
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px dashed rgba(255,255,255,0.08)",
    borderRadius: "12px",
  },
  promptText: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    marginBottom: "16px",
  },
  loginLinkBtn: {
    display: "inline-block",
    padding: "8px 24px",
    backgroundColor: "rgba(226,184,85,0.1)",
    color: "var(--accent-gold)",
    textDecoration: "none",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid rgba(226,184,85,0.2)",
    transition: "background-color 0.2s ease",
  },
  bookingsListContainer: {
    marginTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: "20px",
  },
  bookingCardsStack: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "12px",
  },
  bookingRowCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxHeight: "350px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  reviewCard: {
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.03)",
    borderRadius: "10px",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  reviewAuthor: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text-primary)",
  },
  reviewRating: {
    fontSize: "13px",
    color: "var(--accent-gold)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  reviewText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
    fontStyle: "italic",
  },
  subheading: {
    fontSize: "16px",
    fontWeight: "500",
    color: "var(--text-primary)",
    margin: "0 0 12px 0",
  },
  emptyText: {
    fontSize: "14px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  statusText: {
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "18px",
    marginTop: "100px",
  },
  messageBanner: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--accent-gold)",
    padding: "16px 24px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    zIndex: 2000,
    fontSize: "14px",
    fontWeight: "500",
    animation: "fadeIn 0.3s ease",
  }
};

export default RestaurantDetails;
