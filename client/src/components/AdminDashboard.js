import React, { useState } from 'react';
import PatientManagement from './PatientManagement';
import DoctorManagement from './DoctorManagement';
import ProductManagement from './ProductManagement';
import DoctorPatientAssignment from './DoctorPatientAssignment';
import BalanceManagement from './BalanceManagement';


function AdminDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState(null);

  const renderSection = () => {
    switch (activeSection) {
      case 'patients':
        return <PatientManagement />;
      case 'doctors':
        return <DoctorManagement />;
      case 'products':
        return <ProductManagement />;
      case 'doctor-patient':
        return <DoctorPatientAssignment />;
      case 'balances':
        return <BalanceManagement />;
      case 'reports':
        return <div><h3>Reportes</h3><p>Funcionalidad en desarrollo...</p></div>;
      default:
        return (
          <div className="welcome-message">
            <h3>Panel de Administración</h3>
            <p>Seleccione una opción para comenzar.</p>
          </div>
        );
    }
  };

  const optionCardStyle = {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '150px'
  };

  const activeStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    backgroundColor: '#e9ecef'
  };

  const iconStyle = {
    fontSize: '32px',
    marginBottom: '10px',
    color: '#007bff'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2>Hola, {user.prinombre || 'Administrador'}</h2>
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

      {activeSection ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3>{activeSection === 'patients' ? 'Gestión de Pacientes' :
                 activeSection === 'doctors' ? 'Gestión de Doctores' :
                 activeSection === 'products' ? 'Gestión de Productos' :
                 activeSection === 'doctor-patient' ? 'Doctor-Paciente' :
                 activeSection === 'balances' ? 'Saldos' : 'Reportes'}</h3>
            <button 
              onClick={() => setActiveSection(null)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Volver al Panel
            </button>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {renderSection()}
          </div>
        </div>
      ) : (
        <div>
          <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>Panel de Administración</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div 
              style={{...optionCardStyle, ...(activeSection === 'patients' ? activeStyle : {})}} 
              onClick={() => setActiveSection('patients')}
            >
              <div style={iconStyle}>👤</div>
              <div>Gestión de Pacientes</div>
            </div>
            <div 
              style={{...optionCardStyle, ...(activeSection === 'doctors' ? activeStyle : {})}} 
              onClick={() => setActiveSection('doctors')}
            >
              <div style={iconStyle}>👨‍⚕️</div>
              <div>Gestión de Doctores</div>
            </div>
            <div 
              style={{...optionCardStyle, ...(activeSection === 'products' ? activeStyle : {})}} 
              onClick={() => setActiveSection('products')}
            >
              <div style={iconStyle}>💊</div>
              <div>Gestión de Productos</div>
            </div>
            <div 
              style={{...optionCardStyle, ...(activeSection === 'doctor-patient' ? activeStyle : {})}} 
              onClick={() => setActiveSection('doctor-patient')}
            >
              <div style={iconStyle}>🔄</div>
              <div>Asignaciones Doctor-Paciente</div>
            </div>
            <div 
              style={{...optionCardStyle, ...(activeSection === 'balances' ? activeStyle : {})}} 
              onClick={() => setActiveSection('balances')}
            >
              <div style={iconStyle}>💰</div>
              <div>Saldos</div>
            </div>
            <div 
              style={{...optionCardStyle, ...(activeSection === 'reports' ? activeStyle : {})}} 
              onClick={() => setActiveSection('reports')}
            >
              <div style={iconStyle}>📊</div>
              <div>Reportes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;