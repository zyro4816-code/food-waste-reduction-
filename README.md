# 🌿 SAVEPLATE — Food Waste Reduction & Food Management System

> **Tagline:** *Save Food. Share Hope. Build a Better Tomorrow.*

---

## 📖 Executive Summary

**SAVEPLATE** is a full-stack, production-quality food waste reduction and surplus food management platform. It connects food businesses (restaurants, supermarkets, bakeries, corporate cafeterias, event organizers) with surplus edible food directly to recipient networks (community kitchens, food banks, shelters, and families in need).

Built upon a cinematic, high-end motion design foundation, **SAVEPLATE completely replaces flower animations with realistic, high-resolution food sustainability visuals**, featuring word-by-word headline reveals, letter-by-letter brand wordmark animations, a custom glassmorphism cursor, an atomic inventory transaction system, and a comprehensive Administrator Dashboard.

---

## 🚀 Key Features

### 🌟 1. Cinematic Frontend & Motion Design
- **Cinematic Food Sustainability Experience:** High-definition video background featuring fresh vegetable prep, wholesome meals, and community distributions, with graceful high-res fallback imagery.
- **Dramatic Word-by-Word Reveal:** Masked slide-up and blur-to-focus typography ("Good Food Deserves a Second Chance.").
- **Giant Animated SAVEPLATE Wordmark:** Letter-by-letter typographic reveals with responsive font scaling and staggered delay physics.
- **Custom Interactive Cursor:** Smooth outlined ring + trailing glassmorphism pill (`"SAVE FOOD"` / `"RESCUE"`), `requestAnimationFrame` tracking, with automatic fallback on touch devices and support for `prefers-reduced-motion`.
- **Dynamic Impact Calculator:** Real-time interactive slider estimating kilograms of food rescued, meals distributed, greenhouse gas (CO₂e) emissions prevented, and embedded water conserved.

### 🍱 2. Food Discovery & Inventory Concurrency
- **Multi-Filter Food Directory:** Filter surplus food by Category (*Cooked Meals*, *Vegetables*, *Fruits*, *Bakery*, *Dairy*, *Pantry*, *Beverages*), Location/City, and Pickup Urgency.
- **Atomic Database Transactions:** Concurrency protection ensures multiple simultaneous users can never claim more food than is remaining in inventory.
- **Dynamic Pickup Windows:** Live countdown timers highlighting urgent pickup deadlines.
- **Safety & Handling Disclosures:** Strict storage temperatures (Refrigerated 2-4°C, Frozen, Ambient) and mandatory allergen disclosures.

### 🤝 3. Complete Donation & Collection Workflow
- **Detailed Donation Submission:** Complete form with quantity, units, servings estimate, preparation/expiry timestamps, address, telephone, and image upload with realistic photographic presets.
- **Handover Verification Codes:** Automated 5-digit verification codes and QR codes generated for recipient collection handoffs.
- **Live Status Tracking:** `Pending` ➔ `Approved` ➔ `Ready for Pickup` ➔ `Completed` / `Cancelled`.
- **In-App Notification Bell:** Real database-driven notifications sent when requests are received, approved, or ready for collection.

### 🛡️ 4. Comprehensive Admin Dashboard (`/admin`)
- **Real Database-Driven Overview:** Total users, active donors, recipient NGOs, active listings, pending requests, and total food rescued (kg). **Zero hardcoded numbers.**
- **User Management:** Search, filter by role/status, activate, suspend, or update account roles. Includes guardrails preventing an administrator from locking out the last active admin.
- **Food Listing Moderation:** Review, approve, reject with reason notes, close, or restore listings with audit logging and donor notifications.
- **Donation & Dispute Tracking:** Complete traceable record of all requests and transfers.
- **NGO Verification Center:** Review 501(c)(3) documentation and assign verified badges.
- **Interactive Reports & Analytics:** Recharts time-series trends, category breakdown charts, and top donor leaderboards.
- **Real CSV Export:** Download platform donation and impact reports as `.csv` files.
- **Immutable Security Audit Log:** Traceable log recording admin ID, action, target record, timestamp, and IP address.
- **Support & Inquiries Management:** Manage incoming inquiries with status tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js, REST API, JWT Authentication, bcryptjs, Multer |
| **Database** | Relational Database Architecture: Dual-mode supporting **MySQL 8.0+** and zero-setup **SQLite 3** |
| **Testing** | Node.js Automated Test Suite verifying transactions, inventory concurrency, auth, and CSV streams |

---

## 💻 Running the Project in Visual Studio Code

### Prerequisites
1. **Node.js** (v18 or higher recommended; tested on v24)
2. **Visual Studio Code**

---

### Step 1: Open the Project in VS Code
Open VS Code, select **File ➔ Open Folder...**, and select the `saveplate` directory.

---

### Step 2: Open a Terminal
In VS Code, press `` Ctrl + ` `` (or select **Terminal ➔ New Terminal**).

---

### Step 3: Install Dependencies
Run the following command in the root `saveplate` directory:

```bash
# Install root, backend, and frontend dependencies
npm install
npm --prefix server install
npm --prefix client install
```

*(Note: Dependencies are already pre-installed in the workspace).*

---

### Step 4: Configure the Database

SAVEPLATE features a dual-mode database layer:
- **Instant Zero-Config SQLite (Default):** Runs immediately out of the box without installing or starting any external database server. The database file and all 19 tables are created and seeded automatically.
- **MySQL 8.0+ (Production):** To use MySQL, simply edit the `.env` file in the root folder:

```ini
DB_CLIENT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=saveplate_db
```

To initialize your MySQL database with the complete schema and seed data:
```bash
# In MySQL Workbench, phpMyAdmin, or MySQL CLI:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

