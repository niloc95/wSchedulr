import fp from 'fastify-plugin';

export default fp(async function(fastify, opts) {
  fastify.setValidatorCompiler(({ schema }) => {
    return data => {
      // You could use a validation library like Joi or Ajv here
      // This is a simple example
      if (schema.required) {
        for (const field of schema.required) {
          if (data[field] === undefined) {
            return { error: `Field ${field} is required` };
          }
        }
      }
      return { value: data };
    };
  });
});