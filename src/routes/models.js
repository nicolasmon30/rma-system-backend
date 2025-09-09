// src/routes/models.js

const express = require('express');
const router = express.Router();

const modelController = require('../controllers/modelController');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * @route   POST /api/models
 * @desc    Crear un nuevo modelo
 * @access  Private - ADMIN, SUPERADMIN
 */
router.post('/',
    authenticateToken,
    requireRole('ADMIN', 'SUPERADMIN'),
    modelController.createModel
);

/**
 * @route   GET /api/models
 * @desc    Listar modelos con filtros opcionales
 * @access  Private - ALL authenticated users
 * @query   brandId, search, page, limit
 */
router.get('/',
    authenticateToken,
    modelController.getAllModels
);

/**
 * @route   GET /api/models/:id
 * @desc    Obtener un modelo específico por ID
 * @access  Private - ALL authenticated users
 */
router.get('/:id',
    authenticateToken,
    modelController.getModelById
);

/**
 * @route   PUT /api/models/:id
 * @desc    Actualizar un modelo
 * @access  Private - ADMIN, SUPERADMIN
 */
router.put('/:id',
    authenticateToken,
    requireRole('ADMIN', 'SUPERADMIN'),
    modelController.updateModel
);

/**
 * @route   DELETE /api/models/:id
 * @desc    Eliminar un modelo
 * @access  Private - ADMIN, SUPERADMIN
 */
router.delete('/:id',
    authenticateToken,
    requireRole('ADMIN', 'SUPERADMIN'),
    modelController.deleteModel
);

module.exports = router;
