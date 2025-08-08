// src/middleware/brandPermissions.js

/**
 * Middleware que aplica filtros de marcas según el rol del usuario
 * USER: no puede acceder a marcas (se manejará en las rutas)
 * ADMIN: solo ve marcas de sus países asignados
 * SUPERADMIN: ve todas las marcas sin restricciones
 */
function filterBrandsByRole() {
    return (req, res, next) => {
        try {
            // Verificar que el usuario esté autenticado
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const { role, countries } = req.user;
            
            // Inicializar objeto de filtros que se pasará al servicio
            req.brandFilters = {};

            console.log(`Aplicando filtros de marcas para rol: ${role}`);

            switch (role) {
                case 'USER':
                    // Los usuarios normales no deberían poder acceder a marcas
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para acceder a las marcas'
                    });

                case 'ADMIN':
                    // Admin: solo ve marcas de sus países asignados
                    if (!countries || countries.length === 0) {
                        console.log('ADMIN sin países asignados');
                        return res.status(403).json({
                            success: false,
                            message: 'No tienes países asignados'
                        });
                    }
                    
                    // Filtrar por países asignados
                    const countryIds = countries.map(country => country.id);
                    req.brandFilters.countries = {
                        some: {
                            countryId: { in: countryIds }
                        }
                    };
                    
                    console.log(`Filtro aplicado - ADMIN: países=${countryIds.join(', ')}`);
                    break;

                case 'SUPERADMIN':
                    // Superadmin: sin filtros, ve todas las marcas
                    console.log('SUPERADMIN: sin filtros, acceso total a marcas');
                    break;

                default:
                    return res.status(403).json({
                        success: false,
                        message: 'Rol no válido'
                    });
            }

            // Continuar al siguiente middleware/controlador
            next();
        } catch (error) {
            console.error('Error en middleware de permisos de marcas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al aplicar permisos de marcas'
            });
        }
    };
}

/**
 * Middleware específico para verificar permisos de modificación de marcas
 * Solo SUPERADMIN puede crear, actualizar o eliminar marcas
 */
function requireBrandModificationPermissions() {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const { role } = req.user;

            // Solo SUPERADMIN puede modificar marcas
            if (role !== 'SUPERADMIN') {
                console.log(`❌ Acceso denegado para modificar marcas: ${req.user.email} (${role})`);
                return res.status(403).json({
                    success: false,
                    message: 'Solo los SUPERADMIN pueden crear, actualizar o eliminar marcas',
                    requiredRole: 'SUPERADMIN',
                    currentRole: role
                });
            }

            console.log(`✅ Permisos de modificación verificados para ${req.user.email}`);
            next();
        } catch (error) {
            console.error('Error verificando permisos de modificación:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos'
            });
        }
    };
}

module.exports = { 
    filterBrandsByRole,
    requireBrandModificationPermissions
};