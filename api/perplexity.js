// Vercel serverless function for Perplexity API proxy
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing in environment' });
  }
  const body = req.body;
  if (!body || !body.messages) {
    return res.status(400).json({ error: 'Missing messages in request body' });
  }
  try {
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: body.messages,
      }),
    });
    const data = await perplexityResponse.json();
    return res.status(perplexityResponse.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
