const { Resend } = require('resend');

// Inicializar Resend con la API key desde variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = { resend };