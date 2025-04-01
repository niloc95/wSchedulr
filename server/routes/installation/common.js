import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verify that updateEnvFile properly handles the database config

export async function updateEnvFile(config) {
  try {
    console.log('Starting environment file update with config:', {
      type: config.type,
      host: config.host,
      database: config.database
    });
    
    // Read template or create content
    let envContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_TYPE=${config.type || 'mysql'}
DB_HOST=${config.host || 'localhost'}
DB_PORT=${config.port || '3306'}
DB_USER=${config.username || 'root'}
DB_PASSWORD=${config.password || ''}
DB_NAME=${config.database || 'webschedulr'}
${config.type === 'sqlite' ? `DB_FILENAME=${config.filename || 'database.sqlite'}` : ''}

# JWT Configuration
JWT_SECRET=${generateRandomString(32)}
JWT_EXPIRES_IN=1d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
`;

    // Get file path
    const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
    console.log('Writing environment file to:', envPath);
    
    // Write file
    await fs.writeFile(envPath, envContent, 'utf8');
    
    // Verify file was created
    const fileExists = await fs.access(envPath).then(() => true).catch(() => false);
    console.log('Environment file created:', fileExists);
    
    return fileExists;
  } catch (err) {
    console.error('Error creating environment file:', err);
    return false;
  }
}

// Helper to generate random string for JWT_SECRET
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Function to check installation status
export async function checkInstallationStatus() {
  try {
    const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
    await fs.access(envPath);
    return { installed: true };
  } catch (err) {
    return { installed: false };
  }
}