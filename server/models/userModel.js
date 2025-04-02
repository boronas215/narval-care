// Archivo: server/models/userModel.js
const db = require('../config/db');

class User {

// En userModel.js, añade este método si no existe
static async findById(id) {
  const [rows] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
  return rows[0];
}

  static async findByEmail(correo) {
    // Buscar usuario por correo electrónico
    const [rows] = await db.execute('SELECT id, correo, password, tipo, prinombre FROM usuarios WHERE correo = ?', [correo]);
    return rows[0];
  }

  // En userModel.js, modifica el método getAllPatients
static async getAllPatients(includeInactive = false, specificType = null) {
  let query = 'SELECT id, tipo, prinombre, apepat, correo, tel FROM usuarios WHERE tipo IN (10, 11)';
  let params = [];
  
  if (specificType) {
    query = 'SELECT id, tipo, prinombre, apepat, correo, tel FROM usuarios WHERE tipo = ?';
    params = [specificType];
  } else if (includeInactive) {
    query = 'SELECT id, tipo, prinombre, apepat, correo, tel FROM usuarios WHERE tipo IN (10, 11, 12)';
  }
  
  const [rows] = await db.execute(query, params);
  return rows;
}

  static async createPatient(userData) {
    // Crear un nuevo paciente con todos los datos del formulario
    const { 
      prinombre, segnombre, apepat, apemat, curp, correo, password, 
      fechanac, tel, nomfamiliar, telfamiliar, calle, numint, numext, 
      colonia, codpost, ciudad, estado, rfc, regimenfiscal, tipo 
    } = userData;
    
    const [result] = await db.execute(
      `INSERT INTO usuarios (
        tipo, prinombre, segnombre, apepat, apemat, curp, correo, password, 
        fechanac, tel, nomfamiliar, telfamiliar, calle, numint, numext, 
        colonia, codpost, ciudad, estado, rfc, regimenfiscal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo, prinombre, segnombre, apepat, apemat, curp, correo, password, 
        fechanac, tel, nomfamiliar, telfamiliar, calle, numint, numext, 
        colonia, codpost, ciudad, estado, rfc, regimenfiscal
      ]
    );
    
    return result.insertId;
  }

// Obtener un paciente por ID
static async getPatientById(id) {
  const [rows] = await db.execute(
    'SELECT * FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Actualizar un paciente
static async updatePatient(id, userData) {
  const {
    prinombre, segnombre, apepat, apemat, curp, correo, password,
    fechanac, tel, nomfamiliar, telfamiliar, calle, numint, numext,
    colonia, codpost, ciudad, estado, rfc, regimenfiscal, tipo
  } = userData;
  
  // Si no se proporciona una nueva contraseña, no la actualizamos
  let query;
  let params;
  
  if (password) {
    query = `UPDATE usuarios SET
      tipo = ?, prinombre = ?, segnombre = ?, apepat = ?, apemat = ?,
      curp = ?, correo = ?, password = ?, fechanac = ?, tel = ?, 
      nomfamiliar = ?, telfamiliar = ?, calle = ?, numint = ?, numext = ?,
      colonia = ?, codpost = ?, ciudad = ?, estado = ?, rfc = ?, regimenfiscal = ?
      WHERE id = ?`;
    
    params = [
      tipo, prinombre, segnombre, apepat, apemat, curp, correo, password,
      fechanac, tel, nomfamiliar, telfamiliar, calle, numint, numext,
      colonia, codpost, ciudad, estado, rfc, regimenfiscal, id
    ];
  } else {
    query = `UPDATE usuarios SET
      tipo = ?, prinombre = ?, segnombre = ?, apepat = ?, apemat = ?,
      curp = ?, correo = ?, fechanac = ?, tel = ?, nomfamiliar = ?, 
      telfamiliar = ?, calle = ?, numint = ?, numext = ?, colonia = ?, 
      codpost = ?, ciudad = ?, estado = ?, rfc = ?, regimenfiscal = ?
      WHERE id = ?`;
    
    params = [
      tipo, prinombre, segnombre, apepat, apemat, curp, correo,
      fechanac, tel, nomfamiliar, telfamiliar, calle, numint, numext,
      colonia, codpost, ciudad, estado, rfc, regimenfiscal, id
    ];
  }
  
  const [result] = await db.execute(query, params);
  return result.affectedRows > 0;
}

// Cambiar estado lógico del paciente (activar/desactivar)
static async togglePatientStatus(id) {
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
  const newType = currentType === 12 ? 10 : 12;
  
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

// Añadir estos métodos a tu userModel.js existente

  // Obtener todos los doctores
  static async getAllDoctors(includeInactive = false) {
    let query = 'SELECT id, tipo, prinombre, apepat, especialidad, correo FROM usuarios WHERE tipo IN (20, 21)';
    
    if (includeInactive) {
      query = 'SELECT id, tipo, prinombre, apepat, especialidad, correo FROM usuarios WHERE tipo IN (20, 21, 22)';
    }
    
    const [rows] = await db.execute(query);
    return rows;
  }

  // Crear un nuevo doctor
  static async createDoctor(userData) {
    // Asegurar que el tipo sea de doctor (20 o 21)
    const tipo = userData.tipo && [20, 21].includes(parseInt(userData.tipo)) 
      ? parseInt(userData.tipo) 
      : 20; // Por defecto, cardiólogo
    
    const {
      prinombre, segnombre, apepat, apemat, correo, password,
      fechanac, especialidad
    } = userData;
    
    const [result] = await db.execute(
      `INSERT INTO usuarios (
        tipo, prinombre, segnombre, apepat, apemat, correo, password, 
        fechanac, especialidad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo, prinombre, segnombre, apepat, apemat, correo, password,
        fechanac, especialidad
      ]
    );
    
    return result.insertId;
  }

  // Actualizar un doctor
  static async updateDoctor(id, userData) {
    const {
      prinombre, segnombre, apepat, apemat, correo, password,
      fechanac, tipo, especialidad
    } = userData;
    
    // Si no se proporciona una nueva contraseña, no la actualizamos
    let query;
    let params;
    
    if (password) {
      query = `UPDATE usuarios SET
        tipo = ?, prinombre = ?, segnombre = ?, apepat = ?, apemat = ?,
        correo = ?, password = ?, fechanac = ?, especialidad = ?
        WHERE id = ?`;
      
      params = [
        tipo, prinombre, segnombre, apepat, apemat, correo, password,
        fechanac, especialidad, id
      ];
    } else {
      query = `UPDATE usuarios SET
        tipo = ?, prinombre = ?, segnombre = ?, apepat = ?, apemat = ?,
        correo = ?, fechanac = ?, especialidad = ?
        WHERE id = ?`;
      
      params = [
        tipo, prinombre, segnombre, apepat, apemat, correo,
        fechanac, especialidad, id
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
    let newType;
    
    if (currentType === 22) {
      // Si está desactivado, volvemos al tipo original (cardiólogo o neumólogo)
      // Por defecto lo hacemos cardiólogo (20)
      newType = 20;
    } else {
      // Si está activo, lo desactivamos
      newType = 22;
    }
    
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