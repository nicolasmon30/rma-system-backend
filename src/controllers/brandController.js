// src/controllers/brandController.js

const brandService = require('../services/brandService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class BrandController {
    /**
     * Crear una nueva marca
     * @route POST /api/brands
     * @access Private - SUPERADMIN only
     */
    async createBrand(req, res) {
        try {
            const { nombre, countryIds = [] } = req.body;
            
            console.log(`🆕 Creando nueva marca: ${nombre}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);
            console.log(`🌍 Países asignados: ${countryIds.length} países`);

            const newBrand = await brandService.createBrand({ 
                nombre, 
                countryIds 
            });

            console.log(`✅ Marca creada exitosamente: ${newBrand.id}`);

            return successResponse(
                res, 
                newBrand, 
                'Marca creada exitosamente', 
                201
            );

        } catch (error) {
            console.error('❌ Error creando marca:', error);

            if (error.message.includes('Ya existe una marca')) {
                return errorResponse(res, error.message, 409);
            }

            if (error.message.includes('países seleccionados no existen')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al crear la marca', 400);
        }
    }

    /**
     * Listar marcas según permisos del rol
     * @route GET /api/brands
     * @access Private - ADMIN, SUPERADMIN
     */
    async listBrands(req, res) {
        try {
            const { search, page = 1, limit = 10 } = req.query;
            
            // Obtener filtros del middleware
            const brandFilters = req.brandFilters || {};

            console.log(`📋 Listando marcas para ${req.user.role}`);
            console.log(`🔍 Filtros aplicados:`, brandFilters);
            console.log(`🔎 Término de búsqueda: ${search || 'ninguno'}`);

            const result = await brandService.listBrands(brandFilters, {
                search,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            console.log(`✅ ${result.brands.length} marcas encontradas`);

            return successResponse(res, result, 'Marcas obtenidas exitosamente');

        } catch (error) {
            console.error('❌ Error listando marcas:', error);
            return errorResponse(res, error.message || 'Error al obtener las marcas', 500);
        }
    }

    /**
     * Obtener una marca por ID
     * @route GET /api/brands/:id
     * @access Private - ADMIN, SUPERADMIN
     */
    async getBrandById(req, res) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;

            console.log(`🔍 Obteniendo marca ${id} para ${requestingUser.email}`);

            const brand = await brandService.getBrandById(id);

            if (!brand) {
                return errorResponse(res, 'Marca no encontrada', 404);
            }

            // Verificar permisos para ADMIN
            if (requestingUser.role === 'ADMIN') {
                const userCountryIds = requestingUser.countries.map(c => c.id);
                const brandCountryIds = brand.countries.map(c => c.id);
                const hasCommonCountry = brandCountryIds.some(id => userCountryIds.includes(id));

                if (!hasCommonCountry) {
                    return errorResponse(res, 'No tienes permisos para ver esta marca', 403);
                }
            }

            console.log(`✅ Marca obtenida: ${brand.nombre}`);

            return successResponse(res, brand, 'Marca obtenida exitosamente');

        } catch (error) {
            console.error('❌ Error obteniendo marca:', error);
            return errorResponse(res, error.message || 'Error al obtener la marca', 500);
        }
    }

    /**
     * Actualizar una marca
     * @route PUT /api/brands/:id
     * @access Private - SUPERADMIN only
     */
    async updateBrand(req, res) {
        try {
            const { id } = req.params;
            const { nombre, countryIds } = req.body;

            console.log(`🔄 Actualizando marca ${id}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            const updatedBrand = await brandService.updateBrand(id, {
                nombre,
                countryIds
            });

            console.log(`✅ Marca actualizada exitosamente: ${updatedBrand.nombre}`);

            return successResponse(res, updatedBrand, 'Marca actualizada exitosamente');

        } catch (error) {
            console.error('❌ Error actualizando marca:', error);

            if (error.message.includes('no encontrada')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('Ya existe una marca')) {
                return errorResponse(res, error.message, 409);
            }

            if (error.message.includes('países seleccionados no existen')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al actualizar la marca', 400);
        }
    }

    /**
     * Eliminar una marca
     * @route DELETE /api/brands/:id
     * @access Private - SUPERADMIN only
     */
    async deleteBrand(req, res) {
        try {
            const { id } = req.params;

            console.log(`🗑️ Eliminando marca ${id}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            const result = await brandService.deleteBrand(id);

            console.log(`✅ Marca eliminada: ${result.deletedBrand.nombre}`);

            return successResponse(res, result, 'Marca eliminada exitosamente');

        } catch (error) {
            console.error('❌ Error eliminando marca:', error);

            if (error.message.includes('no encontrada')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('productos asociados')) {
                return errorResponse(res, error.message, 409);
            }

            return errorResponse(res, error.message || 'Error al eliminar la marca', 400);
        }
    }

    /**
     * Buscar marcas
     * @route GET /api/brands/search
     * @access Private - ADMIN, SUPERADMIN
     */
    async searchBrands(req, res) {
        try {
            const { q: searchTerm, limit = 20 } = req.query;

            if (!searchTerm || searchTerm.trim() === '') {
                return errorResponse(res, 'Término de búsqueda requerido', 400);
            }

            // Obtener filtros del middleware
            const brandFilters = req.brandFilters || {};

            console.log(`🔎 Buscando marcas con término: "${searchTerm}"`);
            console.log(`👤 Usuario: ${req.user.email} (${req.user.role})`);
            console.log(`🔍 Filtros aplicados:`, brandFilters);

            const brands = await brandService.searchBrands(
                searchTerm.trim(),
                brandFilters,
                { limit: parseInt(limit) }
            );

            console.log(`✅ ${brands.length} marcas encontradas`);

            return successResponse(res, brands, `${brands.length} marcas encontradas`);

        } catch (error) {
            console.error('❌ Error buscando marcas:', error);
            return errorResponse(res, error.message || 'Error al buscar marcas', 500);
        }
    }

    /**
     * Obtener estadísticas de marcas
     * @route GET /api/brands/stats
     * @access Private - ADMIN, SUPERADMIN
     */
    async getBrandStats(req, res) {
        try {
            console.log(`📊 Obteniendo estadísticas de marcas para ${req.user.role}`);
            
            // Obtener filtros del middleware
            const brandFilters = req.brandFilters || {};

            // Para estadísticas básicas, podemos usar el servicio de listado
            const result = await brandService.listBrands(brandFilters, { 
                page: 1, 
                limit: 1000 // Obtener todas para estadísticas
            });

            const stats = {
                totalBrands: result.pagination.total,
                brandsWithProducts: result.brands.filter(b => b.productCount > 0).length,
                averageProductsPerBrand: result.brands.length > 0 
                    ? Math.round(result.brands.reduce((sum, b) => sum + b.productCount, 0) / result.brands.length)
                    : 0,
                topBrandsWithMostProducts: result.brands
                    .sort((a, b) => b.productCount - a.productCount)
                    .slice(0, 5)
                    .map(b => ({
                        id: b.id,
                        nombre: b.nombre,
                        productCount: b.productCount
                    }))
            };

            console.log(`✅ Estadísticas generadas: ${stats.totalBrands} marcas totales`);

            return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return errorResponse(res, error.message || 'Error al obtener estadísticas', 500);
        }
    }
}

module.exports = new BrandController();