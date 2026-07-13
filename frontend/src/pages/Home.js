import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div style={styles.container}>
            <div style={styles.overlay}>
                <div style={styles.contentBox} className="glass-card animate-fade">
                    <span style={styles.badge}>SAVORSPHERE PLATFORM</span>
                    <h1 style={styles.heading}>
                        A Premium Dining <br />
                        <span style={{ color: "var(--accent-gold)" }}>Discovery Experience</span>
                    </h1>
                    <p style={styles.description}>
                        Discover exceptional local culinary spots, view real-time menus, and reserve tables instantly. Your dining journey reimagined.
                    </p>

                    <div style={styles.buttonContainer}>
                        <Link to="/restaurants" style={styles.primaryLink}>
                            Explore Restaurants
                        </Link>
                        <Link to="/login" style={styles.secondaryLink}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundImage: "linear-gradient(135deg, rgba(9,10,15,0.9) 30%, rgba(18,20,32,0.6)), url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        padding: "20px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    contentBox: {
        textAlign: "center",
        maxWidth: "680px",
        padding: "60px 40px",
        borderRadius: "24px",
    },
    badge: {
        color: "var(--accent-gold)",
        fontSize: "12px",
        fontWeight: "600",
        letterSpacing: "3px",
        textTransform: "uppercase",
        display: "inline-block",
        marginBottom: "24px",
        backgroundColor: "rgba(226,184,85,0.1)",
        padding: "6px 16px",
        borderRadius: "30px",
    },
    heading: {
        fontSize: "48px",
        fontWeight: "400",
        lineHeight: "1.2",
        letterSpacing: "-0.5px",
        marginBottom: "24px",
        color: "var(--text-primary)",
    },
    description: {
        fontSize: "17px",
        color: "var(--text-secondary)",
        lineHeight: "1.6",
        marginBottom: "40px",
    },
    buttonContainer: {
        display: "flex",
        gap: "16px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    primaryLink: {
        padding: "14px 32px",
        fontSize: "15px",
        fontWeight: "600",
        borderRadius: "30px",
        backgroundColor: "var(--accent-gold)",
        color: "var(--bg-primary)",
        textDecoration: "none",
        transition: "background-color 0.2s ease, transform 0.2s ease",
        boxShadow: "0 4px 15px rgba(226,184,85,0.2)",
    },
    secondaryLink: {
        padding: "14px 32px",
        fontSize: "15px",
        fontWeight: "600",
        borderRadius: "30px",
        backgroundColor: "rgba(255,255,255,0.05)",
        color: "var(--text-primary)",
        textDecoration: "none",
        transition: "background-color 0.2s ease",
        border: "1px solid rgba(255,255,255,0.1)",
    },
};

export default Home;
