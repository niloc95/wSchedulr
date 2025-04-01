import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { updateEnvFile } from './common.js';

export async function handleMySQLInstallation(admin, company, database, reply) {
  console.log('Starting MySQL installation');
  
  let connection;
  try {
    // Connect to MySQL server without specifying a database
    console.log('Connecting to MySQL server');
    connection = await mysql.createConnection({
      host: database.host,
      port: database.port,
      user: database.username,
      password: database.password
    });
    
    // Check if database already exists
    console.log('Checking if database exists');
    const [databases] = await connection.query(`SHOW DATABASES LIKE '${database.database}'`);
    const databaseExists = databases.length > 0;
    
    // Handle existing database (reinstall option)
    if (databaseExists && database.reinstall === true) {
      console.log('Reinstall option selected - dropping existing database');
      await connection.query(`DROP DATABASE ${database.database}`);
    } else if (databaseExists) {
      // Check if tables already exist (installation completed before)
      await connection.query(`USE ${database.database}`);
      const [tables] = await connection.query('SHOW TABLES');
      
      if (tables.length > 0) {
        console.log('Database already has tables - checking for users');
        // Check if users table exists and has data
        try {
          const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
          if (users[0].count > 0) {
            console.log('Users already exist in the database');
            return reply.status(400).send({
              error: 'Database already installed',
              details: 'The database already contains user data. To reinstall, please select the "Reinstall" option or use a different database name.'
            });
          }
        } catch (err) {
          // Table doesn't exist or other error, continue with installation
          console.log('Users table not found or empty, continuing installation');
        }
      }
    }
    
    // Start transaction
    await connection.query('START TRANSACTION');
    
    // Create database if it doesn't exist
    console.log('Creating database if not exists');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database.database}`);
    
    // Use the new database
    console.log('Switching to the new database');
    await connection.query(`USE ${database.database}`);
    
    // Create users table
    console.log('Creating users table');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create admin user
    console.log('Creating admin user');
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
    
    // Create company table and record
    console.log('Creating company table and record');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Add validation for company name
    const companyName = company.name || 'Default Company';
    const companyEmail = company.email || admin.email;

    console.log('Inserting company record:', { name: companyName, email: companyEmail });
    await connection.query(`
      INSERT INTO company (name, email) VALUES (?, ?)
    `, [companyName, companyEmail]);
    
    // Commit transaction
    await connection.query('COMMIT');
    console.log('Database setup completed successfully');
    
    // Update environment file
    console.log('=== UPDATING ENVIRONMENT FILE ===');
    const envResult = await updateEnvFile(database);
    console.log('Environment file update result:', envResult);
    
    return {
      success: true,
      message: 'MySQL installation completed successfully',
      envUpdated: envResult,
      redirect: '/dashboard' // Changed from '/calendar' to '/dashboard'
    };
    
  } catch (err) {
    console.error('MySQL INSTALLATION ERROR:', err);
    
    // Rollback transaction if connection is active
    if (connection) {
      try {
        await connection.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
    }
    
    return reply.status(500).send({
      error: 'MySQL installation failed',
      details: err.message,
      code: err.code || 'UNKNOWN'
    });
    
  } finally {
    // Close connection if it was opened
    if (connection) {
      try {
        await connection.end();
      } catch (closeErr) {
        console.error('Error closing MySQL connection:', closeErr);
      }
    }
  }
}