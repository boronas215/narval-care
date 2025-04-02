import React from 'react';

function DeviceTips() {
  const tips = [
    {
      id: 1,
      title: 'Posición correcta',
      description: 'Coloque el oxímetro en su dedo índice o medio de la mano dominante. Asegúrese de que las uñas no sean demasiado largas y que no tenga esmalte de uñas, ya que pueden interferir con la lectura.',
      icon: '👆'
    },
    {
      id: 2,
      title: 'Mantenga la calma',
      description: 'Respire normalmente y manténgase quieto durante la medición. El movimiento excesivo puede afectar la precisión de la lectura.',
      icon: '😌'
    },
    {
      id: 3,
      title: 'Temperatura adecuada',
      description: 'Si sus manos están frías, caliéntelas antes de usar el oxímetro, ya que una baja temperatura puede afectar la lectura de la saturación de oxígeno.',
      icon: '🌡️'
    },
    {
      id: 4,
      title: 'Evite presión externa',
      description: 'No presione el oxímetro contra superficies duras y evite apretar el dedo dentro del dispositivo, ya que esto puede afectar el flujo sanguíneo.',
      icon: '⚠️'
    },
    {
      id: 5,
      title: 'Batería cargada',
      description: 'Asegúrese de que la batería del dispositivo esté cargada para evitar interrupciones durante la medición.',
      icon: '🔋'
    },
    {
      id: 6,
      title: 'Luz ambiental',
      description: 'La luz ambiental brillante puede afectar la precisión de la lectura. Si es necesario, cubra parcialmente el oxímetro con la mano libre.',
      icon: '💡'
    },
    {
      id: 7,
      title: 'Compruebe regularmente',
      description: 'Para un monitoreo efectivo, haga mediciones regulares a lo largo del día y lleve un registro de los resultados para compartir con su médico.',
      icon: '📊'
    },
    {
      id: 8,
      title: 'Valores normales',
      description: 'Los valores normales de saturación de oxígeno están por encima del 95%. Si observa valores por debajo del 90%, consulte a su médico inmediatamente.',
      icon: '📝'
    }
  ];

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: '30px', textAlign: 'center' }}>
        Tips para el Uso Correcto del Cardioxímetro
      </h2>
      
      <div style={{ 
        backgroundColor: '#e6f7ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #91d5ff'
      }}>
        <p style={{ margin: 0, fontSize: '16px', color: '#0050b3' }}>
          <strong>¡Bienvenido usuario privilegiado!</strong> Estos consejos le ayudarán a obtener mediciones más precisas con su dispositivo. Recuerde que el monitoreo regular es importante para su salud.
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {tips.map(tip => (
          <div key={tip.id} style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              fontSize: '36px', 
              textAlign: 'center', 
              marginBottom: '15px' 
            }}>
              {tip.icon}
            </div>
            <h3 style={{ margin: '0 0 10px', textAlign: 'center' }}>{tip.title}</h3>
            <p style={{ margin: 0, color: '#666', flex: 1 }}>{tip.description}</p>
          </div>
        ))}
      </div>
      
      <div style={{ 
        backgroundColor: '#f6ffed', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '30px',
        border: '1px solid #b7eb8f'
      }}>
        <h3 style={{ margin: '0 0 10px', color: '#52c41a' }}>Beneficios de su cuenta privilegiada</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Acceso a estos consejos exclusivos para un mejor uso de su dispositivo</li>
          <li>Atención prioritaria por parte de nuestro equipo médico</li>
          <li>Notificaciones personalizadas sobre sus lecturas</li>
          <li>Consulta virtual con un especialista una vez al mes</li>
        </ul>
      </div>
    </div>
  );
}

export default DeviceTips;