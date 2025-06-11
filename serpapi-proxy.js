import express from 'express';
import fetch from 'node-fetch';

const app = express();

app.get('/api/serpapi-proxy', async (req, res) => {
  const { q } = req.query;
  const apiKey = 'fd4f8562688510f66d448e7c21beaf36d015aa4d';
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${apiKey}&tbm=isch&hl=en&num=5`;
  try {
    const serpRes = await fetch(url);
    const data = await serpRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from SerpAPI' });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));