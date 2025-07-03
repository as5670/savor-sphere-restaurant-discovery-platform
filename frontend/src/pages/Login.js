import React, { useState } from "react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.token) {
            alert("Login successful!");
            localStorage.setItem("token", data.token);
        } else {
            alert("Login failed. Check your credentials.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h2 style={styles.heading}>Login</h2>
                <form onSubmit={handleLogin}>
                    <div style={styles.inputContainer}>
                        <input
                            type="email"
                            placeholder="Email"
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
                    <button type="submit" style={styles.button}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

// Inline styles
const styles = {
    container: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212", // Black background
    },
    loginBox: {
        backgroundColor: "#1d1d1d", // Dark gray for form box
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
        width: "300px",
        textAlign: "center",
    },
    heading: {
        color: "#fff",
        marginBottom: "20px",
        fontSize: "24px",
    },
    inputContainer: {
        marginBottom: "15px",
    },
    input: {
        width: "100%",
        padding: "12px",
        margin: "10px 0",
        border: "1px solid #333",
        borderRadius: "5px",
        backgroundColor: "#222",
        color: "#fff",
        fontSize: "16px",
        transition: "all 0.3s ease",
    },
    inputFocus: {
        borderColor: "#3b3b3b",
        outline: "none",
    },
    button: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#ff5f57", // Accent color for button
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
};

export default Login;

