// En tu archivo server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Middleware para depuración
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Encabezados:', req.headers);
    console.log('Cuerpo:', req.body);
  }
  next();
});

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const messageRoutes = require('./routes/messages');
const productRoutes = require('./routes/products');
const assignmentRoutes = require('./routes/assignments');
const balanceRoutes = require('./routes/balances');
const patientBalanceRoutes = require('./routes/patientBalances');
const purchaseRoutes = require('./routes/purchases');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/balances', patientBalanceRoutes); // Reutilizamos el mismo prefijo para rutas de saldo
app.use('/api/purchases', purchaseRoutes);

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});