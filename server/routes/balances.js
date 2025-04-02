// routes/balances.js
const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');

// Obtener todos los saldos de pacientes
router.get('/', balanceController.getBalances);

// Obtener saldo del administrador
router.get('/admin/:adminId', balanceController.getAdminBalance);

// Agregar saldo a un paciente
router.post('/add', balanceController.addBalance);

// Agregar saldo al administrador
router.post('/admin/add', balanceController.addAdminBalance);

// Restar saldo al administrador
router.post('/admin/subtract', balanceController.subtractAdminBalance);

module.exports = router;