### Step 5: Provision the Administrator Account
Run the secure server-side setup script to initialize the platform administrator:

```bash
npm run create-admin
```

This reads credentials from `.env`, hashes the password with bcrypt, provisions the account, and records the event in the security audit trail.

---

### Step 6: Start the Application

To launch both the Backend API server (Port 5000) and the Vite Frontend (Port 5173) with a single command:

```bash
npm run dev
```

Open your browser and navigate to:
- **Frontend Web Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Configured Test Accounts

For effortless testing, the Login page includes **one-click evaluator buttons** for each role:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@saveplate.org` | `Admin@SavePlate2026!` | Full access to `/admin` dashboard, user management, moderation, audit logs |
| **Restaurant Donor** | `contact@greenbistro.com` | `Password@123` | Create listings, accept/reject requests, mark ready for pickup |
| **NGO / Food Bank** | `sarah.miller@communitytable.org` | `Password@123` | Request surplus food, track requests, view pickup verification codes |
| **Community Recipient** | `elena.rodriguez@familycare.org` | `Password@123` | Browse available meals, request quantities, track orders |

---

## 🧪 Automated Testing

To run the automated backend test suite verifying all 16 business rules, atomic inventory deductions, concurrency protections, and admin permissions:

```bash
npm test
```

Expected output:
```text
  ✓ PASS: API Health check returns 200 and healthy status
  ✓ PASS: Brand identifier returns "SAVEPLATE"
  ✓ PASS: Public stats endpoint returns live database metrics
  ✓ PASS: Admin login authenticates successfully with role "admin"
  ✓ PASS: Donor user authenticates with role "donor"
  ✓ PASS: Recipient / NGO authenticates successfully
  ✓ PASS: RBAC Security: Non-admin users are rejected with 403 Forbidden from admin endpoints
  ✓ PASS: Admin successfully accesses database-driven admin metrics
  ✓ PASS: Donor can create new surplus food listing
  ✓ PASS: Recipient successfully requests food and receives verification code
  ✓ PASS: Business Rule Enforced: Overclaiming more quantity than available is rejected
  ✓ PASS: Donor updates request status to "approved"
  ✓ PASS: Inventory Concurrency Check: Remaining quantity accurately decremented to 15
  ✓ PASS: Request completed and logged to donations table
  ✓ PASS: Admin audit log captures system actions and is queryable
  ✓ PASS: Admin CSV export generates real tabular data stream
```

---

## 🏛️ Database Schema Architecture (19 Tables)

The database schema (`database/schema.sql`) contains 19 normalized relational tables:

1. `users`: Credentials, hashed passwords (bcrypt), system roles, and account statuses.
2. `user_profiles`: Contact details, addresses, organization names, and bios.
3. `organizations`: Verification statuses, tax IDs, 501(c)(3) registration numbers, and website links.
4. `food_categories`: Food taxonomy classifications, slugs, icons, and status flags.
5. `food_listings`: Core inventory records with initial vs. remaining quantities, pickup deadlines, storage protocols, and allergen tags.
6. `food_images`: Stored URLs, primary image indicators, and captions.
7. `food_requests`: Reservations with verification codes, statuses, and donor/recipient notes.
8. `donations`: Completed transactions tracking kilograms and servings rescued.
9. `donation_status_history`: Complete audit trail of every status transition.
10. `notifications`: In-app event alerts (requests, approvals, pickup readiness).
11. `ngo_verifications`: Legal documentation submissions and admin review records.
12. `contact_messages`: Public inquiries with status tracking.
13. `feedback`: User ratings and comments.
14. `support_tickets`: Issue tracking with ticket numbers and priority levels.
15. `announcements`: Broadcast announcements displayed across the platform.
16. `articles`: Educational food waste guides and cold-chain articles.
17. `faqs`: Searchable frequently asked questions.
18. `audit_logs`: Immutable security log capturing administrator operations.
19. `platform_settings`: Dynamic key-value configuration values (e.g. CO₂ conversion ratios).

---

## 🔒 Security Architecture

1. **Password Security:** Passwords hashed with bcrypt (salt rounds = 10).
2. **Role-Based Access Control (RBAC):** Backend middleware strictly enforces roles (`admin`, `donor`, `ngo`, `recipient`, `volunteer`).
3. **No Self-Admin Privilege Escalation:** Public registration prohibits assigning the `admin` role.
4. **Self-Lockout Prevention:** Administrators cannot suspend or demote their own account, and the system prohibits removing the last active administrator.
5. **Inventory Concurrency Protection:** Database transactions prevent race conditions and overclaiming.
6. **Input Validation:** Strict sanitization, file type restrictions (JPEG, PNG, WebP), and upload size limits (5 MB max).
7. **Audit Trail:** Privileged actions are logged immutably with admin ID, timestamp, and IP address.

---

## 📄 License & Attribution

SAVEPLATE is open source under the MIT License. Developed for sustainable food recovery and waste prevention worldwide.

