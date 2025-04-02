// controllers/purchaseController.js
const Purchase = require('../models/purchaseModel');
const Balance = require('../models/balanceModel');
const Product = require('../models/productModel');
const db = require('../config/db');

// Realizar una compra
exports.createPurchase = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { userId, productId, quantity, price } = req.body;
    
    // Validaciones básicas
    if (!userId || !productId || !quantity || !price) {
      await connection.rollback();
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    // Verificar que el usuario existe y es un paciente activo
    const [userRows] = await connection.execute(
      'SELECT * FROM usuarios WHERE id = ? AND tipo IN (10, 11)',
      [userId]
    );
    
    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Usuario no válido para realizar compras' });
    }
    
    // Verificar que el producto existe y está activo
    const product = await Product.findById(productId);
    if (!product || product.status !== 1) {
      await connection.rollback();
      return res.status(400).json({ message: 'Producto no disponible' });
    }
    
    // Verificar que hay stock suficiente
    if (product.stock < quantity) {
      await connection.rollback();
      return res.status(400).json({ message: 'Stock insuficiente' });
    }
    
    // Verificar que el usuario tiene saldo suficiente
    const balance = await Balance.getBalanceByUserId(userId);
    const totalPrice = price * quantity;
    
    if (!balance || balance.saldo < totalPrice) {
      await connection.rollback();
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }
    
    // Crear la venta
    const date = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    const [saleResult] = await connection.execute(
      'INSERT INTO venta (fecha_pedido, id_paciente) VALUES (?, ?)',
      [date, userId]
    );
    
    const saleId = saleResult.insertId;
    
    // Crear el detalle de venta
    await connection.execute(
      'INSERT INTO detalle_venta (id_producto, cantidad, precio, id_venta) VALUES (?, ?, ?, ?)',
      [productId, quantity, price, saleId]
    );
    
    // Actualizar el stock del producto
    await connection.execute(
      'UPDATE producto SET stock = stock - ? WHERE id = ?',
      [quantity, productId]
    );
    
    // Actualizar el saldo del usuario
    const newBalance = balance.saldo - totalPrice;
    await connection.execute(
      'UPDATE saldos SET saldo = ? WHERE id_usuario = ?',
      [newBalance, userId]
    );
    
    await connection.commit();
    
    res.status(201).json({
      message: 'Compra realizada con éxito',
      saleId,
      newBalance
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al procesar la compra:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  } finally {
    connection.release();
  }
};