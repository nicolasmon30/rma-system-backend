// src/services/productService.js

const { prisma } = require('../config/database');

class ProductService {
    /**
     * Crear un nuevo producto (solo SUPERADMIN)
     * @param {Object} productData - Datos del producto
     * @param {Array} countryIds - IDs de países donde estará disponible el producto
     * @returns {Object} Producto creado
     */
    async createProduct({ nombre, brandId, countryIds }) {
        try {
            // Verificar que el producto no exista
            const existingProduct = await prisma.product.findFirst({
                where: {
                    nombre: {
                        equals: nombre,
                        mode: 'insensitive'
                    },
                    brandId
                }
            });

            if (existingProduct) {
                throw new Error('Ya existe un producto con ese nombre para esta marca');
            }

            // Verificar que la marca existe
            const brand = await prisma.brand.findUnique({
                where: { id: brandId }
            });

            if (!brand) {
                throw new Error('La marca seleccionada no existe');
            }

            // Verificar que los países existen
            if (countryIds && countryIds.length > 0) {
                const validCountries = await prisma.country.findMany({
                    where: { id: { in: countryIds } }
                });

                if (validCountries.length !== countryIds.length) {
                    throw new Error('Algunos países seleccionados no existen');
                }
            }

            // Crear el producto en una transacción
            const newProduct = await prisma.$transaction(async (tx) => {
                // 1. Crear el producto
                const createdProduct = await tx.product.create({
                    data: { nombre, brandId }
                });

                // 2. Asignar países si se proporcionaron
                if (countryIds && countryIds.length > 0) {
                    await tx.productCountry.createMany({
                        data: countryIds.map(countryId => ({
                            productId: createdProduct.id,
                            countryId: countryId
                        }))
                    });
                }

                // 3. Retornar producto con relaciones
                return await tx.product.findUnique({
                    where: { id: createdProduct.id },
                    include: {
                        brand: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        },
                        countries: {
                            include: {
                                country: {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                rmaItems: true
                            }
                        }
                    }
                });
            });

            // Formatear respuesta
            return {
                ...newProduct,
                countries: newProduct.countries.map(pc => pc.country),
                rmaCount: newProduct._count.rmaItems
            };

        } catch (error) {
            console.error('Error creando producto:', error);
            throw error;
        }
    }

