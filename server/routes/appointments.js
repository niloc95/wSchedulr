export default async function (fastify, opts) {
  // Public endpoint - no auth
  fastify.get('/public', async (request, reply) => {
    return { message: 'Public appointment data' };
  });
  
  // Protected endpoint - with auth
  fastify.get('/',
    { preHandler: fastify.authenticate }, // Apply auth middleware
    async (request, reply) => {
      // User is now available in request.user
      const userId = request.user.id;
      
      try {
        const [rows] = await fastify.mysql.query(
          'SELECT * FROM appointments WHERE user_id = ?',
          [userId]
        );
        return rows;
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: 'Database error' });
      }
    }
  );
}