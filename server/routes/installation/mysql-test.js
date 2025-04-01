import mysql from 'mysql2/promise';

export async function testMySQLConnection(config, reply) {
  let connection;
  try {
    // Connect to MySQL server without specifying a database
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password
    });
    
    return { success: true, message: 'MySQL connection successful' };
  } catch (err) {
    return reply.status(400).send({
      success: false,
      message: `MySQL connection failed: ${err.message}`
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}