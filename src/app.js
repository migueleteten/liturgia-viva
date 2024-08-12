const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const parroquiaRoutes = require('./routes/parroquiaRoutes');
const songRoutes = require('./routes/songRoutes'); // Importar rutas de canciones
const authorRoutes = require('./routes/authorRoutes'); // Importar rutas de autores
const bibliaRoutes = require('./routes/bibliaRoutes');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Servir la biblia en verso
app.get('/biblia/:libro/:capitulo', (req, res) => {
  const { libro, capitulo } = req.params;
  console.log(`Serving page for /biblia/${req.params.libro}/${req.params.capitulo}`);
  // Llamar a la función del controlador para obtener el capítulo
  res.sendFile(path.join(__dirname, 'views', 'pages', 'biblia.html'));
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/parroquia', parroquiaRoutes);
app.use('/api/songs', songRoutes); // Usar rutas de canciones
app.use('/api/authors', authorRoutes); // Usar rutas de autores
app.use('/api/biblia', bibliaRoutes);

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Servir archivos estáticos desde src/views/templates
app.use('/templates', express.static(path.join(__dirname, 'views/templates')));

// Ruta para servir la página de creación de canciones
app.get('/create-song', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'createSong.html'));
});

// Ruta para servir la página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'login.html'));
});

// Ruta para servir la página de register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'register.html'));
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
