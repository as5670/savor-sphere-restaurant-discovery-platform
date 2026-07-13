const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config");

const router = express.Router();

// ✅ User Registration API
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        await db.query(query, [name, email, hashedPassword]);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: "Database error", error: err });
    }
});

// ✅ User Login API
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const query = "SELECT id, name, email, password FROM users WHERE email = ?";
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // Generate JWT token using rotated secret
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.json({ message: "Login successful", token });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Database error" });
    }
});

// ✅ Get User Details by ID (Stop SELECT * - return only id, name, email)
router.get("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const [result] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [userId]);
        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(result[0]);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Get User Reservations (Unify table name to reservation1)
router.get("/:id/reservations", async (req, res) => {
    const userId = req.params.id;
    try {
        const [result] = await db.query("SELECT * FROM reservation1 WHERE user_id = ?", [userId]);
        return res.json(result);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Get User Reviews
router.get("/:id/reviews", async (req, res) => {
    const userId = req.params.id;
    try {
        const [result] = await db.query("SELECT * FROM reviews WHERE user_id = ?", [userId]);
        return res.json(result);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
