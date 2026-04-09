// api/subscribe.js
// Requires "type": "module" in root package.json

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate input
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  // Verify API key exists
  if (!process.env.BUTTONDOWN_API_KEY) {
    console.error('BUTTONDOWN_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,   // NOT "email" — this changed in API version 2024-07-01
      }),
    });

    const data = await response.json();
    console.log('Buttondown response:', response.status, JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || data.code || 'Subscription failed',
      });
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Buttondown API error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
