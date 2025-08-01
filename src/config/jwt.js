const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET es requerido en las variables de entorno');
}

/**
 * Genera un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @returns {String} Token JWT
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'rma-system',
    audience: 'rma-users'
  });
}

/**
 * Verifica un token JWT
 * @param {String} token - Token a verificar
 * @returns {Object} Payload decodificado
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'rma-system',
    audience: 'rma-users'
  });
}

/**
 * Decodifica un token sin verificar (para debugging)
 * @param {String} token - Token a decodificar
 * @returns {Object} Payload decodificado
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = { generateToken, verifyToken, decodeToken };