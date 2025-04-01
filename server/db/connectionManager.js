import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ConnectionManager {
  static async testConnection(config) {
    if (!config || !config.type) {
      console.error('Invalid config object:', config);
      return { 
        success: false, 
        message: 'Invalid configuration: Database type is required' 
      };
    }
    
    try {
      console.log('[ConnectionManager] Testing connection with config type:', config.type);
      
      switch (config.type) {
        case 'mysql':
          return await this.testMySQLConnection(config);
        case 'sqlite':
          return await this.testSQLiteConnection(config);
        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }
    } catch (error) {
      console.error('[ConnectionManager] Top-level connection test error:', error);
      return { 
        success: false, 
        message: `Connection error: ${error.message}` 
      };
    }
  }
  
  static async testMySQLConnection(config) {
    let connection;
    
    // Validate required fields
    if (!config.host || !config.username) {
      return {
        success: false,
        message: 'Missing required fields: host and username are required'
      };
    }
    
    try {
      console.log('[ConnectionManager] Attempting MySQL connection with:', {
        host: config.host,
        port: config.port || 3306,
        user: config.username,
      });
      
      // First try to connect without specifying a database
      connection = await mysql.createConnection({
        host: config.host,
        port: parseInt(config.port || '3306', 10),
        user: config.username,
        password: config.password || ''
      });
      
      console.log('[ConnectionManager] Base connection successful, testing ping...');
      
      // Test if the connection works
      await connection.ping();
      console.log('[ConnectionManager] MySQL ping successful');
      
      // Close and reopen with database if specified
      if (config.database) {
        await connection.end();
        
        try {
          console.log(`[ConnectionManager] Attempting to connect to database: ${config.database}`);
          connection = await mysql.createConnection({
            host: config.host,
            port: parseInt(config.port || '3306', 10),
            user: config.username,
            password: config.password || '',
            database: config.database
          });
          
          await connection.query('SELECT 1');
          console.log(`[ConnectionManager] Successfully connected to database: ${config.database}`);
          
          return {
            success: true,
            message: `Connected to database: ${config.database}`
          };
        } catch (dbError) {
          console.log(`[ConnectionManager] Database connection error: ${dbError.message}`);
          // Connected to server but database error (might not exist yet)
          return {
            success: true,
            message: `Connected to MySQL server, but database '${config.database}' might not exist. It will be created during installation.`
          };
        }
      }
      
      return { 
        success: true, 
        message: 'Connected to MySQL server successfully!' 
      };
    } catch (error) {
      console.error('[ConnectionManager] MySQL connection error:', error);
      let errorMsg = error.message;
      
      // More user-friendly error messages
      if (error.code === 'ECONNREFUSED') {
        errorMsg = `Could not connect to MySQL server at ${config.host}:${config.port}. Make sure MySQL is running.`;
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        errorMsg = 'Access denied. Check your username and password.';
      }
      
      return { 
        success: false, 
        message: errorMsg
      };
    } finally {
      if (connection) {
        try {
          await connection.end();
          console.log('[ConnectionManager] MySQL connection closed properly');
        } catch (closeError) {
          console.error('[ConnectionManager] Error closing connection:', closeError);
        }
      }
    }
  }
  
  static async testSQLiteConnection(config) {
    try {
      const dbDir = path.resolve(__dirname, '..');
      // Check if directory is writable
      await fs.access(dbDir, fs.constants.W_OK);
      
      return { 
        success: true, 
        message: 'SQLite configuration validated. Database will be created during installation.' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `SQLite error: ${error.message}` 
      };
    }
  }
  
  static async initializeDatabase(config) {
    try {
      switch (config.type) {
        case 'mysql':
          return await this.initializeMySQLDatabase(config);
        case 'sqlite':
          return await this.initializeSQLiteDatabase(config);
        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      return { 
        success: false, 
        message: `Initialization error: ${error.message}` 
      };
    }
  }
  
  static async initializeMySQLDatabase(config) {
    let connection;
    try {
      console.log('Initializing MySQL database:', config.database);
      
      // Connect without database first
      connection = await mysql.createConnection({
        host: config.host,
        port: parseInt(config.port || '3306', 10),
        user: config.username,
        password: config.password
      });
      
      // Create database if it doesn't exist
      console.log(`Creating database if not exists: ${config.database}`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
      
      // Use the database
      await connection.query(`USE ${config.database}`);
      
      return { success: true };
    } catch (error) {
      console.error('MySQL initialization error:', error);
      return { 
        success: false, 
        message: `MySQL initialization error: ${error.message}` 
      };
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
  
  static async initializeSQLiteDatabase(config) {
    try {
      // We don't actually create the SQLite database here
      // It will be created when first accessed
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: `SQLite initialization error: ${error.message}` 
      };
    }
  }
}

export default ConnectionManager;