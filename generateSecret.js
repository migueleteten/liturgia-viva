const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64').replace(/=/g, ''); // Eliminar los signos '='
console.log('Generated JWT Secret:', secret);
