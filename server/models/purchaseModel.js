// models/purchaseModel.js
const db = require('../config/db');

class Purchase {
  // Obtener todas las compras de un usuario
  static async getPurchasesByUserId(userId) {
    const query = `
      SELECT v.id, v.fecha_pedido, v.fecha_llegada, v.folio_factura,
             dv.id_producto, dv.cantidad, dv.precio,
             p.nombre as nombre_producto, p.descripcion, p.imagen
      FROM venta v
      JOIN detalle_venta dv ON v.id = dv.id_venta
      JOIN producto p ON dv.id_producto = p.id
      WHERE v.id_paciente = ?
      ORDER BY v.fecha_pedido DESC
    `;
    
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Obtener detalles de una compra específica
  static async getPurchaseDetails(purchaseId) {
    const query = `
      SELECT v.id, v.fecha_pedido, v.fecha_llegada, v.folio_factura,
             v.id_paciente, dv.id_producto, dv.cantidad, dv.precio,
             p.nombre as nombre_producto, p.descripcion, p.imagen,
             u.prinombre, u.apepat, u.correo, u.tel
      FROM venta v
      JOIN detalle_venta dv ON v.id = dv.id_venta
      JOIN producto p ON dv.id_producto = p.id
      JOIN usuarios u ON v.id_paciente = u.id
      WHERE v.id = ?
    `;
    
    const [rows] = await db.execute(query, [purchaseId]);
    return rows;
  }

  // Crear una nueva compra (transaccional, se maneja en el controlador)
  static async createPurchase(userId, items, address) {
    // Este método sería utilizado en caso de no manejar la transacción en el controlador
    // Por ahora, toda la lógica transaccional está en purchaseController.js
  }
}

module.exports = Purchase;