const rmaService = require('../services/rmaService');
const { successResponse, errorResponse, } = require('../utils/responseHelper');

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
                return errorResponse(res, 'Datos incompletos. Se requieren countryId y al menos un producto', 400);
            }
            console.log("USerID", userId)
            const newRma = await rmaService.createRma(rmaData, userId);
            return successResponse(res, newRma, 'RMA creado exitosamente', 201);
        } catch (error) {
            console.error('Error en creacion del rma:', error);

            return errorResponse(res, error.message || 'Error al crear el rma', 400);
        }
    }

    async getUserRmas(req, res) {
        try {
            const userId = req.user.id;

            const rmaFilters = req.rmaFilters || {};

            const { status, startDate, endDate } = req.query;

            const allFilters = {
                ...rmaFilters,  // Filtros del middleware (userId o countryId según el rol)
                ...(status && { status }),
                ...(startDate && endDate && {
                    startDate,
                    endDate
                })
            };
            console.log('Filtros finales aplicados:', allFilters);

            const rmas = await rmaService.getUserRmas(allFilters);
            return successResponse(res, rmas, 'RMAs obtenidos exitosamente', 200);
        } catch (error) {
            console.error('Error al obtener RMAs:', error);
            return errorResponse(res, error.message || 'Error al obtener los RMAs', 500);
        }
    }

    /**
     * Aprobar un RMA
     * @param {Object} req - Request object
     * @param {Object} res - Response object
    */

    async approveRma(req, res) {
        try {
            const { rmaId } = req.params;
            const userId = req.user.id;

            const updatedRma = await rmaService.approveRma(rmaId, userId);
            return successResponse(res, updatedRma, 'RMA aprobado exitosamente', 200);

        } catch (error) {
            console.error('Error al aprobar RMA:', error);
            return errorResponse(res, error.message || 'Error al aprobar el RMA', 400);
        }
    }

    /**
     * Rechazar un RMA
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async rejectRma(req, res) {
        try {
            const { rmaId } = req.params;
            const { rejectionReason } = req.body;
            const userId = req.user.id; // Usuario que realiza la acción

            if (!rejectionReason) {
                return errorResponse(res, 'La razón de rechazo es requerida', 400);
            }

            // Verificar permisos adicionales si es necesario
            // (el middleware ya filtró los RMAs visibles)

            const updatedRma = await rmaService.rejectRma(rmaId, rejectionReason, userId);
            return successResponse(res, updatedRma, 'RMA rechazado exitosamente', 200);
        } catch (error) {
            console.error('Error al rechazar RMA:', error);
            return errorResponse(res, error.message || 'Error al rechazar el RMA', 400);
        }
    }

    /**
     * Marcar RMA como en evaluación
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async markAsEvaluating(req, res) {
        try {
            const { rmaId } = req.params;

            const updatedRma = await rmaService.markAsEvaluating(rmaId);

            return successResponse(res, updatedRma, 'RMA marcado como en evaluación', 200);
        } catch (error) {
            console.error('Error al marcar RMA como en evaluación:', error);
            return errorResponse(res, error.message || 'Error al actualizar el estado del RMA', 400);
        }
    }

    async markAsPayment(req, res) {
        try {
            const { rmaId } = req.params;

            if (!req.file) {
                return errorResponse(res, 'La cotización en PDF es requerida', 400);
            }

            const updatedRma = await rmaService.markAsPayment(rmaId, req.file);

            return successResponse(res, updatedRma, 'RMA actualizado a PAYMENT con cotización', 200);
        } catch (error) {
            return errorResponse(res, error.message || 'Error al procesar la cotización', 400);
        }
    }

    /**
 * Marcar RMA como PROCESSING (pausa recordatorios)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
    async markAsProcessing(req, res) {
        try {
            const { rmaId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            console.log(`🔄 Procesando RMA ${rmaId} a estado PROCESSING`);
            console.log(`👤 Solicitado por: ${req.user.email} (${userRole})`);

            // Verificar permisos (solo ADMIN y SUPERADMIN pueden marcar como PROCESSING)
            if (!['ADMIN', 'SUPERADMIN'].includes(userRole)) {
                return errorResponse(res, 'No tienes permisos para realizar esta acción', 403);
            }

            // Llamar al servicio para actualizar el RMA
            const updatedRma = await rmaService.markAsProcessing(rmaId, userId);

            console.log(`✅ RMA ${rmaId} actualizado exitosamente a PROCESSING`);

            return successResponse(
                res,
                updatedRma,
                'RMA marcado como PROCESSING exitosamente. Los recordatorios de pago han sido pausados.',
                200
            );

        } catch (error) {
            console.error('❌ Error en markAsProcessing controller:', error);

            // Manejar diferentes tipos de errores
            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('No se puede procesar') || error.message.includes('estado')) {
                return errorResponse(res, error.message, 400);
            }

            if (error.message.includes('cotización')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al marcar RMA como PROCESSING', 500);
        }
    }

    /**
 * MArcar como In SHipping
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
    async markAsInShipping(req, res) {
        try {
            const { rmaId } = req.params;
            const { trackingInformation } = req.body;
            const userId = req.user.id; // Usuario que realiza la acción

            if (!trackingInformation) {
                return errorResponse(res, 'La informacion de  tracking es requerida', 400);
            }

            // Verificar permisos adicionales si es necesario
            // (el middleware ya filtró los RMAs visibles)

            const updatedRma = await rmaService.markAsInShipping(rmaId, trackingInformation, userId);
            return successResponse(res, updatedRma, 'RMA marcado como IN_SHIPPING exitosamente', 200);
        } catch (error) {
            console.error('Error al marcar RMA como IN_SHIPPING:', error);
            return errorResponse(res, error.message || 'Error al marcar RMA como IN_SHIPPING', 400);
        }
    }

    /**
 * Marcar RMA como COMPLETE (proceso finalizado)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
    async markAsComplete(req, res) {
        try {
            const { rmaId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            console.log(`🎉 Completando RMA ${rmaId}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${userRole})`);

            // Verificar permisos (solo ADMIN y SUPERADMIN pueden completar RMAs)
            if (!['ADMIN', 'SUPERADMIN'].includes(userRole)) {
                return errorResponse(res, 'No tienes permisos para realizar esta acción', 403);
            }

            // Llamar al servicio para actualizar el RMA
            const updatedRma = await rmaService.markAsComplete(rmaId, userId);

            console.log(`✅ RMA ${rmaId} completado exitosamente`);

            return successResponse(
                res,
                updatedRma,
                'RMA completado exitosamente. Email de notificación enviado al usuario.',
                200
            );

        } catch (error) {
            console.error('❌ Error en markAsComplete controller:', error);

            // Manejar diferentes tipos de errores
            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('No se puede completar') || error.message.includes('estado')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al completar RMA', 500);
        }
    }


}

module.exports = new RmaController();