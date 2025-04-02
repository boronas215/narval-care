import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import PatientDashboard from './PatientDashboard';

function Login() {
  const [credentials, setCredentials] = useState({
    correo: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Login exitoso. Bienvenido, ${data.user.role}`);
        setUser(data.user);
        setIsLoggedIn(true);
        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setMessage(data.message || 'Error en el login');
      }
    } catch (error) {
      setMessage('Error de conexión al servidor');
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    setMessage('');
  };

  // Verificar si hay usuario en localStorage al cargar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Mostrar el dashboard según el tipo de usuario
  if (isLoggedIn && user) {
    // Administrador
    if (user.tipo === 31) {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    
    // Paciente (general o privilegiado)
    if (user.tipo === 10 || user.tipo === 11) {
      return <PatientDashboard user={user} onLogout={handleLogout} />;
    }
    
    // Otros tipos de usuario (doctores, etc.) tendrían su propio dashboard
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      {!isLoggedIn ? (
        <>
          <h2>Iniciar Sesión</h2>
          {message && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: message.includes('exitoso') ? '#d4edda' : '#f8d7da',
              color: message.includes('exitoso') ? '#155724' : '#721c24',
              marginBottom: '20px',
              borderRadius: '4px'
            }}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Correo:
              </label>
              <input
                type="email"
                name="correo"
                value={credentials.correo}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Contraseña:
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            <button 
              type="submit"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Iniciar Sesión
            </button>
          </form>
        </>
      ) : (
        <div>
          <h2>Sesión Iniciada</h2>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#d4edda',
            color: '#155724',
            marginBottom: '20px',
            borderRadius: '4px'
          }}>
            {message}
          </div>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;