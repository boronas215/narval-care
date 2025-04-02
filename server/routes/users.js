// Archivo: server/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//Pacientes
router.get('/patients', userController.getPatients);
router.post('/register', userController.registerPatient);
router.get('/patients/:id', userController.getPatientById);
router.put('/patients/:id', userController.updatePatient);
router.patch('/patients/:id/toggle-status', userController.togglePatientStatus);

module.exports = router;