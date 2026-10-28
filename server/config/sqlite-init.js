// server/config/sqlite-init.js
// Automatic SQLite schema & seed initializer for instant local testing
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function initSqliteDatabase(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables matching schema.sql
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'recipient' CHECK(role IN ('admin', 'donor', 'recipient', 'ngo', 'volunteer')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'pending')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      organization_name TEXT,
      account_type TEXT DEFAULT 'individual',
      address TEXT,
      city TEXT,
      postal_code TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      org_name TEXT NOT NULL,
      org_type TEXT NOT NULL DEFAULT 'ngo',
      registration_number TEXT,
      tax_id TEXT,
      website TEXT,
      contact_person TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      is_verified INTEGER NOT NULL DEFAULT 0,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      verified_at DATETIME,
      verification_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS food_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT DEFAULT 'Utensils',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      initial_quantity REAL NOT NULL,
      remaining_quantity REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      estimated_servings INTEGER NOT NULL DEFAULT 0,
      prep_time DATETIME,
      expiry_time DATETIME,
      pickup_deadline DATETIME NOT NULL,
      storage_instructions TEXT NOT NULL DEFAULT 'Keep refrigerated',
      allergens TEXT,
      pickup_address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT,
      contact_phone TEXT NOT NULL,
      primary_image_url TEXT,
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'partially_claimed', 'fully_claimed', 'closed', 'expired', 'paused', 'rejected')),
      moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK(moderation_status IN ('approved', 'pending_review', 'rejected')),
      moderation_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES food_categories(id)
    );

    CREATE TABLE IF NOT EXISTS food_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES food_listings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS food_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      requested_quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'ready_for_pickup', 'collected', 'completed', 'cancelled', 'expired')),
      recipient_notes TEXT,
      donor_notes TEXT,
      pickup_time DATETIME,
      verification_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES food_listings(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      request_id INTEGER NOT NULL,
      donor_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      servings_rescued INTEGER NOT NULL DEFAULT 0,
      kg_rescued REAL NOT NULL DEFAULT 0.0,
      status TEXT NOT NULL DEFAULT 'in_progress',
      completed_at DATETIME,
      rating INTEGER,
      feedback_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES food_listings(id),
      FOREIGN KEY (request_id) REFERENCES food_requests(id),
      FOREIGN KEY (donor_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS donation_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      changed_by_user_id INTEGER NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES food_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'system',
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ngo_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      submitted_documents TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewed_by_admin_id INTEGER,
      admin_notes TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      rating INTEGER NOT NULL,
      category TEXT DEFAULT 'general',
      comments TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      assigned_to_admin_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      badge TEXT DEFAULT 'ANNOUNCEMENT',
      is_active INTEGER NOT NULL DEFAULT 1,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      author_name TEXT DEFAULT 'SavePlate Sustainability Team',
      image_url TEXT,
      read_time TEXT DEFAULT '4 min read',
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default records if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('[Database] Seeding initial data into SQLite database...');

    // Users
    // Admin password: Admin@SavePlate2026!
    // User password: Password@123
    const insertUser = db.prepare('INSERT INTO users (id, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)');
    insertUser.run(1, 'admin@saveplate.org', '$2b$10$2wbdpmF5kiiyxrpYxO3V4.TgWSqLKpFgzKXvoYkaf6zqV04PUnaJ.', 'admin', 'active');
    insertUser.run(2, 'contact@greenbistro.com', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'donor', 'active');
    insertUser.run(3, 'manager@freshmartgrocers.com', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'donor', 'active');
    insertUser.run(4, 'chef.antonio@artisanbakery.com', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'donor', 'active');
    insertUser.run(5, 'sarah.miller@communitytable.org', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'ngo', 'active');
    insertUser.run(6, 'david.chen@urbanharvest.ngo', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'ngo', 'active');
    insertUser.run(7, 'elena.rodriguez@familycare.org', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'recipient', 'active');
    insertUser.run(8, 'marcus.vance@studentpantry.edu', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'recipient', 'active');
    insertUser.run(9, 'volunteer.maya@saveplate.org', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'volunteer', 'active');

    // User Profiles
    const insertProfile = db.prepare('INSERT INTO user_profiles (id, user_id, full_name, phone, organization_name, account_type, address, city, postal_code, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertProfile.run(1, 1, 'SavePlate Central Ops', '+1-800-555-0199', 'SavePlate Foundation', 'admin', '100 Sustainability Blvd', 'San Francisco', '94103', 'Central Platform Security & Moderation Team.');
    insertProfile.run(2, 2, 'Marco Valenti', '+1-555-234-5678', 'The Green Bistro', 'business_donor', '452 Organic Way', 'San Francisco', '94107', 'Farm-to-table restaurant donating gourmet surplus meals daily.');
    insertProfile.run(3, 3, 'Rachel Adams', '+1-555-345-6789', 'FreshMart Organic Grocers', 'business_donor', '789 Market Street', 'Oakland', '94607', 'Supermarket providing wholesome fresh produce, fruit, and bakery items.');
    insertProfile.run(4, 4, 'Antonio Rossi', '+1-555-456-7890', 'Rossi Artisan Bakery', 'business_donor', '124 Heritage Lane', 'Berkeley', '94704', 'Daily fresh sourdough, brioche, and rustic baguettes surplus.');
    insertProfile.run(5, 5, 'Sarah Miller', '+1-555-567-8901', 'Community Table Food Bank', 'ngo', '55 Hope Avenue', 'San Francisco', '94110', 'Serving 500+ wholesome nutritious meals daily to families in need.');
    insertProfile.run(6, 6, 'David Chen', '+1-555-678-9012', 'Urban Harvest Food Rescue', 'ngo', '88 Unity Plaza', 'Oakland', '94612', 'Grassroots logistics network routing perishable groceries directly to shelters.');
    insertProfile.run(7, 7, 'Elena Rodriguez', '+1-555-789-0123', 'Family Care Outreach', 'recipient', '210 Mission Street', 'San Francisco', '94105', 'Community outreach coordinator assisting single parents and seniors.');
    insertProfile.run(8, 8, 'Marcus Vance', '+1-555-890-1234', 'Campus Student Pantry', 'recipient', '120 University Hall', 'Berkeley', '94720', 'Assisting food-insecure university students with healthy meals.');
    insertProfile.run(9, 9, 'Maya Lin', '+1-555-901-2345', 'Volunteer Corps', 'volunteer', '33 Redwood Terrace', 'San Francisco', '94114', 'Certified cold-chain volunteer delivery driver.');

    // Organizations
    const insertOrg = db.prepare('INSERT INTO organizations (id, user_id, org_name, org_type, registration_number, tax_id, website, contact_person, contact_email, contact_phone, is_verified, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertOrg.run(1, 2, 'The Green Bistro', 'restaurant', 'CA-CORP-94821', 'TAX-94-2849102', 'https://greenbistro.example.com', 'Marco Valenti', 'contact@greenbistro.com', '+1-555-234-5678', 1, 'verified');
    insertOrg.run(2, 3, 'FreshMart Organic Grocers', 'supermarket', 'CA-LLC-78391', 'TAX-83-9182740', 'https://freshmart.example.com', 'Rachel Adams', 'manager@freshmartgrocers.com', '+1-555-345-6789', 1, 'verified');
    insertOrg.run(3, 4, 'Rossi Artisan Bakery', 'other', 'CA-BAKERY-5510', 'TAX-55-1029384', 'https://rossibakery.example.com', 'Antonio Rossi', 'chef.antonio@artisanbakery.com', '+1-555-456-7890', 1, 'verified');
    insertOrg.run(4, 5, 'Community Table Food Bank', 'food_bank', 'CA-501C3-998811', 'EIN-99-8811223', 'https://communitytable.example.org', 'Sarah Miller', 'sarah.miller@communitytable.org', '+1-555-567-8901', 1, 'verified');
    insertOrg.run(5, 6, 'Urban Harvest Food Rescue', 'ngo', 'CA-501C3-662244', 'EIN-66-2244889', 'https://urbanharvest.example.ngo', 'David Chen', 'david.chen@urbanharvest.ngo', '+1-555-678-9012', 1, 'verified');

    // Categories
    const insertCat = db.prepare('INSERT INTO food_categories (id, name, slug, description, icon, is_active) VALUES (?, ?, ?, ?, ?, ?)');
    insertCat.run(1, 'Cooked Meals', 'cooked-meals', 'Hot and freshly prepared culinary meals packed into certified eco-friendly containers.', 'Utensils', 1);
    insertCat.run(2, 'Fresh Vegetables', 'vegetables', 'Farm-fresh leafy greens, root vegetables, organic tomatoes, peppers, and squash.', 'Carrot', 1);
    insertCat.run(3, 'Fresh Fruits', 'fruits', 'Sweet seasonal apples, citrus, berries, bananas, and organic fruit crates.', 'Apple', 1);
    insertCat.run(4, 'Bakery & Bread', 'bakery', 'Artisan sourdough loaves, whole grain bread, bagels, baguettes, and fresh pastries.', 'Croissant', 1);
    insertCat.run(5, 'Dairy & Refrigerated', 'dairy', 'Milk, artisan cheeses, yogurt, butter, and chilled plant-based alternatives.', 'Milk', 1);
    insertCat.run(6, 'Packaged & Pantry', 'packaged', 'Canned vegetables, beans, pasta, rice, dry cereals, and shelf-stable staples.', 'Package', 1);
    insertCat.run(7, 'Beverages & Juices', 'beverages', 'Cold-pressed natural juices, mineral waters, kombucha, and plant milks.', 'Coffee', 1);

    // Listings
    const insertListing = db.prepare(`
      INSERT INTO food_listings (
        id, donor_id, category_id, title, description, initial_quantity, remaining_quantity,
        unit, estimated_servings, pickup_deadline, storage_instructions, allergens,
        pickup_address, city, postal_code, contact_phone, primary_image_url, status, moderation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+6 hours'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertListing.run(
      1, 2, 1, 'Artisan Roasted Mediterranean Vegetable & Grain Bowls',
      'Wholesome roasted Mediterranean bowls featuring organic quinoa, roasted peppers, zucchini, kalamata olives, and herb vinaigrette. Prepared fresh this evening for an executive conference with untouched sealed portions.',
      25, 15, 'meals', 25, 'Refrigerated (2°C - 4°C). Reheat to 75°C before serving.', 'Contains Sesame. Nut-free, Vegetarian, Gluten-free.',
      '452 Organic Way', 'San Francisco', '94107', '+1-555-234-5678',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
      'available', 'approved'
    );

    insertListing.run(
      2, 3, 2, 'Crates of Crisp Organic Leafy Greens & Farm Carrots',
      'Surplus wholesale delivery from Salinas Valley organic farms. Includes fresh baby spinach, rainbow Swiss chard, heirloom carrots with greens intact, and crisp cucumbers.',
      40, 40, 'kg', 80, 'Store in cool vegetable crisper (4°C - 7°C). Wash thoroughly before consuming.', 'None.',
      '789 Market Street', 'Oakland', '94607', '+1-555-345-6789',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
      'available', 'approved'
    );

    insertListing.run(
      3, 4, 4, 'Rustic Woodfired Sourdough Loaves & French Baguettes',
      'Freshly baked today at 5:00 AM using 100% organic sourdough starter and stoneground flour. Perfect crust with soft, airy crumb. Packaged in breathable bakery paper bags.',
      35, 10, 'loaves', 70, 'Store in dry pantry in paper bread bags or freeze immediately for extended freshness.', 'Contains Wheat (Gluten).',
      '124 Heritage Lane', 'Berkeley', '94704', '+1-555-456-7890',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
      'partially_claimed', 'approved'
    );

    insertListing.run(
      4, 3, 3, 'Sweet Honeycrisp Apples & California Citrus Crates',
      'Two wooden crates of crisp, juicy Honeycrisp apples and sweet seedless Valencia oranges from a surplus distribution pallet. Great for families and community kitchens.',
      30, 30, 'kg', 90, 'Keep in cool, dry place or refrigerate for maximum crunch.', 'None.',
      '789 Market Street', 'Oakland', '94607', '+1-555-345-6789',
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=80',
      'available', 'approved'
    );

    insertListing.run(
      5, 2, 1, 'Slow-Simmered Herb Lentil Soup & Steamed Basmati Rice',
      'Nutritious golden lentil stew cooked with fresh ginger, turmeric, diced carrots, and spinach, paired with fragrant long-grain Basmati rice. Kept under strict temperature control in catering containers.',
      30, 0, 'portions', 30, 'Keep chilled below 4°C until ready to heat. Vegan and dairy-free.', 'No common allergens.',
      '452 Organic Way', 'San Francisco', '94107', '+1-555-234-5678',
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
      'fully_claimed', 'approved'
    );

    insertListing.run(
      6, 3, 6, 'Nutritious Organic Whole Grain Pasta & Crushed Tomato Sauce',
      'Cases of certified organic penne rigate pasta paired with 100% Italian san marzano crushed tomato cans. Sealed shelf-stable factory packaging with 12 months shelf-life remaining.',
      50, 50, 'boxes', 150, 'Store in cool ambient dry room.', 'Contains Wheat.',
      '789 Market Street', 'Oakland', '94607', '+1-555-345-6789',
      'https://images.unsplash.com/photo-1621996346565-e3d5d62817cc?auto=format&fit=crop&w=1000&q=80',
      'available', 'approved'
    );

    // Food Images
    const insertImage = db.prepare('INSERT INTO food_images (id, listing_id, image_url, is_primary, caption) VALUES (?, ?, ?, ?, ?)');
    insertImage.run(1, 1, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80', 1, 'Mediterranean grain bowl');
    insertImage.run(2, 2, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80', 1, 'Fresh organic vegetables');
    insertImage.run(3, 3, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80', 1, 'Artisan sourdough loaves');
    insertImage.run(4, 4, 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=80', 1, 'Citrus and apples');
    insertImage.run(5, 5, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80', 1, 'Lentil stew');
    insertImage.run(6, 6, 'https://images.unsplash.com/photo-1621996346565-e3d5d62817cc?auto=format&fit=crop&w=1000&q=80', 1, 'Pantry essentials');

    // Requests
    const insertReq = db.prepare('INSERT INTO food_requests (id, listing_id, recipient_id, requested_quantity, unit, status, recipient_notes, donor_notes, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertReq.run(1, 1, 5, 10, 'meals', 'approved', 'For 10 elderly shelter residents tonight.', 'Approved with pleasure! Please bring insulated carrier.', 'SP-94812');
    insertReq.run(2, 3, 6, 25, 'loaves', 'ready_for_pickup', 'Urban Harvest distribution van will pick up.', 'Packaged in bread bags and ready at back bay.', 'SP-33921');
    insertReq.run(3, 5, 7, 30, 'portions', 'completed', 'Community dinner meal service.', 'Verified QR code and handoff completed.', 'SP-58210');

    // Donations
    const insertDonation = db.prepare('INSERT INTO donations (id, listing_id, request_id, donor_id, recipient_id, quantity, unit, servings_rescued, kg_rescued, status, rating, feedback_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertDonation.run(1, 5, 3, 2, 7, 30, 'portions', 30, 15.0, 'completed', 5, 'The lentil soup and rice were exquisite and perfectly stored. Fed 30 individuals tonight!');

    // Status History
    const insertHist = db.prepare('INSERT INTO donation_status_history (request_id, changed_by_user_id, previous_status, new_status, notes) VALUES (?, ?, ?, ?, ?)');
    insertHist.run(1, 5, 'pending', 'approved', 'Donor approved request for 10 meals.');
    insertHist.run(2, 4, 'pending', 'approved', 'Bakery approved pickup.');
    insertHist.run(2, 4, 'approved', 'ready_for_pickup', 'Packaged in bread bags.');
    insertHist.run(3, 2, 'ready_for_pickup', 'completed', 'Verified QR code and handoff completed.');

    // Notifications
    const insertNotif = db.prepare('INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)');
    insertNotif.run(2, 'New Food Request Received', 'Community Table Food Bank requested 10 meals from "Mediterranean Grain Bowls".', 'request_received', '/donor/listings');
    insertNotif.run(5, 'Request Approved!', 'The Green Bistro approved your request for 10 Mediterranean bowls.', 'request_status_update', '/recipient/requests');
    insertNotif.run(1, 'Platform Milestone Reached', 'Over 1,250 kg of surplus food rescued across our network this month!', 'admin_alert', '/admin');

    // Articles
    const insertArticle = db.prepare('INSERT INTO articles (id, title, slug, summary, content, author_name, image_url, read_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insertArticle.run(
      1, 'The Hidden Cost of Food Waste: From Landfill Methane to Community Healing', 'hidden-cost-food-waste',
      'Globally, one-third of all food produced is never consumed. Learn how redirecting surplus transforms hunger into health.',
      'Every day, tons of perfectly edible food are discarded while millions experience nutritional insecurity. When organic food decays in landfills without oxygen, it generates methane—a greenhouse gas over 28 times more potent than carbon dioxide. By establishing rapid, temperature-controlled distribution channels between food producers and community kitchens, SavePlate turns environmental liabilities into life-saving nourishment.',
      'SavePlate Sustainability Team',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
      '5 min read'
    );
    insertArticle.run(
      2, 'The Cold-Chain Guide: Safe Storage and Transport for Surplus Redistribution', 'cold-chain-redistribution-guide',
      'Master the principles of food safety, proper temperature logging, and rapid turnaround for prepared meals.',
      'Safety is the paramount foundation of ethical food redistribution. Prepared hot food must be chilled rapidly from 60°C to below 4°C within two hours. Using insulated carriers and monitoring timestamped pickup windows ensures every recipient receives food that is as safe as it is delicious.',
      'Dr. Julian Foster, Food Safety Specialist',
      'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1000&q=80',
      '4 min read'
    );

    // FAQs
    const insertFaq = db.prepare('INSERT INTO faqs (id, question, answer, category, sort_order) VALUES (?, ?, ?, ?, ?)');
    insertFaq.run(1, 'How does SavePlate verify the safety and freshness of surplus food?', 'Every registered business donor goes through a verification process. Listings mandate clear preparation timestamps, refrigeration status, allergen disclosures, and strict pickup deadlines that prevent food spoilage.', 'Safety', 1);
    insertFaq.run(2, 'Who can register as a food donor?', 'We welcome licensed restaurants, bakeries, supermarkets, corporate dining facilities, catering event organizers, certified farms, and community gardens with surplus food.', 'Donors', 2);
    insertFaq.run(3, 'Are food donations protected under Good Samaritan laws?', 'Yes. In the United States, the Bill Emerson Good Samaritan Food Donation Act protects donors and non-profit organizations from civil and criminal liability when donating apparently wholesome food in good faith.', 'Legal', 3);
    insertFaq.run(4, 'How quickly does food need to be picked up?', 'Donors set explicit pickup deadlines (typically 2 to 24 hours for perishable meals, up to 48 hours for fresh produce). Our automated notification system alerts nearby NGOs the moment a listing is created.', 'Logistics', 4);

    // Platform settings
    const insertSetting = db.prepare('INSERT INTO platform_settings (id, setting_key, setting_value, description) VALUES (?, ?, ?, ?)');
    insertSetting.run(1, 'platform_name', 'SAVEPLATE', 'Brand name displayed across the system');
    insertSetting.run(2, 'tagline', 'Save Food. Share Hope. Build a Better Tomorrow.', 'Official brand tagline');
    insertSetting.run(3, 'contact_email', 'contact@saveplate.org', 'Official contact email');
    insertSetting.run(4, 'support_phone', '+1-800-555-PLATE', 'Toll-free platform helpline');
    insertSetting.run(5, 'auto_approve_listings', 'true', 'Whether donor listings are automatically approved');
    insertSetting.run(6, 'default_currency', 'USD', 'Currency code for calculations');
    insertSetting.run(7, 'co2_saved_per_kg_food', '2.5', 'Estimated kg of CO2 equivalent emissions prevented per 1 kg of food rescued');

    // Audit logs
    const insertAudit = db.prepare('INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertAudit.run(1, 1, 'ORG_VERIFICATION_APPROVED', 'ngo', 1, 'Verified The Green Bistro credentials.', '127.0.0.1');
    insertAudit.run(2, 1, 'ORG_VERIFICATION_APPROVED', 'ngo', 4, 'Verified Community Table Food Bank 501(c)(3) status.', '127.0.0.1');
    insertAudit.run(3, 1, 'LISTING_MODERATION_APPROVED', 'listing', 1, 'Approved listing #1 Mediterranean Grain Bowls.', '127.0.0.1');

    // Announcements
    const insertAnnounce = db.prepare('INSERT INTO announcements (id, title, content, badge, is_active, priority) VALUES (?, ?, ?, ?, ?, ?)');
    insertAnnounce.run(1, 'Winter Surge 2026: Zero Waste Logistics Active', 'Our expanded cold-chain courier network is now live across the Bay Area to expedite evening pickups from participating restaurants.', 'LOGISTICS UPDATE', 1, 1);

    console.log('[Database] Seed data successfully populated.');
  }

  return db;
}

module.exports = { initSqliteDatabase };

