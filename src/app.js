const express = require('express');
const path = require('path');
const app = express();
Object.keys(require.cache).forEach(function(key) {
  delete require.cache[key];
});


// Importar rutas
const authRoutes = require('./routes/authRoutes');
const templeRoutes = require('./routes/templeRoutes');
const songRoutes = require('./routes/songRoutes');
const songLiturgyRoutes = require('./routes/songLiturgyRoutes');
const authorRoutes = require('./routes/authorRoutes');
const bibleCommentsRoutes = require('./routes/bibleCommentsRoutes');
const liturgiasRoutes = require('./routes/liturgiaRoutes');

// Middleware para parsear JSON
app.use(express.json());

// Configurar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/templos', templeRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/songsLiturgy', songLiturgyRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/biblia', bibleCommentsRoutes); // Rutas para comentarios de la Biblia
app.use('/api/liturgia', liturgiasRoutes); // Rutas para calendarios

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public'))); // Archivos estáticos desde la carpeta public
app.use('/templates', express.static(path.join(__dirname, 'views/templates'))); // Archivos estáticos desde src/views/templates
app.use('/views', express.static(path.join(__dirname, 'views'))); // Archivos estáticos desde src/views
app.use('/biblia/capitulos', express.static(path.join(__dirname, 'views/pages/biblia/capitulos'))); // Archivos HTML generados
app.use('/biblia/antiguo-testamento', express.static(path.join(__dirname, 'views/pages/antiguo-testamento.html')));
app.use('/biblia/nuevo-testamento', express.static(path.join(__dirname, 'views/pages/nuevo-testamento.html')));
app.use('/liturgias', express.static(path.join(__dirname, 'views/pages/liturgias'))); // Archivos HTML generados
app.use('/', express.static(path.join(__dirname, '../'))); // Archivos HTML generados

// Middleware para manejar la página de inicio y servir el HTML correspondiente a la fecha de hoy
app.get('/', (req, res) => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
  const filePath = path.join(__dirname, 'views', 'pages', 'liturgias', `${formattedDate}.html`);

  res.sendFile(filePath, err => {
      if (err) {
          console.error('Error al servir el archivo:', err);
          res.status(404).send('Liturgia no encontrada para la fecha de hoy.');
      }
  });
});

// Middleware para manejar la página de lecturas del domingo y servir el HTML correspondiente
app.get('/lecturas-del-domingo', (req, res) => {
  const today = new Date();
  const todayWeekDay = today.getDay(); // 0 para domingo, 1 para lunes, ..., 6 para sábado

  // Si hoy no es domingo, calcular el próximo domingo
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + (7 - todayWeekDay) % 7);

  const formattedDate = sunday.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
  const filePath = path.join(__dirname, 'views', 'pages', 'liturgias', `${formattedDate}.html`);

  res.sendFile(filePath, err => {
      if (err) {
          console.error('Error al servir el archivo:', err);
          res.status(404).send('Liturgia no encontrada para el domingo.');
      }
  });
});

// Rutas para servir páginas específicas
app.get('/create-song', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'createSong.html'));
});

// Rutas para servir páginas específicas
app.get('/recursos-liturgicos/crear-hoja', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'create-sheet.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'register.html'));
});

app.get('/calendario', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pages', 'calendario.html'));
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
