// Archivo: server/controllers/authController.js
const User = require('../models/userModel');

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    // Validación básica
    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await User.findByEmail(correo);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña (comparación simple)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Obtener el rol basado en el tipo de usuario
    let userRole = '';
    switch (parseInt(user.tipo)) {
      case 10:
        userRole = 'Usuario General';
        break;
      case 11:
        userRole = 'Usuario Privilegiado';
        break;
      case 20:
        userRole = 'Cardiólogo';
        break;
      case 21:
        userRole = 'Neumólogo';
        break;
      case 31:
        userRole = 'Administrador';
        break;
      default:
        userRole = 'Rol no definido';
    }

    // Login exitoso
    res.status(200).json({ 
      message: 'Login exitoso',
      user: {
        id: user.id,
        correo: user.correo,
        tipo: user.tipo,
        role: userRole
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};