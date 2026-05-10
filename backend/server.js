require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lksmartwash";
const SECRET = process.env.JWT_SECRET || "LKSMARTWASH_SECRET_KEY";

// SYSTEM LOGS
let systemLogs = [];

// TWILIO CONFIG (Hardened against invalid seeds)
let twilioClient = null;
if (process.env.TWILIO_SID?.startsWith("AC") && process.env.TWILIO_TOKEN) {
    try {
        twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    } catch (e) {
        console.error("Twilio Init Failed:", e.message);
    }
}
const TWILIO_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

// REAL WHATSAPP SENDER
const sendWhatsAppNotification = async (name, phone, status, amount) => {
  const messages = {
    received: `✅ Order Received! Hi ${name}, we've received your booking at LK Smart Wash. Pickup is being scheduled.`,
    processing: `🔄 Processing: Hi ${name}, your laundry is now in the processing queue.`,
    cleaning: `🧼 Cleaning: Great news ${name}! Your clothes are currently being cleaned with care.`,
    ready_for_pickup: `👕 Ready: Hi ${name}, your laundry is clean and ready! Total amount: ₹${amount || 0}.`,
    delivered: `🚚 Delivered: Hi ${name}, your laundry has been delivered. Thank you!`,
    completed: `🎉 Completed: Hi ${name}, transaction closed. Hope you loved our service! ⭐`,
    assigned_pickup: `🛵 Pickup Update: Hi ${name}, a driver has been assigned for your pickup! Driver will arrive shortly.`,
    assigned_delivery: `📦 Delivery Update: Hi ${name}, your clean laundry is on the way! Our driver is heading to you.`,
    payment_success: `💰 Payment Received: Hi ${name}, we have confirmed your payment of ₹${amount}. Thank you!`,
    tier_upgrade: `🌟 Level Up! Hi ${name}, you've been promoted to ${status} status! Enjoy your new perks.`,
    subscription_active: `📦 Subscription Active: Hi ${name}, your ${status} is now active! weight credit: ${amount}kg.`,
    referral_bonus: `🎁 Referral Bonus: Hi ${name}, your friend joined! You've earned 500 Reward Points.`
  };

  const text = messages[status];
  if (!text) return;

  // 1. Audit to System Logs (Always)
  const logItem = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    to: `${name} (${phone})`,
    message: text,
    timestamp: new Date().toLocaleTimeString()
  };
  systemLogs.unshift(logItem);
  if (systemLogs.length > 50) systemLogs.pop();

  // 2. Send Real WhatsApp if Twilio is Configured
  if (twilioClient) {
    try {
      // Format number to E.164 (Assuming India +91 if not specified)
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      await twilioClient.messages.create({
        from: TWILIO_NUMBER,
        to: `whatsapp:${formattedPhone}`,
        body: text
      });
      console.log(`✅ Real WhatsApp sent to ${formattedPhone}`);
    } catch (err) {
      console.error("❌ Twilio Error:", err.message);
    }
  } else {
    // FALLBACK TO MOCK
    console.log("\n" + "=".repeat(50));
    console.log("📢  [MOCK WHATSAPP NOTIFICATION SENT] (Set TWILIO keys in .env for real)");
    console.log(`👤  TO: ${name} (${phone})`);
    console.log(`💬  MESSAGE: ${text}`);
    console.log("=".repeat(50) + "\n");
  }
};

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE ---
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.adminId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function verifyUserToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function verifyDriverToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.driverId = decoded.id;
    req.storeLocation = decoded.storeLocation;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function verifyStaffToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.staffId = decoded.id;
    req.storeLocation = decoded.storeLocation;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/*
LOYALTY ENGINE HELPERS
*/
const calculateLoyaltyPoints = async (user, amount, storeLocation) => {
  const basePercent = 0.1; // 10%
  let areaMultiplier = 1.0;
  let frequencyMultiplier = 1.0;

  // 1. Area Multiplier (Rural vs Urban)
  // Mapping based on user preference: Koramangala & Main Store = Urban, others Rural for now
  const urbanStores = ["Main Store", "Koramangala", "Indiranagar"];
  const isRural = !urbanStores.includes(storeLocation) || storeLocation === "Rural Junction";
  
  if (isRural) {
    areaMultiplier = 1.5; // Rural Bonus
  }

  // 2. Frequency Streak (Orders in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const orderCount = await Booking.countDocuments({
    phone: user.phone,
    status: "completed",
    createdAt: { $gte: thirtyDaysAgo }
  });

  if (orderCount >= 20) frequencyMultiplier = 1.5; // Power User
  else if (orderCount >= 8) frequencyMultiplier = 1.2; // Regular

  const points = Math.floor(amount * basePercent * areaMultiplier * frequencyMultiplier);
  return { points, areaMultiplier, frequencyMultiplier, orderCount };
};

const syncUserTier = async (user) => {
  let tier = user.loyaltyTier || "Silver";
  const spend = user.totalSpent || 0;

  if (spend >= 25000) tier = "Diamond";
  else if (spend >= 15000 && tier !== "Diamond") tier = "Platinum";
  else if (spend >= 5000 && tier !== "Diamond" && tier !== "Platinum") tier = "Gold";

  if (tier !== user.loyaltyTier) {
    user.loyaltyTier = tier;
    return true;
  }
  return false;
};
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });


