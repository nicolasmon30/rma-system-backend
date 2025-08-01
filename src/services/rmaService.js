const { prisma } = require('../config/database');

class RmaService {
    /**
     * Crea un nuevo RMA
     * @param {Object} rmaData - Datos del RMA
     * @param {String} userId - ID del usuario que crea el RMA
     * @returns {Object} RMA creado
     */
    async createRma(rmaData, userId) {
        console.log(rmaData, userId)
        try {
            const { countryId, products, ...rmaInfo } = rmaData;

            // Verificar que el usuario existe y tiene permisos en el país
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    countries: {
                        where: { countryId },
                        select: { countryId: true }
                    }
                }
            });

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            if (user.role === 'USER' && user.countries.length === 0) {
                throw new Error('No tienes permisos para crear RMAs en este país');
            }

            // Verificar que los productos existen y están disponibles en el país
            const productIds = products.map(p => p.productId);
            const validProducts = await prisma.productCountry.findMany({
                where: {
                    productId: { in: productIds },
                    countryId
                },
                select: { productId: true }
            });

            if (validProducts.length !== products.length) {
                throw new Error('Algunos productos no están disponibles en el país seleccionado');
            }

            // Crear el RMA en una transacción
            const newRma = await prisma.$transaction(async (tx) => {
                // 1. Crear el RMA principal
                const createdRma = await tx.rma.create({
                    data: {
                        ...rmaInfo,
                        userId,
                        countryId,
                        nombreEmpresa: user.empresa, // Tomar la empresa del usuario
                        status: 'RMA_SUBMITTED' // Estado inicial
                    },
                    include: {
                        country: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                email: true,
                                empresa: true
                            }
                        }
                    }
                });

                // 2. Crear los productos asociados al RMA
                const rmaProducts = await Promise.all(
                    products.map(product =>
                        tx.rmaProduct.create({
                            data: {
                                rmaId: createdRma.id,
                                productId: product.productId,
                                serial: product.serial,
                                model: product.model,
                                reporteEvaluacion: product.reporteEvaluacion || null
                            },
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        brand: {
                                            select: {
                                                id: true,
                                                nombre: true
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    )
                );

                return {
                    ...createdRma,
                    products: rmaProducts
                };
            });

            return newRma;
        } catch (error) {
            throw error;
        }
    }
    /**
       * Obtiene RMAs del usuario con filtros
       * @param {String} userId - ID del usuario
       * @param {Object} filters - Filtros a aplicar
       * @returns {Array} Lista de RMAs
       */
    async getUserRmas(userId, filters = {}) {
        try {
            const { status, startDate, endDate } = filters;
            const whereClause = {
                userId,
                ...(status && { status }),
                ...(startDate && endDAte && {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                })
            };

            const rmas = await prisma.rma.findMany({
                where: whereClause,
                include: {
                    country: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    products: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    brand: {
                                        select: {
                                            id: true,
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return rmas;
        } catch (error) {
            throw error;
        }
    }

    /**
   * Lista RMAs con filtros aplicados según el rol del usuario (RBAC)
   * @param {Object} filter - Filtros aplicados por RBAC
   * @param {Object} options - Opciones de paginación y búsqueda
   * @returns {Object} Lista de RMAs con paginación
   */
    async listRmas(filter = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status = '',
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const skip = (page - 1) * limit;

            // Construir filtros adicionales
            let whereClause = { ...filter };

            // Filtro por búsqueda
            if (search) {
                whereClause.OR = [
                    { nombreEmpresa: { contains: search, mode: 'insensitive' } },
                    { direccion: { contains: search, mode: 'insensitive' } },
                    { numeroTracking: { contains: search, mode: 'insensitive' } },
                    {
                        user: {
                            OR: [
                                { nombre: { contains: search, mode: 'insensitive' } },
                                { apellido: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } }
                            ]
                        }
                    }
                ];
            }

            // Filtro por status
            if (status) {
                whereClause.status = status;
            }

            // Configurar ordenamiento
            const orderBy = {};
            orderBy[sortBy] = sortOrder;

            // Obtener RMAs y total
            const [rmas, total] = await Promise.all([
                prisma.rma.findMany({
                    where: whereClause,
                    include: {
                        user: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                email: true,
                                empresa: true
                            }
                        },
                        country: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        },
                        products: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        brand: {
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
                    },
                    skip,
                    take: limit,
                    orderBy
                }),
                prisma.rma.count({ where: whereClause })
            ]);

            return {
                rmas: rmas.map(rma => ({
                    ...rma,
                    productCount: rma._count.products
                })),
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
            throw error;
        }
    }

    /**
     * Obtiene un RMA específico con todos sus detalles
     * @param {String} rmaId - ID del RMA
     * @returns {Object} RMA con detalles completos
     */
    async getRmaById(rmaId) {
        try {
            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            empresa: true,
                            telefono: true,
                            direccion: true
                        }
                    },
                    country: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    products: {
                        include: {
                            product: {
                                include: {
                                    brand: {
                                        select: {
                                            id: true,
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!rma) {
                throw new Error('RMA no encontrado');
            }

            return rma;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza un RMA (solo para ADMIN y SUPERADMIN)
     * @param {String} rmaId - ID del RMA
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} RMA actualizado
     */
    async updateRma(rmaId, updateData) {
        try {
            const allowedFields = [
                'status',
                'numeroTracking',
                'razonRechazo',
                'cotizacion',
                'ordenCompra',
                'direccion',
                'codigoPostal'
            ];

            // Filtrar solo campos permitidos
            const filteredData = {};
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = updateData[key];
                }
            });

            const updatedRma = await prisma.rma.update({
                where: { id: rmaId },
                data: filteredData,
                include: {
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            empresa: true
                        }
                    },
                    country: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    products: {
                        include: {
                            product: {
                                include: {
                                    brand: {
                                        select: {
                                            id: true,
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return updatedRma;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new RmaService();