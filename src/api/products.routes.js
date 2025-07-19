const express = require('express');
const router = express.Router();
const productController = require('../controllers/products.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createProductSchema, updateProductSchema, listProductsSchema } = require('../schemas/product.schema');
const auth = require('../middlewares/auth.middleware');

// Rotas de Produtos
router.post('/products', auth, validate(createProductSchema), productController.createProduct);
router.get('/products', validate(listProductsSchema), productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', auth, validate(updateProductSchema), productController.updateProduct);
router.delete('/products/:id', auth, productController.deleteProduct);

module.exports = router;
