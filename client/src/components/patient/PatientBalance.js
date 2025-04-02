import React, { useState } from 'react';

function PatientBalance({ userId, balance, onBalanceUpdate }) {
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Por favor, ingrese un monto válido mayor a 0');
      return;
    }
    
    try {
      setAdding(true);
      
      // Llamamos al endpoint para añadir saldo
      const response = await fetch('http://localhost:3001/api/balances/add-self', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: amountValue
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar saldo');
      }
      
      // Limpiamos el formulario
      setAmount('');
      
      // Notificar que se actualizó el saldo
      if (onBalanceUpdate) {
        onBalanceUpdate();
      }
      
      alert('Saldo agregado correctamente');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>Gestionar Saldo</h2>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px' }}>Su saldo actual</h3>
        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
          ${typeof balance === 'number' ? balance.toFixed(2) : '0.00'}
        </span>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Añadir Saldo</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Monto a agregar:
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px'
              }}
              disabled={adding}
              placeholder="Ingrese el monto a agregar"
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <button
              type="submit"
              disabled={adding}
              style={{
                width: '100%',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '4px',
                cursor: adding ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {adding ? 'Procesando...' : 'Agregar Saldo'}
            </button>
          </div>
        </form>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
          <p>El saldo agregado se verá reflejado inmediatamente en su cuenta.</p>
          <p>Este saldo podrá utilizarlo para comprar productos de nuestro catálogo.</p>
        </div>
      </div>
    </div>
  );
}

export default PatientBalance;