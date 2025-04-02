// models/productModel.js
const db = require('../config/db');

class Product {
  static async getAllProducts(includeInactive = false) {
    let query = 'SELECT * FROM producto WHERE status = 1';
    
    if (includeInactive) {
      query = 'SELECT * FROM producto';
    }
    
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findByName(nombre) {
    const [rows] = await db.execute(
      'SELECT * FROM producto WHERE nombre = ?',
      [nombre]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM producto WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async createProduct(productData) {
    const {
      nombre, precio, descripcion, stock, imagen, status
    } = productData;
    
    const [result] = await db.execute(
      `INSERT INTO producto (
        nombre, precio, descripcion, stock, imagen, status
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, precio, descripcion, stock, imagen, status]
    );
    
    return result.insertId;
  }

  static async updateProduct(id, productData) {
    const {
      nombre, precio, descripcion, stock, imagen, status
    } = productData;
    
    const [result] = await db.execute(
      `UPDATE producto SET
        nombre = ?, precio = ?, descripcion = ?, 
        stock = ?, imagen = ?, status = ?
        WHERE id = ?`,
      [nombre, precio, descripcion, stock, imagen, status, id]
    );
    
    return result.affectedRows > 0;
  }

  static async toggleProductStatus(id) {
    // Primero obtenemos el status actual
    const [rows] = await db.execute(
      'SELECT status FROM producto WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      throw new Error('Producto no encontrado');
    }
    
    // Alternamos entre 0 y 1
    const currentStatus = rows[0].status;
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    // Actualizamos el status
    const [result] = await db.execute(
      'UPDATE producto SET status = ? WHERE id = ?',
      [newStatus, id]
    );
    
    return {
      success: result.affectedRows > 0,
      newStatus
    };
  }
}

module.exports = Product;