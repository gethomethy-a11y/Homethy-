export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { priceId, quantity = 1, email } = req.body;
    const amount = getAmount(priceId, quantity);

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: String(amount),
        currency: 'usd',
        'payment_method_types[]': 'card',
        'metadata[email]': email || '',
        'metadata[priceId]': priceId || ''
      }).toString()
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    return res.status(200).json({ clientSecret: data.client_secret });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function getAmount(priceId, quantity) {
  if (priceId === 'price_1TakiXGIIDY7SIDyVOWrdtTc') return 1700; // All 4 rooms $17
  if (priceId === 'price_1Taki4GIIDY7SIDy5UWaZj05') return 300;  // Deep scan $3
  return 500 * (quantity || 1);                                    // Per room $5
}
