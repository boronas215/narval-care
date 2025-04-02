// routes/patientBalances.js
const express = require('express');
const router = express.Router();
const patientBalanceController = require('../controllers/patientBalanceController');

// Obtener saldo del paciente
router.get('/patient/:patientId', patientBalanceController.getPatientBalance);

// Permitir que el paciente agregue saldo a sí mismo
router.post('/add-self', patientBalanceController.addSelfBalance);

module.exports = router;