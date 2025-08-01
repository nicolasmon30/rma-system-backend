/**
 * Utilidades para respuestas consistentes de la API
 */

/**
 * Respuesta exitosa estándar
 * @param {Object} res - Objeto response de Express
 * @param {*} data - Datos a enviar
 * @param {string} message - Mensaje opcional
 * @param {number} statusCode - Código de estado HTTP
 */
function successResponse(res, data = null, message = 'Operación exitosa', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

/**
 * Respuesta de error estándar
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {*} errors - Errores adicionales
 */
function errorResponse(res, message = 'Error interno del servidor', statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(errors && { errors })
  });
}

/**
 * Respuesta paginada estándar
 * @param {Object} res - Objeto response de Express
 * @param {Array} data - Datos paginados
 * @param {Object} pagination - Información de paginación
 * @param {string} message - Mensaje opcional
 * @param {number} statusCode - Código de estado HTTP
 */
function paginatedResponse(res, data, pagination, message = 'Datos obtenidos exitosamente', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext || pagination.page < pagination.totalPages,
      hasPrev: pagination.hasPrev || pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
