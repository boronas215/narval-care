import React, { useState, useEffect } from 'react';

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    prinombre: '',
    segnombre: '',
    apepat: '',
    apemat: '',
    curp: '',
    correo: '',
    password: '',
    fechanac: '',
    tel: '',
    nomfamiliar: '',
    telfamiliar: '',
    calle: '',
    numint: '',
    numext: '',
    colonia: '',
    codpost: '',
    ciudad: '',
    estado: '',
    rfc: '',
    regimenfiscal: '',
    tipo: 10
  });
  
  useEffect(() => {
    fetchPatients();
  }, []);
  
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/users/patients?includeInactive=true');
      
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPatient({
      ...newPatient,
      [name]: value
    });
  };

  // En la función handleSubmit del PatientManagement.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = 'http://localhost:3001/api/users/register';
      let method = 'POST';
      
      // Si estamos editando, cambiamos la URL y el método
      if (editingPatient) {
        url = `http://localhost:3001/api/users/patients/${editingPatient.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatient),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la solicitud');
      }
      
      // Reiniciar formulario
      setNewPatient({
        prinombre: '',
        segnombre: '',
        apepat: '',
        apemat: '',
        curp: '',
        correo: '',
        password: '',
        fechanac: '',
        tel: '',
        nomfamiliar: '',
        telfamiliar: '',
        calle: '',
        numint: '',
        numext: '',
        colonia: '',
        codpost: '',
        ciudad: '',
        estado: '',
        rfc: '',
        regimenfiscal: '',
        tipo: 10
      });
      
      setEditingPatient(null);
      setShowForm(false);
      alert(editingPatient ? 'Paciente actualizado exitosamente' : 'Paciente registrado exitosamente');
      
      // Actualizar la lista de pacientes
      fetchPatients();
      
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
  // Función para cargar los datos del paciente a editar
  const handleEditPatient = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/users/patients/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del paciente');
      }
      
      const data = await response.json();
      
      // Formatear la fecha de nacimiento al formato YYYY-MM-DD
      if (data.patient && data.patient.fechanac) {
        data.patient.fechanac = data.patient.fechanac.substring(0, 10);
      }
      
      setEditingPatient(data.patient);
      setNewPatient(data.patient);
      setShowForm(true);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

// Función para activar/desactivar paciente
const handleToggleStatus = async (id, currentType) => {
  if (!window.confirm(`¿Está seguro de ${currentType === 12 ? 'activar' : 'desactivar'} este paciente?`)) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3001/api/users/patients/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error al cambiar estado del paciente');
    }
    
    const data = await response.json();
    alert(data.message);
    
    // Actualizar la lista de pacientes
    fetchPatients();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};
  // Modal/formulario de registro de paciente
  const renderPatientForm = () => {
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
  {editingPatient ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
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
                <h4>Datos Personales</h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Tipo de Usuario:</label>
                  <select
                    name="tipo"
                    value={newPatient.tipo}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value={10}>General</option>
                    <option value={11}>Privilegiado</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Primer Nombre: *</label>
                  <input
                    type="text"
                    name="prinombre"
                    value={newPatient.prinombre}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Segundo Nombre:</label>
                  <input
                    type="text"
                    name="segnombre"
                    value={newPatient.segnombre}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Apellido Paterno: *</label>
                  <input
                    type="text"
                    name="apepat"
                    value={newPatient.apepat}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Apellido Materno: *</label>
                  <input
                    type="text"
                    name="apemat"
                    value={newPatient.apemat}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>CURP: *</label>
                  <input
                    type="text"
                    name="curp"
                    value={newPatient.curp}
                    onChange={handleChange}
                    required
                    maxLength="18"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico: *</label>
                  <input
                    type="email"
                    name="correo"
                    value={newPatient.correo}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña: *</label>
                  <input
                    type="password"
                    name="password"
                    value={newPatient.password}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Nacimiento: *</label>
                  <input
                    type="date"
                    name="fechanac"
                    value={newPatient.fechanac}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono: *</label>
                  <input
                    type="tel"
                    name="tel"
                    value={newPatient.tel}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Nombre de Familiar/Conocido: *</label>
                  <input
                    type="text"
                    name="nomfamiliar"
                    value={newPatient.nomfamiliar}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono de Familiar/Conocido: *</label>
                  <input
                    type="tel"
                    name="telfamiliar"
                    value={newPatient.telfamiliar}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
              
              <div>
                <h4>Datos Fiscales</h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Calle: *</label>
                  <input
                    type="text"
                    name="calle"
                    value={newPatient.calle}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Número Interior:</label>
                  <input
                    type="number"
                    name="numint"
                    value={newPatient.numint}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Número Exterior: *</label>
                  <input
                    type="number"
                    name="numext"
                    value={newPatient.numext}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Colonia: *</label>
                  <input
                    type="text"
                    name="colonia"
                    value={newPatient.colonia}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Código Postal: *</label>
                  <input
                    type="text"
                    name="codpost"
                    value={newPatient.codpost}
                    onChange={handleChange}
                    required
                    maxLength="5"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Ciudad: *</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={newPatient.ciudad}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Estado: *</label>
                  <input
                    type="text"
                    name="estado"
                    value={newPatient.estado}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>RFC: *</label>
                  <input
                    type="text"
                    name="rfc"
                    value={newPatient.rfc}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Régimen Fiscal: *</label>
                  <input
                    type="text"
                    name="regimenfiscal"
                    value={newPatient.regimenfiscal}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
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
                Aceptar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Tabla de Pacientes</h3>
        <button
          onClick={() => setShowForm(true)}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Registrar Paciente
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tipo</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Apellido</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Correo</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Teléfono</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map(patient => (
                <tr key={patient.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px 15px' }}>{patient.id}</td>
                  <td style={{ padding: '12px 15px' }}>{patient.tipoNombre}</td>
                  <td style={{ padding: '12px 15px' }}>{patient.prinombre || 'N/A'}</td>
                  <td style={{ padding: '12px 15px' }}>{patient.apepat || 'N/A'}</td>
                  <td style={{ padding: '12px 15px' }}>{patient.correo}</td>
                  <td style={{ padding: '12px 15px' }}>{patient.tel || 'N/A'}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
  <button 
    onClick={() => handleEditPatient(patient.id)}
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
    onClick={() => handleToggleStatus(patient.id, patient.tipo)}
    style={{
      backgroundColor: patient.tipo === 12 ? '#28a745' : '#dc3545',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    {patient.tipo === 12 ? 'Activar' : 'Desactivar'}
  </button>
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '15px' }}>
                  No hay pacientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderPatientForm()}
    </div>
  );
}

export default PatientManagement;