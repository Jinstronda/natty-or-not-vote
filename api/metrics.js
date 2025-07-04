export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET and POST requests
  if (req.method === 'GET' || req.method === 'POST') {
    const metrics = {
      timestamp: new Date().toISOString(),
      status: 'ok',
      service: 'nattyorjuicy',
      version: '1.0.0'
    };

    res.status(200).json(metrics);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 