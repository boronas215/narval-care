// routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas para productos
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.registerProduct);
router.put('/:id', productController.updateProduct);
router.patch('/:id/toggle-status', productController.toggleProductStatus);

module.exports = router;