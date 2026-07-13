import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const UserProfile = ({ user: globalUser, onLogout }) => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const fetchReservations = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${id}/reservations`);
            setReservations(await res.json());
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        // Redirect if not logged in or viewing another user's profile
        if (!globalUser || globalUser.id.toString() !== id.toString()) {
            navigate("/login");
            return;
        }

        const fetchProfileData = async () => {
            try {
                const [profileRes, reviewsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/users/${id}`),
                    fetch(`${API_BASE_URL}/api/users/${id}/reviews`)
                ]);

                if (!profileRes.ok) throw new Error("Failed to load profile.");
                
                setProfile(await profileRes.json());
                setReviews(await reviewsRes.json());
                await fetchReservations();
            } catch (err) {
                setError(err.message);
            }
        };

        fetchProfileData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, globalUser]);

    const handleCancelReservation = async (reservationId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (!window.confirm("Are you sure you want to cancel this reservation?")) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/reservations/${reservationId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Reservation canceled successfully!");
                await fetchReservations();
            } else {
                setMessage(`❌ ${data.error || "Failed to cancel reservation."}`);
            }
        } catch (err) {
            setMessage("❌ Server error canceling reservation.");
        }
    };

    if (error) return <p style={styles.errorText}>Error: {error}</p>;
    if (!profile) return <p style={styles.statusText}>Loading profile dashboard...</p>;

    return (
        <div style={styles.container} className="animate-fade">
            <h2 style={styles.title}>User Dashboard</h2>

            {/* Profile Info */}
            <div style={styles.profileSection} className="glass-card">
                <div style={styles.avatar}>
                    {profile.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.profileMeta}>
                    <h3 style={styles.profileName}>{profile.name}</h3>
                    <p style={styles.profileEmail}>📧 {profile.email}</p>
                </div>
            </div>

            {/* Double Column Grid */}
            <div style={styles.dashboardGrid}>
                {/* Active Bookings Column */}
                <div style={styles.columnCard} className="glass-card">
                    <h3 style={styles.columnTitle}>Your Reservations</h3>
                    {reservations.length > 0 ? (
                        <div style={styles.bookingStack}>
                            {reservations.map((res) => (
                                <div key={res.id} style={styles.bookingCard}>
                                    <div style={styles.bookingDetails}>
                                        <p style={styles.bookingTitle}>Restaurant ID: #{res.restaurant_id}</p>
                                        <p style={styles.bookingMeta}>📅 {res.date} at {res.time.substring(0, 5)}</p>
                                        <p style={styles.bookingMeta}>👥 {res.guests} guests</p>
                                    </div>
                                    <button 
                                        onClick={() => handleCancelReservation(res.id)} 
                                        style={styles.cancelBtn}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={styles.emptyText}>No upcoming bookings.</p>
                    )}
                </div>

                {/* Submitted Reviews Column */}
                <div style={styles.columnCard} className="glass-card">
                    <h3 style={styles.columnTitle}>Your Reviews</h3>
                    {reviews.length > 0 ? (
                        <div style={styles.reviewStack}>
                            {reviews.map((review) => (
                                <div key={review.id} style={styles.reviewCard}>
                                    <div style={styles.reviewMeta}>
                                        <span style={styles.reviewRating}>★ {review.rating}</span>
                                        <span style={styles.reviewDate}>Restaurant #{review.restaurant_id}</span>
                                    </div>
                                    <p style={styles.reviewComment}>"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={styles.emptyText}>No reviews posted yet.</p>
                    )}
                </div>
            </div>

            {message && <div style={styles.messageBanner}>{message}</div>}
        </div>
    );
};

const styles = {
    container: {
        padding: "40px 80px",
        backgroundColor: "var(--bg-primary)",
        minHeight: "calc(100vh - 80px)",
        color: "var(--text-primary)",
    },
    title: {
        fontSize: "32px",
        fontWeight: "400",
        textAlign: "center",
        marginBottom: "40px",
        letterSpacing: "-0.5px",
    },
    profileSection: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
        padding: "30px",
        maxWidth: "800px",
        margin: "0 auto 40px",
        borderRadius: "20px",
    },
    avatar: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        backgroundColor: "rgba(226,184,85,0.15)",
        color: "var(--accent-gold)",
        fontSize: "30px",
        fontWeight: "600",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid rgba(226,184,85,0.3)",
    },
    profileMeta: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    profileName: {
        fontSize: "22px",
        fontWeight: "500",
        margin: 0,
    },
    profileEmail: {
        fontSize: "14px",
        color: "var(--text-secondary)",
    },
    dashboardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    columnCard: {
        padding: "30px",
        borderRadius: "20px",
        minHeight: "400px",
    },
    columnTitle: {
        fontSize: "20px",
        fontWeight: "500",
        marginBottom: "24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        paddingBottom: "12px",
    },
    bookingStack: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    bookingCard: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        backgroundColor: "rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.03)",
        borderRadius: "12px",
    },
    bookingDetails: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    bookingTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "var(--text-primary)",
    },
    bookingMeta: {
        fontSize: "13px",
        color: "var(--text-secondary)",
    },
    cancelBtn: {
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "rgba(255, 95, 87, 0.1)",
        color: "var(--accent-crimson)",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        border: "1px solid rgba(255, 95, 87, 0.2)",
    },
    reviewStack: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    reviewCard: {
        padding: "16px",
        backgroundColor: "rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.03)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    reviewMeta: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    reviewRating: {
        fontSize: "12px",
        fontWeight: "600",
        color: "var(--accent-gold)",
        backgroundColor: "rgba(226,184,85,0.1)",
        padding: "2px 8px",
        borderRadius: "6px",
    },
    reviewDate: {
        fontSize: "12px",
        color: "var(--text-muted)",
    },
    reviewComment: {
        fontSize: "13px",
        color: "var(--text-secondary)",
        fontStyle: "italic",
        lineHeight: "1.4",
    },
    emptyText: {
        color: "var(--text-muted)",
        fontSize: "14px",
        textAlign: "center",
        marginTop: "40px",
    },
    statusText: {
        color: "var(--text-secondary)",
        fontSize: "16px",
        textAlign: "center",
        marginTop: "100px",
    },
    errorText: {
        color: "var(--accent-crimson)",
        fontSize: "16px",
        textAlign: "center",
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

export default UserProfile;
