import fp from 'fastify-plugin';

export default fp(async function(fastify, opts) {
  // Decorator to add authentication to routes
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      
      if (!token) {
        throw new Error('No token provided');
      }
      
      // Implement actual JWT verification here
      const user = { id: 1, email: 'test@example.com' }; // Mock user
      
      // Add user to request
      request.user = user;
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
});