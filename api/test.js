module.exports = async (req, res) => {
  // Very permissive CORS for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple test response with debug info
  const response = {
    success: true,
    message: 'PLAYipp connectivity test successful!',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'] || 'Not provided',
    origin: req.headers.origin || 'Not provided',
    referer: req.headers.referer || 'Not provided'
  };

  console.log('Test endpoint accessed:', response);
  
  res.status(200).json(response);
};