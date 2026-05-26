const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context) {
 if(event.httpMethod !== 'POST') {
   return { statusCode: 405, body: 'Method Not Allowed' };
 }

 try {
   const { priceId, quantity = 1, email } = JSON.parse(event.body);

   const paymentIntent = await stripe.paymentIntents.create({
     amount: getAmount(priceId, quantity),
     currency: 'usd',
     automatic_payment_methods: { enabled: true },
     metadata: { priceId, quantity, email: email || '' }
   });

   return {
     statusCode: 200,
     headers: { 'Access-Control-Allow-Origin': '*' },
     body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
   };
 } catch(err) {
   return {
     statusCode: 500,
     body: JSON.stringify({ error: err.message })
   };
 }
};

function getAmount(priceId, quantity) {
 if(priceId === 'price_1TakiXGIIDY7SIDyVOWrdtTc') return 1700; // All 4 rooms $17
 if(priceId === 'price_1Taki4GIIDY7SIDy5UWaZj05') return 300;  // Deep Scan $3
 return 500 * quantity; // Room Scan $5 x quantity
}
