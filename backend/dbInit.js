const db = require("./config");

async function initializeDatabase() {
  console.log("🛠️ Starting database auto-initialization...");
  try {
    // 1. Create Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    // 2. Create Restaurants Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cuisine VARCHAR(255) NOT NULL,
        price_ranges VARCHAR(50) NOT NULL,
        rating DECIMAL(3,2) DEFAULT 0.00,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        image_url VARCHAR(1000)
      )
    `);

    // 3. Create Dishes Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS dishes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        image_url VARCHAR(1000),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    // 4. Create Reviews Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 5. Create Reservation1 Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reservation1 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        guests INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    // Seed mock data if restaurants table is empty
    const [existingRestaurants] = await db.query("SELECT COUNT(*) as count FROM restaurants");
    if (existingRestaurants[0].count === 0) {
      console.log("🌱 Seeding mock restaurant and dish data...");
      
      const restaurants = [
        {
          name: "Trattoria Bella",
          cuisine: "Italian",
          price_ranges: "$$",
          rating: 4.5,
          latitude: 40.7128,
          longitude: -74.0060,
          image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"
        },
        {
          name: "Sakura Sushi",
          cuisine: "Japanese",
          price_ranges: "$$$",
          rating: 4.8,
          latitude: 40.7250,
          longitude: -74.0100,
          image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600"
        },
        {
          name: "The Burger Joint",
          cuisine: "American",
          price_ranges: "$",
          rating: 4.2,
          latitude: 40.7300,
          longitude: -73.9950,
          image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
        }
      ];

      for (const r of restaurants) {
        const [result] = await db.query(
          "INSERT INTO restaurants (name, cuisine, price_ranges, rating, latitude, longitude, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [r.name, r.cuisine, r.price_ranges, r.rating, r.latitude, r.longitude, r.image_url]
        );
        const insertId = result.insertId;

        if (r.cuisine === "Italian") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Margherita Pizza', 14.99, 'Classic tomato, mozzarella, and fresh basil.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Fettuccine Alfredo', 16.99, 'Creamy parmesan sauce with fettuccine pasta.')", [insertId]);
        } else if (r.cuisine === "Japanese") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Signature Sushi Platter', 29.99, 'Chef selection of 10 pieces of premium sushi.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Tonkotsu Ramen', 15.99, 'Rich pork bone broth, chashu pork, and soft egg.')", [insertId]);
        } else if (r.cuisine === "American") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Classic Cheeseburger', 9.99, 'Beef patty, cheddar, lettuce, tomato, special sauce.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Truffle Fries', 5.99, 'Crispy fries tossed in truffle oil and parmesan.')", [insertId]);
        }
      }
      console.log("✅ Seeding completed!");
    }
    console.log("🎉 Database initialization completed successfully!");
  } catch (err) {
    console.error("❌ Database auto-initialization failed:", err.message);
  }
}

module.exports = initializeDatabase;
