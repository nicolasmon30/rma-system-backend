// src/routes/products.js

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { filterProductsByRole, requireProductModificationPermissions } = require('../middleware/productPermissions');
const { 
    validateCreateProduct,
    validateUpdateProduct,
    validateGetProduct,
    validateDeleteProduct,
    validateSearchProducts,
    validateListProducts,
    validateGetProductsByBrand,
    validateBrandExists,
    validateCountriesExist
} = require('../utils/productValidators');
const { handleValidationErrors } = require('../utils/validators');

/**
 * @route   GET /api/products/search
 * @desc    Buscar productos por término
 * @access  Private - ADMIN (de sus países), SUPERADMIN (todos)
 * @permissions 
 *   - ADMIN: solo productos de sus países asignados
 *   - SUPERADMIN: todos los productos
 */
router.get('/search',
    authenticateToken,                       // 1. Verificar autenticación
    requireRole('ADMIN', 'SUPERADMIN'),      // 2. Solo ADMIN y SUPERADMIN
    filterProductsByRole(),                  // 3. Aplicar filtros según rol
    validateSearchProducts,                  // 4. Validar parámetros de búsqueda
    handleValidationErrors,                  // 5. Manejar errores de validación
    productController.searchProducts         // 6. Ejecutar controlador
);

/**
 * @route   GET /api/products/stats
 * @desc    Obtener estadísticas de productos
 * @access  Private - ADMIN, SUPERADMIN
 */
router.get('/stats',
    authenticateToken,
    requireRole('ADMIN', 'SUPERADMIN'),
    filterProductsByRole(),
    productController.getProductStats
);

/**
 * @route   GET /api/products/by-brand/:brandId
 * @desc    Obtener productos por marca específica
 * @access  Private - ADMIN (de sus países), SUPERADMIN (todos)
 */
router.get('/by-brand/:brandId',
    authenticateToken,
    requireRole('ADMIN', 'SUPERADMIN'),
    filterProductsByRole(),
    validateGetProductsByBrand,
    handleValidationErrors,
    productController.getProductsByBrand
);

/**
 * @route   GET /api/products
 * @desc    Listar productos según permisos del rol
 * @access  Private - ADMIN (de sus países), SUPERADMIN (todos)
 * @permissions 
 *   - ADMIN: solo productos de sus países asignados
 *   - SUPERADMIN: todos los productos
 */
router.get('/',
    authenticateToken,                       // 1. Verificar autenticación
    requireRole('ADMIN', 'SUPERADMIN'),      // 2. Solo ADMIN y SUPERADMIN
    filterProductsByRole(),                  // 3. Aplicar filtros según rol
    validateListProducts,                    // 4. Validar parámetros de query
    handleValidationErrors,                  // 5. Manejar errores de validación
    productController.listProducts           // 6. Ejecutar controlador
);

/**
 * @route   POST /api/products
 * @desc    Crear un nuevo producto
 * @access  Private - SUPERADMIN only
 * @body    { "nombre": "string", "brandId": "string", "countryIds": ["string"] }
 */
router.post('/',
    authenticateToken,                         // 1. Verificar autenticación
    requireProductModificationPermissions(),   // 2. Solo SUPERADMIN puede crear
    validateCreateProduct,                     // 3. Validar datos de entrada
    handleValidationErrors,                    // 4. Manejar errores de validación
    validateBrandExists,                       // 5. Validar que la marca existe
    validateCountriesExist,                    // 6. Validar que los países existen
    productController.createProduct            // 7. Ejecutar controlador
);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener un producto específico
 * @access  Private - ADMIN (de sus países), SUPERADMIN (todos)
 */
router.get('/:id',
    authenticateToken,                       // 1. Verificar autenticación
    requireRole('ADMIN', 'SUPERADMIN'),      // 2. Solo ADMIN y SUPERADMIN
    validateGetProduct,                      // 3. Validar parámetros
    handleValidationErrors,                  // 4. Manejar errores de validación
    productController.getProductById         // 5. Ejecutar controlador (incluye verificación de permisos)
);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar un producto específico
 * @access  Private - SUPERADMIN only
 * @body    { "nombre": "string", "brandId": "string", "countryIds": ["string"] }
 */
router.put('/:id',
    authenticateToken,                         // 1. Verificar autenticación
    requireProductModificationPermissions(),   // 2. Solo SUPERADMIN puede actualizar
    validateUpdateProduct,                     // 3. Validar parámetros y datos
    handleValidationErrors,                    // 4. Manejar errores de validación
    validateBrandExists,                       // 5. Validar que la marca existe (si se proporciona)
    validateCountriesExist,                    // 6. Validar que los países existen (si se proporcionan)
    productController.updateProduct            // 7. Ejecutar controlador
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar un producto específico
 * @access  Private - SUPERADMIN only
 */
router.delete('/:id',
    authenticateToken,                         // 1. Verificar autenticación
    requireProductModificationPermissions(),   // 2. Solo SUPERADMIN puede eliminar
    validateDeleteProduct,                     // 3. Validar parámetros
    handleValidationErrors,                    // 4. Manejar errores de validación
    productController.deleteProduct            // 5. Ejecutar controlador
);

module.exports = router;