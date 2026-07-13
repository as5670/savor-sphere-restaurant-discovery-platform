const express = require("express");
const db = require("../config");
const authMiddleware = require("../authMiddleware");
const router = express.Router();

// ✅ Get All Restaurants with Advanced Filters + Distance Calculation
router.get("/", async (req, res) => {
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

    try {
        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Get Restaurant by ID + Dishes
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const restaurantQuery = "SELECT * FROM restaurants WHERE id = ?";
    const dishesQuery = "SELECT * FROM dishes WHERE restaurant_id = ?";

    try {
        const [restaurantResults] = await db.query(restaurantQuery, [id]);
        if (restaurantResults.length === 0) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const [dishesResults] = await db.query(dishesQuery, [id]);
        res.json({ ...restaurantResults[0], dishes: dishesResults });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Get Reviews for a Restaurant
router.get("/:id/reviews", async (req, res) => {
    const restaurantId = req.params.id;

    try {
        const [result] = await db.query(
            "SELECT user_name, rating, comment, created_at FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC",
            [restaurantId]
        );
        res.json(result);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Submit a Review (Protected by JWT)
router.post("/:id/reviews", authMiddleware, async (req, res) => {
    const restaurantId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    // Input Validation
    const parsedRating = Number(rating);
    if (rating === undefined || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5 || !Number.isInteger(parsedRating)) {
        return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    if (!comment || typeof comment !== "string" || comment.trim() === "") {
        return res.status(400).json({ error: "Comment is required" });
    }

    try {
        // Fetch user name securely from the database using userId from JWT
        const [users] = await db.query("SELECT name FROM users WHERE id = ?", [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user_name = users[0].name;

        await db.query(
            "INSERT INTO reviews (restaurant_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)",
            [restaurantId, userId, user_name, parsedRating, comment.trim()]
        );
        res.json({ message: "Review submitted successfully!" });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Get All Reservations for a Restaurant (Table name fixed to reservation1)
router.get("/:id/reservations", async (req, res) => {
    const restaurantId = req.params.id;

    try {
        const [results] = await db.query(
            "SELECT * FROM reservation1 WHERE restaurant_id = ?",
            [restaurantId]
        );
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Book a Table Reservation (Protected by JWT, Table name fixed to reservation1)
router.post("/:id/reservations", authMiddleware, async (req, res) => {
    const restaurantId = req.params.id;
    const { date, time, guests } = req.body;
    const userId = req.user.userId;

    // Input Validation
    const parsedGuests = Number(guests);
    if (guests === undefined || isNaN(parsedGuests) || parsedGuests <= 0 || !Number.isInteger(parsedGuests)) {
        return res.status(400).json({ error: "Guests must be a positive integer" });
    }

    if (!date || isNaN(Date.parse(date))) {
        return res.status(400).json({ error: "A valid date is required" });
    }

    if (!time || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
        return res.status(400).json({ error: "A valid time (HH:MM) is required" });
    }

    try {
        await db.query(
            "INSERT INTO reservation1 (user_id, restaurant_id, date, time, guests) VALUES (?, ?, ?, ?, ?)",
            [userId, restaurantId, date, time, parsedGuests]
        );
        res.json({ message: "Table reserved successfully!" });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
