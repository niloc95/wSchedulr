// Main installation route file
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import path from 'path';
import { checkInstallationStatus } from './installation/common.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function (fastify, opts) {
  // Check if the application is already installed
  fastify.get('/status', async (request, reply) => {
    try {
      return await checkInstallationStatus();
    } catch (err) {
      fastify.log.error('Installation status check failed', { error: err.message });
      return { installed: false, error: err.message };
    }
  });
  
  // Test database connection
  fastify.post('/test-connection', async (request, reply) => {
    const config = request.body;
    
    fastify.log.info('Testing database connection', {
      type: config.type,
      host: config.host,
      user: config.username
    });
    
    try {
      if (config.type === 'mysql') {
        const { testMySQLConnection } = await import('./installation/mysql-test.js');
        return await testMySQLConnection(config, reply);
      } 
      else if (config.type === 'sqlite') {
        const { testSQLiteConnection } = await import('./installation/sqlite-test.js');
        return await testSQLiteConnection(config, reply);
      } 
      else {
        return reply.status(400).send({
          success: false,
          message: 'Unsupported database type'
        });
      }
    } catch (err) {
      fastify.log.error('Database connection test failed', { error: err.message });
      return reply.status(500).send({
        success: false,
        message: `Connection failed: ${err.message}`
      });
    }
  });
  
  // Perform installation
  fastify.post('/perform', async (request, reply) => {
    try {
      const { admin, company, database } = request.body;
      
      // Validate required fields
      if (!admin || !admin.email || !admin.password) {
        return reply.status(400).send({
          error: 'Invalid admin data',
          details: 'Admin email and password are required'
        });
      }
      
      // Ensure company has valid data
      const validatedCompany = {
        name: company?.name || 'Default Company',
        email: company?.email || admin.email,
        // Add other fields with defaults as needed
      };
      
      fastify.log.info('Installation process started', {
        dbType: database.type,
        adminEmail: admin.email,
        companyName: validatedCompany.name
      });
      
      // Dynamically load the appropriate handler based on database type
      if (database.type === 'mysql') {
        const { handleMySQLInstallation } = await import('./installation/mysql.js');
        return await handleMySQLInstallation(admin, validatedCompany, database, reply);
      } 
      else if (database.type === 'sqlite') {
        const { handleSQLiteInstallation } = await import('./installation/sqlite.js');
        return await handleSQLiteInstallation(admin, validatedCompany, database, reply);
      } 
      else {
        return reply.status(400).send({
          error: 'Unsupported database type',
          details: 'Only MySQL and SQLite are supported in this version'
        });
      }
      
    } catch (err) {
      fastify.log.error('INSTALLATION ERROR:', err);
      return reply.status(500).send({
        error: 'Installation failed',
        details: err.message,
        code: err.code || 'UNKNOWN'
      });
    }
  });
}