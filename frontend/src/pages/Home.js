import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div style={styles.background}>
            <div style={styles.overlay}>
                <div style={styles.content}>
                    <h1 style={styles.heading}>Welcome to SavorSphere</h1>
                    <p style={styles.description}>
                        Your personalized restaurant recommendation app.
                    </p>

                    <div style={styles.buttonContainer}>
                        <Link to="/login">
                            <button style={styles.button}>Login</button>
                        </Link>
                        <Link to="/register">
                            <button style={styles.button}>Register</button>
                        </Link>
                        <Link to="/restaurants">
                            <button style={styles.button}>View Restaurants</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    background: {
        backgroundImage:
            "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    content: {
        textAlign: "center",
        color: "#fff",
        padding: "20px",
    },
    heading: {
        fontSize: "48px",
        fontWeight: "bold",
        marginBottom: "20px",
    },
    description: {
        fontSize: "20px",
        marginBottom: "40px",
        maxWidth: "600px",
        marginInline: "auto",
    },
    buttonContainer: {
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    button: {
        padding: "14px 28px",
        fontSize: "16px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#ff5f57",
        color: "#fff",
        cursor: "pointer",
        transition: "transform 0.2s ease, background-color 0.3s ease",
    },
};

export default Home;

