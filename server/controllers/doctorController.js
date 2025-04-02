// controllers/doctorController.js
const User = require('../models/userModel');

exports.getDoctors = async (req, res) => {
  try {
    console.log('Obteniendo doctores...');
    const includeInactive = req.query.includeInactive === 'true';
    const doctors = await User.getAllDoctors(includeInactive);

    console.log(`Encontrados ${doctors.length} doctores`);
    
    const formattedDoctors = doctors.map(doctor => ({
      ...doctor,
      tipoNombre: doctor.tipo === 20 ? 'Cardiólogo' : doctor.tipo === 21 ? 'Neumólogo' : 'Inactivo'
    }));
    
    res.status(200).json({ doctors: formattedDoctors });
  } catch (error) {
    console.error('Error al obtener doctores:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

// En controllers/doctorController.js, modifica el método getDoctorById:

exports.getDoctorById = async (req, res) => {
  try {
    const id = req.params.id;
    const doctor = await User.findById(id); // Usar findById en lugar de getDoctorById
    
    if (!doctor || ![20, 21, 22].includes(doctor.tipo)) {
      return res.status(404).json({ message: 'Doctor no encontrado' });
    }
    
    res.status(200).json({ doctor });
  } catch (error) {
    console.error('Error al obtener doctor:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.registerDoctor = async (req, res) => {
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

    // Crear nuevo doctor
    const userId = await User.createDoctor(userData);
    
    res.status(201).json({
      message: 'Doctor registrado exitosamente',
      userId
    });

  } catch (error) {
    console.error('Error en registro de doctor:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const id = req.params.id;
    const userData = req.body;
    
    // Validación básica
    if (!userData.correo) {
      return res.status(400).json({ message: 'El correo es requerido' });
    }
    
    // Verificar si el doctor existe
    const existingDoctor = await User.findById(id); // Cambiado de getDoctorById a findById
    if (!existingDoctor || ![20, 21, 22].includes(existingDoctor.tipo)) {
      return res.status(404).json({ message: 'Doctor no encontrado' });
    }
    
    // Verificar si el correo ya está registrado por otro usuario
    if (userData.correo !== existingDoctor.correo) {
      const userWithSameEmail = await User.findByEmail(userData.correo);
      if (userWithSameEmail && userWithSameEmail.id !== parseInt(id)) {
        return res.status(409).json({ message: 'El correo ya está registrado por otro usuario' });
      }
    }
    
    // Actualizar el doctor
    const success = await User.updateDoctor(id, userData);
    
    if (success) {
      res.status(200).json({ message: 'Doctor actualizado exitosamente' });
    } else {
      res.status(400).json({ message: 'No se pudo actualizar el doctor' });
    }
    
  } catch (error) {
    console.error('Error al actualizar doctor:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

exports.toggleDoctorStatus = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cambiar el estado
    const result = await User.toggleDoctorStatus(id);
    
    if (result.success) {
      const status = result.newType === 22 ? 'desactivado' : 'activado';
      res.status(200).json({
        message: `Doctor ${status} exitosamente`,
        newType: result.newType
      });
    } else {
      res.status(400).json({ message: 'No se pudo cambiar el estado del doctor' });
    }
    
  } catch (error) {
    console.error('Error al cambiar estado del doctor:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};