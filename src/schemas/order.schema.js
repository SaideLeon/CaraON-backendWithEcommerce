const { z } = require('zod');

const createOrderSchema = z.object({
  body: z.object({
    userId: z.string(),
    total: z.number().positive('O total deve ser um número positivo.'),
  }),
});

module.exports = {
  createOrderSchema,
};
