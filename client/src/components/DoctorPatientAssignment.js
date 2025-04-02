// DoctorPatientAssignment.js
import React, { useState, useEffect } from 'react';
import PatientList from './PatientList';
import DoctorList from './DoctorList';

function DoctorPatientAssignment() {
  const [activeTab, setActiveTab] = useState('patients');

  return (
    <div>
      <h3>Asignación Doctor-Paciente</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
          <button 
            onClick={() => setActiveTab('patients')}
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'patients' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'patients' ? 'white' : '#333',
              border: 'none',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              marginRight: '5px'
            }}
          >
            Pacientes
          </button>
          <button 
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'doctors' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'doctors' ? 'white' : '#333',
              border: 'none',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px'
            }}
          >
            Doctores
          </button>
        </div>
      </div>
      
      <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '0 0 4px 4px' }}>
        {activeTab === 'patients' ? <PatientList /> : <DoctorList />}
      </div>
    </div>
  );
}

export default DoctorPatientAssignment;