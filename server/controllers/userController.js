// Archivo: server/controllers/userController.js
const User = require('../models/userModel');

// En userController.js, modifica el método getPatients
exports.getPatients = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const type = req.query.type ? parseInt(req.query.type) : null;
    
    // Pasar el parámetro type al modelo
    const patients = await User.getAllPatients(includeInactive, type);
    
    const formattedPatients = patients.map(patient => ({
      ...patient,
      tipoNombre: patient.tipo === 10 ? 'Gral' : 'Priv'
    }));
    
    res.status(200).json({ patients: formattedPatients });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.registerPatient = async (req, res) => {
    try {
      const userData = req.body;
      
      // Validación básica
      if (!userData.correo || !userData.password) {
        return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
      }
  
      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(userData.correo);
      if (existingUser) {
        return res.status(409).json({ message: 'El correo ya está registrado' });
      }
  
      // Crear nuevo paciente
      const userId = await User.createPatient(userData);
      
      res.status(201).json({
        message: 'Paciente registrado exitosamente',
        userId
      });
  
    } catch (error) {
      console.error('Error en registro de paciente:', error);
      res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
  };

// Obtener un paciente por ID
exports.getPatientById = async (req, res) => {
  try {
    const id = req.params.id;
    const patient = await User.getPatientById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    res.status(200).json({ patient });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar un paciente
exports.updatePatient = async (req, res) => {
  try {
    const id = req.params.id;
    const userData = req.body;
    
    // Validación básica
    if (!userData.correo) {
      return res.status(400).json({ message: 'El correo es requerido' });
    }
    
    // Verificar si el usuario existe
    const existingUser = await User.getPatientById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    // Verificar si el correo ya está registrado (si se está cambiando)
    if (userData.correo !== existingUser.correo) {
      const userWithSameEmail = await User.findByEmail(userData.correo);
      if (userWithSameEmail) {
        return res.status(409).json({ message: 'El correo ya está registrado por otro usuario' });
      }
    }
    
    // Actualizar el paciente
    const success = await User.updatePatient(id, userData);
    
    if (success) {
      res.status(200).json({ message: 'Paciente actualizado exitosamente' });
    } else {
      res.status(400).json({ message: 'No se pudo actualizar el paciente' });
    }
    
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

// Cambiar estado del paciente (activar/desactivar lógicamente)
exports.togglePatientStatus = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cambiar el estado
    const result = await User.togglePatientStatus(id);
    
    if (result.success) {
      const status = result.newType === 12 ? 'desactivado' : 'activado';
      res.status(200).json({
        message: `Paciente ${status} exitosamente`,
        newType: result.newType
      });
    } else {
      res.status(400).json({ message: 'No se pudo cambiar el estado del paciente' });
    }
    
  } catch (error) {
    console.error('Error al cambiar estado del paciente:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};