require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

// Función para enviar el correo electrónico
const sendVerificationEmail = (email, token) => {
  const templatePath = path.join(__dirname, '../views/emails/welcomeEmailTemplate.html');
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);

  const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

  const htmlToSend = template({ verificationLink });

  const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
      },
  });

  const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verifica tu correo electrónico',
      html: htmlToSend,
      attachments: [{
          filename: 'logo-completo-fondo-oscuro.png',
          path: path.join(__dirname, '../../public/images/logo-completo-fondo-oscuro_V.png'),
          cid: 'logo'
      }]
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error al enviar el correo:', error);
      } else {
          console.log('Correo enviado: ' + info.response);
      }
  });
};

const registerParroquiaAdministrador = async (req, res) => {
  const { email, password, parroquiaId } = req.body;
  const roleId = 2; // ID del rol "parroquia_administrador"

  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
          'INSERT INTO usuarios (email, password, rol_id) VALUES ($1, $2, $3) RETURNING *',
          [email, hashedPassword, roleId]
      );

      const user = result.rows[0];

      await db.query('UPDATE templos SET usuario_id = $1 WHERE id = $2', [user.id, parroquiaId]);

      // Generar token de verificación
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 24); // Token válido por 24 horas

      // Guardar token y expiración en la base de datos
      await db.query(
          'UPDATE usuarios SET token_verificacion = $1, token_expiracion = $2 WHERE id = $3',
          [verificationToken, tokenExpiration, user.id]
      );

      // Enviar correo de verificación
      await sendVerificationEmail(user.email, verificationToken);

      const token = jwt.sign({ userId: user.id, rolId: user.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ token, userId: user.id });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

const registerFeligres = async (req, res) => {
  const { email, password } = req.body;
  const roleId = 4; // ID del rol "feligres"
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO usuarios (email, password, rol_id) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, roleId]
    );

    const user = result.rows[0];

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24); // Token válido por 24 horas

    // Guardar token y expiración en la base de datos
    await db.query(
        'UPDATE usuarios SET token_verificacion = $1, token_expiracion = $2 WHERE id = $3',
        [verificationToken, tokenExpiration, user.id]
    );

    // Enviar correo de verificación
    await sendVerificationEmail(user.email, verificationToken);

    const token = jwt.sign({ userId: user.id, rolId: user.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyEmail = async (req,res) => {
  try {
      const { token } = req.query;

      // Buscar al usuario con el token
      const result = await db.query(
        'SELECT id, token_expiracion FROM usuarios WHERE token_verificacion = $1',
        [token]
      );

      const user = result.rows[0];

      if (!user) {
          return res.status(400).json({ message: 'Token de verificación inválido.' });
      }

      // Verificar si el token ha expirado
      if (user.token_expiracion < new Date()) {
          return res.status(400).json({ message: 'El token de verificación ha expirado.' });
      }

      // Verificar los valores antes de la actualización
      console.log('ID del usuario:', user.id);

      // Marcar el correo como verificado y limpiar el token
      const updateResult = await db.query(
        'UPDATE usuarios SET email_verificado = true, token_verificacion = NULL, token_expiracion = NULL WHERE id = $1',
        [user.id]
      );

      // Verificar cuántas filas fueron afectadas
      if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: 'Error al actualizar la base de datos. No se modificó ningún registro.' });
      }
      // Redirigir a la página de éxito
      return res.sendFile(path.join(__dirname, '../views/pages/verifyEmailSuccess.html'));
  } catch (error) {
      return res.status(500).json({ message: 'Error al verificar el correo.', error });
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt with email:', email); // Depurar
  
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    console.log('User found:', user); // Depurar

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // Depurar

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, rolId: user.rol_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' });

    const refreshToken = jwt.sign(
      { userId: user.id, rolId: user.rol_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' });

    // Guardar el refresh token en la base de datos
    await db.query('UPDATE usuarios SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createParroquiaUser = async (req, res) => {
  const { email, password, role } = req.body;
  const { userId, rolId } = req.user;

  if (rolId !== 2) { // Verificar que el rol del usuario sea "parroquia_administrador"
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO usuarios (email, password, rol_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, role, userId]
    );

    const user = result.rows[0];
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Verificar si el refresh token es válido y coincide con el almacenado
      const result = await db.query('SELECT * FROM usuarios WHERE id = $1 AND refresh_token = $2', [decoded.userId, refreshToken]);
      if (result.rows.length === 0) return res.sendStatus(403);

      // Generar un nuevo access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId, rolId: decoded.rolId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' });
      
      res.json({ accessToken: newAccessToken });
  } catch (error) {
      return res.sendStatus(403); // Refresh token no válido o expirado
  }
};

module.exports = {
  registerParroquiaAdministrador,
  registerFeligres,
  login,
  createParroquiaUser,
  sendVerificationEmail,
  verifyEmail,
  refreshToken
};
