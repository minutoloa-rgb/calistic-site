"type": "module"
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Basic validation
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        tags: ['waitlist'],
      }),
    });

    const data = await response.json();

    if (response.ok || response.status === 201) {
      return res.status(200).json({ success: true, message: "You're on the list!" });
    }

    // Already subscribed is still a success from user's perspective
    if (response.status === 400 && JSON.stringify(data).includes('already')) {
      return res.status(200).json({ success: true, message: "You're already on the list!" });
    }

    return res.status(400).json({ error: 'Could not subscribe. Please try again.' });

  } catch (error) {
    console.error('Buttondown API error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
