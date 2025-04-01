export default async function (fastify, opts) {
  // Custom error handler with structured logging
  fastify.setErrorHandler(function (error, request, reply) {
    // Log error details with structured format
    this.log.error({
      message: 'Request error',
      url: request.url,
      method: request.method,
      error: error.message,
      statusCode: error.statusCode || 500,
      stack: error.stack
    });

    // Send appropriate error response
    // Don't expose stack traces in production
    const response = {
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    };

    reply.status(error.statusCode || 500).send(response);
  });
}