// PatientList.js
import React, { useState, useEffect } from 'react';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assigningDoctor, setAssigningDoctor] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  // En PatientList.js, modifica la función fetchPatients
const fetchPatients = async () => {
    try {
      setLoading(true);
      // Modificar la URL para incluir un parámetro que filtre solo por tipo 11
      const response = await fetch('http://localhost:3001/api/users/patients?type=11');
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de pacientes');
      }
      
      const data = await response.json();
      setPatients(data.patients);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/doctors');
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de doctores');
      }
      
      const data = await response.json();
      setDoctors(data.doctors);
    } catch (err) {
      console.error('Error al cargar doctores:', err);
    }
  };

  const fetchPatientAssignments = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/assignments/patient/${patientId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener asignaciones');
      }
      
      const data = await response.json();
      setAssignments(data.assignments);
    } catch (err) {
      console.error('Error al cargar asignaciones:', err);
      setAssignments([]);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientAssignments(patient.id);
  };

  const handleAssignDoctor = async () => {
    if (!selectedPatient || !assigningDoctor) {
      alert('Seleccione un paciente y un doctor');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorId: assigningDoctor
        })
      });

      if (!response.ok) {
        throw new Error('Error al asignar doctor');
      }

      alert('Doctor asignado correctamente');
      fetchPatientAssignments(selectedPatient.id);
      setAssigningDoctor('');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('¿Está seguro de eliminar esta asignación?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar asignación');
      }

      alert('Asignación eliminada correctamente');
      fetchPatientAssignments(selectedPatient.id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return <div>Cargando pacientes...</div>;
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
          <h4>Lista de Pacientes</h4>
          <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
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
                  <tr 
                    key={patient.id} 
                    onClick={() => handlePatientSelect(patient)}
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: selectedPatient?.id === patient.id ? '#e2f0ff' : 'transparent',
                      transition: 'background-color 0.3s'
                    }}
                  >
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
        </div>
        
        {selectedPatient && (
          <div style={{ flex: '1' }}>
            <h4>Asignaciones para {selectedPatient.prinombre} {selectedPatient.apepat}</h4>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select 
                  value={assigningDoctor} 
                  onChange={(e) => setAssigningDoctor(e.target.value)}
                  style={{ flex: '1', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">Seleccione un doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.prinombre} {doctor.apepat} - {doctor.tipo === 20 ? 'Cardiólogo' : 'Neumólogo'}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleAssignDoctor}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Asignar Doctor
                </button>
              </div>
              
              {assignments.length > 0 ? (
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                  <h5>Doctores Asignados</h5>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {assignments.map(assignment => (
                      <li key={assignment.id} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          {assignment.doctorName} - {assignment.specialtyName}
                        </div>
                        <button 
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
                  Este paciente no tiene doctores asignados
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientList;