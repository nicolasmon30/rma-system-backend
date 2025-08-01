/**
 * Middleware global para manejo de errores
 */
function errorHandler(err, req, res, next) {
  console.error('🚨 Error capturado:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Error de Prisma - Registro duplicado
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    return res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese ${field}`,
      code: 'DUPLICATE_FIELD'
    });
  }

  // Error de Prisma - Registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
      code: 'NOT_FOUND'
    });
  }

  // Error de Prisma - Violación de clave foránea
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'No se puede eliminar: registro referenciado por otros datos',
      code: 'FOREIGN_KEY_VIOLATION'
    });
  }

  // Error de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      code: 'EXPIRED_TOKEN'
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors,
      code: 'VALIDATION_ERROR'
    });
  }

  // Error por defecto
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
}

/**
 * Middleware para rutas no encontradas
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    code: 'ROUTE_NOT_FOUND'
  });
}

module.exports = { errorHandler, notFound };