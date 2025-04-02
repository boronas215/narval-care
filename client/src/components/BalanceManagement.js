import React, { useState, useEffect } from 'react';

function BalanceManagement() {
  const [balances, setBalances] = useState([]);
  const [adminBalance, setAdminBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [amount, setAmount] = useState('');
  const [adminAmount, setAdminAmount] = useState('');
  const [adminAction, setAdminAction] = useState('add'); // 'add' o 'subtract'
  
  // Cargar los saldos cuando el componente se monta
  useEffect(() => {
    fetchBalances();
    fetchAdminBalance();
  }, []);
  
  // Función para cargar los saldos desde la API
  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/balances');
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de saldos');
      }
      
      const data = await response.json();
      setBalances(data.balances);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Función para cargar el saldo del administrador
  const fetchAdminBalance = async () => {
    try {
      // Asegurarnos de obtener correctamente el ID del administrador desde localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No se encontró información del usuario en localStorage');
        return;
      }
      
      let userId;
      try {
        userId = JSON.parse(userStr).id;
        console.log('ID de administrador obtenido:', userId);
      } catch (e) {
        console.error('Error al parsear información del usuario:', e);
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/balances/admin/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener saldo del administrador');
      }
      
      const data = await response.json();
      console.log('Saldo obtenido para administrador:', data);
      setAdminBalance(data.balance);
    } catch (err) {
      console.error('Error al cargar saldo de administrador:', err);
      alert('Error al cargar saldo de administrador: ' + err.message);
    }
  };

  // Función para formatear el saldo como moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  // Función para mostrar el formulario de agregar saldo
  const handleAddBalance = (patient) => {
    setSelectedPatient(patient);
    setAmount('');
    setShowAddForm(true);
  };

  // Función para mostrar el formulario de gestionar saldo de admin
  const handleManageAdminBalance = () => {
    setAdminAmount('');
    setAdminAction('add');
    setShowAdminForm(true);
  };

  // Función para enviar el formulario de agregar saldo
  const handleSubmitAddBalance = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/balances/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          amount: parseFloat(amount)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al agregar saldo');
      }
      
      const data = await response.json();
      
      // Actualizar el saldo en la lista local sin necesidad de recargar toda la lista
      const updatedBalances = balances.map(balance => {
        if (balance.id === selectedPatient.id) {
          return { 
            ...balance, 
            saldo: data.newBalance 
          };
        }
        return balance;
      });
      
      setBalances(updatedBalances);
      alert(`Saldo agregado correctamente a ${selectedPatient.prinombre} ${selectedPatient.apepat}`);
      setShowAddForm(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Función para gestionar el saldo del administrador
  const handleSubmitAdminBalance = async (e) => {
    e.preventDefault();
    
    try {
      // Obtener el ID del usuario correctamente
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Error: No se encontró información del usuario');
        return;
      }
      
      let userId;
      try {
        userId = JSON.parse(userStr).id;
        console.log('ID de administrador para operación:', userId);
      } catch (e) {
        alert('Error al obtener información del usuario');
        return;
      }
      
      const action = adminAction === 'add' ? 'add' : 'subtract';
      const amountValue = parseFloat(adminAmount);
      
      if (isNaN(amountValue) || amountValue <= 0) {
        alert('El monto debe ser un número positivo');
        return;
      }
      
      console.log(`Enviando solicitud para ${action === 'add' ? 'agregar' : 'restar'} ${amountValue} al saldo del admin ID ${userId}`);
      
      const response = await fetch(`http://localhost:3001/api/balances/admin/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: userId,
          amount: amountValue
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al gestionar saldo');
      }
      
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      // Actualizar directamente el saldo del admin con el valor devuelto por la API
      if (data.newBalance !== undefined) {
        setAdminBalance(data.newBalance);
        console.log('Nuevo saldo establecido:', data.newBalance);
      } else {
        console.warn('La respuesta no incluye newBalance, recargando datos...');
        fetchAdminBalance();
      }
      
      alert(`Saldo ${adminAction === 'add' ? 'agregado' : 'restado'} correctamente`);
      setShowAdminForm(false);
    } catch (err) {
      console.error('Error completo:', err);
      alert('Error: ' + err.message);
    }
  };

  // Formulario para agregar saldo a un paciente
  const renderAddBalanceForm = () => {
    if (!showAddForm || !selectedPatient) return null;
    
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
          <h3 style={{ marginTop: 0 }}>Agregar Saldo</h3>
          <p>Paciente: {selectedPatient.prinombre} {selectedPatient.apepat}</p>
          <p>Saldo actual: {formatCurrency(selectedPatient.saldo)}</p>
          
          <form onSubmit={handleSubmitAddBalance}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
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
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
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
                type="submit"
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Formulario para gestionar saldo del administrador
  const renderAdminBalanceForm = () => {
    if (!showAdminForm) return null;
    
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
          <h3 style={{ marginTop: 0 }}>Gestionar Mi Saldo</h3>
          <p>Saldo actual: {formatCurrency(adminBalance)}</p>
          
          <form onSubmit={handleSubmitAdminBalance}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Acción:
              </label>
              <select
                value={adminAction}
                onChange={(e) => setAdminAction(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: '15px'
                }}
              >
                <option value="add">Agregar saldo</option>
                <option value="subtract">Restar saldo</option>
              </select>
              
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Monto:
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={adminAmount}
                onChange={(e) => setAdminAmount(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAdminForm(false)}
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
                type="submit"
                style={{
                  padding: '8px 15px',
                  backgroundColor: adminAction === 'add' ? '#28a745' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {adminAction === 'add' ? 'Agregar' : 'Restar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Cargando datos de saldos...</div>;
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Gestión de Saldos</h3>
        <div>
          <button
            onClick={handleManageAdminBalance}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Mi Saldo: {adminBalance !== null ? formatCurrency(adminBalance) : 'Cargando...'}
          </button>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tipo</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Saldo</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {balances.length > 0 ? (
              balances.map(balance => (
                <tr key={balance.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px 15px' }}>{balance.id}</td>
                  <td style={{ padding: '12px 15px' }}>{balance.prinombre} {balance.apepat} {balance.apemat}</td>
                  <td style={{ padding: '12px 15px' }}>
                    {balance.tipo === 10 ? 'General' : 
                     balance.tipo === 11 ? 'Privilegiado' : 
                     balance.tipo === 12 ? 'Inactivo' : 'Desconocido'}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(balance.saldo || 0)}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleAddBalance(balance)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Agregar Saldo
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '15px' }}>
                  No hay pacientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderAddBalanceForm()}
      {renderAdminBalanceForm()}
    </div>
  );
}

export default BalanceManagement;