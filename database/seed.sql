-- =============================================================================
-- SAVEPLATE DATABASE SEED DATA (MySQL 8.0+ Compatible)
-- Realistic Sample Data for Demonstration & Testing
-- =============================================================================

USE saveplate_db;

-- 1. USERS
-- Passwords:
-- Admin: Admin@SavePlate2026!
-- All other seed users: Password@123
INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES
(1, 'admin@saveplate.org', '$2b$10$2wbdpmF5kiiyxrpYxO3V4.TgWSqLKpFgzKXvoYkaf6zqV04PUnaJ.', 'admin', 'active', NOW() - INTERVAL 30 DAY),
(2, 'contact@greenbistro.com', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'donor', 'active', NOW() - INTERVAL 25 DAY),
(3, 'manager@freshmartgrocers.com', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'donor', 'active', NOW() - INTERVAL 20 DAY),
(4, 'chef.antonio@artisanbakery.com', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'donor', 'active', NOW() - INTERVAL 15 DAY),
(5, 'sarah.miller@communitytable.org', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'ngo', 'active', NOW() - INTERVAL 18 DAY),
(6, 'david.chen@urbanharvest.ngo', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'ngo', 'active', NOW() - INTERVAL 14 DAY),
(7, 'elena.rodriguez@familycare.org', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'recipient', 'active', NOW() - INTERVAL 10 DAY),
(8, 'marcus.vance@studentpantry.edu', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'recipient', 'active', NOW() - INTERVAL 8 DAY),
(9, 'volunteer.maya@saveplate.org', '$2b$10$y6H8RoSziG29LZMmRmUYIeFQdADQExPgMD8Int4G8KuquMh70SXTS', 'volunteer', 'active', NOW() - INTERVAL 12 DAY)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 2. USER PROFILES
INSERT INTO user_profiles (id, user_id, full_name, phone, organization_name, account_type, address, city, postal_code, bio) VALUES
(1, 1, 'SavePlate Central Ops', '+1-800-555-0199', 'SavePlate Foundation', 'admin', '100 Sustainability Blvd', 'San Francisco', '94103', 'Central Platform Security & Moderation Team.'),
(2, 2, 'Marco Valenti', '+1-555-234-5678', 'The Green Bistro', 'business_donor', '452 Organic Way', 'San Francisco', '94107', 'Farm-to-table restaurant donating gourmet surplus meals daily.'),
(3, 3, 'Rachel Adams', '+1-555-345-6789', 'FreshMart Organic Grocers', 'business_donor', '789 Market Street', 'Oakland', '94607', 'Supermarket providing wholesome fresh produce, fruit, and bakery items.'),
(4, 4, 'Antonio Rossi', '+1-555-456-7890', 'Rossi Artisan Bakery', 'business_donor', '124 Heritage Lane', 'Berkeley', '94704', 'Daily fresh sourdough, brioche, and rustic baguettes surplus.'),
(5, 5, 'Sarah Miller', '+1-555-567-8901', 'Community Table Food Bank', 'ngo', '55 Hope Avenue', 'San Francisco', '94110', 'Serving 500+ wholesome nutritious meals daily to families in need.'),
(6, 6, 'David Chen', '+1-555-678-9012', 'Urban Harvest Food Rescue', 'ngo', '88 Unity Plaza', 'Oakland', '94612', 'Grassroots logistics network routing perishable groceries directly to shelters.'),
(7, 7, 'Elena Rodriguez', '+1-555-789-0123', 'Family Care Outreach', 'recipient', '210 Mission Street', 'San Francisco', '94105', 'Community outreach coordinator assisting single parents and seniors.'),
(8, 8, 'Marcus Vance', '+1-555-890-1234', 'Campus Student Pantry', 'recipient', '120 University Hall', 'Berkeley', '94720', 'Assisting food-insecure university students with healthy meals.'),
(9, 9, 'Maya Lin', '+1-555-901-2345', 'Volunteer Corps', 'volunteer', '33 Redwood Terrace', 'San Francisco', '94114', 'Certified cold-chain volunteer delivery driver.')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. ORGANIZATIONS
INSERT INTO organizations (id, user_id, org_name, org_type, registration_number, tax_id, website, contact_person, contact_email, contact_phone, is_verified, verification_status, verified_at, verification_notes) VALUES
(1, 2, 'The Green Bistro', 'restaurant', 'CA-CORP-94821', 'TAX-94-2849102', 'https://greenbistro.example.com', 'Marco Valenti', 'contact@greenbistro.com', '+1-555-234-5678', 1, 'verified', NOW() - INTERVAL 24 DAY, 'Food safety certified kitchen. Safe cold storage verified.'),
(2, 3, 'FreshMart Organic Grocers', 'supermarket', 'CA-LLC-78391', 'TAX-83-9182740', 'https://freshmart.example.com', 'Rachel Adams', 'manager@freshmartgrocers.com', '+1-555-345-6789', 1, 'verified', NOW() - INTERVAL 19 DAY, 'Licensed retail grocer with dedicated refrigeration loading dock.'),
(3, 4, 'Rossi Artisan Bakery', 'other', 'CA-BAKERY-5510', 'TAX-55-1029384', 'https://rossibakery.example.com', 'Antonio Rossi', 'chef.antonio@artisanbakery.com', '+1-555-456-7890', 1, 'verified', NOW() - INTERVAL 14 DAY, 'Commercial bakery facility certified.'),
(4, 5, 'Community Table Food Bank', 'food_bank', 'CA-501C3-998811', 'EIN-99-8811223', 'https://communitytable.example.org', 'Sarah Miller', 'sarah.miller@communitytable.org', '+1-555-567-8901', 1, 'verified', NOW() - INTERVAL 17 DAY, 'Accredited non-profit food bank with licensed distribution logistics.'),
(5, 6, 'Urban Harvest Food Rescue', 'ngo', 'CA-501C3-662244', 'EIN-66-2244889', 'https://urbanharvest.example.ngo', 'David Chen', 'david.chen@urbanharvest.ngo', '+1-555-678-9012', 1, 'verified', NOW() - INTERVAL 13 DAY, 'Verified municipal food recovery partner.')
ON DUPLICATE KEY UPDATE org_name=VALUES(org_name);

