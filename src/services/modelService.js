// src/services/modelService.js

const { prisma } = require('../config/database');

class ModelService {
    /**
     * Crear un nuevo modelo
     * @param {Object} modelData - Datos del modelo
     * @returns {Object} Modelo creado
     */
    async createModel({ nombre, brandId }) {
        try {
            // Verificar que la marca existe
            const existingBrand = await prisma.brand.findUnique({
                where: { id: brandId }
            });

            if (!existingBrand) {
                throw new Error('La marca especificada no existe');
            }

            // Verificar que el modelo no exista para esta marca
            const existingModel = await prisma.model.findFirst({
                where: { 
                    nombre: { 
                        equals: nombre, 
                        mode: 'insensitive' 
                    },
                    brandId: brandId
                }
            });

            if (existingModel) {
                throw new Error('Ya existe un modelo con ese nombre para esta marca');
            }

            // Crear el modelo
            const newModel = await prisma.model.create({
                data: { 
                    nombre, 
                    brandId 
                },
                include: {
                    brand: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });

            return newModel;

        } catch (error) {
            console.error('Error en createModel:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los modelos con filtros opcionales
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Array} Lista de modelos
     */
    async getAllModels({ brandId, search, page = 1, limit = 10 }) {
        try {
            const where = {};
            
            // Filtro por marca
            if (brandId) {
                where.brandId = brandId;
            }

            // Filtro por búsqueda en nombre
            if (search) {
                where.nombre = {
                    contains: search,
                    mode: 'insensitive'
                };
            }

            const skip = (page - 1) * limit;

            const [models, total] = await Promise.all([
                prisma.model.findMany({
                    where,
                    include: {
                        brand: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        },
                        _count: {
                            select: {
                                products: true
                            }
                        }
                    },
                    orderBy: [
                        { brand: { nombre: 'asc' } },
                        { nombre: 'asc' }
                    ],
                    skip,
                    take: parseInt(limit)
                }),
                prisma.model.count({ where })
            ]);

            return {
                models,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('Error en getAllModels:', error);
            throw error;
        }
    }

    /**
     * Obtener un modelo por ID
     * @param {String} modelId - ID del modelo
     * @returns {Object} Modelo encontrado
     */
    async getModelById(modelId) {
        try {
            const model = await prisma.model.findUnique({
                where: { id: modelId },
                include: {
                    brand: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    products: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    _count: {
                        select: {
                            products: true
                        }
                    }
                }
            });

            if (!model) {
                throw new Error('Modelo no encontrado');
            }

            return model;

        } catch (error) {
            console.error('Error en getModelById:', error);
            throw error;
        }
    }

    /**
     * Obtener modelos por marca
     * @param {String} brandId - ID de la marca
     * @returns {Array} Lista de modelos de la marca
     */
    async getModelsByBrand(brandId) {
        try {
            // Verificar que la marca existe
            const existingBrand = await prisma.brand.findUnique({
                where: { id: brandId }
            });

            if (!existingBrand) {
                throw new Error('La marca especificada no existe');
            }

            const models = await prisma.model.findMany({
                where: { brandId },
                include: {
                    _count: {
                        select: {
                            products: true
                        }
                    }
                },
                orderBy: { nombre: 'asc' }
            });

            return models;

        } catch (error) {
            console.error('Error en getModelsByBrand:', error);
            throw error;
        }
    }

    /**
     * Actualizar un modelo
     * @param {String} modelId - ID del modelo
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} Modelo actualizado
     */
    async updateModel(modelId, { nombre, brandId }) {
        try {
            // Verificar que el modelo existe
            const existingModel = await prisma.model.findUnique({
                where: { id: modelId }
            });

            if (!existingModel) {
                throw new Error('Modelo no encontrado');
            }

            // Si se va a cambiar la marca, verificar que existe
            if (brandId && brandId !== existingModel.brandId) {
                const existingBrand = await prisma.brand.findUnique({
                    where: { id: brandId }
                });

                if (!existingBrand) {
                    throw new Error('La marca especificada no existe');
                }
            }

            // Si se va a cambiar el nombre, verificar que no existe otro modelo con el mismo nombre en la marca
            if (nombre && nombre !== existingModel.nombre) {
                const targetBrandId = brandId || existingModel.brandId;
                const duplicateModel = await prisma.model.findFirst({
                    where: { 
                        nombre: { 
                            equals: nombre, 
                            mode: 'insensitive' 
                        },
                        brandId: targetBrandId,
                        id: { not: modelId }
                    }
                });

                if (duplicateModel) {
                    throw new Error('Ya existe un modelo con ese nombre para esta marca');
                }
            }

            // Actualizar el modelo
            const updatedModel = await prisma.model.update({
                where: { id: modelId },
                data: {
                    ...(nombre && { nombre }),
                    ...(brandId && { brandId })
                },
                include: {
                    brand: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    _count: {
                        select: {
                            products: true
                        }
                    }
                }
            });

            return updatedModel;

        } catch (error) {
            console.error('Error en updateModel:', error);
            throw error;
        }
    }

    /**
     * Eliminar un modelo
     * @param {String} modelId - ID del modelo
     * @returns {Object} Modelo eliminado
     */
    async deleteModel(modelId) {
        try {
            // Verificar que el modelo existe
            const existingModel = await prisma.model.findUnique({
                where: { id: modelId },
                include: {
                    _count: {
                        select: {
                            products: true
                        }
                    }
                }
            });

            if (!existingModel) {
                throw new Error('Modelo no encontrado');
            }

            // Verificar que no tenga productos asociados
            if (existingModel._count.products > 0) {
                throw new Error(`No se puede eliminar el modelo porque tiene ${existingModel._count.products} producto(s) asociado(s)`);
            }

            // Eliminar el modelo
            const deletedModel = await prisma.model.delete({
                where: { id: modelId },
                include: {
                    brand: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });

            return deletedModel;

        } catch (error) {
            console.error('Error en deleteModel:', error);
            throw error;
        }
    }
}

module.exports = new ModelService();
