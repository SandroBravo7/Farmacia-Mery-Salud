const MERY_API_BASE =
  ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
  ['3000', '5500'].includes(window.location.port)
    ? 'http://localhost:8080'
    : '';