-- 4. FOOD CATEGORIES
INSERT INTO food_categories (id, name, slug, description, icon, is_active) VALUES
(1, 'Cooked Meals', 'cooked-meals', 'Hot and freshly prepared culinary meals packed into certified eco-friendly containers.', 'Utensils', 1),
(2, 'Fresh Vegetables', 'vegetables', 'Farm-fresh leafy greens, root vegetables, organic tomatoes, peppers, and squash.', 'Carrot', 1),
(3, 'Fresh Fruits', 'fruits', 'Sweet seasonal apples, citrus, berries, bananas, and organic fruit crates.', 'Apple', 1),
(4, 'Bakery & Bread', 'bakery', 'Artisan sourdough loaves, whole grain bread, bagels, baguettes, and fresh pastries.', 'Croissant', 1),
(5, 'Dairy & Refrigerated', 'dairy', 'Milk, artisan cheeses, yogurt, butter, and chilled plant-based alternatives.', 'Milk', 1),
(6, 'Packaged & Pantry', 'packaged', 'Canned vegetables, beans, pasta, rice, dry cereals, and shelf-stable staples.', 'Package', 1),
(7, 'Beverages & Juices', 'beverages', 'Cold-pressed natural juices, mineral waters, kombucha, and plant milks.', 'Coffee', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. FOOD LISTINGS
INSERT INTO food_listings (id, donor_id, category_id, title, description, initial_quantity, remaining_quantity, unit, estimated_servings, prep_time, expiry_time, pickup_deadline, storage_instructions, allergens, pickup_address, city, postal_code, contact_phone, primary_image_url, status, moderation_status) VALUES
(1, 2, 1, 'Artisan Roasted Mediterranean Vegetable & Grain Bowls', 'Wholesome roasted Mediterranean bowls featuring organic quinoa, roasted peppers, zucchini, kalamata olives, and herb vinaigrette. Prepared fresh this evening for an executive conference with untouched sealed portions.', 25, 15, 'meals', 25, NOW() - INTERVAL 2 HOUR, NOW() + INTERVAL 22 HOUR, NOW() + INTERVAL 6 HOUR, 'Refrigerated (2°C - 4°C). Reheat to 75°C before serving.', 'Contains Sesame. Nut-free, Vegetarian, Gluten-free.', '452 Organic Way', 'San Francisco', '94107', '+1-555-234-5678', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80', 'available', 'approved'),

(2, 3, 2, 'Crates of Crisp Organic Leafy Greens & Farm Carrots', 'Surplus wholesale delivery from Salinas Valley organic farms. Includes fresh baby spinach, rainbow Swiss chard, heirloom carrots with greens intact, and crisp cucumbers.', 40, 40, 'kg', 80, NOW() - INTERVAL 5 HOUR, NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 14 HOUR, 'Store in cool vegetable crisper (4°C - 7°C). Wash thoroughly before consuming.', 'None.', '789 Market Street', 'Oakland', '94607', '+1-555-345-6789', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80', 'available', 'approved'),

(3, 4, 4, 'Rustic Woodfired Sourdough Loaves & French Baguettes', 'Freshly baked today at 5:00 AM using 100% organic sourdough starter and stoneground flour. Perfect crust with soft, airy crumb. Packaged in breathable bakery paper bags.', 35, 10, 'loaves', 70, NOW() - INTERVAL 10 HOUR, NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 8 HOUR, 'Store in dry pantry in paper bread bags or freeze immediately for extended freshness.', 'Contains Wheat (Gluten).', '124 Heritage Lane', 'Berkeley', '94704', '+1-555-456-7890', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80', 'partially_claimed', 'approved'),

(4, 3, 3, 'Sweet Honeycrisp Apples & California Citrus Crates', 'Two wooden crates of crisp, juicy Honeycrisp apples and sweet seedless Valencia oranges from a surplus distribution pallet. Great for families and community kitchens.', 30, 30, 'kg', 90, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 20 HOUR, 'Keep in cool, dry place or refrigerate for maximum crunch.', 'None.', '789 Market Street', 'Oakland', '94607', '+1-555-345-6789', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=80', 'available', 'approved'),

(5, 2, 1, 'Slow-Simmered Herb Lentil Soup & Steamed Basmati Rice', 'Nutritious golden lentil stew cooked with fresh ginger, turmeric, diced carrots, and spinach, paired with fragrant long-grain Basmati rice. Kept under strict temperature control in catering containers.', 30, 0, 'portions', 30, NOW() - INTERVAL 8 HOUR, NOW() + INTERVAL 16 HOUR, NOW() - INTERVAL 1 HOUR, 'Keep chilled below 4°C until ready to heat. Vegan and dairy-free.', 'No common allergens.', '452 Organic Way', 'San Francisco', '94107', '+1-555-234-5678', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80', 'fully_claimed', 'approved'),

(6, 3, 6, 'Nutritious Organic Whole Grain Pasta & Crushed Tomato Sauce', 'Cases of certified organic penne rigate pasta paired with 100% Italian san marzano crushed tomato cans. Sealed shelf-stable factory packaging with 12 months shelf-life remaining.', 50, 50, 'boxes', 150, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 1 YEAR, NOW() + INTERVAL 48 HOUR, 'Store in cool ambient dry room.', 'Contains Wheat.', '789 Market Street', 'Oakland', '94607', '+1-555-345-6789', 'https://images.unsplash.com/photo-1621996346565-e3d5d62817cc?auto=format&fit=crop&w=1000&q=80', 'available', 'approved')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. FOOD IMAGES
INSERT INTO food_images (id, listing_id, image_url, is_primary, caption) VALUES
(1, 1, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80', 1, 'Mediterranean grain bowl'),
(2, 2, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80', 1, 'Organic garden vegetables'),
(3, 3, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80', 1, 'Sourdough loaves'),
(4, 4, 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=80', 1, 'Fresh fruit crates'),
(5, 5, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80', 1, 'Simmered lentil soup'),
(6, 6, 'https://images.unsplash.com/photo-1621996346565-e3d5d62817cc?auto=format&fit=crop&w=1000&q=80', 1, 'Pantry pasta and sauces')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- 7. FOOD REQUESTS
INSERT INTO food_requests (id, listing_id, recipient_id, requested_quantity, unit, status, recipient_notes, donor_notes, pickup_time, verification_code, created_at) VALUES
(1, 1, 5, 10, 'meals', 'approved', 'We have 10 elderly shelter residents who will be thrilled with these wholesome bowls tonight.', 'Approved with pleasure! Please bring thermal insulated bags.', NOW() + INTERVAL 3 HOUR, 'SP-94812', NOW() - INTERVAL 1 HOUR),
(2, 3, 6, 25, 'loaves', 'ready_for_pickup', 'Urban Harvest distribution van will pick these up during our Berkeley scheduled circuit.', 'Bread is bagged and waiting in the side bakery receiving bay.', NOW() + INTERVAL 2 HOUR, 'SP-33921', NOW() - INTERVAL 4 HOUR),
(3, 5, 7, 30, 'portions', 'completed', 'For our community dining hall dinner service.', 'Picked up on time. Thank you for rescuing this wholesome food!', NOW() - INTERVAL 4 HOUR, 'SP-58210', NOW() - INTERVAL 6 HOUR)
ON DUPLICATE KEY UPDATE requested_quantity=VALUES(requested_quantity);

-- 8. DONATIONS
INSERT INTO donations (id, listing_id, request_id, donor_id, recipient_id, quantity, unit, servings_rescued, kg_rescued, status, completed_at, rating, feedback_text) VALUES
(1, 5, 3, 2, 7, 30, 'portions', 30, 15.00, 'completed', NOW() - INTERVAL 3 HOUR, 5, 'The lentil soup and rice were exquisite and perfectly stored. Fed 30 individuals tonight!')
ON DUPLICATE KEY UPDATE servings_rescued=VALUES(servings_rescued);

-- 9. DONATION STATUS HISTORY
INSERT INTO donation_status_history (id, request_id, changed_by_user_id, previous_status, new_status, notes) VALUES
(1, 1, 5, 'pending', 'approved', 'Donor approved request for 10 meals.'),
(2, 2, 4, 'pending', 'approved', 'Bakery approved pickup.'),
(3, 2, 4, 'approved', 'ready_for_pickup', 'Packaged in bread bags and ready at back bay.'),
(4, 3, 2, 'ready_for_pickup', 'completed', 'Verified QR code and handoff completed.')
ON DUPLICATE KEY UPDATE new_status=VALUES(new_status);

-- 10. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, link, is_read) VALUES
(1, 2, 'New Food Request Received', 'Community Table Food Bank requested 10 meals from "Mediterranean Grain Bowls".', 'request_received', '/donor/listings', 0),
(2, 5, 'Request Approved!', 'The Green Bistro approved your request for 10 Mediterranean bowls.', 'request_status_update', '/recipient/requests', 0),
(3, 1, 'Platform Milestone Reached', 'Over 1,250 kg of surplus food rescued across our network this month!', 'admin_alert', '/admin', 0)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 11. ARTICLES (Educational)
INSERT INTO articles (id, title, slug, summary, content, author_name, image_url, read_time, is_published) VALUES
(1, 'The Hidden Cost of Food Waste: From Landfill Methane to Community Healing', 'hidden-cost-food-waste', 'Globally, one-third of all food produced is never consumed. Learn how redirecting surplus transforms hunger into health.', 'Every day, tons of perfectly edible food are discarded while millions experience nutritional insecurity. When organic food decays in landfills without oxygen, it generates methane—a greenhouse gas over 28 times more potent than carbon dioxide. By establishing rapid, temperature-controlled distribution channels between food producers and community kitchens, SavePlate turns environmental liabilities into life-saving nourishment.', 'SavePlate Sustainability Team', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80', '5 min read', 1),

(2, 'The Cold-Chain Guide: Safe Storage and Transport for Surplus Redistribution', 'cold-chain-redistribution-guide', 'Master the principles of food safety, proper temperature logging, and rapid turnaround for prepared meals.', 'Safety is the paramount foundation of ethical food redistribution. Prepared hot food must be chilled rapidly from 60°C to below 4°C within two hours. Using insulated carriers and monitoring timestamped pickup windows ensures every recipient receives food that is as safe as it is delicious.', 'Dr. Julian Foster, Food Safety Specialist', 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1000&q=80', '4 min read', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 12. FAQS
INSERT INTO faqs (id, question, answer, category, sort_order, is_published) VALUES
(1, 'How does SavePlate verify the safety and freshness of surplus food?', 'Every registered business donor goes through a verification process. Listings mandate clear preparation timestamps, refrigeration status, allergen disclosures, and strict pickup deadlines that prevent food spoilage.', 'Safety', 1, 1),
(2, 'Who can register as a food donor?', 'We welcome licensed restaurants, bakeries, supermarkets, corporate dining facilities, catering event organizers, certified farms, and community gardens with surplus food.', 'Donors', 2, 1),
(3, 'Are food donations protected under Good Samaritan laws?', 'Yes. In the United States, the Bill Emerson Good Samaritan Food Donation Act protects donors and non-profit organizations from civil and criminal liability when donating apparently wholesome food in good faith.', 'Legal', 3, 1),
(4, 'How quickly does food need to be picked up?', 'Donors set explicit pickup deadlines (typically 2 to 24 hours for perishable meals, up to 48 hours for fresh produce). Our automated notification system alerts nearby NGOs the moment a listing is created.', 'Logistics', 4, 1)
ON DUPLICATE KEY UPDATE question=VALUES(question);

-- 13. PLATFORM SETTINGS
INSERT INTO platform_settings (id, setting_key, setting_value, description) VALUES
(1, 'platform_name', 'SAVEPLATE', 'Brand name displayed across the system'),
(2, 'tagline', 'Save Food. Share Hope. Build a Better Tomorrow.', 'Official brand tagline'),
(3, 'contact_email', 'contact@saveplate.org', 'Official contact email'),
(4, 'support_phone', '+1-800-555-PLATE', 'Toll-free platform helpline'),
(5, 'auto_approve_listings', 'true', 'Whether donor listings are automatically approved upon submission'),
(6, 'default_currency', 'USD', 'Currency code for impact calculations'),
(7, 'co2_saved_per_kg_food', '2.5', 'Estimated kg of CO2 equivalent emissions prevented per 1 kg of food rescued')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- 14. AUDIT LOGS
INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, details, ip_address) VALUES
(1, 1, 'ORG_VERIFICATION_APPROVED', 'ngo', 1, 'Verified The Green Bistro restaurant credentials and food safety certificate.', '127.0.0.1'),
(2, 1, 'ORG_VERIFICATION_APPROVED', 'ngo', 4, 'Verified Community Table Food Bank 501(c)(3) tax exemption.', '127.0.0.1'),
(3, 1, 'LISTING_MODERATION_APPROVED', 'listing', 1, 'Approved listing #1 Mediterranean Grain Bowls.', '127.0.0.1')
ON DUPLICATE KEY UPDATE action=VALUES(action);

-- 15. ANNOUNCEMENTS
INSERT INTO announcements (id, title, content, badge, is_active, priority) VALUES
(1, 'Winter Surge 2026: Zero Waste Logistics Active', 'Our expanded cold-chain courier network is now live across the Bay Area to expedite evening pickups from participating restaurants.', 'LOGISTICS UPDATE', 1, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

