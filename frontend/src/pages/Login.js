import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                onLoginSuccess(data.user);
                navigate("/restaurants");
            } else {
                alert(data.message || "Invalid credentials.");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to connect to backend server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox} className="glass-card animate-fade">
                <h2 style={styles.heading}>Welcome Back</h2>
                <p style={styles.subheading}>Sign in to your account</p>
                <form onSubmit={handleLogin}>
                    <div style={styles.inputContainer}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputContainer}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
                <p style={styles.footerText}>
                    Don't have an account?{" "}
                    <Link to="/register" style={styles.footerLink}>
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: "calc(100vh - 80px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--bg-primary)",
    },
    loginBox: {
        padding: "50px 40px",
        borderRadius: "20px",
        width: "360px",
        textAlign: "center",
    },
    heading: {
        color: "var(--text-primary)",
        marginBottom: "8px",
        fontSize: "28px",
        fontWeight: "400",
    },
    subheading: {
        color: "var(--text-secondary)",
        fontSize: "14px",
        marginBottom: "36px",
    },
    inputContainer: {
        marginBottom: "16px",
    },
    input: {
        width: "100%",
        padding: "14px 16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        color: "var(--text-primary)",
        fontSize: "15px",
        outline: "none",
        transition: "border-color 0.2s ease",
    },
    button: {
        width: "100%",
        padding: "14px",
        backgroundColor: "var(--accent-gold)",
        color: "var(--bg-primary)",
        border: "none",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.2s ease, transform 0.2s ease",
        marginTop: "16px",
        boxShadow: "0 4px 15px rgba(226,184,85,0.15)",
    },
    footerText: {
        color: "var(--text-secondary)",
        fontSize: "14px",
        marginTop: "24px",
    },
    footerLink: {
        color: "var(--accent-gold)",
        textDecoration: "none",
        fontWeight: "500",
    },
};

export default Login;
