
const TripPlan = require("../models/TripPlan");

module.exports = async (req, res, next) => {
  try {
    const trip = await TripPlan.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).send({ error: "Access denied" });
    }

    req.trip = trip; // store trip for later use
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
