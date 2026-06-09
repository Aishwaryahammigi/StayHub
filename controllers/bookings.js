const Booking = require('../models/booking');
const Listing = require('../models/listing');

module.exports.renderCheckoutForm = async (req, res) => {
  const { id } = req.params;
  const { checkin, checkout, guests } = req.query;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  if (!checkin || !checkout) {
    req.flash("error", "Please select valid check-in and check-out dates.");
    return res.redirect(`/listings/${id}`);
  }

  const checkInDate = new Date(checkin);
  const checkOutDate = new Date(checkout);
  const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(timeDifference / (1000 * 3600 * 24));

  if (nights <= 0) {
    req.flash("error", "Check-out date must be after check-in date.");
    return res.redirect(`/listings/${id}`);
  }

  const pricePerNight = listing.price;
  const basePrice = pricePerNight * nights;
  const serviceFee = Math.round(basePrice * 0.05); // 5% Service Fee
  const gst = Math.round(basePrice * 0.18); // 18% GST
  const totalPrice = basePrice + serviceFee + gst;

  // Generate a original image URL preview (e.g. thumb size) if it's a Cloudinary URL
  let originalImageUrl = listing.image.url;
  if (originalImageUrl.includes("cloudinary")) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,h_180,c_fill");
  }

  res.render("listings/checkout.ejs", {
    listing,
    checkIn: checkin,
    checkOut: checkout,
    guests: guests || 1,
    nights,
    basePrice,
    serviceFee,
    gst,
    totalPrice,
    originalImageUrl
  });
};

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests, totalPrice, paymentId } = req.body;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const booking = new Booking({
    listing: id,
    guest: req.user._id,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    guests: parseInt(guests) || 1,
    totalPrice: parseFloat(totalPrice),
    paymentId: paymentId || 'STAYHUB-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  });

  await booking.save();
  req.flash("success", "Booking confirmed! Your payment was processed successfully.");
  res.redirect("/bookings");
};

module.exports.listBookings = async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate('listing')
    .sort({ createdAt: -1 });

  res.render("listings/bookings.ejs", { bookings });
};
