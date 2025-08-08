// src/middleware/productPermissions.js

/**
 * Middleware que aplica filtros de productos según el rol del usuario
 * USER: no puede acceder a productos (se manejará en las rutas)
 * ADMIN: solo ve productos de sus países asignados
 * SUPERADMIN: ve todas los productos sin restricciones
 */
function filterProductsByRole() {
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
            req.productFilters = {};

            console.log(`Aplicando filtros de productos para rol: ${role}`);

            switch (role) {
                case 'USER':
                    // Los usuarios normales no deberían poder acceder a productos
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para acceder a las productos'
                    });

                case 'ADMIN':
                    // Admin: solo ve productos de sus países asignados
                    if (!countries || countries.length === 0) {
                        console.log('ADMIN sin países asignados');
                        return res.status(403).json({
                            success: false,
                            message: 'No tienes países asignados'
                        });
                    }
                    
                    // Filtrar por países asignados
                    const countryIds = countries.map(country => country.id);
                    req.productFilters.countries = {
                        some: {
                            countryId: { in: countryIds }
                        }
                    };
                    
                    console.log(`Filtro aplicado - ADMIN: países=${countryIds.join(', ')}`);
                    break;

                case 'SUPERADMIN':
                    // Superadmin: sin filtros, ve todas las productos
                    console.log('SUPERADMIN: sin filtros, acceso total a productos');
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
            console.error('Error en middleware de permisos de productos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al aplicar permisos de productos'
            });
        }
    };
}

/**
 * Middleware específico para verificar permisos de modificación de productos
 * Solo SUPERADMIN puede crear, actualizar o eliminar productos
 */
function requireProductModificationPermissions() {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const { role } = req.user;

            // Solo SUPERADMIN puede modificar productos
            if (role !== 'SUPERADMIN') {
                console.log(`❌ Acceso denegado para modificar productos: ${req.user.email} (${role})`);
                return res.status(403).json({
                    success: false,
                    message: 'Solo los SUPERADMIN pueden crear, actualizar o eliminar productos',
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
    filterProductsByRole,
    requireProductModificationPermissions
};