// src/services/userService.js

const { prisma } = require('../config/database');

class UserService {
    /**
     * Lista usuarios con filtros flexibles
     * @param {Object} filters - Filtros a aplicar
     * @param {Object} options - Opciones de paginación y búsqueda
     * @returns {Object} Usuarios y metadata de paginación
     */
    async listUsersWithFilters(filters = {}, options = {}) {
        try {
            const { page = 1, limit = 10, search = '' } = options;
            const skip = (page - 1) * limit;

            // Construir cláusula where
            let whereClause = { ...filters };

            // Agregar búsqueda si existe
            if (search) {
                whereClause.OR = [
                    { nombre: { contains: search, mode: 'insensitive' } },
                    { apellido: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { empresa: { contains: search, mode: 'insensitive' } }
                ];
            }

            // Ejecutar consulta con conteo total
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where: whereClause,
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        email: true,
                        empresa: true,
                        telefono: true,
                        direccion: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
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
                                rmas: true
                            }
                        }
                    },
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                prisma.user.count({ where: whereClause })
            ]);

            // Formatear respuesta
            const formattedUsers = users.map(user => ({
                ...user,
                countries: user.countries.map(uc => uc.country),
                rmaCount: user._count.rmas
            }));

            return {
                users: formattedUsers,
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
            console.error('Error en listUsersWithFilters:', error);
            throw error;
        }
    }

    /**
       * Obtiene un usuario por ID
       * @param {String} userId - ID del usuario
       * @returns {Object} Usuario con detalles
       */
    async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    empresa: true,
                    telefono: true,
                    direccion: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
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
                            rmas: true
                        }
                    }
                }
            });

            if (!user) {
                return null;
            }

            // Formatear respuesta
            return {
                ...user,
                countries: user.countries.map(uc => uc.country),
                rmaCount: user._count.rmas
            };
        } catch (error) {
            console.error('Error en getUserById:', error);
            throw error;
        }
    }

    /**
       * ✅ NUEVO: Actualiza el rol de un usuario
       * @param {String} userId - ID del usuario a actualizar
       * @param {String} newRole - Nuevo rol (USER, ADMIN, SUPERADMIN)
       * @param {Object} requestingUser - Usuario que hace la petición
       * @returns {Object} Usuario actualizado
       */
    async updateUserRole(userId, newRole, requestingUser) {
        try {
            console.log(`🔄 Actualizando rol del usuario ${userId} a ${newRole}`);
            console.log(`👤 Solicitado por: ${requestingUser.email} (${requestingUser.role})`);

            // 1. Verificar que el usuario a actualizar existe
            const targetUser = await this.getUserById(userId);
            if (!targetUser) {
                throw new Error('Usuario no encontrado');
            }

            // 2. Verificar que el nuevo rol es válido
            const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
            if (!validRoles.includes(newRole)) {
                throw new Error('Rol no válido');
            }

            // 3. Verificar que no se está intentando cambiar a sí mismo
            if (userId === requestingUser.id) {
                throw new Error('No puedes cambiar tu propio rol');
            }

            // 4. Verificar permisos según el rol del solicitante
            if (requestingUser.role === 'ADMIN') {
                // ADMIN solo puede cambiar roles de usuarios de sus países
                const targetUserCountryIds = targetUser.countries.map(c => c.id);
                const adminCountryIds = requestingUser.countries.map(c => c.id);
                const hasCommonCountry = targetUserCountryIds.some(id => adminCountryIds.includes(id));

                if (!hasCommonCountry) {
                    throw new Error('No tienes permisos para modificar usuarios de otros países');
                }

                // ADMIN no puede cambiar a SUPERADMIN ni modificar SUPERADMIN
                if (targetUser.role === 'SUPERADMIN' || newRole === 'SUPERADMIN') {
                    throw new Error('No tienes permisos para gestionar roles de SUPERADMIN');
                }

                // ADMIN solo puede cambiar entre USER y ADMIN
                if (!['USER', 'ADMIN'].includes(newRole)) {
                    throw new Error('Solo puedes asignar roles USER o ADMIN');
                }
            }

            // 5. Si es el mismo rol, no hacer nada
            if (targetUser.role === newRole) {
                console.log(`⚠️  El usuario ya tiene el rol ${newRole}`);
                return targetUser;
            }

            // 6. Actualizar el rol en la base de datos
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    role: newRole,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    empresa: true,
                    telefono: true,
                    direccion: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
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
                            rmas: true
                        }
                    }
                }
            });

            // 7. Formatear respuesta
            const formattedUser = {
                ...updatedUser,
                countries: updatedUser.countries.map(uc => uc.country),
                rmaCount: updatedUser._count.rmas
            };

            console.log(`✅ Rol actualizado exitosamente: ${targetUser.role} → ${newRole}`);

            return formattedUser;

        } catch (error) {
            console.error('❌ Error en updateUserRole:', error);
            throw error;
        }
    }
}

module.exports = new UserService();