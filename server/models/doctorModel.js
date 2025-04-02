// Archivo: server/models/userModel.js
const db = require('../config/db');

class User {
  static async findByEmail(correo) {
    // Buscar usuario por correo electrónico
    const [rows] = await db.execute('SELECT id, correo, password, tipo, prinombre FROM usuarios WHERE correo = ?', [correo]);
    return rows[0];
  }

  static async getAllDoctors(includeInactive = false) {
    let query = 'SELECT id, tipo, prinombre, apepat, correo, tel FROM usuarios WHERE tipo IN (20, 21)';
    
    if (includeInactive) {
      query = 'SELECT id, tipo, prinombre, apepat, correo, tel FROM usuarios WHERE tipo IN (20, 21, 22)';
    }
    
    const [rows] = await db.execute(query);
    return rows;
  }

  static async createDoctor(userData) {
    // Crear un nuevo doctor con todos los datos del formulario
    const { 
      prinombre, segnombre, apepat, apemat, correo, password, 
      fechanac, tel, especialidad, tipo
    } = userData;
    
    const [result] = await db.execute(
      `INSERT INTO usuarios (
        tipo, prinombre, segnombre, apepat, apemat, correo, password, 
        fechanac, tel, especialidad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo, prinombre, segnombre, apepat, apemat, correo, password, 
        fechanac, tel, especialidad
      ]
    );
    
    return result.insertId;
  }

// Obtener un doctor por ID
static async getDoctorById(id) {
  const [rows] = await db.execute(
    'SELECT * FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Actualizar un doctor
static async updateDoctor(id, userData) {
  const {
    prinombre, segnombre, apepat, apemat, correo, password,
    fechanac, tel, tipo, especialidad
  } = userData;
  
  // Si no se proporciona una nueva contraseña, no la actualizamos
  let query;
  let params;
  
  if (password) {
    query = `UPDATE usuarios SET
      tipo = ?, prinombre = ?, segnombre = ?, apepat = ?, apemat = ?,
      correo = ?, password = ?, fechanac = ?, tel = ?, especialidad = ?
      WHERE id = ?`;
    
    params = [
      tipo, prinombre, segnombre, apepat, apemat, correo, password,
      fechanac, tel, especialidad, id
    ];
  } else {
    query = `UPDATE usuarios SET
      tipo = ?, prinombre = ?, segnombre = ?, apepat = ?, apemat = ?,
      correo = ?, fechanac = ?, tel = ?, especialidad = ?
      WHERE id = ?`;
    
    params = [
      tipo, prinombre, segnombre, apepat, apemat, correo,
      fechanac, tel, especialidad, id
    ];
  }
  
  const [result] = await db.execute(query, params);
  return result.affectedRows > 0;
}

// Cambiar estado lógico del doctor (activar/desactivar)
static async toggleDoctorStatus(id) {
  // Primero obtenemos el tipo actual
  const [rows] = await db.execute(
    'SELECT tipo FROM usuarios WHERE id = ?',
    [id]
  );
  
  if (rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }
  
  // Determinamos el nuevo tipo
  const currentType = rows[0].tipo;
  const newType = currentType === 22 ? 20 : 22;
  
  // Actualizamos el tipo
  const [result] = await db.execute(
    'UPDATE usuarios SET tipo = ? WHERE id = ?',
    [newType, id]
  );
  
  return {
    success: result.affectedRows > 0,
    newType: newType
  };
}
}

module.exports = User;