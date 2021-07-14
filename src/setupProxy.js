const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    createProxyMiddleware('/api/users', {
      target: 'http://localhost:9988',
      changeOrigin: true,
    }),
  );
  app.use(
    createProxyMiddleware('/api/user', {
      target: 'http://localhost:9988',
      changeOrigin: true,
    }),
  );
};
