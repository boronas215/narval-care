import React, { useState, useEffect } from 'react';

function ProductCatalog({ balance, userId, onPurchase }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/products');
      
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      
      const data = await response.json();
      
      // Solo productos activos
      const activeProducts = data.products.filter(product => product.status === 1);
      setProducts(activeProducts);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePurchase = (product) => {
    // Asegurarnos que balance sea un número
    const numericBalance = typeof balance === 'number' ? balance : 0;
    
    // Verificar si el usuario tiene saldo suficiente
    if (numericBalance < product.precio) {
      alert('Saldo insuficiente para realizar esta compra');
      return;
    }

    setSelectedProduct(product);
    setShowConfirm(true);
  };

  const confirmPurchase = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId: selectedProduct.id,
          quantity: 1,
          price: selectedProduct.precio
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la compra');
      }

      const data = await response.json();
      alert(data.message || 'Compra realizada con éxito');
      
      // Actualizar el saldo
      if (onPurchase) onPurchase();
      
      setShowConfirm(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Modal de confirmación de compra
  const renderConfirmModal = () => {
    if (!showConfirm || !selectedProduct) return null;

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
          maxWidth: '500px'
        }}>
          <h3 style={{ marginTop: 0 }}>Confirmar Compra</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <p><strong>Producto:</strong> {selectedProduct.nombre}</p>
            <p><strong>Precio:</strong> ${selectedProduct.precio.toFixed(2)}</p>
            <p><strong>Su saldo actual:</strong> ${typeof balance === 'number' ? balance.toFixed(2) : '0.00'}</p>
            <p><strong>Saldo después de la compra:</strong> ${(typeof balance === 'number' ? balance - parseFloat(selectedProduct.precio) : 0).toFixed(2)}</p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                padding: '8px 15px',
                marginRight: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={confirmPurchase}
              style={{
                padding: '8px 15px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Confirmar Compra
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando productos...</div>;
  }

  if (error) {
    return (
      <div style={{ 
        padding: '15px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        Error: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>No hay productos disponibles en este momento</h3>
        <p>Por favor, vuelva a consultar más tarde.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Catálogo de Productos</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div 
            key={product.id} 
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer',
              ':hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
              {product.imagen ? (
                <img 
                  src={`http://localhost:3001/${product.imagen}`} 
                  alt={product.nombre}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  backgroundColor: '#e9ecef'
                }}>
                  <span>Sin imagen</span>
                </div>
              )}
            </div>
            
            <div style={{ padding: '15px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{product.nombre}</h3>
              <p style={{ margin: '0 0 15px', color: '#666' }}>
                {product.descripcion || 'Sin descripción disponible'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                  ${parseFloat(product.precio).toFixed(2)}
                </span>
                {(() => {
                  // Asegurarnos que balance sea un número
                  const numericBalance = typeof balance === 'number' ? balance : 0;
                  const hasEnoughBalance = numericBalance >= parseFloat(product.precio);
                  
                  return (
                    <button
                      onClick={() => handlePurchase(product)}
                      style={{
                        backgroundColor: hasEnoughBalance ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '4px',
                        cursor: hasEnoughBalance ? 'pointer' : 'not-allowed'
                      }}
                      disabled={!hasEnoughBalance}
                    >
                      {hasEnoughBalance ? 'Comprar' : 'Saldo insuficiente'}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {renderConfirmModal()}
    </div>
  );
}

export default ProductCatalog;