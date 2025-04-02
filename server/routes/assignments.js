// routes/assignments.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// Obtener asignaciones de un paciente
router.get('/patient/:id', assignmentController.getPatientAssignments);

// Obtener pacientes asignados a un doctor
router.get('/doctor/:id', assignmentController.getDoctorPatients);

// Crear una nueva asignación
router.post('/', assignmentController.createAssignment);

// Eliminar una asignación
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;