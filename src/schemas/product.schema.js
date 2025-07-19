const { z } = require('zod');
const { ProductStatus } = require('@prisma/client');

const productSchema = z.object({
  name: z.string().min(3, 'O nome do produto precisa ter no mínimo 3 caracteres.'),
  slug: z.string().min(3, 'O slug do produto precisa ter no mínimo 3 caracteres.').regex(/^[a-z0-9-]+$/, 'O slug deve conter apenas letras minúsculas, números e hifens.'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(3, 'O SKU precisa ter no mínimo 3 caracteres.').optional(),
  price: z.number().positive('O preço deve ser um número positivo.'),
  comparePrice: z.number().positive('O preço de comparação deve ser um número positivo.').optional(),
  cost: z.number().positive('O custo deve ser um número positivo.').optional(),
  weight: z.number().positive('O peso deve ser um número positivo.').optional(),
  length: z.number().positive('O comprimento deve ser um número positivo.').optional(),
  width: z.number().positive('A largura deve ser um número positivo.').optional(),
  height: z.number().positive('A altura deve ser um número positivo.').optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  isDigital: z.boolean().default(false),
  trackStock: z.boolean().default(true),
  stock: z.number().int().min(0, 'O estoque não pode ser negativo.').default(0),
  minStock: z.number().int().min(0, 'O estoque mínimo não pode ser negativo.').default(0),
  maxStock: z.number().int().positive('O estoque máximo deve ser um número positivo.').optional(),
  featured: z.boolean().default(false),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de categoria inválido'),
  brandId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de marca inválido').optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const createProductSchema = z.object({
  body: productSchema,
});

const updateProductSchema = z.object({
  body: productSchema.partial(), // Torna todos os campos opcionais
  params: z.object({
    id: z.string()
  }),
});

const listProductsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default(1),
    limit: z.string().transform(Number).default(10),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    featured: z.string().transform(val => val === 'true').optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});


module.exports = {
  createProductSchema,
  updateProductSchema,
  listProductsSchema
};