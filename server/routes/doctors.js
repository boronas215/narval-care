// routes/doctors.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Obtener todos los doctores
router.get('/', doctorController.getDoctors);

// Obtener doctor por ID
router.get('/:id', doctorController.getDoctorById);

// Registrar nuevo doctor
router.post('/', doctorController.registerDoctor);

// Actualizar doctor
router.put('/:id', doctorController.updateDoctor);

// Cambiar estado del doctor
router.patch('/:id/toggle-status', doctorController.toggleDoctorStatus);

module.exports = router;