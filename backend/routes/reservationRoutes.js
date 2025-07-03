const express = require("express");
const db = require("../config");

const router = express.Router();

// ✅ Make a reservation
router.post("/", (req, res) => {
    const { user_id, restaurant_id, date, time, guests } = req.body;

    const query = `
        INSERT INTO reservation1 (user_id, restaurant_id, date, time, guests)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [user_id, restaurant_id, date, time, guests], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Reservation successful" });
    });
});

// ✅ Get reservations for a restaurant
router.get("/restaurant/:id", (req, res) => {
    const restaurantId = req.params.id;

    db.query("SELECT * FROM reservation1 WHERE restaurant_id = ?", [restaurantId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ✅ Get reservations for a user
router.get("/user/:id", (req, res) => {
    const userId = req.params.id;

    db.query("SELECT * FROM reservation1 WHERE user_id = ?", [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ✅ Cancel a reservation
router.delete("/:id", (req, res) => {
    const reservationId = req.params.id;

    db.query("DELETE FROM reservation1 WHERE id = ?", [reservationId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Reservation canceled successfully" });
    });
});

module.exports = router;
