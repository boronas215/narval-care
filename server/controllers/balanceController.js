// controllers/balanceController.js
const Balance = require('../models/balanceModel');
const db = require('../config/db'); // Importar db para verificaciones

// Obtener todos los saldos de los pacientes
exports.getBalances = async (req, res) => {
  try {
    const balances = await Balance.getAllBalances();
    res.status(200).json({ balances });
  } catch (error) {
    console.error('Error al obtener saldos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener saldo del administrador
exports.getAdminBalance = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    
    console.log(`Obteniendo saldo para admin ID: ${adminId}`);
    
    // Verificar que el ID pertenece a un administrador
    const [adminCheck] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ? AND tipo = 31',
      [adminId]
    );
    
    if (adminCheck.length === 0) {
      console.log(`Usuario ID ${adminId} no es administrador`);
      return res.status(403).json({ message: 'El ID proporcionado no corresponde a un administrador' });
    }
    
    const balance = await Balance.getBalanceByUserId(adminId);
    
    if (!balance) {
      // Si no existe, crear uno nuevo con saldo 0
      console.log(`Creando saldo para admin ID ${adminId}`);
      const newBalanceId = await Balance.createBalance(adminId, 0);
      res.status(200).json({ balance: 0, balanceId: newBalanceId });
    } else {
      console.log(`Saldo encontrado para admin ID ${adminId}: ${balance.saldo}`);
      res.status(200).json({ balance: balance.saldo, balanceId: balance.id });
    }
  } catch (error) {
    console.error('Error al obtener saldo del administrador:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Agregar saldo a un paciente
exports.addBalance = async (req, res) => {
  try {
    const { patientId, amount } = req.body;
    
    if (!patientId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'PatientId y amount son requeridos y amount debe ser mayor a 0' });
    }
    
    // Verificar si ya existe un registro de saldo para este paciente
    let balance = await Balance.getBalanceByUserId(patientId);
    
    if (!balance) {
      // Crear un nuevo registro de saldo
      await Balance.createBalance(patientId, amount);
    } else {
      // Actualizar el saldo existente
      await Balance.updateBalance(patientId, balance.saldo + amount);
    }
    
    // Obtener el saldo actualizado
    const updatedBalance = await Balance.getBalanceByUserId(patientId);
    const updatedAmount = updatedBalance ? updatedBalance.saldo : amount;
    
    res.status(200).json({ 
      message: 'Saldo agregado exitosamente',
      newBalance: updatedAmount
    });
  } catch (error) {
    console.error('Error al agregar saldo:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

// Agregar saldo al administrador
exports.addAdminBalance = async (req, res) => {
  try {
    const { adminId, amount } = req.body;
    
    if (!adminId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'AdminId y amount son requeridos y amount debe ser mayor a 0' });
    }
    
    // Verificar que el ID pertenece a un administrador
    const [adminCheck] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ? AND tipo = 31',
      [adminId]
    );
    
    if (adminCheck.length === 0) {
      return res.status(403).json({ message: 'El ID proporcionado no corresponde a un administrador' });
    }
    
    console.log(`Agregando ${amount} al saldo del admin ID: ${adminId}`);
    
    // Verificar si ya existe un registro de saldo para este administrador
    let balance = await Balance.getBalanceByUserId(adminId);
    let newBalance = 0;
    
    if (!balance) {
      // Crear un nuevo registro de saldo
      console.log(`Admin ID ${adminId} no tiene saldo, creando nuevo registro`);
      await Balance.createBalance(adminId, amount);
      newBalance = amount;
    } else {
      // Actualizar el saldo existente
      newBalance = parseFloat(balance.saldo) + parseFloat(amount);
      console.log(`Admin ID ${adminId} saldo actual: ${balance.saldo}, nuevo saldo: ${newBalance}`);
      await Balance.updateBalance(adminId, newBalance);
    }
    
    // Verificar que la operación fue exitosa
    const updatedBalance = await Balance.getBalanceByUserId(adminId);
    
    if (!updatedBalance) {
      throw new Error('No se pudo verificar la actualización del saldo');
    }
    
    console.log(`Saldo actualizado para admin ID ${adminId}: ${updatedBalance.saldo}`);
    
    res.status(200).json({ 
      message: 'Saldo agregado exitosamente',
      newBalance: updatedBalance.saldo
    });
  } catch (error) {
    console.error('Error al agregar saldo al administrador:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

// Restar saldo al administrador
exports.subtractAdminBalance = async (req, res) => {
  try {
    const { adminId, amount } = req.body;
    
    if (!adminId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'AdminId y amount son requeridos y amount debe ser mayor a 0' });
    }
    
    // Verificar que el ID pertenece a un administrador
    const [adminCheck] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ? AND tipo = 31',
      [adminId]
    );
    
    if (adminCheck.length === 0) {
      return res.status(403).json({ message: 'El ID proporcionado no corresponde a un administrador' });
    }
    
    console.log(`Restando ${amount} al saldo del admin ID: ${adminId}`);
    
    // Verificar si ya existe un registro de saldo para este administrador
    let balance = await Balance.getBalanceByUserId(adminId);
    
    if (!balance) {
      return res.status(400).json({ message: 'El administrador no tiene saldo registrado' });
    }
    
    const currentBalance = parseFloat(balance.saldo);
    const amountToSubtract = parseFloat(amount);
    
    console.log(`Admin ID ${adminId} saldo actual: ${currentBalance}, cantidad a restar: ${amountToSubtract}`);
    
    if (currentBalance < amountToSubtract) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }
    
    // Actualizar el saldo existente
    const newBalance = currentBalance - amountToSubtract;
    console.log(`Admin ID ${adminId} nuevo saldo calculado: ${newBalance}`);
    
    await Balance.updateBalance(adminId, newBalance);
    
    // Verificar que la operación fue exitosa
    const updatedBalance = await Balance.getBalanceByUserId(adminId);
    
    if (!updatedBalance) {
      throw new Error('No se pudo verificar la actualización del saldo');
    }
    
    console.log(`Saldo actualizado para admin ID ${adminId}: ${updatedBalance.saldo}`);
    
    res.status(200).json({ 
      message: 'Saldo restado exitosamente',
      newBalance: updatedBalance.saldo
    });
  } catch (error) {
    console.error('Error al restar saldo al administrador:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};