/*
SCHEMA
*/
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String },
  storeLocation: { type: String, default: "Main Store" },
  serviceType: { type: String, required: true },
  amount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: "cash" }, // cash, upi, online
  paymentStatus: { type: String, default: "pending" }, // pending, paid
  orderType: { type: String, default: "post-paid" }, // pre-paid, post-paid
  status: {
    type: String,
    enum: ["pending", "received", "processing", "cleaning", "ready_for_pickup", "delivered", "completed"],
    default: "pending"
  },
  pickupDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
  deliveryDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
  pickupAccepted: { type: Boolean, default: false },
  deliveryAccepted: { type: Boolean, default: false },
  estimatedReadyDate: { type: Date },
  isFlashDelivery: { type: Boolean, default: false },
  pickupPhoto: { type: String, default: null },
  deliveryPhoto: { type: String, default: null },
  selectedItems: [{ itemName: String, price: Number, quantity: Number }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model("Booking", bookingSchema);

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  reply: { type: String, default: "" },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

/*
LOYALTY & INTELLIGENCE HELPERS
*/
const generateReferralCode = (name) => {
  const prefix = name.substring(0, 4).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${random}`;
};

const calculateEstimatedReadyDate = async (items, storeLocation) => {
  let minutesToAdd = 24 * 60; // Base: 24 Hours
  
  // Complexity weights (minutes)
  const weights = { "Saree": 45, "Suit": 60, "Shirt": 30, "Trouser": 30, "Blanket": 90 };
  
  if (items && Array.isArray(items)) {
    items.forEach(item => {
      const weight = weights[item.itemName] || 30; // Default: 30m
      minutesToAdd += weight * (item.quantity || 1);
    });
  }

  // Store Load Multiplier
  const activeOrders = await Booking.countDocuments({ 
    storeLocation, 
    status: { $in: ["pending", "received", "processing", "cleaning"] } 
  });
  
  // +10% time for every 10 active orders
  const loadMultiplier = 1 + (activeOrders / 100);
  const finalMinutes = Math.floor(minutesToAdd * loadMultiplier);
  
  return new Date(Date.now() + finalMinutes * 60 * 1000);
};


/*
ADMIN SCHEMA
*/
const adminSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  }

});

/*
CREATE DEFAULT ADMIN IF NOT EXISTS
*/
/*
ADMIN MODEL
*/
const Admin = mongoose.model("Admin", adminSchema);

/*
USER SCHEMA (For Customers)
*/
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyTier: { type: String, enum: ["Silver", "Gold", "Platinum", "Diamond"], default: "Silver" },
  totalSpent: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  referralCount: { type: Number, default: 0 }, // Monthly referrals
  subscription: {
    planName: { type: String, default: null },
    remainingWeight: { type: Number, default: 0 },
    expiryDate: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

/*
DRIVER SCHEMA (For Staff)
*/
const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  driverId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  storeLocation: { type: String, default: "Main Store" }
});

const Driver = mongoose.model("Driver", driverSchema);

/*
STAFF SCHEMA (For Shop-Floor)
*/
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  staffId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  storeLocation: { type: String, default: "Main Store" }
});

const Staff = mongoose.model("Staff", staffSchema);

const storeConfigSchema = new mongoose.Schema({
  locationName: { type: String, required: true, unique: true },
  dailyGoal: { type: Number, default: 2000 },
  monthlyGoal: { type: Number, default: 60000 },
  fixedCosts: {
    salaries: { type: Number, default: 0 },
    rent: { type: Number, default: 0 },
    fuel: { type: Number, default: 0 },
    chemicals: { type: Number, default: 0 },
    maintenance: { type: Number, default: 0 }
  },
  updatedAt: { type: Date, default: Date.now }
});

const StoreConfig = mongoose.model("StoreConfig", storeConfigSchema);

const expenseSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ["salaries", "rent", "fuel", "chemicals", "maintenance", "other"] },
  storeLocation: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: String
});

const Expense = mongoose.model("Expense", expenseSchema);

// GLOBAL CONFIG (Pricing & Settings)
const globalConfigSchema = new mongoose.Schema({
  id: { type: String, default: "system_global", unique: true },
  pricing: [
    { serviceName: String, price: Number }
  ],
  inventoryThreshold: { type: Number, default: 5 },
  updatedAt: { type: Date, default: Date.now }
});

const GlobalConfig = mongoose.model("GlobalConfig", globalConfigSchema);

// INVENTORY SCHEMA
const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: "units" }, // kg, liters, units
  lastRefill: { type: Date, default: Date.now }
});

const Inventory = mongoose.model("Inventory", inventorySchema);

async function createDefaultAdmin() {
  await Admin.deleteMany({}); // Optional: Reset for clean start if needed, but let's just check
  const existing = await Admin.findOne();
  if (!existing) {
    const hash = await bcrypt.hash("0000", 10);
    await Admin.create({ username: "admin", password: hash });
  }

  // DEFAULT GLOBAL PRICING
  const existingPricing = await GlobalConfig.findOne({ id: "system_global" });
  if (!existingPricing) {
    await GlobalConfig.create({
      id: "system_global",
      pricing: [
        { serviceName: "Wash & Fold", price: 100 },
        { serviceName: "Wash & Iron", price: 150 },
        { serviceName: "Dry Clean", price: 200 },
        { serviceName: "Premium Wash", price: 300 }
      ]
    });
    console.log("Default global pricing initialized.");
  }

  // DEFAULT INVENTORY
  const invCount = await Inventory.countDocuments();
  if (invCount === 0) {
    await Inventory.insertMany([
      { itemName: "Surf Excel (Liquid)", quantity: 20, unit: "liters" },
      { itemName: "Comfort Softener", quantity: 10, unit: "liters" },
      { itemName: "Packing Bags", quantity: 100, unit: "units" },
      { itemName: "Hangers", quantity: 50, unit: "units" }
    ]);
    console.log("Initial inventory items added.");
  }

  // DEFAULT DRIVER
  const existingDriver = await Driver.findOne({ driverId: "driver1" });
  if (!existingDriver) {
    const hash = await bcrypt.hash("1234", 10);
    await Driver.create({
      name: "Main Driver",
      driverId: "driver1",
      password: hash
    });
    console.log("Default driver created: driver1/1234");
  }

  // DEFAULT STAFF
  const existingStaff = await Staff.findOne({ staffId: "staff1" });
  if (!existingStaff) {
    const hash = await bcrypt.hash("1234", 10);
    await Staff.create({
      name: "Main Staff",
      staffId: "staff1",
      password: hash
    });
    console.log("Default staff created: staff1/1234");
  }

}

createDefaultAdmin();

/*
STORE LOCATION MAPPING & UTILITIES
*/
const STORE_PINCODES = {
  "Downtown": ["110001", "110002", "110003"],
  "West End": ["110045", "110046", "110048"],
  "East Plaza": ["110091", "110092"],
  "South Mall": ["110017", "110018", "110019"]
};

const getStoreFromPincode = (pincode) => {
  for (const [store, pins] of Object.entries(STORE_PINCODES)) {
    if (pins.includes(pincode)) return store;
  }
  return null; // No auto-match
};

/*
UNIFIED MULTI-ROLE LOGIN
*/
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Identifier and password required" });
    }

    // 1. Check Admin
    const admin = await Admin.findOne({ username: identifier });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (match) {
        const token = jwt.sign({ id: admin._id, role: "admin" }, SECRET, { expiresIn: "1d" });
        return res.json({ token, role: "admin", name: "Administrator" });
      }
    }

    // 2. Check Staff
    const staff = await Staff.findOne({ staffId: identifier });
    if (staff) {
      const match = await bcrypt.compare(password, staff.password);
      if (match) {
        const token = jwt.sign(
          { id: staff._id, role: "staff", storeLocation: staff.storeLocation }, 
          SECRET, 
          { expiresIn: "7d" }
        );
        return res.json({ token, role: "staff", name: staff.name, storeLocation: staff.storeLocation });
      }
    }

    // 3. Check Driver
    const driver = await Driver.findOne({ driverId: identifier });
    if (driver) {
      const match = await bcrypt.compare(password, driver.password);
      if (match) {
        const token = jwt.sign(
          { id: driver._id, role: "driver", storeLocation: driver.storeLocation }, 
          SECRET, 
          { expiresIn: "7d" }
        );
        return res.json({ token, role: "driver", name: driver.name, storeLocation: driver.storeLocation });
      }
    }

    // 4. Check Customer (User)
    const user = await User.findOne({ phone: identifier });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user._id, role: "customer" }, SECRET, { expiresIn: "7d" });
        return res.json({ 
          token, 
          role: "customer", 
          user: { id: user._id, name: user.name, phone: user.phone, walletBalance: user.walletBalance, loyaltyPoints: user.loyaltyPoints } 
        });
      }
    }

    // If none match
    res.status(401).json({ error: "Invalid credentials" });

  } catch (err) {
    console.error("Unified Login Error:", err);
    res.status(500).json({ error: "Login process failed" });
  }
});

/*
ADMIN LOGIN
*/
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: admin._id }, SECRET, { expiresIn: "1d" });
  res.json({ token });
});

/*
CUSTOMER AUTH
*/
app.post("/api/user/register", async (req, res) => {
  try {
    const { name, phone, password, referralCode } = req.body;
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ error: "Phone number already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ 
        name, 
        phone, 
        password: hash,
        referralCode: generateReferralCode(name)
    });

    // Handle Referral logic
    if (referralCode) {
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (referrer && (referrer.referralCount || 0) < 10) {
            user.referredBy = referrer._id;
            user.loyaltyPoints = 200; // New user bonus
            
            referrer.loyaltyPoints += 500; // Referrer bonus
            referrer.referralCount = (referrer.referralCount || 0) + 1;
            await referrer.save();

            systemLogs.unshift({
                id: Date.now().toString(),
                to: `${referrer.name} (${referrer.phone})`,
                message: `🎁 Referral Reward: +500 points for inviting ${name}`,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    }

    await user.save();
    
    // TRIGGER WHATSAPP (REFERRAL BONUS)
    if (user.referredBy) {
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
            sendWhatsAppNotification(referrer.name, referrer.phone, "referral_bonus", 500);
            
            // Milestone Rewards (Loyalty Points only)
            if (referrer.referralCount === 5) {
                referrer.loyaltyPoints += 1000; // Milestone 1: 1000 points
                await referrer.save();
                systemLogs.unshift({
                    id: Date.now().toString(),
                    to: `${referrer.name} (${referrer.phone})`,
                    message: `🏆 Milestone Unlocked! 5 Referrals → +1,000 Loyalty Points awarded`,
                    timestamp: new Date().toLocaleTimeString(),
                    status: "sent"
                });
                sendWhatsAppNotification(referrer.name, referrer.phone, "milestone_reached", 1000);
            } else if (referrer.referralCount === 10) {
                referrer.loyaltyPoints += 2500; // Milestone 2: 2500 points
                await referrer.save();
                systemLogs.unshift({
                    id: Date.now().toString(),
                    to: `${referrer.name} (${referrer.phone})`,
                    message: `🌟 MEGA Milestone! 10 Referrals → +2,500 Loyalty Points awarded`,
                    timestamp: new Date().toLocaleTimeString(),
                    status: "sent"
                });
                sendWhatsAppNotification(referrer.name, referrer.phone, "milestone_reached", 2500);
            }
        }
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, user: { name, phone, walletBalance: user.walletBalance, loyaltyPoints: user.loyaltyPoints, referralCode: user.referralCode } });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

app.get("/api/user/check-referral/:code", async (req, res) => {
    try {
        const user = await User.findOne({ referralCode: req.params.code.toUpperCase() });
        if (user) res.json({ valid: true, name: user.name });
        else res.json({ valid: false });
    } catch (err) { res.status(500).json({ error: "Check failed" }); }
});

/*
SUBSCRIPTION API
*/
app.post("/api/user/subscribe", verifyUserToken, async (req, res) => {
    try {
        const { planId } = req.body;
        const user = await User.findById(req.userId);
        
        const plans = {
            "starter": { name: "Starter Pack", price: 1500, weight: 12 },
            "pro": { name: "Pro Pack", price: 3500, weight: 30 },
            "elite": { name: "Elite Pack", price: 6000, weight: 60 }
        };

        const plan = plans[planId];
        if (!plan) return res.status(400).json({ error: "Invalid plan" });
        if (user.walletBalance < plan.price) return res.status(400).json({ error: "Insufficient wallet balance" });

        user.walletBalance -= plan.price;
        user.subscription = {
            planName: plan.name,
            remainingWeight: plan.weight,
            expiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 Days
        };

        await user.save();
        
        // TRIGGER WHATSAPP
        sendWhatsAppNotification(user.name, user.phone, "subscription_active", plan.weight);
        
        res.json({ message: `Subscribed to ${plan.name}!`, subscription: user.subscription });
    } catch (err) { res.status(500).json({ error: "Subscription failed" }); }
});

app.post("/api/user/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, user: { name: user.name, phone: user.phone, walletBalance: user.walletBalance, loyaltyPoints: user.loyaltyPoints } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/user/profile", verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.get("/api/user/bookings", verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const bookings = await Booking.find({ phone: user.phone }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
});

app.post("/api/user/wallet/topup", verifyUserToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    );
    res.json({ balance: user.walletBalance, message: "Top-up successful!" });
  } catch (err) {
    res.status(500).json({ error: "Top-up failed" });
  }
});

app.post("/api/user/wallet/redeem", verifyUserToken, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.userId);
    if (!user || user.loyaltyPoints < points) {
      return res.status(400).json({ error: "Insufficient points" });
    }
    
    // 100 Points = ₹10 Conversion (Divide by 10)
    const cashValue = Math.floor(points / 10);
    if (cashValue < 1) return res.status(400).json({ error: "Minimum 10 points required for redemption" });
    
    user.loyaltyPoints -= (cashValue * 10); // Deduct only what was converted
    user.walletBalance += cashValue;
    await user.save();
    
    res.json({ balance: user.walletBalance, points: user.loyaltyPoints });
  } catch (err) {
    res.status(500).json({ error: "Redemption failed" });
  }
});

// LOYALTY DASHBOARD & REDEMPTION
app.get("/api/user/loyalty/stats", verifyUserToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("walletBalance loyaltyPoints loyaltyTier totalSpent name phone");
        
        // Sync tier in real-time just in case
        await syncUserTier(user);
        await user.save();
        
        // Calculate current streak
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const orderCount = await Booking.countDocuments({
            phone: user.phone,
            status: "completed",
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            ...user._doc,
            monthlyOrders: orderCount,
            nextTierSpend: user.loyaltyTier === "Diamond" ? 0 : (user.loyaltyTier === "Platinum" ? 25000 : (user.loyaltyTier === "Gold" ? 15000 : 5000))
        });
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.post("/api/user/loyalty/redeem", verifyUserToken, async (req, res) => {
    try {
        const { pointsToRedeem } = req.body;
        const user = await User.findById(req.userId);
        
        if (pointsToRedeem < 100 || pointsToRedeem > user.loyaltyPoints) {
            return res.status(400).json({ error: "Min 100 points required or insufficient balance" });
        }

        const cashValue = Math.floor(pointsToRedeem / 10); // 100 pts = ₹10
        user.loyaltyPoints -= pointsToRedeem;
        user.walletBalance += cashValue;
        await user.save();
        
        res.json({ message: `Successfully redeemed ₹${cashValue}!`, walletBalance: user.walletBalance, loyaltyPoints: user.loyaltyPoints });
    } catch (err) { res.status(500).json({ error: "Redemption failed" }); }
});

app.post("/api/user/loyalty/buy-tier", verifyUserToken, async (req, res) => {
    try {
        const { tier } = req.body;
        const tierCosts = { "Gold": 500, "Platinum": 1500, "Diamond": 2500 };
        const cost = tierCosts[tier];
        
        if (!cost) return res.status(400).json({ error: "Invalid tier upgrade request" });
        
        const user = await User.findById(req.userId);
        if (user.loyaltyPoints < cost) return res.status(400).json({ error: "Insufficient points for upgrade" });
        
        user.loyaltyPoints -= cost;
        user.loyaltyTier = tier;
        await user.save();
        
        res.json({ message: `Welcome to ${tier} Tier!`, loyaltyTier: user.loyaltyTier, loyaltyPoints: user.loyaltyPoints });
    } catch (err) { res.status(500).json({ error: "Upgrade failed" }); }
});

app.get("/api/admin/loyalty-stats", verifyToken, async (req, res) => {
    try {
        const users = await User.find().select("name phone walletBalance loyaltyPoints loyaltyTier totalSpent").sort({ totalSpent: -1 });
        
        const stats = {
            totalPoints: users.reduce((acc, u) => acc + (u.loyaltyPoints || 0), 0),
            totalWallet: users.reduce((acc, u) => acc + (u.walletBalance || 0), 0)
        };

        res.json({ users, stats });
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

// Community Leaderboard API
app.get("/api/user/community/leaderboard", async (req, res) => {
    try {
        const topReferrers = await User.find({ referralCount: { $gt: 0 } })
            .select("name referralCount loyaltyTier")
            .sort({ referralCount: -1 })
            .limit(5);
        
        const totalCommunityPoints = await User.aggregate([
            { $group: { _id: null, total: { $sum: "$loyaltyPoints" } } }
        ]);

        res.json({ 
            topReferrers, 
            totalPlatformPoints: totalCommunityPoints[0]?.total || 0 
        });
    } catch (err) { res.status(500).json({ error: "Leaderboard fetch failed" }); }
});

// Churn Risk API
app.get("/api/admin/retention/at-risk", verifyToken, async (req, res) => {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const atRiskUsers = await User.find({
      $or: [
        { lastBookingDate: { $lt: fourteenDaysAgo } },
        { lastBookingDate: { $exists: false } }
      ]
    }).select("name phone loyaltyTier lastBookingDate totalSpent");

    res.json(atRiskUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch churn risk" });
  }
});

/*
DRIVER AUTH & API
*/
app.post("/api/driver/login", async (req, res) => {
  try {
    const { driverId, password } = req.body;
    const driver = await Driver.findOne({ driverId });
    if (!driver) return res.status(401).json({ error: "Invalid staff ID" });

    const match = await bcrypt.compare(password, driver.password);
    if (!match) return res.status(401).json({ error: "Invalid staff ID" });

    const token = jwt.sign({ id: driver._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, name: driver.name });
  } catch (err) {
    res.status(500).json({ error: "Driver login failed" });
  }
});

app.get("/api/driver/tasks", verifyDriverToken, async (req, res) => {
  try {
    // Tasks: Filtered by the driver's specific store branch
    const tasks = await Booking.find({
      storeLocation: req.storeLocation,
      status: { $in: ["pending", "ready_for_pickup"] }
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.put("/api/driver/tasks/:id/update", verifyDriverToken, async (req, res) => {
  try {
    const { status, photo } = req.body;
    
    // Map driver actions to system status
    const updatedStatus = status === "pending" ? "received" : "delivered";
    const updateData = { status: updatedStatus };
    
    if (photo) {
        if (status === "pending") updateData.pickupPhoto = photo;
        else updateData.deliveryPhoto = photo;
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // Automation: Real-Time WhatsApp
    await sendWhatsAppNotification(booking.name, booking.phone, booking.status, booking.amount);
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

/*
STAFF API (Edit-only, No Financials)
*/
app.post("/api/staff/login", async (req, res) => {
  try {
    const { staffId, password } = req.body;
    const staff = await Staff.findOne({ staffId });
    if (!staff) return res.status(401).json({ error: "Invalid staff ID" });

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(401).json({ error: "Invalid staff ID" });

    const token = jwt.sign({ id: staff._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, name: staff.name });
  } catch (err) {
    res.status(500).json({ error: "Staff login failed" });
  }
});

app.get("/api/staff/bookings", verifyStaffToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      storeLocation: req.storeLocation 
    }).sort({ createdAt: -1 });
    
    // Remove sensitive financial data before sending to staff
    const safeBookings = bookings.map(b => {
      const obj = b.toObject();
      delete obj.amount; // Staff should not see revenue
      return obj;
    });
    res.json(safeBookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.put("/api/staff/bookings/:id/status", verifyStaffToken, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    // Automation: Real-Time WhatsApp
    await sendWhatsAppNotification(booking.name, booking.phone, booking.status, booking.amount);

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

/*
ADVANCED ANALYTICS (Admin Only)
*/
app.get("/api/admin/analytics/detailed", verifyToken, async (req, res) => {
  try {
    const { storeLocation } = req.query;
    const query = (storeLocation && storeLocation !== "All") ? { storeLocation, status: { $in: ["completed", "delivered"] } } : { status: { $in: ["completed", "delivered"] } };
    const expenseQuery = (storeLocation && storeLocation !== "All") ? { storeLocation } : {};
    
    // 1. REVENUE BREAKDOWN
    const bookings = await Booking.find(query);
    let netRevenue = 0;
    let grossRevenue = 0;

    bookings.forEach(b => {
        netRevenue += (b.amount || 0);
        grossRevenue += (b.amount || 0) * (b.paymentMethod === 'wallet' ? 1.1 : 1.0); // Simple fallback
    });

    const totalOrders = bookings.length;
    const loyaltyDiscountTotal = grossRevenue - netRevenue;

    // 2. GOAL STATUS
    const config = await StoreConfig.findOne({ locationName: storeLocation === "All" ? "Main Store" : storeLocation });
    const dailyTarget = config?.dailyGoal || 1000;
    const monthlyTarget = config?.monthlyGoal || 30000;

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayBookings = bookings.filter(b => new Date(b.createdAt) >= today);
    const todayRevenue = todayBookings.reduce((s, b) => s + b.amount, 0);

    const dailyTargetReached = todayRevenue >= dailyTarget;
    const monthlyTargetReached = netRevenue >= monthlyTarget;

    // 3. EXPENSES & PROFIT
    const expenses = await Expense.find(expenseQuery);
    const totalVariableExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    
    // Fixed Costs from config
    const fixedCosts = config ? 
        (config.fixedCosts.salaries + config.fixedCosts.rent + config.fixedCosts.fuel + config.fixedCosts.chemicals + config.fixedCosts.maintenance)
        : 0;

    const totalCosts = totalVariableExpenses + fixedCosts;
    const netProfit = netRevenue - totalCosts;

    // 4. GROWTH & ACQUISITION
    const referralUsers = await User.countDocuments({ referredBy: { $ne: null } });
    const directUsers = await User.countDocuments({ referredBy: null });
    
    const acquisitionSource = [
        { name: "Referral", value: referralUsers, color: "#8b5cf6" },
        { name: "Direct", value: directUsers, color: "#3b82f6" }
    ];

    // 5. CHART DATA (Grouped by date)
    const revenueByTimeMap = {};
    bookings.forEach(b => {
        const d = new Date(b.createdAt).toLocaleDateString();
        revenueByTimeMap[d] = (revenueByTimeMap[d] || 0) + b.amount;
    });

    const revenueByTime = Object.keys(revenueByTimeMap).map(date => ({
        name: date,
        value: revenueByTimeMap[date],
        color: revenueByTimeMap[date] >= dailyTarget ? "#10b981" : "#ef4444" // Dynamic Green/Red
    })).slice(-15);

    res.json({
        overview: {
            grossRevenue,
            loyaltyDiscountTotal,
            netRevenue,
            totalOrders,
            totalCosts,
            netProfit,
            dailyTarget,
            monthlyTarget,
            todayRevenue,
            dailyTargetReached,
            monthlyTargetReached
        },
        revenueByTime,
        acquisitionSource,
        serviceMarketShare: await getServiceMarketShare(query),
        expensesByCategory: await getExpenseCategoryBreakdown(expenseQuery),
        retentionRate: Math.floor(Math.random() * 20) + 70 // Mock for now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics failed" });
  }
});

/*
REVIEWS API
*/
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to post review" });
  }
});

app.put("/api/reviews/:id/reply", verifyToken, async (req, res) => {
  try {
    const { reply } = req.body;
    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { reply },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to reply to review" });
  }
});

app.delete("/api/reviews/:id", verifyToken, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

/*
CREATE BOOKING
*/
app.post("/api/bookings", async (req, res) => {
  try {
    // Audit & Cast Amount to Number
    const rawData = req.body;
    if (rawData.amount && typeof rawData.amount === 'string') {
      const parsedAmount = parseFloat(rawData.amount.replace(/[^0-9.]/g, ''));
      rawData.amount = isNaN(parsedAmount) ? 0 : parsedAmount;
    }

    // PINCODE INTELLIGENCE
    // Auto-detect storeLocation if pincode matches, else use customer's selection
    if (rawData.pincode) {
       const mappedStore = getStoreFromPincode(rawData.pincode);
       if (mappedStore && !rawData.storeLocation) {
         rawData.storeLocation = mappedStore;
       }
    }

    // DISCOUNT CALCULATION
    let discountPercent = 0;
    if (rawData.userId) {
       const user = await User.findById(rawData.userId);
       const tierDiscounts = { "Silver": 0.05, "Gold": 0.10, "Platinum": 0.15, "Diamond": 0.20 };
       discountPercent = tierDiscounts[user.loyaltyTier] || 0;
    }

    const originalAmount = Number(rawData.amount) || 0;
    const finalAmount = Math.floor(originalAmount * (1 - discountPercent));
    rawData.amount = finalAmount; // Apply the loyalty discount

    // 3. FLASH DELIVERY TAT
    let estimatedDate;
    if (rawData.isFlashDelivery) {
        estimatedDate = new Date(Date.now() + (3 * 60 * 60 * 1000)); // Exactly 3 Hours
    } else {
        estimatedDate = await calculateEstimatedReadyDate(rawData.selectedItems, rawData.storeLocation || "Main Store");
    }
    rawData.estimatedReadyDate = estimatedDate;

    // 4. WALLET OR SUBSCRIPTION PAYMENT
    if (rawData.userId) {
        const user = await User.findById(rawData.userId);
        if (user) {
            // Check Subscription First
            const totalWeight = (rawData.selectedItems || []).reduce((acc, i) => acc + (i.itemName === 'Blanket' ? 5 : 0.5) * i.quantity, 0);
            if (user.subscription.planName && user.subscription.expiryDate > new Date() && user.subscription.remainingWeight >= totalWeight) {
                user.subscription.remainingWeight -= totalWeight;
                await user.save();
                rawData.paymentMethod = "subscription";
                rawData.paymentStatus = "paid";
            } 
            // Fallback to Wallet
            else if (rawData.paymentMethod === 'wallet') {
                if (user.walletBalance < finalAmount) {
                    return res.status(400).json({ error: "Insufficient wallet balance" });
                }
                user.walletBalance -= finalAmount;
                user.totalSpent += finalAmount;
                user.loyaltyPoints += Math.floor(finalAmount * 0.1);
                await user.save();
            }
        }
    }
    
    const booking = new Booking(rawData);
    await booking.save();
    
    // Automation: Order Confirmation Notification
    await sendWhatsAppNotification(booking.name, booking.phone, "received", booking.amount);

    res.json(booking);
  }
  catch (error) {
    console.error("Booking Error:", error.message);
    res.status(500).json({ error: "Failed to create booking: " + error.message });
  }
});


/*
GET ALL BOOKINGS
*/
app.get("/api/bookings", verifyToken, async (req, res) => {

  try {

    const bookings = await Booking
      .find()
      .sort({ createdAt: -1 });

    res.json(bookings);

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to fetch bookings"
    });

  }

});


/*
PUBLIC TRACKING FOR CUSTOMERS
*/
app.get("/api/bookings/track/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const bookings = await Booking.find({ phone })
      .select("name status amount paymentStatus serviceType createdAt orderType estimatedReadyDate")
      .sort({ createdAt: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ error: "No bookings found for this number" });
    }

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

/*
UPDATE BOOKING STATUS
Supports: received, in_progress, completed
Auto-generates WhatsApp notification URL
*/
/*
SYSTEM LOGS FOR ADMIN (Protected)
*/
app.get("/api/system-logs", verifyToken, (req, res) => {
  res.json(systemLogs);
});

app.put("/api/bookings/:id/status", verifyToken, async (req, res) => {
  try {
    const { status, amount } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (status) booking.status = status;
    if (amount !== undefined) booking.amount = amount;

    // AWARD LOYALTY POINTS ON COMPLETION (If not already paid by wallet)
    if (status === 'completed' && booking.paymentMethod !== 'wallet' && booking.amount > 0) {
       const user = await User.findOne({ phone: booking.phone });
       if (user) {
          user.loyaltyPoints += Math.floor(booking.amount * 0.1);
          await user.save();
          
          systemLogs.unshift({
            id: Date.now().toString(),
            to: `${user.name} (${user.phone})`,
            message: `🎁 Points Awarded: ${Math.floor(booking.amount * 0.1)} for completed order #${booking._id.toString().slice(-6)}`,
            timestamp: new Date().toLocaleTimeString()
          });
       }
    }

    await booking.save();

    // Trigger real WhatsApp notification
    sendWhatsAppNotification(booking.name, booking.phone, booking.status, booking.amount);

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.put("/api/bookings/:id/payment", verifyToken, async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment" });
  }
});

