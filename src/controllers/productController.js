// src/controllers/productController.js

const productService = require('../services/productService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class ProductController {
    /**
     * Crear un nuevo producto
     * @route POST /api/products
     * @access Private - SUPERADMIN only
     */
    async createProduct(req, res) {
        try {
            const { nombre, brandId, countryIds = [] } = req.body;
            
            console.log(`🆕 Creando nuevo producto: ${nombre}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);
            console.log(`🏷️ Marca: ${brandId}`);
            console.log(`🌍 Países asignados: ${countryIds.length} países`);

            const newProduct = await productService.createProduct({ 
                nombre, 
                brandId,
                countryIds 
            });

            console.log(`✅ Producto creado exitosamente: ${newProduct.id}`);

            return successResponse(
                res, 
                newProduct, 
                'Producto creado exitosamente', 
                201
            );

        } catch (error) {
            console.error('❌ Error creando producto:', error);

            if (error.message.includes('Ya existe un producto')) {
                return errorResponse(res, error.message, 409);
            }

            if (error.message.includes('marca seleccionada no existe')) {
                return errorResponse(res, error.message, 400);
            }

            if (error.message.includes('países seleccionados no existen')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al crear el producto', 400);
        }
    }

    /**
     * Listar productos según permisos del rol
     * @route GET /api/products
     * @access Private - ADMIN, SUPERADMIN
     */
    async listProducts(req, res) {
        try {
            const { search, page = 1, limit = 10, brandId } = req.query;
            
            // Obtener filtros del middleware
            const productFilters = req.productFilters || {};

            console.log(`📋 Listando productos para ${req.user.role}`);
            console.log(`🔍 Filtros aplicados:`, productFilters);
            console.log(`🔎 Término de búsqueda: ${search || 'ninguno'}`);
            if (brandId) console.log(`🏷️ Filtro por marca: ${brandId}`);

            const result = await productService.listProducts(productFilters, {
                search,
                page: parseInt(page),
                limit: parseInt(limit),
                brandId
            });

            console.log(`✅ ${result.products.length} productos encontrados`);

            return successResponse(res, result, 'Productos obtenidos exitosamente');

        } catch (error) {
            console.error('❌ Error listando productos:', error);
            return errorResponse(res, error.message || 'Error al obtener los productos', 500);
        }
    }

    /**
     * Obtener un producto por ID
     * @route GET /api/products/:id
     * @access Private - ADMIN, SUPERADMIN
     */
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;

            console.log(`🔍 Obteniendo producto ${id} para ${requestingUser.email}`);

            const product = await productService.getProductById(id);

            if (!product) {
                return errorResponse(res, 'Producto no encontrado', 404);
            }

            // Verificar permisos para ADMIN
            if (requestingUser.role === 'ADMIN') {
                const userCountryIds = requestingUser.countries.map(c => c.id);
                const productCountryIds = product.countries.map(c => c.id);
                const hasCommonCountry = productCountryIds.some(id => userCountryIds.includes(id));

                if (!hasCommonCountry) {
                    return errorResponse(res, 'No tienes permisos para ver este producto', 403);
                }
            }

            console.log(`✅ Producto obtenido: ${product.nombre}`);

            return successResponse(res, product, 'Producto obtenido exitosamente');

        } catch (error) {
            console.error('❌ Error obteniendo producto:', error);
            return errorResponse(res, error.message || 'Error al obtener el producto', 500);
        }
    }

    /**
     * Actualizar un producto
     * @route PUT /api/products/:id
     * @access Private - SUPERADMIN only
     */
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { nombre, brandId, countryIds } = req.body;

            console.log(`🔄 Actualizando producto ${id}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            const updatedProduct = await productService.updateProduct(id, {
                nombre,
                brandId,
                countryIds
            });

            console.log(`✅ Producto actualizado exitosamente: ${updatedProduct.nombre}`);

            return successResponse(res, updatedProduct, 'Producto actualizado exitosamente');

        } catch (error) {
            console.error('❌ Error actualizando producto:', error);

            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('Ya existe un producto')) {
                return errorResponse(res, error.message, 409);
            }

            if (error.message.includes('marca seleccionada no existe')) {
                return errorResponse(res, error.message, 400);
            }

            if (error.message.includes('países seleccionados no existen')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al actualizar el producto', 400);
        }
    }

    /**
     * Eliminar un producto
     * @route DELETE /api/products/:id
     * @access Private - SUPERADMIN only
     */
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            console.log(`🗑️ Eliminando producto ${id}`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            const result = await productService.deleteProduct(id);

            console.log(`✅ Producto eliminado: ${result.deletedProduct.nombre}`);

            return successResponse(res, result, 'Producto eliminado exitosamente');

        } catch (error) {
            console.error('❌ Error eliminando producto:', error);

            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('RMAs asociados')) {
                return errorResponse(res, error.message, 409);
            }

            return errorResponse(res, error.message || 'Error al eliminar el producto', 400);
        }
    }

    /**
     * Buscar productos
     * @route GET /api/products/search
     * @access Private - ADMIN (de sus países), SUPERADMIN (todos)
     */
    async searchProducts(req, res) {
        try {
            const { q: searchTerm, limit = 20, brandId } = req.query;

            if (!searchTerm || searchTerm.trim() === '') {
                return errorResponse(res, 'Término de búsqueda requerido', 400);
            }

            // Obtener filtros del middleware
            const productFilters = req.productFilters || {};

            console.log(`🔎 Buscando productos con término: "${searchTerm}"`);
            console.log(`👤 Usuario: ${req.user.email} (${req.user.role})`);
            console.log(`🔍 Filtros aplicados:`, productFilters);
            if (brandId) console.log(`🏷️ Filtro por marca: ${brandId}`);

            const products = await productService.searchProducts(
                searchTerm.trim(),
                productFilters,
                { limit: parseInt(limit), brandId }
            );

            console.log(`✅ ${products.length} productos encontrados`);

            return successResponse(res, products, `${products.length} productos encontrados`);

        } catch (error) {
            console.error('❌ Error buscando productos:', error);
            return errorResponse(res, error.message || 'Error al buscar productos', 500);
        }
    }

    /**
     * Obtener productos por marca
     * @route GET /api/products/by-brand/:brandId
     * @access Private - ADMIN, SUPERADMIN
     */
    async getProductsByBrand(req, res) {
        try {
            const { brandId } = req.params;
            const requestingUser = req.user;

            console.log(`🏷️ Obteniendo productos de la marca ${brandId}`);
            console.log(`👤 Solicitado por: ${requestingUser.email} (${requestingUser.role})`);

            // Obtener filtros del middleware
            const productFilters = req.productFilters || {};

            const products = await productService.getProductsByBrand(brandId, productFilters);

            console.log(`✅ ${products.length} productos encontrados para la marca`);

            return successResponse(res, products, `${products.length} productos encontrados`);

        } catch (error) {
            console.error('❌ Error obteniendo productos por marca:', error);
            return errorResponse(res, error.message || 'Error al obtener productos por marca', 500);
        }
    }

    /**
     * Obtener estadísticas de productos
     * @route GET /api/products/stats
     * @access Private - ADMIN, SUPERADMIN
     */
    async getProductStats(req, res) {
        try {
            console.log(`📊 Obteniendo estadísticas de productos para ${req.user.role}`);
            
            // Obtener filtros del middleware
            const productFilters = req.productFilters || {};

            // Para estadísticas básicas, usar el servicio de listado
            const result = await productService.listProducts(productFilters, { 
                page: 1, 
                limit: 1000 // Obtener todos para estadísticas
            });

            // Estadísticas por marca
            const productsByBrand = result.products.reduce((acc, product) => {
                const brandName = product.brand.nombre;
                if (!acc[brandName]) {
                    acc[brandName] = {
                        brandId: product.brand.id,
                        brandName: brandName,
                        count: 0,
                        rmaCount: 0
                    };
                }
                acc[brandName].count++;
                acc[brandName].rmaCount += product.rmaCount;
                return acc;
            }, {});

            const stats = {
                totalProducts: result.pagination.total,
                productsWithRMAs: result.products.filter(p => p.rmaCount > 0).length,
                totalRMAs: result.products.reduce((sum, p) => sum + p.rmaCount, 0),
                averageRMAsPerProduct: result.products.length > 0 
                    ? Math.round(result.products.reduce((sum, p) => sum + p.rmaCount, 0) / result.products.length * 100) / 100
                    : 0,
                productsByBrand: Object.values(productsByBrand)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10), // Top 10 marcas
                topProductsWithMostRMAs: result.products
                    .sort((a, b) => b.rmaCount - a.rmaCount)
                    .slice(0, 5)
                    .map(p => ({
                        id: p.id,
                        nombre: p.nombre,
                        brand: p.brand.nombre,
                        rmaCount: p.rmaCount
                    }))
            };

            console.log(`✅ Estadísticas generadas: ${stats.totalProducts} productos totales`);

            return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return errorResponse(res, error.message || 'Error al obtener estadísticas', 500);
        }
    }
}

module.exports = new ProductController();