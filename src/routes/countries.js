const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const countryController = require('../controllers/countryController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/validators');

const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @route   GET /api/countries
 * @desc    Obtener todos los países
 * @access  Public (para formularios de registro)
 * @query   ?includeStats=true&orderBy=nombre&search=colombia
 */
router.get('/',
  [
    query('includeStats').optional().isBoolean().withMessage('includeStats debe ser boolean'),
    query('orderBy').optional().isIn(['nombre', 'id']).withMessage('orderBy debe ser nombre o id'),
    query('search').optional().trim().isLength({ min: 1 }).withMessage('search debe tener al menos 1 caracter')
  ],
  handleValidationErrors,
  countryController.getAllCountries
);

/**
 * @route   POST /api/countries
 * @desc    Crear nuevo país
 * @access  Private - SUPERADMIN only
 */
router.post('/',
  authenticateToken,
  requireRole('SUPERADMIN'),
  [
    body('nombre')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'\.]+$/)
      .withMessage('El nombre solo puede contener letras, espacios, guiones, apostrofes y puntos')
  ],
  handleValidationErrors,
  countryController.createCountry
);

/**
 * @route   GET /api/countries/:id
 * @desc    Obtener país por ID con detalles
 * @access  Private - ADMIN, SUPERADMIN
 */
router.get('/:id',
  authenticateToken,
  requireRole('ADMIN', 'SUPERADMIN'),
  [
    param('id').isString().withMessage('ID de país inválido')
  ],
  handleValidationErrors,
  countryController.getCountryById
);

/**
 * @route   PUT /api/countries/:id
 * @desc    Actualizar país
 * @access  Private - SUPERADMIN only
 */
router.put('/:id',
  authenticateToken,
  requireRole('SUPERADMIN'),
  [
    param('id').isString().withMessage('ID de país inválido'),
    body('nombre')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'\.]+$/)
      .withMessage('El nombre solo puede contener letras, espacios, guiones, apostrofes y puntos')
  ],
  handleValidationErrors,
  countryController.updateCountry
);

/**
 * @route   DELETE /api/countries/:id
 * @desc    Eliminar país
 * @access  Private - SUPERADMIN only
 */
router.delete('/:id',
  authenticateToken,
  requireRole('SUPERADMIN'),
  [
    param('id').isString().withMessage('ID de país inválido')
  ],
  handleValidationErrors,
  countryController.deleteCountry
);



module.exports = router;