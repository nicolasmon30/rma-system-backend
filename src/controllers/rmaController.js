const rmaService = require('../services/rmaService');
const { successResponse, errorResponse,  } = require('../utils/responseHelper');

class RmaController {
    /**
     * Crear un nuevo RMA
     * @param {Object} req - Request object
     * @param {Object} res - Response object
    */
    async createRma(req, res) {
        try {
            console.log("controller rma", req.user)
            const userId = req.user.id;
            const rmaData = req.body;
            if (!rmaData.countryId || !rmaData.products || rmaData.products.length === 0) {
                return errorResponse(res , 'Datos incompletos. Se requieren countryId y al menos un producto', 400);
            }
            console.log("USerID", userId)
            const newRma = await rmaService.createRma(rmaData, userId);
            return successResponse(res, newRma, 'RMA creado exitosamente', 201);
        } catch (error) {
            console.error('Error en creacion del rma:', error);

            return errorResponse(res, error.message || 'Error al crear el rma', 400);
        }
    }

    async getUserRmas(req, res){
        try {
            const userId = req.user.id;
            const {status, startDate, endDate} = req.query;
            const filters = {};
            if (status) filters.status = status;
            if (startDate && endDate) {
                filters.startDate = startDate;
                filters.endDate = endDate;
            }

            const rmas = await rmaService.getUserRmas(userId, filters);
            return successResponse(res, rmas, 'RMAs obtenidos exitosamente', 200);
        } catch (error) {
            console.error('Error al obtener RMAs:', error);
            return errorResponse(res, error.message || 'Error al obtener los RMAs', 500);
        }
    }
}

module.exports = new RmaController();