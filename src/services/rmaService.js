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
}

module.exports = new RmaService();