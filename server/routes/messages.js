// server/routes/messages.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Obtener contactos de chat para un usuario
router.get('/contacts/:userId', messageController.getContacts);

// Obtener mensajes entre dos usuarios
router.get('/:userId/:contactId', messageController.getMessages);

// Enviar un mensaje
router.post('/', messageController.sendMessage);

module.exports = router;