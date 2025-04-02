import React, { useState, useEffect } from 'react';
import ProductCatalog from './patient/ProductCatalog';
import PatientBalance from './patient/PatientBalance';
import DeviceTips from './patient/DeviceTips';

function PatientDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar el saldo del paciente
  useEffect(() => {
    if (user) {
      fetchPatientBalance();
    }
  }, [user]);

  const fetchPatientBalance = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/balances/patient/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        // Asegurarse de que balance sea un número
        const numericBalance = typeof data.balance === 'number' ? data.balance : 0;
        setBalance(numericBalance);
        console.log('Balance cargado:', numericBalance);
      } else {
        // Si hay un error, establecer balance en 0
        setBalance(0);
        console.log('Error al cargar balance, estableciendo a 0');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar saldo:', error);
      // En caso de error, establecer balance en 0
      setBalance(0);
      setLoading(false);
    }
  };

  // Cuando se actualice el saldo, refrescar
  const handleBalanceUpdate = () => {
    fetchPatientBalance();
  };

  const renderContent = () => {
    // Si es un paciente tipo 11 (privilegiado), mostrar los tips
    if (user.tipo === 11 && activeTab === 'tips') {
      return <DeviceTips />;
    }

    // Contenido basado en el tab activo
    switch (activeTab) {
      case 'catalog':
        return <ProductCatalog balance={balance} userId={user.id} onPurchase={handleBalanceUpdate} />;
      case 'balance':
        return <PatientBalance userId={user.id} balance={balance} onBalanceUpdate={handleBalanceUpdate} />;
      default:
        return <ProductCatalog balance={balance} userId={user.id} onPurchase={handleBalanceUpdate} />;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2>Hola, {user.correo}</h2>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '10px 15px',
            borderRadius: '8px',
            marginRight: '15px',
            fontWeight: 'bold'
          }}>
            Saldo: ${typeof balance === 'number' ? balance.toFixed(2) : '0.00'}
          </div>
          <button 
            onClick={onLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <button 
          onClick={() => setActiveTab('catalog')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            backgroundColor: activeTab === 'catalog' ? '#007bff' : 'transparent',
            color: activeTab === 'catalog' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
        >
          Catálogo de Productos
        </button>
        <button 
          onClick={() => setActiveTab('balance')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            backgroundColor: activeTab === 'balance' ? '#007bff' : 'transparent',
            color: activeTab === 'balance' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
        >
          Gestionar Saldo
        </button>
        {user.tipo === 11 && (
          <button 
            onClick={() => setActiveTab('tips')}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              backgroundColor: activeTab === 'tips' ? '#007bff' : 'transparent',
              color: activeTab === 'tips' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
          >
            Tips de Uso
          </button>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Cargando...</div>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {renderContent()}
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;