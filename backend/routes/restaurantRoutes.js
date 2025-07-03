const express = require("express");
const db = require("../config");
const router = express.Router();

// ✅ Get All Restaurants with Advanced Filters + Distance Calculation
router.get("/", (req, res) => {
    const { cuisine, price, rating, maxDistance, userLat, userLng } = req.query;

    let query = `
        SELECT *, (
            6371 * acos(
                cos(radians(?)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) * sin(radians(latitude))
            )
        ) AS distance
        FROM restaurants
        WHERE 1=1
    `;
    const params = [userLat || 0, userLng || 0, userLat || 0];

    if (cuisine) {
        query += " AND LOWER(cuisine) LIKE ?";
        params.push(`%${cuisine.toLowerCase()}%`);
    }

    if (price) {
        query += " AND price_ranges = ?";
        params.push(price);
    }

    if (rating) {
        query += " AND rating >= ?";
        params.push(rating);
    }

    // Wrap and filter by distance if provided
    if (maxDistance) {
        query = `SELECT * FROM (${query}) AS subquery WHERE distance <= ?`;
        params.push(parseFloat(maxDistance));
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ✅ Get Restaurant by ID + Dishes
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const restaurantQuery = "SELECT * FROM restaurants WHERE id = ?";
    const dishesQuery = "SELECT * FROM dishes WHERE restaurant_id = ?";

    db.query(restaurantQuery, [id], (err, restaurantResults) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (restaurantResults.length === 0) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        db.query(dishesQuery, [id], (err, dishesResults) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            res.json({ ...restaurantResults[0], dishes: dishesResults });
        });
    });
});

// ✅ Get Reviews for a Restaurant
router.get("/:id/reviews", (req, res) => {
    const restaurantId = req.params.id;

    db.query(
        "SELECT user_name, rating, comment, created_at FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC",
        [restaurantId],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json(result);
        }
    );
});

// ✅ Submit a Review
router.post("/:id/reviews", (req, res) => {
    const restaurantId = req.params.id;
    const { user_name, rating, comment } = req.body;

    if (!user_name || !rating || !comment) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.query(
        "INSERT INTO reviews (restaurant_id, user_name, rating, comment) VALUES (?, ?, ?, ?)",
        [restaurantId, user_name, rating, comment],
        (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Review submitted successfully!" });
        }
    );
});

// ✅ Get All Reservations for a Restaurant
router.get("/:id/reservations", (req, res) => {
    const restaurantId = req.params.id;

    db.query(
        "SELECT * FROM reservations1 WHERE restaurant_id = ?",
        [restaurantId],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json(results);
        }
    );
});

// ✅ Book a Table Reservation
router.post("/:id/reservations", (req, res) => {
    const restaurantId = req.params.id;
    const { user_id, date, time, guests } = req.body;

    if (!user_id || !date || !time || !guests) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.query(
        "INSERT INTO reservations1 (user_id, restaurant_id, date, time, guests) VALUES (?, ?, ?, ?, ?)",
        [user_id, restaurantId, date, time, guests],
        (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Table reserved successfully!" });
        }
    );
});

module.exports = router;
