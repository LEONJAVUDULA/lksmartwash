# LK Smart Wash - Professional User Manual 📖🌪️✨

Welcome to the **LK Smart Wash** Operations Manual. This guide provides comprehensive instructions for every user role within your laundry ecosystem.

---

## 🔑 Part 1: Unified Access Portal (New!)

We have simplified the login experience. All users (Admin, Staff, Drivers, and Customers) now use a single, intelligent login page.

### 🚀 How to Sign In
1. **Access**: Navigate to `http://localhost:3000/login`.
2. **Identifier**: Enter your **Username** (Admin), **Staff ID** (Staff/Driver), or **Phone Number** (Customer).
3. **Password**: Enter your secret password.
4. **Auto-Redirect**: The system will automatically identify your role and open your specific dashboard.

---

## 👑 Part 2: Admin Dashboard (Owner)
The Admin Dashboard is the nerve center of your business. 📊

### 📈 Growth Intelligence
The **Growth** tab provides visual deep-dives into your business performance.
- **Dynamic Toggles**: Switch between **Daily, Weekly, and Monthly** views to see revenue trends.
- **Service Split**: Visualize which services (Laundry, Dry Clean, Express) are driving your profit.
- **KPIs**: Track your **Customer Retention Rate** and **Peak Booking Hours**.

### 📑 Financial Reporting & Dual Exports
Strategically manage your data with one-click exports:
- **Excel Report**: Use the **Export Excel** button to download a complete `.xlsx` of every booking.
- **PDF Growth Summary**: Use the **PDF Report** button to generate a professional executive summary.

### 👥 Team Management (New!)
Take full control over who accesses your platform.
- **Unlimited Accounts**: Create as many Staff or Driver IDs as your business needs.
- **Custom IDs & Passwords**: Assign specific identifiers and passcodes to everyone on your team.
- **Access Control**: Instantly update credentials or delete accounts for seasonal workers.

---

## 🛡️ Part 3: Shop-Floor Staff Terminal
A secured portal designed for your operational team to manage the laundry flow. 📦

### 📦 Operational Workflow
1. **Search**: Quickly find a customer by name or phone using the top search bar.
2. **Update Status**: Use the action buttons to move an order through the lifecycle (Picked Up, Cleaning, Ready, Done).

### 🔐 Security Protocols
Staff **CANNOT** see:
- Business Revenue or Total Amounts.
- Individual Customer Wallet Balances.
- Delete buttons (prevents accidental data loss).

---

## 🚚 Part 4: Driver Logistics Module
The mobile-first portal for your recovery agents. 🛣️

### 🗺️ Route Management
- **Task List**: View all active Pickups and Deliveries.
- **Maps Integration**: Click 'Open Maps' on any task for GPS navigation.
- **Direct Contact**: Use the phone icon to call the customer directly.

---

## 👤 Part 5: Customer Portal
A seamless experience for your clients. 🛁

### 📱 Customer Experience
1. **Landing Page**: View all services and book a pickup instantly.
2. **Smart Dashboard**: 
   - **Track Status**: Live updates on their order progress.
   - **Wallet Management**: Top up their wallet for one-tap payments.
   - **Order History**: View all previous service invoices as PDFs.

---

## 🛠️ System Administration
- **Server Port**: The frontend is running on `http://localhost:3000`.
- **Backend API**: Running on port `5000`.
- **Database**: MongoDB `lksmartwash` database handles all persistence.

> [!TIP]
> Periodically backup the **LK_SMART_WASH_SRC_V1.zip** archive to ensure your source code is safe. 🌪️🦾✨🏆🏁
