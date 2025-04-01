export default async (request, reply) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Here you would validate the token
    // This is a placeholder - implement actual JWT verification
    const user = { id: 1, email: 'test@example.com' }; // Mock user
    
    // Attach user to request
    request.user = user;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};