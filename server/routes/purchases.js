// routes/purchases.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Crear una nueva compra
router.post('/', purchaseController.createPurchase);

module.exports = router;