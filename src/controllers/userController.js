// src/controllers/userController.js

const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class UserController {
    /**
     * Listar usuarios según permisos del rol
     */
    async listUsers(req, res) {
        try {
            // Obtener filtros del middleware
            const userFilters = req.userFilters || {};

            // Obtener parámetros de búsqueda de la query
            const { search, role, countryId, page = 1, limit = 10 } = req.query;

            // Combinar filtros del middleware con filtros de query
            const filters = {
                ...userFilters,
                // Si viene un rol específico en query, verificar que esté dentro de los permitidos
                ...(role && {
                    role: userFilters.role
                        ? { in: userFilters.role.in.filter(r => r === role) }
                        : role
                }),
                // Si viene un país específico, verificar que esté dentro de los permitidos
                ...(countryId && userFilters.countries && {
                    countries: {
                        some: {
                            countryId: countryId
                        }
                    }
                })
            };

            // Opciones de paginación y búsqueda
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                search
            };

            console.log('Filtros finales para usuarios:', filters);

            // Llamar al servicio
            const result = await userService.listUsersWithFilters(filters, options);

            return successResponse(res, result, 'Usuarios obtenidos exitosamente');
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            return errorResponse(res, error.message || 'Error al obtener usuarios', 500);
        }
    }

    /**
   * Obtener un usuario por ID
   */
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;

            // Verificar permisos para ver este usuario específico
            const user = await userService.getUserById(id);

            if (!user) {
                return errorResponse(res, 'Usuario no encontrado', 404);
            }

            // Verificar permisos
            if (requestingUser.role === 'ADMIN') {
                // Admin solo puede ver usuarios de sus países
                const userCountryIds = user.countries.map(c => c.country.id);
                const adminCountryIds = requestingUser.countries.map(c => c.id);
                const hasCommonCountry = userCountryIds.some(id => adminCountryIds.includes(id));

                if (!hasCommonCountry || user.role === 'SUPERADMIN') {
                    return errorResponse(res, 'No tienes permisos para ver este usuario', 403);
                }
            }

            return successResponse(res, user, 'Usuario obtenido exitosamente');
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return errorResponse(res, error.message || 'Error al obtener usuario', 500);
        }
    }

    /**
     * ✅ NUEVO: Actualizar rol de un usuario
     * @route PUT /api/users/:id/role
     * @desc Actualizar el rol de un usuario específico
     * @access Private - ADMIN (limitado), SUPERADMIN (completo)
     */
    async updateUserRole(req, res) {
        try {
            const { id: userId } = req.params;
            const { role: newRole } = req.body;
            const requestingUser = req.user;

            console.log(`🔄 Petición de cambio de rol:`);
            console.log(`   Usuario objetivo: ${userId}`);
            console.log(`   Nuevo rol: ${newRole}`);
            console.log(`   Solicitado por: ${requestingUser.email} (${requestingUser.role})`);

            // Validaciones básicas
            if (!userId) {
                return errorResponse(res, 'ID de usuario requerido', 400);
            }

            if (!newRole) {
                return errorResponse(res, 'Nuevo rol requerido', 400);
            }

            // Llamar al servicio para actualizar el rol
            const updatedUser = await userService.updateUserRole(userId, newRole, requestingUser);

            console.log(`✅ Rol actualizado exitosamente para ${updatedUser.email}`);

            return successResponse(
                res,
                updatedUser,
                `Rol actualizado exitosamente a ${newRole}`
            );

        } catch (error) {
            console.error('❌ Error al actualizar rol:', error);

            // Manejar diferentes tipos de errores
            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('permisos') || error.message.includes('No puedes')) {
                return errorResponse(res, error.message, 403);
            }

            if (error.message.includes('no válido') || error.message.includes('mismo rol')) {
                return errorResponse(res, error.message, 400);
            }

            return errorResponse(res, error.message || 'Error al actualizar rol', 500);
        }
    }
}

module.exports = new UserController();