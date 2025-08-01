const { body, validationResult } = require('express-validator');

/**
 * Validaciones para registro de usuario
 */
const validateRegister = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('apellido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('direccion')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),
  
  body('telefono')
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{8,20}$/)
    .withMessage('El teléfono debe tener un formato válido'),
  
  body('empresa')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de la empresa debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('password')
    .isLength({ min: 8, max: 100 })
    .withMessage('La contraseña debe tener entre 8 y 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial'),
  
  body('countryId')
    .notEmpty()
    .withMessage('El país es requerido')
    .custom(async (value) => {
      const { prisma } = require('../config/database');
      const country = await prisma.country.findUnique({
        where: { id: value }
      });
      if (!country) {
        throw new Error('El país seleccionado no existe');
      }
      return true;
    })
];

/**
 * Validaciones para login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

/**
 * Validaciones para cambio de contraseña
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .isLength({ min: 8, max: 100 })
    .withMessage('La nueva contraseña debe tener entre 8 y 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La nueva contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];


/**
 * Validaciones para creación de Rma
*/
const validateCreateRma = [
    body('direccion')
      .notEmpty()
      .withMessage('La dirección es requerida'),
    
    body('codigoPostal')
      .notEmpty()
      .withMessage('El codigo Postal es requerido'),
    
    body('servicio')
      .notEmpty()
      .withMessage('El servicio es requerido'),
    // body('razonRechazo')
    //   .notEmpty()
    //   .withMessage('La razón de rechazo es requerida'),
    // body('cotizacion')
    //   .notEmpty()
    //   .withMessage('La cotización es requerida'),
    // body('ordenCompra')
    //   .notEmpty()
    //   .withMessage('La orden de compra es requerida')
    
];
/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateCreateRma,
  handleValidationErrors
};
