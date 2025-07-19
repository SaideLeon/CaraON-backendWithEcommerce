const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createOrderSchema } = require('../schemas/order.schema');
const auth = require('../middlewares/auth.middleware');

router.post('/orders', auth, validate(createOrderSchema), orderController.createOrder);
router.get('/orders', auth, orderController.listOrders);
router.get('/orders/:id', auth, orderController.getOrderById);

module.exports = router;
