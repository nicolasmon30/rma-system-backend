const express = require('express');
const { query, body } = require('express-validator');
const router = express.Router();
const { RmaStatus } = require('../generated/prisma/client');

const rmaController = require('../controllers/rmaController');
const { authenticateToken } = require('../middleware/auth');
const { filterRmasByRole } = require('../middleware/rmaPermissions');
const {
  validateCreateRma,
  handleValidationErrors
} = require('../utils/validators');
const { validateRmaStatusTransition } = require('../middleware/validateRmaStatus');
const upload = require('../config/multer');


/**
 * @route   GET /api/rma
 * @desc    Obtener todos los RMAs según el rol del usuario
 * @access  Private
 * @permissions 
 *   - USER: solo sus propios RMAs
 *   - ADMIN: solo RMAs de sus países
 *   - SUPERADMIN: todos los RMAs
 */
router.get('/',
  authenticateToken,
  filterRmasByRole(),
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

/**
 * @route   PATCH /api/rma/:rmaId/approve
 * @desc    Aprobar un RMA
 * @access  Private (ADMIN o SUPERADMIN)
 */
router.patch('/:rmaId/approve',
  authenticateToken,
  filterRmasByRole(), // Middleware que filtra por rol
  rmaController.approveRma
);

/**
 * @route   PATCH /api/rma/:rmaId/reject
 * @desc    Rechazar un RMA
 * @access  Private (ADMIN o SUPERADMIN)
 */
router.patch('/:rmaId/reject',
  authenticateToken,
  filterRmasByRole(), // Middleware que filtra por rol
  [
    body('rejectionReason').notEmpty().withMessage('La razón de rechazo es requerida')
  ],
  handleValidationErrors,
  rmaController.rejectRma
);

/**
 * @route   PATCH /api/rma/:rmaId/mark-evaluating
 * @desc    Marcar RMA como en evaluación
 * @access  Private (ADMIN o SUPERADMIN)
 */
router.patch('/:rmaId/mark-evaluating',
  authenticateToken,
  filterRmasByRole(), // Middleware que filtra por rol
  validateRmaStatusTransition(['AWAITING_GOODS']),
  rmaController.markAsEvaluating
);

router.patch(
  '/:rmaId/mark-payment',
  authenticateToken,
  filterRmasByRole(),
  validateRmaStatusTransition(['EVALUATING']),
  upload.single('cotizacion'), // Campo del form-data con el PDF
  rmaController.markAsPayment
);

/**
 * @route   PATCH /api/rma/:rmaId/mark-processing
 * @desc    Marcar RMA como PROCESSING (pausa recordatorios automáticos)
 * @access  Private (ADMIN o SUPERADMIN)
 */
router.patch('/:rmaId/mark-processing',
  authenticateToken,
  filterRmasByRole(), // Middleware que filtra por rol
  validateRmaStatusTransition(['PAYMENT']), // Solo desde PAYMENT
  rmaController.markAsProcessing
);



module.exports = router;