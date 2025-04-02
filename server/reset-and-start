import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Remove .env file if it exists
try {
  fs.unlinkSync(path.join(rootDir, '.env'));
  console.log('Removed existing .env file');
} catch (err) {
  // File doesn't exist, that's fine
}

// Start the application
console.log('Starting application in installation mode...');
execSync('npm start', { 
  cwd: rootDir, 
  stdio: 'inherit' 
});