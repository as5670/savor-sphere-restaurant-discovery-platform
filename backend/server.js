const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const reservationRoutes = require("./routes/reservationRoutes");  // ✅ Make sure this is correct!

const dbInit = require("./dbInit");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ✅ Register Routes
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/reservations", reservationRoutes); // ✅ Corrected!

// ✅ Start Server
app.listen(5000, async () => {
    console.log("🚀 Backend running on http://localhost:5000");
    await dbInit();
});

// Get menu/dishes for a restaurant
app.get('/api/restaurants/:id/menu', async (req, res) => {
    const restaurantId = req.params.id;
    const query = 'SELECT * FROM dishes WHERE restaurant_id = ?';

    try {
        const [results] = await db.query(query, [restaurantId]);
        res.json(results);
    } catch (err) {
        console.error('Error fetching dishes:', err);
        return res.status(500).json({ error: 'Failed to fetch dishes' });
    }
});

// Database Diagnostic Status Check
app.get('/api/db-status', async (req, res) => {
    try {
        const [tables] = await db.query("SHOW TABLES");
        const status = {};
        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [[{ count }]] = await db.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            status[tableName] = count;
        }
        res.json({ connection: "success", tables: status });
    } catch (err) {
        res.status(500).json({ connection: "failed", error: err.message });
    }
});
