export default async function handler(req, res) {
  const apiKey = process.env.VITE_NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'News API key not configured' });
  }

  const category = req.query.category || 'general';

  try {
    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=10&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
