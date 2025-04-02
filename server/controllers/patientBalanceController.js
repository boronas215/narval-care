// controllers/patientBalanceController.js
const Balance = require('../models/balanceModel');
const db = require('../config/db');

// Obtener saldo de un paciente
exports.getPatientBalance = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Verificar que es un paciente
    const [userCheck] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ? AND tipo IN (10, 11, 12)',
      [patientId]
    );
    
    if (userCheck.length === 0) {
      return res.status(403).json({ message: 'ID de paciente no válido' });
    }
    
    const balance = await Balance.getBalanceByUserId(patientId);
    
    if (!balance) {
      // Si no existe, creamos uno nuevo con saldo 0
      await Balance.createBalance(patientId, 0);
      res.status(200).json({ balance: 0 });
    } else {
      // Asegurarnos de que el saldo sea numérico
      const numericBalance = parseFloat(balance.saldo);
      res.status(200).json({ balance: numericBalance });
    }
  } catch (error) {
    console.error('Error al obtener saldo del paciente:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Permitir que el paciente agregue saldo a sí mismo
exports.addSelfBalance = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'ID de usuario y monto son requeridos. El monto debe ser mayor a 0' });
    }
    
    // Verificar que es un paciente
    const [userCheck] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ? AND tipo IN (10, 11)',
      [userId]
    );
    
    if (userCheck.length === 0) {
      return res.status(403).json({ message: 'Operación no permitida' });
    }
    
    // Verificar si ya existe un registro de saldo para este paciente
    let balance = await Balance.getBalanceByUserId(userId);
    let newBalance = 0;
    
    if (!balance) {
      // Crear un nuevo registro de saldo
      await Balance.createBalance(userId, amount);
      newBalance = amount;
    } else {
      // Actualizar el saldo existente
      newBalance = parseFloat(balance.saldo) + parseFloat(amount);
      await Balance.updateBalance(userId, newBalance);
    }
    
    res.status(200).json({ 
      message: 'Saldo agregado exitosamente',
      newBalance: newBalance
    });
  } catch (error) {
    console.error('Error al agregar saldo:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};