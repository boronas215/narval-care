// server/controllers/messageController.js
const Message = require('../models/messageModel');
const User = require('../models/userModel');

exports.getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const contactId = req.params.contactId;
    
    // Obtener los mensajes entre dos usuarios
    const messages = await Message.getMessagesBetweenUsers(userId, contactId);
    
    // Marcar mensajes como leídos
    await Message.markMessagesAsRead(contactId, userId);
    
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    console.log('Recibiendo solicitud para enviar mensaje');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    if (!req.body) {
      console.log('Error: req.body es undefined');
      return res.status(400).json({ message: 'El cuerpo de la solicitud está vacío' });
    }
    
    const { asignacionId, emisorId, receptorId, mensaje } = req.body;
    
    console.log('Datos extraídos:', { asignacionId, emisorId, receptorId, mensaje });
    
    // Validación básica
    if (!emisorId || !receptorId || !mensaje || !asignacionId) {
      console.log('Error: Faltan datos requeridos');
      return res.status(400).json({ 
        message: 'Faltan datos requeridos',
        receivedData: req.body
      });
    }
    
    // Insertar el mensaje
    const messageId = await Message.createMessage(asignacionId, emisorId, receptorId, mensaje);
    
    // Obtener el mensaje recién insertado con información adicional
    const newMessage = await Message.getMessageById(messageId);
    
    res.status(201).json({ 
      message: 'Mensaje enviado exitosamente',
      newMessage
    });
  } catch (error) {
    console.error('Error detallado al enviar mensaje:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Obtener el tipo de usuario
    const userTypeRows = await User.findById(userId);
    
    if (!userTypeRows) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const userType = userTypeRows.tipo;
    
    // Obtener contactos según el tipo de usuario
    const contacts = await Message.getContactsForUser(userId, userType);
    
    // Para cada contacto, obtener el último mensaje y contador de no leídos
    const contactsWithDetails = await Promise.all(contacts.map(async (contact) => {
      // Obtener último mensaje
      const lastMessage = await Message.getLastMessage(userId, contact.id);
      
      // Obtener contador de no leídos
      const unreadCount = await Message.getUnreadCount(contact.id, userId);
      
      return {
        ...contact,
        lastMessage,
        unreadCount
      };
    }));
    
    res.status(200).json({ contacts: contactsWithDetails });
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};