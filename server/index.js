import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name properly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the server
const start = async () => {
  // Create Fastify instance with better error logging
  const fastify = Fastify({
    logger: {
      level: 'debug', // More detailed logging
      serializers: {
        err: (err) => {
          return {
            type: err.constructor.name,
            message: err.message,
            stack: err.stack
          };
        }
      }
    }
  });
  
  // Register CORS
  try {
    await fastify.register(fastifyCors, {
      origin: true
    });
    console.log('CORS registered successfully');
  } catch (err) {
    console.error('Failed to register CORS:', err);
  }
  
  // Add a simple health check route
  fastify.get('/api/health', async () => {
    return { status: 'ok', mode: 'installation' };
  });
  
  // Register only installation routes for now
  try {
    const installationRoutes = await import('./routes/installation.js');
    fastify.register(installationRoutes.default, { prefix: '/api/installation' });
    console.log('Installation routes registered successfully');
  } catch (err) {
    console.error('Failed to register installation routes:', err);
    // Continue anyway - don't let this stop the server
  }
  
  // Skip static file handling for now - focus on getting API working
  console.log('Skipping static file handling to ensure server starts');

  // Or you can use a simple handler without the plugin:
  fastify.get('/', async (request, reply) => {
    return reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
      <head><title>WebSchedulr</title></head>
      <body>
        <h1>WebSchedulr API Server</h1>
        <p>API server is running. Please use the client application.</p>
      </body>
      </html>
    `);
  });
  
  try {
    // Start the server
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('======================================');
    console.log('Server running on port 3001');
    console.log('======================================');
  } catch (err) {
    console.error('CRITICAL ERROR starting server:', err);
    process.exit(1);
  }
};

// Start the server with error handling
try {
  start();
} catch (err) {
  console.error('Fatal error in start function:', err);
  process.exit(1);
}