    /**
     * Listar productos con filtros flexibles
     * @param {Object} filters - Filtros a aplicar
     * @param {Object} options - Opciones de paginación y búsqueda
     * @returns {Object} Productos y metadata de paginación
     */
    async listProducts(filters = {}, options = {}) {
        try {
            const { page = 1, limit = 10, search = '', brandId = '' } = options;
            const skip = (page - 1) * limit;

            // Construir cláusula where
            let whereClause = { ...filters };

            // Agregar búsqueda si existe
            if (search) {
                whereClause.nombre = {
                    contains: search,
                    mode: 'insensitive'
                };
            }

            // Filtrar por marca si se especifica
            if (brandId) {
                whereClause.brandId = brandId;
            }

            // Ejecutar consulta con conteo total
            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    where: whereClause,
                    include: {
                        brand: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        },
                        countries: {
                            include: {
                                country: {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                rmaItems: true
                            }
                        }
                    },
                    skip,
                    take: limit,
                    orderBy: [
                        { brand: { nombre: 'asc' } },
                        { nombre: 'asc' }
                    ]
                }),
                prisma.product.count({ where: whereClause })
            ]);

            // Formatear respuesta
            const formattedProducts = products.map(product => ({
                ...product,
                countries: product.countries.map(pc => pc.country),
                rmaCount: product._count.rmaItems
            }));

            return {
                products: formattedProducts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Error listando productos:', error);
            throw error;
        }
    }

    /**
     * Obtener un producto por ID
     * @param {String} productId - ID del producto
     * @returns {Object} Producto con detalles
     */
    async getProductById(productId) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: {
                    brand: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    countries: {
                        include: {
                            country: {
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            rmaItems: true
                        }
                    }
                }
            });

            if (!product) {
                return null;
            }

            // Formatear respuesta
            return {
                ...product,
                countries: product.countries.map(pc => pc.country),
                rmaCount: product._count.rmaItems
            };
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            throw error;
        }
    }

    /**
     * Actualizar un producto (solo SUPERADMIN)
     * @param {String} productId - ID del producto
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} Producto actualizado
     */
    async updateProduct(productId, { nombre, brandId, countryIds }) {
        try {
            // Verificar que el producto existe
            const existingProduct = await prisma.product.findUnique({
                where: { id: productId }
            });

            if (!existingProduct) {
                throw new Error('Producto no encontrado');
            }

            // Verificar nombre duplicado (si se está cambiando)
            if (nombre && nombre !== existingProduct.nombre) {
                const duplicateProduct = await prisma.product.findFirst({
                    where: {
                        nombre: {
                            equals: nombre,
                            mode: 'insensitive'
                        },
                        brandId: brandId || existingProduct.brandId,
                        NOT: { id: productId }
                    }
                });

                if (duplicateProduct) {
                    throw new Error('Ya existe un producto con ese nombre para esta marca');
                }
            }

            // Verificar marca si se está cambiando
            if (brandId && brandId !== existingProduct.brandId) {
                const brand = await prisma.brand.findUnique({
                    where: { id: brandId }
                });

                if (!brand) {
                    throw new Error('La marca seleccionada no existe');
                }
            }

            // Verificar países si se proporcionaron
            if (countryIds && countryIds.length > 0) {
                const validCountries = await prisma.country.findMany({
                    where: { id: { in: countryIds } }
                });

                if (validCountries.length !== countryIds.length) {
                    throw new Error('Algunos países seleccionados no existen');
                }
            }

            // Actualizar en transacción
            const updatedProduct = await prisma.$transaction(async (tx) => {
                // 1. Actualizar datos básicos
                const product = await tx.product.update({
                    where: { id: productId },
                    data: {
                        ...(nombre && { nombre }),
                        ...(brandId && { brandId }),
                        updatedAt: new Date()
                    }
                });

                // 2. Actualizar países si se proporcionaron
                if (countryIds !== undefined) {
                    // Eliminar asignaciones existentes
                    await tx.productCountry.deleteMany({
                        where: { productId: productId }
                    });

                    // Crear nuevas asignaciones
                    if (countryIds.length > 0) {
                        await tx.productCountry.createMany({
                            data: countryIds.map(countryId => ({
                                productId: productId,
                                countryId: countryId
                            }))
                        });
                    }
                }

                // 3. Retornar producto actualizado
                return await tx.product.findUnique({
                    where: { id: productId },
                    include: {
                        brand: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        },
                        countries: {
                            include: {
                                country: {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                rmaItems: true
                            }
                        }
                    }
                });
            });

            // Formatear respuesta
            return {
                ...updatedProduct,
                countries: updatedProduct.countries.map(pc => pc.country),
                rmaCount: updatedProduct._count.rmaItems
            };

        } catch (error) {
            console.error('Error actualizando producto:', error);
            throw error;
        }
    }

    /**
     * Eliminar un producto (solo SUPERADMIN)
     * @param {String} productId - ID del producto
     * @returns {Object} Resultado de la eliminación
     */
    async deleteProduct(productId) {
        try {
            // Verificar que el producto existe
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: {
                    _count: {
                        select: {
                            rmaItems: true
                        }
                    }
                }
            });

            if (!product) {
                throw new Error('Producto no encontrado');
            }

            // Verificar que no tenga RMAs asociados
            if (product._count.rmaItems > 0) {
                throw new Error('No se puede eliminar el producto porque tiene RMAs asociados');
            }

            // Eliminar en transacción
            await prisma.$transaction(async (tx) => {
                // 1. Eliminar asignaciones de países
                await tx.productCountry.deleteMany({
                    where: { productId: productId }
                });

                // 2. Eliminar el producto
                await tx.product.delete({
                    where: { id: productId }
                });
            });

            return {
                message: 'Producto eliminado exitosamente',
                deletedProduct: {
                    id: product.id,
                    nombre: product.nombre
                }
            };

        } catch (error) {
            console.error('Error eliminando producto:', error);
            throw error;
        }
    }

    /**
     * Buscar productos por término
     * @param {String} searchTerm - Término de búsqueda
     * @param {Object} filters - Filtros adicionales
     * @param {Object} options - Opciones de paginación
     * @returns {Array} Productos encontrados
     */
    async searchProducts(searchTerm, filters = {}, options = {}) {
        try {
            const { limit = 20, brandId } = options;

            let whereClause = {
                ...filters,
                OR: [
                    {
                        nombre: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        brand: {
                            nombre: {
                                contains: searchTerm,
                                mode: 'insensitive'
                            }
                        }
                    }
                ]
            };

            // Filtrar por marca específica si se proporciona
            if (brandId) {
                whereClause.brandId = brandId;
            }

            const products = await prisma.product.findMany({
                where: whereClause,
                include: {
                    brand: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    countries: {
                        include: {
                            country: {
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            rmaItems: true
                        }
                    }
                },
                take: limit,
                orderBy: [
                    { brand: { nombre: 'asc' } },
                    { nombre: 'asc' }
                ]
            });

            // Formatear respuesta
            return products.map(product => ({
                ...product,
                countries: product.countries.map(pc => pc.country),
                rmaCount: product._count.rmaItems
            }));

        } catch (error) {
            console.error('Error buscando productos:', error);
            throw error;
        }
    }

    /**
     * Obtener productos por marca
     * @param {String} brandId - ID de la marca
     * @param {Object} filters - Filtros adicionales
     * @returns {Array} Productos de la marca
     */
    async getProductsByBrand(brandId, filters = {}) {
        try {
            const products = await prisma.product.findMany({
                where: {
                    brandId,
                    ...filters
                },
                include: {
                    brand: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    countries: {
                        include: {
                            country: {
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            rmaItems: true
                        }
                    }
                },
                orderBy: {
                    nombre: 'asc'
                }
            });

            return products.map(product => ({
                ...product,
                countries: product.countries.map(pc => pc.country),
                rmaCount: product._count.rmaItems
            }));
        } catch (error) {
            console.error('Error obteniendo productos por marca:', error);
            throw error;
        }
    }
}

module.exports = new ProductService();