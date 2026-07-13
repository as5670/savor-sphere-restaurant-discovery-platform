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
        const [result] = await db.query(query, [name, email, hashedPassword]);
        const insertId = result.insertId;

        // Generate JWT token for auto-login
        const token = jwt.sign({ userId: insertId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ 
            message: "User registered successfully", 
            token,
            user: { id: insertId, name, email }
        });
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.json({ 
                message: "Login successful", 
                token, 
                user: { id: user.id, name: user.name, email: user.email } 
            });
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

// ✅ Get User Recommendations (Simple Collaborative Filtering based on past booking cuisines)
router.get("/:id/recommendations", async (req, res) => {
    const userId = req.params.id;
    try {
        // Find cuisines user has previously booked
        const [userCuisines] = await db.query(
            "SELECT DISTINCT r.cuisine FROM reservation1 res JOIN restaurants r ON res.restaurant_id = r.id WHERE res.user_id = ?",
            [userId]
        );

        let query = "SELECT * FROM restaurants";
        const params = [];

        if (userCuisines.length > 0) {
            // Find restaurants of the same cuisines that the user hasn't reserved yet, sorted by rating
            const cuisines = userCuisines.map(c => c.cuisine);
            query = "SELECT * FROM restaurants WHERE cuisine IN (?) AND id NOT IN (SELECT DISTINCT restaurant_id FROM reservation1 WHERE user_id = ?) ORDER BY rating DESC LIMIT 4";
            params.push(cuisines, userId);
        } else {
            // Fallback: recommend top 4 restaurants overall
            query = "SELECT * FROM restaurants ORDER BY rating DESC LIMIT 4";
        }

        const [results] = await db.query(query, params);
        
        // Pad with top-rated fallback if collaborative matches are sparse
        if (results.length < 3 && userCuisines.length > 0) {
            const [fallbackResults] = await db.query(
                "SELECT * FROM restaurants WHERE id NOT IN (SELECT DISTINCT restaurant_id FROM reservation1 WHERE user_id = ?) ORDER BY rating DESC LIMIT 4",
                [userId]
            );
            const combined = [...results, ...fallbackResults];
            const unique = Array.from(combined.reduce((map, item) => map.set(item.id, item), new Map()).values()).slice(0, 4);
            return res.json(unique);
        }

        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to load recommendations" });
    }
});

module.exports = router;
