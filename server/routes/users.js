export default async function (fastify, opts) {
  const db = fastify.mysql;

  // Get all users
  fastify.get('/', async (request, reply) => {
    try {
      const [rows] = await db.query('SELECT id, email, first_name, last_name, created_at FROM users');
      return rows;
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Database error' });
    }
  });

  // Get user by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const [rows] = await db.query(
        'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?',
        [request.params.id]
      );
      if (rows.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return rows[0];
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Database error' });
    }
  });

  // Create user
  fastify.post('/', async (request, reply) => {
    const { email, password, first_name, last_name } = request.body;
    try {
      const [result] = await db.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
        [email, password, first_name, last_name]
      );
      return {
        id: result.insertId,
        email,
        first_name,
        last_name
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Database error' });
    }
  });
}