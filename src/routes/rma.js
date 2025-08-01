const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const { RmaStatus } = require('../generated/prisma/client');

const rmaController = require('../controllers/rmaController');
const { authenticateToken } = require('../middleware/auth');
const { 
    validateCreateRma,
    handleValidationErrors 
} = require('../utils/validators');


/**
 * @route   GET /
 * @desc    Obtener todos los RMAs del usuario
 * @access  Private
 */
router.get('/',
  authenticateToken,
  [
    query('status').optional().isIn(Object.values(RmaStatus)),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  handleValidationErrors,
  rmaController.getUserRmas
);

/**
 * @route   POST /
 * @desc    Crear Rma
 * @access  Private
 */
router.post('/',
  authenticateToken,
  validateCreateRma,
  handleValidationErrors,
  rmaController.createRma
);


module.exports = router;