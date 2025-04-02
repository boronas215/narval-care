// controllers/productController.js
const Product = require('../models/productModel');

exports.getProducts = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const products = await Product.getAllProducts(includeInactive);

    const formattedProducts = products.map(product => ({
      ...product,
      statusName: product.status === 1 ? 'Activo' : 'Inactivo'
    }));
    
    res.status(200).json({ products: formattedProducts });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.status(200).json({ product });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.registerProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Validación básica
    if (!productData.nombre || !productData.precio) {
      return res.status(400).json({ message: 'Nombre y precio son requeridos' });
    }

    // Verificar si el producto ya existe (opcional, si quieres evitar duplicados)
    const existingProduct = await Product.findByName(productData.nombre);
    if (existingProduct) {
      return res.status(409).json({ message: 'Ya existe un producto con ese nombre' });
    }

    // Asegurarse de que el status sea 1 (activo) por defecto si no se proporciona
    if (productData.status === undefined) {
      productData.status = 1;
    }
    
    // Procesar la ruta de la imagen
    if (!productData.imagen) {
      productData.imagen = 'images/productos/default.jpg'; // Imagen por defecto
    } else if (!productData.imagen.startsWith('images/productos/')) {
      // Asegurarse de que la ruta comience con el directorio adecuado
      productData.imagen = 'images/productos/' + productData.imagen;
    }

    // Crear nuevo producto
    const productId = await Product.createProduct(productData);
    
    res.status(201).json({
      message: 'Producto registrado exitosamente',
      productId
    });

  } catch (error) {
    console.error('Error en registro de producto:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const productData = req.body;
    
    // Validación básica
    if (!productData.nombre || !productData.precio) {
      return res.status(400).json({ message: 'Nombre y precio son requeridos' });
    }
    
    // Verificar si el producto existe
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Procesar la ruta de la imagen
    if (productData.imagen && !productData.imagen.startsWith('images/productos/')) {
      productData.imagen = 'images/productos/' + productData.imagen;
    }
    
    // Actualizar el producto
    const success = await Product.updateProduct(id, productData);
    
    if (success) {
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } else {
      res.status(400).json({ message: 'No se pudo actualizar el producto' });
    }
    
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cambiar el estado
    const result = await Product.toggleProductStatus(id);
    
    if (result.success) {
      const status = result.newStatus === 1 ? 'activado' : 'desactivado';
      res.status(200).json({
        message: `Producto ${status} exitosamente`,
        newStatus: result.newStatus
      });
    } else {
      res.status(400).json({ message: 'No se pudo cambiar el estado del producto' });
    }
    
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};