import { createConnection } from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection cache
let dbConnection = null;

export async function getConnection() {
  // If connection already exists, return it
  if (dbConnection) return dbConnection;
  
  const dbType = process.env.DB_TYPE || 'mysql';
  
  if (dbType === 'sqlite') {
    // SQLite connection
    const filename = process.env.DB_FILENAME || 'database.sqlite';
    const dbPath = path.join(__dirname, '..', filename);
    
    dbConnection = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    return dbConnection;
  } else {
    // MySQL connection
    dbConnection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'webschedulr'
    });
    
    return dbConnection;
  }
}

export async function closeConnection() {
  if (!dbConnection) return;
  
  const dbType = process.env.DB_TYPE || 'mysql';
  
  if (dbType === 'sqlite') {
    await dbConnection.close();
  } else {
    await dbConnection.end();
  }
  
  dbConnection = null;
}