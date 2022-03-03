const express = require('express');
const router = express.Router();
const {isLoggedIn} = require("../middleware/user");

const { sendStripeKey, captureStripePayment } = require("../controllers/paymentController");

router.route("/stripekey").get(isLoggedIn, sendStripeKey)

router.route("/stripePayment").post(isLoggedIn, captureStripePayment);

module.exports = router;