import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function testSQLiteConnection(config, reply) {
  try {
    // For SQLite, we just verify we can write to the directory
    const dbPath = path.resolve(__dirname, '..', '..', '..', config.filename || 'database.sqlite');
    const testDir = path.dirname(dbPath);
    
    try {
      await fs.access(testDir, fs.constants.W_OK);
      return { success: true, message: 'SQLite directory is writable' };
    } catch (err) {
      try {
        // Try to create the directory
        await fs.mkdir(testDir, { recursive: true });
        return { success: true, message: 'SQLite directory created successfully' };
      } catch (mkdirErr) {
        return reply.status(400).send({
          success: false,
          message: `Cannot create SQLite directory: ${mkdirErr.message}`
        });
      }
    }
  } catch (err) {
    return reply.status(400).send({
      success: false,
      message: `SQLite test failed: ${err.message}`
    });
  }
}