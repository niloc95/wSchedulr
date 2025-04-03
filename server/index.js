import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your route handlers
import authRoutes from './routes/auth.js';
import installationRoutes from './routes/installation.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Fastify instance
const fastify = Fastify({
  logger: true
});

// Register CORS
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(installationRoutes, { prefix: '/api/installation' });

// Add a root route for testing
fastify.get('/', async (request, reply) => {
  return { message: 'wSchedulr API server is running' };
});

// Add test endpoint
fastify.post('/api/test', async (request, reply) => {
  console.log('Received test request with body:', request.body);
  return { success: true, message: 'Test endpoint working' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3001,
      host: '0.0.0.0'
    });
    console.log(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();