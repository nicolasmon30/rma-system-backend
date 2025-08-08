const { prisma } = require('../config/database');
const emailService = require('./email/emailService');
const storageService = require('./storageService');

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
     * Obtiene RMAs con filtros flexibles
     * @param {Object} filters - Filtros a aplicar
     * @returns {Array} Lista de RMAs
    */
    async getUserRmas(filters = {}) {
        try {
            const { userId, countryId, status, startDate, endDate } = filters;

            // Construir el where clause
            const whereClause = {
                ...(userId && { userId }),
                ...(countryId && { countryId }),
                ...(status && { status }),
                ...(startDate && endDate && {
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
     * Aprobar un RMA (cambia estado y genera número de tracking)
     * @param {String} rmaId - ID del RMA
     * @param {String} userId - ID del usuario que aprueba (para registro)
     * @returns {Object} RMA actualizado
     */
    async approveRma(rmaId, userId) {
        try {
            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true
                        }
                    }
                }
            });

            if (!rma) {
                throw new Error('RMA no encontrado');
            }

            const trackingNumber = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const updateRma = await prisma.rma.update({
                where: { id: rmaId },
                data: {
                    status: 'AWAITING_GOODS',
                    numeroTracking: trackingNumber,
                    updatedAt: new Date()
                },
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
                    },
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true
                        }
                    }
                }
            });
            // Aquí podrías añadir lógica para notificar al usuario
            await emailService.sendRmaApprovedEmail({
                nombre: rma.user.nombre,
                apellido: rma.user.apellido,
                email: rma.user.email,
                trackingNumber,
                rmaId: rma.id
            })
            return updateRma;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Rechazar un RMA (cambia estado y registra razón)
     * @param {String} rmaId - ID del RMA
     * @param {String} rejectionReason - Razón del rechazo
     * @param {String} userId - ID del usuario que rechaza (para registro)
     * @returns {Object} RMA actualizado
     */
    async rejectRma(rmaId, rejectionReason, userId) {
        try {
            if (!rejectionReason || rejectionReason.trim() === '') {
                throw new Error('La razón de reachzo es requerida');
            }
            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true
                        }
                    }
                }
            });

            if (!rma) {
                throw new Error('RMA no encontrado');
            }
            const updatedRma = await prisma.rma.update({
                where: { id: rmaId },
                data: {
                    status: 'REJECTED',
                    razonRechazo: rejectionReason,
                    updatedAt: new Date()
                },
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
                    },
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true
                        }
                    }
                }
            });

            // Aquí podrías añadir lógica para notificar al usuario
            await emailService.sendRmaRejectedEmail({
                nombre: rma.user.nombre,
                apellido: rma.user.apellido,
                email: rma.user.email,
                rejectionReason,
                rmaId: rma.id
            });

            return updatedRma;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cambia el estado del RMA a EVALUATING (cuando se reciben los bienes)
     * @param {String} rmaId - ID del RMA
     * @returns {Object} RMA actualizado
     */
    async markAsEvaluating(rmaId) {
        try {
            // Verificar que el RMA existe y está en estado AWAITING_GOODS
            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true
                        }
                    }
                }
            });

            if (!rma) {
                throw new Error('RMA no encontrado');
            }

            if (rma.status !== 'AWAITING_GOODS') {
                throw new Error('Solo se pueden evaluar RMAs en estado AWAITING_GOODS');
            }

            if (!rma.numeroTracking) {
                throw new Error('El RMA no tiene número de tracking asignado');
            }

            // Actualizar el estado
            const updatedRma = await prisma.rma.update({
                where: { id: rmaId },
                data: {
                    status: 'EVALUATING',
                    updatedAt: new Date()
                },
                include: {
                    user: true,
                    products: {
                        include: {
                            product: {
                                include: {
                                    brand: true
                                }
                            }
                        }
                    }
                }
            });

            await emailService.sendRmaEvaluatingEmail({
                nombre: rma.user.nombre,
                apellido: rma.user.apellido,
                email: rma.user.email,
                trackingNumber: rma.numeroTracking,
                rmaId: rma.id
            });

            return updatedRma;
        } catch (error) {
            throw error;
        }
    }

    async markAsPayment(rmaId, file) {
        let quotationUrl;
        try {
            // Validaciones del RMA...
            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
                include: { user: true }
            });


            if (!rma) throw new Error('RMA no encontrado');
            if (rma.status !== 'EVALUATING') throw new Error('Estado inválido para esta operación');


            // Subir a la carpeta quotations
            quotationUrl = await storageService.uploadQuotation(file);

            // Actualizar RMA
            const updatedRma = await prisma.rma.update({
                where: { id: rmaId },
                data: {
                    status: 'PAYMENT',
                    cotizacion: quotationUrl, // Guardamos la URL completa
                    updatedAt: new Date()
                },
                include: { user: true }
            });

            // Enviar email con la cotización
            await emailService.sendRmaPaymentEmail({
                nombre: rma.user.nombre,
                apellido: rma.user.apellido,
                email: rma.user.email,
                rmaId: rma.id,
                quotationUrl
            });

            return updatedRma;
        } catch (error) {
            // Rollback en caso de error
            if (quotationUrl) {
                await storageService.deleteFile(quotationUrl).catch(console.error);
            }
            throw error;
        }
    }

    /**
 * Marcar RMA como PROCESSING (pausa recordatorios automáticamente)
 * @param {String} rmaId - ID del RMA
 * @param {String} userId - ID del usuario que realiza la acción (opcional, para logs)
 * @returns {Object} RMA actualizado
 */
    async markAsProcessing(rmaId, userId = null) {
        try {
            // Verificar que el RMA existe y está en estado correcto
            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true
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
                }
            });

            if (!rma) {
                throw new Error('RMA no encontrado');
            }

            if (rma.status !== 'PAYMENT') {
                throw new Error(`No se puede procesar un RMA en estado ${rma.status}. Solo se pueden procesar RMAs en estado PAYMENT`);
            }

            // Verificar que existe una cotización
            if (!rma.cotizacion) {
                throw new Error('El RMA no tiene cotización asociada');
            }

            // Actualizar el RMA a estado PROCESSING
            const updatedRma = await prisma.rma.update({
                where: { id: rmaId },
                data: {
                    status: 'PROCESSING',
                    lastReminderSent: null, // 👈 ESTO PAUSA LOS RECORDATORIOS
                    updatedAt: new Date()
                },
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

            // Log de la acción realizada
            console.log(`✅ RMA ${rmaId} marcado como PROCESSING`);
            console.log(`📧 Recordatorios automáticos pausados para RMA ${rmaId}`);
            if (userId) {
                console.log(`👤 Acción realizada por usuario: ${userId}`);
            }

            // Enviar email de confirmación al usuario
            await emailService.sendRmaProcessingEmail(rma)

            return updatedRma;
        } catch (error) {
            console.error(`❌ Error marcando RMA ${rmaId} como PROCESSING:`, error);
            throw error;
        }
    }
    /**
     * Marcar RMA como IN_SHIPPING (equipo enviado)
     * @param {String} rmaId - ID del RMA
     * @param {String} trackingInformation - Información de tracking del envío
     * @param {String} userId - ID del usuario que realiza la acción (opcional)
     * @returns {Object} RMA actualizado
     */
    async markAsInShipping(rmaId, trackingInformation, userId = null) {
        try {
            // Verificar que el RMA existe y está en estado correcto
            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true
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
                }
            });

            if (!rma) {
                throw new Error('RMA no encontrado');
            }

            if (rma.status !== 'PROCESSING') {
                throw new Error(`No se puede enviar un RMA en estado ${rma.status}. Solo se pueden enviar RMAs en estado PROCESSING`);
            }

            if (!trackingInformation || trackingInformation.trim() === '') {
                throw new Error('La información de tracking es requerida');
            }

            // Actualizar el RMA a estado IN_SHIPPING
            const updatedRma = await prisma.rma.update({
                where: { id: rmaId },
                data: {
                    status: 'IN_SHIPPING',
                    numeroTracking: trackingInformation, // Guardar tracking en el campo existente
                    updatedAt: new Date()
                },
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

            // Log de la acción realizada
            console.log(`✅ RMA ${rmaId} marcado como IN_SHIPPING`);
            console.log(`📦 Tracking: ${trackingInformation}`);
            if (userId) {
                console.log(`👤 Acción realizada por usuario: ${userId}`);
            }

            // Enviar email de confirmación al usuario
            await emailService.sendRmaInShippingEmail({
                nombre: rma.user.nombre,
                apellido: rma.user.apellido,
                email: rma.user.email,
                rejectionReason,
                rmaId: rma.id,
                trackingInformation
            });

            return updatedRma;
        } catch (error) {
            console.error(`❌ Error marcando RMA ${rmaId} como IN_SHIPPING:`, error);
            throw error;
        }
    }

    /**
 * Marcar RMA como COMPLETE (proceso finalizado)
 * @param {String} rmaId - ID del RMA
 * @param {String} userId - ID del usuario que realiza la acción (opcional)
 * @returns {Object} RMA actualizado
 */
    async markAsComplete(rmaId, userId = null) {
        try {
            // Verificar que el RMA existe y está en estado correcto
            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
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
                }
            });

            if (!rma) {
                throw new Error('RMA no encontrado');
            }

            if (rma.status !== 'IN_SHIPPING') {
                throw new Error(`No se puede completar un RMA en estado ${rma.status}. Solo se pueden completar RMAs en estado IN_SHIPPING`);
            }

            // Actualizar el RMA a estado COMPLETE
            const updatedRma = await prisma.rma.update({
                where: { id: rmaId },
                data: {
                    status: 'COMPLETE',
                    updatedAt: new Date()
                },
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

            // Log de la acción realizada
            console.log(`✅ RMA ${rmaId} marcado como COMPLETE`);
            if (userId) {
                console.log(`👤 Acción realizada por usuario: ${userId}`);
            }

            // Enviar email de confirmación al usuario
            await this.sendCompleteConfirmationEmail(rma);

            return updatedRma;
        } catch (error) {
            console.error(`❌ Error marcando RMA ${rmaId} como COMPLETE:`, error);
            throw error;
        }
    }

    /**
 * Envía email de confirmación cuando el RMA se completa
 * @param {Object} rma - Datos del RMA
 */
    async sendCompleteConfirmationEmail(rma) {
        try {
            const servicioRealizado = rma.servicio === 'CALIBRACION' ? 'Calibración'
                : rma.servicio === 'REPARACION' ? 'Reparación'
                    : 'Calibración y Reparación';

            await emailService.sendRmaCompleteEmail({
                nombre: rma.user.nombre,
                apellido: rma.user.apellido,
                email: rma.user.email,
                rmaId: rma.id,
                empresa: rma.user.empresa,
                servicioRealizado: servicioRealizado
            });

            console.log(`📧 Email de RMA completado enviado para RMA ${rma.id}`);
        } catch (error) {
            console.error(`❌ Error enviando email de RMA completado para RMA ${rma.id}:`, error);
            // No lanzar error aquí para no afectar la operación principal
        }
    }

}

module.exports = new RmaService();