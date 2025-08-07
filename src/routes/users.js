// src/routes/users.js

const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { filterUsersByRole } = require('../middleware/userPermissions');
const { handleValidationErrors } = require('../utils/validators');

/**
 * @route   GET /api/users
 * @desc    Listar usuarios según permisos del rol
 * @access  Private - ADMIN, SUPERADMIN
 * @permissions 
 *   - ADMIN: solo ve ADMIN y USER de sus países
 *   - SUPERADMIN: ve todos los usuarios
 */
router.get('/',
    authenticateToken,                    // 1. Verificar autenticación
    requireRole('ADMIN', 'SUPERADMIN'),   // 2. Solo ADMIN y SUPERADMIN pueden listar
    filterUsersByRole(),                  // 3. Aplicar filtros según rol
    [                                     // 4. Validar parámetros de query
        query('search').optional().trim(),
        query('role').optional().isIn(['USER', 'ADMIN', 'SUPERADMIN']),
        query('countryId').optional().isString(),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    handleValidationErrors,               // 5. Manejar errores de validación
    userController.listUsers              // 6. Ejecutar controlador
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario específico
 * @access  Private - ADMIN (de su país), SUPERADMIN
 */
router.get('/:id',
    authenticateToken,
    requireRole('ADMIN', 'SUPERADMIN'),
    [
        param('id').isString().withMessage('ID de usuario inválido')
    ],
    handleValidationErrors,
    userController.getUserById
);

/**
 * ✅ NUEVA RUTA: Actualizar rol de usuario
 * @route   PUT /api/users/:id/role
 * @desc    Actualizar el rol de un usuario específico
 * @access  Private - ADMIN (limitado a USER/ADMIN de sus países), SUPERADMIN (sin restricciones)
 * @body    { "role": "USER" | "ADMIN" | "SUPERADMIN" }
 * @permissions
 *   - ADMIN: 
 *     * Solo puede cambiar usuarios de sus países asignados
 *     * No puede tocar SUPERADMIN (ni cambiar a SUPERADMIN ni modificar usuarios SUPERADMIN)
 *     * Solo puede asignar roles USER o ADMIN
 *   - SUPERADMIN: 
 *     * Sin restricciones, puede cambiar cualquier usuario a cualquier rol
 *   - Restricciones generales:
 *     * No se puede cambiar el rol a sí mismo
 *     * El usuario objetivo debe existir
 */
router.put('/:id/role',
    authenticateToken,                                    // 1. Verificar autenticación
    requireRole('ADMIN', 'SUPERADMIN'),                   // 2. Solo ADMIN y SUPERADMIN
    [                                                     // 3. Validar parámetros
        param('id')
            .isString()
            .withMessage('ID de usuario inválido')
            .isLength({ min: 1 })
            .withMessage('ID de usuario requerido'),
        body('role')
            .isIn(['USER', 'ADMIN', 'SUPERADMIN'])
            .withMessage('Rol debe ser USER, ADMIN o SUPERADMIN')
            .notEmpty()
            .withMessage('Rol es requerido')
    ],
    handleValidationErrors,                               // 4. Manejar errores de validación
    userController.updateUserRole                         // 5. Ejecutar controlador
);


module.exports = router;