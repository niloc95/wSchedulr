import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to get database connection
async function getDbConnection(fastify) {
  // Use the existing database connection from fastify if available
  if (fastify.db) return fastify.db;
  
  const dbType = process.env.DB_TYPE || 'sqlite';
  
  try {
    if (dbType === 'sqlite') {
      // Import sqlite modules only if needed
      const sqlite3 = (await import('sqlite3')).default.verbose();
      const { open } = await import('sqlite');
      const path = (await import('path')).default;
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      const filename = process.env.DB_FILENAME || 'database.sqlite';
      const dbPath = path.resolve(__dirname, '..', '..', filename);
      
      console.log(`Connecting to SQLite database at: ${dbPath}`);
      
      return await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
    } else {
      // Import mysql modules only if needed
      const mysql = await import('mysql2/promise');
      
      console.log(`Connecting to MySQL database at: ${process.env.DB_HOST || 'localhost'}`);
      
      return await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'webschedulr'
      });
    }
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

export default async function (fastify, options) {
  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;
    
    if (!username || !password) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    let db;
    try {
      // Get database connection
      db = await getDbConnection(fastify);
      
      // Log the connection attempt
      fastify.log.info(`Attempting login for user: ${username}`);
      
      let user;
      
      // Query user based on database type
      if (process.env.DB_TYPE === 'sqlite') {
        // SQLite query
        user = await db.get(
          'SELECT id, first_name, last_name, email, username, password, is_admin FROM users WHERE username = ?', 
          [username]
        );
      } else {
        // MySQL query
        const [rows] = await db.execute(
          'SELECT id, first_name, last_name, email, username, password, is_admin FROM users WHERE username = ?',
          [username]
        );
        user = rows[0];
      }
      
      // Check if user exists
      if (!user) {
        fastify.log.info(`Login failed: User ${username} not found`);
        return reply.code(401).send({
          success: false,
          message: 'Invalid username or password'
        });
      }
      
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        fastify.log.info(`Login failed: Invalid password for user ${username}`);
        return reply.code(401).send({
          success: false,
          message: 'Invalid username or password'
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.is_admin === 1
        }, 
        process.env.JWT_SECRET || 'default-secret-key-change-in-production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
      
      fastify.log.info(`Login successful for user ${username}`);
      
      // Remove sensitive data before sending
      const userResponse = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        is_admin: user.is_admin === 1
      };
      
      return reply.send({
        success: true,
        message: 'Authentication successful',
        token,
        user: userResponse
      });
    } catch (err) {
      fastify.log.error('Authentication error:', err);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error during authentication'
      });
    } finally {
      // Close the connection if it's not managed by fastify
      if (db && !fastify.db && process.env.DB_TYPE !== 'sqlite') {
        // Remove the db.end() call completely as Fastify manages the connection pool
      }
    }
  });

  // Debug route to check if auth routes are registered
  fastify.get('/status', async (request, reply) => {
    return {
      success: true,
      message: 'Auth routes are working',
      env: {
        dbType: process.env.DB_TYPE || 'not set',
        dbFilename: process.env.DB_FILENAME || 'not set',
        jwtSecret: process.env.JWT_SECRET ? 'set' : 'not set'
      }
    };
  });

  // Add this to your auth.js route file
  fastify.get('/check', async (request, reply) => {
    try {
      // Get the token from the Authorization header
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false };
      }
      
      // Extract the token
      const token = authHeader.split(' ')[1];
      
      try {
        // Verify the token
        const decoded = jwt.verify(
          token, 
          process.env.JWT_SECRET || 'default-secret-key-change-in-production'
        );
        
        // Token is valid
        return { 
          authenticated: true, 
          userId: decoded.id,
          username: decoded.username,
          isAdmin: decoded.isAdmin
        };
      } catch (tokenError) {
        // Token invalid or expired
        fastify.log.info('Invalid token during auth check:', tokenError.message);
        return { authenticated: false };
      }
    } catch (err) {
      fastify.log.error('Authentication check error:', err);
      return reply.status(500).send({ 
        error: 'Authentication check failed', 
        authenticated: false 
      });
    }
  });
}