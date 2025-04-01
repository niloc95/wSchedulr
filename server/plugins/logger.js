import fp from 'fastify-plugin';

export default fp(async function(fastify, opts) {
  // Add request logging
  fastify.addHook('onRequest', (request, reply, done) => {
    request.log.info({
      url: request.url,
      method: request.method,
      ip: request.ip,
      id: request.id
    }, 'Incoming request');
    done();
  });
  
  // Add response logging
  fastify.addHook('onResponse', (request, reply, done) => {
    request.log.info({
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime
    }, 'Request completed');
    done();
  });
});