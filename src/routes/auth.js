const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateChangePassword,
  handleValidationErrors 
} = require('../utils/validators');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', 
  validateRegister,
  handleValidationErrors,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', 
  validateLogin,
  handleValidationErrors,
  authController.login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', 
  authenticateToken,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
router.put('/profile',
  authenticateToken,
  // Validaciones opcionales para actualización
  [
    body('nombre').optional().trim().isLength({ min: 2, max: 50 }),
    body('apellido').optional().trim().isLength({ min: 2, max: 50 }),
    body('direccion').optional().trim().isLength({ min: 5, max: 200 }),
    body('telefono').optional().trim().matches(/^[\+]?[0-9\s\-\(\)]{8,20}$/),
    body('empresa').optional().trim().isLength({ min: 2, max: 100 })
  ],
  handleValidationErrors,
  authController.updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put('/change-password',
  authenticateToken,
  validateChangePassword,
  handleValidationErrors,
  authController.changePassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout',
  authenticateToken,
  authController.logout
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token
 * @access  Private
 */
router.get('/verify',
  authenticateToken,
  authController.verifyToken
);

module.exports = router;