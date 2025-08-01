const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @route   GET /api/countries
 * @desc    Obtener todos los países (para formulario de registro)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      select: {
        id: true,
        nombre: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return successResponse(res, countries, 'Países obtenidos exitosamente');
  } catch (error) {
    console.error('Error obteniendo países:', error);
    return errorResponse(res, 'Error al obtener países', 500);
  }
});

module.exports = router;