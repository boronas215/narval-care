// models/assignmentModel.js
const db = require('../config/db');

class Assignment {
  static async getByPatientId(patientId) {
    const [rows] = await db.execute(
      `SELECT a.id, a.id_doctor1, a.id_doctor2, 
        d1.prinombre as doctor1_nombre, d1.apepat as doctor1_apellido, d1.tipo as doctor1_tipo,
        d2.prinombre as doctor2_nombre, d2.apepat as doctor2_apellido, d2.tipo as doctor2_tipo
       FROM asignaciones a
       LEFT JOIN usuarios d1 ON a.id_doctor1 = d1.id
       LEFT JOIN usuarios d2 ON a.id_doctor2 = d2.id
       WHERE a.id_paciente = ?`,
      [patientId]
    );
    
    // Transformar los resultados para un formato más fácil de usar en el frontend
    return rows.flatMap(row => {
      const assignments = [];
      
      if (row.id_doctor1) {
        assignments.push({
          id: `${row.id}_1`,
          doctorId: row.id_doctor1,
          doctorName: `${row.doctor1_nombre} ${row.doctor1_apellido}`,
          specialtyName: row.doctor1_tipo === 20 ? 'Cardiólogo' : 'Neumólogo'
        });
      }
      
      if (row.id_doctor2) {
        assignments.push({
          id: `${row.id}_2`,
          doctorId: row.id_doctor2,
          doctorName: `${row.doctor2_nombre} ${row.doctor2_apellido}`,
          specialtyName: row.doctor2_tipo === 20 ? 'Cardiólogo' : 'Neumólogo'
        });
      }
      
      return assignments;
    });
  }

  static async getPatientsByDoctorId(doctorId) {
    const [rows] = await db.execute(
      `SELECT u.*, a.id as assignment_id 
       FROM usuarios u
       JOIN asignaciones a ON u.id = a.id_paciente
       WHERE a.id_doctor1 = ? OR a.id_doctor2 = ?`,
      [doctorId, doctorId]
    );
    
    // Formatear los resultados
    return rows.map(row => ({
      ...row,
      tipoNombre: row.tipo === 10 ? 'General' : 'Privilegiado'
    }));
  }

  static async checkExisting(patientId, doctorId) {
    const [rows] = await db.execute(
      `SELECT * FROM asignaciones 
       WHERE id_paciente = ? AND (id_doctor1 = ? OR id_doctor2 = ?)`,
      [patientId, doctorId, doctorId]
    );
    
    return rows.length > 0;
  }

  static async create(patientId, doctorId) {
    // Primero verificamos si ya existe una asignación para este paciente
    const [existingAssignments] = await db.execute(
      'SELECT * FROM asignaciones WHERE id_paciente = ?',
      [patientId]
    );
    
    if (existingAssignments.length === 0) {
      // No hay asignación, creamos una nueva con doctor1
      const [result] = await db.execute(
        'INSERT INTO asignaciones (id_paciente, id_doctor1) VALUES (?, ?)',
        [patientId, doctorId]
      );
      
      return result.insertId;
    } else {
      // Ya existe una asignación, verificamos si doctor1 está asignado
      const assignment = existingAssignments[0];
      
      if (!assignment.id_doctor1) {
        // doctor1 disponible
        const [result] = await db.execute(
          'UPDATE asignaciones SET id_doctor1 = ? WHERE id = ?',
          [doctorId, assignment.id]
        );
        
        return assignment.id;
      } else if (!assignment.id_doctor2) {
        // doctor2 disponible
        const [result] = await db.execute(
          'UPDATE asignaciones SET id_doctor2 = ? WHERE id = ?',
          [doctorId, assignment.id]
        );
        
        return assignment.id;
      } else {
        // Ambos doctores ya asignados
        throw new Error('Este paciente ya tiene dos doctores asignados');
      }
    }
  }

  static async delete(assignmentId) {
    // El ID viene en formato "assignmentId_position"
    const [baseId, position] = assignmentId.split('_');
    
    let query;
    if (position === '1') {
      query = 'UPDATE asignaciones SET id_doctor1 = NULL WHERE id = ?';
    } else {
      query = 'UPDATE asignaciones SET id_doctor2 = NULL WHERE id = ?';
    }
    
    const [result] = await db.execute(query, [baseId]);
    
    // Si ambos doctores son NULL, eliminamos la entrada
    const [checkRows] = await db.execute(
      'SELECT * FROM asignaciones WHERE id = ? AND id_doctor1 IS NULL AND id_doctor2 IS NULL',
      [baseId]
    );
    
    if (checkRows.length > 0) {
      await db.execute('DELETE FROM asignaciones WHERE id = ?', [baseId]);
    }
    
    return result.affectedRows > 0;
  }
}

module.exports = Assignment;