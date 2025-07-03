const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config");

const router = express.Router();

// ✅ User Registration API
router.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    // Hash password before storing
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: "Error hashing password" });
        }

        const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err });
            }
            res.status(201).json({ message: "User registered successfully" });
        });
    });
});

// ✅ User Login API
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];

        // Compare hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (isMatch) {
                // Generate JWT token
                const token = jwt.sign({ userId: user.id }, "secretKey", { expiresIn: "1h" });
                res.json({ message: "Login successful", token });
            } else {
                res.status(401).json({ message: "Invalid email or password" });
            }
        });
    });
});

// ✅ Get User Details by ID
router.get("/:id", (req, res) => {
    const userId = req.params.id;
    db.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(result[0]);
    });
});

// ✅ Get User Reservations
router.get("/:id/reservations", (req, res) => {
    const userId = req.params.id;
    db.query("SELECT * FROM reservation1 WHERE user_id = ?", [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        return res.json(result);
    });
});

// ✅ Get User Reviews
router.get("/:id/reviews", (req, res) => {
    const userId = req.params.id;
    db.query("SELECT * FROM reviews WHERE user_id = ?", [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        return res.json(result);
    });
});

module.exports = router;


