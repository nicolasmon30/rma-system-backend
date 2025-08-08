// src/routes/brands.js

const express = require('express');
const router = express.Router();

const brandController = require('../controllers/brandController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { filterBrandsByRole, requireBrandModificationPermissions } = require('../middleware/brandPermissions');
const { 
    validateCreateBrand,
    validateUpdateBrand,
    validateGetBrand,
    validateDeleteBrand,
    validateSearchBrands,
    validateListBrands,
    validateCountriesExist
} = require('../utils/brandValidators');
const { handleValidationErrors } = require('../utils/validators');

/**
 * @route   GET /api/brands/search
 * @desc    Buscar marcas por término
 * @access  Private - ADMIN (de sus países), SUPERADMIN (todas)
 * @permissions 
 *   - ADMIN: solo marcas de sus países asignados
 *   - SUPERADMIN: todas las marcas
 */
router.get('/search',
    authenticateToken,                     // 1. Verificar autenticación
    requireRole('ADMIN', 'SUPERADMIN'),    // 2. Solo ADMIN y SUPERADMIN
    filterBrandsByRole(),                  // 3. Aplicar filtros según rol
    validateSearchBrands,                  // 4. Validar parámetros de búsqueda
    handleValidationErrors,                // 5. Manejar errores de validación
    brandController.searchBrands           // 6. Ejecutar controlador
);

/**
 * @route   GET /api/brands/stats
 * @desc    Obtener estadísticas de marcas
 * @access  Private - ADMIN, SUPERADMIN
 */
router.get('/stats',
    authenticateToken,
    requireRole('ADMIN', 'SUPERADMIN'),
    filterBrandsByRole(),
    brandController.getBrandStats
);

/**
 * @route   GET /api/brands
 * @desc    Listar marcas según permisos del rol
 * @access  Private - ADMIN (de sus países), SUPERADMIN (todas)
 * @permissions 
 *   - ADMIN: solo marcas de sus países asignados
 *   - SUPERADMIN: todas las marcas
 */
router.get('/',
    authenticateToken,                     // 1. Verificar autenticación
    requireRole('ADMIN', 'SUPERADMIN'),    // 2. Solo ADMIN y SUPERADMIN
    filterBrandsByRole(),                  // 3. Aplicar filtros según rol
    validateListBrands,                    // 4. Validar parámetros de query
    handleValidationErrors,                // 5. Manejar errores de validación
    brandController.listBrands             // 6. Ejecutar controlador
);

/**
 * @route   POST /api/brands
 * @desc    Crear una nueva marca
 * @access  Private - SUPERADMIN only
 * @body    { "nombre": "string", "countryIds": ["string"] }
 */
router.post('/',
    authenticateToken,                     // 1. Verificar autenticación
    requireBrandModificationPermissions(), // 2. Solo SUPERADMIN puede crear
    validateCreateBrand,                   // 3. Validar datos de entrada
    handleValidationErrors,                // 4. Manejar errores de validación
    validateCountriesExist,                // 5. Validar que los países existen
    brandController.createBrand            // 6. Ejecutar controlador
);

/**
 * @route   GET /api/brands/:id
 * @desc    Obtener una marca específica
 * @access  Private - ADMIN (de sus países), SUPERADMIN (todas)
 */
router.get('/:id',
    authenticateToken,                     // 1. Verificar autenticación
    requireRole('ADMIN', 'SUPERADMIN'),    // 2. Solo ADMIN y SUPERADMIN
    validateGetBrand,                      // 3. Validar parámetros
    handleValidationErrors,                // 4. Manejar errores de validación
    brandController.getBrandById           // 5. Ejecutar controlador (incluye verificación de permisos)
);

/**
 * @route   PUT /api/brands/:id
 * @desc    Actualizar una marca específica
 * @access  Private - SUPERADMIN only
 * @body    { "nombre": "string", "countryIds": ["string"] }
 */
router.put('/:id',
    authenticateToken,                     // 1. Verificar autenticación
    requireBrandModificationPermissions(), // 2. Solo SUPERADMIN puede actualizar
    validateUpdateBrand,                   // 3. Validar parámetros y datos
    handleValidationErrors,                // 4. Manejar errores de validación
    validateCountriesExist,                // 5. Validar que los países existen
    brandController.updateBrand            // 6. Ejecutar controlador
);

/**
 * @route   DELETE /api/brands/:id
 * @desc    Eliminar una marca específica
 * @access  Private - SUPERADMIN only
 */
router.delete('/:id',
    authenticateToken,                     // 1. Verificar autenticación
    requireBrandModificationPermissions(), // 2. Solo SUPERADMIN puede eliminar
    validateDeleteBrand,                   // 3. Validar parámetros
    handleValidationErrors,                // 4. Manejar errores de validación
    brandController.deleteBrand            // 5. Ejecutar controlador
);

module.exports = router;