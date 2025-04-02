// server/models/messageModel.js
const db = require('../config/db');

class Message {
  static async getMessagesBetweenUsers(userId, contactId) {
    const [rows] = await db.execute(
      `SELECT m.*, 
        u1.prinombre as emisor_nombre, u1.apepat as emisor_apellido,
        u2.prinombre as receptor_nombre, u2.apepat as receptor_apellido
       FROM mensajes m
       JOIN usuarios u1 ON m.emisor_id = u1.id
       JOIN usuarios u2 ON m.receptor_id = u2.id
       WHERE (m.emisor_id = ? AND m.receptor_id = ?)
       OR (m.emisor_id = ? AND m.receptor_id = ?)
       ORDER BY m.fecha_envio ASC`,
      [userId, contactId, contactId, userId]
    );
    return rows;
  }

  static async markMessagesAsRead(senderId, receiverId) {
    const [result] = await db.execute(
      'UPDATE mensajes SET leido = true WHERE emisor_id = ? AND receptor_id = ? AND leido = false',
      [senderId, receiverId]
    );
    return result.affectedRows > 0;
  }

  static async createMessage(asignacionId, emisorId, receptorId, mensaje) {
    const [result] = await db.execute(
      'INSERT INTO mensajes (asignacion_id, emisor_id, receptor_id, mensaje) VALUES (?, ?, ?, ?)',
      [asignacionId, emisorId, receptorId, mensaje]
    );
    return result.insertId;
  }

  static async getMessageById(messageId) {
    const [rows] = await db.execute(
      `SELECT m.*, 
        u1.prinombre as emisor_nombre, u1.apepat as emisor_apellido,
        u2.prinombre as receptor_nombre, u2.apepat as receptor_apellido
       FROM mensajes m
       JOIN usuarios u1 ON m.emisor_id = u1.id
       JOIN usuarios u2 ON m.receptor_id = u2.id
       WHERE m.id = ?`,
      [messageId]
    );
    return rows[0];
  }

  static async getContactsForUser(userId, userType) {
    let query;
    let params;
    
    if ([10, 11].includes(userType)) {
      // Es un paciente, buscar sus doctores
      query = `
        SELECT u.id, u.prinombre, u.apepat, u.tipo, a.id as asignacion_id
        FROM usuarios u
        JOIN asignaciones a ON (u.id = a.id_doctor1 OR u.id = a.id_doctor2)
        WHERE a.id_paciente = ?
      `;
      params = [userId];
    } else if ([20, 21].includes(userType)) {
      // Es un doctor, buscar sus pacientes
      query = `
        SELECT u.id, u.prinombre, u.apepat, u.tipo, a.id as asignacion_id
        FROM usuarios u
        JOIN asignaciones a ON u.id = a.id_paciente
        WHERE a.id_doctor1 = ? OR a.id_doctor2 = ?
      `;
      params = [userId, userId];
    } else {
      throw new Error('Tipo de usuario no válido para chat');
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getLastMessage(userId, contactId) {
    const [rows] = await db.execute(
      `SELECT * FROM mensajes 
       WHERE (emisor_id = ? AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = ?)
       ORDER BY fecha_envio DESC LIMIT 1`,
      [userId, contactId, contactId, userId]
    );
    return rows[0];
  }

  static async getUnreadCount(senderId, receiverId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM mensajes 
       WHERE emisor_id = ? AND receptor_id = ? AND leido = false`,
      [senderId, receiverId]
    );
    return rows[0].count;
  }
}

module.exports = Message;