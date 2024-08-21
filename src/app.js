const express = require('express');
const path = require('path');
const app = express();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const templeRoutes = require('./routes/templeRoutes');
const songRoutes = require('./routes/songRoutes');
const authorRoutes = require('./routes/authorRoutes');
const bibleCommentsRoutes = require('./routes/bibleCommentsRoutes');

// Middleware para parsear JSON
app.use(express.json());

// Configurar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/templos', templeRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/biblia', bibleCommentsRoutes); // Rutas para comentarios de la Biblia

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public'))); // Archivos estáticos desde la carpeta public
app.use('/templates', express.static(path.join(__dirname, 'views/templates'))); // Archivos estáticos desde src/views/templates
app.use('/views', express.static(path.join(__dirname, 'views'))); // Archivos estáticos desde src/views
app.use('/biblia/capitulos', express.static(path.join(__dirname, 'views/pages/biblia/capitulos'))); // Archivos HTML generados

// Rutas para servir páginas específicas
app.get('/create-song', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'createSong.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'register.html'));
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
