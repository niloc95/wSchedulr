import Fastify from 'fastify';
import cors from '@fastify/cors';
import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize fastify
const fastify = Fastify({
  logger: true
});

// Register CORS
fastify.register(cors, {
  origin: true
});

// Create a minimal installation route
fastify.post('/api/installation/test-connection', async (request, reply) => {
  try {
    const config = request.body;
    
    fastify.log.info('Testing database connection');
    
    if (config.type === 'mysql') {
      // Test MySQL connection
      try {
        const mysql = await import('mysql2/promise');
        const connection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password
        });
        
        await connection.end();
        return { success: true, message: 'MySQL connection successful' };
      } catch (err) {
        return reply.status(400).send({ 
          success: false, 
          message: `MySQL connection failed: ${err.message}` 
        });
      }
    } 
    else if (config.type === 'sqlite') {
      // For SQLite, just return success (we'll create it later)
      return { success: true, message: 'SQLite will be created during installation' };
    } 
    else {
      return reply.status(400).send({ 
        success: false, 
        message: 'Unsupported database type' 
      });
    }
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ 
      success: false, 
      message: 'An error occurred while testing the connection' 
    });
  }
});

// Implement installation endpoint
fastify.post('/api/installation/perform', async (request, reply) => {
  try {
    const { admin, company, database } = request.body;
    
    // Create .env file
    const envContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_TYPE=${database.type}
DB_HOST=${database.host || 'localhost'}
DB_PORT=${database.port || '3306'}
DB_USER=${database.username || 'root'}
DB_PASSWORD=${database.password || ''}
DB_NAME=${database.database || 'webschedulr'}
${database.type === 'sqlite' ? `DB_FILENAME=${database.filename || 'database.sqlite'}` : ''}

# JWT Configuration
JWT_SECRET=your_secret_key_for_jwt_tokens
JWT_EXPIRES_IN=1d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
`;

    // Write .env file
    await fs.writeFile(path.join(__dirname, '..', '.env'), envContent);
    
    // Set up database (simplified version)
    if (database.type === 'mysql') {
      const mysql = await import('mysql2/promise');
      const connection = await mysql.createConnection({
        host: database.host,
        port: database.port,
        user: database.username,
        password: database.password
      });
      
      // Create database
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${database.database}`);
      await connection.query(`USE ${database.database}`);
      
      // Create tables (simplified)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          is_admin TINYINT(1) DEFAULT 0
        )
      `);
      
      // Create admin user
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await connection.query(`
        INSERT INTO users (first_name, last_name, email, username, password, is_admin) 
        VALUES (?, ?, ?, ?, ?, 1)
      `, [
        admin.first_name,
        admin.last_name,
        admin.email,
        admin.username,
        hashedPassword
      ]);
      
      await connection.end();
    }
    
    return { 
      success: true, 
      message: 'Installation completed successfully',
      redirect: '/calendar'
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ 
      error: 'Installation failed', 
      details: err.message
    });
  }
});

// Get status
fastify.get('/api/installation/status', async (request, reply) => {
  // Check if .env exists
  try {
    await fs.access(path.join(__dirname, '..', '.env'));
    return { installed: true };
  } catch (err) {
    return { installed: false };
  }
});

// Serve static files from the build directory
fastify.register(import('@fastify/static'), {
  root: path.join(__dirname, '..', 'dist'),
  prefix: '/'
});

// Add a catch-all route to support client-side routing
fastify.get('*', async (request, reply) => {
  reply.sendFile('index.html');
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server running on port 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
