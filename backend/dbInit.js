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

    // Check restaurant count to determine if we should clear and re-seed 10 premium restaurants
    const [existingRestaurants] = await db.query("SELECT COUNT(*) as count FROM restaurants");
    if (existingRestaurants[0].count < 9) {
      console.log("🌱 Seeding/Resetting premium restaurant and dish database (10 Cuisines)...");
      
      // Safe truncate under foreign keys
      await db.query("SET FOREIGN_KEY_CHECKS = 0");
      await db.query("TRUNCATE TABLE dishes");
      await db.query("TRUNCATE TABLE restaurants");
      await db.query("SET FOREIGN_KEY_CHECKS = 1");

      const restaurants = [
        {
          name: "Trattoria Bella",
          cuisine: "Italian",
          price_ranges: "$$",
          rating: 4.6,
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
        },
        {
          name: "La Maison",
          cuisine: "French",
          price_ranges: "$$$",
          rating: 4.9,
          latitude: 40.7410,
          longitude: -74.0020,
          image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600"
        },
        {
          name: "Taj Mahal Palace",
          cuisine: "Indian",
          price_ranges: "$$",
          rating: 4.7,
          latitude: 40.7190,
          longitude: -73.9920,
          image_url: "https://images.unsplash.com/photo-1585938338392-50a59970d2ee?w=600"
        },
        {
          name: "El Camino",
          cuisine: "Mexican",
          price_ranges: "$$",
          rating: 4.4,
          latitude: 40.7340,
          longitude: -74.0080,
          image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"
        },
        {
          name: "Golden Dragon",
          cuisine: "Chinese",
          price_ranges: "$$",
          rating: 4.3,
          latitude: 40.7150,
          longitude: -73.9980,
          image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600"
        },
        {
          name: "Zeus Greek Tavern",
          cuisine: "Greek",
          price_ranges: "$$",
          rating: 4.5,
          latitude: 40.7220,
          longitude: -74.0010,
          image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600"
        },
        {
          name: "Siam Garden",
          cuisine: "Thai",
          price_ranges: "$$",
          rating: 4.6,
          latitude: 40.7280,
          longitude: -74.0040,
          image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600"
        },
        {
          name: "Tapas Barcelona",
          cuisine: "Spanish",
          price_ranges: "$$$",
          rating: 4.7,
          latitude: 40.7370,
          longitude: -73.9980,
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
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Margherita Pizza', 14.99, 'Classic fresh mozzarella, plum tomato, and sweet basil leaves on stone-baked crust.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Fettuccine Alfredo', 16.99, 'Rich, creamy parmesan and white wine butter sauce served over house-made pasta.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Tiramisu', 8.99, 'Ladyfingers dipped in espresso, layered with whipped mascarpone cheese and cocoa.')", [insertId]);
        } else if (r.cuisine === "Japanese") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Signature Sushi Platter', 29.99, 'Premium chef selection of nigiri, sashimi, and custom house rolls served with real wasabi.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Tonkotsu Ramen', 15.99, '48-hour slow-cooked rich pork bone broth with chashu, nori, bamboo shoots, and a soft-boiled egg.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Mochi Ice Cream', 6.99, 'Assorted green tea, mango, and strawberry mochi ice cream bites.')", [insertId]);
        } else if (r.cuisine === "American") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Classic Cheeseburger', 9.99, 'Premium dry-aged beef patty, double cheddar, caramelized onions, and house special sauce.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Truffle Fries', 5.99, 'Hand-cut russet potatoes double-fried and tossed in white truffle oil, rosemary, and aged parmesan.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Chocolate Milkshake', 6.49, 'Thick and creamy double-chocolate milkshake topped with fresh whipped cream.')", [insertId]);
        } else if (r.cuisine === "French") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Coq au Vin', 24.99, 'Traditional French chicken braised in red Burgundy wine, mushrooms, and lardon.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Crème Brûlée', 8.99, 'Rich custard base topped with a texturally contrastive layer of hardened caramelized sugar.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Escargot', 14.99, 'Six wild Burgundy snails baked in their shells with garlic, parsley, and butter.')", [insertId]);
        } else if (r.cuisine === "Indian") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Butter Chicken', 16.99, 'Tender tandoori grilled chicken cooked in a rich, velvety spiced tomato and cashew butter gravy.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Garlic Naan', 3.99, 'Fresh leavened flatbread baked in clay oven topped with garlic, cilantro, and pure ghee.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Mango Lassi', 4.49, 'Chilled sweet yogurt drink blended with fresh sweet mango pulp.')", [insertId]);
        } else if (r.cuisine === "Mexican") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Street Taco Platter', 12.99, 'Selection of premium carne asada, barbacoa, and al pastor tacos served on hand-pressed corn tortillas.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Churros with Chocolate', 6.99, 'Crispy golden fried dough dusted with cinnamon sugar and served with dark Oaxacan dipping chocolate.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Tres Leches Cake', 7.99, 'Sponge cake soaked in three kinds of milk, topped with whipped cream and fresh strawberries.')", [insertId]);
        } else if (r.cuisine === "Chinese") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Peking Duck', 28.99, 'Crispy skin roasted duck carved table-side, served with thin pancakes, hoisin sauce, and scallions.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Dim Sum Basket', 14.99, 'Assorted handcrafted steamed dumplings including har gow (shrimp) and shao mai (pork).')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Kung Pao Chicken', 15.49, 'Stir-fried chicken breast cubes with peanuts, bell peppers, and chili peppers in savory sauce.')", [insertId]);
        } else if (r.cuisine === "Greek") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Chicken Souvlaki', 15.99, 'Skewered tender chicken breast bites marinated in lemon and herbs, served with tzatziki and warm pita.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Greek Salad', 11.99, 'Crisp cucumbers, vine tomatoes, red onions, kalamata olives, and block of premium Greek feta.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Baklava', 7.99, 'Layers of crisp golden phyllo pastry filled with chopped walnuts and honey syrup.')", [insertId]);
        } else if (r.cuisine === "Thai") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Pad Thai', 14.49, 'Stir-fried thin rice noodles with tofu, egg, bean sprouts, crushed peanuts, and sweet tamarind.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Green Curry', 15.99, 'Spicy coconut cream green curry with bamboo shoots, Thai eggplants, and sweet basil leaves.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Mango Sticky Rice', 8.49, 'Fresh sweet yellow mango slices served over sweet coconut sticky rice.')", [insertId]);
        } else if (r.cuisine === "Spanish") {
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Seafood Paella', 32.99, 'Traditional saffron-scented rice cooked with wild prawns, mussels, calamari, scallops, and sweet peas.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Patatas Bravas', 9.99, 'Crispy fried potato cubes served with spicy tomato brava sauce and garlic aioli.')", [insertId]);
          await db.query("INSERT INTO dishes (restaurant_id, name, price, description) VALUES (?, 'Sangria Pitcher', 21.99, 'Classic house-made Spanish red wine punch infused with citrus fruits and cinnamon.')", [insertId]);
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
