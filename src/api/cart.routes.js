const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { validate } = require('../middlewares/validate.middleware');
const { addToCartSchema, updateCartSchema, removeFromCartSchema } = require('../schemas/cart.schema');
const auth = require('../middlewares/auth.middleware');

router.get('/cart', auth, cartController.getCart);
router.post('/cart/add', auth, validate(addToCartSchema), cartController.addToCart);
router.put('/cart/update', auth, validate(updateCartSchema), cartController.updateCart);
router.delete('/cart/remove', auth, validate(removeFromCartSchema), cartController.removeFromCart);

module.exports = router;
