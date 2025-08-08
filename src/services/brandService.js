// src/services/brandService.js

const { prisma } = require('../config/database');

class BrandService {
    /**
     * Crear una nueva marca (solo SUPERADMIN)
     * @param {Object} brandData - Datos de la marca
     * @param {Array} countryIds - IDs de países donde estará disponible la marca
     * @returns {Object} Marca creada
     */
    async createBrand({ nombre, countryIds }) {
        try {
            // Verificar que la marca no exista
            const existingBrand = await prisma.brand.findFirst({
                where: { 
                    nombre: { 
                        equals: nombre, 
                        mode: 'insensitive' 
                    }
                }
            });

            if (existingBrand) {
                throw new Error('Ya existe una marca con ese nombre');
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

            // Crear la marca en una transacción
            const newBrand = await prisma.$transaction(async (tx) => {
                // 1. Crear la marca
                const createdBrand = await tx.brand.create({
                    data: { nombre }
                });

                // 2. Asignar países si se proporcionaron
                if (countryIds && countryIds.length > 0) {
                    await tx.brandCountry.createMany({
                        data: countryIds.map(countryId => ({
                            brandId: createdBrand.id,
                            countryId: countryId
                        }))
                    });
                }

                // 3. Retornar marca con países
                return await tx.brand.findUnique({
                    where: { id: createdBrand.id },
                    include: {
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
                                products: true
                            }
                        }
                    }
                });
            });

            // Formatear respuesta
            return {
                ...newBrand,
                countries: newBrand.countries.map(bc => bc.country),
                productCount: newBrand._count.products
            };

        } catch (error) {
            console.error('Error creando marca:', error);
            throw error;
        }
    }

    /**
     * Listar marcas con filtros flexibles
     * @param {Object} filters - Filtros a aplicar
     * @param {Object} options - Opciones de paginación y búsqueda
     * @returns {Object} Marcas y metadata de paginación
     */
    async listBrands(filters = {}, options = {}) {
        try {
            const { page = 1, limit = 10, search = '' } = options;
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

            // Ejecutar consulta con conteo total
            const [brands, total] = await Promise.all([
                prisma.brand.findMany({
                    where: whereClause,
                    include: {
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
                                products: true
                            }
                        }
                    },
                    skip,
                    take: limit,
                    orderBy: {
                        nombre: 'asc'
                    }
                }),
                prisma.brand.count({ where: whereClause })
            ]);

            // Formatear respuesta
            const formattedBrands = brands.map(brand => ({
                ...brand,
                countries: brand.countries.map(bc => bc.country),
                productCount: brand._count.products
            }));

            return {
                brands: formattedBrands,
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
            console.error('Error listando marcas:', error);
            throw error;
        }
    }

    /**
     * Obtener una marca por ID
     * @param {String} brandId - ID de la marca
     * @returns {Object} Marca con detalles
     */
    async getBrandById(brandId) {
        try {
            const brand = await prisma.brand.findUnique({
                where: { id: brandId },
                include: {
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
                    products: {
                        include: {
                            countries: {
                                include: {
                                    country: {
                                        select: {
                                            id: true,
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            products: true
                        }
                    }
                }
            });

            if (!brand) {
                return null;
            }

            // Formatear respuesta
            return {
                ...brand,
                countries: brand.countries.map(bc => bc.country),
                products: brand.products.map(product => ({
                    ...product,
                    countries: product.countries.map(pc => pc.country)
                })),
                productCount: brand._count.products
            };
        } catch (error) {
            console.error('Error obteniendo marca:', error);
            throw error;
        }
    }

    /**
     * Actualizar una marca (solo SUPERADMIN)
     * @param {String} brandId - ID de la marca
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} Marca actualizada
     */
    async updateBrand(brandId, { nombre, countryIds }) {
        try {
            // Verificar que la marca existe
            const existingBrand = await prisma.brand.findUnique({
                where: { id: brandId }
            });

            if (!existingBrand) {
                throw new Error('Marca no encontrada');
            }

            // Verificar nombre duplicado (si se está cambiando)
            if (nombre && nombre !== existingBrand.nombre) {
                const duplicateBrand = await prisma.brand.findFirst({
                    where: { 
                        nombre: { 
                            equals: nombre, 
                            mode: 'insensitive' 
                        },
                        NOT: { id: brandId }
                    }
                });

                if (duplicateBrand) {
                    throw new Error('Ya existe una marca con ese nombre');
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
            const updatedBrand = await prisma.$transaction(async (tx) => {
                // 1. Actualizar datos básicos
                const brand = await tx.brand.update({
                    where: { id: brandId },
                    data: {
                        ...(nombre && { nombre }),
                        updatedAt: new Date()
                    }
                });

                // 2. Actualizar países si se proporcionaron
                if (countryIds !== undefined) {
                    // Eliminar asignaciones existentes
                    await tx.brandCountry.deleteMany({
                        where: { brandId: brandId }
                    });

                    // Crear nuevas asignaciones
                    if (countryIds.length > 0) {
                        await tx.brandCountry.createMany({
                            data: countryIds.map(countryId => ({
                                brandId: brandId,
                                countryId: countryId
                            }))
                        });
                    }
                }

                // 3. Retornar marca actualizada
                return await tx.brand.findUnique({
                    where: { id: brandId },
                    include: {
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
                                products: true
                            }
                        }
                    }
                });
            });

            // Formatear respuesta
            return {
                ...updatedBrand,
                countries: updatedBrand.countries.map(bc => bc.country),
                productCount: updatedBrand._count.products
            };

        } catch (error) {
            console.error('Error actualizando marca:', error);
            throw error;
        }
    }

    /**
     * Eliminar una marca (solo SUPERADMIN)
     * @param {String} brandId - ID de la marca
     * @returns {Object} Resultado de la eliminación
     */
    async deleteBrand(brandId) {
        try {
            // Verificar que la marca existe
            const brand = await prisma.brand.findUnique({
                where: { id: brandId },
                include: {
                    _count: {
                        select: {
                            products: true
                        }
                    }
                }
            });

            if (!brand) {
                throw new Error('Marca no encontrada');
            }

            // Verificar que no tenga productos asociados
            if (brand._count.products > 0) {
                throw new Error('No se puede eliminar la marca porque tiene productos asociados');
            }

            // Eliminar en transacción
            await prisma.$transaction(async (tx) => {
                // 1. Eliminar asignaciones de países
                await tx.brandCountry.deleteMany({
                    where: { brandId: brandId }
                });

                // 2. Eliminar la marca
                await tx.brand.delete({
                    where: { id: brandId }
                });
            });

            return {
                message: 'Marca eliminada exitosamente',
                deletedBrand: {
                    id: brand.id,
                    nombre: brand.nombre
                }
            };

        } catch (error) {
            console.error('Error eliminando marca:', error);
            throw error;
        }
    }

    /**
     * Buscar marcas por término
     * @param {String} searchTerm - Término de búsqueda
     * @param {Object} filters - Filtros adicionales
     * @param {Object} options - Opciones de paginación
     * @returns {Array} Marcas encontradas
     */
    async searchBrands(searchTerm, filters = {}, options = {}) {
        try {
            const { limit = 20 } = options;

            const whereClause = {
                ...filters,
                nombre: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            };

            const brands = await prisma.brand.findMany({
                where: whereClause,
                include: {
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
                            products: true
                        }
                    }
                },
                take: limit,
                orderBy: [
                    { nombre: 'asc' }
                ]
            });

            // Formatear respuesta
            return brands.map(brand => ({
                ...brand,
                countries: brand.countries.map(bc => bc.country),
                productCount: brand._count.products
            }));

        } catch (error) {
            console.error('Error buscando marcas:', error);
            throw error;
        }
    }
}

module.exports = new BrandService();