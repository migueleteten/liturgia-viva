const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const parroquiaRoutes = require('./routes/parroquiaRoutes');
const songRoutes = require('./routes/songRoutes'); // Importar rutas de canciones
const authorRoutes = require('./routes/authorRoutes'); // Importar rutas de autores
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/parroquia', parroquiaRoutes);
app.use('/api/songs', songRoutes); // Usar rutas de canciones
app.use('/api/authors', authorRoutes); // Usar rutas de autores

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'views')));

// Ruta para servir la página de creación de canciones
app.get('/create-song', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'createSong.html'));
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
