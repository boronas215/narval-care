// controllers/assignmentController.js
const Assignment = require('../models/assignmentModel');
const User = require('../models/userModel');

exports.getPatientAssignments = async (req, res) => {
  try {
    const patientId = req.params.id;
    const assignments = await Assignment.getByPatientId(patientId);
    
    res.status(200).json({ assignments });
  } catch (error) {
    console.error('Error al obtener asignaciones del paciente:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const patients = await Assignment.getPatientsByDoctorId(doctorId);
    
    res.status(200).json({ patients });
  } catch (error) {
    console.error('Error al obtener pacientes del doctor:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    
    if (!patientId || !doctorId) {
      return res.status(400).json({ message: 'Se requieren ID de paciente y doctor' });
    }
    
    // Verificar si ya existe una asignación para este par
    const existingAssignment = await Assignment.checkExisting(patientId, doctorId);
    if (existingAssignment) {
      return res.status(409).json({ message: 'Esta asignación ya existe' });
    }
    
    // Verificar si hay un espacio disponible (doctor1 o doctor2)
    const assignmentId = await Assignment.create(patientId, doctorId);
    
    res.status(201).json({
      message: 'Asignación creada exitosamente',
      assignmentId
    });
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const success = await Assignment.delete(assignmentId);
    
    if (!success) {
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }
    
    res.status(200).json({ message: 'Asignación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};