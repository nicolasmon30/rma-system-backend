const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const schedulerService = require('../services/schedulerService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @route   GET /api/admin/scheduler/status
 * @desc    Obtener estado del scheduler
 * @access  Private - ADMIN, SUPERADMIN
 */
router.get('/scheduler/status',
  authenticateToken,
  requireRole('ADMIN', 'SUPERADMIN'),
  (req, res) => {
    try {
      const status = schedulerService.getStatus();
      return successResponse(res, status, 'Estado del scheduler obtenido');
    } catch (error) {
      return errorResponse(res, 'Error obteniendo estado del scheduler', 500);
    }
  }
);

/**
 * @route   POST /api/admin/scheduler/run-manual
 * @desc    Ejecutar verificación manual de recordatorios
 * @access  Private - SUPERADMIN
 */
router.post('/scheduler/run-manual',
  authenticateToken,
  requireRole('SUPERADMIN'),
  async (req, res) => {
    try {
      await schedulerService.runManualCheck();
      return successResponse(res, null, 'Verificación manual ejecutada exitosamente');
    } catch (error) {
      console.error('Error en verificación manual:', error);
      return errorResponse(res, 'Error ejecutando verificación manual', 500);
    }
  }
);

module.exports = router;