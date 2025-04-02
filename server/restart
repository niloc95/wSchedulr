// This is a simple helper script to restart the server

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { dirname } = path;

// Root project directory
const projectRoot = path.resolve(__dirname, '..');

console.log('====================================');
console.log('Restarting server with full application...');
console.log('====================================');

// Wait a moment before restarting
setTimeout(() => {
  // Determine which command to run based on NODE_ENV
  const isProd = process.env.NODE_ENV === 'production';
  const script = isProd ? 'start:prod' : 'start';
  
  // Spawn a detached process that will survive this process exiting
  const child = spawn('npm', ['run', script], {
    cwd: projectRoot,
    detached: true,
    stdio: 'inherit',
    shell: true
  });
  
  // Unref the child process so the parent can exit
  child.unref();
  
  console.log(`Started new server process with: npm run ${script}`);
  console.log('Parent process exiting...');
  
  // Exit this process
  process.exit(0);
}, 1000);