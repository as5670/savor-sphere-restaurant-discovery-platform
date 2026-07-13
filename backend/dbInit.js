const db = require("./config");
const bcrypt = require("bcryptjs");

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

    // Seed mock user John Doe first to prevent foreign key errors on reservation seeding
    const hashedPassword = await bcrypt.hash("pass123", 10);
    const [existingUsers] = await db.query("SELECT COUNT(*) as count FROM users");
    let userId = 1;
    if (existingUsers[0].count === 0) {
      const [result] = await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        ["John Doe", "john@example.com", hashedPassword]
      );
      userId = result.insertId;
    } else {
      const [users] = await db.query("SELECT id FROM users LIMIT 1");
      userId = users[0].id;
    }

    // Check restaurant count to determine if we should clear and re-seed 10 premium restaurants in India
    const [existingRestaurants] = await db.query("SELECT COUNT(*) as count FROM restaurants");
    if (existingRestaurants[0].count < 12) {
      console.log("🌱 Seeding/Resetting premium restaurant and dish database (India Locations)...");
      
      // Safe truncate under foreign keys
      await db.query("SET FOREIGN_KEY_CHECKS = 0");
      await db.query("TRUNCATE TABLE dishes");
      await db.query("TRUNCATE TABLE restaurants");
      await db.query("SET FOREIGN_KEY_CHECKS = 1");

      // Seeded coordinates spread around New Delhi, India area (Latitude: 28.6139, Longitude: 77.2090)
      const restaurants = [
        {
          name: "Trattoria Bella",
          cuisine: "Italian",
          price_ranges: "$$",
          rating: 4.6,
          latitude: 28.6139,
          longitude: 77.2090,
          image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"
        },
        {
          name: "Sakura Sushi",
          cuisine: "Japanese",
          price_ranges: "$$$",
          rating: 4.8,
          latitude: 28.6250,
          longitude: 77.2200,
          image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600"
        },
        {
          name: "The Burger Joint",
          cuisine: "American",
          price_ranges: "$",
          rating: 4.2,
          latitude: 28.6300,
          longitude: 77.2150,
          image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
        },
        {
          name: "La Maison",
          cuisine: "French",
          price_ranges: "$$$",
          rating: 4.9,
          latitude: 28.6410,
          longitude: 77.2020,
          image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600"
        },
        {
          name: "Taj Mahal Palace",
          cuisine: "Indian",
          price_ranges: "$$",
          rating: 4.7,
          latitude: 28.6190,
          longitude: 77.1920,
          image_url: "https://images.unsplash.com/photo-1585938338392-50a59970d2ee?w=600"
        },
        {
          name: "El Camino",
          cuisine: "Mexican",
          price_ranges: "$$",
          rating: 4.4,
          latitude: 28.6340,
          longitude: 77.2080,
          image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"
        },
        {
          name: "Golden Dragon",
          cuisine: "Chinese",
          price_ranges: "$$",
          rating: 4.3,
          latitude: 28.6150,
          longitude: 77.1980,
          image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600"
        },
        {
          name: "Zeus Greek Tavern",
          cuisine: "Greek",
          price_ranges: "$$",
          rating: 4.5,
          latitude: 28.6220,
          longitude: 77.2010,
          image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600"
        },
        {
          name: "Siam Garden",
          cuisine: "Thai",
          price_ranges: "$$",
          rating: 4.6,
          latitude: 28.6280,
          longitude: 77.2040,
          image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600"
        },
        {
          name: "Tapas Barcelona",
          cuisine: "Spanish",
          price_ranges: "$$$",
          rating: 4.7,
          latitude: 28.6370,
          longitude: 77.1980,
          image_url: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600"
        }
      ];

      for (const r of restaurants) {
        const [result] = await db.query(
          "INSERT INTO restaurants (name, cuisine, price_ranges, rating, latitude, longitude, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [r.name, r.cuisine, r.price_ranges, r.rating, r.latitude, r.longitude, r.image_url]
        );
        const insertId = result.insertId;

        if (r.cuisine === "Italian") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Margherita Pizza', 14.99, 'Classic fresh mozzarella, plum tomato, and sweet basil leaves on stone-baked crust.', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Fettuccine Alfredo', 16.99, 'Rich, creamy parmesan and white wine butter sauce served over house-made pasta.', 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Tiramisu', 8.99, 'Ladyfingers dipped in espresso, layered with whipped mascarpone cheese and cocoa.', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500')", [insertId]);
        } else if (r.cuisine === "Japanese") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Signature Sushi Platter', 29.99, 'Premium chef selection of nigiri, sashimi, and custom house rolls served with real wasabi.', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Tonkotsu Ramen', 15.99, '48-hour slow-cooked rich pork bone broth with chashu, nori, bamboo shoots, and a soft-boiled egg.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Mochi Ice Cream', 6.99, 'Assorted green tea, mango, and strawberry mochi ice cream bites.', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500')", [insertId]);
        } else if (r.cuisine === "American") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Classic Cheeseburger', 9.99, 'Premium dry-aged beef patty, double cheddar, caramelized onions, and house special sauce.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Truffle Fries', 5.99, 'Hand-cut russet potatoes double-fried and tossed in white truffle oil, rosemary, and aged parmesan.', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Chocolate Milkshake', 6.49, 'Thick and creamy double-chocolate milkshake topped with fresh whipped cream.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500')", [insertId]);
        } else if (r.cuisine === "French") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Coq au Vin', 24.99, 'Traditional French chicken braised in red Burgundy wine, mushrooms, and lardon.', 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Crème Brûlée', 8.99, 'Rich custard base topped with a texturally contrastive layer of hardened caramelized sugar.', 'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Escargot', 14.99, 'Six wild Burgundy snails baked in their shells with garlic, parsley, and butter.', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500')", [insertId]);
        } else if (r.cuisine === "Indian") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Butter Chicken', 16.99, 'Tender tandoori grilled chicken cooked in a rich, velvety spiced tomato and cashew butter gravy.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Garlic Naan', 3.99, 'Fresh leavened flatbread baked in clay oven topped with garlic, cilantro, and pure ghee.', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Mango Lassi', 4.49, 'Chilled sweet yogurt drink blended with fresh sweet mango pulp.', 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=500')", [insertId]);
        } else if (r.cuisine === "Mexican") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Street Taco Platter', 12.99, 'Selection of premium carne asada, barbacoa, and al pastor tacos served on hand-pressed corn tortillas.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Churros with Chocolate', 6.99, 'Crispy golden fried dough dusted with cinnamon sugar and served with dark Oaxacan dipping chocolate.', 'https://images.unsplash.com/photo-1599908608044-b5b976503c9d?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Tres Leches Cake', 7.99, 'Sponge cake soaked in three kinds of milk, topped with whipped cream and fresh strawberries.', 'https://images.unsplash.com/photo-1608756687911-a1b540c6d16f?w=500')", [insertId]);
        } else if (r.cuisine === "Chinese") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Peking Duck', 28.99, 'Crispy skin roasted duck carved table-side, served with thin pancakes, hoisin sauce, and scallions.', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Dim Sum Basket', 14.99, 'Assorted handcrafted steamed dumplings including har gow (shrimp) and shao mai (pork).', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Kung Pao Chicken', 15.49, 'Stir-fried chicken breast cubes with peanuts, bell peppers, and chili peppers in savory sauce.', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500')", [insertId]);
        } else if (r.cuisine === "Greek") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Chicken Souvlaki', 15.99, 'Skewered tender chicken breast bites marinated in lemon and herbs, served with tzatziki and warm pita.', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Greek Salad', 11.99, 'Crisp cucumbers, vine tomatoes, red onions, kalamata olives, and block of premium Greek feta.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Baklava', 7.99, 'Layers of culinary golden phyllo pastry filled with chopped walnuts and honey syrup.', 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=500')", [insertId]);
        } else if (r.cuisine === "Thai") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Pad Thai', 14.49, 'Stir-fried thin rice noodles with tofu, egg, bean sprouts, crushed peanuts, and sweet tamarind.', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Green Curry', 15.99, 'Spicy coconut cream green curry with bamboo shoots, Thai eggplants, and sweet basil leaves.', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Mango Sticky Rice', 8.49, 'Fresh sweet yellow mango slices served over sweet coconut sticky rice.', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500')", [insertId]);
        } else if (r.cuisine === "Spanish") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Seafood Paella', 32.99, 'Traditional saffron-scented rice cooked with wild prawns, mussels, calamari, scallops, and sweet peas.', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Patatas Bravas', 9.99, 'Crispy fried potato cubes served with spicy tomato brava sauce and garlic aioli.', 'https://images.unsplash.com/photo-1582276546904-7471e1f1900b?w=500')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES (?, 'Sangria Pitcher', 21.99, 'Classic house-made Spanish red wine punch infused with citrus fruits and cinnamon.', 'https://images.unsplash.com/photo-1533630988607-e85f54f422e9?w=500')", [insertId]);
        }
      }
      console.log("✅ Seeding completed!");
    }

    // Seed historical reservations for the busy-time calculations
    const [existingReservations] = await db.query("SELECT COUNT(*) as count FROM reservation1");
    if (existingReservations[0].count === 0) {
      console.log("🌱 Seeding historical reservations for demand-prediction heatmap...");
      const reservations = [
        { user_id: userId, restaurant_id: 1, date: "2026-07-10", time: "19:00:00", guests: 4 },
        { user_id: userId, restaurant_id: 1, date: "2026-07-10", time: "20:00:00", guests: 6 },
        { user_id: userId, restaurant_id: 1, date: "2026-07-11", time: "19:30:00", guests: 5 },
        { user_id: userId, restaurant_id: 1, date: "2026-07-11", time: "21:00:00", guests: 4 },
        { user_id: userId, restaurant_id: 1, date: "2026-07-12", time: "18:00:00", guests: 3 },
        { user_id: userId, restaurant_id: 1, date: "2026-07-12", time: "19:00:00", guests: 5 },
        
        { user_id: userId, restaurant_id: 2, date: "2026-07-10", time: "13:00:00", guests: 2 },
        { user_id: userId, restaurant_id: 2, date: "2026-07-10", time: "14:00:00", guests: 4 },
        { user_id: userId, restaurant_id: 2, date: "2026-07-11", time: "20:00:00", guests: 6 },
        { user_id: userId, restaurant_id: 2, date: "2026-07-11", time: "21:30:00", guests: 8 },
        { user_id: userId, restaurant_id: 2, date: "2026-07-12", time: "19:00:00", guests: 3 },
        
        { user_id: userId, restaurant_id: 3, date: "2026-07-10", time: "20:00:00", guests: 4 },
        { user_id: userId, restaurant_id: 3, date: "2026-07-11", time: "20:30:00", guests: 5 },
        { user_id: userId, restaurant_id: 3, date: "2026-07-12", time: "19:00:00", guests: 6 },
      ];
      for (const resv of reservations) {
        await db.query(
          "INSERT INTO reservation1 (user_id, restaurant_id, date, time, guests) VALUES (?, ?, ?, ?, ?)",
          [resv.user_id, resv.restaurant_id, resv.date, resv.time, resv.guests]
        );
      }
      console.log("✅ Seeding reservations completed!");
    }

    console.log("🎉 Database initialization completed successfully!");
  } catch (err) {
    console.error("❌ Database auto-initialization failed:", err.message);
  }
}

module.exports = initializeDatabase;
