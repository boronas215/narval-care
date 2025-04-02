// DoctorList.js
import React, { useState, useEffect } from 'react';

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/doctors');
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de doctores');
      }
      
      const data = await response.json();
      setDoctors(data.doctors);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchDoctorPatients = async (doctorId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/assignments/doctor/${doctorId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener pacientes asignados');
      }
      
      const data = await response.json();
      setPatients(data.patients);
    } catch (err) {
      console.error('Error al cargar pacientes asignados:', err);
      setPatients([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    fetchDoctorPatients(doctor.id);
  };

  const getSpecialtyName = (tipo) => {
    return tipo === 20 ? 'Cardiólogo' : tipo === 21 ? 'Neumólogo' : 'Especialista';
  };

  if (loading) {
    return <div>Cargando doctores...</div>;
  }

  if (error) {
    return <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>
      Error: {error}
    </div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '1' }}>
          <h4>Lista de Doctores</h4>
          <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Apellido</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Especialidad</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doctor => (
                  <tr 
                    key={doctor.id} 
                    onClick={() => handleDoctorSelect(doctor)}
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: selectedDoctor?.id === doctor.id ? '#e2f0ff' : 'transparent',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {doctor.prinombre}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {doctor.apepat}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {getSpecialtyName(doctor.tipo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {selectedDoctor && (
          <div style={{ flex: '1' }}>
            <h4>Pacientes asignados a {selectedDoctor.prinombre} {selectedDoctor.apepat}</h4>
            
            {patients.length > 0 ? (
              <div style={{ border: '1px solid #ddd', borderRadius: '4px', height: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre Completo</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tipo</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Correo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient.id}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                          {`${patient.prinombre || ''} ${patient.segnombre || ''} ${patient.apepat || ''} ${patient.apemat || ''}`}
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                          {patient.tipoNombre}
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                          {patient.correo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
                Este doctor no tiene pacientes asignados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorList;