const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
  phone: String,
  amount: mongoose.Schema.Types.Mixed,
  status: String,
  paymentStatus: String
});
const Booking = mongoose.model("Booking", bookingSchema);

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/lksmartwash");
  const bookings = await Booking.find({ phone: "9030347111" });
  console.log(JSON.stringify(bookings, null, 2));
  process.exit();
}
check();
