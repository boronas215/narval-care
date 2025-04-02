import React, { useState, useEffect } from 'react';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    stock: '',
    imagen: '',
    status: 1
  });
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/products?includeInactive=true');
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de productos');
      }
      
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = 'http://localhost:3001/api/products';
      let method = 'POST';
      
      // Si estamos editando, cambiamos la URL y el método
      if (editingProduct) {
        url = `http://localhost:3001/api/products/${editingProduct.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProduct,
          precio: parseFloat(newProduct.precio),
          stock: parseInt(newProduct.stock),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la solicitud');
      }
      
      // Reiniciar formulario
      setNewProduct({
        nombre: '',
        precio: '',
        descripcion: '',
        stock: '',
        imagen: '',
        status: 1
      });
      
      setEditingProduct(null);
      setShowForm(false);
      alert(editingProduct ? 'Producto actualizado exitosamente' : 'Producto registrado exitosamente');
      
      // Actualizar la lista de productos
      fetchProducts();
      
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditProduct = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del producto');
      }
      
      const data = await response.json();
      setEditingProduct(data.product);
      setNewProduct({
        nombre: data.product.nombre,
        precio: data.product.precio.toString(),
        descripcion: data.product.descripcion || '',
        stock: data.product.stock.toString(),
        imagen: data.product.imagen || '',
        status: data.product.status
      });
      setShowForm(true);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`¿Está seguro de ${currentStatus === 1 ? 'desactivar' : 'activar'} este producto?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cambiar estado del producto');
      }
      
      const data = await response.json();
      alert(data.message);
      
      // Actualizar la lista de productos
      fetchProducts();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Renderiza el formulario de productos
  const renderProductForm = () => {
    if (!showForm) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>
              {editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div>
                <h4>Datos Básicos</h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Nombre: *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={newProduct.nombre}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Precio: *</label>
                  <input
                    type="number"
                    name="precio"
                    value={newProduct.precio}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Stock:</label>
                  <input
                    type="number"
                    name="stock"
                    value={newProduct.stock}
                    onChange={handleChange}
                    min="0"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
              
              <div>
                <h4>Información Adicional</h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
                  <textarea
                    name="descripcion"
                    value={newProduct.descripcion}
                    onChange={handleChange}
                    rows="4"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Imagen:</label>
                  <input
                    type="text"
                    name="imagen"
                    value={newProduct.imagen}
                    onChange={handleChange}
                    placeholder="Nombre del archivo (ej: producto.jpg)"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <small style={{ color: '#666' }}>La imagen debe estar en la carpeta public/images/productos/</small>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingProduct ? 'Actualizar' : 'Registrar Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>
      Error: {error}
    </div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Tabla de Productos</h3>
        <button
          onClick={() => {
            setEditingProduct(null);
            setNewProduct({
              nombre: '',
              precio: '',
              descripcion: '',
              stock: '',
              imagen: '',
              status: 1
            });
            setShowForm(true);
          }}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Registrar Producto
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Imagen</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Precio</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Stock</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Estado</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px 15px' }}>{product.id}</td>
                  <td style={{ padding: '12px 15px' }}>
                    {product.imagen ? (
                      <img 
                        src={`http://localhost:3001/${product.imagen}`} 
                        alt={product.nombre}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      'Sin imagen'
                    )}
                  </td>
                  <td style={{ padding: '12px 15px' }}>{product.nombre}</td>
                  <td style={{ padding: '12px 15px' }}>${Number(product.precio).toFixed(2)}</td>                  <td style={{ padding: '12px 15px' }}>{product.stock}</td>
                  <td style={{ padding: '12px 15px' }}>
                    <span style={{
                      backgroundColor: product.status === 1 ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {product.status === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleEditProduct(product.id)}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '5px'
                      }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(product.id, product.status)}
                      style={{
                        backgroundColor: product.status === 1 ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {product.status === 1 ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '15px' }}>
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderProductForm()}
    </div>
  );
}

export default ProductManagement;