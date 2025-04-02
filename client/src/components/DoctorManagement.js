import React, { useState, useEffect } from 'react';

function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    prinombre: '',
    segnombre: '',
    apepat: '',
    apemat: '',
    correo: '',
    password: '',
    fechanac: '',
    especialidad: '',
    tipo: 20 // Por defecto, cardiólogo
  });
  
  useEffect(() => {
    fetchDoctors();
  }, []);
  
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/doctors?includeInactive=true');
      
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor({
      ...newDoctor,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = 'http://localhost:3001/api/doctors';
      let method = 'POST';
      
      // Si estamos editando, cambiamos la URL y el método
      if (editingDoctor) {
        url = `http://localhost:3001/api/doctors/${editingDoctor.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDoctor),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la solicitud');
      }
      
      // Reiniciar formulario
      setNewDoctor({
        prinombre: '',
        segnombre: '',
        apepat: '',
        apemat: '',
        correo: '',
        password: '',
        fechanac: '',
        especialidad: '',
        tipo: 20
      });
      
      setEditingDoctor(null);
      setShowForm(false);
      alert(editingDoctor ? 'Doctor actualizado exitosamente' : 'Doctor registrado exitosamente');
      
      // Actualizar la lista de doctores
      fetchDoctors();
      
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditDoctor = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/doctors/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del doctor');
      }
      
      const data = await response.json();
      setEditingDoctor(data.doctor);
      
      // Formatear la fecha de nacimiento si existe
      if (data.doctor && data.doctor.fechanac) {
        data.doctor.fechanac = data.doctor.fechanac.substring(0, 10);
      }
      
      setNewDoctor({
        prinombre: data.doctor.prinombre || '',
        segnombre: data.doctor.segnombre || '',
        apepat: data.doctor.apepat || '',
        apemat: data.doctor.apemat || '',
        correo: data.doctor.correo || '',
        password: '', // No enviamos la contraseña actual por seguridad
        fechanac: data.doctor.fechanac || '',
        especialidad: data.doctor.especialidad || '',
        tipo: data.doctor.tipo
      });
      
      setShowForm(true);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`¿Está seguro de ${currentStatus === 22 ? 'activar' : 'desactivar'} este doctor?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/doctors/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cambiar estado del doctor');
      }
      
      const data = await response.json();
      alert(data.message);
      
      // Actualizar la lista de doctores
      fetchDoctors();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Renderiza el formulario de doctores
  const renderDoctorForm = () => {
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
          width: '80%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>
              {editingDoctor ? 'Editar Doctor' : 'Registrar Nuevo Doctor'}
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
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Especialidad:</label>
                <select
                  name="tipo"
                  value={newDoctor.tipo}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value={20}>Cardiólogo</option>
                  <option value={21}>Neumólogo</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Primer Nombre: *</label>
                <input
                  type="text"
                  name="prinombre"
                  value={newDoctor.prinombre}
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
                  value={newDoctor.segnombre}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Apellido Paterno: *</label>
                <input
                  type="text"
                  name="apepat"
                  value={newDoctor.apepat}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Apellido Materno:</label>
                <input
                  type="text"
                  name="apemat"
                  value={newDoctor.apemat}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico: *</label>
                <input
                  type="email"
                  name="correo"
                  value={newDoctor.correo}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  {editingDoctor ? 'Nueva Contraseña (dejar en blanco para mantener la actual):' : 'Contraseña: *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={newDoctor.password}
                  onChange={handleChange}
                  required={!editingDoctor}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Nacimiento:</label>
                <input
                  type="date"
                  name="fechanac"
                  value={newDoctor.fechanac}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Especialidad (detalle):</label>
                <input
                  type="text"
                  name="especialidad"
                  value={newDoctor.especialidad}
                  onChange={handleChange}
                  placeholder="Ej: Cardiología intervencionista"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
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
                {editingDoctor ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Tabla de Doctores</h3>
        <button
          onClick={() => {
            setEditingDoctor(null);
            setNewDoctor({
              prinombre: '',
              segnombre: '',
              apepat: '',
              apemat: '',
              correo: '',
              password: '',
              fechanac: '',
              especialidad: '',
              tipo: 20
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
          Registrar Doctor
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Apellido</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Especialidad</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Correo</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Estado</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length > 0 ? (
              doctors.map(doctor => (
                <tr key={doctor.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px 15px' }}>{doctor.id}</td>
                  <td style={{ padding: '12px 15px' }}>{doctor.prinombre}</td>
                  <td style={{ padding: '12px 15px' }}>{doctor.apepat}</td>
                  <td style={{ padding: '12px 15px' }}>{doctor.tipoNombre}</td>
                  <td style={{ padding: '12px 15px' }}>{doctor.correo}</td>
                  <td style={{ padding: '12px 15px' }}>
                    <span style={{
                      backgroundColor: doctor.tipo === 22 ? '#dc3545' : '#28a745',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {doctor.tipo === 22 ? 'Inactivo' : 'Activo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleEditDoctor(doctor.id)}
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
                      onClick={() => handleToggleStatus(doctor.id, doctor.tipo)}
                      style={{
                        backgroundColor: doctor.tipo === 22 ? '#28a745' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {doctor.tipo === 22 ? 'Activar' : 'Desactivar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '15px' }}>
                  No hay doctores registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderDoctorForm()}
    </div>
  );
}

export default DoctorManagement;