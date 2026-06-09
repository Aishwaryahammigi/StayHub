const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingsController = require("../controllers/bookings.js");

// Route to view all bookings of logged-in user
router.get("/bookings", isLoggedIn, wrapAsync(bookingsController.listBookings));

// Checkout routes
router.route("/listings/:id/book")
  .get(isLoggedIn, wrapAsync(bookingsController.renderCheckoutForm))
  .post(isLoggedIn, wrapAsync(bookingsController.createBooking));

module.exports = router;
