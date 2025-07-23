module.exports = async function (context, req) {
  // Set CORS headers
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json'
    }
  };
  
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    context.res.body = '';
    return;
  }

  // Simple test response with debug info
  const response = {
    success: true,
    message: 'Azure API test successful!',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'] || 'Not provided',
    origin: req.headers.origin || 'Not provided',
    referer: req.headers.referer || 'Not provided'
  };

  context.log('Test endpoint accessed:', response);
  
  context.res.status = 200;
  context.res.body = response;
};