/* BACKWARD COMPAT: Keep /complete endpoint */
app.put("/api/bookings/:id/complete", verifyToken, async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // AWARD DYNAMIC LOYALTY POINTS
    if (updated.amount > 0 && updated.paymentMethod !== 'wallet') {
      const user = await User.findOne({ phone: updated.phone });
      if (user) {
        const { points, areaMultiplier, frequencyMultiplier, orderCount } = await calculateLoyaltyPoints(user, updated.amount, updated.storeLocation);
        
        user.loyaltyPoints += points;
        user.totalSpent += updated.amount;
        
        const tierChanged = await syncUserTier(user);
        await user.save();
        
        systemLogs.unshift({
          id: Date.now().toString(),
          to: `${user.name} (${user.phone})`,
          message: `🎁 Rewards: ${points} points awarded (${areaMultiplier}x Area, ${frequencyMultiplier}x Streak). Orders: ${orderCount}. ${tierChanged ? `PROMOTE: ${user.loyaltyTier}` : ''}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

/* 
DRIVER ASSIGNMENT & LOGISTICS 
*/
app.get("/api/drivers/list", verifyToken, async (req, res) => {
  try {
    const drivers = await Driver.find().select("name driverId storeLocation");
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

app.put("/api/bookings/:id/assign-driver", verifyToken, async (req, res) => {
  try {
    const { driverId, type } = req.body; // type: 'pickup' or 'delivery'
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (type === 'pickup') {
      booking.pickupDriverId = driverId;
      booking.pickupAccepted = false;
      // Automation: Assigned Notification
      sendWhatsAppNotification(booking.name, booking.phone, "assigned_pickup", booking.amount);
    } else {
      booking.deliveryDriverId = driverId;
      booking.deliveryAccepted = false;
       // Automation: Assigned Notification
      sendWhatsAppNotification(booking.name, booking.phone, "assigned_delivery", booking.amount);
    }

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Assignment failed" });
  }
});

app.get("/api/driver/tasks", verifyDriverToken, async (req, res) => {
  try {
    const tasks = await Booking.find({
      $or: [
        { pickupDriverId: req.driverId },
        { deliveryDriverId: req.driverId }
      ]
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch driver tasks" });
  }
});

app.put("/api/bookings/:id/accept-task", verifyDriverToken, async (req, res) => {
  try {
    const { type } = req.body; // 'pickup' or 'delivery'
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (type === 'pickup') {
      booking.pickupAccepted = true;
      booking.status = "received"; 
    } else {
      booking.deliveryAccepted = true;
      booking.status = "delivered"; 
    }

    await booking.save();
    // Trigger real WhatsApp notification
    sendWhatsAppNotification(booking.name, booking.phone, booking.status, booking.amount);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Task acceptance failed" });
  }
});

app.put("/api/driver/bookings/:id/status", verifyDriverToken, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Ensure the driver is actually assigned to this booking
    if (booking.pickupDriverId?.toString() !== req.driverId && booking.deliveryDriverId?.toString() !== req.driverId) {
      return res.status(403).json({ error: "Not authorized for this booking" });
    }

    if (status) booking.status = status;
    await booking.save();
    
    // Trigger real WhatsApp notification
    sendWhatsAppNotification(booking.name, booking.phone, booking.status, booking.amount);
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
});


/*
DELETE BOOKING
*/
app.delete("/api/bookings/:id", verifyToken, async (req, res) => {

  try {

    const deleted = await Booking.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {

      return res.status(404).json({
        error: "Booking not found"
      });

    }

    res.json({
      message: "Booking deleted"
    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to delete booking"
    });

  }

});


/*
ADMIN MANAGEMENT
*/
app.put("/api/admin/change-password", verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const admin = await Admin.findOne();
        const match = await bcrypt.compare(oldPassword, admin.password);
        if (!match) return res.status(400).json({ message: "Wrong old password" });
        
        const hash = await bcrypt.hash(newPassword, 10);
        admin.password = hash;
        await admin.save();
        res.json({ message: "Password updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update password" });
    }
});

app.put("/api/admin/change-username", verifyToken, async (req, res) => {
    const { username } = req.body;
    try {
        const admin = await Admin.findOne();
        admin.username = username;
        await admin.save();
        res.json({ message: "Username updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update username" });
    }
});

/*
TEAM MANAGEMENT (Staff & Driver Accounts)
*/
app.get("/api/admin/team", verifyToken, async (req, res) => {
  try {
    const staff = await Staff.find().select("-password");
    const drivers = await Driver.find().select("-password");
    res.json({ staff, drivers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

app.post("/api/admin/team", verifyToken, async (req, res) => {
  try {
    const { role, name, id, password, storeLocation } = req.body;
    const hash = await bcrypt.hash(password, 10);

    if (role === "staff") {
      const existing = await Staff.findOne({ staffId: id });
      if (existing) return res.status(400).json({ error: "Staff ID already exists" });
      const member = new Staff({ name, staffId: id, password: hash, storeLocation: storeLocation || "Main Store" });
      await member.save();
      return res.json(member);
    } else if (role === "driver") {
      const existing = await Driver.findOne({ driverId: id });
      if (existing) return res.status(400).json({ error: "Driver ID already exists" });
      const member = new Driver({ name, driverId: id, password: hash, storeLocation: storeLocation || "Main Store" });
      await member.save();
      return res.json(member);
    }
    res.status(400).json({ error: "Invalid role" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create team member" });
  }
});

app.put("/api/admin/team/:role/:dbId", verifyToken, async (req, res) => {
  try {
    const { role, dbId } = req.params;
    const { id, password } = req.body;
    const updates = {};
    if (id) {
       if (role === "staff") updates.staffId = id;
       else updates.driverId = id;
    }
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (role === "staff") {
      await Staff.findByIdAndUpdate(dbId, updates);
    } else {
      await Driver.findByIdAndUpdate(dbId, updates);
    }
    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/admin/team/:role/:dbId", verifyToken, async (req, res) => {
  try {
    const { role, dbId } = req.params;
    if (role === "staff") await Staff.findByIdAndDelete(dbId);
    else await Driver.findByIdAndDelete(dbId);
    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ error: "Deletion failed" });
  }
});

/*
STORE CONFIGURATION (Goals & Fixed Costs)
*/
app.get("/api/admin/store-config", verifyToken, async (req, res) => {
  try {
    const configs = await StoreConfig.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch store configs" });
  }
});

app.post("/api/admin/store-config", verifyToken, async (req, res) => {
  try {
    const { locationName, dailyGoal, monthlyGoal, salaries, rent, fuel, chemicals, maintenance } = req.body;
    let config = await StoreConfig.findOne({ locationName });
    
    if (config) {
      config.dailyGoal = dailyGoal || 0;
      config.monthlyGoal = monthlyGoal || 0;
      config.fixedCosts = { 
          salaries: salaries || 0, 
          rent: rent || 0,
          fuel: fuel || 0,
          chemicals: chemicals || 0,
          maintenance: maintenance || 0
      };
      config.updatedAt = Date.now();
      await config.save();
    } else {
      config = new StoreConfig({
        locationName,
        dailyGoal,
        monthlyGoal,
        fixedCosts: { salaries, rent }
      });
      await config.save();
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to save store configuration" });
  }
});

/*
EXPENSE MANAGEMENT
*/
app.get("/api/admin/expenses", verifyToken, async (req, res) => {
  try {
    const { storeLocation } = req.query;
    const filter = (storeLocation && storeLocation !== "All") ? { storeLocation } : {};
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

app.post("/api/admin/expenses", verifyToken, async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: "Failed to log expense" });
  }
});

/*
GLOBAL CONFIG & PRICING
*/
app.get("/api/admin/global-config", verifyToken, async (req, res) => {
  try {
    const config = await GlobalConfig.findOne({ id: "system_global" });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch global config" });
  }
});

app.post("/api/admin/global-config", verifyToken, async (req, res) => {
  try {
    const { pricing, inventoryThreshold } = req.body;
    const config = await GlobalConfig.findOneAndUpdate(
      { id: "system_global" },
      { pricing, inventoryThreshold, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to update global config" });
  }
});

app.get("/api/public/pricing", async (req, res) => {
  try {
    const config = await GlobalConfig.findOne({ id: "system_global" });
    res.json(config ? config.pricing : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pricing" });
  }
});

/*
INVENTORY MANAGEMENT
*/
app.get("/api/admin/inventory", verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

app.post("/api/admin/inventory", verifyToken, async (req, res) => {
  try {
    const { itemName, quantity, unit } = req.body;
    const item = await Inventory.findOneAndUpdate(
      { itemName },
      { $set: { quantity, unit, lastRefill: Date.now() } },
      { new: true, upsert: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update inventory" });
  }
});


app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});