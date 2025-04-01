import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import { updateEnvFile } from './common.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function handleSQLiteInstallation(admin, company, database, reply) {
  console.log('Starting SQLite installation...');
  
  let db = null;
  
  try {
    // Check if the sqlite3 module is available and working
    try {
      const sqlite3Module = await import('sqlite3');
      const sqlite3 = sqlite3Module.default || sqlite3Module;
      console.log('SQLite3 module loaded successfully');
      
      // Test that the sqlite3 module actually works
      if (typeof sqlite3.Database !== 'function') {
        throw new Error(`sqlite3.Database is not a function (type: ${typeof sqlite3.Database})`);
      }
    } catch (moduleErr) {
      console.error('Failed to load sqlite3 module:', moduleErr);
      throw new Error(`SQLite3 module error: ${moduleErr.message}`);
    }
    
    // Resolve the full path to the database file
    const dbPath = path.resolve(process.cwd(), database.filename || 'database.sqlite');
    console.log('SQLite database full path:', dbPath);
    
    // Ensure parent directory exists
    const dbDir = path.dirname(dbPath);
    try {
      await fs.mkdir(dbDir, { recursive: true });
      console.log('Database directory created/exists:', dbDir);
    } catch (dirErr) {
      console.error('Failed to create database directory:', dirErr);
      throw new Error(`Directory creation failed: ${dirErr.message}`);
    }
    
    // Test write permissions by creating a test file
    try {
      const testFile = dbPath + '.test';
      await fs.writeFile(testFile, 'Test write permissions');
      await fs.unlink(testFile);
      console.log('Write permissions verified successfully');
    } catch (permErr) {
      console.error('Write permission test failed:', permErr);
      throw new Error(`Permission issue: ${permErr.message}`);
    }
    
    // Now try to create the SQLite database
    console.log('Creating SQLite database...');
    
    // Import modules within try block for better error handling
    const sqlite3Module = await import('sqlite3');
    const sqlite3 = sqlite3Module.default || sqlite3Module;
    
    // Use the synchronous Database constructor to create the file
    console.log('Creating database connection...');
    const SQLite3 = sqlite3.verbose();
    db = new SQLite3.Database(dbPath);
    console.log('Database created successfully');
    
    // Convert callback-based methods to Promises
    const run = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) return reject(err);
          resolve(this); // 'this' contains lastID, changes
        });
      });
    };
    
    // Execute database setup statements
    console.log('Enabling foreign keys...');
    await run('PRAGMA foreign_keys = ON');
    
    console.log('Creating users table...');
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Hash password
    console.log('Hashing admin password...');
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    
    // Create admin user
    console.log('Creating admin user...');
    await run(
      'INSERT INTO users (first_name, last_name, email, username, password, is_admin) VALUES (?, ?, ?, ?, ?, 1)',
      [
        admin.first_name,
        admin.last_name,
        admin.email,
        admin.username,
        hashedPassword
      ]
    );
    
    // Create company table
    console.log('Creating company table...');
    await run(`
      CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create company record
    console.log('Creating company record...');
    await run(
      'INSERT INTO company (name, email) VALUES (?, ?)',
      [company.name, company.email || admin.email]
    );
    
    // Close database properly
    console.log('Closing database...');
    await new Promise((resolve, reject) => {
      db.close(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Update environment file
    console.log('Updating environment file...');
    const envResult = await updateEnvFile(database);
    
    console.log('Installation completed successfully!');
    return {
      success: true,
      message: 'SQLite installation completed successfully',
      envUpdated: envResult,
      redirect: '/dashboard'
    };
    
  } catch (err) {
    console.error('SQLite installation error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      errno: err.errno
    });
    
    // Ensure database is closed if open
    if (db) {
      try {
        await new Promise(resolve => db.close(resolve));
      } catch (closeErr) {
        console.error('Error closing database:', closeErr);
      }
    }
    
    // Send detailed error response
    return reply.status(500).send({
      error: 'SQLite installation failed',
      details: err.message,
      code: err.code || 'UNKNOWN',
      stack: err.stack
    });
  }
}