const express = require("express");
const db = require("../config");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

// ✅ Make a reservation (Protected by JWT)
router.post("/", authMiddleware, async (req, res) => {
    const { restaurant_id, date, time, guests } = req.body;
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

    if (!restaurant_id) {
        return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const query = `
        INSERT INTO reservation1 (user_id, restaurant_id, date, time, guests)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        await db.query(query, [userId, restaurant_id, date, time, parsedGuests]);
        res.status(201).json({ message: "Reservation successful" });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Get reservations for a restaurant
router.get("/restaurant/:id", async (req, res) => {
    const restaurantId = req.params.id;

    try {
        const [results] = await db.query("SELECT * FROM reservation1 WHERE restaurant_id = ?", [restaurantId]);
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Get reservations for a user
router.get("/user/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const [results] = await db.query("SELECT * FROM reservation1 WHERE user_id = ?", [userId]);
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Cancel a reservation (Protected by JWT & Ownership Check)
router.delete("/:id", authMiddleware, async (req, res) => {
    const reservationId = req.params.id;
    const userId = req.user.userId;

    try {
        // 1. Fetch reservation user_id to verify ownership
        const [results] = await db.query("SELECT user_id FROM reservation1 WHERE id = ?", [reservationId]);
        
        if (results.length === 0) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        // 2. Check ownership
        if (results[0].user_id !== userId) {
            return res.status(403).json({ error: "You are not authorized to cancel this reservation" });
        }

        // 3. Delete the reservation
        await db.query("DELETE FROM reservation1 WHERE id = ?", [reservationId]);
        res.json({ message: "Reservation canceled successfully" });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
