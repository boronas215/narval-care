// models/balanceModel.js
const db = require('../config/db');

class Balance {
  // Obtener todos los saldos de pacientes (incluyendo los que no tienen saldo registrado)
  static async getAllBalances() {
    const query = `
      SELECT u.id, u.prinombre, u.segnombre, u.apepat, u.apemat, u.tipo, 
             IFNULL(s.id, 0) as saldo_id, IFNULL(s.saldo, 0) as saldo
      FROM usuarios u
      LEFT JOIN saldos s ON u.id = s.id_usuario
      WHERE u.tipo IN (10, 11, 12)
      ORDER BY u.prinombre
    `;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  // Obtener saldo por ID de usuario
  static async getBalanceByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM saldos WHERE id_usuario = ?',
      [userId]
    );
    return rows[0];
  }

  // Crear un nuevo registro de saldo
  static async createBalance(userId, amount) {
    const [result] = await db.execute(
      'INSERT INTO saldos (id_usuario, saldo) VALUES (?, ?)',
      [userId, amount]
    );
    return result.insertId;
  }

  // Actualizar saldo existente
  static async updateBalance(userId, newAmount) {
    // Evitar saldos negativos
    if (newAmount < 0) newAmount = 0;
    
    try {
      // Primero verificamos si existe el registro
      const [existingBalance] = await db.execute(
        'SELECT * FROM saldos WHERE id_usuario = ?',
        [userId]
      );
      
      if (existingBalance.length === 0) {
        // Si no existe, lo creamos
        const [insertResult] = await db.execute(
          'INSERT INTO saldos (id_usuario, saldo) VALUES (?, ?)',
          [userId, newAmount]
        );
        return insertResult.affectedRows > 0;
      } else {
        // Si existe, lo actualizamos
        const [updateResult] = await db.execute(
          'UPDATE saldos SET saldo = ? WHERE id_usuario = ?',
          [newAmount, userId]
        );
        
        console.log(`Actualizando saldo para usuario ID ${userId} a ${newAmount}. Filas afectadas: ${updateResult.affectedRows}`);
        
        return updateResult.affectedRows > 0;
      }
    } catch (error) {
      console.error('Error al actualizar saldo:', error);
      throw error;
    }
  }
}

module.exports = Balance;