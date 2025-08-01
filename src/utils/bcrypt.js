const bcrypt = require('bcryptjs');

/**
 * Hashea una contraseña
 * @param {String} password - Contraseña a hashear
 * @returns {String} Contraseña hasheada
 */
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compara una contraseña con su hash
 * @param {String} password - Contraseña en texto plano
 * @param {String} hashedPassword - Contraseña hasheada
 * @returns {Boolean} True si coinciden
 */
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = { hashPassword, comparePassword };