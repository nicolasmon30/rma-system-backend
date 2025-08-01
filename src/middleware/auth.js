const { verifyToken } = require('../config/jwt');
const { prisma } = require('../config/database');

/**
 * Middleware para verificar autenticación JWT
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = verifyToken(token);
    
    // Verificar que el usuario aún existe y obtener datos actualizados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        nombre: true, 
        apellido: true,
        role: true,
        empresa: true,
        countries: {
          include: {
            country: {
              select: { id: true, nombre: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Formatear países del usuario
    const userCountries = user.countries.map(uc => uc.country);
    
    req.user = {
      ...user,
      countries: userCountries
    };
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error verificando autenticación'
    });
  }
}

/**
 * Middleware para verificar roles específicos
 * @param {Array|String} roles - Roles permitidos
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
}

/**
 * Middleware opcional de autenticación
 * Si hay token lo valida, si no hay token continúa sin usuario
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Usar el middleware de autenticación normal
    return authenticateToken(req, res, next);
  } catch (error) {
    // Si hay error, continúa sin usuario
    req.user = null;
    next();
  }
}

module.exports = { 
  authenticateToken, 
  requireRole, 
  optionalAuth 
};