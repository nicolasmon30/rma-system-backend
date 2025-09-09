// src/controllers/modelController.js

const modelService = require('../services/modelService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class ModelController {
    /**
     * Crear un nuevo modelo
     * @route POST /api/models
     * @access Private - ADMIN/SUPERADMIN
     */
    async createModel(req, res) {
        try {
            const { nombre, brandId } = req.body;
            
            console.log(`🆕 Creando nuevo modelo: ${nombre}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);
            console.log(`🏷️ Para marca ID: ${brandId}`);

            // Validaciones básicas
            if (!nombre || !brandId) {
                return errorResponse(res, 'El nombre y la marca son obligatorios', 400);
            }

            if (nombre.trim().length < 2) {
                return errorResponse(res, 'El nombre del modelo debe tener al menos 2 caracteres', 400);
            }

            const newModel = await modelService.createModel({ 
                nombre: nombre.trim(), 
                brandId 
            });

            console.log(`✅ Modelo creado exitosamente: ${newModel.id}`);

            return successResponse(
                res, 
                newModel, 
                'Modelo creado exitosamente', 
                201
            );

        } catch (error) {
            console.error('❌ Error creando modelo:', error);

            if (error.message.includes('Ya existe un modelo')) {
                return errorResponse(res, error.message, 409);
            }

            if (error.message.includes('marca especificada no existe')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al crear el modelo', 400);
        }
    }

    /**
     * Listar modelos con filtros opcionales
     * @route GET /api/models
     * @access Private - ALL
     */
    async getAllModels(req, res) {
        try {
            const { 
                brandId, 
                search, 
                page = 1, 
                limit = 10 
            } = req.query;

            console.log(`📋 Listando modelos - Página: ${page}, Límite: ${limit}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);
            
            if (brandId) {
                console.log(`🏷️ Filtro por marca: ${brandId}`);
            }
            
            if (search) {
                console.log(`🔍 Búsqueda: ${search}`);
            }

            const result = await modelService.getAllModels({
                brandId,
                search,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            console.log(`✅ Se encontraron ${result.models.length} modelos de ${result.pagination.total} total`);

            return successResponse(
                res, 
                result, 
                'Modelos obtenidos exitosamente'
            );

        } catch (error) {
            console.error('❌ Error obteniendo modelos:', error);
            return errorResponse(res, error.message || 'Error al obtener los modelos', 500);
        }
    }

    /**
     * Obtener un modelo específico por ID
     * @route GET /api/models/:id
     * @access Private - ALL
     */
    async getModelById(req, res) {
        try {
            const { id } = req.params;

            console.log(`🔍 Obteniendo modelo ID: ${id}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            if (!id) {
                return errorResponse(res, 'ID del modelo es obligatorio', 400);
            }

            const model = await modelService.getModelById(id);

            console.log(`✅ Modelo encontrado: ${model.nombre} (${model.brand.nombre})`);

            return successResponse(
                res, 
                model, 
                'Modelo obtenido exitosamente'
            );

        } catch (error) {
            console.error('❌ Error obteniendo modelo:', error);

            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            return errorResponse(res, error.message || 'Error al obtener el modelo', 500);
        }
    }

    /**
     * Obtener modelos por marca
     * @route GET /api/brands/:brandId/models
     * @access Private - ALL
     */
    async getModelsByBrand(req, res) {
        try {
            const { brandId } = req.params;

            console.log(`🔍 Obteniendo modelos para marca ID: ${brandId}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            if (!brandId) {
                return errorResponse(res, 'ID de la marca es obligatorio', 400);
            }

            const models = await modelService.getModelsByBrand(brandId);

            console.log(`✅ Se encontraron ${models.length} modelos para la marca`);

            return successResponse(
                res, 
                models, 
                'Modelos obtenidos exitosamente'
            );

        } catch (error) {
            console.error('❌ Error obteniendo modelos por marca:', error);

            if (error.message.includes('marca especificada no existe')) {
                return errorResponse(res, error.message, 404);
            }

            return errorResponse(res, error.message || 'Error al obtener los modelos', 500);
        }
    }

    /**
     * Actualizar un modelo
     * @route PUT /api/models/:id
     * @access Private - ADMIN/SUPERADMIN
     */
    async updateModel(req, res) {
        try {
            const { id } = req.params;
            const { nombre, brandId } = req.body;

            console.log(`✏️ Actualizando modelo ID: ${id}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            if (!id) {
                return errorResponse(res, 'ID del modelo es obligatorio', 400);
            }

            // Validaciones básicas
            if (nombre && nombre.trim().length < 2) {
                return errorResponse(res, 'El nombre del modelo debe tener al menos 2 caracteres', 400);
            }

            // Preparar datos de actualización
            const updateData = {};
            if (nombre) updateData.nombre = nombre.trim();
            if (brandId) updateData.brandId = brandId;

            if (Object.keys(updateData).length === 0) {
                return errorResponse(res, 'Debe proporcionar al menos un campo para actualizar', 400);
            }

            const updatedModel = await modelService.updateModel(id, updateData);

            console.log(`✅ Modelo actualizado exitosamente: ${updatedModel.nombre}`);

            return successResponse(
                res, 
                updatedModel, 
                'Modelo actualizado exitosamente'
            );

        } catch (error) {
            console.error('❌ Error actualizando modelo:', error);

            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('Ya existe un modelo')) {
                return errorResponse(res, error.message, 409);
            }

            if (error.message.includes('marca especificada no existe')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al actualizar el modelo', 400);
        }
    }

    /**
     * Eliminar un modelo
     * @route DELETE /api/models/:id
     * @access Private - ADMIN/SUPERADMIN
     */
    async deleteModel(req, res) {
        try {
            const { id } = req.params;

            console.log(`🗑️ Eliminando modelo ID: ${id}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            if (!id) {
                return errorResponse(res, 'ID del modelo es obligatorio', 400);
            }

            const deletedModel = await modelService.deleteModel(id);

            console.log(`✅ Modelo eliminado exitosamente: ${deletedModel.nombre}`);

            return successResponse(
                res, 
                deletedModel, 
                'Modelo eliminado exitosamente'
            );

        } catch (error) {
            console.error('❌ Error eliminando modelo:', error);

            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('no se puede eliminar')) {
                return errorResponse(res, error.message, 409);
            }

            return errorResponse(res, error.message || 'Error al eliminar el modelo', 400);
        }
    }
}

module.exports = new ModelController();
