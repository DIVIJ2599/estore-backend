const BigPromise = require('../middleware/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = BigPromise(async (req, res, next)=>{
    res.status(200).json({
        //Safe to send Stripe Key
        stripeKey: process.env.STRIPE_API_KEY,
    });
});

exports.captureStripePayment = BigPromise(async (req, res, next)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',

        //optional 
        metadata: {integration_check: 'accept_a_payment'}
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret
    })
});