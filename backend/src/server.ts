import { createApp } from './app.js';
import { ENV } from './config/env.js';

const app = createApp();
const PORT = ENV.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.info(`=======================================================`);
  console.info(`  MAGADH TYRES Backend Microservice Started Successfully`);
  console.info(`  Environment: ${ENV.NODE_ENV}`);
  console.info(`  Port: ${PORT}`);
  console.info(`  Health Check: http://localhost:${PORT}/api/health`);
  console.info(`  Products API: http://localhost:${PORT}/api/products`);
  console.info(`  Orders API:   http://localhost:${PORT}/api/orders`);
  console.info(`=======================================================`);
});
